import { collectFormData } from '../form/collect.js';
import { submitFormData } from '../api/submit.js';
import { showMessage } from '../form/message.js';

export function setupForm(baseURL) {
  document.getElementById('orderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = collectFormData();
    if (formData.items.some(i => !i.nama || !i.id_image || !i.type_product || !i.qty)) {
      showMessage("Please fill all required fields", true);
      return;
    }
    await submitFormData(formData, baseURL);
  });
}
