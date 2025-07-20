let itemCounter = 0;
const productTypeGroups = {
  '1 Sisi': ['1 SISI MAGNET', '1 SISI ZIPPER'],
  '2 Sisi': ['2 SISI MAGNET', '2 SISI ZIPPER']
};

export function initFirstItem() {
  addItem();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('deadline').value = tomorrow.toISOString().split('T')[0];
}

  function updateContainerColor(inputEl, containerId) {
    const color = inputEl.value;
    const container = document.getElementById(containerId);
    if (container) {
      container.style.backgroundColor = color + '20'; // kasih transparansi
    }
  }


export function addItem() {
  itemCounter++;
  const container = document.getElementById('itemsContainer');
  const itemCard = document.createElement('div');
  itemCard.className = 'item-card';
  itemCard.id = `item-${itemCounter}`;
  itemCard.innerHTML = `
    <div class="item-header">
      <span class="item-number">Item #${itemCounter}</span>
      <button type="button" class="remove-item-btn" data-item-id="${itemCounter}">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="nama_${itemCounter}">Nama :</label>
        <input type="text" id="nama_${itemCounter}" required />
      </div>
      <div class="form-group" style="margin-bottom: 16px;">
        <label for="font_color_${itemCounter}" 
        style="
        display: inline-block; 
        width: 100px; 
        font-weight: 600; 
        color: #555;">
          Font Color :
        </label>
        <input 
          type="color" 
          id="font_color_${itemCounter}" 
          value="#000000"
          class="font-color-picker"
          data-container-id="color-target-${itemCounter}"
          style="border: 2px solid #ccc; 
          width: 200px; 
          height: 45px; 
          border-radius: 8px; 
          cursor: pointer;"
        />
      </div>
      <label>ID Image :</label>
      <div class="image-selection">
        <button type="button" class="image-brand-btn" data-item-id="${itemCounter}" data-brand="Marsoto">Marsoto</button>
        <button type="button" class="image-brand-btn" data-item-id="${itemCounter}" data-brand="MNK">MNK</button>
      </div>
      <input type="hidden" id="id_image_${itemCounter}" required />
      <div class="image-search-container" id="image_search_container_${itemCounter}" style="display: none;">
        <input type="text" id="image_search_input_${itemCounter}" placeholder="Cari berdasarkan nama file..." class="image-search-input">
        <div class="search-results" id="search_results_${itemCounter}"></div>
      </div>
      <div class="selected-image-info" id="selected_image_info_${itemCounter}" style="display: none;">
        <span class="selected-image-label"></span>
        <div class="selected-image-thumbnail" id="selected_image_thumbnail_${itemCounter}"></div>
      </div>
    </div>
    <div class="form-group">
      <label>Type Product :</label>
      <div class="product-types">
        ${Object.entries(productTypeGroups).map(([groupName, types]) => `
          <div class="product-type-group">
            <div class="group-label">${groupName}</div>
            <div class="buttons">
              ${types.map(type => `
                <button type="button" class="product-type-btn" data-item-id="${itemCounter}" data-type="${type}">${type}</button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <input type="hidden" id="type_product_${itemCounter}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="qty_${itemCounter}">Quantity:</label>
        <input type="number" id="qty_${itemCounter}" value="1" min="1" required />
      </div>
    </div>
    <div class="form-group">
      <label for="product_note_${itemCounter}">Product Note :</label>
      <textarea id="product_note_${itemCounter}" rows="3"></textarea>
    </div>
    <div class="form-group preview-btn-group">
      <button type="button" class="preview-btn" data-item-id="${itemCounter}">Preview Design</button>
    </div>
  `;
  container.appendChild(itemCard);
  
  // Add event listeners for the new item setelah element ditambahkan ke DOM
  setTimeout(() => setupItemEventListeners(itemCounter), 0);
}

export function removeItem(id) {
  const el = document.getElementById(`item-${id}`);
  if (el) el.remove();
  if (document.querySelectorAll('.item-card').length === 0) addItem();
}

function setupItemEventListeners(itemId) {
  // Setup remove button dengan selector yang lebih spesifik
  const removeBtn = document.querySelector(`#item-${itemId} .remove-item-btn`);
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      console.log(`Removing item ${itemId}`); // Debug log
      removeItem(itemId);
    });
  }
  // Setup product type buttons dengan selector yang lebih spesifik
  const productBtns = document.querySelectorAll(`#item-${itemId} .product-type-btn`);
  productBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      console.log(`Selected type: ${type} for item ${itemId}`); // Debug log
      selectProductType(itemId, type, e.target);
    });
  });
  // Setup image brand buttons
  const imageBrandBtns = document.querySelectorAll(`#item-${itemId} .image-brand-btn`);
  imageBrandBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const brand = e.target.dataset.brand;
      const itemId = e.target.dataset.itemId;
      console.log(`Selected brand: ${brand} for item ${itemId}`);
      showImageSearch(brand, itemId);
    });
  });
  // Setup font color event listener
  const colorInput = document.getElementById(`font_color_${itemId}`);
  if (colorInput) {
    colorInput.addEventListener('input', () => {
      updateContainerColor(colorInput, colorInput.dataset.containerId);
    });
    // Apply initial color
    updateContainerColor(colorInput, colorInput.dataset.containerId);
  }

  // Setup Preview Design button
  const previewBtn = document.querySelector(`#item-${itemId} .preview-btn`);
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      // You may need to import or call the correct preview modal logic here
      if (window.openPreviewModalForItem) {
        window.openPreviewModalForItem(document.getElementById(`item-${itemId}`));
      } else {
        alert('Preview modal logic not found!');
      }
    });
  }

  
}

