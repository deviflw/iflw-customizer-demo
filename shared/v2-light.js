// IFL Customizer V2 — Light Theme
// Push-style filter panel with tabs (Watches / Designs)

const ASSET_BASE = '../assets';

// ── Data ──
const WATCHES = [
    { id:'citizen-tsuyosa', brand:'Citizen', model:'Tsuyosa Automatic', movement:'Automatic', sizes:['37mm','40mm'], dialColors:['Black','Blue','White','Green','Silver'], caseColors:['Silver','Gold','Rose Gold'], price:275, layers:null,
      specs:{pr:'60h',jewels:'21',freq:'21,600 vph',diam:'40mm',thick:'11.5mm',l2l:'46mm',lug:'20mm',crystal:'Mineral',wr:'100m'} },
    { id:'seiko-5', brand:'Seiko', model:'5 Sports', movement:'Automatic', sizes:['40mm','42mm'], dialColors:['Black','Blue','Green','White'], caseColors:['Silver','Black'], price:350, layers:null,
      specs:{pr:'41h',jewels:'24',freq:'21,600 vph',diam:'42mm',thick:'13.4mm',l2l:'46mm',lug:'22mm',crystal:'Hardlex',wr:'100m'} },
    { id:'seiko-presage', brand:'Seiko', model:'Presage Cocktail', movement:'Automatic', sizes:['38mm','40mm'], dialColors:['Blue','White','Green'], caseColors:['Silver','Rose Gold'], price:475, layers:null,
      specs:{pr:'41h',jewels:'23',freq:'21,600 vph',diam:'40mm',thick:'11.8mm',l2l:'47mm',lug:'20mm',crystal:'Sapphire',wr:'50m'} },
    { id:'bulova-seville', brand:'Bulova', model:'Super Seville', movement:'Quartz', sizes:['39mm'], dialColors:['Black','White','Blue','Green'], caseColors:['Silver','Gold'], price:550, layers:null,
      specs:{pr:'—',jewels:'—',freq:'262 kHz',diam:'39mm',thick:'10mm',l2l:'44mm',lug:'20mm',crystal:'Sapphire',wr:'30m'} },
    { id:'tissot-prx-auto', brand:'Tissot', model:'PRX Powermatic 80', movement:'Automatic', sizes:['35mm','40mm'], dialColors:['Black','Blue','Green','Silver'], caseColors:['Silver','Gold','Rose Gold','Black'], price:750, layers:null,
      specs:{pr:'80h',jewels:'23',freq:'21,600 vph',diam:'40mm',thick:'10.9mm',l2l:'44mm',lug:'12mm',crystal:'Sapphire',wr:'100m'} },
    { id:'tissot-prx-q', brand:'Tissot', model:'PRX', movement:'Quartz', sizes:['35mm','40mm'], dialColors:['Black','Blue','White','Green'], caseColors:['Silver','Gold'], price:425, layers:null,
      specs:{pr:'—',jewels:'—',freq:'32,768 Hz',diam:'40mm',thick:'9.5mm',l2l:'44mm',lug:'12mm',crystal:'Sapphire',wr:'100m'} },
    { id:'oris-aquis', brand:'Oris', model:'Aquis Date', movement:'Automatic', sizes:['39mm','41mm','43mm'], dialColors:['Black','Blue','Green'], caseColors:['Silver'], price:2100, layers:null,
      specs:{pr:'80h',jewels:'26',freq:'28,800 vph',diam:'41mm',thick:'12.4mm',l2l:'47mm',lug:'21mm',crystal:'Sapphire',wr:'300m'} },
    { id:'casio-casioak', brand:'Casio', model:'G-Shock CasiOak', movement:'Quartz', sizes:['42mm','44mm'], dialColors:['Black','White'], caseColors:['Black'], price:110, layers:null,
      specs:{pr:'2yr battery',jewels:'—',freq:'32,768 Hz',diam:'44mm',thick:'12.4mm',l2l:'48mm',lug:'24mm',crystal:'Mineral',wr:'200m'} },
];

