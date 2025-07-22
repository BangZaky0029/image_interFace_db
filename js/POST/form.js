import { initFirstItem, addItemFunction, setupForm, setupMultiStepForm, initFormValidation } from '../main.js';

document.addEventListener('DOMContentLoaded', () => {
  initFirstItem();
  setupForm('http://100.124.58.32:5000'); // ganti ke baseURL lo
  setupMultiStepForm();
  initFormValidation(); // Initialize form validation
});

window.addItemFunction = addItemFunction;
