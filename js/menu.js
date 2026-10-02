'use strict';

const CART_KEY = 'barraca_do_baiano_cart_v1';
const NOTE_KEY = 'barraca_do_baiano_note_v1';
const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

let selectedProduct = null;
let selectedQty = 1;

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function cartTotal(cart = loadCart()) {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

function cartCount(cart = loadCart()) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderCategories() {
  const wrap = document.querySelector('[data-category-list]');
  if (!wrap) return;

  MENU.forEach((group, index) => {
    const button = el('button', index === 0 ? 'category-chip active' : 'category-chip', group.category);
    button.type = 'button';
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(`cat-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    wrap.appendChild(button);
  });
}

function createProductCard(product) {
  const article = el('article', 'menu-card');

  const media = el('div', 'menu-card-media product-photo-placeholder');
  const logo = document.createElement('img');
  logo.src = 'assets/images/logo.webp';
  logo.alt = '';
  logo.setAttribute('aria-hidden', 'true');
  const placeholderText = el('span', '', 'foto do produto');
  media.append(logo, placeholderText);

  const body = el('div', 'menu-card-body');
  const top = el('div', 'menu-card-top');
  const name = el('h3', '', product.name);
  const price = el('strong', '', product.price === null ? 'Consulte' : money(product.price));
  top.append(name, price);
  body.appendChild(top);

  if (product.ingredients.length) {
    body.appendChild(el('p', 'ingredients', product.ingredients.join(', ')));
  } else if (product.availabilityOnly) {
    body.appendChild(el('p', 'ingredients', 'Consulte a disponibilidade pelo WhatsApp.'));
  }

  const action = el('button', 'btn btn-dark btn-small', product.availabilityOnly ? 'Consultar' : 'Adicionar');
  action.type = 'button';
  action.addEventListener('click', () => {
    if (product.availabilityOnly) {
      window.open(`https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent('Olá! Quais são as sobremesas disponíveis hoje?')}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (product.customizable) openProductDialog(product);
    else addSimpleProduct(product);
  });
  body.appendChild(action);
  article.append(media, body);
  return article;
}

function renderMenu() {
  const wrap = document.querySelector('[data-menu-groups]');
  if (!wrap) return;

  MENU.forEach((group, index) => {
    const section = el('section', 'menu-group');
    section.id = `cat-${index}`;
    const heading = el('div', 'menu-group-head');
    heading.appendChild(el('h2', '', group.category));
    const grid = el('div', 'menu-grid');
    group.products.forEach(product => grid.appendChild(createProductCard({ ...product, category: group.category })));
    section.append(heading, grid);
    wrap.appendChild(section);
  });
}

function addSimpleProduct(product) {
  const cart = loadCart();
  const match = cart.find(item => item.productId === product.id && !item.removed.length && !item.extras.length && !item.note);
  if (match) match.qty += 1;
  else cart.push({
    lineId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    productId: product.id,
    name: product.name,
    basePrice: product.price,
    unitPrice: product.price,
    qty: 1,
    removed: [],
    extras: [],
    note: ''
  });
  saveCart(cart);
  openDrawer();
}

function openProductDialog(product) {
  selectedProduct = product;
  selectedQty = 1;
  const dialog = document.querySelector('[data-product-dialog]');
  document.querySelector('[data-dialog-category]').textContent = product.category;
  document.querySelector('[data-dialog-name]').textContent = product.name;
  document.querySelector('[data-dialog-description]').textContent = product.ingredients.join(', ');
  document.querySelector('[data-dialog-price]').textContent = money(product.price);
  document.querySelector('[data-dialog-qty]').textContent = '1';
  document.querySelector('[data-item-note]').value = '';

  const removals = document.querySelector('[data-removal-options]');
  removals.replaceChildren();
  product.ingredients.forEach(ingredient => {
    const label = el('label', 'check-option');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = ingredient;
    input.dataset.removal = '';
    const span = el('span', '', ingredient);
    label.append(input, span);
    removals.appendChild(label);
  });

  const additions = document.querySelector('[data-addition-options]');
  additions.replaceChildren();
  EXTRA_OPTIONS.forEach(extra => {
    const label = el('label', 'check-option with-price');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = extra.id;
    input.dataset.addition = '';
    const name = el('span', '', extra.name);
    const price = el('strong', '', `+ ${money(extra.price)}`);
    label.append(input, name, price);
    additions.appendChild(label);
  });

  dialog.querySelectorAll('input').forEach(input => input.addEventListener('change', updateDialogTotal));
  updateDialogTotal();
  dialog.showModal();
}

function dialogExtras() {
  return [...document.querySelectorAll('[data-addition]:checked')]
    .map(input => EXTRA_OPTIONS.find(extra => extra.id === input.value))
    .filter(Boolean);
}

function updateDialogTotal() {
  if (!selectedProduct) return;
  const extraValue = dialogExtras().reduce((sum, extra) => sum + extra.price, 0);
  document.querySelector('[data-dialog-total]').textContent = money((selectedProduct.price + extraValue) * selectedQty);
}

function addDialogProduct() {
  if (!selectedProduct) return;
  const removed = [...document.querySelectorAll('[data-removal]:checked')].map(input => input.value);
  const extras = dialogExtras();
  const note = document.querySelector('[data-item-note]').value.trim().slice(0, 160);
  const unitPrice = selectedProduct.price + extras.reduce((sum, extra) => sum + extra.price, 0);
  const cart = loadCart();
  cart.push({
    lineId: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    productId: selectedProduct.id,
    name: selectedProduct.name,
    basePrice: selectedProduct.price,
    unitPrice,
    qty: selectedQty,
    removed,
    extras: extras.map(extra => ({ id: extra.id, name: extra.name, price: extra.price })),
    note
  });
  saveCart(cart);
  document.querySelector('[data-product-dialog]').close();
  openDrawer();
}

function renderCart() {
  const cart = loadCart();
  const count = cartCount(cart);
  const total = cartTotal(cart);
  document.querySelectorAll('[data-cart-count]').forEach(node => node.textContent = String(count));
  const mobileTotal = document.querySelector('[data-mobile-total]');
  if (mobileTotal) mobileTotal.textContent = money(total);
  const totalNode = document.querySelector('[data-cart-total]');
  if (totalNode) totalNode.textContent = money(total);

  const wrap = document.querySelector('[data-cart-items]');
  if (!wrap) return;
  wrap.replaceChildren();

  if (!cart.length) {
    const empty = el('div', 'cart-empty');
    empty.append(el('h3', '', 'Seu pedido está vazio.'), el('p', '', 'Adicione algum item do cardápio para começar.'));
    wrap.appendChild(empty);
    return;
  }

  cart.forEach(item => {
    const row = el('article', 'cart-item');
    const head = el('div', 'cart-item-head');
    head.append(el('h3', '', item.name), el('strong', '', money(item.unitPrice * item.qty)));
    row.appendChild(head);

    if (item.removed.length) row.appendChild(el('p', 'cart-meta', `Sem: ${item.removed.join(', ')}`));
    if (item.extras.length) row.appendChild(el('p', 'cart-meta', `Acréscimos: ${item.extras.map(extra => extra.name).join(', ')}`));
    if (item.note) row.appendChild(el('p', 'cart-meta', `Obs.: ${item.note}`));

    const controls = el('div', 'cart-item-controls');
    const qty = el('div', 'qty-control');
    const minus = el('button', '', '−');
    const amount = el('span', '', String(item.qty));
    const plus = el('button', '', '+');
    minus.type = plus.type = 'button';
    minus.setAttribute('aria-label', `Diminuir ${item.name}`);
    plus.setAttribute('aria-label', `Aumentar ${item.name}`);
    minus.addEventListener('click', () => changeQty(item.lineId, -1));
    plus.addEventListener('click', () => changeQty(item.lineId, 1));
    qty.append(minus, amount, plus);
    const remove = el('button', 'remove-line', 'Remover');
    remove.type = 'button';
    remove.addEventListener('click', () => removeLine(item.lineId));
    controls.append(qty, remove);
    row.appendChild(controls);
    wrap.appendChild(row);
  });
}

function changeQty(lineId, delta) {
  const cart = loadCart();
  const item = cart.find(line => line.lineId === lineId);
  if (!item) return;
  item.qty += delta;
  saveCart(item.qty <= 0 ? cart.filter(line => line.lineId !== lineId) : cart);
}

function removeLine(lineId) {
  saveCart(loadCart().filter(line => line.lineId !== lineId));
}

function openDrawer() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const backdrop = document.querySelector('[data-drawer-backdrop]');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('show'));
  document.body.classList.add('drawer-open');
}

