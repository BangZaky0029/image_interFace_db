export function collectFormData() {
  const formData = {
    id_admin: parseInt(document.getElementById('id_admin').value),
    platform: document.getElementById('platform').value,
    nama_customer: document.getElementById('nama_customer').value,
    deadline: document.getElementById('deadline').value,
    status_print: 'pending', // Default status untuk order baru
    items: []
  };

  document.querySelectorAll('.item-card').forEach(card => {
    const id = card.id.split('-')[1];
    formData.items.push({
      nama: document.getElementById(`nama_${id}`).value,
      id_image: parseInt(document.getElementById(`id_image_${id}`).value),
      type_product: document.getElementById(`type_product_${id}`).value,
      qty: parseInt(document.getElementById(`qty_${id}`).value),
      product_note: document.getElementById(`product_note_${id}`).value || '',
      font_color: document.getElementById(`font_color_${id}`).value
    });
  });

  return formData;
}
