/* ══════════════════════════════════════════════
   MODERA | مُدرا — موتور قالب (بدون هیچ وابستگی)
   ══════════════════════════════════════════════ */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const FA = n => Number(n).toLocaleString('fa-IR');
const money = n => FA(n) + ' تومان';
const faPad = n => String(n).padStart(2, '0').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const P = id => MODERA_PRODUCTS.find(p => p.id === Number(id));
const CFG = MODERA_CONFIG;
const percent = p => p.old ? Math.round((1 - p.price / p.old) * 100) : 0;

/* ── پیام شناور ── */
function toast(msg, type = '') {
  const box = $('#toasts'); if (!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type; el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 2800);
}

/* ── ستاره‌ها ── */
const stars = r => `<span class="stars"><span style="width:${(r / 5 * 100).toFixed(0)}%"></span></span>`;

/* ═══════ سبد خرید و علاقه‌مندی‌ها ═══════ */
let cart = store.get('modera_cart', []);
let wish = store.get('modera_wish', []);
const saveCart = () => { store.set('modera_cart', cart); renderCartAll(); };
const saveWish = () => { store.set('modera_wish', wish); renderCounts(); $$('[data-wish]').forEach(b => b.classList.toggle('loved', wish.includes(Number(b.dataset.wish)))); };

function addToCart(id, size, color, qty = 1, silent = false) {
  const p = P(id); if (!p) return;
  size = size || p.sizes[0]; color = color || p.colors[0].n;
  const ex = cart.find(i => i.id === p.id && i.size === size && i.color === color);
  if (ex) ex.qty += qty; else cart.push({ id: p.id, size, color, qty });
  saveCart();
  if (!silent) { toast(`«${p.name}» به سبد اضافه شد 🛍`, 'ok'); openLayer('cart'); }
}
const cartQty = () => cart.reduce((s, i) => s + i.qty, 0);
const cartSubtotal = () => cart.reduce((s, i) => s + P(i.id).price * i.qty, 0);

function renderCounts() {
  const q = FA(cartQty()), w = FA(wish.length);
  ['#cartCount', '#cartCountM'].forEach(s => { const e = $(s); if (e) e.textContent = q; });
  const we = $('#wishCount'); if (we) we.textContent = w;
  const dc = $('#cartDrawerCount'); if (dc) dc.textContent = FA(cartQty()) + ' کالا';
}

function renderCartDrawer() {
  const box = $('#cartItems'), foot = $('#cartFoot');
  if (!box) return;
  if (!cart.length) {
    box.innerHTML = `<div class="empty-mini"><span class="big">🛒</span><b>سبدت خالیه!</b><p>بریم یه چیزی خوشگل پیدا کنیم؟</p></div>`;
    foot.innerHTML = `<button class="btn btn-dark full" data-close-go="shop.html">مشاهده فروشگاه</button>`;
  } else {
    box.innerHTML = cart.map(i => {
      const p = P(i.id);
      return `<div class="cart-line">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="info"><b>${p.name}</b><small>${i.color} | سایز ${i.size}</small>
          <div class="row"><div class="mini-qty"><button data-dec="${p.id}|${i.size}|${i.color}">−</button><span>${FA(i.qty)}</span><button data-inc="${p.id}|${i.size}|${i.color}">+</button></div><span class="price">${money(p.price * i.qty)}</span></div>
          <button class="rm" data-rm="${p.id}|${i.size}|${i.color}">حذف 🗑</button>
        </div></div>`;
    }).join('');
    foot.innerHTML = `<div class="cart-total-row"><span>جمع سبد:</span><span>${money(cartSubtotal())}</span></div>
      <button class="btn btn-dark full" data-close-go="cart.html">مشاهده سبد و تسویه</button>
      <button class="btn btn-ghost full" data-close>ادامه خرید</button>`;
  }
  const sub = cartSubtotal(), pct = Math.min(100, sub / CFG.freeShip * 100);
  const bar = $('#shipBar'), msg = $('#shipMsg');
  if (bar) bar.style.width = pct + '%';
  if (msg) msg.innerHTML = sub >= CFG.freeShip ? '🎉 <b>ارسال سفارشت رایگان شد!</b>' : `تا <b>ارسال رایگان</b> فقط <b>${money(CFG.freeShip - sub)}</b> مونده`;
}
function renderCartAll() { renderCounts(); renderCartDrawer(); if (document.body.dataset.page === 'cart') renderCartPage(); }

/* ═══════ کارت محصول ═══════ */
function badgeHTML(p) {
  let h = '';
  if (p.badge === 'new') h += '<span class="pbadge new">جدید</span>';
  if (p.badge === 'hot') h += '<span class="pbadge hot">پرفروش 🔥</span>';
  if (p.old) h += `<span class="pbadge percent">٪${FA(percent(p))}</span>`;
  return h;
}
function cardHTML(p) {
  const loved = wish.includes(p.id) ? ' loved' : '';
  return `<article class="pcard reveal in">
    <div class="pcard-media">
      <a href="product.html?id=${p.id}"><img class="pcard-img" src="${p.img}" alt="${p.name}" loading="lazy"></a>
      <div class="pcard-badges">${badgeHTML(p)}</div>
      <div class="pcard-actions">
        <button class="pact${loved}" data-wish="${p.id}" aria-label="علاقه‌مندی">♡</button>
        <button class="pact" data-quick="${p.id}" aria-label="مشاهده سریع">👁</button>
      </div>
      <button class="pcard-add" data-add="${p.id}">＋ افزودن به سبد</button>
    </div>
    <div class="pcard-body">
      <span class="pcard-brand">${p.brand}</span>
      <a class="pcard-name" href="product.html?id=${p.id}">${p.name}</a>
      <div class="pcard-rating">${stars(p.rating)}<span>${FA(p.reviews)} دیدگاه</span></div>
      <div class="pcard-colors">${p.colors.slice(0, 4).map(c => `<span class="dot" style="background:${c.c}" title="${c.n}"></span>`).join('')}</div>
      <div class="pcard-price">${money(p.price).replace(' تومان', '')} <small>تومان</small>${p.old ? `<span class="old">${FA(p.old)}</span>` : ''}</div>
    </div></article>`;
}