const DESIGNS = [
    { id:'galaxy', name:'Galaxy Concept', theme:'Space & Galaxy', style:'Fine Art', color:'#1a0a3e' },
    { id:'ocean', name:'Ocean Depths', theme:'Ocean & Marine', style:'Fine Art', color:'#0a2a4a' },
    { id:'zen', name:'Zen Garden', theme:'Nature & Wildlife', style:'Illustration', color:'#2a3a1a' },
    { id:'sakura', name:'Sakura Bloom', theme:'Nature & Wildlife', style:'Fine Art', color:'#3a1a2a' },
    { id:'aurora', name:'Aurora Borealis', theme:'Space & Galaxy', style:'Abstract', color:'#0a3a3a' },
    { id:'flames', name:'Living Flames', theme:'Urban & Street Art', style:'Abstract', color:'#3a1a0a' },
    { id:'popeye', name:'Popeye Jailbreak', theme:'Cars & Motors', style:'Illustration', color:'#1a2a1a' },
    { id:'scrooge', name:'Scrooge McDuck', theme:'Music & Culture', style:'Illustration', color:'#2a2a0a' },
    { id:'koi', name:'Koi Pond', theme:'Ocean & Marine', style:'Pointillism', color:'#2a1a0a' },
    { id:'graffiti', name:'Street Dreams', theme:'Urban & Street Art', style:'Graffiti', color:'#2a0a2a' },
];

const COLOR_MAP = {
    'Black':'#1a1a1a','Blue':'#1a3a6b','White':'#f0f0f0',
    'Green':'#2d5a3d','Silver':'#C0C0C0','Gold':'#D4AF37','Rose Gold':'#B76E79'
};

// ── State ──
let specsOpen = false; // track if user opened specs details

const S = {
    watch: null,
    dial: null,
    case_: null,
    size: null,
    design: DESIGNS[0],
    filters: { brand:[], size:[], dial:[], case_:[] },
    designFilters: { theme:[], style:[] },
    engraving: false,
    engravingText: '',
    strap: false,
    servicePrice: 1200,
    engPrice: 150,
    strapPrice: 95,
    panelOpen: false,
    activeTab: 'watches'
};

// ── Image cache ──
const imgCache = {};
function loadImg(src) {
    if (imgCache[src]) return Promise.resolve(imgCache[src]);
    return new Promise(r => {
        const img = new Image();
        img.onload = () => { imgCache[src] = img; r(img); };
        img.onerror = () => r(null);
        img.src = src;
    });
}
async function preload(w) {
    if (!w?.layers) return;
    await Promise.all(['case.png','dial.png','hands.png'].map(f => loadImg(`${w.layers}/${f}`)));
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    buildFilterPills();
    buildDesignFilters();
    renderWatchGrid();
    renderDesignGrid();
    updatePricing();
    updatePreview();
    WATCHES.filter(w => w.layers).forEach(preload);
    loadImg(`${ASSET_BASE}/test-artwork/test-grid-1500.png`);
    initHeaderScroll();
});

// ═══ HEADER SCROLL ═══
function initHeaderScroll() {
    let lastY = 0;
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > lastY && y > 80) header.classList.add('hidden');
        else header.classList.remove('hidden');
        lastY = y;
    });
}

