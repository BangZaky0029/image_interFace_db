import { initFirstItem, addItemFunction, setupForm, setupMultiStepForm } from '../main.js';

document.addEventListener('DOMContentLoaded', () => {
  initFirstItem();
  setupForm('http://127.0.0.1:5000'); // ganti ke baseURL lo
  setupMultiStepForm();
});

window.addItemFunction = addItemFunction;
