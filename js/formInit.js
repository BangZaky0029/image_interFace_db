// Fungsi untuk menampilkan pesan
function showMessage(message, isError = false) {
  const successMsg = document.getElementById('successMessage');
  const errorMsg = document.getElementById('errorMessage');
  
  if (isError && errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 3000);
  } else if (successMsg) {
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 3000);
  }
}



// Function to setup navigation buttons with improved event handling
function setupNavigationButtons() {
  console.log('Setting up navigation buttons...');
  
  // Setup Next button with robust event handling
  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    console.log('Next button found, setting up event listener');
    
    // Remove any existing event listeners
    btnNext.removeEventListener('click', handleNextClick);
    btnNext.addEventListener('click', handleNextClick);
    
    // Store reference for cleanup
    btnNext._nextHandler = handleNextClick;
  } else {
    console.error('Next button not found!');
  }
  
  // Setup Resume button with robust event handling
  const btnResume = document.getElementById('btn-resume');
  if (btnResume) {
    console.log('Resume button found, setting up event listener');
    
    // Remove any existing event listeners
    btnResume.removeEventListener('click', handleResumeClick);
    btnResume.addEventListener('click', handleResumeClick);
    
    // Store reference for cleanup
    btnResume._resumeHandler = handleResumeClick;
  }
  
  // Setup Previous button with robust event handling
  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) {
    console.log('Previous button found, setting up event listener');
    
    // Remove any existing event listeners
    btnPrev.removeEventListener('click', handlePrevClick);
    btnPrev.addEventListener('click', handlePrevClick);
    
    // Store reference for cleanup
    btnPrev._prevHandler = handlePrevClick;
  }
  
  // Setup Back button (Kembali) with robust event handling
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    console.log('Back button found, setting up event listener');
    
    // Remove any existing event listeners
    btnBack.removeEventListener('click', handleBackClick);
    btnBack.addEventListener('click', handleBackClick);
    
    // Store reference for cleanup
    btnBack._backHandler = handleBackClick;
  }
}

// Separate handler functions for better management
async function handleNextClick(e) {
  e.preventDefault();
  console.log('Next button clicked');
  
  const isValid = await validateStep1();
  if (!isValid) {
    return;
  }

  // Perform step transition
    await transitionToStep2();
    setTimeout(() => {
      if (window.initPreviewButton) {
        window.initPreviewButton();
      }
    }, 500);
}

async function handlePrevClick(e) {
  e.preventDefault();
  console.log('Previous button clicked');
  try {
    const multiStep = await import('./POST/form/multiStep.js');
    multiStep.transitionToStep1();
    // Show Resume button when going back to step 1
    const btnResume = document.getElementById('btn-resume');
    if (btnResume) {
      btnResume.style.display = 'inline-block';
    }
    console.log('Transitioned to step 1 with editing enabled');
  } catch (error) {
    console.error('Error in handlePrevClick:', error);
    showMessage('Error transitioning to previous step', true);
  }
}

async function handleResumeClick(e) {
  e.preventDefault();
  console.log('Resume button clicked');
  
  const isValid = await validateStep1();
  if (!isValid) {
    return;
  }
  
  // Hide resume button
  const btnResume = document.getElementById('btn-resume');
  if (btnResume) {
    btnResume.style.display = 'none';
  }
  
  // Perform step transition back to step 2
  await transitionToStep2();
  
  // Update progress indicator
  updateProgressIndicator(2);
}

async function handleBackClick(e) {
  e.preventDefault();
  console.log('Back button clicked');
  
  // Hide back button
  const btnBack = document.getElementById('btn-back');
  if (btnBack) {
    btnBack.style.display = 'none';
  }
  
  // Perform step transition back to step 2
  await transitionToStep2();
  
  // Update progress indicator
  updateProgressIndicator(2);
}

// Import validation and transition functions from multiStep module
let multiStepModule = null;

