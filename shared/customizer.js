// ═══════════════════════════════════════
// IFL Customizer V2 — Mockup Logic
// ═══════════════════════════════════════

// ── Simulated Data ──────────────────────
// Watches with real PNG layers have a `layers` property pointing to the asset folder
const ASSET_BASE = '../assets';

const WATCHES = [
    // ── Real PNG watches (3 test references from Bilel) ──
    {
        id: 'citizen-soldier',
        brand: 'Citizen',
        model: 'Soldier',
        movement: 'Automatic',
        sizes: ['40mm'],
        dialColors: ['Black'],
        caseColors: ['Silver'],
        basePrice: 275,
        layers: `${ASSET_BASE}/citizen-soldier`
    },
    {
        id: 'seiko-soldier',
        brand: 'Seiko',
        model: 'Soldier',
        movement: 'Automatic',
        sizes: ['42mm'],
        dialColors: ['Black'],
        caseColors: ['Silver'],
        basePrice: 350,
        layers: `${ASSET_BASE}/seiko-soldier`
    },
    {
        id: 'bulova-soldier',
        brand: 'Bulova',
        model: 'Soldier',
        movement: 'Quartz',
        sizes: ['39mm'],
        dialColors: ['Green'],
        caseColors: ['Silver'],
        basePrice: 550,
        layers: `${ASSET_BASE}/bulova-soldier`
    },
    // ── Placeholder watches (no PNGs yet — drawn by canvas) ──
    {
        id: 'tissot-prx-auto',
        brand: 'Tissot',
        model: 'PRX Powermatic 80',
        movement: 'Automatic',
        sizes: ['35mm', '40mm'],
        dialColors: ['Black', 'Blue', 'Green', 'Silver'],
        caseColors: ['Silver', 'Gold', 'Rose Gold', 'Black'],
        basePrice: 750,
        layers: null
    },
    {
        id: 'tissot-prx-quartz',
        brand: 'Tissot',
        model: 'PRX',
        movement: 'Quartz',
        sizes: ['35mm', '40mm'],
        dialColors: ['Black', 'Blue', 'White', 'Green'],
        caseColors: ['Silver', 'Gold'],
        basePrice: 425,
        layers: null
    },
    {
        id: 'seiko-5-sports',
        brand: 'Seiko',
        model: '5 Sports',
        movement: 'Automatic',
        sizes: ['40mm', '42mm'],
        dialColors: ['Black', 'Blue', 'Green', 'White'],
        caseColors: ['Silver', 'Black'],
        basePrice: 350,
        layers: null
    },
    {
        id: 'oris-aquis',
        brand: 'Oris',
        model: 'Aquis Date',
        movement: 'Automatic',
        sizes: ['39mm', '41mm', '43mm'],
        dialColors: ['Black', 'Blue', 'Green'],
        caseColors: ['Silver'],
        basePrice: 2100,
        layers: null
    },
    {
        id: 'casio-casioak',
        brand: 'Casio',
        model: 'G-Shock CasiOak',
        movement: 'Quartz',
        sizes: ['42mm', '44mm'],
        dialColors: ['Black', 'White'],
        caseColors: ['Black'],
        basePrice: 110,
        layers: null
    }
];

const ARTWORKS = [
    { id: 'galaxy', name: 'Galaxy Concept', coverage: 'full', color: '#1a0a3e' },
    { id: 'ocean', name: 'Ocean Depths', coverage: 'full', color: '#0a2a4a' },
    { id: 'zen-garden', name: 'Zen Garden', coverage: 'partial', color: '#2a3a1a' },
    { id: 'sakura', name: 'Sakura Bloom', coverage: 'partial', color: '#3a1a2a' },
    { id: 'aurora', name: 'Aurora Borealis', coverage: 'full', color: '#0a3a3a' },
    { id: 'flames', name: 'Living Flames', coverage: 'full', color: '#3a1a0a' },
    { id: 'geometric', name: 'Geometric Soul', coverage: 'partial', color: '#1a1a3a' },
    { id: 'koi', name: 'Koi Pond', coverage: 'full', color: '#2a1a0a' },
];

// ── State ──────────────────────────────
const state = {
    filters: { brand: [], size: [], dial: [], case: [], movement: [] },
    selectedWatch: WATCHES[0],
    selectedDial: 'Black',
    selectedCase: 'Silver',
    selectedSize: '40mm',
    selectedArtwork: ARTWORKS[0],
    engraving: false,
    engravingText: '',
    engravingPosition: 'caseback',
    extraStrap: false,
    servicePrice: 1200,
    engravingPrice: 150,
    strapPrice: 95
};

