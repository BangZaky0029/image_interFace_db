// previewButton.js - Modular Preview & Approval Logic

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
    btn.className = 'preview-btn';
    btn.textContent = 'Preview Design';
    btn.style.marginTop = '10px';
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

  // Modal HTML (single instance)
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
        <div id="previewGrid" class="preview-grid"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  // Modal close handler
  modal.querySelector('#closePreviewModal').onclick = () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    window.removeEventListener('keydown', modal._escListener);
  };
  // Ensure pointer cursor and hover effect are handled by CSS

}

// Open Preview Modal for a single item
async function openPreviewModalForItem(itemCard) {
  const modal = document.querySelector('.preview-modal');
  const grid = modal.querySelector('#previewGrid');
  grid.innerHTML = '';
  modal.classList.remove('hidden', 'd-none');
  modal.style.display = '';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  // ESC key to close modal
  function escListener(e) {
    if (e.key === 'Escape') {
      modal.classList.remove('show');
      document.body.style.overflow = '';
      window.removeEventListener('keydown', escListener);
    }
  }
  modal._escListener = escListener;
  window.addEventListener('keydown', escListener);
  // Delay grid rendering for 200ms for fade-in
  setTimeout(async () => {
    const id_image = itemCard.querySelector('[id^="id_image_"]').value;
    const nama = itemCard.querySelector('[id^="nama_"]').value;
    const qty = parseInt(itemCard.querySelector('[id^="qty_"]').value) || 1;
    const type_product = itemCard.querySelector('[id^="type_product_"]').value;
    const product_note = itemCard.querySelector('[id^="product_note_"]').value;
    if (!id_image || !nama || !type_product) {
      showNotification('error', 'Lengkapi data item sebelum preview');
      modal.classList.remove('show');
      document.body.style.overflow = '';
      return;
    }
    try {
      const resp = await fetch('http://localhost:5000/api/order/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_image, nama, qty, type_product, product_note })
      });
      const data = await resp.json();
      let item = document.createElement('div');
      item.className = 'preview-img-item';
      if (data && data.preview_url) {
        item.innerHTML = `<img src="${data.preview_url}" alt="Preview Design" style="max-width: 400px; width: 80vw; height: auto; display: block; margin: 0 auto;" /><div style="margin-top: 10px; font-weight: 600;">${nama} (ID: ${id_image})</div>`;
      } else {
        item.innerHTML = `<div class='preview-error'>${data && data.error ? data.error : 'Preview kosong'}</div><div>${nama} (ID: ${id_image})</div>`;
      }
      grid.appendChild(item);
    } catch (err) {
      let item = document.createElement('div');
      item.className = 'preview-img-item';
      item.innerHTML = `<div class='preview-error'>Error saat request preview</div>`;
      grid.appendChild(item);
    }
  }, 200);
}

// Handle Approval Submit
async function handleApprovalSubmit() {
  try {
    // Simulate approval API call (replace with real endpoint if needed)
    const resp = await fetch('http://localhost:5000/api/order/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* add order data if needed */ })
    });
    if (resp.ok) {
      showNotification('success', 'Pesanan berhasil diproses!');
      // Reset form and return to Step 1
      document.getElementById('orderForm').reset();
      if (window.transitionToStep1) window.transitionToStep1();
      document.querySelector('.preview-modal').style.display = 'none';
      document.body.style.overflow = '';
    } else {
      showNotification('error', 'Pesanan gagal diproses, silakan cek kembali.');
    }
  } catch (err) {
    showNotification('error', 'Pesanan gagal diproses, silakan cek kembali.');
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

document.addEventListener('DOMContentLoaded', observeStep2);

// Fallback: Patch transitionToStep2 to always inject preview button
if (window.transitionToStep2) {
  const origTransitionToStep2 = window.transitionToStep2;
  window.transitionToStep2 = async function() {
    await origTransitionToStep2.apply(this, arguments);
    setTimeout(initPreviewButton, 400);
  };
}

// Expose for manual re-init if needed
window.initPreviewButton = initPreviewButton;
window.openPreviewModalForItem = openPreviewModalForItem;
window.showNotification = showNotification;
window.handleApprovalSubmit = handleApprovalSubmit;
window.showNotification = showNotification;

// Event delegation for Preview Design buttons
const itemsContainer = document.getElementById('itemsContainer');
if (itemsContainer) {
  itemsContainer.addEventListener('click', function(e) {
    const btn = e.target.closest('.preview-btn[data-preview-id]');
    if (btn) {
      const itemId = btn.getAttribute('data-preview-id');
      showPreviewModalForItem(itemId);
    }
  });
}

function showPreviewModalForItem(itemId) {
  // Fetch the image data for the specific item
  const itemCard = document.querySelector(`.item-card[data-item-id="${itemId}"]`);
  if (!itemCard) return;
  const imgSrc = itemCard.querySelector('img') ? itemCard.querySelector('img').src : '';
  const modal = getOrCreatePreviewModal();
  const modalContent = modal.querySelector('.modal-content');
  modalContent.innerHTML = `
    <div class="modal-header flex justify-between items-center">
      <span class="modal-title">Preview Design</span>
      <button class="modal-close-btn" id="closePreviewModal" aria-label="Close Preview">&times;</button>
    </div>
    <div class="preview-img-item">
      <img src="${imgSrc}" alt="Preview Design">
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" id="btn-close-modal">Close</button>
    </div>
  `;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  modalContent.querySelector('#closePreviewModal').onclick = () => closePreviewModal();
  if (modalContent.querySelector('#btn-close-modal')) {
    modalContent.querySelector('#btn-close-modal').onclick = () => closePreviewModal();
  }
  document.addEventListener('keydown', escModalHandler);
}

function getOrCreatePreviewModal() {
  let modal = document.querySelector('.preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = '<div class="modal-content"></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closePreviewModal();
    });
  }
  return modal;
}

function closePreviewModal() {
  const modal = document.querySelector('.preview-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', escModalHandler);
  }
}

function escModalHandler(e) {
  if (e.key === 'Escape') closePreviewModal();
}

// Remove old global preview button logic
const globalPreviewBtn = document.getElementById('btn-preview');
if (globalPreviewBtn) globalPreviewBtn.style.display = 'none';