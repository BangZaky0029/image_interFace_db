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
      <button type="button" class="remove-item-btn" data-item-id="${itemCounter}"><i class="fas fa-times"></i> Hapus</button>
    </div>
    <div class="form-row">
      <div class="form-group required">
        <label for="nama_${itemCounter}">Nama Depan:</label>
        <input type="text" id="nama_${itemCounter}" required placeholder="Masukkan nama" />
        <div class="error-text"></div>
      </div>
      <div class="form-group second-name-container" id="second_name_container_${itemCounter}" style="display: none; transition: all 0.3s ease;">
        <label for="second_name_${itemCounter}">Nama Belakang:</label>
        <input type="text" id="second_name_${itemCounter}" placeholder="Masukkan nama belakang" />
        <div class="error-text"></div>
      </div>
      <div class="form-group">
        <label for="font_color_${itemCounter}">Warna Font:</label>
        <input 
          type="color" 
          id="font_color_${itemCounter}" 
          value="#000000"
          class="font-color-picker"
          data-container-id="color-target-${itemCounter}"
        />
      </div>
      <div class="form-group required">
        <label>ID Image:</label>
        <div class="image-selection">
          <button type="button" class="image-brand-btn" data-item-id="${itemCounter}" data-brand="Marsoto">Marsoto</button>
          <button type="button" class="image-brand-btn" data-item-id="${itemCounter}" data-brand="MNK">MNK</button>
        </div>
        <input type="hidden" id="id_image_${itemCounter}" required />
        <div class="error-text"></div>
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
    <div class="form-group required">
      <label>Tipe Produk:</label>
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
      <div class="error-text"></div>
    </div>
    <div class="form-row">
      <div class="form-group required">
        <label for="qty_${itemCounter}">Jumlah:</label>
        <input type="number" id="qty_${itemCounter}" value="1" min="1" required />
        <div class="error-text"></div>
      </div>
    </div>
    <div class="form-group">
      <label for="product_note_${itemCounter}">Catatan Produk:</label>
      <textarea id="product_note_${itemCounter}" rows="3" placeholder="Tambahkan catatan jika diperlukan"></textarea>
    </div>
    <div class="form-group preview-btn-group">
      <button type="button" class="preview-btn" data-item-id="${itemCounter}"><i class="fas fa-eye"></i> Lihat Desain</button>
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
  
  // Toggle second_name field based on product type
  const secondNameContainer = document.getElementById(`second_name_container_${itemId}`);
  if (secondNameContainer) {
    if (type.includes('2 SISI')) {
      // Show second_name field with animation
      secondNameContainer.style.display = 'block';
      secondNameContainer.style.maxHeight = '100px';
      secondNameContainer.style.opacity = '1';
    } else {
      // Hide second_name field with animation
      secondNameContainer.style.opacity = '0';
      secondNameContainer.style.maxHeight = '0';
      setTimeout(() => {
        secondNameContainer.style.display = 'none';
      }, 300);
    }
  }
}

