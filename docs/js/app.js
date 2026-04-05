(() => {
  const API_URL = 'https://aksharamukha-plugin.appspot.com/api/plugin';
  const model = ScriptMixin.data();

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

  const scripts = [
    ...(model.autodetect || []),
    ...(model.transliterationScripts || []).map(s => ({ label: s, value: s })),
    ...(model.scriptsIndic || [])
  ];

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

  const renderCheckboxes = (container, options, groupName) => {
    container.innerHTML = '';
    options.forEach((opt) => {
      const label = document.createElement('label');
      label.className = 'option';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.name = groupName;
      cb.value = opt.value;
      label.appendChild(cb);
      label.append(' ' + opt.label);
      container.appendChild(label);
    });
  };

  const updateOptions = () => {
    const src = els.source.value;
    const tgt = els.target.value;
    renderCheckboxes(els.pre, mapOptions(model.preOptionsGroup?.[src]));
    renderCheckboxes(els.post, mapOptions(model.postOptionsGroup?.[tgt]));
  };

  const getChecked = (name) => [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(x => x.value);

  const setStatus = (txt = '') => { els.status.textContent = txt; };
  const setError = (txt = '') => { els.error.textContent = txt; };

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

    els.source.addEventListener('change', updateOptions);
    els.target.addEventListener('change', updateOptions);
    els.convert.addEventListener('click', convert);

    els.swap.addEventListener('click', () => {
      const a = els.source.value;
      els.source.value = els.target.value;
      els.target.value = a;
      updateOptions();
    });

    els.clear.addEventListener('click', () => {
      els.in.value = '';
      els.out.value = '';
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