// ═══ PANEL TOGGLE ═══
function togglePanel(tab) {
    const panel = document.getElementById('filterPanel');
    const layout = document.getElementById('mainLayout');

    if (S.panelOpen && S.activeTab === tab) {
        // Close
        panel.classList.remove('open');
        layout.classList.remove('panel-open');
        ['btnWatches','btnDesigns','btnCustom'].forEach(id => document.getElementById(id).classList.remove('active'));
        S.panelOpen = false;
    } else {
        // Open (or switch panel content)
        panel.classList.add('open');
        layout.classList.add('panel-open');
        S.panelOpen = true;
        S.activeTab = tab;

        // Show correct panel content
        document.getElementById('panelWatches').style.display = tab === 'watches' ? 'block' : 'none';
        document.getElementById('panelDesigns').style.display = tab === 'designs' ? 'block' : 'none';
        document.getElementById('panelCustom').style.display = tab === 'custom' ? 'block' : 'none';

        // Update toolbar buttons
        ['btnWatches','btnDesigns','btnCustom'].forEach(id => document.getElementById(id).classList.remove('active'));
        const btnMap = { watches:'btnWatches', designs:'btnDesigns', custom:'btnCustom' };
        document.getElementById(btnMap[tab]).classList.add('active');
    }
}

// ═══ COLLAPSIBLE FILTERS ═══
function toggleFilters(type) {
    const bodyId = type === 'design' ? 'designFiltersBody' : 'filtersBody';
    const body = document.getElementById(bodyId);
    // Find the toggle button — it's the closest .fp-filter-toggle before the body
    const panel = body.closest('.fp-content');
    const toggle = panel.querySelector('.fp-filter-toggle');
    const open = body.style.display === 'none';
    body.style.display = open ? 'block' : 'none';
    toggle.classList.toggle('active', open);
}

// ═══ CUSTOM CONCEPT ═══
function selectCustomConcept() {
    S.design = { id:'custom', name:'Custom Concept', theme:'Custom', style:'Custom', color:'#555' };
    S.servicePrice = 1490;
    document.getElementById('cpDesignName').textContent = 'Custom Concept';
    document.querySelector('.cp-design-type').textContent = 'Full Customization — Custom Design Service';
    document.querySelector('.cp-design-price').textContent = 'Service Price: $1,490';
    updatePricing();
    updatePreview();
    updateToolbarCrumb();

    // Close panel
    togglePanel('custom');
}

// ═══ WATCH FILTERS ═══
function buildFilterPills() {
    // Get available options based on current filter state (for smart disabling)
    const filtered = getFilteredWatches();
    const availBrands = new Set(WATCHES.map(w => w.brand)); // brands always available
    const availSizes = new Set(filtered.flatMap(w => w.sizes));
    const availDials = new Set(filtered.flatMap(w => w.dialColors));
    const availCases = new Set(filtered.flatMap(w => w.caseColors));

    const allBrands = [...new Set(WATCHES.map(w => w.brand))];
    const allSizes = [...new Set(WATCHES.flatMap(w => w.sizes))].sort();
    const allDials = [...new Set(WATCHES.flatMap(w => w.dialColors))];
    const allCases = [...new Set(WATCHES.flatMap(w => w.caseColors))];

    document.getElementById('brandPills').innerHTML = allBrands.map(b => {
        const active = S.filters.brand.includes(b);
        return `<button class="fp-pill ${active?'active':''}" data-f="brand" data-v="${b}" onclick="toggleWatchFilter(this)">${b}</button>`;
    }).join('');

    document.getElementById('sizePills').innerHTML = allSizes.map(s => {
        const active = S.filters.size.includes(s);
        const avail = availSizes.has(s) || active;
        return `<button class="fp-pill ${active?'active':''} ${!avail?'disabled':''}" data-f="size" data-v="${s}" onclick="toggleWatchFilter(this)" ${!avail?'disabled':''}>${s}</button>`;
    }).join('');

    document.getElementById('dialPills').innerHTML = allDials.map(c => {
        const active = S.filters.dial.includes(c);
        const avail = availDials.has(c) || active;
        return `<button class="fp-pill ${active?'active':''} ${!avail?'disabled':''}" data-f="dial" data-v="${c}" onclick="toggleWatchFilter(this)" ${!avail?'disabled':''}><span class="fp-color-dot" style="background:${COLOR_MAP[c]}"></span>${c}</button>`;
    }).join('');

    document.getElementById('casePills').innerHTML = allCases.map(c => {
        const active = S.filters.case_.includes(c);
        const avail = availCases.has(c) || active;
        return `<button class="fp-pill ${active?'active':''} ${!avail?'disabled':''}" data-f="case_" data-v="${c}" onclick="toggleWatchFilter(this)" ${!avail?'disabled':''}><span class="fp-color-dot" style="background:${COLOR_MAP[c]}"></span>${c}</button>`;
    }).join('');
}

