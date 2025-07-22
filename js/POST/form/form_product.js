// js/POST/form/form_product.js
import { initFormValidation } from '../../main.js';
import { showMessage } from './message.js';
import { populateAdminDropdown as populateAdminSelect, fetchAdminList } from '../../../config/listItem.js';

// Function to set button loading state
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.setAttribute('data-original-text', button.innerHTML);
        button.innerHTML = '<span class="spinner"></span> Menyimpan...';
        button.disabled = true;
        button.classList.add('loading');
    } else {
        if (button.hasAttribute('data-original-text')) {
            button.innerHTML = button.getAttribute('data-original-text');
            button.removeAttribute('data-original-text');
        }
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Function to populate admin dropdown
async function populateAdminDropdown() {
    try {
        // Use the existing function from listItem.js
        populateAdminSelect('id_admin');
        
        // Optionally fetch updated admin list from API if available
        try {
            await fetchAdminList('/admin/list');
            // Repopulate dropdown with fresh data
            populateAdminSelect('id_admin');
        } catch (apiError) {
            console.log('Using local admin list, API fetch failed:', apiError);
            // Continue with local data if API fails
        }
    } catch (error) {
        console.error('Error populating admin dropdown:', error);
        showMessage('Failed to load admin list. Please refresh the page.', true);
    }
}

// Initialize form product page
function initFormProduct() {
    // Initialize form validation
    initFormValidation();
    
    // Populate admin dropdown
    populateAdminDropdown();
    
    // Form submission handler
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Validate form
            const isValid = await import('./validation.js')
                .then(module => module.validateForm(this))
                .catch(error => {
                    console.error('Error validating form:', error);
                    return false;
                });
            
            if (!isValid) {
                showMessage('Mohon lengkapi semua field yang diperlukan', true);
                return;
            }
            
            const submitButton = this.querySelector('button[type="submit"]');
            setButtonLoading(submitButton, true);
            
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            
            try {
                const response = await fetch('/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('Pesanan berhasil dibuat!');
                    this.reset();
                } else {
                    showMessage(`Error: ${result.message || 'Terjadi kesalahan saat membuat pesanan'}`, true);
                }
            } catch (error) {
                showMessage(`Error: ${error.message || 'Terjadi kesalahan saat membuat pesanan'}`, true);
            } finally {
                setButtonLoading(submitButton, false);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initFormProduct);

// Export functions for potential reuse
export { populateAdminDropdown, initFormProduct };