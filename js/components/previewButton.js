// previewButton.js - Modular Preview & Approval Logic (Updated)

// Utility: Show notification (success/error)
function showNotification(type, message) {
  let notif = document.createElement('div');
  notif.className = `notif-toast notif-${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => { notif.classList.add('show'); }, 10);
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.remove(), 400);
  }, 2500);
}

// Get server IP for preview URLs
let serverIP = 'localhost';
async function getServerIP() {
  try {
    const resp = await fetch('/api/server-info');
    const data = await resp.json();
    serverIP = data.ip || 'localhost';
  } catch (err) {
    console.log('Using localhost as fallback');
  }
}

// Initialize Preview Button logic
function initPreviewButton() {
  // Remove all existing preview buttons and modals
  document.querySelectorAll('.preview-btn, .preview-modal').forEach(el => el.remove());

  // Inject Preview Design button for each item card
  const itemCards = document.querySelectorAll('#itemsContainer .item-card');
  itemCards.forEach((itemCard, idx) => {
    // Prevent duplicate
    if (itemCard.querySelector('.preview-btn')) return;
    
    let btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preview-btn btn-secondary';
    btn.textContent = 'Preview Design';
    btn.style.cssText = 'margin-top: 10px; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
    
    // Insert after ID Image field or at end of card
    let idImageField = itemCard.querySelector('[id^="id_image_"]');
    if (idImageField && idImageField.parentElement) {
      idImageField.parentElement.appendChild(btn);
    } else {
      itemCard.appendChild(btn);
    }
    
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openPreviewModalForItem(itemCard);
    });
  });

  // Create modal HTML (single instance)
  createPreviewModal();
}

// Create Preview Modal
function createPreviewModal() {
  let modal = document.querySelector('.preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header flex justify-between items-center">
          <span class="modal-title">Preview Design</span>
          <button class="modal-close-btn" id="closePreviewModal" aria-label="Close Preview">&times;</button>
        </div>
        <div id="previewGrid" class="preview-grid">
          <div class="loading-spinner">Loading preview...</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-close-modal">Close</button>        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Modal event handlers
    setupModalEventHandlers(modal);
  }
  return modal;
}

// Setup modal event handlers
function setupModalEventHandlers(modal) {
  // Close button handlers
  modal.querySelector('#closePreviewModal').onclick = () => closePreviewModal();
  modal.querySelector('#btn-close-modal').onclick = () => closePreviewModal();
  
  // Approve button handler
  modal.querySelector('#btn-approve-preview').onclick = () => handleApprovalSubmit();
  
  // Click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closePreviewModal();
  });
  
  // ESC key handler
  function escListener(e) {
    if (e.key === 'Escape') closePreviewModal();
  }
  modal._escListener = escListener;
}

// Open Preview Modal for a single item
async function openPreviewModalForItem(itemCard) {
  const modal = document.querySelector('.preview-modal');
  const grid = modal.querySelector('#previewGrid');
  
  // Reset grid content
  grid.innerHTML = '<div class="loading-spinner">Generating preview...</div>';
  
  // Show modal
  modal.classList.remove('hidden', 'd-none');
  modal.style.display = '';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Add ESC key listener
  window.addEventListener('keydown', modal._escListener);
  
  // Get form data
  const id_image = itemCard.querySelector('[id^="id_image_"]').value;
  const nama = itemCard.querySelector('[id^="nama_"]').value;
  const qty = parseInt(itemCard.querySelector('[id^="qty_"]').value) || 1;
  const type_product = itemCard.querySelector('[id^="type_product_"]').value;
  const product_note = itemCard.querySelector('[id^="product_note_"]').value;
  
  // Validate required fields
  if (!id_image || !nama || !type_product) {
    showNotification('error', 'Lengkapi data item sebelum preview');
    closePreviewModal();
    return;
  }
  
  try {
    // Call preview API
    const resp = await fetch(`http://${serverIP}:5000/api/order/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id_image, 
        nama, 
        qty, 
        type_product, 
        product_note 
      })
    });
    
    const data = await resp.json();
    
    if (resp.ok && data.preview_url) {
      // Success - show preview
      grid.innerHTML = `
        <div class="preview-img-item">
          <img src="${data.preview_url}" 
               alt="Preview Design" 
               style="max-width: 400px; width: 80vw; height: auto; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
               onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'; this.style.border='2px dashed #ccc';" />
          <div class="preview-info" style="margin-top: 15px; text-align: center;">
            <div style="font-weight: 600; font-size: 16px; color: #333;">${nama}</div>
            <div style="color: #666; font-size: 14px;">ID: ${id_image} | Qty: ${qty} | ${type_product}</div>
            ${product_note ? `<div style="color: #888; font-size: 12px; margin-top: 5px;">Note: ${product_note}</div>` : ''}
            <div style="color: #28a745; font-size: 12px; margin-top: 10px;">
              ✓ Preview ID: ${data.id_print || 'N/A'}
            </div>
          </div>
        </div>
      `;
      
      showNotification('success', 'Preview berhasil dibuat');
      
    } else {
      // Error from API
      throw new Error(data.error || 'Preview gagal dibuat');
    }
    
  } catch (err) {
    console.error('Preview error:', err);
    grid.innerHTML = `
      <div class="preview-error" style="text-align: center; padding: 40px; color: #dc3545;">
        <div style="font-size: 18px; margin-bottom: 10px;">⚠️ Error</div>
        <div style="font-size: 14px;">${err.message || 'Error saat membuat preview'}</div>
        <div style="margin-top: 15px;">
          <button onclick="openPreviewModalForItem(arguments[0])" class="btn btn-secondary">Retry</button>
        </div>
      </div>
    `;
    showNotification('error', 'Gagal membuat preview');
  }
}