// Load multiStep module for validation and transitions
async function loadMultiStepModule() {
  if (!multiStepModule) {
    try {
      multiStepModule = await import('./POST/form/multiStep.js');
    } catch (error) {
      console.error('Failed to load multiStep module:', error);
    }
  }
  return multiStepModule;
}

// Validation function using multiStep module
async function validateStep1() {
  const module = await loadMultiStepModule();
  if (module && module.validateStep1) {
    return module.validateStep1();
  }
  
  // Fallback message if module fails to load
  showMessage('Terjadi kesalahan saat memvalidasi form', true);
  return false;
}

// Step transition functions using multiStep module
async function transitionToStep2() {
  const module = await loadMultiStepModule();
  if (module && module.transitionToStep2) {
    module.transitionToStep2();
    // Ensure form-actions are properly positioned after transition
    setTimeout(() => {
      adjustFormActionsPosition();
    }, 350);
  }
  
  // Update progress indicator
  updateProgressIndicator(2);
}

async function transitionToStep1() {
  const module = await loadMultiStepModule();
  if (module && module.transitionToStep1) {
    module.transitionToStep1();
    
  }
  
  // Update progress indicator
  updateProgressIndicator(1);
}

// Global form initialization with improved robustness
function initializeForm() {
  console.log('Starting form initialization...');
  
  // Clean up any existing initialization
  cleanupExistingHandlers();
  
  // Reset flag
  window.formInitialized = false;
  
  // Cek apakah elemen form sudah ada
  const orderForm = document.getElementById('orderForm');
  if (!orderForm) {
    console.log('Form not found, retrying in 100ms...');
    setTimeout(initializeForm, 100);
    return;
  }
  
  console.log('Form found, proceeding with initialization...');
  
  // Inisialisasi dropdown admin
  import('../config/listItem.js')
    .then(listItemModule => {
      // Populate admin dropdown
      listItemModule.populateAdminDropdown('id_admin');
    })
    .catch(error => {
      console.error('Error loading listItem.js module:', error);
    });
  
  // Import dan inisialisasi semua modul
  Promise.all([
    import('./POST/form/items.js'),
    import('./POST/event/formEvent.js'),
    import('./POST/form/multiStep.js')
  ]).then(([itemsModule, eventModule, multiStepModule]) => {
    console.log('Modules loaded successfully');
    
    // Inisialisasi form
    itemsModule.initFirstItem();
    eventModule.setupForm('http://100.124.58.32:5000');
    
    // Set global function untuk addItem
    window.addItemFunction = itemsModule.addItemFunction;
    
    // Setup navigation buttons (prioritas utama)
    setupNavigationButtons();
    
    // Initialize progress indicator (step 1 active by default)
    updateProgressIndicator(1);
    
    // Setup scroll detection
    setTimeout(() => {
      setupScrollDetection();
      adjustFormActionsPosition();
    }, 300);
    
    window.formInitialized = true;
    console.log('Form initialized successfully');
    
  }).catch(error => {
    console.error('Error initializing form:', error);
    
    // Fallback manual initialization jika module loading gagal
    console.log('Attempting manual fallback initialization...');
    manualFormInit();
  });
}



// Function to update progress indicator
function updateProgressIndicator(activeStep) {
  const step1Indicator = document.getElementById('step-indicator-1');
  const step2Indicator = document.getElementById('step-indicator-2');
  
  if (step1Indicator && step2Indicator) {
    // Remove active class from both
    step1Indicator.classList.remove('active');
    step2Indicator.classList.remove('active');
    
    // Add active class to current step
    if (activeStep === 1) {
      step1Indicator.classList.add('active');
    } else if (activeStep === 2) {
      step2Indicator.classList.add('active');
    }
    
    console.log(`Progress indicator updated: Step ${activeStep} is now active`);
  }
}

