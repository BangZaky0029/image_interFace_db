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
          <h3>Total Orderan</h3>
          <p class="stat-value">-</p>
        </div>
        <div class="stat-card" id="pendingOrders">
          <h3>Orderan Tertunda</h3>
          <p class="stat-value">-</p>
        </div>
        <div class="stat-card" id="completedOrders">
          <h3>Orderan Selesai</h3>
          <p class="stat-value">-</p>
        </div>
      </div>
      
      <div class="dashboard-charts">
        <div class="chart-container">
          <h3>Status Pesanan</h3>
          <div id="statusChart" class="chart">Loading chart...</div>
        </div>
        
        <div class="chart-container">
          <h3>Trafik Orderan</h3>
          <div class="traffic-filter">
            <button class="traffic-btn active" data-period="hari">Hari Ini</button>
            <button class="traffic-btn" data-period="minggu">Minggu Ini</button>
            <button class="traffic-btn" data-period="bulan">Bulan Ini</button>
            <button class="traffic-btn" data-period="tahun">Tahun Ini</button>
            <button class="traffic-btn" data-period="custom">Custom</button>
          </div>
          <div id="trafficChart" class="chart">Loading chart...</div>
          <div class="traffic-info">
            <div class="traffic-legend">
              <div class="legend-item">
                <div class="legend-color order-count"></div>
                <span>Jumlah Orderan</span>
              </div>
              <div class="legend-item">
                <div class="legend-color order-qty"></div>
                <span>Jumlah Qty (pcs)</span>
              </div>
            </div>
          </div>
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
  
  // Initialize traffic chart with default period (today)
  initTrafficChart(data, 'hari');
  
  // Add event listeners to traffic filter buttons
  setupTrafficFilterButtons(data);
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

/**
 * Sets up event listeners for traffic filter buttons
 * @param {Array} data - The orders data from API
 */
function setupTrafficFilterButtons(data) {
  const trafficButtons = document.querySelectorAll('.traffic-btn');
  if (trafficButtons.length === 0) {
    console.warn('Traffic filter buttons not found in the DOM.');
    return;
  }
  
  trafficButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      trafficButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Get period from data attribute
      const period = button.getAttribute('data-period');
      
      // Update traffic chart based on selected period
      initTrafficChart(data, period);
    });
  });
}

/**
 * Initializes the traffic chart based on the selected period
 * @param {Array} data - The orders data from API
 * @param {string} period - The selected period (hari, minggu, bulan, tahun, custom)
 */
function initTrafficChart(data, period) {
  const trafficChartElement = document.getElementById('trafficChart');
  if (!trafficChartElement) {
    console.warn('Traffic chart element not found in the DOM.');
    return;
  }
  
  // Process data based on selected period
  const { labels, orderCounts, orderQtys, timeLabel } = processTrafficData(data, period);
  
  // Create chart HTML
  let chartHTML = '<div class="traffic-chart-container">';
  
  // Add time label if available
  if (timeLabel) {
    chartHTML += `<div class="traffic-time-label">${timeLabel}</div>`;
  }
  
  // Create chart grid
  chartHTML += '<div class="traffic-chart-grid">';
  
  // Find max values for scaling
  const maxOrderCount = Math.max(...orderCounts, 1);
  const maxOrderQty = Math.max(...orderQtys, 1);
  
  // Create bars for each time point
  for (let i = 0; i < labels.length; i++) {
    const orderCountHeight = (orderCounts[i] / maxOrderCount) * 100;
    const orderQtyHeight = (orderQtys[i] / maxOrderQty) * 100;
    
    chartHTML += `
      <div class="traffic-chart-column">
        <div class="traffic-chart-bars">
          <div class="traffic-bar order-count" style="height: ${orderCountHeight}%" title="${orderCounts[i]} orderan"></div>
          <div class="traffic-bar order-qty" style="height: ${orderQtyHeight}%" title="${orderQtys[i]} pcs"></div>
        </div>
        <div class="traffic-chart-label">${labels[i]}</div>
      </div>
    `;
  }
  
  chartHTML += '</div>'; // Close chart grid
  
  // Add tooltip for current selection
  if (period === 'hari') {
    const currentHour = new Date().getHours();
    const currentIndex = labels.findIndex(label => parseInt(label) === currentHour);
    
    if (currentIndex !== -1) {
      chartHTML += `
        <div class="traffic-current-info">
          <div>Jam ${labels[currentIndex]}:00</div>
          <div>Jumlah: ${orderCounts[currentIndex]} orderan</div>
          <div>Total: ${orderQtys[currentIndex]} pcs</div>
        </div>
      `;
    }
  }
  
  chartHTML += '</div>'; // Close chart container
  
  // Update chart element
  trafficChartElement.innerHTML = chartHTML;
}

