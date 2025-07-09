let itemCounter = 0;
const productTypeGroups = {
  '1 Sisi': ['1 SISI MAGNET', '1 SISI ZIPPER'],
  '2 Sisi': ['2 SISI MAGNET', '2 SISI ZIPPER'],
  'Lainnya': ['CUSTOM']
};

export function initFirstItem() {
  addItem();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('deadline').value = tomorrow.toISOString().split('T')[0];
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
        <label for="nama_${itemCounter}">Nama:</label>
        <input type="text" id="nama_${itemCounter}" required />
      </div>
      <div class="form-group">
        <label>ID Image:</label>
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
    </div>
    <div class="form-group">
      <label>Type Product:</label>
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
      <label for="product_note_${itemCounter}">Product Note:</label>
      <textarea id="product_note_${itemCounter}" rows="3"></textarea>
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
    // Fetch images from API
    const response = await fetch('http://localhost:5000/images');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const images = await response.json();
    
    // Filter images by brand (product_name)
    const brandImages = images.filter(img => img.product_name === brand);
    
    if (brandImages.length === 0) {
      if (brand === 'MNK') {
        showNotification('Data MNK belum tersedia dari backend', 'warning');
      } else {
        showNotification(`Tidak ada gambar ditemukan untuk ${brand}`, 'warning');
      }
      return;
    }
    
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
    if (brand === 'MNK') {
      showNotification('Data MNK belum tersedia dari backend', 'warning');
    } else {
      showNotification('Gagal memuat gambar. Periksa koneksi ke server.', 'error');
    }
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
  
  // Normalize path separators and remove any drive letters
  let normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Remove any absolute path prefixes
  // Handle D:\assets\database_images\ or D:/assets/database_images/
  if (normalizedPath.includes('database_images/')) {
    const parts = normalizedPath.split('database_images/');
    if (parts.length > 1) {
      const relativePath = parts[1];
      const finalUrl = `http://localhost:5000/static/images/${relativePath}`;
      console.log('Generated URL:', finalUrl);
      return finalUrl;
    }
  }
  
  // If path starts with drive letter, extract everything after the last known folder
  if (normalizedPath.match(/^[A-Za-z]:/)) {
    // Try to find common folder patterns and extract relative path
    const pathParts = normalizedPath.split('/');
    let startIndex = -1;
    
    // Look for common folder names that indicate start of relative path
    const folderMarkers = ['Marsoto', 'MNK', 'assets', 'images'];
    for (let i = 0; i < pathParts.length; i++) {
      if (folderMarkers.includes(pathParts[i])) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex >= 0) {
      const relativePath = pathParts.slice(startIndex).join('/');
      const finalUrl = `http://localhost:5000/static/images/${relativePath}`;
      console.log('Generated URL from drive path:', finalUrl);
      return finalUrl;
    }
  }
  
  // Last resort: use the filename only
  const filename = normalizedPath.split('/').pop();
  console.warn('Using filename only for path:', imagePath);
  return `http://localhost:5000/static/images/${filename}`;
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
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <span class="result-filename">${filename}</span>
      <button class="select-result-btn" onclick="selectImageFromSearch(${image.id_image}, '${filename}', '${image.image_path}', ${itemId})">Pilih</button>
    `;
    searchResults.appendChild(resultItem);
  });
}

// Fungsi untuk memilih gambar dari hasil pencarian
window.selectImageFromSearch = function(imageId, imageName, imagePath, itemId) {
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
    imageLabel.textContent = `Terpilih: ${imageName}`;
    imageInfo.style.display = 'block';
  }
  
  // Show thumbnail
  if (imageThumbnail) {
    const imageUrl = getImageUrl(imagePath);
    imageThumbnail.innerHTML = `<img src="${imageUrl}" alt="${imageName}" class="thumbnail-image" onerror="this.style.display='none'">`;
  }
  
  // Hide search container
  const searchContainer = document.getElementById(`image_search_container_${itemId}`);
  if (searchContainer) {
    searchContainer.style.display = 'none';
  }
  
  showNotification(`Gambar ${imageName} berhasil dipilih`, 'success');
};

// Fungsi untuk memilih gambar (untuk backward compatibility)
window.selectImage = function(imageId, imageName, itemId, imagePath = null) {
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
    imageLabel.textContent = `Terpilih: ${imageName}`;
    imageInfo.style.display = 'block';
  }
  
  // Show thumbnail if imagePath is provided
  if (imagePath && imageThumbnail) {
    const imageUrl = getImageUrl(imagePath);
    imageThumbnail.innerHTML = `<img src="${imageUrl}" alt="${imageName}" class="thumbnail-image" onerror="this.style.display='none'">`;
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

// Export untuk digunakan di main.js
export { addItem as addItemFunction, removeItem as removeItemFunction };