function closeDrawer() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const backdrop = document.querySelector('[data-drawer-backdrop]');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('show');
  setTimeout(() => { backdrop.hidden = true; }, 180);
  document.body.classList.remove('drawer-open');
}

function buildWhatsappMessage() {
  const cart = loadCart();
  if (!cart.length) return '';
  const lines = ['Olá! Gostaria de fazer um pedido:', ''];

  cart.forEach(item => {
    lines.push(`${item.qty}x ${item.name} — ${money(item.unitPrice * item.qty)}`);
    if (item.removed.length) lines.push(`  Sem: ${item.removed.join(', ')}`);
    if (item.extras.length) lines.push(`  Acréscimos: ${item.extras.map(extra => `${extra.name} (+${money(extra.price)})`).join(', ')}`);
    if (item.note) lines.push(`  Obs.: ${item.note}`);
    lines.push('');
  });

  const generalNote = document.querySelector('[data-order-note]').value.trim().slice(0, 240);
  if (generalNote) {
    lines.push(`Observação geral: ${generalNote}`, '');
  }
  lines.push(`Total do pedido: ${money(cartTotal(cart))}`);
  lines.push('', 'Gostaria de confirmar disponibilidade e valor final.');
  return lines.join('\n');
}

function sendWhatsapp() {
  const message = buildWhatsappMessage();
  if (!message) {
    openDrawer();
    return;
  }
  localStorage.setItem(NOTE_KEY, document.querySelector('[data-order-note]').value.slice(0, 240));
  const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function wireEvents() {
  document.querySelectorAll('.cart-open').forEach(button => button.addEventListener('click', openDrawer));
  document.querySelector('[data-drawer-close]')?.addEventListener('click', closeDrawer);
  document.querySelector('[data-drawer-backdrop]')?.addEventListener('click', closeDrawer);
  document.querySelector('[data-clear-cart]')?.addEventListener('click', () => saveCart([]));
  document.querySelector('[data-send-whatsapp]')?.addEventListener('click', sendWhatsapp);
  document.querySelector('[data-product-close]')?.addEventListener('click', () => document.querySelector('[data-product-dialog]').close());
  document.querySelector('[data-dialog-qty-minus]')?.addEventListener('click', () => {
    selectedQty = Math.max(1, selectedQty - 1);
    document.querySelector('[data-dialog-qty]').textContent = String(selectedQty);
    updateDialogTotal();
  });
  document.querySelector('[data-dialog-qty-plus]')?.addEventListener('click', () => {
    selectedQty = Math.min(20, selectedQty + 1);
    document.querySelector('[data-dialog-qty]').textContent = String(selectedQty);
    updateDialogTotal();
  });
  document.querySelector('[data-dialog-add]')?.addEventListener('click', addDialogProduct);

  const note = document.querySelector('[data-order-note]');
  if (note) note.value = localStorage.getItem(NOTE_KEY) || '';
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderMenu();
  wireEvents();
  renderCart();
});
