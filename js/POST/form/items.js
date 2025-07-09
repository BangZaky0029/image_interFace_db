let itemCounter = 0;
const productTypes = ['1 SISI MAGNET', '2 SISI MAGNET', '1 SISI ZIPPER', '2 SISI ZIPPER', 'CUSTOM'];

export function initFirstItem() {
  addItem();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('deadline').value = tomorrow.toISOString().split('T')[0];
}

export function addItem() {
  itemCounter++;
  const container = document.getElementById('itemsContainer');
  const itemCard = document.createElement('div');
  itemCard.className = 'item-card';
  itemCard.id = `item-${itemCounter}`;
  itemCard.innerHTML = `
    <div class="item-header">
      <span class="item-number">Item #${itemCounter}</span>
      <button type="button" class="remove-item-btn" data-item-id="${itemCounter}">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="nama_${itemCounter}">Nama:</label>
        <input type="text" id="nama_${itemCounter}" required />
      </div>
      <div class="form-group">
        <label for="id_image_${itemCounter}">ID Image:</label>
        <input type="number" id="id_image_${itemCounter}" required />
      </div>
    </div>
    <div class="form-group">
      <label>Type Product:</label>
      <div class="product-types">
        ${productTypes.map(type => `
          <button type="button" class="product-type-btn" data-item-id="${itemCounter}" data-type="${type}">${type}</button>
        `).join('')}
      </div>
      <input type="hidden" id="type_product_${itemCounter}" required />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="qty_${itemCounter}">Quantity:</label>
        <input type="number" id="qty_${itemCounter}" value="1" min="1" required />
      </div>
    </div>
    <div class="form-group">
      <label for="product_note_${itemCounter}">Product Note:</label>
      <textarea id="product_note_${itemCounter}" rows="3"></textarea>
    </div>
  `;
  container.appendChild(itemCard);
  
  // Add event listeners for the new item setelah element ditambahkan ke DOM
  setTimeout(() => setupItemEventListeners(itemCounter), 0);
}

export function removeItem(id) {
  const el = document.getElementById(`item-${id}`);
  if (el) el.remove();
  if (document.querySelectorAll('.item-card').length === 0) addItem();
}

function setupItemEventListeners(itemId) {
  // Setup remove button dengan selector yang lebih spesifik
  const removeBtn = document.querySelector(`#item-${itemId} .remove-item-btn`);
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      console.log(`Removing item ${itemId}`); // Debug log
      removeItem(itemId);
    });
  }
  
  // Setup product type buttons dengan selector yang lebih spesifik
  const productBtns = document.querySelectorAll(`#item-${itemId} .product-type-btn`);
  productBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      console.log(`Selected type: ${type} for item ${itemId}`); // Debug log
      selectProductType(itemId, type, e.target);
    });
  });
}

function selectProductType(itemId, type, targetBtn) {
  const itemCard = document.getElementById(`item-${itemId}`);
  const buttons = itemCard.querySelectorAll('.product-type-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  targetBtn.classList.add('active');
  document.getElementById(`type_product_${itemId}`).value = type;
}

// Export untuk digunakan di main.js
export { addItem as addItemFunction, removeItem as removeItemFunction };