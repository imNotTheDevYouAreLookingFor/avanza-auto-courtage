(function () {
  'use strict';

  console.log('%c[AvanzaOptimizer] Script Injected & Ready', 'color: #00d1b2; font-weight: bold; font-size: 1.2em;');

  let isSwitching = false;
  let capturedHeaders = {}; // Store security headers here

  const FEE_CLASSES = {
    MINI: 'MINI',
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    FAST: 'FASTPRIS',
  };

  const BREAKPOINTS = [
    { limit: 15600, class: FEE_CLASSES.MINI },
    { limit: 46000, class: FEE_CLASSES.SMALL },
    { limit: 143500, class: FEE_CLASSES.MEDIUM },
    { limit: Infinity, class: FEE_CLASSES.FAST },
  ];

  function solveOptimal(amount) {
    for (const bp of BREAKPOINTS) {
      if (amount < bp.limit) return bp.class;
    }
    return FEE_CLASSES.FAST;
  }

  const log = (msg, data) => {
    console.log(`%c[AvanzaOptimizer] ${msg}`, 'color: #00d1b2; font-weight: bold;', data || '');
  };

  // --- FETCH INTERCEPTION ---
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    let [resource, config] = args;

    let url = resource;
    if (resource instanceof Request) {
      url = resource.url;
    }

    if (typeof url === 'string' && url.includes('preliminary-fee')) {
      // Try to capture headers if fetch is used
      if (config && config.headers) {
        try {
          // Config headers can be Headers object or plain object
          const newHeaders = config.headers instanceof Headers ? Object.fromEntries(config.headers.entries()) : config.headers;
          capturedHeaders = { ...capturedHeaders, ...newHeaders };
          // log('Captured fetch headers', capturedHeaders);
        } catch (e) {
          // ignore
        }
      }

      try {
        if (config && config.body) {
          const payload = JSON.parse(config.body);
          checkAndSwitch(payload);
        }
      } catch (e) {}
    }

    return originalFetch.apply(this, args);
  };

  // --- XHR INTERCEPTION ---
  const XHR = XMLHttpRequest.prototype;
  const open = XHR.open;
  const send = XHR.send;
  const setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (method, url) {
    this._url = url;
    this._headers = {}; // Init headers storage for this request
    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function (header, value) {
    if (this._headers) {
      this._headers[header] = value;
    }
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function (postData) {
    if (this._url && typeof this._url === 'string' && this._url.includes('preliminary-fee')) {
      // Capture headers from this valid request
      if (this._headers) {
        capturedHeaders = { ...capturedHeaders, ...this._headers };
        // log('Captured XHR headers', capturedHeaders);
      }

      try {
        if (postData) {
          const payload = JSON.parse(postData);
          checkAndSwitch(payload);
        }
      } catch (e) {}
    }
    return send.apply(this, arguments);
  };

  async function checkAndSwitch(payload) {
    if (isSwitching) return;

    const price = parseFloat(payload.price);
    const volume = parseFloat(payload.volume);

    if (!price || !volume) return;

    const total = price * volume;
    const optimal = solveOptimal(total);

    log(`Order: ${total.toLocaleString()} SEK. Optimal: ${optimal}`);

    try {
      // Check status endpoint - reuse headers
      const statusRes = await originalFetch('/_api/trading/courtageclass/courtageclass/', {
        headers: {
          'Content-Type': 'application/json',
          ...capturedHeaders,
        },
      });

      if (!statusRes.ok) {
        if (statusRes.status === 403) {
          log('Status check 403 - Headers missing?', capturedHeaders);
        }
        return;
      }

      const statusData = await statusRes.json();
      const current = statusData.currentCourtageClass;

      if (current !== optimal) {
        log(`Switching ${current} -> ${optimal}...`);
        await performSwitch(optimal);
      }
    } catch (e) {
      console.error('[AvanzaOptimizer] Check failed', e);
    }
  }

  async function performSwitch(newClass) {
    isSwitching = true;
    try {
      const res = await originalFetch('/_api/trading/courtageclass/courtageclass/update/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...capturedHeaders, // Inject the stolen headers (CSRF etc)
        },
        body: JSON.stringify({ newClass: newClass }),
      });

      const data = await res.json();

      if (res.ok && (data.success || data === true)) {
        log(`Success! Switched to ${newClass}`);
        showNotification(`Switched courtage to ${newClass}`);
      } else {
        console.error('[AvanzaOptimizer] Switch failed', data);
        showNotification(`Switch failed: ${newClass}. See console.`, 'error');
      }
    } catch (e) {
      console.error('[AvanzaOptimizer] Switch error', e);
    } finally {
      isSwitching = false;
    }
  }

  function showNotification(msg, type = 'success') {
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.padding = '12px 24px';
    div.style.backgroundColor = type === 'error' ? '#ff3860' : '#2ecc71';
    div.style.color = 'white';
    div.style.borderRadius = '4px';
    div.style.zIndex = '100000';
    div.style.fontWeight = 'bold';
    div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    div.style.fontFamily = 'Arial, sans-serif';
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  }
})();
