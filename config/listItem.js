// config/listItem.js

// Data admin dari database
const adminList = [
  { id_admin: 1, nama: 'Vinka' },
  { id_admin: 2, nama: 'Ikbal' },
  { id_admin: 3, nama: 'Untung' }
];

/**
 * Mendapatkan nama admin berdasarkan ID admin
 * @param {number|string} idAdmin - ID admin yang akan dicari
 * @returns {string} - Nama admin atau ID admin jika tidak ditemukan
 */
export function getAdminNameById(idAdmin) {
  // Pastikan idAdmin adalah number untuk perbandingan
  const id = parseInt(idAdmin);
  
  // Cari admin berdasarkan ID
  const admin = adminList.find(admin => admin.id_admin === id);
  
  // Kembalikan nama admin jika ditemukan, atau ID admin jika tidak ditemukan
  return admin ? admin.nama : idAdmin;
}

/**
 * Mengisi dropdown admin dengan data dari adminList
 * @param {string} selectElementId - ID elemen select yang akan diisi
 * @param {number|string} [selectedId] - ID admin yang akan dipilih (opsional)
 */
export function populateAdminDropdown(selectElementId, selectedId = null) {
  const selectElement = document.getElementById(selectElementId);
  
  // Pastikan elemen select ditemukan
  if (!selectElement) {
    console.error(`Element with ID ${selectElementId} not found`);
    return;
  }
  
  // Kosongkan dropdown terlebih dahulu
  selectElement.innerHTML = '';
  
  // Tambahkan opsi default jika diperlukan
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Pilih Admin --';
  selectElement.appendChild(defaultOption);
  
  // Tambahkan opsi untuk setiap admin
  adminList.forEach(admin => {
    const option = document.createElement('option');
    option.value = admin.id_admin;
    option.textContent = admin.nama;
    
    // Pilih opsi jika ID-nya cocok dengan selectedId
    if (selectedId && parseInt(selectedId) === admin.id_admin) {
      option.selected = true;
    }
    
    selectElement.appendChild(option);
  });
}

/**
 * Mengubah tampilan ID admin menjadi nama admin di tabel
 * @param {HTMLElement} tableElement - Elemen tabel yang akan diubah
 * @param {number} columnIndex - Indeks kolom yang berisi ID admin (dimulai dari 0)
 */
export function convertAdminIdsToNames(tableElement, columnIndex) {
  // Pastikan elemen tabel ditemukan
  if (!tableElement) {
    console.error('Table element not found');
    return;
  }
  
  // Dapatkan semua baris dalam tabel (kecuali header)
  const rows = tableElement.querySelectorAll('tbody tr');
  
  // Ubah ID admin menjadi nama admin di setiap baris
  rows.forEach(row => {
    const cell = row.cells[columnIndex];
    if (cell) {
      const idAdmin = cell.textContent.trim();
      if (idAdmin && idAdmin !== '-') {
        cell.textContent = getAdminNameById(idAdmin);
      }
    }
  });
}

/**
 * Mendapatkan daftar admin untuk digunakan di aplikasi
 * @returns {Array} - Daftar admin
 */
export function getAdminList() {
  return [...adminList];
}

/**
 * Mengambil data admin dari API dan memperbarui adminList
 * @param {string} apiUrl - URL API untuk mengambil data admin
 * @returns {Promise} - Promise yang diselesaikan ketika data berhasil diambil
 */
export async function fetchAdminList(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Perbarui adminList dengan data dari API
    // Asumsikan data API memiliki format yang sama dengan adminList
    // Jika tidak, sesuaikan mapping di bawah ini
    adminList.length = 0; // Kosongkan array
    data.forEach(item => {
      adminList.push({
        id_admin: item.id_admin,
        nama: item.nama
      });
    });
    
    return adminList;
  } catch (error) {
    console.error('Error fetching admin list:', error);
    throw error;
  }
}