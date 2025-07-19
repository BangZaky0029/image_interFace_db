/**
 * Orders.js - Handles orders table functionality
 * Provides data fetching, display, and search for orders
 */

// Import fetchOrders function from endpoint.js
import { fetchOrders, baseURL, showNotification } from '../../config/endpoint.js';
// Import fungsi untuk konversi ID admin ke nama
import { getAdminNameById } from '../../config/listItem.js';

// Initialize the orders table
window.initOrdersTable = function() {
  console.log('Initializing orders table...');
  
  // Store this function in the global scope for reuse
  window.initOrdersTable = initOrdersTable;
  
  // Elements
  const ordersTableBody = document.getElementById('ordersTableBody');
  const searchInput = document.getElementById('searchInput');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const noDataMessage = document.getElementById('noDataMessage');
  const noResultsMessage = document.getElementById('noResultsMessage');
  const messageContainer = document.getElementById('messageContainer');
  
  // Store all orders data for filtering
  let allOrders = [];
  
  // Load orders data
  loadOrders();
  
  // Add event listener for search input
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Function to load orders
  async function loadOrders() {
    try {
      // Show loading indicator
      showLoading(true);
      
      // Fetch orders data
      allOrders = await fetchOrders();
      
      // Render orders table
      renderOrdersTable(allOrders);
      
      // Hide loading indicator
      showLoading(false);
      
      // Show no data message if no orders
      if (allOrders.length === 0) {
        noDataMessage.style.display = 'block';
      } else {
        noDataMessage.style.display = 'none';
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showLoading(false);
      showMessage(`Gagal memuat data pesanan: ${error.message}`, 'error');
    }
  }
  
  // Function to render orders table
  function renderOrdersTable(orders) {
    // Clear table body
    if (ordersTableBody) {
      ordersTableBody.innerHTML = '';
    }
    
    // Check if there are orders to display
    if (!orders || orders.length === 0) {
      return;
    }
    
    // Create table rows
    orders.forEach(order => {
      const row = document.createElement('tr');
      
      // Format date
      const deadline = order.deadline ? new Date(order.deadline).toLocaleDateString('id-ID') : '-';
      const timestamp = order.timestamp ? new Date(order.timestamp).toLocaleString('id-ID') : '-';
      
      // Get status badge class
      const statusBadgeClass = getStatusBadgeClass(order.status_print);
      
      // Get admin name from ID
      const adminName = getAdminNameById(order.id_admin);
      
      // Create row HTML
      row.innerHTML = `
        <td>${order.id_order || '-'}</td>
        <td>${adminName}</td>
        <td>${order.platform || '-'}</td>
        <td>${order.nama_customer || '-'}</td>
        <td>${deadline}</td>
        <td><span class="badge ${statusBadgeClass}">${order.status_print || '-'}</span></td>
        <td>${timestamp}</td>
        <td>
          <i class="fas fa-eye action-icon detail" onclick="viewOrderDetail('${order.id_order}')" title="Lihat Detail"></i>
          <i class="fas fa-trash-alt action-icon delete" onclick="deleteOrder('${order.id_order}')" title="Hapus"></i>
        </td>
      `;
      
      // Append row to table body
      ordersTableBody.appendChild(row);
    });
  }
  
  // Function to handle search
  function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    // Filter orders based on search term
    const filteredOrders = allOrders.filter(order => {
      return (
        (order.id_order && order.id_order.toLowerCase().includes(searchTerm)) ||
        (order.platform && order.platform.toLowerCase().includes(searchTerm)) ||
        (order.nama_customer && order.nama_customer.toLowerCase().includes(searchTerm)) ||
        (order.status_print && order.status_print.toLowerCase().includes(searchTerm))
      );
    });
    
    // Render filtered orders
    renderOrdersTable(filteredOrders);
    
    // Show/hide no results message
    if (filteredOrders.length === 0 && allOrders.length > 0) {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none';
    }
  }
  
  // Function to get status badge class
  function getStatusBadgeClass(status) {
    if (!status) return 'badge-secondary';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-warning';
      case 'printed':
        return 'badge-success';
      case 'cancelled':
        return 'badge-danger';
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

// Function to view order detail
// Make sure we don't override the function from order_detail.js
if (!window.viewOrderDetail) {
  window.viewOrderDetail = function(orderId) {
    console.log(`Viewing order detail for ID: ${orderId}`);
    // Implement order detail view functionality
    // This could navigate to a detail page or show a modal
    alert(`Detail pesanan untuk ID: ${orderId} akan ditampilkan di sini.`);
  };
}

// Function to delete order
window.deleteOrder = function(orderId) {
  console.log(`Deleting order with ID: ${orderId}`);
  // Implement order deletion functionality
  if (confirm(`Apakah Anda yakin ingin menghapus pesanan dengan ID: ${orderId}?`)) {
    // Call delete API endpoint
    fetch(`${baseURL}/api/order/delete/${orderId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      showNotification('Pesanan berhasil dihapus', 'success');
      // Reload orders table
      if (typeof initOrdersTable === 'function') {
        initOrdersTable();
      }
    })
    .catch(error => {
      console.error('Error deleting order:', error);
      showNotification(`Gagal menghapus pesanan: ${error.message}`, 'error');
    });
  }
}