function toggleWatchFilter(el) {
    if (el.disabled) return;
    el.classList.toggle('active');
    const f = el.dataset.f, v = el.dataset.v;
    const arr = S.filters[f];
    const i = arr.indexOf(v);
    if (i === -1) arr.push(v); else arr.splice(i, 1);
    buildFilterPills(); // Rebuild to update availability
    renderWatchGrid();
    updateActiveFilters();
}

function clearAllFilters() {
    S.filters = { brand:[], size:[], dial:[], case_:[] };
    document.querySelectorAll('#panelWatches .fp-pill.active').forEach(el => el.classList.remove('active'));
    renderWatchGrid();
    updateActiveFilters();
}

function updateActiveFilters() {
    const all = Object.entries(S.filters).flatMap(([k,v]) => v.map(val => ({k,val})));
    const div = document.getElementById('activeFilters');
    const tags = document.getElementById('activeFilterTags');
    if (all.length === 0) { div.style.display = 'none'; return; }
    div.style.display = 'flex';
    tags.innerHTML = all.map(({k,val}) =>
        `<span class="fp-af-tag">${val} <span class="x" onclick="removeFilter('${k}','${val}')">&times;</span></span>`
    ).join('');

    const badge = document.getElementById('watchBadge');
    badge.style.display = all.length ? 'inline' : 'none';
    badge.textContent = all.length;
}

function removeFilter(k, v) {
    const i = S.filters[k].indexOf(v);
    if (i !== -1) S.filters[k].splice(i, 1);
    const pill = document.querySelector(`#panelWatches .fp-pill[data-f="${k}"][data-v="${v}"]`);
    if (pill) pill.classList.remove('active');
    renderWatchGrid();
    updateActiveFilters();
}

function getFilteredWatches() {
    const q = (document.getElementById('watchSearch')?.value || '').toLowerCase();
    return WATCHES.filter(w => {
        if (q && !(w.brand.toLowerCase().includes(q) || w.model.toLowerCase().includes(q))) return false;
        if (S.filters.brand.length && !S.filters.brand.includes(w.brand)) return false;
        if (S.filters.size.length && !S.filters.size.some(s => w.sizes.includes(s))) return false;
        if (S.filters.dial.length && !S.filters.dial.some(d => w.dialColors.includes(d))) return false;
        if (S.filters.case_.length && !S.filters.case_.some(c => w.caseColors.includes(c))) return false;
        return true;
    });
}

