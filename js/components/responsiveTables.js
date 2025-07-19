/**
 * responsiveTables.js - Handles responsive table functionality
 * Converts standard tables to card view on mobile devices
 */

// Convert standard tables to responsive card tables on mobile
function makeTablesResponsive() {
  // Only apply on mobile devices
  if (window.innerWidth <= 768) {
    // Find all tables in the document
    const tables = document.querySelectorAll('table:not(.responsive-card-table)');
    
    tables.forEach(table => {
      // Add responsive class
      table.classList.add('responsive-card-table');
      
      // Get all headers
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      
      // Process all rows except header row
      const rows = table.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        
        // Add data-label attribute to each cell based on corresponding header
        cells.forEach((cell, index) => {
          if (index < headers.length) {
            cell.setAttribute('data-label', headers[index]);
          }
        });
      });
      
      // Add a container around the table for better mobile styling
      if (!table.parentElement.classList.contains('table-container-mobile')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-container-mobile';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
    
    console.log('Tables converted to responsive card view');
  }
}

// Initialize responsive tables
function initResponsiveTables() {
  // Initial conversion
  makeTablesResponsive();
  
  // Set up a mutation observer to detect when new tables are added to the DOM
  const observer = new MutationObserver(mutations => {
    let shouldProcess = false;
    
    mutations.forEach(mutation => {
      // Check if new nodes were added
      if (mutation.addedNodes.length) {
        // Check if any of the added nodes are tables or contain tables
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'TABLE' || 
              (node.nodeType === 1 && node.querySelector('table'))) {
            shouldProcess = true;
          }
        });
      }
    });
    
    // If tables were added, make them responsive
    if (shouldProcess) {
      setTimeout(makeTablesResponsive, 100); // Small delay to ensure DOM is updated
    }
  });
  
  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Handle resize events
  window.addEventListener('resize', () => {
    // If switching from desktop to mobile, make tables responsive
    if (window.innerWidth <= 768) {
      makeTablesResponsive();
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initResponsiveTables);

// Export functions for use in other files
window.makeTablesResponsive = makeTablesResponsive;
window.initResponsiveTables = initResponsiveTables;