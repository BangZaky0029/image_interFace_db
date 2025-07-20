/**
 * Print.js - Handles print table functionality
 * Provides data fetching, display, and search for print data
 */

// Import functions from endpoint.js and listItem.js
import { fetchPrint, baseURL, showNotification } from '../../config/endpoint.js';
// Initialize the print table
window.initPrintTable = function() {
  console.log('Initializing print table...');
  
  // Store this function in the global scope for reuse
  window.initPrintTable = initPrintTable;
  
  // Elements
  const printTableBody = document.getElementById('printTableBody');
  const searchInput = document.getElementById('searchInput');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const noDataMessage = document.getElementById('noDataMessage');
  const noResultsMessage = document.getElementById('noResultsMessage');
  const messageContainer = document.getElementById('messageContainer');
  
  // Store all print data for filtering
  let allPrints = [];
  
  // Load print data
  loadPrints();
  
  // Add event listener for search input
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Function to load prints
  async function loadPrints() {
    try {
      // Show loading indicator
      showLoading(true);
      
      // Fetch print data
      allPrints = await fetchPrint();
      
      // Render print table
      renderPrintTable(allPrints);
      
      // Hide loading indicator
      showLoading(false);
      
      // Show no data message if no prints
      if (allPrints.length === 0) {
        noDataMessage.style.display = 'block';
      } else {
        noDataMessage.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading prints:', error);
      showLoading(false);
      showMessage(`Gagal memuat data print: ${error.message}`, 'error');
    }
  }
  
  // Function to render print table
  function renderPrintTable(prints) {
    // Clear table body
    if (printTableBody) {
      printTableBody.innerHTML = '';
    }
    
    // Check if there are prints to display
    if (!prints || prints.length === 0) {
      return;
    }
    
    // Create table rows
    prints.forEach(print => {
      const row = document.createElement('tr');
      
      // Format date
      const timestamp = print.timestamp ? new Date(print.timestamp).toLocaleString('id-ID') : '-';
      
      // Get status badge class
      const statusBadgeClass = getStatusBadgeClass(print.status);
      
      // Create row HTML
      row.innerHTML = `
        <td>${print.id_print || '-'}</td>
        <td>${print.id_order_detail || '-'}</td>
        <td>${print.print_image_path || '-'}</td>
        <td><span class="badge ${statusBadgeClass}">${print.status || '-'}</span></td>
        <td>${timestamp}</td>
        <td>
          <i class="fas fa-eye action-icon detail" onclick="viewPrintDetail('${print.id_print}')" title="Lihat Detail"></i>
        </td>
      `;
      
      // Append row to table body
      printTableBody.appendChild(row);
    });
  }
  
  // Function to handle search
  function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    // Filter prints based on search term
    const filteredPrints = allPrints.filter(print => {
      return (
        (print.id_print && print.id_print.toLowerCase().includes(searchTerm)) ||
        (print.id_order_detail && print.id_order_detail.toLowerCase().includes(searchTerm)) ||
        (print.print_image_path && print.print_image_path.toLowerCase().includes(searchTerm)) ||
        (print.status && print.status.toLowerCase().includes(searchTerm))
      );
    });
    
    // Render filtered prints
    renderPrintTable(filteredPrints);
    
    // Show/hide no results message
    if (filteredPrints.length === 0 && allPrints.length > 0) {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none';
    }
  }
  
  // Function to get status badge class
  function getStatusBadgeClass(status) {
    if (!status) return 'badge-secondary';
    
    switch (status.toLowerCase()) {
      case 'belum_diprint':
        return 'badge-warning';
      case 'sedang_diprint':
        return 'badge-info';
      case 'selesai':
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  }
  
  // Function to show/hide loading indicator
  function showLoading(show) {
    if (loadingIndicator) {
      loadingIndicator.style.display = show ? 'flex' : 'none';
    }
  }
  
  // Function to show message
  function showMessage(message, type = 'info') {
    if (!messageContainer) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // Clear previous messages
    messageContainer.innerHTML = '';
    
    // Append message
    messageContainer.appendChild(messageElement);
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      messageElement.classList.add('fade-out');
      setTimeout(() => {
        messageContainer.removeChild(messageElement);
      }, 500);
    }, 5000);
  }
}

// Define global functions for print detail and deletion
window.viewPrintDetail = function(printId) {
  console.log(`Viewing print detail for ID: ${printId}`);
  // Implement print detail view functionality
  // This could navigate to a detail page or show a modal
  alert(`Detail print untuk ID: ${printId} akan ditampilkan di sini.`);
};

window.deletePrint = function(printId) {
  console.log(`Deleting print with ID: ${printId}`);
  // Implement print deletion functionality
  if (confirm(`Apakah Anda yakin ingin menghapus print dengan ID: ${printId}?`)) {
    // Call delete API endpoint
    fetch(`${baseURL}/print/${printId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      showNotification('Print berhasil dihapus', 'success');
      // Reload print table
      if (typeof window.initPrintTable === 'function') {
        window.initPrintTable();
      }
    })
    .catch(error => {
      console.error('Error deleting print:', error);
      showNotification(`Gagal menghapus print: ${error.message}`, 'error');
    });
  }
};