// ═══ WATCH GRID ═══
function renderWatchGrid() {
    const filtered = getFilteredWatches();
    document.getElementById('watchCount').textContent = filtered.length;

    document.getElementById('watchGrid').innerHTML = filtered.length === 0
        ? `<div style="text-align:center;padding:30px;color:#999"><p>No watches match</p><button class="fp-af-clear" onclick="clearAllFilters()">Reset Filters</button></div>`
        : filtered.map(w => `
        <div class="fp-watch-card ${S.watch?.id === w.id ? 'selected' : ''}" onclick="selectWatch('${w.id}')">
            <div class="fp-wc-img"><canvas id="thumb_${w.id}" width="100" height="100"></canvas></div>
            <div class="fp-wc-info">
                <div class="fp-wc-brand">${w.brand}</div>
                <div class="fp-wc-name">${w.model}</div>
                <div class="fp-wc-price">$${w.price.toLocaleString()}</div>
            </div>
        </div>
    `).join('');

    // Draw mini thumbnails
    filtered.forEach(w => {
        const c = document.getElementById(`thumb_${w.id}`);
        if (!c) return;
        const ctx = c.getContext('2d');
        const sz = 100;
        c.width = sz; c.height = sz;
        const cx = sz/2, cy = sz/2;
        const cc = COLOR_MAP[w.caseColors[0]] || '#ccc';
        const dc = COLOR_MAP[w.dialColors[0]] || '#333';
        // Band
        ctx.fillStyle = cc;
        ctx.fillRect(cx-12, 2, 24, 20);
        ctx.fillRect(cx-12, sz-22, 24, 20);
        // Case
        ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI*2); ctx.fill();
        // Dial
        ctx.fillStyle = dc;
        ctx.beginPath(); ctx.arc(cx, cy, 32, 0, Math.PI*2); ctx.fill();
        // Hands
        ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx-10, cy-18); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+16, cy-6); ctx.stroke();
    });
}

async function selectWatch(id) {
    S.watch = WATCHES.find(w => w.id === id);
    S.dial = S.watch.dialColors[0];
    S.case_ = S.watch.caseColors[0];
    S.size = S.watch.sizes[0];

    await preload(S.watch);
    renderWatchGrid();
    renderVariantSection();
    updateConfigWatch();
    updatePreview();
    updatePricing();
    updateToolbarCrumb();
}

// ═══ VARIANT SECTION (in panel) ═══
function renderVariantSection() {
    const w = S.watch;
    if (!w) return;

    const sec = document.getElementById('variantSection');
    sec.style.display = 'block';

    document.getElementById('variantHeader').textContent = `${w.brand} ${w.model} — ${w.movement}`;

    document.getElementById('varSizes').innerHTML = `
        <label class="fp-label">Size</label>
        <div class="fp-var-swatches">${w.sizes.map(s =>
            `<button class="fp-var-size ${s===S.size?'active':''}" onclick="pickVar('size','${s}')">${s}</button>`
        ).join('')}</div>`;

    document.getElementById('varDials').innerHTML = `
        <label class="fp-label">Dial Color</label>
        <div class="fp-var-swatches">${w.dialColors.map(c =>
            `<button class="fp-var-swatch ${c===S.dial?'active':''}" style="background:${COLOR_MAP[c]}" title="${c}" onclick="pickVar('dial','${c}')"></button>`
        ).join('')}</div>`;

    document.getElementById('varCases').innerHTML = `
        <label class="fp-label">Case & Band</label>
        <div class="fp-var-swatches">${w.caseColors.map(c =>
            `<button class="fp-var-swatch ${c===S.case_?'active':''}" style="background:${COLOR_MAP[c]}" title="${c}" onclick="pickVar('case','${c}')"></button>`
        ).join('')}</div>`;

    // Don't auto-scroll — let user discover variants naturally
}

function pickVar(type, val) {
    if (type === 'size') S.size = val;
    if (type === 'dial') S.dial = val;
    if (type === 'case') S.case_ = val;
    renderVariantSection();
    updateConfigWatch();
    updatePreview();
    updateToolbarCrumb();
}

// ═══ DESIGN FILTERS ═══
function buildDesignFilters() {
    const themes = [...new Set(DESIGNS.map(d => d.theme))];
    const styles = [...new Set(DESIGNS.map(d => d.style))];

    document.getElementById('themePills').innerHTML = themes.map(t =>
        `<button class="fp-pill" data-f="theme" data-v="${t}" onclick="toggleDesignFilter(this)">${t}</button>`
    ).join('');

    document.getElementById('stylePills').innerHTML = styles.map(s =>
        `<button class="fp-pill" data-f="style" data-v="${s}" onclick="toggleDesignFilter(this)">${s}</button>`
    ).join('');
}

