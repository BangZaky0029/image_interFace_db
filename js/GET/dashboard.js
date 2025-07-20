/**
 * Dashboard.js - Handles dashboard functionality
 * Provides data visualization and summary for the application
 */

// Import endpoint configuration
const loadEndpointConfig = () => {
  return new Promise((resolve, reject) => {
    // Determine the current host and port
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const host = urlObj.hostname;
    const port = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
    
    // Use the API server port (5000) for endpoint.js
    const apiPort = '5000';
    const apiHost = host;
    
    console.log(`Current URL: ${currentUrl}, Using API host: ${apiHost}, API port: ${apiPort}`);
    
    // Define baseURL directly instead of loading from endpoint.js
    window.baseURL = `http://${apiHost}:${apiPort}`;
    console.log(`Setting baseURL directly: ${window.baseURL}`);
    
    // Still load the endpoint.js for compatibility
    const script = document.createElement('script');
    script.src = `http://${apiHost}:${apiPort}/config/endpoint.js`;
    script.id = 'endpoint-config';
    script.onload = () => {
      console.log('Endpoint configuration loaded');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Failed to load endpoint configuration:', error);
      // Even if endpoint.js fails to load, we've already set baseURL
      console.log('Using fallback baseURL:', window.baseURL);
      resolve();
    };
    document.head.appendChild(script);
  });
};

// Import dashboard CSS
const loadDashboardCSS = () => {
  // Use baseURL if available, otherwise construct it
  let cssBaseUrl;
  
  if (window.baseURL) {
    cssBaseUrl = window.baseURL;
  } else {
    // Determine the current host and port
    const currentUrl = window.location.href;
    const urlObj = new URL(currentUrl);
    const host = urlObj.hostname;
    
    // Use the API server port (5000) for CSS
    const apiPort = '5000';
    cssBaseUrl = `http://${host}:${apiPort}`;
  }
  
  console.log(`Loading dashboard CSS from: ${cssBaseUrl}/style/style_view/dashboard.css`);
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `${cssBaseUrl}/style/style_view/dashboard.css`;
  link.id = 'dashboard-css';
  document.head.appendChild(link);
  console.log('Dashboard CSS loaded');
};

// Global variables to track dashboard components
let dashboardInterval = null;
let chartInstances = [];

/**
 * Initialize the dashboard
 * This function is called when the dashboard page is loaded
 */
async function initDashboard() {
  console.log('Initializing dashboard...');
  
  try {
    // Load dashboard CSS
    loadDashboardCSS();
    
    // Get the dashboard placeholder
    const dashboardPlaceholder = document.getElementById('dashboard-placeholder');
    if (!dashboardPlaceholder) {
      console.error('Dashboard placeholder not found. Creating a new container.');
      // Create a new container if placeholder doesn't exist
      const mainContent = document.getElementById('mainContent');
      if (mainContent) {
        const newPlaceholder = document.createElement('div');
        newPlaceholder.id = 'dashboard-placeholder';
        mainContent.appendChild(newPlaceholder);
        newPlaceholder.innerHTML = createDashboardHTML();
      } else {
        throw new Error('Main content container not found. Cannot initialize dashboard.');
      }
    } else {
      // Replace loading spinner with dashboard content
      dashboardPlaceholder.innerHTML = createDashboardHTML();
    }
    
    // Show loading message
    showMessage('Memuat konfigurasi endpoint...', 'info');
    
    // Load endpoint configuration first
    await loadEndpointConfig();
    console.log('Endpoint configuration loaded successfully, baseURL:', window.baseURL || baseURL);
    
    // Show loading message
    showMessage('Memuat data dashboard...', 'info');
    
    // Load dashboard data after endpoint is loaded
    await loadDashboardData();
    
    // Set up refresh interval (every 30 seconds)
    dashboardInterval = setInterval(loadDashboardData, 30000);
    
    // Show success message
    showMessage('Dashboard berhasil dimuat', 'success');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showMessage(`Error: ${error.message}`, 'error');
  }
}

/**
 * Clean up dashboard resources when navigating away
 */
function cleanupDashboard() {
  console.log('Cleaning up dashboard...');
  
  // Clear the refresh interval
  if (dashboardInterval) {
    clearInterval(dashboardInterval);
    dashboardInterval = null;
  }
  
  // Remove dashboard CSS
  const dashboardCSS = document.getElementById('dashboard-css');
  if (dashboardCSS) {
    dashboardCSS.remove();
  }
  
  // Remove endpoint configuration script
  const endpointConfig = document.getElementById('endpoint-config');
  if (endpointConfig) {
    endpointConfig.remove();
  }
  
  // Clean up any chart instances
  chartInstances.forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  chartInstances = [];
}

/**
 * Creates the HTML structure for the dashboard
 * @returns {string} HTML content for the dashboard
 */
