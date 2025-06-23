// src/utils/cart.js

export function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

export function removeFromCart(productId) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const updated = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function clearCart() {
  localStorage.removeItem('cart');
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function decreaseFromCart(productId) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.quantity > 1) {
      existing.quantity -= 1;
    } else {
      // Если 1, удаляем товар
      const idx = cart.findIndex(item => item.id === productId);
      if (idx !== -1) cart.splice(idx, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }
}