/* ═══════ لایه‌ها (دراور/مودال/جستجو) ═══════ */
const layers = { cart: '#drawer-cart', menu: '#drawer-menu', search: '#searchWrap', quick: '#modal-quick', size: '#modal-size', auth: '#modal-auth' };
function openLayer(name) {
  closeLayers();
  const el = $(layers[name]); if (!el) return;
  el.classList.add('open'); $('#backdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
  if (name === 'search') setTimeout(() => $('#searchInput').focus(), 80);
}
function closeLayers() {
  $$('.drawer.open,.modal.open,.search-wrap.open').forEach(e => e.classList.remove('open'));
  $('#backdrop').classList.remove('show');
  document.body.style.overflow = '';
  const f = $('.filters.open'); if (f) f.classList.remove('open');
}

/* ═══════ مشاهده سریع ═══════ */
let qvSel = {};
function openQuick(id) {
  const p = P(id); if (!p) return;
  qvSel = { id: p.id, size: p.sizes[0], color: p.colors[0].n, qty: 1 };
  $('#qvBody').innerHTML = `
    <button class="icon-btn" data-close aria-label="بستن" style="position:absolute;top:14px;inset-inline-end:14px;z-index:2;background:var(--surface)">✕</button>
    <a href="product.html?id=${p.id}"><img class="main" src="${p.img}" alt="${p.name}"></a>
    <div class="qv-info">
      <span class="pcard-brand">${p.brand} | ${CFG.cats[p.cat]}</span>
      <h3>${p.name}</h3>
      <div class="pcard-rating">${stars(p.rating)}<span>${FA(p.reviews)} دیدگاه | ${FA(p.sold)} فروش</span></div>
      <div class="qv-price">${money(p.price)} ${p.old ? `<span class="old">${money(p.old)}</span>` : ''}</div>
      <p style="font-size:13px;color:var(--muted)">${p.desc.slice(0, 110)}…</p>
      <div class="opt-label">رنگ: <b id="qvColorName">${qvSel.color}</b></div>
      <div class="color-pick">${p.colors.map((c, i) => `<button data-qvc="${c.n}" class="${i === 0 ? 'on' : ''}" style="background:${c.c}" title="${c.n}" aria-label="${c.n}"></button>`).join('')}</div>
      <div class="opt-label">سایز:</div>
      <div class="size-pick">${p.sizes.map((s, i) => `<button data-qvs="${s}" class="${i === 0 ? 'on' : ''}">${s}</button>`).join('')}</div>
      <div class="row">
        <div class="qty"><button data-qvq="-1">−</button><span id="qvQty">۱</span><button data-qvq="1">+</button></div>
        <button class="btn btn-dark" style="flex:1" data-qvadd>افزودن به سبد</button>
      </div>
      <a href="product.html?id=${p.id}" class="btn btn-ghost full sm" style="margin-top:10px">مشاهده کامل محصول ←</a>
    </div>`;
  openLayer('quick');
}

/* ═══════ جستجو ── */
function doSearch(q) {
  const box = $('#searchResults'); if (!box) return;
  q = q.trim();
  if (q.length < 1) { box.innerHTML = ''; return; }
  const res = MODERA_PRODUCTS.filter(p => (p.name + ' ' + p.brand + ' ' + CFG.cats[p.cat] + ' ' + p.tags.join(' ')).includes(q)).slice(0, 6);
  box.innerHTML = res.length ? res.map(p => `<a class="sr-item" href="product.html?id=${p.id}"><img src="${p.img}" alt=""><div><b>${p.name}</b><span>${money(p.price)}</span></div></a>`).join('')
    : `<p style="grid-column:1/-1;text-align:center;color:var(--muted)">چیزی پیدا نشد! 😢 <a href="shop.html" style="color:var(--accent-deep);font-weight:700">مشاهده همه محصولات</a></p>`;
}

/* ═══════ شمارش معکوس ═══════ */
function initCountdown() {
  const els = $$('.countdown'); if (!els.length) return;
  let end = store.get('modera_sale_end', 0);
  if (!end || end < Date.now()) { end = Date.now() + 36 * 3600 * 1000; store.set('modera_sale_end', end); }
  const tick = () => {
    let d = Math.max(0, end - Date.now());
    const dd = Math.floor(d / 864e5); d -= dd * 864e5;
    const hh = Math.floor(d / 36e5); d -= hh * 36e5;
    const mm = Math.floor(d / 6e4); const ss = Math.floor((d - mm * 6e4) / 1e3);
    els.forEach(el => {
      const set = (k, v) => { const e = el.querySelector(`[data-cd="${k}"]`); if (e) e.textContent = faPad(v); };
      set('d', dd); set('h', hh); set('m', mm); set('s', ss);
    });
    if (end - Date.now() < 0) { end = Date.now() + 36 * 3600 * 1000; store.set('modera_sale_end', end); }
  };
  tick(); setInterval(tick, 1000);
}

/* ═══════ اسلایدر هیرو ═══════ */
function initHero() {
  const track = $('#heroTrack'); if (!track) return;
  const slides = $$('.hero-slide', track), dots = $('#heroDots');
  let cur = 0, timer;
  dots.innerHTML = slides.map((_, i) => `<button data-dot="${i}" class="${i === 0 ? 'on' : ''}" aria-label="اسلاید ${FA(i + 1)}"></button>`).join('');
  const go = i => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === cur));
    $$('button', dots).forEach((d, k) => d.classList.toggle('on', k === cur));
  };
  const play = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 6500); };
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', play);
  dots.addEventListener('click', e => { const b = e.target.closest('[data-dot]'); if (b) { go(Number(b.dataset.dot)); play(); } });
  $$('.hero-arrow').forEach(a => a.addEventListener('click', () => { go(cur + (a.classList.contains('next') ? 1 : -1)); play(); }));
  play();
}

/* ═══════ ریل‌های اسکرول (سازگار با همه مرورگرها در RTL) ═══════ */
function scrollType() {
  const d = document.createElement('div');
  d.style.cssText = 'width:50px;height:1px;overflow:scroll;position:absolute;top:-9999px;direction:rtl';
  d.innerHTML = '<div style="width:100px;height:1px"></div>';
  document.body.appendChild(d);
  let t = 'default';
  if (d.scrollLeft > 0) t = 'default'; else { d.scrollLeft = 1; t = d.scrollLeft === 0 ? 'negative' : 'reverse'; }
  d.remove(); return t;
}
const ST = scrollType();
function initRails() {
  $$('[data-railbtn]').forEach(btn => btn.addEventListener('click', () => {
    const rail = document.getElementById(btn.dataset.railbtn); if (!rail) return;
    const step = rail.clientWidth * 0.8 * (btn.dataset.dir === 'next' ? 1 : -1);
    const target = ST === 'default' ? rail.scrollLeft + step : rail.scrollLeft - step;
    rail.scrollTo({ left: target, behavior: 'smooth' });
  }));
}

