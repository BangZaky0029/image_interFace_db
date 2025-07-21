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
let serverIP = '100.124.58.32';
let alternativeIPs = ['100.124.58.32', '192.168.0.95'];
let currentIPIndex = 0;

async function getServerIP() {
  try {
    const resp = await fetch('/api/server-info');
    const data = await resp.json();
    serverIP = data.ip || alternativeIPs[0];
    // Pastikan tidak menggunakan localhost
    if (serverIP === 'localhost' || serverIP === '127.0.0.1') {
      serverIP = alternativeIPs[0];
      console.log(`Replacing localhost with ${alternativeIPs[0]}`);
    }
  } catch (err) {
    console.log(`Using ${alternativeIPs[0]} as fallback`);
  }
}

// Fungsi untuk mencoba IP alternatif jika koneksi gagal
async function tryAlternativeIP() {
  currentIPIndex = (currentIPIndex + 1) % alternativeIPs.length;
  serverIP = alternativeIPs[currentIPIndex];
  console.log(`Switching to alternative IP: ${serverIP}`);
  return serverIP;
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
        <button class="modal-close-btn" id="closePreviewModal"></button>
      </div>
      <div id="previewGrid" class="preview-grid">
        <div class="loading-spinner"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="btn-close-modal">Close</button>     
      </div>
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
  
  // Approve button handler - Tambahkan pengecekan jika elemen ada
  const approveBtn = modal.querySelector('#btn-approve-preview');
  if (approveBtn) {
    approveBtn.onclick = () => handleApprovalSubmit();
  }
  
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
  // Create a new modal each time to avoid stale state
  // First, close any existing modals
  closePreviewModal();
  
  // Create a fresh modal
  const modal = createPreviewModal();
  const grid = modal.querySelector('#previewGrid');
    
  // Show modal
  modal.classList.remove('hidden', 'd-none');
  modal.style.display = '';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Add ESC key listener
  const escListener = (e) => {
    if (e.key === 'Escape') closePreviewModal();
  };
  modal._escListener = escListener;
  window.addEventListener('keydown', escListener);
  
  // Get form data
  const id_image = itemCard.querySelector('[id^="id_image_"]').value;
  const nama = itemCard.querySelector('[id^="nama_"]').value;
  const qty = parseInt(itemCard.querySelector('[id^="qty_"]').value) || 1;
  const type_product = itemCard.querySelector('[id^="type_product_"]').value;
  const product_note = itemCard.querySelector('[id^="product_note_"]').value;
  const font_color = itemCard.querySelector('[id^="font_color_"]').value;
  
  // Validate required fields
  if (!id_image || !nama || !type_product) {
    showNotification('error', 'Lengkapi data item sebelum preview');
    closePreviewModal();
    return;
  }
  
  // Dalam fungsi openPreviewModalForItem, modifikasi bagian try-catch:
  
  try {
  // Call preview API
  let retryCount = 0;
  let success = false;
  let resp;
  let data;
  
  while (retryCount < alternativeIPs.length && !success) {
    try {
      resp = await fetch(`http://${serverIP}:5000/api/order/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_image, 
          nama, 
          qty, 
          type_product, 
          product_note,
          font_color 
        })
      });
      
      data = await resp.json();
      success = true;
    } catch (fetchError) {
      console.error(`Error with IP ${serverIP}:`, fetchError);
      serverIP = tryAlternativeIP();
      retryCount++;
    }
  }
  
  if (!success) {
    throw new Error('Tidak dapat terhubung ke server dengan semua IP yang tersedia');
  }
  
  if (resp.ok && data.preview_url) {
    // Success - show preview
    grid.innerHTML = `
      <div class="preview-img-item" style="position: relative; overflow: hidden;">
        <img src="${data.preview_url}" 
             alt="Preview Design" class="zoomable-img"
             style="max-width: 400px; width: 80vw; height: auto; display: block; margin: 0 auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: transform 0.3s ease; cursor: zoom-in;" 
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
    
    // Setup zoom functionality
    const img = grid.querySelector('.zoomable-img');
    if (img) {
      let zoomLevel = 1;
      const zoomSteps = [1, 1.2, 1.4, 1.6, 1.8, 2.0];
      let currentStep = 0;
      let translateX = 0;
      let translateY = 0;
      let isDragMode = false;
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      const updateTransform = () => {
        img.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
      };

      // Click to zoom
      img.addEventListener('click', (e) => {
        if (isDragMode) return;
        currentStep = (currentStep + 1) % zoomSteps.length;
        zoomLevel = zoomSteps[currentStep];
        if (zoomLevel === 1) {
          translateX = 0;
          translateY = 0;
        }
        updateTransform();
        img.style.cursor = zoomLevel > 1 ? 'zoom-out' : 'zoom-in';
      });

      // Key handlers
      const handleKeyDown = (e) => {
        if (e.key === ' ' && zoomLevel > 1) {
          e.preventDefault();
          isDragMode = true;
          img.style.cursor = 'grab';
        }
      };

      const handleKeyUp = (e) => {
        if (e.key === ' ') {
          isDragMode = false;
          isDragging = false;
          img.style.cursor = zoomLevel > 1 ? 'zoom-out' : 'zoom-in';
        }
      };

      // Drag handlers
      const handleMouseDown = (e) => {
        if (isDragMode) {
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          img.style.cursor = 'grabbing';
        }
      };

      const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        translateX += dx / zoomLevel;
        translateY += dy / zoomLevel;
        startX = e.clientX;
        startY = e.clientY;
        updateTransform();
      };

      const handleMouseUp = (e) => {
        isDragging = false;
        if (isDragMode) {
          img.style.cursor = 'grab';
        } else {
          img.style.cursor = zoomLevel > 1 ? 'zoom-out' : 'zoom-in';
        }
      };

      // Add listeners
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      img.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Store for removal
      currentPreviewListeners = {
        keydown: handleKeyDown,
        keyup: handleKeyUp,
        mousemove: handleMouseMove,
        mouseup: handleMouseUp
      };
    }
    
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
    
    // Remove preview listeners
    if (currentPreviewListeners.keydown) {
      document.removeEventListener('keydown', currentPreviewListeners.keydown);
      document.removeEventListener('keyup', currentPreviewListeners.keyup);
      document.removeEventListener('mousemove', currentPreviewListeners.mousemove);
      document.removeEventListener('mouseup', currentPreviewListeners.mouseup);
      currentPreviewListeners = {};
    }
    
    // Completely remove the modal from DOM after animation completes
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  
  // Clean up any stray loading spinners that might be left in the document
  document.querySelectorAll('.loading-spinner').forEach(spinner => {
    // Only remove spinners that are not inside active modals
    if (!spinner.closest('.modal-content.show')) {
      spinner.remove();
    }
  });
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

let currentPreviewListeners = {};