function selectProductType(itemId, type, targetBtn) {
  const itemCard = document.getElementById(`item-${itemId}`);
  const buttons = itemCard.querySelectorAll('.product-type-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  targetBtn.classList.add('active');
  document.getElementById(`type_product_${itemId}`).value = type;
}

// Fungsi untuk menampilkan pencarian gambar
async function showImageSearch(brand, itemId) {
  try {
    // Simpan data gambar di localStorage jika belum ada
    let cachedImages = localStorage.getItem('cachedImages');
    let images;
    
    if (!cachedImages) {
      // Fetch images from API hanya sekali
      const response = await fetch('http://100.124.58.32:5000/images');
      images = await response.json();
      localStorage.setItem('cachedImages', JSON.stringify(images));
    } else {
      images = JSON.parse(cachedImages);
    }
    
    // Filter images by brand (product_name)
    const brandImages = images.filter(img => img.product_name === brand);
    
    // Show search container
    const searchContainer = document.getElementById(`image_search_container_${itemId}`);
    const searchInput = document.getElementById(`image_search_input_${itemId}`);
    const searchResults = document.getElementById(`search_results_${itemId}`);
    
    if (searchContainer && searchInput && searchResults) {
      searchContainer.style.display = 'block';
      searchInput.focus();
      
      // Clear previous results
      searchResults.innerHTML = '';
      
      // Store images data for this item
      searchInput.dataset.brand = brand;
      searchInput.dataset.images = JSON.stringify(brandImages);
      
      // Add search event listener
      searchInput.removeEventListener('input', handleImageSearch);
      searchInput.addEventListener('input', handleImageSearch);
    }
    
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

// Fungsi popup yang tidak lagi digunakan - dihapus untuk fitur pencarian baru
// createImagePopup, groupImagesByMotif, showMotifImages, displayImages, filterImagesBySearch
// telah digantikan dengan fitur pencarian inline

// Fungsi-fungsi popup yang tidak lagi digunakan telah dihapus
// groupImagesByMotif, showMotifImages, displayImages, filterImagesBySearch
// digantikan dengan fitur pencarian inline yang lebih sederhana

// Fungsi untuk mengekstrak nama file dari path
function extractFilenameFromPath(path) {
  if (!path) return 'Unknown';
  const parts = path.split(/[\\/]/);
  const filename = parts[parts.length - 1];
  return filename.replace(/\.[^/.]+$/, ''); // Remove extension
}

// Fungsi untuk mendapatkan URL gambar asli
function getImageUrl(imagePath) {
  if (!imagePath) {
    console.warn('Image path is empty or null');
    return '';
  }
  
  console.log('Original image path:', imagePath);
  
  // Normalize path separators
  let normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Handle different path formats:
  // 1. Full path: D:/assets/database_images/Marsoto/DUBAIHM0045.jpg
  // 2. Relative path: Marsoto/DUBAIHM0045.jpg
  // 3. Just filename: DUBAIHM0045.jpg
  
  // Remove drive letter and assets/database_images prefix if present
  if (normalizedPath.includes('database_images/')) {
    const parts = normalizedPath.split('database_images/');
    if (parts.length > 1) {
      const relativePath = parts[1];
      const finalUrl = `http://100.124.58.32:5000/static/images/${relativePath}`;
      console.log('Generated URL from database_images path:', finalUrl);
      return finalUrl;
    }
  }
  
  // Handle paths that start with drive letter but don't have database_images
  // Example: D:assetsdatabase_imagesMarsotoDUBAIHM0045.jpg (malformed path)
  if (normalizedPath.match(/^[A-Za-z]:/)) {
    // Try to extract the brand and filename from malformed paths
    // Look for brand patterns (Marsoto, MNK) in the path
    const brandMatch = normalizedPath.match(/(Marsoto|MNK)([A-Z0-9]+\.[a-z]+)$/i);
    if (brandMatch) {
      const brand = brandMatch[1];
      const filename = brandMatch[2];
      const relativePath = `${brand}/${filename}`;
      const finalUrl = `http://100.124.58.32:5000/static/images/${relativePath}`;
      console.log('Generated URL from malformed path:', finalUrl);
      return finalUrl;
    }
    
    // Try to find common folder patterns and extract relative path
    const pathParts = normalizedPath.split('/');
    let startIndex = -1;
    
    // Look for brand folder names
    const brandFolders = ['Marsoto', 'MNK'];
    for (let i = 0; i < pathParts.length; i++) {
      if (brandFolders.includes(pathParts[i])) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex >= 0) {
      const relativePath = pathParts.slice(startIndex).join('/');
      const finalUrl = `http://100.124.58.32:5000/static/images/${relativePath}`;
      console.log('Generated URL from brand folder path:', finalUrl);
      return finalUrl;
    }
  }
  
  // If path already looks like a relative path (brand/filename)
  if (normalizedPath.match(/^(Marsoto|MNK)\//)) {
    const finalUrl = `http://100.124.58.32:5000/static/images/${normalizedPath}`;
    console.log('Generated URL from relative path:', finalUrl);
    return finalUrl;
  }
  
  // Last resort: assume it's just a filename and try to determine brand from filename
  const filename = normalizedPath.split('/').pop();
  
  // Try to determine brand from filename pattern
  if (filename.match(/^(DUBAI|TURKI|INDIA)/i)) {
    // These patterns typically belong to Marsoto
    const finalUrl = `http://100.124.58.32:5000/static/images/Marsoto/${filename}`;
    console.log('Generated URL assuming Marsoto brand:', finalUrl);
    return finalUrl;
  } else {
    // Default to MNK for other patterns
    const finalUrl = `http://100.124.58.32:5000/static/images/MNK/${filename}`;
    console.log('Generated URL assuming MNK brand:', finalUrl);
    return finalUrl;
  }
}

// Fungsi untuk menangani pencarian gambar
function handleImageSearch(event) {
  const searchInput = event.target;
  const searchTerm = searchInput.value.toLowerCase().trim();
  const itemId = searchInput.id.split('_').pop();
  const searchResults = document.getElementById(`search_results_${itemId}`);
  const images = JSON.parse(searchInput.dataset.images || '[]');
  
  // Clear previous results
  searchResults.innerHTML = '';
  
  if (searchTerm.length === 0) {
    return;
  }
  
  // Filter images by filename
  const filteredImages = images.filter(image => {
    const imageName = (image.image_name || '').toLowerCase();
    return imageName.includes(searchTerm);
  });
  
  if (filteredImages.length === 0) {
    searchResults.innerHTML = '<div class="no-results">Tidak ada file yang ditemukan</div>';
    return;
  }
  
  // Display search results
  filteredImages.forEach(image => {
    const filename = image.image_name || extractFilenameFromPath(image.image_path);
    const imageUrl = image.image_url || getImageUrl(image.image_path);
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <span class="result-filename">${filename}</span>
      <button type="button" class="select-result-btn" onclick="selectImageFromSearch(${image.id_image}, '${filename}', '${imageUrl}', ${itemId})">Pilih</button>
    `;
    searchResults.appendChild(resultItem);
  });
}

// Fungsi untuk memilih gambar dari hasil pencarian
window.selectImageFromSearch = function(imageId, imageName, imageUrl, itemId) {
  // Set hidden input value
  const hiddenInput = document.getElementById(`id_image_${itemId}`);
  if (hiddenInput) {
    hiddenInput.value = imageId;
  }
  
  // Update selected image info
  const imageInfo = document.getElementById(`selected_image_info_${itemId}`);
  const imageLabel = imageInfo.querySelector('.selected-image-label');
  const imageThumbnail = document.getElementById(`selected_image_thumbnail_${itemId}`);
  
  if (imageInfo && imageLabel) {
    imageLabel.textContent = `Terpilih: ${imageName} (ID: ${imageId})`;
    imageInfo.style.display = 'block';
  }
  
  // Show enhanced preview with larger thumbnail
  if (imageThumbnail) {
    const finalImageUrl = imageUrl || getImageUrl(imageName);
    
    imageThumbnail.innerHTML = `
      <div class="image-preview-container">
        <img src="${finalImageUrl}" alt="${imageName}" class="preview-image">
        <div class="image-info">
          <span class="image-id">ID: ${imageId}</span>
          <span class="image-name">${imageName}</span>
        </div>
      </div>
    `;
  }
  
  // Hide search container
  const searchContainer = document.getElementById(`image_search_container_${itemId}`);
  if (searchContainer) {
    searchContainer.style.display = 'none';
  }
};

// Fungsi untuk memilih gambar (untuk backward compatibility)
window.selectImage = function(imageId, imageName, itemId, imagePathOrUrl = null) {
  // Set hidden input value
  const hiddenInput = document.getElementById(`id_image_${itemId}`);
  if (hiddenInput) {
    hiddenInput.value = imageId;
  }
  
  // Update selected image info
  const imageInfo = document.getElementById(`selected_image_info_${itemId}`);
  const imageLabel = imageInfo.querySelector('.selected-image-label');
  const imageThumbnail = document.getElementById(`selected_image_thumbnail_${itemId}`);
  
  if (imageInfo && imageLabel) {
    imageLabel.textContent = `Terpilih: ${imageName} (ID: ${imageId})`;
    imageInfo.style.display = 'block';
  }
  
  // Show enhanced preview with larger thumbnail if imagePathOrUrl is provided
  if (imagePathOrUrl && imageThumbnail) {
    // Check if it's already a URL or needs conversion
    const imageUrl = imagePathOrUrl.startsWith('http') ? imagePathOrUrl : getImageUrl(imagePathOrUrl);
    
    imageThumbnail.innerHTML = `
      <div class="image-preview-container">
        <img src="${imageUrl}" alt="${imageName}" class="preview-image">
        <img src="${imageUrl}" alt="${imageName}" class="preview-image" style="display: none;" 
             onload="this.style.display='block'; this.parentElement.querySelector('.image-loading-spinner').style.display='none';" 
             onerror="this.style.display='none'; this.parentElement.querySelector('.image-loading-spinner').style.display='none'; this.parentElement.querySelector('.image-error').style.display='block';">
        <div class="image-error" style="display: none;">Gambar tidak dapat dimuat</div>
        <button type="button" class="preview-fullsize-btn" onclick="showFullSizePreview('${imageUrl}', '${imageName}', ${imageId})">Lihat Ukuran Penuh</button>
      </div>
    `;
  }
  
  showNotification(`Gambar ${imageName} berhasil dipilih`, 'success');
};

// Fungsi closeImagePopup dan showMotifImages tidak lagi digunakan
// telah digantikan dengan fitur pencarian inline

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Fungsi untuk menampilkan preview ukuran penuh
window.showFullSizePreview = function(imageUrl, imageName, imageId) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'image-preview-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeFullSizePreview()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Preview Gambar</h3>
          <button class="modal-close-btn" onclick="closeFullSizePreview()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-loading-spinner">
            <div class="spinner"></div>
            <span>Memuat gambar...</span>
          </div>
          <img src="${imageUrl}" alt="${imageName}" class="fullsize-preview-image" style="display: none;" 
               onload="this.style.display='block'; this.parentElement.querySelector('.modal-loading-spinner').style.display='none';" 
               onerror="this.style.display='none'; this.parentElement.querySelector('.modal-loading-spinner').style.display='none'; this.parentElement.querySelector('.image-error').style.display='block';">
          <div class="image-error" style="display: none;">Gambar tidak dapat dimuat</div>
          <div class="image-details">
            <p><strong>ID:</strong> ${imageId}</p>
            <p><strong>Nama:</strong> ${imageName}</p>
            <p><strong>URL:</strong> <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to document
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Store modal reference for cleanup
  window.currentImageModal = modal;
};

// Fungsi untuk menutup preview ukuran penuh
window.closeFullSizePreview = function() {
  const modal = window.currentImageModal;
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      window.currentImageModal = null;
    }, 300);
  }
};

// Export untuk digunakan di main.js
export { addItem as addItemFunction, removeItem as removeItemFunction };

// Event delegation for Preview Design buttons
const itemsContainer = document.getElementById('itemsContainer');
if (itemsContainer) {
  itemsContainer.addEventListener('click', function(e) {
    const btn = e.target.closest('.preview-btn');
    if (btn && itemsContainer.contains(btn)) {
      const itemCard = btn.closest('.item-card');
      if (itemCard) {
        const itemId = itemCard.id.replace('item-', '');
        if (window.openPreviewModalForItem) {
          window.openPreviewModalForItem(itemCard);
        } else {
          alert('Preview modal logic not found!');
        }
      }
    }
  });
}