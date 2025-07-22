// js/POST/form/multiStep.js
import { showMessage } from './message.js';
import { validateForm } from './validation.js';

// Note: Event listeners are now handled in formInit.js to prevent conflicts
// This module now only exports utility functions

// Use the new validation system
export function validateStep1() {
  const step1 = document.getElementById('step1');
  return validateForm(step1);
}

export function transitionToStep2() {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const progress = document.querySelector('.form-progress');
  
  if (step1 && step2) {
    step1.classList.add('slide-left');
    setTimeout(() => {
      step1.classList.remove('active');
      // Show step 2
      step2.classList.add('active');
      step2.style.opacity = '1';
      step2.style.pointerEvents = 'auto';
      // Hide step 1
      step1.classList.remove('active');
      step1.style.opacity = '0';
      step1.style.pointerEvents = 'none';
      // Update progress indicator
      progress?.classList.add('step-2');
      
      // Reset step2 styles
      step2.style.transform = 'translateX(0)';
      step2.style.opacity = '1';
    }, 300);
  }
}

export function transitionToStep1() {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const progress = document.querySelector('.form-progress');
  
  if (step1 && step2) {
    step2.style.opacity = '0';
    setTimeout(() => {
      step2.classList.remove('active');
      step1.classList.remove('slide-left');
      step1.classList.add('active');
      step1.style.opacity = '1';
      progress?.classList.remove('step-2');
      // Enable all inputs in step 1 for editing
      enableStep1Inputs();
      // Ensure step1 is above step2 and interactive
      step1.style.zIndex = '2';
      step2.style.zIndex = '1';
      step1.style.pointerEvents = 'auto';
      step2.style.pointerEvents = 'none';
    }, 300);
  }
}

// Function to enable all inputs and buttons in step 1
export function enableStep1Inputs() {
  const step1 = document.getElementById('step1');
  if (step1) {
    // Enable all input elements
    const inputs = step1.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.disabled = false;
      input.readOnly = false;
      input.style.pointerEvents = 'auto';
      input.style.opacity = '1';
    });
    // Enable all buttons
    const buttons = step1.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = false;
      button.style.pointerEvents = 'auto';
    });
    // Enable all clickable elements
    const clickableElements = step1.querySelectorAll('[onclick], .clickable, .selectable');
    clickableElements.forEach(element => {
      element.style.pointerEvents = 'auto';
      element.disabled = false;
    });
    console.log('Step 1 inputs enabled for editing after transition');
  }
}


// Legacy function for backward compatibility (does nothing now)
export function setupMultiStepForm() {
  console.log('setupMultiStepForm called - event handling moved to formInit.js');
  // Event listeners are now handled in formInit.js to prevent conflicts
}