// Close Preview Modal
function closePreviewModal() {
  const modal = document.querySelector('.preview-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    window.removeEventListener('keydown', modal._escListener);
  }
}

// Handle Approval Submit
async function handleApprovalSubmit() {
  try {
    showNotification('info', 'Memproses approval...');
    
    // Get all form data (you might need to adjust this based on your form structure)
    const formData = new FormData(document.getElementById('orderForm'));
    const orderData = Object.fromEntries(formData.entries());
    
    // Call approval API (adjust endpoint as needed)
    const resp = await fetch(`http://${serverIP}:5000/api/order/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    if (resp.ok) {
      const data = await resp.json();
      showNotification('success', 'Pesanan berhasil disetujui!');
      
      // Reset form and return to Step 1
      document.getElementById('orderForm').reset();
      if (window.transitionToStep1) window.transitionToStep1();
      
      closePreviewModal();
    } else {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Approval gagal');
    }
    
  } catch (err) {
    console.error('Approval error:', err);
    showNotification('error', err.message || 'Pesanan gagal diproses');
  }
}

// Get list of all previews
async function loadPreviewList() {
  try {
    const resp = await fetch(`http://${serverIP}:5000/api/preview/list`);
    const data = await resp.json();
    
    if (resp.ok) {
      return data.previews || [];
    } else {
      throw new Error(data.error || 'Failed to load previews');
    }
  } catch (err) {
    console.error('Load previews error:', err);
    return [];
  }
}

// Delete preview by ID
async function deletePreview(id_preview) {
  try {
    const resp = await fetch(`http://${serverIP}:5000/api/preview/${id_preview}`, {
      method: 'DELETE'
    });
    
    if (resp.ok) {
      showNotification('success', 'Preview berhasil dihapus');
      return true;
    } else {
      const errorData = await resp.json();
      throw new Error(errorData.error || 'Delete failed');
    }
  } catch (err) {
    console.error('Delete preview error:', err);
    showNotification('error', err.message || 'Gagal menghapus preview');
    return false;
  }
}

// Auto-init after DOM ready and Step 2 shown
function observeStep2() {
  const step2 = document.getElementById('step2');
  if (!step2) return;
  
  const observer = new MutationObserver(() => {
    if (step2.classList.contains('active')) {
      setTimeout(initPreviewButton, 300);
    }
  });
  
  observer.observe(step2, { attributes: true, attributeFilter: ['class'] });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  getServerIP(); // Get server IP on load
  observeStep2();
});

// Fallback: Patch transitionToStep2 to always inject preview button
if (window.transitionToStep2) {
  const origTransitionToStep2 = window.transitionToStep2;
  window.transitionToStep2 = async function() {
    await origTransitionToStep2.apply(this, arguments);
    setTimeout(initPreviewButton, 400);
  };
}

// Expose functions to global scope
window.initPreviewButton = initPreviewButton;
window.openPreviewModalForItem = openPreviewModalForItem;
window.showNotification = showNotification;
window.handleApprovalSubmit = handleApprovalSubmit;
window.closePreviewModal = closePreviewModal;
window.loadPreviewList = loadPreviewList;
window.deletePreview = deletePreview;

// Clean up old global preview button
const globalPreviewBtn = document.getElementById('btn-preview');
if (globalPreviewBtn) globalPreviewBtn.style.display = 'none';