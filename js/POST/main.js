import { initFirstItem, addItemFunction } from './form/items.js';
import { setupForm } from './event/formEvent.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded'); // Debug log
  initFirstItem();
  setupForm(baseURL); // pastikan `baseURL` di-define dari endpoint.js
  
  // Setup add item button
  const addItemBtn = document.querySelector('.add-item-btn');
  if (addItemBtn) {
    console.log('Add item button found'); // Debug log
    addItemBtn.addEventListener('click', () => {
      console.log('Add item button clicked'); // Debug log
      addItemFunction();
    });
  } else {
    console.log('Add item button not found'); // Debug log
  }
});