function createDashboardHTML() {
  return `
    <div class="dashboard-container">
      <h2>Dashboard</h2>
      
      <div class="dashboard-message" id="dashboardMessage"></div>
      
      <div class="dashboard-stats">
        <div class="stat-card" id="totalOrders">
          <h3>Total Pesanan</h3>
          <p class="stat-value">-</p>
        </div>
        <div class="stat-card" id="pendingOrders">
          <h3>Pesanan Tertunda</h3>
          <p class="stat-value">-</p>
        </div>
        <div class="stat-card" id="completedOrders">
          <h3>Pesanan Selesai</h3>
          <p class="stat-value">-</p>
        </div>
      </div>
      
      <div class="dashboard-charts">
        <div class="chart-container">
          <h3>Status Pesanan</h3>
          <div id="statusChart" class="chart">Loading chart...</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Loads data for the dashboard from the API
 * @returns {Promise} A promise that resolves when data is loaded
 */
async function loadDashboardData() {
  try {
    // Show loading message
    showMessage('Memuat data dashboard...', 'info');
    
    // Check if baseURL is defined, use window.baseURL as fallback
    let apiBaseUrl;
    if (typeof baseURL !== 'undefined') {
      apiBaseUrl = baseURL;
    } else if (typeof window.baseURL !== 'undefined') {
      apiBaseUrl = window.baseURL;
    } else {
      throw new Error('API endpoint URL is not defined. Please reload the page.');
    }
    
    console.log(`Using API endpoint: ${apiBaseUrl}/orders`);
    
    // Fetch orders data from API
    const response = await fetch(`${apiBaseUrl}/orders`);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    console.log(`Received ${data.length} orders from API`);
    
    // Process data for dashboard
    updateDashboardStats(data);
    
    // Clear loading message using the improved showMessage function
    showMessage('', 'info'); // Empty message to clear
    
    return data; // Return data for promise chaining
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showMessage(`Error: ${error.message}`, 'error');
    throw error; // Re-throw for promise chaining
  }
}

/**
 * Updates the dashboard statistics based on the data
 * @param {Array} data - The orders data from API
 */
function updateDashboardStats(data) {
  // Calculate statistics
  const totalOrders = data.length;
  const pendingOrders = data.filter(order => order.status_print !== 'Selesai').length;
  const completedOrders = data.filter(order => order.status_print === 'Selesai').length;
  
  // Update the UI
  const totalOrdersElement = document.querySelector('#totalOrders .stat-value');
  const pendingOrdersElement = document.querySelector('#pendingOrders .stat-value');
  const completedOrdersElement = document.querySelector('#completedOrders .stat-value');
  
  // Check if elements exist before updating content
  if (totalOrdersElement) totalOrdersElement.textContent = totalOrders;
  if (pendingOrdersElement) pendingOrdersElement.textContent = pendingOrders;
  if (completedOrdersElement) completedOrdersElement.textContent = completedOrders;
  
  // Log warning if elements are not found
  if (!totalOrdersElement || !pendingOrdersElement || !completedOrdersElement) {
    console.warn('Some dashboard stat elements were not found in the DOM. Check if dashboard HTML is properly loaded.');
  }
  
  // Update charts (simplified version without actual chart library)
  const chartElement = document.getElementById('statusChart');
  if (chartElement) {
    // Avoid division by zero if there are no orders
    const completedWidth = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0;
    const pendingWidth = totalOrders > 0 ? (pendingOrders / totalOrders * 100) : 0;
    
    chartElement.innerHTML = `
      <div class="simple-chart">
        <div class="chart-bar" style="width: ${completedWidth}%;">Selesai (${completedOrders})</div>
        <div class="chart-bar pending" style="width: ${pendingWidth}%;">Tertunda (${pendingOrders})</div>
      </div>
    `;
  } else {
    console.warn('Status chart element not found in the DOM. Check if dashboard HTML is properly loaded.');
  }
}

/**
 * Shows a message in the dashboard
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info)
 */
function showMessage(message, type = 'info') {
  let messageElement = document.getElementById('dashboardMessage');
  
  // If message element doesn't exist, try to find dashboard container and create message element
  if (!messageElement) {
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
      // Create message element if dashboard container exists
      messageElement = document.createElement('div');
      messageElement.id = 'dashboardMessage';
      messageElement.className = 'dashboard-message';
      
      // Insert at the beginning of dashboard container
      if (dashboardContainer.firstChild) {
        dashboardContainer.insertBefore(messageElement, dashboardContainer.firstChild);
      } else {
        dashboardContainer.appendChild(messageElement);
      }
    } else {
      console.warn('Cannot show message: Dashboard container not found');
      return;
    }
  }
  
  messageElement.innerHTML = `<div class="message message-${type}">${message}</div>`;
  
  // Clear message after 5 seconds for success messages
  if (type === 'success') {
    setTimeout(() => {
      if (messageElement) { // Check if element still exists
        messageElement.innerHTML = '';
      }
    }, 5000);
  }
}

// Export functions for use in index.html
window.initDashboard = initDashboard;
window.cleanupDashboard = cleanupDashboard;