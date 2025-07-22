// js/POST/form/validation.js
import { showMessage } from './message.js';

// Initialize form validation
export function initFormValidation() {
  // Get all required inputs
  const requiredInputs = document.querySelectorAll('input[required], select[required]');
  
  // Add required class to parent form-group
  requiredInputs.forEach(input => {
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      formGroup.classList.add('required');
      
      // Add error message element
      const errorElement = document.createElement('div');
      errorElement.className = 'error-text';
      formGroup.appendChild(errorElement);
      
      // Add real-time validation
      input.addEventListener('blur', () => validateInput(input));
      input.addEventListener('input', () => {
        // Remove error when user starts typing
        const formGroup = input.closest('.form-group');
        if (formGroup && formGroup.classList.contains('error')) {
          formGroup.classList.remove('error');
          const errorText = formGroup.querySelector('.error-text');
          if (errorText) errorText.textContent = '';
        }
      });
    }
  });
}

// Validate a single input
export function validateInput(input) {
  const formGroup = input.closest('.form-group');
  const errorElement = formGroup?.querySelector('.error-text');
  const value = input.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Check if empty
  if (input.hasAttribute('required') && value === '') {
    isValid = false;
    errorMessage = 'Field ini wajib diisi';
  } 
  // Check email format
  else if (input.type === 'email' && value !== '') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      isValid = false;
      errorMessage = 'Format email tidak valid';
    }
  }
  // Check number min/max
  else if (input.type === 'number' && value !== '') {
    const numValue = parseFloat(value);
    if (input.hasAttribute('min') && numValue < parseFloat(input.getAttribute('min'))) {
      isValid = false;
      errorMessage = `Nilai minimum adalah ${input.getAttribute('min')}`;
    } else if (input.hasAttribute('max') && numValue > parseFloat(input.getAttribute('max'))) {
      isValid = false;
      errorMessage = `Nilai maksimum adalah ${input.getAttribute('max')}`;
    }
  }
  
  // Update UI based on validation
  if (formGroup) {
    if (!isValid) {
      formGroup.classList.add('error');
      formGroup.classList.remove('success');
      if (errorElement) errorElement.textContent = errorMessage;
    } else if (value !== '') {
      formGroup.classList.remove('error');
      formGroup.classList.add('success');
      if (errorElement) errorElement.textContent = '';
    } else {
      formGroup.classList.remove('error', 'success');
      if (errorElement) errorElement.textContent = '';
    }
  }
  
  return isValid;
}

// Validate all inputs in a form or container
export function validateForm(container = document) {
  const inputs = container.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    showMessage('Mohon lengkapi semua field yang wajib diisi', true);
    // Scroll to first error
    const firstError = container.querySelector('.form-group.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  return isValid;
}

// Export validation for step 1 specifically
export function validateStep1() {
  const step1 = document.getElementById('step1');
  return validateForm(step1);
}