function toggleDesignFilter(el) {
    el.classList.toggle('active');
    const f = el.dataset.f, v = el.dataset.v;
    const arr = S.designFilters[f];
    const i = arr.indexOf(v);
    if (i === -1) arr.push(v); else arr.splice(i, 1);
    renderDesignGrid();
}

// filterDesigns is now handled by renderDesignGrid directly

function getFilteredDesigns() {
    const q = (document.getElementById('designSearch')?.value || '').toLowerCase();
    return DESIGNS.filter(d => {
        if (S.designFilters.theme.length && !S.designFilters.theme.includes(d.theme)) return false;
        if (S.designFilters.style.length && !S.designFilters.style.includes(d.style)) return false;
        if (q && !d.name.toLowerCase().includes(q)) return false;
        return true;
    });
}

// ═══ DESIGN GRID ═══
function renderDesignGrid() {
    const filtered = getFilteredDesigns();
    document.getElementById('designGrid').innerHTML = filtered.map(d => `
        <div class="fp-design-card ${d.id===S.design.id?'selected':''}" onclick="selectDesign('${d.id}')">
            <div class="fp-dc-img" style="background:linear-gradient(135deg,${d.color},${d.color}dd)">${d.id==='custom'?'&#9998;':'&#127912;'}</div>
            <div class="fp-dc-info">
                <div class="fp-dc-name">${d.name}</div>
                <div class="fp-dc-type">${d.theme} &bull; ${d.style}</div>
            </div>
        </div>
    `).join('');
}

function selectDesign(id) {
    S.design = DESIGNS.find(d => d.id === id);
    S.servicePrice = id === 'custom' ? 1490 : 1200;
    document.getElementById('cpDesignName').textContent = S.design.name;
    document.querySelector('.cp-design-type').textContent = id === 'custom'
        ? 'Full Customization — Custom Design Service'
        : 'Bespoke Edition — Custom Watch Service';
    document.querySelector('.cp-design-price').textContent = `Service Price: $${S.servicePrice.toLocaleString()}`;
    renderDesignGrid();
    updatePreview();
    updatePricing();
    updateToolbarCrumb();
}

// ═══ CONFIG PANEL — watch display + variant swatches ═══
function updateConfigWatch() {
    const w = S.watch;
    if (!w) return;
    const s = w.specs;

    // Check if specs were open before re-render
    const prevDetails = document.querySelector('.cp-watch-details');
    if (prevDetails) specsOpen = prevDetails.open;

    document.getElementById('cpWatchDisplay').innerHTML = `
        <div class="cp-watch">
            <div class="cp-watch-thumb"><canvas id="cpThumb" width="54" height="72"></canvas></div>
            <div class="cp-watch-info">
                <div class="cp-watch-name">${w.brand} ${w.model}</div>
                <div class="cp-watch-specs">${w.movement} &bull; ${S.size} &bull; ${S.case_} &bull; ${S.dial}</div>
                <div class="cp-watch-price">$${w.price.toLocaleString()}</div>
                <details class="cp-watch-details" ${specsOpen ? 'open' : ''}>
                    <summary>View specifications</summary>
                    <div class="cp-specs-grid">
                        <strong>Movement</strong><br>
                        Power Reserve: ${s.pr} &bull; Jewels: ${s.jewels}<br>Frequency: ${s.freq}<br><br>
                        <strong>Case</strong><br>
                        ${s.diam} &bull; ${s.thick} thick<br>L2L: ${s.l2l} &bull; Lug: ${s.lug}<br><br>
                        <strong>Materials</strong><br>
                        Crystal: ${s.crystal} &bull; WR: ${s.wr}
                    </div>
                </details>
            </div>
        </div>
    `;
    // Draw thumbnail
    const c = document.getElementById('cpThumb');
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 54, 72);
    const cc = COLOR_MAP[S.case_]||'#ccc';
    const dc = COLOR_MAP[S.dial]||'#333';
    const cx = 27, cy = 36;
    ctx.fillStyle = cc;
    ctx.fillRect(cx-8, 2, 16, 12); ctx.fillRect(cx-8, 58, 16, 12);
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = dc;
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx-7, cy-14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx+12, cy-4); ctx.stroke();
}

