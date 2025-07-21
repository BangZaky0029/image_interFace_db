/**
 * Order Detail JS - Handles order detail popup functionality
 * Provides data fetching and display for order details
 */

// Import functions from endpoint.js
import { baseURL, showNotification } from '../../config/endpoint.js';

// Fungsi untuk mendapatkan baseURL dari host saat ini
const getBaseURL = () => {
  // Determine the current host and port
  const currentUrl = window.location.href;
  const urlObj = new URL(currentUrl);
  const host = urlObj.hostname;
  
  // Use the API server port (5000)
  const apiPort = '5000';
  return `http://${host}:${apiPort}`;
};

// Gunakan baseURL dari endpoint.js atau fallback ke host saat ini
const getEffectiveBaseURL = () => {
  if (typeof window.baseURL !== 'undefined') {
    return window.baseURL;
  } else if (typeof baseURL !== 'undefined') {
    return baseURL;
  } else {
    return getBaseURL();
  }
};

// Global variables to store data
let currentOrderDetail = null;
let currentPrintData = null;

/**
 * Fetch order detail data from API
 * @param {string} idOrder - Order ID to fetch details for
 * @returns {Promise<Array>} - Promise resolving to order detail data
 */
async function fetchOrderDetail(idOrder) {
  try {
    const effectiveBaseURL = getEffectiveBaseURL();
    const response = await fetch(`${effectiveBaseURL}/order_detail`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter data by id_order
    return data.filter(detail => detail.id_order === idOrder);
  } catch (error) {
    console.error('Error fetching order detail:', error);
    showNotification('Gagal mengambil data detail pesanan', 'error');
    throw error;
  }
}

/**
 * Fetch print data from API
 * @returns {Promise<Array>} - Promise resolving to print data
 */
async function fetchPrintData() {
  try {
    const response = await fetch(`${baseURL}/print`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching print data:', error);
    showNotification('Gagal mengambil data print', 'error');
    throw error;
  }
}

/**
 * Get print image path by order detail ID
 * @param {string} idOrderDetail - Order detail ID
 * @returns {string} - Print image path or '-' if not found
 */
function getPrintImagePath(idOrderDetail) {
  if (!currentPrintData) return '-';
  
  const printItem = currentPrintData.find(item => item.id_order_detail === idOrderDetail);
  return printItem ? printItem.print_image_path || '-' : '-';
}

/**
 * Get print image URL by order detail ID
 * @param {string} idOrderDetail - Order detail ID
 * @returns {string} - Print image URL or null if not found
 */
function getPrintImageUrl(idOrderDetail) {
  if (!currentPrintData) return null;
  
  const printItem = currentPrintData.find(item => item.id_order_detail === idOrderDetail);
  return printItem ? printItem.print_image_url || null : null;
}

/**
 * Get print status by order detail ID
 * @param {string} idOrderDetail - Order detail ID
 * @returns {string} - Print status or '-' if not found
 */
function getPrintStatus(idOrderDetail) {
  if (!currentPrintData) return '-';
  
  const printItem = currentPrintData.find(item => item.id_order_detail === idOrderDetail);
  return printItem ? printItem.status || '-' : '-';
}

/**
 * Convert file path to web URL
 * @param {string} filePath - File path to convert
 * @param {string} idOrderDetail - Order detail ID
 * @returns {string} - Web URL
 */
function convertPathToUrl(filePath, idOrderDetail) {
  if (!filePath || filePath === '-') return null;
  
  // First try to get the URL from the API response
  const imageUrl = getPrintImageUrl(idOrderDetail);
  if (imageUrl) {
    console.log('Using image URL from API:', imageUrl);
    return imageUrl;
  }
  
  // Fallback: normalize path and construct URL manually
  console.log('Fallback: constructing URL from path:', filePath);
  
  // Normalize path separators
  let normalizedPath = filePath.replace(/\\/g, '/');
  
  const effectiveBaseURL = getEffectiveBaseURL();
  
  // Extract relative path from PRINT folder
  if (normalizedPath.includes('D:/assets/PRINT/')) {
    const relativePath = normalizedPath.replace('D:/assets/PRINT/', '');
    return `${effectiveBaseURL}/print-image/${relativePath}`;
  }
  
  // Just use the filename as a last resort
  const filename = normalizedPath.split('/').pop();
  return `${effectiveBaseURL}/print-image/${filename}`;
}

/**
 * Create and show order detail popup
 * @param {Array} orderDetails - Order detail data
 * @param {string} orderId - Order ID
 */
function showOrderDetailPopup(orderDetails, orderId) {
  // Remove existing popup if any
  const existingPopup = document.querySelector('.popup-container');
  if (existingPopup) {
    document.body.removeChild(existingPopup);
  }
  
  // Get the first order detail for header information
  const firstDetail = orderDetails[0] || {};
  
  // Create popup container
  const popupContainer = document.createElement('div');
  popupContainer.className = 'popup-container';
  popupContainer.style.zIndex = '9999';
  
  // Create popup content
  const popupContent = document.createElement('div');
  popupContent.className = 'popup-content';
  
  // Create popup header
  const popupHeader = document.createElement('div');
  popupHeader.className = 'popup-header';
  popupHeader.innerHTML = `
    <div class="popup-header-icon">
      <i class="fas fa-box"></i>
    </div>
    <h3>Detail Pesanan: ${orderId}</h3>
    <span class="close-btn">&times;</span>
  `;
  
  // Create popup body
  const popupBody = document.createElement('div');
  popupBody.className = 'popup-body';
  
  // Create status section
  const statusSection = document.createElement('div');
  statusSection.className = 'status-section';
  
  // Get print status for the order
  const printStatus = getPrintStatus(firstDetail.id_order_detail) || 'belum_diprint';
  
  // Get status badge class
  let statusBadgeClass = '';
  let statusText = '';
  
  if (printStatus === 'belum_diprint') {
    statusBadgeClass = 'status-pending';
    statusText = 'BELUM DIPRINT';
  } else if (printStatus === 'sedang_diprint') {
    statusBadgeClass = 'status-processing';
    statusText = 'SEDANG DIPRINT';
  } else if (printStatus === 'selesai') {
    statusBadgeClass = 'status-completed';
    statusText = 'SELESAI';
  }
  
  statusSection.innerHTML = `
    <div class="status-label">Status Pesanan:</div>
    <div class="status-badge ${statusBadgeClass}">${statusText}</div>
  `;
  
  // Create info sections container
  const infoContainer = document.createElement('div');
  infoContainer.className = 'info-container';
  
  // Create order info section
  const orderInfoSection = document.createElement('div');
  orderInfoSection.className = 'info-section';
  orderInfoSection.innerHTML = `
    <h4>Informasi Pesanan</h4>
    <div class="info-item">
      <div class="info-label">ID Order</div>
      <div class="info-value">${firstDetail.id_order || '-'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Platform</div>
      <div class="info-value">${firstDetail.platform || '-'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Deadline</div>
      <div class="info-value">${firstDetail.deadline ? new Date(firstDetail.deadline).toLocaleDateString('id-ID') : '-'}</div>
    </div>
  `;
  
  // Create customer info section
  const customerInfoSection = document.createElement('div');
  customerInfoSection.className = 'info-section';
  customerInfoSection.innerHTML = `
    <h4>Informasi Customer</h4>
    <div class="info-item">
      <div class="info-label">Nama Customer</div>
      <div class="info-value">${firstDetail.nama_customer || '-'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Tanggal Dibuat</div>
      <div class="info-value">${firstDetail.timestamp ? new Date(firstDetail.timestamp).toLocaleString('id-ID') : '-'}</div>
    </div>
  `;
  
  // Add sections to info container
  infoContainer.appendChild(orderInfoSection);
  infoContainer.appendChild(customerInfoSection);
  
  // Add status section and info container to popup body
  popupBody.appendChild(statusSection);
  popupBody.appendChild(infoContainer);
  
  // Create order items container
  const orderItemsContainer = document.createElement('div');
  orderItemsContainer.className = 'order-items-container';
  orderItemsContainer.innerHTML = `<h4>Item Pesanan (${orderDetails.length})</h4>`;
  
  // Create order items grid
  const orderItemsGrid = document.createElement('div');
  orderItemsGrid.className = 'order-items-grid';
  
  // Add each order detail as a card
  orderDetails.forEach((detail, index) => {
    const orderItemCard = document.createElement('div');
    orderItemCard.className = 'order-item-card';
    
    // Create card header
    const orderItemHeader = document.createElement('div');
    orderItemHeader.className = 'order-item-header';
    orderItemHeader.innerHTML = `
      <h5 class="order-item-title">Item #${index + 1}</h5>
      <div class="order-item-id">${detail.id_order_detail || '-'}</div>
    `;
    
    // Create card body
    const orderItemBody = document.createElement('div');
    orderItemBody.className = 'order-item-body';
    
    // Add product details
    orderItemBody.innerHTML = `
      <div class="info-item">
        <div class="info-label">Nama Pada Tas</div>
        <div class="info-value">${detail.nama || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Catatan Produk</div>
        <div class="info-value">${detail.product_note || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Tipe Produk</div>
        <div class="info-value">${detail.type_product || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Quantity</div>
        <div class="info-value">${detail.qty || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">ID Image</div>
        <div class="info-value">${detail.id_image || '-'}</div>
      </div>
    `;
    
    // Get print items for this order detail
    const printItems = currentPrintData ? currentPrintData.filter(item => item.id_order_detail === detail.id_order_detail) : [];
    
    // Create image container
    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'images-container';
    
    if (printItems.length > 0) {
      printItems.forEach(printItem => {
        const printImagePath = printItem.print_image_path || '-';
        const printImageUrl = printItem.print_image_url || convertPathToUrl(printImagePath, detail.id_order_detail);
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        // Determine status class
        let statusClass = 'status-pending';
        const printStatus = printItem.status || 'belum_diprint';
        
        if (printStatus === 'belum_diprint') {
          statusClass = 'status-pending';
        } else if (printStatus === 'sedang_diprint') {
          statusClass = 'status-processing';
        } else if (printStatus === 'selesai') {
          statusClass = 'status-completed';
        }
        
        imageContainer.innerHTML = `
          <div class="print-info">
            <div class="print-id">${printItem.id_print || '-'}</div>
            <div class="print-status ${statusClass}">${printStatus}</div>
          </div>
          <div class="image-path">${printImagePath}</div>
          <div class="image-preview-container">
            ${printImageUrl ? `
              <div class="image-wrapper">
                <img src="${printImageUrl}" alt="Preview Gambar" class="preview-image" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/600x800?text=Gambar+Tidak+Ditemukan'; this.classList.add('error-image');">
                <div class="image-overlay">
                  <div class="view-actions">
                    <a href="${printImageUrl}" target="_blank" class="view-fullsize-icon" title="Buka di tab baru">
                      <i class="fas fa-external-link-alt"></i>
                    </a>
                    <a href="javascript:void(0)" class="view-fullsize-icon" title="Lihat ukuran penuh" onclick="showFullsizeImage('${printImageUrl}')">
                      <i class="fas fa-search-plus"></i>
                    </a>
                  </div>
                </div>
              </div>
            ` : 
            `<div class="preview-placeholder">
              <i class="fas fa-image"></i>
              <p>Preview gambar akan ditampilkan disini</p>
            </div>`}
          </div>
        `;
        
        imagesContainer.appendChild(imageContainer);
      });
    } else {
      const noImagesMessage = document.createElement('div');
      noImagesMessage.className = 'no-images-message';
      noImagesMessage.innerHTML = `
        <div class="preview-placeholder">
          <i class="fas fa-image"></i>
          <p>Tidak ada gambar print untuk item ini</p>
        </div>
      `;
      
      imagesContainer.appendChild(noImagesMessage);
    }
    
    // Add images container to card body
    orderItemBody.appendChild(imagesContainer);
    
    // Assemble card
    orderItemCard.appendChild(orderItemHeader);
    orderItemCard.appendChild(orderItemBody);
    
    // Add card to grid
    orderItemsGrid.appendChild(orderItemCard);
  });
  
  // Add grid to container
  orderItemsContainer.appendChild(orderItemsGrid);
  
  // Add order items container to popup body
  popupBody.appendChild(orderItemsContainer);
  
  // Assemble popup
  popupContent.appendChild(popupHeader);
  popupContent.appendChild(popupBody);
  popupContainer.appendChild(popupContent);
  
  // Add popup to document body
  document.body.appendChild(popupContainer);
  
  // Add event listener to close button
  const closeBtn = popupContainer.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(popupContainer);
  });
  
  // Close popup when clicking outside
  popupContainer.addEventListener('click', (event) => {
    if (event.target === popupContainer) {
      document.body.removeChild(popupContainer);
    }
  });
}