/* ═══════ صفحه اصلی ═══════ */
function initHome() {
  const flash = $('#flashRail');
  if (flash) flash.innerHTML = MODERA_PRODUCTS.filter(p => p.old).map(cardHTML).join('');
  const best = $('#bestGrid');
  if (best) best.innerHTML = [...MODERA_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 8).map(cardHTML).join('');
  const nw = $('#newRail');
  if (nw) nw.innerHTML = [...MODERA_PRODUCTS].sort((a, b) => b.added - a.added).slice(0, 8).map(cardHTML).join('');
}

/* ═══════ فروشگاه ═══════ */
const COLOR_FAMS = [['سفید', ['سفید'], '#f5f5f5'], ['مشکی', ['مشکی', 'ذغالی'], '#262626'], ['کرمی', ['کرم', 'شتری', 'عسلی'], '#e3d0ae'], ['آبی', ['آبی', 'سرمه'], '#5b7fb4'], ['طوسی', ['طوسی'], '#9a9a9a'], ['قهوه‌ای', ['قهوه', 'آجری'], '#7a4a26'], ['سبز', ['زیتون'], '#7a7a4d'], ['صورتی', ['صورتی'], '#e8b4b8']];
let shopState = { cats: new Set(), brands: new Set(), sizes: new Set(), colors: new Set(), max: 5000000, sale: false, sort: 'newest', page: 1, q: '' };
const PER_PAGE = 6;

function initShop() {
  if (document.body.dataset.page !== 'shop') return;
  const url = new URLSearchParams(location.search);
  if (url.get('cat')) shopState.cats.add(url.get('cat'));
  if (url.get('type')) shopState.type = url.get('type');
  if (url.get('sale')) shopState.sale = true;
  if (url.get('q')) shopState.q = url.get('q');
  if (url.get('sort')) shopState.sort = url.get('sort');

  // ساخت فیلترها
  const catBox = $('#fCats');
  catBox.innerHTML = Object.entries(CFG.cats).map(([k, v]) => {
    const n = MODERA_PRODUCTS.filter(p => p.cat === k).length;
    return `<label class="fcheck"><input type="checkbox" data-fcat="${k}" ${shopState.cats.has(k) ? 'checked' : ''}> ${v} <small>(${FA(n)})</small></label>`;
  }).join('');
  const brands = [...new Set(MODERA_PRODUCTS.map(p => p.brand))];
  $('#fBrands').innerHTML = brands.map(b => {
    const n = MODERA_PRODUCTS.filter(p => p.brand === b).length;
    return `<label class="fcheck"><input type="checkbox" data-fbrand="${b}"> ${b} <small>(${FA(n)})</small></label>`;
  }).join('');
  const sizes = ['S', 'M', 'L', 'XL', 'XXL', '۴۰', '۴۲', '۴۴', 'فری‌سایز'];
  $('#fSizes').innerHTML = sizes.map(s => `<button data-fsize="${s}">${s}</button>`).join('');
  $('#fColors').innerHTML = COLOR_FAMS.map(([n, , c]) => `<button class="swatch" data-fcolor="${n}" style="background:${c}" title="${n}" aria-label="${n}"></button>`).join('');
  $('#onlySale').checked = shopState.sale;
  $('#sortSelect').value = shopState.sort;
  if (shopState.q) { const t = $('#shopQ'); if (t) t.textContent = `نتایج جستجو برای «${shopState.q}»`; }

  // رویدادها
  $('#shopFilters').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.fcat) t.checked ? shopState.cats.add(t.dataset.fcat) : shopState.cats.delete(t.dataset.fcat);
    if (t.dataset.fbrand) t.checked ? shopState.brands.add(t.dataset.fbrand) : shopState.brands.delete(t.dataset.fbrand);
    if (t.id === 'onlySale') shopState.sale = t.checked;
    shopState.page = 1; renderShop();
  });
  $('#shopFilters').addEventListener('click', e => {
    const s = e.target.closest('[data-fsize]'), c = e.target.closest('[data-fcolor]');
    if (s) { s.classList.toggle('on'); s.classList.contains('on') ? shopState.sizes.add(s.dataset.fsize) : shopState.sizes.delete(s.dataset.fsize); shopState.page = 1; renderShop(); }
    if (c) { c.classList.toggle('on'); c.classList.contains('on') ? shopState.colors.add(c.dataset.fcolor) : shopState.colors.delete(c.dataset.fcolor); shopState.page = 1; renderShop(); }
  });
  $('#priceMax').addEventListener('input', e => {
    shopState.max = Number(e.target.value);
    $('#priceOut').textContent = 'تا ' + money(shopState.max);
    shopState.page = 1; renderShop();
  });
  $('#sortSelect').addEventListener('change', e => { shopState.sort = e.target.value; shopState.page = 1; renderShop(); });
  $('#chips').addEventListener('click', e => {
    const b = e.target.closest('[data-chip]'); if (!b) return;
    const [k, v] = b.dataset.chip.split(':');
    if (k === 'cat') { shopState.cats.delete(v); $(`[data-fcat="${v}"]`).checked = false; }
    if (k === 'brand') { shopState.brands.delete(v); $(`[data-fbrand="${v}"]`).checked = false; }
    if (k === 'size') { shopState.sizes.delete(v); $(`[data-fsize="${v}"]`).classList.remove('on'); }
    if (k === 'color') { shopState.colors.delete(v); $(`[data-fcolor="${v}"]`).classList.remove('on'); }
    if (k === 'sale') { shopState.sale = false; $('#onlySale').checked = false; }
    if (k === 'type') delete shopState.type;
    if (k === 'q') { shopState.q = ''; const t = $('#shopQ'); if (t) t.textContent = ''; }
    shopState.page = 1; renderShop();
  });
  $('#pagination').addEventListener('click', e => {
    const b = e.target.closest('[data-pg]'); if (!b) return;
    shopState.page = Number(b.dataset.pg); renderShop();
    $('#shopTop').scrollIntoView({ behavior: 'smooth' });
  });
  $('#clearFilters')?.addEventListener('click', () => {
    shopState = { cats: new Set(), brands: new Set(), sizes: new Set(), colors: new Set(), max: 5000000, sale: false, sort: shopState.sort, page: 1, q: '' };
    $$('#shopFilters input[type=checkbox]').forEach(i => i.checked = false);
    $$('#shopFilters .on').forEach(i => i.classList.remove('on'));
    $('#priceMax').value = 5000000; $('#priceOut').textContent = 'تا ' + money(5000000);
    const t = $('#shopQ'); if (t) t.textContent = '';
    renderShop();
  });
  renderShop();
}
function shopFiltered() {
  let list = [...MODERA_PRODUCTS];
  const s = shopState;
  if (s.cats.size) list = list.filter(p => s.cats.has(p.cat));
  if (s.type) list = list.filter(p => p.type === s.type);
  if (s.brands.size) list = list.filter(p => s.brands.has(p.brand));
  if (s.sizes.size) list = list.filter(p => p.sizes.some(z => s.sizes.has(z)));
  if (s.colors.size) list = list.filter(p => p.colors.some(c => [...s.colors].some(fam => COLOR_FAMS.find(f => f[0] === fam)[1].some(k => c.n.includes(k)))));
  list = list.filter(p => p.price <= s.max);
  if (s.sale) list = list.filter(p => p.old);
  if (s.q) list = list.filter(p => (p.name + p.brand + p.tags.join('')).includes(s.q));
  const sorts = { newest: (a, b) => b.added - a.added, popular: (a, b) => b.sold - a.sold, cheap: (a, b) => a.price - b.price, expensive: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating };
  list.sort(sorts[s.sort] || sorts.newest);
  return list;
}
function renderShop() {
  const list = shopFiltered();
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  shopState.page = Math.min(shopState.page, pages);
  const items = list.slice((shopState.page - 1) * PER_PAGE, shopState.page * PER_PAGE);
  $('#shopGrid').innerHTML = items.length ? items.map(cardHTML).join('')
    : `<div class="empty-state" style="grid-column:1/-1"><span class="big">🔍</span><h2>محصولی پیدا نشد!</h2><p>فیلترها رو کمتر کن یا عبارت دیگه‌ای رو امتحان کن.</p></div>`;
  $('#resultCount').textContent = `${FA(list.length)} محصول`;
  $('#pagination').innerHTML = pages > 1 ? Array.from({ length: pages }, (_, i) =>
    `<button data-pg="${i + 1}" class="${i + 1 === shopState.page ? 'on' : ''}">${FA(i + 1)}</button>`).join('') : '';
  // چیپ‌ها
  const chips = [];
  shopState.cats.forEach(c => chips.push(['cat:' + c, CFG.cats[c]]));
  shopState.brands.forEach(b => chips.push(['brand:' + b, b]));
  shopState.sizes.forEach(z => chips.push(['size:' + z, 'سایز ' + z]));
  shopState.colors.forEach(c => chips.push(['color:' + c, c]));
  if (shopState.sale) chips.push(['sale:1', 'تخفیف‌دارها 🔥']);
  if (shopState.type) chips.push(['type:' + shopState.type, 'فیلتر: ' + shopState.type]);
  if (shopState.q) chips.push(['q:1', 'جستجو: ' + shopState.q]);
  $('#chips').innerHTML = chips.map(([k, v]) => `<span class="chip-x">${v}<button data-chip="${k}">✕</button></span>`).join('');
  // به‌روزرسانی URL
  const u = new URLSearchParams();
  if (shopState.cats.size === 1) u.set('cat', [...shopState.cats][0]);
  if (shopState.sale) u.set('sale', '1');
  if (shopState.sort !== 'newest') u.set('sort', shopState.sort);
  try { history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '')); } catch {}
}

