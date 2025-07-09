import { showMessage } from '../form/message.js';
import { addItemFunction } from '../form/items.js';

export async function submitFormData(formData, baseURL) {
  try {
    const res = await fetch(`${baseURL}/api/order/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const result = await res.json();

    if (res.ok) {
      showMessage(`Order created successfully! ID: ${result.id_order}`);
      document.getElementById('orderForm').reset();
      document.getElementById('itemsContainer').innerHTML = '';
      addItemFunction(); // Menggunakan addItemFunction yang sudah di-export
    } else {
      showMessage(result.message || 'Failed to create order', true);
    }
  } catch (err) {
    console.error(err);
    showMessage('Network error. Please check your connection.', true);
  }
}