// Fungsi untuk menampilkan pencarian gambar
async function showImageSearch(brand, itemId) {
  try {
    // Simpan data gambar di localStorage jika belum ada
    let cachedImages = localStorage.getItem('cachedImages');
    let images;
    
    if (!cachedImages) {
      // Fetch images from API hanya sekali - gunakan endpoint baru
      const response = await fetch(`http://100.124.58.32:5000/api/images/path/${brand}`);
      const responseData = await response.json();
      
      if (responseData.status === 'success') {
        images = responseData.data.map(img => ({
          id_image: img.name_without_ext, // Gunakan nama file tanpa ekstensi sebagai ID
          image_name: img.name_without_ext,
          image_path: img.path,
          image_url: img.url,
          product_name: brand
        }));
        localStorage.setItem('cachedImages', JSON.stringify(images));
      } else if (Array.isArray(responseData)) {
        // Handle case where API returns array directly
        images = responseData.map(img => ({
          id_image: img.name_without_ext || img.name || extractFilenameFromPath(img.path),
          image_name: img.name_without_ext || img.name || extractFilenameFromPath(img.path),
          image_path: img.path,
          image_url: img.url,
          product_name: brand
        }));
        localStorage.setItem('cachedImages', JSON.stringify(images));
      } else {
        console.error('Error fetching images:', responseData.message || 'Unknown error');
        images = [];
      }
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
    showNotification('Gagal memuat data gambar. Silakan coba lagi.', 'error');
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
  
  // Jika sudah berupa URL, kembalikan langsung
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Normalize path separators
  let normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Extract brand and filename information
  let brand = 'Marsoto'; // Default brand
  let filename = '';
  
  // Handle different path formats:
  // 1. Full path: D:/assets/database_images/Marsoto/DUBAIHM0045.jpg
  // 2. Relative path: Marsoto/DUBAIHM0045.jpg
  // 3. Just filename: DUBAIHM0045.jpg
  
  // Try to extract brand from path
  const pathParts = normalizedPath.split('/');
  const brandFolders = ['Marsoto', 'MNK'];
  let brandIndex = -1;
  
  for (let i = 0; i < pathParts.length; i++) {
    if (brandFolders.includes(pathParts[i])) {
      brand = pathParts[i];
      brandIndex = i;
      break;
    }
  }
  
  // Extract filename
  filename = pathParts[pathParts.length - 1];
  
  // Determine subdirectory based on filename pattern
  let subdir = '';
  if (filename.match(/^HM/i)) {
    subdir = 'BATIK';
  } else if (filename.match(/^(DUBAI|TURKI|INDIA)/i)) {
    subdir = 'DUBAI';
  } else {
    // Default subdir based on brand
    subdir = brand === 'Marsoto' ? 'DUBAI' : '';
  }
  
  // Create URL using the new API endpoint format
  const finalUrl = `http://100.124.58.32:5000/api/images/path/${brand}/${subdir}/${filename}`;
  console.log('Generated URL with new API endpoint:', finalUrl);
  return finalUrl;
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
    let imageUrl = image.image_url || getImageUrl(image.image_path);
    
    // Jika URL masih kosong, buat URL berdasarkan pola nama file
    if (!imageUrl || imageUrl === '') {
      const brand = searchInput.dataset.brand || 'Marsoto';
      const subdir = filename.startsWith('HM') ? 'BATIK' : 'DUBAI';
      imageUrl = `http://100.124.58.32:5000/static/images/${brand}/${filename}`;
    }
    
    const resultItem = document.createElement('div');
    resultItem.className = 'search-result-item';
    resultItem.innerHTML = `
      <span class="result-filename">${filename}</span>
      <button type="button" class="select-result-btn" onclick="selectImageFromSearch('${image.id_image}', '${filename}', '${imageUrl}', ${itemId})">Pilih</button>
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
    // Pastikan URL gambar valid
    let finalImageUrl = imageUrl;
    if (!finalImageUrl || finalImageUrl === '') {
      // Jika URL tidak ada, buat URL berdasarkan endpoint API
      const brand = document.querySelector(`#item-${itemId} .image-brand-btn.active`)?.dataset.brand || 'Marsoto';
      const subdir = imageName.startsWith('HM') ? 'BATIK' : 'DUBAI'; // Asumsi berdasarkan pola nama file
      finalImageUrl = `http://100.124.58.32:5000/api/images/${brand}/${subdir}/${imageName}`;
    }
    
    // Pastikan URL menggunakan IP yang benar, bukan localhost
    if (finalImageUrl.includes('localhost')) {
      finalImageUrl = finalImageUrl.replace('localhost', '100.124.58.32');
    }
    
    imageThumbnail.innerHTML = `
      <div class="image-preview-container">
        <div class="image-loading-spinner" style="display: block;">
          <div class="spinner"></div>
          <span>Memuat gambar...</span>
        </div>
        <img src="${finalImageUrl}" alt="${imageName}" class="preview-image" style="display: none;" 
             onload="this.style.display='block'; this.parentElement.querySelector('.image-loading-spinner').style.display='none';" 
             onerror="this.style.display='none'; this.parentElement.querySelector('.image-loading-spinner').style.display='none'; this.parentElement.querySelector('.image-error').style.display='block';">
        <div class="image-error" style="display: none;">Gambar tidak dapat dimuat</div>
        <div class="image-info">
          <span class="image-id">ID: ${imageId}</span>
          <span class="image-name">${imageName}</span>
        </div>
        <button type="button" class="preview-fullsize-btn" onclick="showFullSizePreview('${finalImageUrl}', '${imageName}', '${imageId}')">Lihat Ukuran Penuh</button>
      </div>
    `;
  }
  
  // Hide search container
  const searchContainer = document.getElementById(`image_search_container_${itemId}`);
  if (searchContainer) {
    searchContainer.style.display = 'none';
  }
  
  // Tampilkan notifikasi sukses
  showNotification(`Gambar ${imageName} (ID: ${imageId}) berhasil dipilih`, 'success');
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
  if (imageThumbnail) {
    // Pastikan URL gambar valid
    let imageUrl = '';
    
    if (imagePathOrUrl) {
      // Check if it's already a URL or needs conversion
      imageUrl = imagePathOrUrl.startsWith('http') ? imagePathOrUrl : getImageUrl(imagePathOrUrl);
    } else {
      // Jika URL tidak ada, buat URL berdasarkan endpoint API
      const brand = document.querySelector(`#item-${itemId} .image-brand-btn.active`)?.dataset.brand || 'Marsoto';
      const subdir = imageName.startsWith('HM') ? 'BATIK' : 'DUBAI'; // Asumsi berdasarkan pola nama file
      imageUrl = `http://100.124.58.32:5000/api/images/${brand}/${subdir}/${imageName}`;
    }
    
    imageThumbnail.innerHTML = `
      <div class="image-preview-container">
        <div class="image-loading-spinner" style="display: block;">
          <div class="spinner"></div>
          <span>Memuat gambar...</span>
        </div>
        <img src="${imageUrl}" alt="${imageName}" class="preview-image" style="display: none;" 
             onload="this.style.display='block'; this.parentElement.querySelector('.image-loading-spinner').style.display='none';" 
             onerror="this.style.display='none'; this.parentElement.querySelector('.image-loading-spinner').style.display='none'; this.parentElement.querySelector('.image-error').style.display='block';">
        <div class="image-error" style="display: none;">Gambar tidak dapat dimuat</div>
        <div class="image-info">
          <span class="image-id">ID: ${imageId}</span>
          <span class="image-name">${imageName}</span>
        </div>
        <button type="button" class="preview-fullsize-btn" onclick="showFullSizePreview('${imageUrl}', '${imageName}', '${imageId}')">Lihat Ukuran Penuh</button>
      </div>
    `;
  }
  
  showNotification(`Gambar ${imageName} berhasil dipilih`, 'success');
};