/* ═══════ صفحه محصول ═══════ */
let pdpSel = {};
function initProduct() {
  if (document.body.dataset.page !== 'product') return;
  const id = Number(new URLSearchParams(location.search).get('id')) || 1;
  const p = P(id) || MODERA_PRODUCTS[0];
  document.title = p.name + ' | مُدرا';
  pdpSel = { id: p.id, size: null, color: p.colors[0].n, qty: 1 };
  // بازدیدهای اخیر
  let recent = store.get('modera_recent', []).filter(x => x !== p.id);
  recent.unshift(p.id); store.set('modera_recent', recent.slice(0, 8));

  const lowStock = p.stock <= 10;
  $('#pdpWrap').innerHTML = `
  <nav class="breadcrumb" style="margin-bottom:18px"><a href="index.html">خانه</a> / <a href="shop.html">فروشگاه</a> / <a href="shop.html?cat=${p.cat}">${CFG.cats[p.cat]}</a> / <span>${p.name}</span></nav>
  <div class="pdp">
    <div class="pdp-gallery">
      <div class="pdp-main" id="pdpMain"><img id="pdpImg" src="${p.img}" alt="${p.name}"><span class="zoom-hint">🔍 کلیک برای زوم</span></div>
      <div class="pdp-thumbs">
        <button class="thumb on" data-src="${p.img}"><img src="${p.img}" alt="نمای محصول"></button>
        <button class="thumb" data-src="assets/img/d1.jpg"><img src="assets/img/d1.jpg" alt="جنس پارچه" loading="lazy"></button>
        <button class="thumb" data-src="assets/img/d2.jpg"><img src="assets/img/d2.jpg" alt="تن‌خور" loading="lazy"></button>
      </div>
    </div>
    <div class="pdp-info">
      <span class="pdp-brand">${p.brand} | ${CFG.cats[p.cat]}</span>
      <h1 class="pdp-title">${p.name}</h1>
      <div class="rating-row">${stars(p.rating)} <b>${p.rating.toLocaleString('fa-IR')}</b> از ${FA(p.reviews)} دیدگاه <span>•</span> <b>${FA(p.sold)}+</b> فروش موفق</div>
      <div class="pdp-price"><b>${money(p.price)}</b>${p.old ? `<span class="old">${money(p.old)}</span><span class="save">٪${FA(percent(p))} تخفیف</span>` : ''}</div>
      <p class="stock-note ${lowStock ? 'low' : 'ok'}">${lowStock ? `🔥 فقط ${FA(p.stock)} عدد مونده! عجله کن` : `✓ موجود در انبار (آماده ارسال)`}</p>
      <div class="opt-label">رنگ: <b id="pdpColorName">${pdpSel.color}</b></div>
      <div class="color-pick">${p.colors.map((c, i) => `<button data-pc="${c.n}" class="${i === 0 ? 'on' : ''}" style="background:${c.c}" title="${c.n}" aria-label="${c.n}"></button>`).join('')}</div>
      <div class="opt-label">سایز: ${pdpSel.size ? `<b id="pdpSizeName">${pdpSel.size}</b>` : '<span style="color:var(--sale);font-size:12.5px">یه سایز انتخاب کن 👇</span>'} <button data-open="size">📏 راهنمای سایز</button></div>
      <div class="size-pick" id="pdpSizes">${p.sizes.map(s => `<button data-ps="${s}">${s}</button>`).join('')}</div>
      <div class="pdp-ctas" id="pdpCtas">
        <div class="qty"><button data-pq="-1">−</button><span id="pdpQty">۱</span><button data-pq="1">+</button></div>
        <button class="btn btn-dark" data-pdpadd>🛒 افزودن به سبد</button>
        <button class="btn btn-accent" data-pdpbuy>⚡ خرید فوری</button>
      </div>
      <div class="pdp-tools">
        <button class="btn btn-ghost sm" data-wishp="${p.id}">${wish.includes(p.id) ? '❤️ در علاقه‌مندی‌هاست' : '🤍 افزودن به علاقه‌مندی‌ها'}</button>
        <button class="btn btn-ghost sm" data-share>↗ اشتراک‌گذاری</button>
      </div>
      <div class="pdp-meta">
        <span>📦 کد کالا: <b dir="ltr">MD-${p.id}00${p.id}</b></span>
        <span>🏷 دسته: ${CFG.cats[p.cat]} | برند: ${p.brand}</span>
        <span>🔖 برچسب‌ها: ${p.tags.join('، ')}</span>
        <span>🚚 ارسال به سراسر کشور | ${CFG.freeShip <= 5000000 ? 'رایگان بالای ' + money(CFG.freeShip) : ''}</span>
      </div>
      <div class="trust-mini"><div><span>🛡️</span>ضمانت اصالت</div><div><span>↩️</span>۷ روز مرجوعی</div><div><span>💳</span>پرداخت امن</div></div>
    </div>
  </div>
  <div class="pdp-tabs">
    <div class="tabs"><button class="tab on" data-tab="d1">توضیحات</button><button class="tab" data-tab="d2">مشخصات فنی</button><button class="tab" data-tab="d3">دیدگاه‌ها (${FA(p.reviews)})</button></div>
    <div class="tabpanel on" id="tp-d1"><p style="line-height:2.2">${p.desc}</p>
      <ul style="margin-top:14px;display:grid;gap:8px;font-size:14px"><li>✨ ${FA(p.sold)}+ مشتری راضی این محصول رو خریدن</li><li>✨ ${lowStock ? 'موجودی محدود — زودتر سفارش بده' : 'موجود در انبار، ارسال فوری'}</li><li>✨ ۷ روز ضمانت بی‌قیدوشرط مرجوعی</li></ul></div>
    <div class="tabpanel" id="tp-d2"><table class="spec-table">${p.specs.map(([k, v]) => `<tr><td>${k}</td><td><b>${v}</b></td></tr>`).join('')}<tr><td>گارانتی</td><td><b>۷ روز مرجوعی + ضمانت اصالت</b></td></tr></table></div>
    <div class="tabpanel" id="tp-d3"><div id="revList"></div>
      <h4 style="margin:22px 0 12px">✍️ نظرت رو بنویس</h4>
      <form class="form" id="revForm">
        <div class="two"><label>نامت<input required placeholder="مثلاً سارا"></label>
        <label>امتیازت<select id="revRate"><option value="5">⭐⭐⭐⭐⭐ عالی</option><option value="4">⭐⭐⭐⭐ خوب</option><option value="3">⭐⭐⭐ متوسط</option><option value="2">⭐⭐ ضعیف</option><option value="1">⭐ خیلی بد</option></select></label></div>
        <label>عنوان نظر<input required placeholder="خلاصه نظرت"></label>
        <label>متن نظر<textarea required placeholder="تجربه‌ات از این محصول…"></textarea></label>
        <button class="btn btn-dark" type="submit" style="align-self:flex-start">ثبت نظر</button>
      </form></div>
  </div>
  <section class="section" style="padding-top:10px"><div class="sec-head"><h2 class="sec-title">🎯 محصولات مرتبط<small>شاید این‌ها هم به سلیقه‌ت بخوره</small></h2><a class="sec-link" href="shop.html?cat=${p.cat}">مشاهده همه ←</a></div>
    <div class="grid-products">${MODERA_PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4).map(cardHTML).join('') || MODERA_PRODUCTS.filter(x => x.id !== p.id).slice(0, 4).map(cardHTML).join('')}</div></section>
  <div class="sticky-atc" id="stickyAtc"><div class="container"><img src="${p.img}" alt=""><div class="t"><b>${p.name}</b><span>${money(p.price)}</span></div><button class="btn btn-dark sm" data-pdpadd>افزودن به سبد</button></div></div>`;

  renderReviews(p);
  // گالری
  const main = $('#pdpMain'), img = $('#pdpImg');
  $$('.thumb').forEach(t => t.addEventListener('click', () => {
    $$('.thumb').forEach(x => x.classList.remove('on')); t.classList.add('on');
    main.classList.remove('zoomed'); img.style.transform = '';
    img.src = t.dataset.src;
  }));
  main.addEventListener('click', () => main.classList.toggle('zoomed'));
  main.addEventListener('mousemove', e => {
    const r = main.getBoundingClientRect();
    img.style.transformOrigin = `${((e.clientX - r.left) / r.width * 100).toFixed(0)}% ${((e.clientY - r.top) / r.height * 100).toFixed(0)}%`;
  });
  // استیکی
  const ctas = $('#pdpCtas'), bar = $('#stickyAtc');
  new IntersectionObserver(en => bar.classList.toggle('show', !en[0].isIntersecting && en[0].boundingClientRect.top < 0)).observe(ctas);
  // فرم نظر
  $('#revForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const mine = store.get('modera_myrev_' + p.id, []);
    mine.unshift({ name: f.querySelector('input').value, rating: Number($('#revRate').value), title: f.querySelectorAll('input')[1].value, text: f.querySelector('textarea').value, date: 'همین الان ✨' });
    store.set('modera_myrev_' + p.id, mine);
    f.reset(); renderReviews(p); toast('نظرت ثبت شد! مرسی که همراهی 🙏', 'ok');
  });
}
function renderReviews(p) {
  const mine = store.get('modera_myrev_' + p.id, []);
  $('#revList').innerHTML = [...mine, ...MODERA_SEED_REVIEWS].map(r => `
    <div class="review"><div class="review-head"><span class="avatar" style="width:40px;height:40px;font-size:17px">${r.name[0]}</span><b>${r.name}</b><time>${r.date}</time></div>
    <div style="margin-bottom:6px">${stars(r.rating)}</div><h5>${r.title}</h5><p>${r.text}</p></div>`).join('');
}