// Function to clean up existing event handlers
function cleanupExistingHandlers() {
  const btnNext = document.getElementById('btn-next');
  const btnResume = document.getElementById('btn-resume');
  const btnPrev = document.getElementById('btn-prev');
  const btnBack = document.getElementById('btn-back');
  
  if (btnNext && btnNext._nextHandler) {
    btnNext.removeEventListener('click', btnNext._nextHandler);
    delete btnNext._nextHandler;
  }
  
  if (btnResume && btnResume._resumeHandler) {
    btnResume.removeEventListener('click', btnResume._resumeHandler);
    delete btnResume._resumeHandler;
  }
  
  if (btnPrev && btnPrev._prevHandler) {
    btnPrev.removeEventListener('click', btnPrev._prevHandler);
    delete btnPrev._prevHandler;
  }
  
  if (btnBack && btnBack._backHandler) {
    btnBack.removeEventListener('click', btnBack._backHandler);
    delete btnBack._backHandler;
  }
}

// Function to adjust form-actions position based on content
function adjustFormActionsPosition() {
  const itemsContainer = document.getElementById('itemsContainer');
  const formActions = document.querySelector('#step2 .form-actions');
  
  if (itemsContainer && formActions) {
    const itemCount = itemsContainer.children.length;
    const baseMargin = 25; // Increased base margin
    const extraMargin = Math.max(10, itemCount * 3); // More space per item
    
    formActions.style.marginTop = `${baseMargin + extraMargin}px`;
    formActions.style.paddingTop = '20px';
    formActions.style.paddingBottom = '15px';
    
    console.log(`Adjusted form-actions margin: ${baseMargin + extraMargin}px for ${itemCount} items`);
  }
}

// Manual fallback initialization
function manualFormInit() {
  // Set default deadline
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineInput = document.getElementById('deadline');
  if (deadlineInput) {
    deadlineInput.value = tomorrow.toISOString().split('T')[0];
  }
  
  // Add first item manually
  const itemsContainer = document.getElementById('itemsContainer');
  if (itemsContainer && itemsContainer.children.length === 0) {
    addItemManual();
  }
  
  // Setup form submission
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    // Remove existing event listeners by cloning and replacing the form
    const newForm = orderForm.cloneNode(true);
    orderForm.parentNode.replaceChild(newForm, orderForm);
    
    // Add event listener to the new form
    newForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submitted - manual handler');
      alert('Form submission - manual handler active');
    });
    
    // Re-setup navigation buttons after form replacement
    setupNavigationButtons();
  }
  
  // Setup add item button
  window.addItemFunction = addItemManual;
  
  // Initialize progress indicator (step 1 active by default)
  updateProgressIndicator(1);
  
  // Ensure Resume button is hidden on initial load
  const btnResume = document.getElementById('btn-resume');
  if (btnResume) {
    btnResume.style.display = 'none';
  }
  
  // Setup scroll detection
  setTimeout(setupScrollDetection, 300);
}

