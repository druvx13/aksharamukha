(() => {
  const API_URL = 'https://aksharamukha-plugin.appspot.com/api/plugin';
  const DEFAULT_FONT_STACK = '"system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif';
  const TRUSTED_FONT_HOSTS = new Set([
    'cdn.jsdelivr.net',
    'github.com',
    'raw.githubusercontent.com',
    'www.omniglot.com'
  ]);
  const model = ScriptMixin.data();
  const methods = model.methods || {};
  const defaultScriptClass = (script) => String(script || '').toLowerCase();
  const getInputClass = methods.getInputClass ? methods.getInputClass.bind(model) : defaultScriptClass;
  const getOutputClass = methods.getOutputClass ? methods.getOutputClass.bind(model) : defaultScriptClass;
  const getScriptObject = methods.getScriptObject ? methods.getScriptObject.bind(model) : ((name) => {
    const all = [...(model.autodetect || []), ...(model.scriptsIndic || []), ...(model.scriptsLatin || [])];
    return all.find(s => s && s.value === name) || {};
  });
  const loadedFonts = new Set();
  const fontStyleId = 'script-font-faces';

  const els = {
    source: document.getElementById('sourceScript'),
    target: document.getElementById('targetScript'),
    pre: document.getElementById('preOptions'),
    post: document.getElementById('postOptions'),
    preserve: document.getElementById('preserveSource'),
    in: document.getElementById('inputText'),
    out: document.getElementById('outputText'),
    status: document.getElementById('status'),
    error: document.getElementById('error'),
    convert: document.getElementById('convertBtn'),
    clear: document.getElementById('clearBtn'),
    copy: document.getElementById('copyBtn'),
    swap: document.getElementById('swapBtn')
  };

  const scriptPool = [
    ...(model.scriptsIndic || []),
    ...(model.scriptsLatin || [])
  ].sort((a, b) => String(a?.label || '').localeCompare(String(b?.label || ''), 'en'));
  const scripts = [...(model.autodetect || []), ...scriptPool];

  const mapOptions = (arr) => (arr || [])
    .filter(o => o && o.value)
    .map(o => ({ label: String(o.label || o.value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), value: o.value }));

  const createOptions = (select) => {
    select.innerHTML = '';
    scripts.forEach((s) => {
      const o = document.createElement('option');
      o.value = s.value;
      o.textContent = s.label;
      select.appendChild(o);
    });
  };

  const renderCheckboxes = (container, options, checkboxName) => {
    container.innerHTML = '';
    options.forEach((opt) => {
      const label = document.createElement('label');
      label.className = 'option';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = checkboxName;
      cb.value = opt.value;
      label.appendChild(cb);
      label.append(' ' + opt.label);
      container.appendChild(label);
    });
  };

  const updateOptions = () => {
    const src = els.source.value;
    const tgt = els.target.value;
    renderCheckboxes(els.pre, mapOptions(model.preOptionsGroup?.[src]), 'preOptions');
    renderCheckboxes(els.post, mapOptions(model.postOptionsGroup?.[tgt]), 'postOptions');
    applyScriptStyles();
  };

  const getChecked = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x => x.value);

  const setStatus = (txt = '') => { els.status.textContent = txt; };
  const setError = (txt = '') => { els.error.textContent = txt; };
  const sanitizeFontName = (name) => String(name || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
  const toFontFamily = (safeFontName) => safeFontName ? `"${safeFontName}", ${DEFAULT_FONT_STACK}` : DEFAULT_FONT_STACK;
  const getTrustedFontUrl = (url) => {
    const raw = String(url || '').trim();
    if (!raw || /["'()\\;<>{}\[\]\s]/.test(raw)) return '';
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      return '';
    }
    if (parsed.protocol !== 'https:') return '';
    if (!TRUSTED_FONT_HOSTS.has(parsed.hostname)) return '';
    const safeHref = parsed.href;
    if (!/^[A-Za-z0-9/:.?&=%+,_~#-]+$/.test(safeHref)) return '';
    return safeHref;
  };
  const makeFontFaceRule = (fontName, fontUrl) =>
    `@font-face{font-family:"${fontName}";src:url("${fontUrl}");font-display:swap;}`;
  const getFontStyleEl = () => {
    let style = document.getElementById(fontStyleId);
    if (!style) {
      style = document.createElement('style');
      style.id = fontStyleId;
      document.head.appendChild(style);
    }
    return style;
  };
  const addFontFace = (fontName, fontUrl) => {
    if (!fontName || !fontUrl || loadedFonts.has(fontName)) return;
    const safeFontName = sanitizeFontName(fontName);
    const safeFontUrl = getTrustedFontUrl(fontUrl);
    if (!safeFontName || !safeFontUrl) return;
    const style = getFontStyleEl();
    const rule = makeFontFaceRule(safeFontName, safeFontUrl);
    if (style.sheet && typeof style.sheet.insertRule === 'function') {
      style.sheet.insertRule(rule, style.sheet.cssRules.length);
    } else {
      style.appendChild(document.createTextNode(rule));
    }
    loadedFonts.add(safeFontName);
  };
  const applyFontToTextarea = (el, scriptValue) => {
    const script = getScriptObject(scriptValue);
    const fontName = script?.font?.name || '';
    const fontUrl = script?.font?.url || '';
    const safeFontName = sanitizeFontName(fontName);
    const safeFontUrl = getTrustedFontUrl(fontUrl);
    if (safeFontName && safeFontUrl) {
      addFontFace(safeFontName, safeFontUrl);
      el.style.fontFamily = toFontFamily(safeFontName);
    } else {
      el.style.fontFamily = toFontFamily('');
    }
  };
  const applyScriptStyles = () => {
    const pre = getChecked('preOptions');
    const post = getChecked('postOptions');
    const inClass = getInputClass(els.source.value, pre);
    const outClass = getOutputClass(els.target.value, post, els.out.value || '');
    els.in.className = `script-text ${inClass || ''}`.trim();
    els.out.className = `script-text ${outClass || ''}`.trim();
    applyFontToTextarea(els.in, els.source.value);
    applyFontToTextarea(els.out, els.target.value);
  };

  const convert = async () => {
    setError('');
    setStatus('Converting...');
    try {
      const lines = (els.in.value || '').split('\n');
      const body = {
        source: els.source.value,
        target: els.target.value,
        nativize: !els.preserve.checked,
        text: JSON.stringify(lines),
        preOptions: getChecked('preOptions'),
        postOptions: getChecked('postOptions')
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API failed with ${response.status}`);
      }

      const raw = await response.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = raw;
      }

      els.out.value = Array.isArray(parsed) ? parsed.join('\n') : String(parsed || '');
      applyScriptStyles();
      setStatus('Done.');
    } catch (err) {
      console.error(err);
      setStatus('');
      setError('Conversion failed. Check your network connection and selected scripts.');
    }
  };

  const init = () => {
    createOptions(els.source);
    createOptions(els.target);
    els.source.value = 'autodetect';
    els.target.value = 'Tamil';
    updateOptions();
    applyScriptStyles();

    els.source.addEventListener('change', updateOptions);
    els.target.addEventListener('change', updateOptions);
    els.pre.addEventListener('change', applyScriptStyles);
    els.post.addEventListener('change', applyScriptStyles);
    els.convert.addEventListener('click', convert);

    els.swap.addEventListener('click', () => {
      const a = els.source.value;
      els.source.value = els.target.value;
      els.target.value = a;
      updateOptions();
      applyScriptStyles();
    });

    els.clear.addEventListener('click', () => {
      els.in.value = '';
      els.out.value = '';
      applyScriptStyles();
      setStatus('');
      setError('');
    });

    els.copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(els.out.value || '');
        setStatus('Output copied.');
      } catch {
        setError('Copy failed in this browser context.');
      }
    });
  };

  init();
})();