/* ═══════ صفحه سبد ═══════ */
let coupon = null;
function renderCartPage() {
  const wrap = $('#cartLines'); if (!wrap) return;
  coupon = store.get('modera_coupon', null);
  if (!cart.length) {
    $('#cartWrap').innerHTML = `<div class="empty-state"><span class="big">🛒</span><h2>سبد خریدت خالیه!</h2><p>هنوز هیچی انتخاب نکردی؛ بزن بریم خرید 🛍</p><a href="shop.html" class="btn btn-dark">رفتن به فروشگاه</a></div>`;
    const cs = $('#crossSec'); if (cs) cs.style.display = 'none';
    return;
  }
  wrap.innerHTML = cart.map(i => {
    const p = P(i.id);
    return `<div class="cart-item"><img src="${p.img}" alt="${p.name}">
      <div class="citem-info"><b><a href="product.html?id=${p.id}">${p.name}</a></b><small>${i.color} | سایز ${i.size}</small>
        <div class="mini-qty" style="display:inline-flex"><button data-dec="${p.id}|${i.size}|${i.color}">−</button><span>${FA(i.qty)}</span><button data-inc="${p.id}|${i.size}|${i.color}">+</button></div></div>
      <div class="citem-side"><span class="price">${money(p.price * i.qty)}</span><button class="rm" data-rm="${p.id}|${i.size}|${i.color}">حذف 🗑</button></div></div>`;
  }).join('');
  renderTotals();
  const cross = $('#crossRail');
  if (cross) cross.innerHTML = [...MODERA_PRODUCTS].filter(p => !cart.some(i => i.id === p.id)).sort((a, b) => b.sold - a.sold).slice(0, 6).map(cardHTML).join('');
}
function totals() {
  const sub = cartSubtotal();
  let disc = 0;
  if (coupon && sub >= (coupon.min || 0)) disc = Math.round(sub * coupon.percent / 100);
  const ship = sub - disc >= CFG.freeShip || sub === 0 ? 0 : CFG.shipCost;
  return { sub, disc, ship, grand: sub - disc + ship };
}
function renderTotals() {
  const t = totals(), box = $('#cartSummary'); if (!box) return;
  box.innerHTML = `
    ${t.ship === 0 && t.sub > 0 ? '<div class="free-ship-note">🎉 ارسال سفارشت رایگانه!</div>' : ''}
    <div class="coupon-row"><input id="couponInput" placeholder="کد تخفیف داری؟ (WELCOME10)" value="${coupon ? coupon.code : ''}"><button class="btn btn-ghost sm" id="couponBtn">اعمال</button></div>
    ${coupon ? `<p style="font-size:13px;color:var(--success);font-weight:700">✓ کد ${coupon.code} فعال شد (${FA(coupon.percent)}٪ تخفیف)</p>` : '<p style="font-size:12px;color:var(--muted)">💡 کد WELCOME10 رو امتحان کن!</p>'}
    <div class="totals">
      <div><span>جمع کالاها:</span><b>${money(t.sub)}</b></div>
      ${t.disc ? `<div class="disc"><span>تخفیف:</span><b>− ${money(t.disc)}</b></div>` : ''}
      <div><span>هزینه ارسال:</span><b>${t.ship ? money(t.ship) : 'رایگان 🎉'}</b></div>
      <div class="grand"><span>مبلغ نهایی:</span><span>${money(t.grand)}</span></div>
    </div>
    <a href="checkout.html" class="btn btn-accent full">ادامه و پرداخت ←</a>
    <a href="shop.html" class="btn btn-ghost full" style="margin-top:8px">ادامه خرید</a>`;
  $('#couponBtn').addEventListener('click', () => {
    const code = $('#couponInput').value.trim().toUpperCase();
    const c = CFG.coupons[code];
    if (!c) { toast('این کد معتبر نیست 😕', 'err'); return; }
    if (t.sub < c.min) { toast(`این کد برای خرید بالای ${money(c.min)} است`, 'err'); return; }
    coupon = { code, ...c }; store.set('modera_coupon', coupon);
    toast(`کد ${code} اعمال شد! 🎉`, 'ok'); renderTotals();
  });
}