// Manual add item function with improved spacing
function addItemManual() {
  const container = document.getElementById('itemsContainer');
  if (!container) return;
  
  const itemCount = container.children.length + 1;
  const wasEmpty = itemCount === 1;
  const itemCard = document.createElement('div');
  itemCard.className = 'item-card';
  itemCard.id = `item-${itemCount}`;
  itemCard.innerHTML = `
    <div class="item-header">
      <span class="item-number">Item #${itemCount}</span>
      <button type="button" class="remove-item-btn" onclick="removeItemManual(${itemCount})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="nama_${itemCount}">Nama Depan:</label>
        <input type="text" id="nama_${itemCount}" required />
      </div>
      <div class="form-group">
        <label for="id_image_${itemCount}">ID Image:</label>
        <input type="number" id="id_image_${itemCount}" required />
      </div>
    </div>
    <div class="form-group">
      <label>Type Product:</label>
      <div class="product-types">
        <div class="product-type-group">
          <div class="group-label">1 Sisi</div>
          <div class="buttons">
            <button type="button" class="product-type-btn" onclick="selectProductTypeManual(${itemCount}, '1 SISI MAGNET', this)">1 SISI MAGNET</button>
            <button type="button" class="product-type-btn" onclick="selectProductTypeManual(${itemCount}, '1 SISI ZIPPER', this)">1 SISI ZIPPER</button>
          </div>
        </div>
        <div class="product-type-group">
          <div class="group-label">2 Sisi</div>
          <div class="buttons">
            <button type="button" class="product-type-btn" onclick="selectProductTypeManual(${itemCount}, '2 SISI MAGNET', this)">2 SISI MAGNET</button>
            <button type="button" class="product-type-btn" onclick="selectProductTypeManual(${itemCount}, '2 SISI ZIPPER', this)">2 SISI ZIPPER</button>
          </div>
        </div>
        <div class="product-type-group">
        </div>
      </div>
      <input type="hidden" id="type_product_${itemCount}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="qty_${itemCount}">Quantity:</label>
        <input type="number" id="qty_${itemCount}" value="1" min="1" required />
      </div>
    </div>
    <div class="form-group">
      <label for="product_note_${itemCount}">Product Note:</label>
      <textarea id="product_note_${itemCount}" rows="3"></textarea>
    </div>
  `;
  container.appendChild(itemCard);
  
  // Adjust form-actions position immediately
  adjustFormActionsPosition();
  
  // Scroll to the new item if not the first one
  if (!wasEmpty) {
    setTimeout(() => {
      // Scroll with more space at the bottom and position container at bottom
      const containerRect = container.getBoundingClientRect();
      const itemRect = itemCard.getBoundingClientRect();
      
      // Check if item is not fully visible
      if (itemRect.bottom > containerRect.bottom - 100) {
        // Scroll to show the new item with extra space
        container.scrollTop = container.scrollHeight - container.clientHeight + 50;
      }
      
      // Check if we need to add scrolled-down class
      if (container.scrollTop > 10) {
        container.classList.add('scrolled-down');
      }
    }, 200);
  }
}

// Manual remove item function
window.removeItemManual = function(itemId) {
  const itemCard = document.getElementById(`item-${itemId}`);
  if (itemCard) {
    itemCard.remove();
    
    // Ensure at least one item exists
    const container = document.getElementById('itemsContainer');
    if (container && container.children.length === 0) {
      addItemManual();
    }
    
    // Adjust form-actions position after removal
    setTimeout(() => {
      adjustFormActionsPosition();
    }, 100);
  }
}

// Manual product type selection
window.selectProductTypeManual = function(itemId, type, targetBtn) {
   const itemCard = document.getElementById(`item-${itemId}`);
   const buttons = itemCard.querySelectorAll('.product-type-btn');
   buttons.forEach(btn => btn.classList.remove('active'));
   targetBtn.classList.add('active');
   document.getElementById(`type_product_${itemId}`).value = type;
 };

// Setup scroll detection for itemsContainer with improved handling
function setupScrollDetection() {
  const itemsContainer = document.getElementById('itemsContainer');
  if (itemsContainer) {
    // Remove existing scroll listener if any
    if (itemsContainer._scrollHandler) {
      itemsContainer.removeEventListener('scroll', itemsContainer._scrollHandler);
    }
    
    // Create new scroll handler
    const scrollHandler = function() {
      if (this.scrollTop > 10) {
        this.classList.add('scrolled-down');
      } else {
        this.classList.remove('scrolled-down');
      }
    };
    
    // Store reference and add listener
    itemsContainer._scrollHandler = scrollHandler;
    itemsContainer.addEventListener('scroll', scrollHandler);
    
    // Initial check
    if (itemsContainer.scrollTop > 10) {
      itemsContainer.classList.add('scrolled-down');
    }
    
    console.log('Scroll detection initialized for itemsContainer');
  }
}

// Auto-initialize ketika DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Reset form state before initialization
    window.formInitialized = false;
    initializeForm();
    setTimeout(setupScrollDetection, 500); // Delay to ensure container is ready
  });
} else {
  // Reset form state before initialization
  window.formInitialized = false;
  initializeForm();
  setTimeout(setupScrollDetection, 500); // Delay to ensure container is ready
}

// Export untuk manual initialization
window.initializeForm = initializeForm;
import { enableStep1Inputs } from './POST/form/multiStep.js';
