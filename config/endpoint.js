// Ganti baseURL ini sesuai domain/server lo nanti
const baseURL = 'http://100.124.58.32:5000';
// const baseURL = 'http://localhost:5000'; // Jangan gunakan localhost
// const baseURL = 'http://100.124.58.32:5000';
// const baseURL = 'http://192.168.0.95:5000';

// Daftar IP alternatif yang bisa digunakan
const alternativeURLs = [
  'http://127.0.0.1:5000',
  'http://100.124.58.32:5000',
  'http://192.168.0.95:5000',
  'http://100.126.94.51:5000'
];

// Fungsi untuk mencoba URL alternatif
const tryAlternativeURL = (failedURL) => {
  console.log(`URL ${failedURL} gagal, mencoba alternatif...`);
  const currentIndex = alternativeURLs.indexOf(failedURL);
  const nextIndex = (currentIndex + 1) % alternativeURLs.length;
  return alternativeURLs[nextIndex];
};

// Fungsi fetch dengan fallback ke URL alternatif
async function fetchWithFallback(endpoint, options = {}) {
  let currentURL = baseURL;
  let attempts = 0;
  const maxAttempts = alternativeURLs.length;
  
  while (attempts < maxAttempts) {
    try {
      const fullURL = endpoint.startsWith('http') ? endpoint : `${currentURL}${endpoint}`;
      console.log(`Mencoba fetch dari: ${fullURL}`);
      
      const response = await fetch(fullURL, options);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`Error fetching from ${currentURL}: ${error.message}`);
      attempts++;
      
      if (attempts < maxAttempts) {
        currentURL = tryAlternativeURL(currentURL);
        console.log(`Mencoba dengan URL alternatif: ${currentURL}`);
      } else {
        console.error('Semua URL alternatif gagal');
        throw error;
      }
    }
  }
}

// Fungsi untuk menampilkan notifikasi
const showNotification = (message, type = 'info') => {
  // Cek apakah fungsi showMessage tersedia (dari file lain)
  if (typeof showMessage === 'function') {
    showMessage(message, type);
    return;
  }
  
  // Jika tidak ada fungsi showMessage, buat notifikasi sendiri
  // Cek apakah container notifikasi sudah ada
  let notifContainer = document.getElementById('notificationContainer');
  
  if (!notifContainer) {
    // Buat container notifikasi jika belum ada
    notifContainer = document.createElement('div');
    notifContainer.id = 'notificationContainer';
    notifContainer.style.position = 'fixed';
    notifContainer.style.top = '20px';
    notifContainer.style.right = '20px';
    notifContainer.style.zIndex = '9999';
    document.body.appendChild(notifContainer);
  }
  
  // Buat elemen notifikasi
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.padding = '10px 15px';
  notification.style.margin = '5px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  notification.style.transition = 'all 0.3s ease';
  
  // Set warna berdasarkan tipe notifikasi
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#F44336';
    notification.style.color = 'white';
  } else if (type === 'warning') {
    notification.style.backgroundColor = '#FF9800';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = '#2196F3';
    notification.style.color = 'white';
  }
  
  // Tambahkan notifikasi ke container
  notifContainer.appendChild(notification);
  
  // Hapus notifikasi setelah 5 detik
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      notifContainer.removeChild(notification);
    }, 300);
  }, 5000);
};


// Fungsi untuk mengambil data admin
const fetchAdmin = async () => {
  try {
    const response = await fetchWithFallback('/admin');
    const data = await response.json();
    showNotification('Data admin berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching admin data:', error);
    showNotification(`Gagal memuat data admin: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data gambar
const fetchImages = async () => {
  try {
    const response = await fetchWithFallback('/images');
    const data = await response.json();
    showNotification('Data gambar berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching images data:', error);
    showNotification(`Gagal memuat data gambar: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data motif
const fetchMotif = async () => {
  try {
    const response = await fetchWithFallback('/motif');
    const data = await response.json();
    showNotification('Data motif berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching motif data:', error);
    showNotification(`Gagal memuat data motif: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data detail pesanan
const fetchOrderDetail = async () => {
  try {
    const response = await fetchWithFallback('/order_detail');
    const data = await response.json();
    showNotification('Data detail pesanan berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching order detail data:', error);
    showNotification(`Gagal memuat data detail pesanan: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data pesanan
const fetchOrders = async () => {
  try {
    const response = await fetchWithFallback('/orders');
    const data = await response.json();
    showNotification('Data pesanan berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching orders data:', error);
    showNotification(`Gagal memuat data pesanan: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data print
const fetchPrint = async () => {
  try {
    const response = await fetchWithFallback('/print');
    const data = await response.json();
    showNotification('Data print berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching print data:', error);
    showNotification(`Gagal memuat data print: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data produk
const fetchProducts = async () => {
  try {
    const response = await fetchWithFallback('/products');
    const data = await response.json();
    showNotification('Data produk berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching products data:', error);
    showNotification(`Gagal memuat data produk: ${error.message}`, 'error');
    throw error;
  }
};

// Fungsi untuk mengambil data ukuran
const fetchSizes = async () => {
  try {
    const response = await fetchWithFallback('/sizes');
    const data = await response.json();
    showNotification('Data ukuran berhasil dimuat', 'success');
    return data;
  } catch (error) {
    console.error('Error fetching sizes data:', error);
    showNotification(`Gagal memuat data ukuran: ${error.message}`, 'error');
    throw error;
  }
};

// Export semua fungsi fetch dan notifikasi
export {
  baseURL,
  showNotification,
  fetchAdmin,
  fetchImages,
  fetchMotif,
  fetchOrderDetail,
  fetchOrders,
  fetchPrint,
  fetchProducts,
  fetchSizes,
  fetchWithFallback,
  tryAlternativeURL,
  alternativeURLs
};