// Fungsi closeImagePopup dan showMotifImages tidak lagi digunakan
// telah digantikan dengan fitur pencarian inline

// Tambahkan CSS untuk indikator loading dan preview gambar
const styleElement = document.createElement('style');
styleElement.textContent = `
  .image-preview-container {
    position: relative;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    background-color: #f9f9f9;
  }
  
  .preview-image {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: contain;
    margin-bottom: 10px;
  }
  
  .image-info {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 0.8rem;
    color: #666;
  }
  
  .preview-fullsize-btn {
    display: block;
    width: 100%;
    padding: 8px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    font-size: 0.9rem;
  }
  
  .preview-fullsize-btn:hover {
    background-color: #45a049;
  }
  
  .fullsize-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .fullsize-preview-content {
    position: relative;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
  }
  
  .close-preview {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    cursor: pointer;
    color: #333;
  }
  
  .fullsize-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }
  
  .fullsize-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }
  
  .image-details {
    margin-top: 15px;
    width: 100%;
    font-size: 0.9rem;
  }
  
  .image-loading-spinner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 3px solid #3498db;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .image-error {
    color: #d9534f;
    font-size: 0.8rem;
    text-align: center;
  }
`;
document.head.appendChild(styleElement);

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
  // Pastikan URL menggunakan IP yang benar, bukan localhost
  if (imageUrl.includes('localhost')) {
    imageUrl = imageUrl.replace('localhost', '100.124.58.32');
  }
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'fullsize-preview-modal';
  modal.innerHTML = `
    <div class="fullsize-preview-content">
      <span class="close-preview" onclick="closeFullSizePreview()">&times;</span>
      <h3>${imageName} (ID: ${imageId})</h3>
      <div class="fullsize-image-container">
        <div class="image-loading-spinner" style="display: block;">
          <div class="spinner"></div>
          <span>Memuat gambar...</span>
        </div>
        <img src="${imageUrl}" alt="${imageName}" class="fullsize-image" style="display: none;" 
             onload="this.style.display='block'; this.parentElement.querySelector('.image-loading-spinner').style.display='none';" 
             onerror="this.style.display='none'; this.parentElement.querySelector('.image-loading-spinner').style.display='none'; this.parentElement.querySelector('.image-error').style.display='block';">
        <div class="image-error" style="display: none;">Gambar tidak dapat dimuat</div>
        <div class="image-details">
          <p><strong>ID:</strong> ${imageId}</p>
          <p><strong>Nama:</strong> ${imageName}</p>
          <p><strong>URL:</strong> <a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to document
  document.body.appendChild(modal);
  
  // Show modal with animation
  setTimeout(() => {
    modal.style.opacity = '1';
  }, 10);
  
  // Store modal reference for cleanup
  window.currentImageModal = modal;
  
  // Event listener untuk menutup modal jika klik di luar konten
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeFullSizePreview();
    }
  });
};

// Fungsi untuk menutup preview ukuran penuh
window.closeFullSizePreview = function() {
  const modal = window.currentImageModal;
  if (modal) {
    modal.style.opacity = '0';
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