// ═══ CANVAS PREVIEW — fully drawn, responsive to all options ═══
function updatePreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const W = 750, H = 1000;
    ctx.clearRect(0, 0, W, H);

    const w = S.watch;
    if (w) {
        // Size scaling: smaller watches draw smaller
        const sizeNum = parseInt(S.size) || 40;
        const scale = 0.7 + (sizeNum - 35) * 0.02;
        const cx = W/2, cy = H/2;
        const R = 250 * scale; // case radius
        const DR = R * 0.9;    // dial radius

        const cc = COLOR_MAP[S.case_] || '#ccc';
        const dc = COLOR_MAP[S.dial] || '#333';
        const ac = S.design?.color || '#333';

        // Band/strap
        const bandW = R * 0.55;
        ctx.fillStyle = cc;
        // Top band
        ctx.beginPath();
        ctx.roundRect(cx - bandW/2, cy - R - R*0.95, bandW, R*0.95, [bandW*0.1, bandW*0.1, 0, 0]);
        ctx.fill();
        // Bottom band
        ctx.beginPath();
        ctx.roundRect(cx - bandW/2, cy + R, bandW, R*0.95, [0, 0, bandW*0.1, bandW*0.1]);
        ctx.fill();

        // Band links
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = i % 2 === 0 ? adjustCol(cc, -8) : adjustCol(cc, 8);
            const y1 = cy - R - R*0.9 + i * (R*0.22);
            const y2 = cy + R + R*0.05 + i * (R*0.22);
            ctx.fillRect(cx - bandW/2 + 2, y1, bandW - 4, R*0.2);
            ctx.fillRect(cx - bandW/2 + 2, y2, bandW - 4, R*0.2);
        }

        // Case body
        ctx.fillStyle = cc;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();

        // Bezel ring
        ctx.strokeStyle = adjustCol(cc, 25);
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, R-4, 0, Math.PI*2); ctx.stroke();

        // Crown
        ctx.fillStyle = adjustCol(cc, -10);
        ctx.fillRect(cx + R - 5, cy - 12, 22, 24);

        // Dial
        ctx.fillStyle = dc;
        ctx.beginPath(); ctx.arc(cx, cy, DR, 0, Math.PI*2); ctx.fill();

        // Dial gradient depth
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, DR);
        grad.addColorStop(0, 'rgba(255,255,255,0.06)');
        grad.addColorStop(0.7, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, DR, 0, Math.PI*2); ctx.fill();

        // Artwork overlay
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, DR - 3, 0, Math.PI*2); ctx.clip();
        // Abstract artwork shapes
        ctx.globalAlpha = 0.6;
        const artGrad = ctx.createLinearGradient(cx - DR, cy - DR, cx + DR, cy + DR);
        artGrad.addColorStop(0, ac + 'cc');
        artGrad.addColorStop(1, adjustCol(ac, 30) + 'aa');
        ctx.fillStyle = artGrad;
        ctx.fillRect(cx - DR, cy - DR, DR*2, DR*2);
        for (let i = 0; i < 6; i++) {
            const a = (i/6) * Math.PI * 2;
            const r = DR * 0.4 + Math.sin(i*2.1) * DR * 0.2;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a)*r, cy + Math.sin(a)*r, DR*0.15 + i*5, 0, Math.PI*2);
            ctx.fillStyle = adjustCol(ac, 20 + i*8) + '88';
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // Hour indices
        for (let i = 0; i < 12; i++) {
            const a = (i/12) * Math.PI*2 - Math.PI/2;
            const inner = DR * 0.82;
            const outer = DR * 0.93;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a)*inner, cy + Math.sin(a)*inner);
            ctx.lineTo(cx + Math.cos(a)*outer, cy + Math.sin(a)*outer);
            ctx.strokeStyle = 'rgba(255,255,255,0.75)';
            ctx.lineWidth = i%3===0 ? 3 : 1.5;
            ctx.stroke();
        }

        // Date window
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(cx + DR*0.48, cy - 10, DR*0.18, 20);
        ctx.fillStyle = '#333';
        ctx.font = `bold ${Math.round(DR*0.08)}px Montserrat`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('8', cx + DR*0.57, cy);

        // Hour hand
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.4);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath(); ctx.moveTo(-4,12); ctx.lineTo(0, -DR*0.5); ctx.lineTo(4,12); ctx.closePath(); ctx.fill();
        ctx.restore();

        // Minute hand
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(1.2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath(); ctx.moveTo(-3,12); ctx.lineTo(0, -DR*0.72); ctx.lineTo(3,12); ctx.closePath(); ctx.fill();
        ctx.restore();

        // Second hand
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(2.5);
        ctx.strokeStyle = '#40bec1'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -DR*0.78); ctx.stroke();
        ctx.restore();

        // Center cap
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();

    } else {
        ctx.fillStyle = '#eaeaea'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#aaa'; ctx.font = '26px Montserrat';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('Select a watch to preview', W/2, H/2);
    }

    // Engraving
    if (S.engraving && S.engravingText && w) {
        ctx.font = '600 24px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText(S.engravingText.toUpperCase(), W/2, H/2 + 100);
    }

}

