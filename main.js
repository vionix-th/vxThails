/* vxThails - Vanilla JS */
(function () {

  function el(tag, attributes = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    node.append(...children.flat());
    return node;
  }
  function button(children, onClick, className, attributes = {}) {
    const node = el('button', { type: 'button', class: className, ...attributes }, children);
    node.addEventListener('click', onClick);
    return node;
  }
  const donationIcons = {
    cash: ['M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M6 12h.01M18 12h.01'],
    crypto: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm12 7 4 5-4 5-4-5 4-5Z'],
    check: ['m5 12 4 4L19 6'],
    copy: ['M9 9h12v12H9z', 'M15 9V3H3v12h6'],
    bitcoin: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z', 'M8 7h6a2.5 2.5 0 0 1 0 5H9h6a2.5 2.5 0 0 1 0 5H8M10 7v10M11 5v2m3-2v2M11 17v2m3-2v2'],
    ethereum: ['m12 2 7 10-7 4-7-4 7-10Z', 'm5 15 7 7 7-7-7 4-7-4Z', 'M12 2v14'],
    solana: ['m6 4-3 4h15l3-4H6Z', 'm3 10 3 4h15l-3-4H3Z', 'm6 16-3 4h15l3-4H6Z'],
    chevronDown: ['m6 9 6 6 6-6'],
    base: ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z', 'M3 12h14'],
    arbitrum: ['m12 2 9 5v10l-9 5-9-5V7l9-5Z', 'm8 17 4-10 5 10M14 11l4 8'],
    optimism: ['M7 7a4 5 0 1 0 0 10 4 5 0 0 0 0-10Z', 'M15 17V7h3a3 3 0 0 1 0 6h-3'],
    polygon: ['m9 5 4 2.5v5L9 15l-4-2.5v-5L9 5Z', 'm15 9 4 2.5v5L15 19l-4-2.5v-5L15 9Z'],
    bnb: ['m12 8 4 4-4 4-4-4 4-4Z', 'm12 2 3 3-3 3-3-3 3-3ZM12 16l3 3-3 3-3-3 3-3ZM2 12l3-3 3 3-3 3-3-3ZM16 12l3-3 3 3-3 3-3-3Z'],
  };
  function icon(name, size = 20) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' })) svg.setAttribute(key, value);
    for (const d of donationIcons[name]) {
      const path = document.createElementNS(svg.namespaceURI, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    }
    return svg;
  }
  // Public receiving addresses only. Network support is explicitly maintained by the wallet owner.
  const evmAddress = '0x0D4aAc6d3C5DF6D162F121992eBD441728B143a2';

  const donationNetworks = [
    { id: 'bitcoin', name: 'Bitcoin', icon: 'bitcoin', assets: 'BTC', address: 'bc1qesd92qv7h3mlh4qqs4grz3e32phvxj6spwkcyz' },
    { id: 'ethereum', name: 'Ethereum Mainnet', icon: 'ethereum', assets: 'ETH, USDC, USDT and other tokens', address: evmAddress },
    { id: 'solana', name: 'Solana', icon: 'solana', assets: 'SOL, USDC, USDT and other tokens', address: '7oLWWpSrEG6aDKVZDAyuAjF3kDKEgAmnG3Q7JAb9uUXy' },
    { id: 'base', name: 'Base', icon: 'base', assets: 'ETH, USDC, USDT and other tokens', address: evmAddress },
    { id: 'arbitrum', name: 'Arbitrum One', icon: 'arbitrum', assets: 'ETH, USDC, USDT and other tokens', address: evmAddress },
    { id: 'optimism', name: 'Optimism', icon: 'optimism', assets: 'ETH, USDC, USDT and other tokens', address: evmAddress },
    { id: 'polygon', name: 'Polygon PoS', icon: 'polygon', assets: 'POL, USDC, USDT and other tokens', address: evmAddress },
    { id: 'bnb', name: 'BNB Smart Chain', icon: 'bnb', assets: 'BNB, USDC, USDT and other tokens', address: evmAddress },
  ];

  /** Select-only combobox; a native popover keeps icon rows above the dialog's scroll area. */
  function donationNetworkSelector(id, networks, onChange, text) {
    let selected = 0;
    let active = 0;
    let search = '';
    let searchedAt = 0;
    const label = el('label', { id: `${id}-network-label`, for: `${id}-network` }, text('network'));
    const value = el('span', { id: `${id}-network-value`, class: 'donation-network-value' });
    const mark = el('span', { class: 'donation-network-icon', 'aria-hidden': 'true' });
    const menu = el('div', {
      id: `${id}-networks`, class: 'donation-network-menu', popover: 'auto',
      role: 'listbox', 'aria-labelledby': label.id,
    });
    const trigger = button([mark, value, icon('chevronDown', 16)], () => {
      if (menu.matches(':popover-open')) close();
      else open(selected);
    }, 'donation-network-trigger', {
      id: `${id}-network`, role: 'combobox', 'aria-haspopup': 'listbox',
      'aria-expanded': 'false', 'aria-controls': menu.id,
      'aria-labelledby': `${label.id} ${value.id}`,
    });
    const options = networks.map((network, index) => {
      const row = el('div', {
        id: `${id}-network-${network.id}`, role: 'option', 'aria-selected': index === selected,
        class: 'donation-network-option',
      }, icon(network.icon, 20), el('span', {}, network.name), icon('check', 16));
      row.addEventListener('pointerdown', (event) => { if (event.pointerType === 'mouse') event.preventDefault(); });
      row.addEventListener('click', () => choose(index));
      return row;
    });
    menu.append(...options);

    function position() {
      const bounds = trigger.getBoundingClientRect();
      const inset = 12;
      const gap = 6;
      const below = window.innerHeight - bounds.bottom - gap - inset;
      const above = bounds.top - gap - inset;
      const upward = below < 220 && above > below;
      const height = Math.max(0, Math.min(networks.length * 44 + 14, upward ? above : below));
      menu.style.width = `${Math.min(bounds.width, window.innerWidth - inset * 2)}px`;
      menu.style.maxHeight = `${height}px`;
      menu.style.left = `${Math.max(inset, Math.min(bounds.left, window.innerWidth - bounds.width - inset))}px`;
      menu.style.top = `${Math.max(inset, upward ? bounds.top - gap - height : bounds.bottom + gap)}px`;
    }
    function highlight(index) {
      active = Math.max(0, Math.min(networks.length - 1, index));
      options.forEach((row, index) => row.classList.toggle('is-active', index === active));
      trigger.setAttribute('aria-activedescendant', options[active].id);
      const row = options[active];
      if (row.offsetTop < menu.scrollTop) menu.scrollTop = row.offsetTop;
      else if (row.offsetTop + row.offsetHeight > menu.scrollTop + menu.clientHeight)
        menu.scrollTop = row.offsetTop + row.offsetHeight - menu.clientHeight;
    }
    function open(index) {
      trigger.focus({ preventScroll: true });
      menu.showPopover();
      highlight(index);
    }
    function close() {
      if (menu.matches(':popover-open')) menu.hidePopover();
    }
    function renderSelection() {
      mark.replaceChildren(icon(networks[selected].icon, 20));
      value.textContent = networks[selected].name;
      options.forEach((row, index) => row.setAttribute('aria-selected', index === selected));
    }
    function choose(index, restoreFocus = true) {
      const changed = selected !== index;
      selected = index;
      renderSelection();
      close();
      if (restoreFocus) trigger.focus();
      if (changed) onChange(networks[selected]);
    }
    menu.addEventListener('beforetoggle', (event) => {
      const opened = event.newState === 'open';
      trigger.setAttribute('aria-expanded', opened);
      if (opened) {
        position();
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, true);
      } else {
        search = '';
        trigger.removeAttribute('aria-activedescendant');
        window.removeEventListener('resize', position);
        window.removeEventListener('scroll', position, true);
      }
    });
    trigger.addEventListener('keydown', (event) => {
      const opened = menu.matches(':popover-open');
      if (event.key === 'Tab') { if (opened) choose(active, false); return; }
      if (event.key === 'Escape') {
        if (opened) { event.preventDefault(); event.stopPropagation(); close(); }
        return;
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'Enter' || event.key === ' ') { if (opened) choose(active); else open(selected); }
        else if (event.key === 'Home') { if (!opened) open(0); else highlight(0); }
        else if (event.key === 'End') { if (!opened) open(networks.length - 1); else highlight(networks.length - 1); }
        else if (!opened) open(selected);
        else highlight(active + (event.key === 'ArrowDown' ? 1 : -1));
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        search = (Date.now() - searchedAt < 700 ? search : '') + event.key.toLowerCase();
        searchedAt = Date.now();
        const match = networks.findIndex((network) => network.name.toLowerCase().startsWith(search));
        if (match >= 0) { if (opened) highlight(match); else open(match); }
      }
    });
    renderSelection();
    return {
      node: el('div', { class: 'field donation-network-field' }, label, trigger, menu),
      control: trigger,
      dispose() {
        close();
        window.removeEventListener('resize', position);
        window.removeEventListener('scroll', position, true);
      },
    };
  }

  /** Address-only QR; the donor must select the displayed network in their wallet. */
  function addressQRCode(address, label) {
    const qr = qrcode(0, 'M');
    qr.addData(address, 'Byte');
    qr.make();
    const count = qr.getModuleCount();
    const quietZone = 4;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({
      viewBox: `0 0 ${count + quietZone * 2} ${count + quietZone * 2}`,
      role: 'img', 'aria-label': label, class: 'donation-qr',
      'shape-rendering': 'crispEdges',
    })) svg.setAttribute(key, value);
    const background = document.createElementNS(svg.namespaceURI, 'rect');
    for (const [key, value] of Object.entries({ width: '100%', height: '100%', fill: '#fff' })) background.setAttribute(key, value);
    const modules = document.createElementNS(svg.namespaceURI, 'path');
    let path = '';
    for (let row = 0; row < count; row++) {
      for (let column = 0; column < count; column++) {
        if (qr.isDark(row, column)) path += `M${column + quietZone} ${row + quietZone}h1v1h-1z`;
      }
    }
    modules.setAttribute('d', path);
    modules.setAttribute('fill', '#111');
    svg.append(background, modules);
    return svg;
  }

  function cryptoSupport(id, text) {
    let destination = donationNetworks[0];
    let revision = 0;
    let disposed = false;
    let feedbackTimer;
    const feedback = el('p', { class: 'donation-status', role: 'status', 'aria-live': 'polite' });
    function setCopyFeedback(message) {
      feedback.textContent = message;
    }
    function resetCopyFeedback() {
      clearTimeout(feedbackTimer);
      feedbackTimer = undefined;
      copyLabel.textContent = text('copyAddress');
      setCopyFeedback('');
    }
    const address = el('code', { id: `${id}-address`, class: 'donation-address', tabindex: '0' });
    const assets = el('p', { class: 'donation-assets' });
    const network = donationNetworkSelector(id, donationNetworks, (selected) => {
      destination = selected;
      updateDestination();
    }, text);
    network.node.append(assets);
    const qrHost = el('div', { id: `${id}-qr`, class: 'donation-qr-host' });
    const qrToggle = button(text('showQR'), () => {
      const expanded = qrToggle.getAttribute('aria-expanded') !== 'true';
      node.classList.toggle('qr-expanded', expanded);
      qrToggle.setAttribute('aria-expanded', expanded);
      qrToggle.textContent = expanded ? text('hideQR') : text('showQR');
    }, 'donation-qr-toggle', { 'aria-expanded': 'false', 'aria-controls': qrHost.id });
    const copyLabel = el('span', {}, text('copyAddress'));
    const copy = button([icon('copy', 16), copyLabel], async () => {
      const copyingRevision = revision;
      const copiedAddress = destination.address;
      resetCopyFeedback();
      copy.disabled = true;
      try {
        await navigator.clipboard.writeText(copiedAddress);
        if (!disposed && copyingRevision === revision) {
          copyLabel.textContent = text('copied');
          setCopyFeedback(text('copySuccess'));
          feedbackTimer = setTimeout(resetCopyFeedback, 2000);
        }
      } catch {
        if (!disposed && copyingRevision === revision) {
          copyLabel.textContent = text('copyManually');
          setCopyFeedback(text('copyError'));
          const range = document.createRange();
          range.selectNodeContents(address);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          address.focus();
        }
      } finally {
        if (!disposed && copyingRevision === revision) copy.disabled = false;
      }
    }, 'donation-copy', { 'aria-describedby': address.id });

    function updateDestination() {
      revision++;
      copy.disabled = false;
      resetCopyFeedback();
      address.textContent = destination.address;
      assets.textContent = destination.id === 'bitcoin' ? 'BTC' : text('assets', { asset: destination.assets.split(',')[0] });
      qrHost.replaceChildren(addressQRCode(destination.address, text('qrLabel', { network: destination.name })));
    }
    const node = el('div', { class: 'crypto-support' }, network.node,
      qrToggle, qrHost,
      el('div', { class: 'donation-receiving' },
        el('div', { class: 'donation-address-details' },
          el('span', { class: 'donation-address-label' }, text('receivingAddress')), address),
        copy, feedback));
    updateDestination();
    return { node, dispose() { disposed = true; clearTimeout(feedbackTimer); network.dispose(); } };
  }

  function donationMethods({ body, kofiPanel, id, text }) {
    let crypto;
    kofiPanel.id = `${id}-kofi-panel`;
    kofiPanel.setAttribute('role', 'tabpanel');
    kofiPanel.setAttribute('aria-labelledby', `${id}-kofi-tab`);
    const cryptoPanel = el('div', { id: `${id}-crypto-panel`, role: 'tabpanel', 'aria-labelledby': `${id}-crypto-tab` });
    cryptoPanel.hidden = true;
    const tabs = [text('cash'), text('crypto')].map((name, index) => button([icon(index ? 'crypto' : 'cash', 16), el('span', {}, name)], () => select(index), 'support-method', {
      id: `${id}-${index ? 'crypto' : 'kofi'}-tab`, role: 'tab',
      'aria-controls': index ? cryptoPanel.id : kofiPanel.id,
      'aria-selected': index === 0, tabindex: index === 0 ? '0' : '-1',
    }));
    function select(index) {
      if (index === 1 && !crypto) {
        crypto = cryptoSupport(id, text);
        cryptoPanel.append(crypto.node);
      }
      tabs.forEach((tab, position) => {
        tab.setAttribute('aria-selected', position === index);
        tab.tabIndex = position === index ? 0 : -1;
      });
      kofiPanel.hidden = index !== 0;
      cryptoPanel.hidden = index !== 1;
    }
    const controls = el('div', { class: 'support-methods', role: 'tablist', 'aria-label': text('method') }, tabs);
    controls.addEventListener('keydown', (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - current;
      select(next);
      tabs[next].focus();
    });
    body.before(controls);
    body.append(cryptoPanel);
    return { dispose() { crypto?.dispose(); controls.remove(); cryptoPanel.remove(); kofiPanel.hidden = false; } };
  }


  // Support reminder policy.
  const FIRST_REMINDER_DELAY = 72 * 60 * 60 * 1000;
  const REMINDER_COOLDOWN = 28 * 24 * 60 * 60 * 1000;
  const SUPPORT_REMINDER_KEY = 'vxThails.support-reminders';
  function localUsageDate(now) {
    const date = new Date(now);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function reminderEligible(state, now, threshold) {
    return (
      !state.disabled &&
      state.firstUsedAt !== null &&
      now - state.firstUsedAt >= FIRST_REMINDER_DELAY &&
      state.activeDays.length === 3 &&
      state.count >= threshold &&
      now >= state.cooldownUntil
    );
  }
  function createSupportReminderStore({
    key,
    threshold,
    now = Date.now,
    storage = () => localStorage,
    locks = () => navigator.locks,
    changed = () => {},
  }) {
    let unavailable = false;
    function read() {
      const raw = storage().getItem(key);
      if (raw === null)
        return {
          version: 1,
          firstUsedAt: null,
          activeDays: [],
          count: 0,
          cooldownUntil: 0,
          disabled: false,
        };
      const state = JSON.parse(raw);
      const timestamp = (value) =>
        typeof value === 'number' && Number.isFinite(value) && value >= 0;
      if (
        !state ||
        state.version !== 1 ||
        !(state.firstUsedAt === null || timestamp(state.firstUsedAt)) ||
        !timestamp(state.cooldownUntil) ||
        typeof state.disabled !== 'boolean' ||
        !Number.isInteger(state.count) ||
        state.count < 0 ||
        state.count > threshold ||
        !Array.isArray(state.activeDays) ||
        state.activeDays.length > 3 ||
        new Set(state.activeDays).size !== state.activeDays.length ||
        state.activeDays.some(
          (day) =>
            typeof day !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
            !Number.isFinite(Date.parse(day)) ||
            new Date(day).toISOString().slice(0, 10) !== day,
        )
      ) {
        throw new Error('Invalid support reminder preferences');
      }
      return state;
    }
    async function update(change) {
      if (unavailable) return false;
      try {
        const coordinator = locks();
        if (!coordinator) {
          unavailable = true;
          return false;
        }
        return await coordinator.request(key, () => {
          const state = read();
          const time = now();
          if (!Number.isFinite(time) || time < 0)
            throw new Error('Invalid reminder clock');
          if (!change(state, time)) return false;
          storage().setItem(key, JSON.stringify(state));
          changed();
          return true;
        });
      } catch {
        // Optional reminders fail closed; primary/payment operations stay independent.
        unavailable = true;
        return false;
      }
    }
    function resetCycle(state, time) {
      state.count = 0;
      state.cooldownUntil = time + REMINDER_COOLDOWN;
    }
    return {
      recordUsage: () =>
        update((state, time) => {
          if (state.disabled) return false;
          state.firstUsedAt ??= time;
          const day = localUsageDate(time);
          if (state.activeDays.length < 3 && !state.activeDays.includes(day))
            state.activeDays.push(day);
          state.count = Math.min(threshold, state.count + 1);
          return true;
        }),
      claim: (canPresent) =>
        update((state, time) => {
          if (!canPresent() || !reminderEligible(state, time, threshold))
            return false;
          resetCycle(state, time);
          return true;
        }),
      postpone: () =>
        update((state, time) => {
          resetCycle(state, time);
          return true;
        }),
      disable: () =>
        update((state) => {
          state.disabled = true;
          return true;
        }),
    };
  }
  const supportReminders = createSupportReminderStore({
    key: SUPPORT_REMINDER_KEY,
    threshold: 3,
    changed: () => window.dispatchEvent(new Event('support-reminder-change')),
  });

  // Support reminder presentation.
  /** Page-session presentation; persisted cycle claims belong to the local policy store. */
  function createSupportReminderController({
    store,
    safe,
    show,
    getSupport,
    openSupport,
    onVisible = () => {},
  }) {
    let claimed = false;
    let checking = false;
    let disposed = false;
    let notice = null;
    function clear() {
      claimed = false;
      notice?.destroy();
      notice = null;
    }
    async function finish(disable) {
      await (disable ? store.disable() : store.postpone());
      clear();
      getSupport()?.focus();
    }
    async function evaluate() {
      if (disposed || checking) return;
      try {
        if (!safe()) {
          if (notice && !notice.element.contains(document.activeElement))
            notice.element.hidden = true;
          return;
        }
        if (!claimed) {
          checking = true;
          claimed = await store.claim(safe);
          checking = false;
        }
        if (disposed || !claimed) return;
        if (!notice)
          notice = show({
            support: () => {
              clear();
              openSupport(getSupport());
            },
            postpone: () => finish(false),
            disable: () => finish(true),
          });
        notice.element.hidden =
          !safe() && !notice.element.contains(document.activeElement);
        if (!notice.element.hidden) onVisible();
      } catch {
        checking = false;
        clear(); // Optional presentation must not break the primary workflow.
      }
    }
    const observer = new MutationObserver((records) => {
      if (records.some((record) => !record.target.closest?.('.support-reminder')))
        queueMicrotask(evaluate);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    const events = [
      'focus',
      'blur',
      'focusin',
      'focusout',
      'visibilitychange',
      'storage',
      'support-reminder-change',
      'notifications-change',
      'playing',
      'pause',
      'ended', 'resize', 'scroll',
    ];
    for (const name of events) window.addEventListener(name, evaluate, true);
    window.addEventListener('support-dialog-open', clear);
    const timer = setInterval(evaluate, 60_000);
    void evaluate();
    return {
      evaluate,
      destroy() {
        disposed = true;
        observer.disconnect();
        clearInterval(timer);
        for (const name of events)
          window.removeEventListener(name, evaluate, true);
        window.removeEventListener('support-dialog-open', clear);
        clear();
      },
    };
  }

  const boardEl = document.getElementById('board');
  const timeEl = document.getElementById('time');
  const matchesEl = document.getElementById('matches');
  const remainingEl = document.getElementById('remaining');
  const levelEl = document.getElementById('level');
  const scoreEl = document.getElementById('score');
  const newGameBtn = document.getElementById('newGameBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const hintBtn = document.getElementById('hintBtn');
  const tilesetSelect = document.getElementById('tilesetSelect');
  const langSelect = document.getElementById('langSelect');
  const startLevelInput = document.getElementById('startLevelInput');
  const menuBtn = document.getElementById('menuBtn');
  const menuDialog = document.getElementById('menuDialog');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const soundBtn = document.getElementById('soundBtn');
  const toastEl = document.getElementById('toast');
  const fxEl = document.getElementById('fx');
  const pageBgEl = document.getElementById('page-bg');
  const aboutBtn = document.getElementById('aboutBtn');
  const aboutDialog = document.getElementById('aboutDialog');
  const aboutCloseBtn = document.getElementById('aboutCloseBtn');
  const supportBtn = document.getElementById('supportBtn');
  const supportDialog = document.getElementById('supportDialog');
  const supportStatus = document.getElementById('supportStatus');
  const supportFeedback = document.getElementById('supportFeedback');
  const supportExternal = document.getElementById('supportExternal');
  const supportFrameHost = document.getElementById('supportFrameHost');
  const SUPPORT_URL = 'https://ko-fi.com/vionixconsulting';
  const SUPPORT_EMBED_URL = `${SUPPORT_URL}/?hidefeed=true&widget=true&embed=true&preview=true`;
  let supportTimer = null;
  let supportOpener = null;


  // Board scale driven solely by auto-fit

  // Config (dynamic sizing per level)
  let ROWS = 8;        // interior rows (without outer boundary)
  let COLS = 12;       // interior cols (without outer boundary)
  // Tile sets
  const TILE_SETS = {
    thai: [
      'elephant','tuktuk','boat','lotus','chili','mango','coconut','durian','palm','buddha','rooster',
      'temple','khonmask','umbrella','orchid','thaitea','bananaleaf','sala','krathong','naga','drum','ricebowl',
      'padthai','tomyum','somtam','mangostickyrice','padkrapao'
    ],
    dinosaur: [
      'trex','stegosaurus','triceratops','pterodactyl','brachiosaurus','raptor','ankylosaurus','parasaurolophus','spinosaurus','dilophosaurus','egg','footprint',
      'allosaurus','carnotaurus','giganotosaurus','pachycephalosaurus','ceratosaurus','iguanodon','protoceratops','therizinosaurus','mosasaurus','archaeopteryx','apatosaurus','coelophysis'
    ]
  };
  function getParam(name, def) { const u=new URLSearchParams(location.search); return u.get(name) ?? def; }
  const currentTileSet = (getParam('tileset','thai') in TILE_SETS) ? getParam('tileset','thai') : 'thai';
  const TILE_KEYS = TILE_SETS[currentTileSet];
  // Load tiles from theme-specific subfolders
  const TILE_PNG = Object.fromEntries(TILE_KEYS.map(k => [k, `assets/tiles_png/${currentTileSet}/${k}.png`]));
  const TILE_SVG = Object.fromEntries(TILE_KEYS.map(k => [k, `assets/tiles/${currentTileSet}/${k}.svg`]));
  const TILE_FALLBACK = 'assets/tiles/placeholder.svg';


  // State
  let grid = [];         // (ROWS+2) x (COLS+2) grid including boundary
  let nodes = [];        // DOM cells for interior
  let selected = null;   // {r,c, el, type}
  let matches = 0;
  let remaining = 0;     // number of tiles left
  let startTs = 0;
  let timerHandle = null;
  let level = 1;
  let score = 0;
  let gameOver = false;
  let inTransition = false;
  let gameplayStarted = false;
  let countedLevel = null;

  // Scoring config
  const START_SCORE = 50;
  const SCORE_PER_MATCH = 4;
  const PENALTY_FAIL = 2;
  const PENALTY_SHUFFLE = 5;

  // Performance helpers
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function computeMoveMs() {
    const tiles = ROWS * COLS;
    let ms = 180;
    if (tiles >= 1600) ms = 110; // very large boards
    else if (tiles >= 800) ms = 140; // large boards
    if (prefersReducedMotion()) ms -= 50;
    return Math.max(90, ms);
  }

  // Utils
  const rand = (n) => Math.floor(Math.random()*n);
  const shuffle = (arr) => { for (let i=arr.length-1;i>0;i--){ const j=rand(i+1); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; };

  function fmtTime(sec) {
    const m = Math.floor(sec/60), s = sec % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function setBoardDims(r, c) {
    boardEl.style.setProperty('--rows', r);
    boardEl.style.setProperty('--cols', c);
    // Also set on root for inheritance fallback
    document.documentElement.style.setProperty('--rows', r);
    document.documentElement.style.setProperty('--cols', c);
  }

  // Simple SFX (Web Audio)
  const SFX = (() => {
    let ctx = null;
    let enabled = true;
    const saved = localStorage.getItem('sound');
    if (saved === 'off') enabled = false;

    function ensureCtx() {
      if (ctx || !enabled) return ctx;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      return ctx;
    }
    function now() { return (ctx ? ctx.currentTime : 0); }
    function env(g, t0, a=0.005, d=0.12) {
      g.gain.cancelScheduledValues(t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(g._level || 0.12, t0 + a);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    }
    function beep(freq=440, dur=0.12, type='sine', level=0.12, detune=0) {
      if (!enabled || !ensureCtx()) return;
      const t0 = now();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      g._level = level;
      o.connect(g); g.connect(ctx.destination);
      env(g, t0, 0.004, dur);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    }
    function sweep(f1, f2, dur=0.24, type='sine', level=0.12) {
      if (!enabled || !ensureCtx()) return;
      const t0 = now();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f1, t0); o.frequency.linearRampToValueAtTime(f2, t0 + dur);
      g._level = level; o.connect(g); g.connect(ctx.destination);
      env(g, t0, 0.006, dur * 0.9);
      o.start(t0); o.stop(t0 + dur + 0.03);
    }
    function chord(freqs=[440,550,660], dur=0.18, type='sine', level=0.09) {
      if (!enabled || !ensureCtx()) return;
      const t0 = now();
      const master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = type; o.frequency.value = f;
        g._level = level; o.connect(g); g.connect(master);
        const d = 0.004 + i*0.006; env(g, t0, d, dur*0.9);
        o.start(t0); o.stop(t0 + dur + 0.04);
      });
    }
    function play(name) {
      if (!enabled) return;
      switch (name) {
        case 'click': beep(700, 0.05, 'triangle', 0.06); break;
        case 'match': beep(660, 0.08, 'triangle', 0.08); setTimeout(()=>beep(880, 0.1, 'sine', 0.08), 70); break;
        case 'fail': sweep(300, 180, 0.16, 'sawtooth', 0.06); break;
        case 'shuffle': sweep(240, 420, 0.12, 'triangle', 0.06); sweep(420, 220, 0.18, 'sine', 0.05); break;
        case 'hint': beep(1200, 0.06, 'sine', 0.07); break;
        case 'victory': chord([523.25, 659.25, 783.99], 0.22, 'triangle', 0.08); setTimeout(()=>chord([659.25, 783.99, 987.77], 0.22, 'triangle', 0.07), 180); break;
        case 'defeat': sweep(320, 120, 0.4, 'sawtooth', 0.05); break;
      }
    }
    function setEnabled(v) {
      enabled = !!v;
      localStorage.setItem('sound', enabled ? 'on' : 'off');
      if (enabled) ensureCtx();
    }
    function toggle() { setEnabled(!enabled); return enabled; }
    return { play, toggle, setEnabled, get enabled(){ return enabled; }, ensureCtx };
  })();

  function sizeForLevel(lvl) {
    // Aspect-aware sizing: choose rows/cols from target area to fit wrapper ratio.
    // Orientation bias: portrait -> rows > cols; landscape -> cols > rows.
    const wrapper = document.getElementById('board-wrapper');
    const rect = wrapper?.getBoundingClientRect();
    const w = rect?.width || window.innerWidth || 1024;
    const h = rect?.height || window.innerHeight || 768;
    const ratio = w / Math.max(1, h);
    // Hysteresis buckets to avoid flapping near 1:1
    const smallPhone = Math.min(w, h) <= 420; // tighter caps on phones
    const longMax = smallPhone ? 10 : 14;
    const shortMax = smallPhone ? 7 : 10; // reduce short side to keep tiles usable
    const bucket = (ratio >= 1.15) ? 'landscape' : (ratio <= 0.85) ? 'portrait' : 'square';
    const caps = bucket === 'landscape'
      ? { minR: 4, minC: 4, maxR: shortMax, maxC: longMax }
      : bucket === 'portrait'
        ? { minR: 4, minC: 4, maxR: longMax, maxC: shortMax }
        : { minR: 4, minC: 4, maxR: 12, maxC: 12 }; // near-square -> balanced

    const steps = Math.max(0, Math.floor(lvl) - 1);
    const targetArea = (4 + steps) * (4 + steps); // preserve progression from 4x4

    // Ideal rows/cols approximating target area under current aspect ratio
    const idealRowsFloat = Math.sqrt(targetArea / ratio);
    let rows = Math.round(idealRowsFloat);
    rows = Math.max(caps.minR, Math.min(caps.maxR, rows));
    let cols = Math.ceil(targetArea / rows);
    cols = Math.max(caps.minC, Math.min(caps.maxC, cols));

    // Enforce orientation bias strictly when possible
    if (bucket === 'portrait' && rows <= cols) {
      rows = Math.min(caps.maxR, Math.max(rows, Math.min(caps.maxR, cols + 1)));
      cols = Math.max(caps.minC, Math.min(caps.maxC, Math.ceil(targetArea / Math.max(rows,1))));
    } else if (bucket === 'landscape' && cols <= rows) {
      cols = Math.min(caps.maxC, Math.max(cols, Math.min(caps.maxC, rows + 1)));
      rows = Math.max(caps.minR, Math.min(caps.maxR, Math.ceil(targetArea / Math.max(cols,1))));
    }

    // If still under target area due to caps, try adjusting the other dimension
    if (rows * cols < targetArea) {
      // try grow rows if possible
      if (rows < caps.maxR) rows = Math.min(caps.maxR, Math.ceil(targetArea / Math.max(cols, 1)));
      // recalc cols to match rows
      cols = Math.max(caps.minC, Math.min(caps.maxC, Math.ceil(targetArea / Math.max(rows, 1))));
    }

    // Enforce sane grid ratio (avoid extremely skinny grids)
    const gridRatio = cols / rows;
    const maxAllowedRatio = 2.4; // allow up to ~6x14 in portrait
    if (gridRatio > maxAllowedRatio && cols > caps.minC) {
      const reduce = Math.min(cols - caps.minC, Math.ceil(cols - 2 * rows));
      cols -= Math.max(0, reduce);
    } else if (gridRatio < 0.5 && rows > caps.minR) {
      const reduce = Math.min(rows - caps.minR, Math.ceil(rows - 2 * cols));
      rows -= Math.max(0, reduce);
    }

    // Final orientation guarantee (best-effort within caps)
    if (bucket === 'portrait' && rows <= cols) {
      if (rows < caps.maxR) rows = Math.min(caps.maxR, cols + 1);
      else if (cols > caps.minC) cols = Math.max(caps.minC, rows - 1);
    } else if (bucket === 'landscape' && cols <= rows) {
      if (cols < caps.maxC) cols = Math.min(caps.maxC, rows + 1);
      else if (rows > caps.minR) rows = Math.max(caps.minR, cols - 1);
    }

    return { rows, cols };
  }

  function adjustTileScale() {
    const wrapper = document.getElementById('board-wrapper');
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const csRoot = getComputedStyle(document.documentElement);
    const defaultGap = parseFloat(csRoot.getPropertyValue('--tile-gap')) || 10;
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    // Dimension/input-driven minimums (no UA sniffing)
    const minTile = isCoarse ? 42 : 28; // larger tap targets on coarse pointers
    const maxTile = 120;

    // Reduce gap for larger boards (down to ~2px as boards get huge)
    const maxSide = Math.max(ROWS, COLS);
    const gap = Math.max(1, Math.min(defaultGap, Math.round(defaultGap - (maxSide - 5) / (50 - 5) * 6)));
    document.documentElement.style.setProperty('--tile-gap', gap + 'px');

    const wAvail = rect.width;
    const hAvail = rect.height;

    // Compute ideal tile size that fits without scaling
    const fitTile = Math.floor(Math.min(
      (wAvail - gap * (COLS + 1)) / COLS,
      (hAvail - gap * (ROWS + 1)) / ROWS
    ));

    // Start from clamped size
    let tileSize = Math.max(minTile, Math.min(maxTile, fitTile));
    document.documentElement.style.setProperty('--tile-size', tileSize + 'px');

    // Compute content size at this tile size to check overflow
    const needW = tileSize * COLS + gap * (COLS + 1);
    const needH = tileSize * ROWS + gap * (ROWS + 1);
    let scale = 1;
    if (needW > wAvail || needH > hAvail) {
      // If even the minimum tile overflows, fall back to uniform board scale
      // Keep at least the minimum tile px for legibility; scale board visually to fit
      if (tileSize > minTile) {
        // try smaller tile down to min
        tileSize = minTile;
        document.documentElement.style.setProperty('--tile-size', tileSize + 'px');
      }
      const minNeedW = tileSize * COLS + gap * (COLS + 1);
      const minNeedH = tileSize * ROWS + gap * (ROWS + 1);
      scale = Math.min(wAvail / Math.max(1, minNeedW), hAvail / Math.max(1, minNeedH), 1);
    }
    document.documentElement.style.setProperty('--board-scale', String(scale));

    // Adjust tilt slightly when vertical space is tight to save height
    const targetTilt = (hAvail < 520) ? 22 : (hAvail < 640) ? 26 : 30;
    document.documentElement.style.setProperty('--board-rotate-x', targetTilt + 'deg');
  }

  function makePairs(pairCount) {
    // Choose a random subset of tile types for this game.
    // If we need more pairs than unique keys, cycle through shuffled keys.
    const keysShuffled = shuffle([...TILE_KEYS]);
    const needed = pairCount;
    const types = [];
    while (types.length < needed) {
      const batch = types.length === 0 ? keysShuffled : shuffle([...TILE_KEYS]);
      for (const k of batch) {
        types.push(k);
        if (types.length >= needed) break;
      }
    }
    const pairs = [];
    for (const t of types.slice(0, needed)) pairs.push(t, t);
    return pairs;
  }

  function createGrid() {
    // Allocate grid with boundary zeros
    grid = Array.from({length: ROWS+2}, () => Array.from({length: COLS+2}, () => 0));
    const interiorCount = ROWS * COLS;
    // Fill as many tiles as the raster allows (leave one empty for odd cell counts)
    let pairsTarget = Math.floor(interiorCount / 2);
    const symbols = shuffle(makePairs(pairsTarget));
    remaining = pairsTarget * 2;
    matches = 0;
    updateStats();

    // Choose random interior positions and place symbols; rest remain empty
    const positions = [];
    for (let r=1; r<=ROWS; r++) for (let c=1; c<=COLS; c++) positions.push([r,c]);
    shuffle(positions);
    for (let i=0; i<symbols.length; i++) {
      const [r,c] = positions[i];
      grid[r][c] = symbols[i];
    }
  }

  function renderGrid() {
    boardEl.innerHTML = '';
    setBoardDims(ROWS, COLS);
    nodes = Array.from({length: ROWS}, () => Array.from({length: COLS}, () => null));

    const frag = document.createDocumentFragment();
    for (let r=1; r<=ROWS; r++) {
      for (let c=1; c<=COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        if (grid[r][c] !== 0) {
          const tile = document.createElement('button');
          tile.type = 'button';
          tile.className = 'tile';
          tile.dataset.type = grid[r][c];
          tile.setAttribute('aria-label', `Tile ${grid[r][c]}`);
          cell.removeAttribute('aria-hidden');
          const img = document.createElement('img');
          img.alt = grid[r][c];
          img.draggable = false;
          img.decoding = 'async';
          img.src = TILE_PNG[grid[r][c]] || TILE_SVG[grid[r][c]] || TILE_FALLBACK;
          img.onerror = () => {
            if (img.src.endsWith('.png') && TILE_SVG[grid[r][c]]) { img.src = TILE_SVG[grid[r][c]]; return; }
            img.src = TILE_FALLBACK; img.onerror = null;
          };
          tile.appendChild(img);
          cell.appendChild(tile);
        } else {
          cell.setAttribute('aria-hidden', 'true');
        }
        nodes[r-1][c-1] = cell;
        frag.appendChild(cell);
      }
    }
    boardEl.appendChild(frag);
    // Recompute tile size once DOM is updated
    adjustTileScale();
  }

  function onTileClickEl(tileEl) {
    if (gameOver || inTransition) return;
    const r = +tileEl.parentElement.dataset.r;
    const c = +tileEl.parentElement.dataset.c;
    const type = grid[r][c];

    if (!type) return;
    gameplayStarted = true;
    window.dispatchEvent(new Event("support-reminder-change"));

    if (!selected) {
      selected = { r, c, type, el: tileEl };
      tileEl.classList.add('selected');
      dimNonMatching(type);
      SFX.play('click');
      return;
    }

    // Clicking the same tile deselects
    if (selected.r === r && selected.c === c) {
      clearSelection();
      return;
    }

    if (type !== selected.type) {
      pulse(tileEl, 'danger');
      pulse(selected.el, 'danger');
      animateOnce(tileEl, 'anim-fail', 280);
      animateOnce(selected.el, 'anim-fail', 280);
      SFX.play('fail');
      adjustScore(-PENALTY_FAIL);
      clearSelection();
      return;
    }

    const path = findPath([selected.r, selected.c], [r, c]);
    if (path) {
      animateOnce(tileEl, 'anim-success', 240);
      animateOnce(selected.el, 'anim-success', 240);
      SFX.play('match');
      removeTiles([selected.r, selected.c], [r, c]);
      matches++;
      adjustScore(SCORE_PER_MATCH);
      remaining -= 2;
      updateStats();
      clearSelection();
      // After removal, animate directly to final positions (gravity + compaction in one pass)
      setTimeout(() => {
        inTransition = true;
        animateShiftToFinal().then(() => { inTransition = false; ensureSolvableIfLocked(); checkWin(); });
      }, 340);
    } else {
      // Not connectable within 2 turns
      pulse(tileEl, 'warn');
      pulse(selected.el, 'warn');
      adjustScore(-PENALTY_FAIL);
      clearSelection();
    }
  }

  // Event delegation: single click listener on board
  boardEl.addEventListener('click', (e) => {
    const tileEl = e.target && e.target.closest && e.target.closest('.tile');
    if (!tileEl || !boardEl.contains(tileEl)) return;
    onTileClickEl(tileEl);
  });

  function dimNonMatching(type) {
    document.querySelectorAll('.tile').forEach(el => {
      if (el.dataset.type !== type) el.classList.add('dim');
    });
  }
  function undimAll() { document.querySelectorAll('.tile.dim').forEach(el => el.classList.remove('dim')); }

  function clearSelection() {
    if (selected) selected.el.classList.remove('selected');
    selected = null;
    undimAll();
  }

  function pulse(el, kind) {
    const color = kind === 'danger' ? '#ff6b6b' : kind === 'warn' ? '#ffb84d' : '#6bd6ff';
    el.style.boxShadow = `0 0 0 3px ${color} inset, 0 16px 24px rgba(0,0,0,0.35)`;
    setTimeout(() => { el.style.boxShadow = ''; }, 180);
  }

  function removeTiles(p1, p2) {
    const [r1,c1] = p1, [r2,c2] = p2;
    grid[r1][c1] = 0;
    grid[r2][c2] = 0;
    const n1 = nodes[r1-1][c1-1].querySelector('.tile');
    const n2 = nodes[r2-1][c2-1].querySelector('.tile');
    if (n1) n1.classList.add('matched');
    if (n2) n2.classList.add('matched');
    // remove from DOM shortly after animation
    setTimeout(() => {
      for (const tile of [n1, n2]) {
        const cell = tile?.parentElement;
        if (cell) { cell.innerHTML = ''; cell.setAttribute('aria-hidden', 'true'); }
      }
    }, 320);
  }

  // Compute final mapping after gravity and horizontal compaction, then animate in one pass
  function animateShiftToFinal() {
    if (prefersReducedMotion()) {
      applyGravityInPlace();
      applyHorizontalCompactionInPlace();
      renderGrid();
      return Promise.resolve();
    }
    const mapping = computeFinalMapping();
    const moves = mapping.filter(m => m.destR !== m.src.r || m.destC !== m.src.c);
    if (moves.length === 0) return Promise.resolve();
    // Determine step sizes from CSS variables (tile-size + gap)
    const cs = getComputedStyle(document.documentElement);
    const tileSize = parseFloat(cs.getPropertyValue('--tile-size')) || 64;
    const gap = parseFloat(cs.getPropertyValue('--tile-gap')) || 10;
    const stepX = tileSize + gap;
    const stepY = tileSize + gap;
    const MOVE_MS = computeMoveMs();
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        moves.forEach(m => {
          const el = nodes[m.src.r-1]?.[m.src.c-1]?.querySelector('.tile');
          if (!el) return;
          const dx = (m.destC - m.src.c) * stepX;
          const dy = (m.destR - m.src.r) * stepY;
          el.style.transition = `transform ${MOVE_MS}ms ease`;
          el.style.transform = `translate3d(${dx}px, ${dy}px, 10px)`;
          el.style.pointerEvents = 'none';
        });
      });
      setTimeout(() => {
        // Build final grid from mapping
        const newGrid = Array.from({length: ROWS+2}, () => Array.from({length: COLS+2}, () => 0));
        mapping.forEach(m => { newGrid[m.destR][m.destC] = grid[m.src.r][m.src.c]; });
        grid = newGrid;
        renderGrid();
        resolve();
      }, MOVE_MS + 20);
    });
  }

  function computeFinalMapping() {
    // Collect all current tiles
    const items = [];
    for (let r=1; r<=ROWS; r++) for (let c=1; c<=COLS; c++) if (grid[r][c] !== 0) items.push({ r, c });
    // Apply gravity mapping per column (bottom fill)
    const afterGrav = [];
    for (let c=1; c<=COLS; c++) {
      const col = items.filter(it => it.c === c).sort((a,b)=> b.r - a.r);
      let write = ROWS;
      for (const it of col) { afterGrav.push({ src: it, r: write, c }); write--; }
    }
    // Apply horizontal compaction per row (left fill)
    const mapping = [];
    for (let r=1; r<=ROWS; r++) {
      const row = afterGrav.filter(it => it.r === r).sort((a,b)=> a.c - b.c);
      let write = 1;
      for (const it of row) { mapping.push({ src: it.src, destR: r, destC: write }); write++; }
    }
    return mapping;
  }
  function applyGravityInPlace() {
    for (let c = 1; c <= COLS; c++) {
      let write = ROWS;
      for (let r = ROWS; r >= 1; r--) {
        if (grid[r][c] !== 0) {
          if (r !== write) {
            grid[write][c] = grid[r][c];
            grid[r][c] = 0;
          }
          write--;
        }
      }
    }
  }

  function applyHorizontalCompactionInPlace() {
    for (let r = 1; r <= ROWS; r++) {
      let write = 1;
      for (let c = 1; c <= COLS; c++) {
        if (grid[r][c] !== 0) {
          if (c !== write) {
            grid[r][write] = grid[r][c];
            grid[r][c] = 0;
          }
          write++;
        }
      }
    }
  }

  function updateStats() {
    matchesEl.textContent = String(matches);
    remainingEl.textContent = String(remaining);
    levelEl.textContent = String(level);
    scoreEl.textContent = String(score);
  }

  function startTimer() {
    clearInterval(timerHandle);
    startTs = Date.now();
    timeEl.textContent = '0:00';
    timerHandle = setInterval(() => {
      const sec = Math.floor((Date.now()-startTs)/1000);
      timeEl.textContent = fmtTime(sec);
    }, 1000);
  }

  function stopTimer() { clearInterval(timerHandle); timerHandle = null; }

  // Pathfinding helpers
  function isEmpty(r, c, a, b) {
    // cell considered empty if 0 or it's one of endpoints a/b
    const isEndpoint = (r === a[0] && c === a[1]) || (r === b[0] && c === b[1]);
    return isEndpoint || grid[r][c] === 0;
  }

  function isClearRow(r, c1, c2, a, b) {
    const [lo, hi] = c1 <= c2 ? [c1, c2] : [c2, c1];
    for (let c = lo + 1; c < hi; c++) {
      if (!isEmpty(r, c, a, b)) return false;
    }
    return true;
  }

  function isClearCol(c, r1, r2, a, b) {
    const [lo, hi] = r1 <= r2 ? [r1, r2] : [r2, r1];
    for (let r = lo + 1; r < hi; r++) {
      if (!isEmpty(r, c, a, b)) return false;
    }
    return true;
  }

  function findPath(a, b) {
    const [r1,c1] = a, [r2,c2] = b;
    if (grid[r1][c1] === 0 || grid[r2][c2] === 0) return null;
    if (grid[r1][c1] !== grid[r2][c2]) return null;

    // 0-turn (same row/col)
    if (r1 === r2 && isClearRow(r1, c1, c2, a, b)) {
      return [[r1,c1],[r1,c2]];
    }
    if (c1 === c2 && isClearCol(c1, r1, r2, a, b)) {
      return [[r1,c1],[r2,c1]];
    }

    // 1-turn (L shape): pivots at (r1,c2) or (r2,c1)
    if (isEmpty(r1, c2, a, b) && isClearRow(r1, c1, c2, a, b) && isClearCol(c2, r1, r2, a, b)) {
      return [[r1,c1],[r1,c2],[r2,c2]];
    }
    if (isEmpty(r2, c1, a, b) && isClearCol(c1, r1, r2, a, b) && isClearRow(r2, c1, c2, a, b)) {
      return [[r1,c1],[r2,c1],[r2,c2]];
    }

    // 2-turn: scan rows
    for (let r=0; r<ROWS+2; r++) {
      if (!isEmpty(r, c1, a, b) || !isEmpty(r, c2, a, b)) continue;
      if (!isClearCol(c1, r, r1, a, b)) continue;
      if (!isClearRow(r, c1, c2, a, b)) continue;
      if (!isClearCol(c2, r, r2, a, b)) continue;
      return [[r1,c1],[r,c1],[r,c2],[r2,c2]];
    }
    // 2-turn: scan cols
    for (let c=0; c<COLS+2; c++) {
      if (!isEmpty(r1, c, a, b) || !isEmpty(r2, c, a, b)) continue;
      if (!isClearRow(r1, c, c1, a, b)) continue;
      if (!isClearCol(c, r1, r2, a, b)) continue;
      if (!isClearRow(r2, c, c2, a, b)) continue;
      return [[r1,c1],[r1,c],[r2,c],[r2,c2]];
    }
    return null;
  }

  // Connection path drawing removed

  // I18N
  const I18N = {
    th: {
      title: 'vxThails', new_game: 'เริ่มใหม่', shuffle: 'สับไทล์', hint: 'คำใบ้',
      level: 'ด่าน', score: 'คะแนน', time: 'เวลา', matches: 'จับคู่', remaining: 'คงเหลือ',
      start_level: 'ด่านเริ่มต้น',
      menu: 'เมนู', menu_title: 'เมนูเกม',
      tip: 'เคล็ดลับ: เชื่อมไทล์ที่เหมือนกันโดยหักเลี้ยวได้ไม่เกิน 2 ครั้ง',
      tileset_label: 'ชุดไทล์', tileset_thai: 'ไทย', tileset_dino: 'ไดโนเสาร์', language_label: 'ภาษา',
      level_cleared: (n)=>`ผ่านด่าน ${n} แล้ว!`, game_over: 'จบเกม — คะแนนเหลือ 0 เริ่มใหม่เพื่อเล่นอีกครั้ง.',
      auto_shuffle: 'ไม่มีทางเดิน — สับไทล์อัตโนมัติ',
      by_vionix: 'โดย Vionix Consulting', about: 'เกี่ยวกับ', about_title: 'เกี่ยวกับ vxThails',
      about_description: 'เกมจับคู่ไทล์ในเบราว์เซอร์ พร้อมธีมไทยและไดโนเสาร์',
      visit_vionix: 'เยี่ยมชม Vionix Consulting', source_code: 'ซอร์สโค้ด', report_issue: 'รายงานปัญหา',
      code_license: 'สัญญาอนุญาตโค้ด (GPL-3.0-or-later)', art_license: 'สัญญาอนุญาตภาพ (CC BY-SA 4.0)',
      project_links: 'ลิงก์โครงการ', new_tab: 'เปิดในแท็บใหม่',
      support_action: 'สนับสนุนโครงการนี้', support_short: 'สนับสนุน', support_title: 'สนับสนุน vxThails',
      support_external: 'เปิด Ko-fi ในแท็บใหม่', support_frame: 'สนับสนุน Vionix Consulting บน Ko-fi',
      support_loading: 'กำลังโหลด Ko-fi…', support_delayed: 'ใช้เวลานานกว่าที่คาดไว้',
      donation_cash: "เงินสด",
      donation_crypto: "คริปโต",
      donation_method: "วิธีสนับสนุน",
      donation_network: "เครือข่าย",
      donation_receivingAddress: "ที่อยู่รับเงิน",
      donation_copyAddress: "คัดลอกที่อยู่",
      donation_copied: "คัดลอกแล้ว",
      donation_copySuccess: "คัดลอกที่อยู่แล้ว",
      donation_copyManually: "คัดลอกด้วยตนเอง",
      donation_copyError: "คัดลอกไม่สำเร็จ โปรดเลือกที่อยู่และคัดลอกด้วยตนเอง",
      donation_showQR: "แสดงคิวอาร์โค้ด",
      donation_hideQR: "ซ่อนคิวอาร์โค้ด",
      donation_assets: "{asset}, USDC, USDT และโทเคนอื่น ๆ",
      donation_qrLabel: "คิวอาร์โค้ดที่อยู่รับเงินบน {network}",
      donation_qrFailed: "ไม่สามารถแสดงคิวอาร์โค้ดได้ โปรดคัดลอกที่อยู่แทน",

      close: 'ปิด'
    },
    en: {
      title: 'vxThails', new_game: 'New Game', shuffle: 'Shuffle', hint: 'Hint',
      level: 'Level', score: 'Score', time: 'Time', matches: 'Matches', remaining: 'Remaining',
      start_level: 'Start level',
      menu: 'Menu', menu_title: 'Game Menu',
      tip: 'Tip: Connect matching tiles with up to 2 turns.',
      tileset_label: 'Tile set', tileset_thai: 'Thai', tileset_dino: 'Dinosaur', language_label: 'Language',
      level_cleared: (n)=>`Level ${n} cleared!`, game_over: 'Game Over — Score reached 0. New Game to retry.',
      auto_shuffle: 'No moves — auto-shuffled',
      by_vionix: 'By Vionix Consulting', about: 'About', about_title: 'About vxThails',
      about_description: 'A browser tile-matching game with Thai and dinosaur themes.',
      visit_vionix: 'Visit Vionix Consulting', source_code: 'Source code', report_issue: 'Report an issue',
      code_license: 'Code license (GPL-3.0-or-later)', art_license: 'Art license (CC BY-SA 4.0)',
      project_links: 'Project links', new_tab: 'opens in a new tab',
      support_action: 'Support this project', support_short: 'Support', support_title: 'Support vxThails',
      support_external: 'Open Ko-fi in new tab', support_frame: 'Support Vionix Consulting on Ko-fi',
      support_loading: 'Loading Ko-fi…', support_delayed: 'Taking longer than expected.',
      donation_cash: "Cash",
      donation_crypto: "Crypto",
      donation_method: "Donation method",
      donation_network: "Network",
      donation_receivingAddress: "Receiving address",
      donation_copyAddress: "Copy address",
      donation_copied: "Copied",
      donation_copySuccess: "Address copied.",
      donation_copyManually: "Copy manually",
      donation_copyError: "Could not copy. Select the address and copy it manually.",
      donation_showQR: "Show QR code",
      donation_hideQR: "Hide QR code",
      donation_assets: "{asset}, USDC, USDT and other tokens",
      donation_qrLabel: "{network} receiving address QR code",
      donation_qrFailed: "QR code unavailable. Copy the address instead.",

      close: 'Close'
    }
  };
  const lang = (getParam('lang','th') === 'en') ? 'en' : 'th';
  function applyI18n() {
    updateReminderCopy();
    const dict = I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      if (!key) return;
      const val = dict[key];
      if (typeof val === 'string') node.textContent = val;
    });
    // Attributes and document title
    document.title = dict.title;
    document.documentElement.lang = lang;
    document.querySelector('.publisher-credit').setAttribute('aria-label', `${dict.by_vionix} (${dict.new_tab})`);
    aboutDialog.querySelector('.project-links').setAttribute('aria-label', dict.project_links);
    aboutDialog.querySelector('.about-identity').setAttribute('aria-label', `${dict.visit_vionix} (${dict.new_tab})`);
    aboutCloseBtn.setAttribute('aria-label', dict.close);
    document.getElementById('supportCloseBtn').setAttribute('aria-label', dict.close);
    for(const button of [supportBtn, document.getElementById('aboutSupportBtn')]) button.setAttribute('aria-label', dict.support_action);
    // reset view control removed
    if (tilesetSelect) tilesetSelect.setAttribute('aria-label', dict.tileset_label);
    if (langSelect) langSelect.setAttribute('aria-label', dict.language_label);
    if (soundBtn) {
      soundBtn.title = SFX.enabled ? (lang==='th'?'เปิดเสียง':'Sound on') : (lang==='th'?'ปิดเสียง':'Sound off');
    }
  }

  // Controls
  newGameBtn.addEventListener('click', () => { closeMenu(); init(); });
  shuffleBtn.addEventListener('click', doShuffle);
  hintBtn.addEventListener('click', doHint);
  // reset zoom control removed
  if (soundBtn) {
    const applyIcon = () => {
      soundBtn.textContent = SFX.enabled ? '🔊' : '🔇';
      soundBtn.setAttribute('aria-pressed', String(SFX.enabled));
      soundBtn.title = SFX.enabled ? (lang==='th'?'เปิดเสียง':'Sound on') : (lang==='th'?'ปิดเสียง':'Sound off');
    };
    applyIcon();
    soundBtn.addEventListener('click', () => { SFX.toggle(); applyIcon(); });
    ['pointerdown','keydown','touchstart'].forEach(evt => {
      window.addEventListener(evt, () => { if (SFX.enabled) SFX.ensureCtx(); }, { once: true, passive: true });
    });
  }

  aboutBtn.addEventListener('click', () => { aboutBtn.focus(); aboutDialog.showModal(); });
  aboutCloseBtn.addEventListener('click', () => aboutDialog.close());
  aboutDialog.addEventListener('close', () => {
    if(!supportDialog.open && document.activeElement === document.body) aboutBtn.focus();
  });

  let supportMethods;
  function openSupport(opener) {
    if (document.querySelector("dialog[open]")) return;
    void supportReminders.postpone();
    window.dispatchEvent(new Event("support-dialog-open"));
    opener.focus();
    supportOpener = opener;
    const dict = I18N[lang];
    supportFeedback.hidden = false;
    supportExternal.hidden = true;
    supportStatus.hidden = false;
    supportStatus.textContent = dict.support_loading;
    const frame = document.createElement('iframe');
    frame.src = SUPPORT_EMBED_URL;
    frame.title = dict.support_frame;
    frame.referrerPolicy = 'no-referrer';
    supportTimer = window.setTimeout(() => { supportStatus.textContent = dict.support_delayed; supportExternal.hidden = false; }, 10_000);
    frame.addEventListener('load', () => {
      window.clearTimeout(supportTimer);
      supportStatus.hidden = true;
      supportFeedback.hidden = true;
    });
    supportFrameHost.replaceChildren(frame);
    supportMethods = donationMethods({
      body: supportDialog.querySelector('.support-body'),
      kofiPanel: supportDialog.querySelector('.support-kofi'),
      id: 'support',
      text: (key, params = {}) => I18N[lang][`donation_${key}`].replace(/\{(\w+)\}/g, (_match, name) => params[name]),
    });
    supportDialog.showModal();
    document.getElementById('supportCloseBtn').focus();
  }
  supportBtn.addEventListener('click', () => openSupport(supportBtn));
  document.getElementById('aboutSupportBtn').addEventListener('click', () => {
    aboutDialog.close();
    openSupport(aboutBtn);
  });
  document.getElementById('supportCloseBtn').addEventListener('click', () => supportDialog.close());
  supportDialog.addEventListener('close', () => {
    window.clearTimeout(supportTimer);
    supportFrameHost.replaceChildren();
    supportMethods?.dispose();
    supportMethods = undefined;
    if (supportOpener && supportOpener.isConnected && document.activeElement === document.body) supportOpener.focus();
    supportOpener = null;
  });


  // Menu dialog
  function openMenu() { if (menuDialog) menuDialog.setAttribute('aria-hidden', 'false'); }
  function closeMenu() { if (menuDialog) menuDialog.setAttribute('aria-hidden', 'true'); }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
  const menuCloseTextBtn = document.getElementById('menuCloseTextBtn');
  if (menuCloseTextBtn) menuCloseTextBtn.addEventListener('click', closeMenu);
  // backdrop click
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t instanceof HTMLElement && t.classList.contains('dialog-backdrop')) closeMenu();
  });
  // escape key
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  // Dropdowns (reload with updated query)
  if (tilesetSelect) {
    tilesetSelect.value = currentTileSet;
    tilesetSelect.addEventListener('change', () => {
      const params = new URLSearchParams(location.search);
      params.set('tileset', tilesetSelect.value);
      location.search = params.toString();
    });
  }
  if (langSelect) {
    langSelect.value = lang;
    langSelect.addEventListener('change', () => {
      const params = new URLSearchParams(location.search);
      params.set('lang', langSelect.value);
      location.search = params.toString();
    });
  }

  // Mid-game re-evaluation on resize (debounced)
  let _resizeDebounce = null;
  window.addEventListener('resize', () => {
    if (_resizeDebounce) clearTimeout(_resizeDebounce);
    _resizeDebounce = setTimeout(() => { reEvaluateLayout(); }, 200);
  });

  // Zoom gestures removed; rely on auto-fit only

  function doShuffle() {
    if (gameOver || inTransition) return;
    gameplayStarted = true;
    window.dispatchEvent(new Event("support-reminder-change"));
    shuffleBoard({ penalize: true, playSound: true });
  }

  function doHint() {
    if (gameOver || inTransition) return;
    gameplayStarted = true;
    window.dispatchEvent(new Event("support-reminder-change"));
    const pair = findAnyMatch();
    if (!pair) return;
    SFX.play('hint');
    const [[r1,c1],[r2,c2]] = pair;
    const t1 = nodes[r1-1][c1-1].querySelector('.tile');
    const t2 = nodes[r2-1][c2-1].querySelector('.tile');
    t1?.classList.add('selected');
    t2?.classList.add('selected');
    setTimeout(() => { t1?.classList.remove('selected'); t2?.classList.remove('selected'); }, 500);
  }

  function findAnyMatch() {
    // Scan for any connectable pair by symbol
    const posBySym = new Map();
    for (let r=1;r<=ROWS;r++) {
      for (let c=1;c<=COLS;c++) {
        const sym = grid[r][c];
        if (!sym) continue;
        if (!posBySym.has(sym)) posBySym.set(sym, []);
        posBySym.get(sym).push([r,c]);
      }
    }
    for (const [sym, list] of posBySym) {
      for (let i=0;i<list.length;i++) for (let j=i+1;j<list.length;j++) {
        const a = list[i], b = list[j];
        const path = findPath(a, b);
        if (path) return [a,b];
      }
    }
    return null;
  }

  function checkWin() {
    if (remaining === 0 && !inTransition) {
      if (countedLevel !== level) { countedLevel = level; void supportReminders.recordUsage(); }
      stopTimer();
      inTransition = true;
      showToast(I18N[lang].level_cleared(level), 'good');
      SFX.play('victory');
      playVictory(() => { inTransition = false; nextLevel(); });
    }
  }

  function shuffleBoard(opts = {}) {
    const penalize = !!opts.penalize;
    const playSound = opts.playSound !== false;
    // collect all symbols currently on board
    const syms = [];
    for (let r=1;r<=ROWS;r++) for (let c=1;c<=COLS;c++) if (grid[r][c]) syms.push(grid[r][c]);
    shuffle(syms);
    let i=0;
    for (let r=1;r<=ROWS;r++) for (let c=1;c<=COLS;c++) if (grid[r][c]) grid[r][c] = syms[i++];
    renderGrid();
    clearSelection();
    if (playSound) SFX.play('shuffle');
    if (penalize) adjustScore(-PENALTY_SHUFFLE);
  }

  function ensureSolvableIfLocked() {
    if (remaining <= 0) return; // nothing to solve
    if (findAnyMatch()) return; // already solvable
    // Try a limited number of shuffles to find a solvable layout.
    let tries = 0;
    let solvable = false;
    while (tries < 25) {
      shuffleBoard({ penalize: false, playSound: tries === 0 });
      tries++;
      if (findAnyMatch()) { solvable = true; break; }
    }
    if (solvable) {
      showToast(I18N[lang].auto_shuffle || (lang==='th'?'ไม่มีทางเดิน — สับไทล์อัตโนมัติ':'No moves — auto-shuffled'), 'info', 900);
    }
  }

  // Manual rotate disabled: board uses fixed tilt only.

  function init() {
    // New Game resets level and score
    const startLv = parseInt(startLevelInput?.value || '1', 10);
    level = Number.isFinite(startLv) && startLv >= 1 ? startLv : 1;
    score = START_SCORE;
    gameOver = false;
    inTransition = false;
    gameplayStarted = false;
    countedLevel = null;
    document.body.classList.remove('victory','defeat');
    fxEl && (fxEl.innerHTML = '');
    const s = sizeForLevel(level);
    ROWS = s.rows; COLS = s.cols;
    setBoardDims(ROWS, COLS);
    applyI18n();
    applyBackground(currentTileSet);
    adjustTileScale();
    // fixed tilt; no manual reset
    createGrid();
    renderGrid();
    ensureSolvableIfLocked();
    clearSelection();
    updateStats();
    startTimer();
  }

  // resetView removed (fixed tilt)

  function nextLevel() {
    gameplayStarted = false;
    level += 1;
    const s = sizeForLevel(level);
    ROWS = s.rows; COLS = s.cols;
    setBoardDims(ROWS, COLS);
    // Regenerate icons if desired (kept same size for performance)
    adjustTileScale();
    // fixed tilt; no manual reset
    createGrid();
    renderGrid();
    clearSelection();
    updateStats();
    startTimer();
  }

  // Re-evaluate orientation caps mid-game and adapt board for current level.
  function reEvaluateLayout() {
    const s = sizeForLevel(level);
    const changed = (s.rows !== ROWS) || (s.cols !== COLS);
    ROWS = s.rows; COLS = s.cols;
    setBoardDims(ROWS, COLS);
    adjustTileScale();
    if (changed) {
      // Regenerate current level grid to fit new dimensions; keep level, score, and timer.
      createGrid();
      renderGrid();
      clearSelection();
      updateStats();
      ensureSolvableIfLocked();
    }
  }

  function adjustScore(delta) {
    score += delta;
    if (score < 0) score = 0;
    updateStats();
    if (score === 0) {
      onLose();
    }
  }

  function onLose() {
    if (gameOver) return;
    gameOver = true;
    stopTimer();
    playDefeat();
    SFX.play('defeat');
    showToast(I18N[lang].game_over, 'danger', 2500);
  }

  function showToast(msg, kind = 'info', ms = 1200) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    // Color hint via gradient edge
    const color = kind === 'good' ? 'var(--good)' : kind === 'danger' ? 'var(--danger)' : kind === 'accent';
    toastEl.style.boxShadow = `0 8px 18px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 2px ${color}`;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=> { toastEl.classList.remove('show'); }, ms);
  }

  // bootstrap
  // Resize handling to keep tiles fitting wrapper; also observe wrapper size
  window.addEventListener('resize', () => { adjustTileScale(); });
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => adjustTileScale());
    ro.observe(document.getElementById('board-wrapper'));
  }

  const REMINDER_COPY = {
    en: { name: 'Support reminder', message: 'Finding vxThails useful? Support its upkeep.', support: 'Support', notNow: 'Not now', never: 'Don’t remind me' },
    th: { name: 'แจ้งเตือนการสนับสนุน', message: 'vxThails มีประโยชน์ไหม? ร่วมสนับสนุนการดูแลแอปนี้', support: 'สนับสนุน', notNow: 'ไว้คราวหน้า', never: 'ไม่ต้องเตือนอีก' },
  };
  function updateReminderCopy() {
    const card = document.querySelector('.support-reminder');
    if (!card) return;
    const copy = REMINDER_COPY[lang] || REMINDER_COPY.en;
    card.setAttribute('aria-label', copy.name);
    card.querySelectorAll('[data-reminder]').forEach((node) => { node.textContent = copy[node.dataset.reminder]; });
  }
  function positionReminder() {
    const card = document.querySelector('.support-reminder');
    if (!card) return;
    let inset = 16;
    const left = Math.max(16, innerWidth - 396);
    for (const control of [supportBtn.closest('footer'), shuffleBtn, hintBtn]) {
      if (!control) continue;
      const rect = control.getBoundingClientRect();
      if (rect.width && rect.right > left && rect.top >= 0 && rect.top < innerHeight && rect.bottom > innerHeight - inset - card.offsetHeight)
        inset = Math.max(inset, innerHeight - rect.top + 12);
    }
    card.style.setProperty('--reminder-inset', `${inset}px`);
  }
  function showReminder({ support, postpone, disable }) {
    const element = document.createElement('section');
    element.className = 'support-reminder';
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    const message = document.createElement('p'); message.dataset.reminder = 'message';
    const actions = document.createElement('div'); actions.className = 'support-reminder-actions';
    for (const [key, run] of [['support', support], ['notNow', postpone], ['never', disable]]) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = key === 'support' ? 'btn btn-secondary' : 'btn btn-ghost';
      button.dataset.reminder = key; button.addEventListener('click', run); actions.append(button);
    }
    element.append(message, actions); document.body.append(element);
    updateReminderCopy(); positionReminder();
    let resizeFrame = 0;
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(positionReminder);
    }) : null;
    resize?.observe(element);
    return { element, destroy: () => { resize?.disconnect(); cancelAnimationFrame(resizeFrame); element.remove(); } };
  }
  function startSupportReminders() {
    createSupportReminderController({
      store: supportReminders,
      safe: () => {
        positionReminder();
        return document.visibilityState === 'visible' && document.hasFocus() &&
          (!gameplayStarted || gameOver) && !inTransition && menuDialog.getAttribute('aria-hidden') !== 'false' && !toastEl.classList.contains('show') && !document.querySelector('dialog[open]') &&
          !document.activeElement?.matches('input, select, textarea, [contenteditable="true"]');
      },
      getSupport: () => supportBtn,
      openSupport,
      onVisible: positionReminder,
      show: showReminder,
    });
  }
  init();
  startSupportReminders();

  // Animations helpers
  function animateOnce(el, cls, ms) {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms || 250);
  }

  function playVictory(done) {
    document.body.classList.add('victory');
    // Confetti burst
    spawnConfetti(80, 1400);
    setTimeout(() => {
      document.body.classList.remove('victory');
      done && done();
    }, 1100);
  }

  function playDefeat() {
    document.body.classList.add('defeat');
    // Clear after a short period; keep class until new game for visual feedback
    setTimeout(() => {}, 800);
  }

  function spawnConfetti(count, duration) {
    if (!fxEl) return;
    fxEl.innerHTML = '';
    const colors = ['#ff6b6b','#ffd93d','#6bd6ff','#9f7bff','#57e39f'];
    const tilesCount = ROWS * COLS;
    const reduceMotion = prefersReducedMotion();
    const base = Math.max(20, Math.min(count, Math.floor(count * (600 / Math.max(600, tilesCount)))));
    const scaledCount = reduceMotion ? Math.floor(base * 0.5) : base;
    for (let i=0;i<scaledCount;i++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      const left = Math.random()*100;
      const delay = Math.random()*0.2;
      const dur = reduceMotion ? Math.max(0.8, 0.8 * (duration/1000)) : (duration/1000);
      const time = (0.9 + Math.random()*0.6) * dur;
      const color = colors[i % colors.length];
      d.style.left = left + '%';
      d.style.top = (-10 - Math.random()*20) + 'px';
      d.style.background = color;
      d.style.animationDuration = time + 's';
      d.style.animationDelay = delay + 's';
      fxEl.appendChild(d);
    }
    const endDur = (reduceMotion ? Math.floor(duration * 0.8) : duration) + 400;
    setTimeout(() => { fxEl.innerHTML = ''; }, endDur);
  }

  function applyBackground(theme) {
    const key = theme || 'thai';
    const png = `assets/backgrounds_png/${key}.png`;
    const svg = `assets/backgrounds/${key}.svg`;
    if (!pageBgEl) return;
    pageBgEl.style.backgroundImage = `url('${png}')`;
    const test = new Image();
    test.onerror = () => { pageBgEl.style.backgroundImage = `url('${svg}')`; };
    test.src = png;
  }
})();