/**
 * Processes order data based on the selected period
 * @param {Array} data - The orders data from API
 * @param {string} period - The selected period (hari, minggu, bulan, tahun, custom)
 * @returns {Object} Processed data for the traffic chart
 */
function processTrafficData(data, period) {
  const now = new Date();
  let labels = [];
  let orderCounts = [];
  let orderQtys = [];
  let timeLabel = '';
  
  // Helper function to get total quantity from an order
  const getOrderQty = (order) => {
    // Assuming order.qty exists and is a number
    // If not, you may need to adjust this based on your data structure
    return order.qty ? parseInt(order.qty) : 1;
  };
  
  // Process data based on period
  switch (period) {
    case 'hari': // Today (hourly)
      timeLabel = `${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      
      // Create 24 hour labels (0-23)
      labels = Array.from({ length: 24 }, (_, i) => i.toString());
      
      // Initialize counts and qtys arrays with zeros
      orderCounts = new Array(24).fill(0);
      orderQtys = new Array(24).fill(0);
      
      // Filter orders for today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      const todayOrders = data.filter(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        return orderDate >= todayStart && orderDate < todayEnd;
      });
      
      // Count orders and sum quantities by hour
      todayOrders.forEach(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        const hour = orderDate.getHours();
        orderCounts[hour]++;
        orderQtys[hour] += getOrderQty(order);
      });
      break;
      
    case 'minggu': // This week (daily)
      // Get the first day of the week (Sunday or Monday depending on locale)
      const firstDayOfWeek = new Date(now);
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday as first day
      firstDayOfWeek.setDate(now.getDate() - diff);
      
      timeLabel = `Minggu ${firstDayOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      
      // Create 7 day labels (Mon-Sun)
      const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      labels = dayNames;
      
      // Initialize counts and qtys arrays with zeros
      orderCounts = new Array(7).fill(0);
      orderQtys = new Array(7).fill(0);
      
      // Filter orders for this week
      const weekStart = new Date(firstDayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(firstDayOfWeek);
      weekEnd.setDate(weekStart.getDate() + 7);
      weekEnd.setHours(0, 0, 0, 0);
      
      const weekOrders = data.filter(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        return orderDate >= weekStart && orderDate < weekEnd;
      });
      
      // Count orders and sum quantities by day
      weekOrders.forEach(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        let dayIndex = orderDate.getDay() - 1; // 0 = Monday, ..., 6 = Sunday
        if (dayIndex < 0) dayIndex = 6; // Sunday becomes index 6
        
        orderCounts[dayIndex]++;
        orderQtys[dayIndex] += getOrderQty(order);
      });
      break;
      
    case 'bulan': // This month (daily)
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      timeLabel = `${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
      
      // Create labels for each day of the month
      labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      
      // Initialize counts and qtys arrays with zeros
      orderCounts = new Array(daysInMonth).fill(0);
      orderQtys = new Array(daysInMonth).fill(0);
      
      // Filter orders for this month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const monthOrders = data.filter(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        return orderDate >= monthStart && orderDate < monthEnd;
      });
      
      // Count orders and sum quantities by day
      monthOrders.forEach(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        const day = orderDate.getDate() - 1; // 0-indexed
        orderCounts[day]++;
        orderQtys[day] += getOrderQty(order);
      });
      break;
      
    case 'tahun': // This year (monthly)
      timeLabel = `${now.getFullYear()}`;
      
      // Create labels for each month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      labels = monthNames;
      
      // Initialize counts and qtys arrays with zeros
      orderCounts = new Array(12).fill(0);
      orderQtys = new Array(12).fill(0);
      
      // Filter orders for this year
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
      
      const yearOrders = data.filter(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        return orderDate >= yearStart && orderDate < yearEnd;
      });
      
      // Count orders and sum quantities by month
      yearOrders.forEach(order => {
        const orderDate = new Date(order.created_at || order.date || order.timestamp || 0);
        const month = orderDate.getMonth();
        orderCounts[month]++;
        orderQtys[month] += getOrderQty(order);
      });
      break;
      
    case 'custom':
      // For custom period, we'll just show a placeholder for now
      // In a real implementation, you would show a date picker and process data accordingly
      timeLabel = 'Custom Period (Coming Soon)';
      labels = ['Custom'];
      orderCounts = [0];
      orderQtys = [0];
      break;
  }
  
  return { labels, orderCounts, orderQtys, timeLabel };
}

// Export functions for use in index.html
window.initDashboard = initDashboard;
window.cleanupDashboard = cleanupDashboard;