function adjustCol(hex, amt) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0,2),16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2,4),16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4,6),16) + amt));
    return '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('');
}

// ═══ TOOLBAR CRUMB ═══
function updateToolbarCrumb() {
    const parts = [];
    if (S.design) parts.push(S.design.name);
    if (S.watch) parts.push(`${S.watch.brand} ${S.watch.model}`);
    if (S.watch) parts.push(`${S.case_} / ${S.dial} / ${S.size}`);
    document.getElementById('toolbarCrumb').textContent = parts.join(' — ') || 'Select a watch and design to begin';
}

// ═══ EXTRAS ═══
function toggleEngraving() {
    S.engraving = !S.engraving;
    document.getElementById('engravingBtn').classList.toggle('active', S.engraving);
    document.getElementById('engravingConfig').style.display = S.engraving ? 'block' : 'none';
    document.getElementById('priceEngLine').style.display = S.engraving ? 'flex' : 'none';
    updatePricing(); updatePreview();
}
function toggleStrap() {
    S.strap = !S.strap;
    document.getElementById('strapBtn').classList.toggle('active', S.strap);
    document.getElementById('priceStrapLine').style.display = S.strap ? 'flex' : 'none';
    updatePricing();
}

// ═══ PRICING ═══
function updatePricing() {
    const wp = S.watch ? S.watch.price : 0;
    let total = S.servicePrice + wp;
    if (S.engraving) total += S.engPrice;
    if (S.strap) total += S.strapPrice;

    document.getElementById('priceWatchLine').style.display = S.watch ? 'flex' : 'none';
    if (S.watch) {
        document.getElementById('priceWatchLabel').textContent = `${S.watch.brand} ${S.watch.model}`;
        document.getElementById('priceWatch').textContent = '$' + wp.toLocaleString();
    }
    document.getElementById('priceTotal').textContent = '$' + total.toLocaleString();
}

// ═══ CART ═══
function changeQty(d) {
    const inp = document.getElementById('qtyInput');
    inp.value = Math.max(1, parseInt(inp.value) + d);
}
function addToCart() {
    const btn = document.querySelector('.cp-add-cart');
    btn.textContent = '✓ ADDED'; btn.style.background = '#28a745';
    setTimeout(() => { btn.textContent = 'ADD TO CART'; btn.style.background = ''; }, 2000);
}
