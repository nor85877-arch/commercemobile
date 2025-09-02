/* Local cart management, UI bindings, cart icon pulse */
const Cart = (() => {
  const KEY = 'qc_cart_v1';

  function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
  function write(data){ localStorage.setItem(KEY, JSON.stringify(data)); updateBadge(); }

  function add(item, qty=1){
    const cart = read();
    const idx = cart.findIndex(x => x.id === item.id);
    if(idx >= 0){ cart[idx].qty += qty; } else { cart.push({ id:item.id, title:item.title, price:item.price, img:item.img, qty }); }
    write(cart); pulseCart();
  }

  function remove(id){
    const cart = read().filter(x => x.id !== id);
    write(cart);
  }

  function setQty(id, qty){
    const cart = read();
    const it = cart.find(x => x.id === id);
    if(!it) return;
    it.qty = Math.max(1, qty|0);
    write(cart);
  }

  function clear(){ write([]); }

  function total(){
    const cart = read(); return cart.reduce((s, x) => s + x.price * x.qty, 0);
  }

  function count(){
    const cart = read(); return cart.reduce((s, x) => s + x.qty, 0);
  }

  function updateBadge(){
    const badge = document.querySelector('.cart-count');
    if(badge){ badge.textContent = count(); }
  }

  function pulseCart(){
    const btn = document.querySelector('.cart-cta');
    if(!btn) return;
    btn.classList.remove('cart-pulse');
    void btn.offsetWidth; // reflow to restart animation
    btn.classList.add('cart-pulse');
  }

  // Render helpers for cart page
  function renderCart(listEl, totalEl){
    const cart = read();
    if(listEl){
      listEl.innerHTML = cart.map(item => `
        <div class="product-card panel" data-id="${item.id}">
          <div style="display:flex; gap:14px; align-items:center">
            <img src="${item.img}" alt="${item.title}" style="width:96px;height:72px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.12)"/>
            <div style="flex:1">
              <h3 style="margin:0 0 6px">${item.title}</h3>
              <div class="product-meta">
                <span class="price">₹${item.price.toLocaleString()}</span>
                <div style="display:flex; align-items:center; gap:8px">
                  <button class="button ghost qty-dec" aria-label="Decrease">-</button>
                  <input class="input qty" type="number" min="1" value="${item.qty}" style="width:64px; text-align:center"/>
                  <button class="button ghost qty-inc" aria-label="Increase">+</button>
                </div>
              </div>
            </div>
            <button class="button" data-remove>Remove</button>
          </div>
        </div>
      `).join('');
      listEl.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.closest('[data-id]').getAttribute('data-id');
        remove(id); renderCart(listEl, totalEl);
      }));
      listEl.querySelectorAll('.qty-inc').forEach(btn => btn.addEventListener('click', () => {
        const wrap = btn.closest('[data-id]'); const id = wrap.getAttribute('data-id');
        const input = wrap.querySelector('.qty'); setQty(id, (parseInt(input.value)||1)+1); renderCart(listEl, totalEl);
      }));
      listEl.querySelectorAll('.qty-dec').forEach(btn => btn.addEventListener('click', () => {
        const wrap = btn.closest('[data-id]'); const id = wrap.getAttribute('data-id');
        const input = wrap.querySelector('.qty'); setQty(id, Math.max(1, (parseInt(input.value)||1)-1)); renderCart(listEl, totalEl);
      }));
      listEl.querySelectorAll('.qty').forEach(inp => inp.addEventListener('change', () => {
        const wrap = inp.closest('[data-id]'); const id = wrap.getAttribute('data-id');
        setQty(id, parseInt(inp.value)||1); renderCart(listEl, totalEl);
      }));
    }
    if(totalEl){ totalEl.textContent = '₹' + total().toLocaleString(); }
    updateBadge();
  }

  document.addEventListener('DOMContentLoaded', updateBadge);

  return { add, remove, setQty, read, total, count, clear, renderCart, updateBadge };
})();