/**
 * Show loading overlay
 * @param {boolean} show - Whether to show or hide the loading overlay
 */
function showLoadingOverlay(show) {
  // Remove existing loading overlay if any
  const existingOverlay = document.querySelector('.loading-overlay');
  if (existingOverlay) {
    document.body.removeChild(existingOverlay);
  }
  
  if (show) {
    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Memuat data...</p>
    `;
    
    // Add loading overlay to document body
    document.body.appendChild(loadingOverlay);
  }
}

/**
 * View order detail by order ID
 * @param {string} orderId - Order ID to view details for
 */
window.viewOrderDetail = async function(orderId) {
  try {
    // Show loading overlay
    showLoadingOverlay(true);
    showNotification('Memuat detail pesanan...', 'info');
    
    // Fetch order detail data
    const orderDetails = await fetchOrderDetail(orderId);
    
    // Fetch print data
    currentPrintData = await fetchPrintData();
    
    // Store current order detail data
    currentOrderDetail = orderDetails;
    
    // Hide loading overlay
    showLoadingOverlay(false);
    
    // Show popup with order detail data
    showOrderDetailPopup(orderDetails, orderId);
  } catch (error) {
    console.error('Error viewing order detail:', error);
    showNotification('Gagal menampilkan detail pesanan', 'error');
    showLoadingOverlay(false);
  }
};

/**
 * View print detail by print ID
 * @param {string} printId - Print ID to view details for
 */
window.viewPrintDetail = async function(printId) {
  try {
    // Show loading overlay
    showLoadingOverlay(true);
    showNotification('Memuat detail print...', 'info');
    
    // Fetch print data if not already fetched
    if (!currentPrintData) {
      currentPrintData = await fetchPrintData();
    }
    
    // Find print item by ID
    const printItem = currentPrintData.find(item => item.id_print === printId);
    
    if (!printItem) {
      throw new Error('Print not found');
    }
    
    // Fetch order detail data for this print
    const orderDetails = await fetchOrderDetail(printItem.id_order_detail.split('-')[0]);
    
    // Filter to only show the specific order detail
    const filteredOrderDetail = orderDetails.filter(detail => detail.id_order_detail === printItem.id_order_detail);
    
    // Store current order detail data
    currentOrderDetail = filteredOrderDetail;
    
    // Hide loading overlay
    showLoadingOverlay(false);
    
    // Show popup with order detail data
    showOrderDetailPopup(filteredOrderDetail, printItem.id_order_detail.split('-')[0]);
  } catch (error) {
    console.error('Error viewing print detail:', error);
    showNotification('Gagal menampilkan detail print', 'error');
    showLoadingOverlay(false);
  }
};

/**
 * Show fullsize image in a modal
 * @param {string} imageUrl - URL of the image to show
 */
window.showFullsizeImage = function(imageUrl) {
  // Remove existing fullsize image modal if any
  const existingModal = document.querySelector('.fullsize-image-modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'fullsize-image-modal';
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="fullsize-image-container">
      <span class="close-fullsize-btn">&times;</span>
      <img src="${imageUrl}" alt="Gambar Ukuran Penuh" class="fullsize-image"
           onerror="this.onerror=null; this.src='https://via.placeholder.com/800x1200?text=Gambar+Tidak+Ditemukan'; this.classList.add('error-image');">
    </div>
  `;
  
  // Add modal to document body
  document.body.appendChild(modalContainer);
  
  // Add event listener to close button
  const closeBtn = modalContainer.querySelector('.close-fullsize-btn');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
  
  // Close modal when clicking outside the image
  modalContainer.addEventListener('click', (event) => {
    if (event.target === modalContainer) {
      document.body.removeChild(modalContainer);
    }
  });
};

// Export functions for testing or external use
export {
  fetchOrderDetail,
  fetchPrintData,
  getPrintImagePath,
  getPrintStatus,
  showOrderDetailPopup
};