/* ═══════ تسویه حساب ═══════ */
let shipMethod = 'std', payMethod = 'online';
function initCheckout() {
  if (document.body.dataset.page !== 'checkout') return;
  if (!cart.length && !store.get('modera_lastorder', null)) {
    $('#coWrap').innerHTML = `<div class="empty-state"><span class="big">🧺</span><h2>سبدت خالیه!</h2><p>اول یه چیزی به سبد اضافه کن بعد بیا تسویه 😊</p><a href="shop.html" class="btn btn-dark">رفتن به فروشگاه</a></div>`;
    return;
  }
  renderCoSummary();
  $('#shipMethods').addEventListener('click', e => {
    const c = e.target.closest('.pay-card'); if (!c) return;
    shipMethod = c.dataset.ship;
    $$('#shipMethods .pay-card').forEach(x => x.classList.toggle('on', x === c));
    renderCoSummary();
  });
  $('#payMethods').addEventListener('click', e => {
    const c = e.target.closest('.pay-card'); if (!c) return;
    payMethod = c.dataset.pay;
    $$('#payMethods .pay-card').forEach(x => x.classList.toggle('on', x === c));
  });
  $('#placeOrder').addEventListener('click', () => {
    const f = $('#coForm');
    const name = $('#coName').value.trim(), phone = $('#coPhone').value.trim(), addr = $('#coAddr').value.trim(), city = $('#coCity').value.trim();
    let err = '';
    if (name.length < 3) err = 'نامت رو کامل بنویس';
    else if (!/^09\d{9}$/.test(phone.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) err = 'شماره موبایل معتبر نیست (مثل 09123456789)';
    else if (!city) err = 'شهرت رو بنویس';
    else if (addr.length < 10) err = 'آدرست رو کامل‌تر بنویس';
    if (err) { toast(err, 'err'); return; }
    const t = coTotals();
    const order = { num: 'MD-' + Math.floor(100000 + Math.random() * 900000), date: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()), name, phone, city, addr, total: t.grand, pay: payMethod, items: cartQty() };
    store.set('modera_lastorder', order);
    cart = []; coupon = null; store.set('modera_cart', []); store.set('modera_coupon', null); renderCounts();
    $$('#coSteps .step').forEach(s => { s.classList.remove('on'); s.classList.add('done'); });
    $('#coWrap').innerHTML = `<div class="success">
      <div class="check-anim"><svg viewBox="0 0 24 24" class="ic"><path d="m5 12 5 5 9-10"/></svg></div>
      <h2>سفارشت ثبت شد! 🎉</h2><p>مرسی ${order.name} جان! سفارشت با موفقیت ثبت شد و پیامک تایید برات ارسال می‌شه.</p>
      <div class="order-num" dir="ltr">${order.num}</div>
      <p style="font-size:14px;color:var(--muted)">📅 ${order.date} | 💰 ${money(order.total)} | 📍 ${order.city}</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:24px;flex-wrap:wrap">
        <a href="track.html?o=${order.num}" class="btn btn-dark">📦 پیگیری سفارش</a>
        <a href="shop.html" class="btn btn-ghost">ادامه خرید</a>
      </div></div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
function coTotals() {
  const t = totals();
  const ship = (shipMethod === 'std' && t.sub - t.disc >= CFG.freeShip) ? 0 : shipMethod === 'exp' ? CFG.expressCost : t.ship;
  return { ...t, ship, grand: t.sub - t.disc + ship };
}
function renderCoSummary() {
  const t = coTotals(), box = $('#orderSummary'); if (!box) return;
  box.innerHTML = `<div class="order-lines">${cart.map(i => { const p = P(i.id); return `<div class="order-line"><img src="${p.img}" alt=""><div><b>${p.name}</b><span>${i.color} | ${i.size} | تعداد ${FA(i.qty)}</span></div><span class="p">${money(p.price * i.qty)}</span></div>`; }).join('')}</div>
  <div class="totals"><div><span>جمع کالاها:</span><b>${money(t.sub)}</b></div>
  ${t.disc ? `<div class="disc"><span>تخفیف:</span><b>− ${money(t.disc)}</b></div>` : ''}
  <div><span>ارسال (${shipMethod === 'exp' ? 'پیشتاز' : 'عادی'}):</span><b>${t.ship ? money(t.ship) : 'رایگان 🎉'}</b></div>
  <div class="grand"><span>مبلغ نهایی:</span><span>${money(t.grand)}</span></div></div>`;
}

/* ═══════ علاقه‌مندی‌ها / پیگیری ═══════ */
function initWishlist() {
  if (document.body.dataset.page !== 'wishlist') return;
  const box = $('#wishGrid');
  const items = wish.map(P).filter(Boolean);
  box.innerHTML = items.length ? items.map(cardHTML).join('')
    : `<div class="empty-state" style="grid-column:1/-1"><span class="big">💔</span><h2>هنوز چیزی رو نپسندیدی!</h2><p>روی قلب هر محصول بزن تا اینجا ذخیره بشه 🤍</p><a href="shop.html" class="btn btn-dark">کشف محصولات</a></div>`;
}
function initTrack() {
  if (document.body.dataset.page !== 'track') return;
  const o = new URLSearchParams(location.search).get('o');
  if (o) { $('#trackNum').value = o; showTrack(o); }
  $('#trackForm').addEventListener('submit', e => { e.preventDefault(); showTrack($('#trackNum').value.trim()); });
}
function showTrack(num) {
  if (!num) { toast('شماره سفارش رو بنویس', 'err'); return; }
  let h = 0; for (const ch of num) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const stage = h % 4;
  const steps = [
    ['🧾', 'ثبت سفارش', 'سفارشت با موفقیت ثبت شد'],
    ['📦', 'آماده‌سازی', 'سفارشت داره بسته‌بندی می‌شه'],
    ['🚚', 'ارسال شد', 'تحویل پست/تیپاکس داده شد'],
    ['🏠', 'تحویل شد', 'به دستت رسیده؛ مبارکه! 🎉']
  ];
  const last = store.get('modera_lastorder', null);
  $('#trackResult').innerHTML = `<div class="timeline" style="margin-top:8px">
    <p style="margin-bottom:18px">سفارش <b dir="ltr">${num}</b>${last && last.num === num ? ` | 💰 ${money(last.total)}` : ''}</p>
    ${steps.map(([ic, t, d], i) => `<div class="tstep ${i < stage ? 'done' : i === stage ? 'now' : ''}"><span class="dot2">${i < stage ? '✓' : ic}</span><div><b>${t}</b><small>${d}</small></div></div>`).join('')}
  </div>`;
}

/* ═══════ رویدادهای سراسری ═══════ */
function globalEvents() {
  document.addEventListener('click', e => {
    const q = sel => e.target.closest(sel);
    let m;
    if (m = q('[data-open]')) { const map = { menu: 'menu', cart: 'cart', search: 'search', auth: 'auth', size: 'size' }; openLayer(map[m.dataset.open] || m.dataset.open); }
    if (q('[data-close]')) closeLayers();
    if (m = q('[data-close-go]')) { closeLayers(); location.href = m.dataset.closeGo; }
    if (m = q('[data-add]')) addToCart(Number(m.dataset.add));
    if (m = q('[data-quick]')) openQuick(Number(m.dataset.quick));
    if (m = q('[data-wish]')) {
      const id = Number(m.dataset.wish);
      wish.includes(id) ? wish = wish.filter(x => x !== id) : wish.push(id);
      saveWish(); toast(wish.includes(id) ? 'به علاقه‌مندی‌ها اضافه شد 🤍' : 'از علاقه‌مندی‌ها حذف شد');
      if (document.body.dataset.page === 'wishlist') initWishlist();
    }
    if (m = q('[data-wishp]')) {
      const id = Number(m.dataset.wishp);
      wish.includes(id) ? wish = wish.filter(x => x !== id) : wish.push(id);
      saveWish(); m.textContent = wish.includes(id) ? '❤️ در علاقه‌مندی‌هاست' : '🤍 افزودن به علاقه‌مندی‌ها';
    }
    if (m = q('[data-tab]')) {
      const scope = m.closest('.tabs').parentElement;
      $$('.tab', m.closest('.tabs')).forEach(t => t.classList.toggle('on', t === m));
      $$('.tabpanel', scope).forEach(p => p.classList.toggle('on', p.id === 'tp-' + m.dataset.tab));
    }
    if (m = q('[data-inc],[data-dec]')) {
      const [id, size, color] = (m.dataset.inc || m.dataset.dec).split('|');
      const it = cart.find(i => i.id === Number(id) && i.size === size && i.color === color);
      if (it) { m.dataset.inc ? it.qty++ : it.qty--; if (it.qty < 1) cart = cart.filter(x => x !== it); saveCart(); }
    }
    if (m = q('[data-rm]')) {
      const [id, size, color] = m.dataset.rm.split('|');
      cart = cart.filter(i => !(i.id === Number(id) && i.size === size && i.color === color));
      saveCart(); toast('از سبد حذف شد 🗑');
    }
    // محصول: انتخاب‌ها
    if (m = q('[data-pc]')) { pdpSel.color = m.dataset.pc; $$('[data-pc]').forEach(x => x.classList.toggle('on', x === m)); $('#pdpColorName').textContent = m.dataset.pc; }
    if (m = q('[data-ps]')) { pdpSel.size = m.dataset.ps; $$('[data-ps]').forEach(x => x.classList.toggle('on', x === m)); }
    if (m = q('[data-pq]')) { pdpSel.qty = Math.max(1, Math.min(9, pdpSel.qty + Number(m.dataset.pq))); $('#pdpQty').textContent = FA(pdpSel.qty); }
    if (q('[data-pdpadd]')) {
      if (!pdpSel.size) { toast('اول یه سایز انتخاب کن! 👆', 'err'); $('#pdpSizes').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      addToCart(pdpSel.id, pdpSel.size, pdpSel.color, pdpSel.qty);
    }
    if (q('[data-pdpbuy]')) {
      if (!pdpSel.size) { toast('اول یه سایز انتخاب کن! 👆', 'err'); return; }
      addToCart(pdpSel.id, pdpSel.size, pdpSel.color, pdpSel.qty, true); location.href = 'checkout.html';
    }
    if (q('[data-share]')) {
      (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(() => toast('لینک محصول کپی شد! 🔗', 'ok')).catch(() => toast('لینک: ' + location.href));
    }
    // مشاهده سریع
    if (m = q('[data-qvc]')) { qvSel.color = m.dataset.qvc; $$('[data-qvc]').forEach(x => x.classList.toggle('on', x === m)); $('#qvColorName').textContent = m.dataset.qvc; }
    if (m = q('[data-qvs]')) { qvSel.size = m.dataset.qvs; $$('[data-qvs]').forEach(x => x.classList.toggle('on', x === m)); }
    if (m = q('[data-qvq]')) { qvSel.qty = Math.max(1, Math.min(9, qvSel.qty + Number(m.dataset.qvq))); $('#qvQty').textContent = FA(qvSel.qty); }
    if (q('[data-qvadd]')) { addToCart(qvSel.id, qvSel.size, qvSel.color, qvSel.qty, true); closeLayers(); toast('به سبد اضافه شد 🛍', 'ok'); openLayer('cart'); }
    // آکاردئون
    if (m = q('.acc-head')) {
      const item = m.parentElement, body = $('.acc-body', item), open = item.classList.contains('open');
      $$('.acc-item.open').forEach(x => { x.classList.remove('open'); $('.acc-body', x).style.maxHeight = null; });
      if (!open) { item.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
    }
    // پوسته دمو
    if (m = q('[data-skin]')) {
      document.documentElement.dataset.skin = m.dataset.skin;
      store.set('modera_skin', m.dataset.skin);
      $$('[data-skin]').forEach(x => x.classList.toggle('on', x === m));
      toast('رنگ قالب عوض شد 🎨', 'ok');
    }
    if (q('#demoFab')) $('#demoPanel').classList.toggle('open');
    if (q('#buyThemeLink')) { e.preventDefault(); toast('💎 این دکمه نمایشی است — لینک فروشگاهت را در فایل overlays.html بگذار'); }
    if (q('#toTop')) window.scrollTo({ top: 0, behavior: 'smooth' });
    if (q('#filterFab')) { $('.filters').classList.add('open'); $('#backdrop').classList.add('show'); }
    if (q('#filtersClose')) closeLayers();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLayers(); $('#demoPanel')?.classList.remove('open'); } });
  $('#backdrop').addEventListener('click', closeLayers);
  $('#searchInput')?.addEventListener('input', e => doSearch(e.target.value));
  $$('.search-tags button').forEach(b => b.addEventListener('click', () => { $('#searchInput').value = b.textContent; doSearch(b.textContent); }));
  // فرم‌های نمایشی
  $$('[data-fake]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); toast(f.dataset.fake, 'ok'); f.reset(); if (f.closest('.modal')) closeLayers(); }));
  // اسکرول
  window.addEventListener('scroll', () => {
    $('#header').classList.toggle('scrolled', scrollY > 10);
    $('#toTop').classList.toggle('show', scrollY > 600);
  }, { passive: true });
  // لینک فعال منو
  const page = document.body.dataset.page;
  const navMap = { index: 'index', shop: 'shop', product: 'shop', blog: 'blog', wishlist: 'wishlist', cart: 'shop' };
  $$(`[data-nav="${navMap[page] || page}"]`).forEach(a => a.classList.add('active'));
}

/* ── انیمیشن ظهور ── */
function initReveal() {
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: 0.08 });
  $$('.reveal:not(.in)').forEach(el => io.observe(el));
}

/* ── شروع ── */
document.addEventListener('DOMContentLoaded', () => {
  const skin = store.get('modera_skin', 'gold');
  document.documentElement.dataset.skin = skin;
  $$(`[data-skin="${skin}"]`).forEach(x => x.classList.add('on'));
  $('#year').textContent = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date());
  renderCounts(); renderCartDrawer();
  globalEvents(); initHero(); initRails(); initCountdown(); initReveal();
  initHome(); initShop(); initProduct(); renderCartPage(); initCheckout(); initWishlist(); initTrack();
});
