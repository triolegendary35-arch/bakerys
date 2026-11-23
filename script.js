(() => {
  'use strict';

  const WA_NUMBER = '6281234567890';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu
  const menuToggle = $('#menuToggle');
  const navMenu = $('#navMenu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('show');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-link', navMenu).forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Hero slider sync
  const slideNumber = $('.slide-number');
  const indicators = $$('.indicator');
  let slideIndex = 0;
  if (indicators.length) {
    setInterval(() => {
      slideIndex = (slideIndex + 1) % indicators.length;
      indicators.forEach((ind, i) => ind.classList.toggle('active', i === slideIndex));
      if (slideNumber) slideNumber.textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(indicators.length).padStart(2, '0')}`;
    }, 7000);
  }

  // Nav active on scroll
  const sections = $$('main section, footer');
  const navLinks = $$('.nav-link');
  const linkByHash = (hash) => navLinks.find((l) => l.getAttribute('href') === hash);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (!id) return;
          navLinks.forEach((l) => l.classList.remove('active'));
          const link = linkByHash('#' + id);
          if (link) link.classList.add('active');
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach((s) => { if (s.id) observer.observe(s); });

  // Product modal
  const modal = $('#productModal');
  const modalImg = $('#modalImg');
  const modalCategory = $('#modalCategory');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalPrice = $('#modalPrice');
  const modalTotal = $('#modalTotal');
  const qtyValue = $('#qtyValue');
  const qtyMinus = $('#qtyMinus');
  const qtyPlus = $('#qtyPlus');
  const addToCartBtn = $('#addToCartBtn');

  let currentProduct = null;
  let currentQty = 1;

  const updateModalTotal = () => {
    if (!currentProduct) return;
    modalTotal.textContent = formatRp(currentProduct.price * currentQty);
    qtyValue.textContent = currentQty;
  };

  const openModal = (card) => {
    const d = card.dataset;
    currentProduct = {
      name: d.name,
      price: Number(d.price),
      image: d.image,
      category: d.category,
      desc: d.desc
    };
    currentQty = 1;
    modalImg.src = currentProduct.image;
    modalImg.alt = currentProduct.name;
    modalImg.classList.toggle('warm', !!card.querySelector('img.warm'));
    modalCategory.textContent = currentProduct.category;
    modalTitle.textContent = currentProduct.name;
    modalDesc.textContent = currentProduct.desc;
    modalPrice.textContent = formatRp(currentProduct.price);
    updateModalTotal();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    currentProduct = null;
  };

  $$('.product-card').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openModal(card));
  });

  $$('[data-modal-close]').forEach((el) => el.addEventListener('click', closeModal));

  if (qtyMinus) qtyMinus.addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; updateModalTotal(); }
  });
  if (qtyPlus) qtyPlus.addEventListener('click', () => {
    currentQty++; updateModalTotal();
  });

  // Cart state
  const cartKey = 'yasmin_cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(cartKey)) || []; } catch (e) { cart = []; }

  const cartToggle = $('#cartToggle');
  const cartDrawer = $('#cartDrawer');
  const cartOverlay = $('#cartOverlay');
  const cartClose = $('#cartClose');
  const cartBody = $('#cartBody');
  const cartList = $('#cartList');
  const cartEmpty = $('#cartEmpty');
  const cartTotal = $('#cartTotal');
  const cartBadge = $('#cartBadge');
  const cartCheckoutBtn = $('#cartCheckoutBtn');

  const saveCart = () => localStorage.setItem(cartKey, JSON.stringify(cart));

  const openCart = () => {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
    cartToggle.setAttribute('aria-expanded', 'true');
  };
  const closeCart = () => {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
    cartToggle.setAttribute('aria-expanded', 'false');
  };

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
  const cartSum = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  const renderCart = () => {
    cartList.innerHTML = '';
    if (cart.length === 0) {
      cartEmpty.hidden = false;
    } else {
      cartEmpty.hidden = true;
      cart.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <img class="cart-item-image" src="${item.image}" alt="${item.name}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <span class="cart-item-price">${formatRp(item.price)}</span>
            <div class="cart-item-qty">
              <button type="button" class="cart-qty-button" data-action="dec" data-idx="${idx}" aria-label="Kurangi">−</button>
              <span class="cart-qty-value">${item.qty}</span>
              <button type="button" class="cart-qty-button" data-action="inc" data-idx="${idx}" aria-label="Tambah">+</button>
            </div>
          </div>
          <div class="cart-item-side">
            <span class="cart-item-subtotal">${formatRp(item.price * item.qty)}</span>
            <button type="button" class="cart-item-remove" data-action="remove" data-idx="${idx}">Hapus</button>
          </div>
        `;
        cartList.appendChild(li);
      });
    }
    cartTotal.textContent = formatRp(cartSum());
    const count = cartCount();
    if (count > 0) {
      cartBadge.hidden = false;
      cartBadge.textContent = count;
    } else {
      cartBadge.hidden = true;
      cartBadge.textContent = '0';
    }
    cartCheckoutBtn.disabled = cart.length === 0;
    saveCart();
  };

  cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    const action = btn.dataset.action;
    if (action === 'inc') cart[idx].qty++;
    else if (action === 'dec') { if (cart[idx].qty > 1) cart[idx].qty--; }
    else if (action === 'remove') cart.splice(idx, 1);
    renderCart();
  });

  if (addToCartBtn) addToCartBtn.addEventListener('click', () => {
    if (!currentProduct) return;
    const existing = cart.find((i) => i.name === currentProduct.name);
    if (existing) existing.qty += currentQty;
    else cart.push({ name: currentProduct.name, price: currentProduct.price, image: currentProduct.image, qty: currentQty });
    renderCart();
    closeModal();
    openCart();
  });

  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    const lines = cart.map((i) => `- ${i.name} x${i.qty} = ${formatRp(i.price * i.qty)}`).join('\n');
    const msg = `Halo Yasmin's Bakery, saya ingin memesan:\n${lines}\n\nTotal: ${formatRp(cartSum())}\n\nTerima kasih.`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  });

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeModal();
      if (cartDrawer.classList.contains('is-open')) closeCart();
    }
  });

  renderCart();
})();
