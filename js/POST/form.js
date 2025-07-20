import { initFirstItem, addItemFunction, setupForm, setupMultiStepForm } from '../main.js';

document.addEventListener('DOMContentLoaded', () => {
  initFirstItem();
  setupForm('http://100.124.58.32:5000'); // ganti ke baseURL lo
  setupMultiStepForm();
});

window.addItemFunction = addItemFunction;
