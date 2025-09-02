/* Product data, rendering, filtering, and detail lookup */
const QCProducts = (() => {
  const products = [
    { 
      id:'quantum-aurora-headset',
      title:'Quantum Aurora Headset',
      price: 12999,
      img:'https://images.pexels.com/photos/3394668/pexels-photo-3394668.jpeg',
      category:'Audio',
      tags:['bluetooth','noise-cancel'],
      rating:4.7,
      featured:true
    },
    { 
      id:'nebulaforge-keyboard',
      title:'NebulaForge Keyboard',
      price: 9999,
      img:'https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg',
      category:'Peripherals',
      tags:['rgb','mechanical'],
      rating:4.8,
      featured:true
    },
    { 
      id:'starlight-mouse',
      title:'Starlight Mouse',
      price: 3999,
      img:'https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg',
      category:'Peripherals',
      tags:['wireless','ergonomic'],
      rating:4.5
    },
    { 
      id:'cosmic-4k-monitor',
      title:'Cosmic 4K Monitor',
      price: 34999,
      img:'https://images.pexels.com/photos/572056/pexels-photo-572056.jpeg',
      category:'Displays',
      tags:['4k','hdr','144hz'],
      rating:4.6,
      featured:true
    },
    { 
      id:'ion-drive-ssd-2tb',
      title:'ION Drive SSD 2TB',
      price: 15999,
      img:'https://images.pexels.com/photos/159220/pexels-photo-159220.jpeg',
      category:'Storage',
      tags:['nvme','pcie4'],
      rating:4.9
    },
    { 
      id:'gravity-dock-pro',
      title:'Gravity Dock Pro',
      price: 5999,
      img:'https://images.pexels.com/photos/5082579/pexels-photo-5082579.jpeg',
      category:'Accessories',
      tags:['usb-c','thunderbolt'],
      rating:4.4
    },
    { 
      id:'quantum-surge-gpu',
      title:'Quantum Surge GPU',
      price: 79999,
      img:'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
      category:'Components',
      tags:['rtx','ai'],
      rating:4.9
    },
    { 
      id:'lumen-pad',
      title:'Lumen Pad',
      price: 24999,
      img:'https://images.pexels.com/photos/5082569/pexels-photo-5082569.jpeg',
      category:'Tablets',
      tags:['oled','stylus'],
      rating:4.3
    }
  ];

  function byId(id){ return products.find(p => p.id === id); }

  function categories(){
    return Array.from(new Set(products.map(p => p.category))).sort();
  }

  function renderCards(list, filter = {}){
    const { q='', cat='All' } = filter;
    const query = q.trim().toLowerCase();
    const items = products.filter(p => {
      const matchQ = !query || p.title.toLowerCase().includes(query) || p.tags.join(' ').toLowerCase().includes(query);
      const matchC = cat === 'All' || p.category === cat;
      return matchQ && matchC;
    });
    list.innerHTML = items.map(p => `
      <div class="product-card" data-id="${p.id}">
        <img class="product-media" src="${p.img}" alt="${p.title}"/>
        <div class="product-body">
          <div class="product-meta">
            <h3 style="margin:0">${p.title}</h3>
            <span class="price">₹${p.price.toLocaleString()}</span>
          </div>
          <small>${p.category} • ⭐ ${p.rating}</small>
          <div class="actions">
            <a class="button ghost" href="product-detail.html?id=${encodeURIComponent(p.id)}">View</a>
            <button class="button" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = products.find(x => x.id === btn.getAttribute('data-add'));
        Cart.add(p, 1);
      });
    });
  }

  function renderFeatured(list){
    const items = products.filter(p => p.featured);
    list.innerHTML = items.map(p => `
      <div class="product-card" data-id="${p.id}">
        <img class="product-media" src="${p.img}" alt="${p.title}"/>
        <div class="product-body">
          <span class="badge">Featured</span>
          <div class="product-meta" style="margin-top:6px">
            <h3 style="margin:0">${p.title}</h3>
            <span class="price">₹${p.price.toLocaleString()}</span>
          </div>
          <div class="actions">
            <a class="button ghost" href="product-detail.html?id=${encodeURIComponent(p.id)}">View</a>
            <button class="button" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = products.find(x => x.id === btn.getAttribute('data-add'));
        Cart.add(p, 1);
      });
    });
  }

  function mountFilters({ listSel, searchSel, catSel }){
    const list = document.querySelector(listSel);
    const search = document.querySelector(searchSel);
    const cat = document.querySelector(catSel);

    if(cat){
      cat.innerHTML = ['All', ...categories()].map(c => `<option value="${c}">${c}</option>`).join('');
    }

    function apply(){
      renderCards(list, { q: search?.value || '', cat: cat?.value || 'All' });
    }

    search?.addEventListener('input', apply);
    cat?.addEventListener('change', apply);

    apply();
  }

  function renderDetail(host){
    const url = new URL(location.href);
    const id = url.searchParams.get('id');
    const p = byId(id);
    if(!p){ host.innerHTML = `<div class="panel">Product not found.</div>`; return; }
    host.innerHTML = `
      <div class="grid" style="grid-template-columns: 1.1fr 1fr; gap:20px">
        <div class="product-card glow-border">
          <img class="product-media" src="${p.img}" alt="${p.title}" style="aspect-ratio: 16/12"/>
        </div>
        <div class="panel">
          <h2 style="margin-top:0">${p.title}</h2>
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px">
            <span class="badge">${p.category}</span>
            <small>⭐ ${p.rating}</small>
          </div>
          <h2 class="price" style="margin:10px 0">₹${p.price.toLocaleString()}</h2>
          <p style="color:var(--muted)">Engineered for a quantum-grade experience with premium materials, low latency, and luminous aesthetics.</p>
          <div style="display:flex; gap:10px; align-items:center">
            <input class="input" type="number" id="qty" value="1" min="1" style="width:90px"/>
            <button class="button" id="add">Add to Cart</button>
            <a class="button ghost" href="/products.html">Back to Catalog</a>
          </div>
        </div>
      </div>
    `;
    host.querySelector('#add').addEventListener('click', () => {
      const qty = Math.max(1, parseInt(host.querySelector('#qty').value)||1);
      Cart.add(p, qty);
    });
  }

  return { renderCards, renderFeatured, mountFilters, renderDetail, byId };
})();


