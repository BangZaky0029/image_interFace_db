import { showMessage } from '../form/message.js';
import { addItemFunction } from '../form/items.js';

export async function submitFormData(formData, baseURL) {
  try {
    // Tampilkan loading spinner
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Processing...';
    
    // Tambahkan CSS untuk spinner jika belum ada
    if (!document.getElementById('spinner-style')) {
      const style = document.createElement('style');
      style.id = 'spinner-style';
      style.textContent = `
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
          vertical-align: middle;
          margin-right: 5px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    const res = await fetch(`${baseURL}/api/order/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();

    // Sembunyikan loading spinner
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;

    if (res.ok) {
      showMessage(`Order created successfully! ID: ${result.id_order}`);
      document.getElementById('orderForm').reset();
      document.getElementById('itemsContainer').innerHTML = '';
      addItemFunction(); // Menggunakan addItemFunction yang sudah di-export
      
      // Kembali ke step pertama jika form multi-step
      const step1 = document.getElementById('step1');
      const step2 = document.getElementById('step2');
      
      if (step1 && step2 && step2.classList.contains('active')) {
        // Import modul multiStep secara dinamis
        import('../form/multiStep.js').then(multiStep => {
          // Kembali ke step pertama
          multiStep.transitionToStep1();
          
          // Update progress indicator jika ada
          const progress = document.querySelector('.form-progress');
          if (progress) {
            progress.classList.remove('step-2');
          }
          
          // Sembunyikan tombol Resume jika ada
          const btnResume = document.getElementById('btn-resume');
          if (btnResume) {
            btnResume.style.display = 'none';
          }
          
          console.log('Form reset to step 1 after successful submission');
        }).catch(err => {
          console.error('Error importing multiStep module:', err);
        });
      }
    } else {
      // Tampilkan pesan error dari API
      showMessage(result.message || 'Failed to create order', true);
    }
  } catch (err) {
    console.error(err);
    // Sembunyikan loading spinner jika terjadi error
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit';
    }
    showMessage('Network error. Please check your connection.', true);
  }
}