// ── Image Cache ───────────────────────
// Pre-load PNG layers so canvas compositing is instant
const imageCache = {};

function loadImage(src) {
    if (imageCache[src]) return Promise.resolve(imageCache[src]);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => { imageCache[src] = img; resolve(img); };
        img.onerror = () => { console.warn('Failed to load:', src); resolve(null); };
        img.src = src;
    });
}

async function preloadWatchLayers(watch) {
    if (!watch.layers) return;
    const files = ['case.png', 'dial.png', 'hands.png'];
    await Promise.all(files.map(f => loadImage(`${watch.layers}/${f}`)));
}

// Pre-load artwork test image
const testArtworkSrc = `${ASSET_BASE}/test-artwork/test-grid-1500.png`;

// ── Color Map ──────────────────────────
const COLOR_MAP = {
    'Black': '#1a1a1a',
    'Blue': '#1a3a6b',
    'White': '#f0f0f0',
    'Green': '#2d5a3d',
    'Silver': '#C0C0C0',
    'Gold': '#D4AF37',
    'Rose Gold': '#B76E79'
};

// ── Initialization ─────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    renderWatchList();
    renderArtworkGrid();
    updateVariantSelectors();
    updateConfigPanel();
    updatePricing();

    // Pre-load PNG layers for the default watch + test artwork
    await Promise.all([
        preloadWatchLayers(state.selectedWatch),
        loadImage(testArtworkSrc)
    ]);
    updatePreview();

    // Pre-load all watches with layers in background
    WATCHES.filter(w => w.layers).forEach(w => preloadWatchLayers(w));
});

// ── Filters ────────────────────────────
function toggleFilter(el) {
    el.classList.toggle('active');

    const filterType = el.dataset.filter;
    const filterValue = el.dataset.value;
    const idx = state.filters[filterType].indexOf(filterValue);

    if (idx === -1) {
        state.filters[filterType].push(filterValue);
    } else {
        state.filters[filterType].splice(idx, 1);
    }

    renderWatchList();
    updateFilterBadge();
}

function clearAllFilters() {
    state.filters = { brand: [], size: [], dial: [], case: [], movement: [] };
    document.querySelectorAll('.filter-chip.active, .swatch.active').forEach(el => {
        if (el.closest('.sidebar-section')) el.classList.remove('active');
    });
    renderWatchList();
    updateFilterBadge();
}

function updateFilterBadge() {
    const count = Object.values(state.filters).flat().length;
    const badge = document.getElementById('filterBadge');
    if (badge) badge.textContent = count;
}

function getFilteredWatches() {
    return WATCHES.filter(w => {
        if (state.filters.brand.length && !state.filters.brand.includes(w.brand)) return false;
        if (state.filters.movement.length && !state.filters.movement.includes(w.movement)) return false;
        if (state.filters.size.length && !state.filters.size.some(s => w.sizes.includes(s))) return false;
        if (state.filters.dial.length && !state.filters.dial.some(d => w.dialColors.includes(d))) return false;
        if (state.filters.case.length && !state.filters.case.some(c => w.caseColors.includes(c))) return false;
        return true;
    });
}

// ── Watch List ─────────────────────────
function renderWatchList() {
    const list = document.getElementById('watchList');
    const filtered = getFilteredWatches();
    document.getElementById('watchCount').textContent = filtered.length;

    list.innerHTML = filtered.map(w => `
        <div class="watch-card ${w.id === state.selectedWatch.id ? 'selected' : ''}" onclick="selectWatch('${w.id}')">
            <div class="watch-card-image" style="background: linear-gradient(135deg, ${COLOR_MAP[w.caseColors[0]] || '#555'}, ${COLOR_MAP[w.dialColors[0]] || '#333'})">
                <span style="font-size: 20px; opacity: 0.5">⌚</span>
            </div>
            <div class="watch-card-info">
                <div class="watch-card-brand">${w.brand}</div>
                <div class="watch-card-name">${w.model}</div>
                <div class="watch-card-price">from $${w.basePrice.toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

async function selectWatch(id) {
    state.selectedWatch = WATCHES.find(w => w.id === id);

    // Reset variant selections to first available
    state.selectedDial = state.selectedWatch.dialColors[0];
    state.selectedCase = state.selectedWatch.caseColors[0];
    state.selectedSize = state.selectedWatch.sizes[0];

    renderWatchList();
    updateVariantSelectors();
    updateConfigPanel();
    updatePricing();

    // Pre-load layers then render
    await preloadWatchLayers(state.selectedWatch);
    updatePreview();

    // On mobile, close sidebar
    if (window.innerWidth < 769) {
        toggleSidebar();
    }
}

// ── Variant Selectors ──────────────────
function updateVariantSelectors() {
    const w = state.selectedWatch;

    // Dial swatches
    document.getElementById('dialSwatches').innerHTML = w.dialColors.map(color => `
        <div style="text-align: center">
            <button class="variant-swatch ${color === state.selectedDial ? 'active' : ''}"
                    style="background: ${COLOR_MAP[color]}"
                    title="${color}"
                    onclick="selectDial('${color}')">
            </button>
            <div class="variant-swatch-label">${color}</div>
        </div>
    `).join('');

    // Case swatches
    document.getElementById('caseSwatches').innerHTML = w.caseColors.map(color => `
        <div style="text-align: center">
            <button class="variant-swatch ${color === state.selectedCase ? 'active' : ''}"
                    style="background: ${COLOR_MAP[color]}"
                    title="${color}"
                    onclick="selectCase('${color}')">
            </button>
            <div class="variant-swatch-label">${color}</div>
        </div>
    `).join('');

    // Size chips
    document.getElementById('sizeSwatches').innerHTML = w.sizes.map(size => `
        <div style="text-align: center">
            <button class="variant-swatch ${size === state.selectedSize ? 'active' : ''}"
                    style="background: var(--bg-card); font-size: 11px; color: var(--text-primary); display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; font-weight: 600"
                    onclick="selectSize('${size}')">
                ${size.replace('mm','')}
            </button>
            <div class="variant-swatch-label">${size}</div>
        </div>
    `).join('');
}

function selectDial(color) {
    state.selectedDial = color;
    updateVariantSelectors();
    updatePreview();
    updateConfigPanel();
}

function selectCase(color) {
    state.selectedCase = color;
    updateVariantSelectors();
    updatePreview();
    updateConfigPanel();
}

function selectSize(size) {
    state.selectedSize = size;
    updateVariantSelectors();
    updateConfigPanel();
}

// ── Artwork Grid ───────────────────────
function renderArtworkGrid() {
    const grid = document.getElementById('artworkGrid');
    grid.innerHTML = ARTWORKS.map(a => `
        <div class="artwork-card ${a.id === state.selectedArtwork.id ? 'selected' : ''}"
             style="background: linear-gradient(135deg, ${a.color}, ${a.color}dd)"
             onclick="selectArtwork('${a.id}')">
            <span style="font-size: 24px; opacity: 0.4">🎨</span>
            <div class="artwork-card-name">${a.name}</div>
        </div>
    `).join('');
}

function selectArtwork(id) {
    state.selectedArtwork = ARTWORKS.find(a => a.id === id);
    renderArtworkGrid();
    updatePreview();
    updateConfigPanel();
}

// ── Canvas Preview ─────────────────────
// 4-layer compositing (all transparent PNGs, just stack):
//   1. case.png    — case, bezel, crown, strap (transparent where dial is)
//   2. [artwork]   — fills the dial area
//   3. dial.png    — indices, logo, markers ON TOP of artwork
//   4. hands.png   — hands + date window
//
// No mask needed — transparency handles everything.
// For watches without PNGs: fall back to drawn placeholders.

function updatePreview() {
    const watch = state.selectedWatch;

    if (watch.layers) {
        renderWithPNG();
    } else {
        renderWithPlaceholder();
    }

    // Update label
    document.getElementById('previewLabel').textContent =
        `${watch.brand} ${watch.model} — ${state.selectedCase} / ${state.selectedDial} / ${state.selectedSize}`;
}

function renderWithPNG() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const W = 1500, H = 1500;
    const base = state.selectedWatch.layers;

    ctx.clearRect(0, 0, W, H);

    // Layer 1: Case (transparent where dial opening is)
    const caseImg = imageCache[`${base}/case.png`];
    if (caseImg) ctx.drawImage(caseImg, 0, 0, W, H);

    // Layer 2: Artwork (fills the dial area — just draw on top, transparency handles the rest)
    const artworkImg = imageCache[testArtworkSrc];
    if (artworkImg && state.selectedArtwork) {
        ctx.drawImage(artworkImg, 0, 0, W, H);
    }

    // Layer 3: Dial elements (indices, markers, logo — on top of artwork)
    const dialImg = imageCache[`${base}/dial.png`];
    if (dialImg) ctx.drawImage(dialImg, 0, 0, W, H);

    // Layer 4: Hands
    const handsImg = imageCache[`${base}/hands.png`];
    if (handsImg) ctx.drawImage(handsImg, 0, 0, W, H);

    // Layer 5: Engraving text (if on dial)
    if (state.engraving && state.engravingText && state.engravingPosition === 'dial') {
        drawEngravingOnDial(ctx, W, H, state.engravingText);
    }
}

function renderWithPlaceholder() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const w = 1500, h = 1500;

    ctx.clearRect(0, 0, w, h);

    const caseColor = COLOR_MAP[state.selectedCase] || '#888';
    const dialColor = COLOR_MAP[state.selectedDial] || '#333';

    drawPlaceholderCase(ctx, w, h, caseColor);
    drawPlaceholderDial(ctx, w, h, dialColor);
    drawPlaceholderArtwork(ctx, w, h, state.selectedArtwork);
    drawPlaceholderHands(ctx, w, h);

    if (state.engraving && state.engravingText && state.engravingPosition === 'dial') {
        drawEngravingOnDial(ctx, w, h, state.engravingText);
    }
}

// ── Placeholder drawing functions (for watches without PNGs) ──

function drawPlaceholderCase(ctx, w, h, color) {
    const cx = w / 2, cy = h / 2;

    ctx.fillStyle = color;
    // Lugs
    ctx.fillRect(cx - 140, cy - 520, 50, 150);
    ctx.fillRect(cx + 90, cy - 520, 50, 150);
    ctx.fillRect(cx - 140, cy + 370, 50, 150);
    ctx.fillRect(cx + 90, cy + 370, 50, 150);

    // Bracelet links
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i % 2 === 0 ? color : adjustBrightness(color, -15);
        ctx.fillRect(cx - 130, cy - 520 - (i + 1) * 55, 260, 50);
        ctx.fillRect(cx - 130, cy + 520 + i * 55, 260, 50);
    }

    // Case body
    ctx.beginPath();
    ctx.arc(cx, cy, 380, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Bezel ring
    ctx.beginPath();
    ctx.arc(cx, cy, 370, 0, Math.PI * 2);
    ctx.strokeStyle = adjustBrightness(color, 30);
    ctx.lineWidth = 4;
    ctx.stroke();

    // Crown
    ctx.fillStyle = adjustBrightness(color, -10);
    ctx.fillRect(cx + 370, cy - 25, 40, 50);
    ctx.fillRect(cx + 390, cy - 30, 30, 60);
}

function drawPlaceholderDial(ctx, w, h, color) {
    const cx = w / 2, cy = h / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 340, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 340);
    grad.addColorStop(0, 'rgba(255,255,255,0.05)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.beginPath();
    ctx.arc(cx, cy, 340, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
}

function drawPlaceholderArtwork(ctx, w, h, artwork) {
    const cx = w / 2, cy = h / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 335, 0, Math.PI * 2);
    ctx.clip();

    if (artwork.coverage === 'full') {
        const artGrad = ctx.createLinearGradient(cx - 335, cy - 335, cx + 335, cy + 335);
        artGrad.addColorStop(0, artwork.color + 'cc');
        artGrad.addColorStop(0.5, adjustBrightness(artwork.color, 20) + 'aa');
        artGrad.addColorStop(1, artwork.color + 'dd');
        ctx.fillStyle = artGrad;
        ctx.fillRect(cx - 335, cy - 335, 670, 670);

        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const r = 150 + Math.sin(i * 1.7) * 80;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, 60 + i * 15, 0, Math.PI * 2);
            ctx.fillStyle = adjustBrightness(artwork.color, 40 + i * 5);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    } else {
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 100, 0, Math.PI * 2);
        ctx.fillStyle = artwork.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 66, 0, Math.PI * 2);
        ctx.fillStyle = adjustBrightness(artwork.color, 30);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    ctx.restore();
}

function drawPlaceholderHands(ctx, w, h) {
    const cx = w / 2, cy = h / 2;

    // Hour indices
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * 290, cy + Math.sin(angle) * 290);
        ctx.lineTo(cx + Math.cos(angle) * 320, cy + Math.sin(angle) * 320);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = i % 3 === 0 ? 4 : 2;
        ctx.stroke();
    }

    // Date window
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(cx + 170, cy - 22, 50, 44);
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('8', cx + 195, cy);

    // Hour hand
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.4);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.moveTo(-8, 20); ctx.lineTo(0, -180); ctx.lineTo(8, 20);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Minute hand
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(1.2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(-5, 20); ctx.lineTo(0, -260); ctx.lineTo(5, 20);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // Second hand
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(2.5);
    ctx.beginPath();
    ctx.moveTo(0, 40); ctx.lineTo(0, -270);
    ctx.strokeStyle = '#40bec1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Center cap
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();
}

function drawEngravingOnDial(ctx, w, h, text) {
    const cx = w / 2, cy = h / 2;
    ctx.font = '600 36px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(text.toUpperCase(), cx, cy + 160);
}

// ── Config Panel ───────────────────────
function updateConfigPanel() {
    document.getElementById('selBrand').textContent = state.selectedWatch.brand;
    document.getElementById('selName').textContent = state.selectedWatch.model;
    document.getElementById('selVariant').textContent =
        `${state.selectedCase} / ${state.selectedDial} / ${state.selectedSize}`;
    document.getElementById('selWatchPrice').textContent = '$' + state.selectedWatch.basePrice.toLocaleString();
    document.getElementById('selArtworkName').textContent = state.selectedArtwork.name;
}

// ── Extras ─────────────────────────────
function toggleEngraving() {
    state.engraving = !state.engraving;
    document.getElementById('engravingToggle').classList.toggle('active', state.engraving);
    document.getElementById('engravingPanel').classList.toggle('visible', state.engraving);
    document.getElementById('priceEngravingLine').style.display = state.engraving ? 'flex' : 'none';
    updatePricing();
    updatePreview();
}

function updateEngraving() {
    state.engravingText = document.getElementById('engravingInput').value;
    updatePreview();
}

function setEngravingPos(el, pos) {
    state.engravingPosition = pos;
    document.querySelectorAll('.engraving-pos-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    updatePreview();
}

function toggleStrap() {
    state.extraStrap = !state.extraStrap;
    document.getElementById('strapToggle').classList.toggle('active', state.extraStrap);
    document.getElementById('priceStrapLine').style.display = state.extraStrap ? 'flex' : 'none';
    updatePricing();
}

// ── Pricing ────────────────────────────
function updatePricing() {
    const watchPrice = state.selectedWatch.basePrice;
    let total = state.servicePrice + watchPrice;
    if (state.engraving) total += state.engravingPrice;
    if (state.extraStrap) total += state.strapPrice;

    document.getElementById('priceWatch').textContent = '$' + watchPrice.toLocaleString();
    document.getElementById('priceTotal').textContent = '$' + total.toLocaleString();
    document.getElementById('cartTotal').textContent = '$' + total.toLocaleString();
}

// ── Add to Cart ────────────────────────
function addToCart() {
    const btn = document.querySelector('.add-to-cart-btn');
    btn.textContent = '✓ ADDED TO CART';
    btn.style.background = '#28a745';
    setTimeout(() => {
        btn.innerHTML = 'ADD TO CART — <span id="cartTotal">$' +
            (state.servicePrice + state.selectedWatch.basePrice +
             (state.engraving ? state.engravingPrice : 0) +
             (state.extraStrap ? state.strapPrice : 0)).toLocaleString() + '</span>';
        btn.style.background = '';
    }, 2000);

    // In production, this would POST to /cart/add.js
    console.log('Bundle data:', {
        serviceVariantId: 'gid://shopify/ProductVariant/service-xxx',
        properties: {
            '__bundled_variant_id': `gid://shopify/ProductVariant/${state.selectedWatch.id}`,
            '__bundled_watch_price': state.selectedWatch.basePrice.toString(),
            '__bundled_watch_title': `${state.selectedWatch.brand} ${state.selectedWatch.model} ${state.selectedCase}/${state.selectedDial}/${state.selectedSize}`,
            '__bundled_concept_image': state.selectedArtwork.id,
            ...(state.engraving ? {
                '__bundled_engraving_variant_id': 'gid://shopify/ProductVariant/engraving-xxx',
                '__bundled_engraving_text': state.engravingText,
                '__bundled_engraving_position': state.engravingPosition
            } : {}),
            ...(state.extraStrap ? {
                '__bundled_strap_variant_id': 'gid://shopify/ProductVariant/strap-xxx',
                '__bundled_strap_price': state.strapPrice.toString(),
                '__bundled_strap_title': 'Premium Leather Strap'
            } : {})
        }
    });
}

// ── Mobile ─────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
}

// Config panel drag (mobile)
const configPanel = document.getElementById('configPanel');
if (configPanel) {
    const handle = configPanel.querySelector('.config-panel-handle');
    if (handle) {
        handle.addEventListener('click', () => {
            configPanel.classList.toggle('expanded');
        });
    }
}

// ── Utils ──────────────────────────────
function adjustBrightness(hex, amount) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}
