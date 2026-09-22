/* i18n.js — MemorySaathi translation layer (v2)
 *
 * Backend: MyMemory Translation API (https://mymemory.translated.net) — no Google Translate used.
 * Flow: user selects language -> check per-language cache -> if cached, use it ->
 *       if not cached, call MyMemory -> validate result -> save to cache -> write into DOM.
 * Reusable: works by watching the rendered DOM for English text, so any new game or new
 * screen is translated automatically without adding a single line of translation code to it.
 *
 * v2 fix: a failed/unusable MyMemory result (including a temporary daily-quota warning) used
 * to be remembered as "unusable" FOREVER, which could permanently stick a string in English
 * even after the real cause (e.g. quota) had cleared. Failures now expire after a short TTL
 * so they're retried automatically instead of being locked in.
 *
 * window.t(key) is kept for backward compatibility with app.js (always returns English —
 * the DOM watcher below is what actually localizes whatever t() renders).
 */
(function () {
  "use strict";

  // ---- 1. Canonical English strings (used by the existing window.t(key) calls in app.js) ----
  var EN_STRINGS = {
    welcome: "Welcome to MemorySaathi", games: "Cognitive Games", reminders: "Reminders",
    dashboard: "Caregiver Dashboard", settings: "Settings", play: "Play", back: "Back",
    difficulty: "Difficulty", offline: "Offline mode", online: "Online", start: "Start Game",
    submit: "Submit", score: "Score", accuracy: "Accuracy", sessions: "Sessions"
  };
  // Kept for anything that might still read window.I18N directly.
  window.I18N = { en: EN_STRINGS };
  window.t = function (key) { return EN_STRINGS[key] || key; };

  // ---- 2. Language setup ----
  // UI dropdown values (in app.js Settings) are unchanged: en / as / mni / kha / miz.
  // MYMEMORY_CODE is the code actually sent to the API. Only "as" has a real ISO 639-1 code;
  // the other three have no ISO 639-1 code at all, so MyMemory support for them isn't
  // guaranteed — "miz" is also corrected to the real code "lus" for the API call itself
  // (the dropdown option value stays "miz" — nothing in Settings changes).
  var MYMEMORY_CODE = { as: "as", mni: "mni", kha: "kha", miz: "lus" };

  function currentLang() {
    return localStorage.getItem("lang") || "en";
  }

  // ---- 3. Persistent, language-specific caches ----
  // Positive cache: confirmed good translations — kept indefinitely.
  // Negative cache: "MyMemory gave nothing usable for this text+language, as of <timestamp>" —
  // expires after NEGATIVE_TTL_MS so a transient failure (quota, network blip) is retried
  // instead of permanently sticking that string in English.
  // Bumped to _v2 so any previously-poisoned (permanently-negative) entries from before this
  // fix are discarded automatically.
  var CACHE_KEY = "i18nTranslationCache_v2";
  var NEGATIVE_CACHE_KEY = "i18nNoTranslationCache_v2";
  var NEGATIVE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  function loadStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); }
    catch (e) { return {}; }
  }
  function saveStore(key, store) {
    try { localStorage.setItem(key, JSON.stringify(store)); } catch (e) { /* storage full/blocked: ignore */ }
  }

  var cache = loadStore(CACHE_KEY);                  // { lang: { text: translatedText } }
  var negativeCache = loadStore(NEGATIVE_CACHE_KEY);  // { lang: { text: timestampMs } }

  function getCached(lang, text) { return cache[lang] && cache[lang][text]; }
  function setCached(lang, text, translated) {
    if (!cache[lang]) cache[lang] = {};
    cache[lang][text] = translated;
    saveStore(CACHE_KEY, cache);
  }
  function isNegativelyCached(lang, text) {
    var ts = negativeCache[lang] && negativeCache[lang][text];
    if (!ts) return false;
    if (Date.now() - ts > NEGATIVE_TTL_MS) return false; // expired: allow a retry
    return true;
  }
  function setNegativeCached(lang, text) {
    if (!negativeCache[lang]) negativeCache[lang] = {};
    negativeCache[lang][text] = Date.now();
    saveStore(NEGATIVE_CACHE_KEY, negativeCache);
  }
  function clearNegativeCache(lang) {
    if (lang) delete negativeCache[lang];
    else negativeCache = {};
    saveStore(NEGATIVE_CACHE_KEY, negativeCache);
  }

  // ---- 4. MyMemory API call, with an in-flight de-dupe map and a small concurrency limit ----
  var inFlight = {};      // "lang\u0001text" -> Promise
  var queue = [];
  var activeRequests = 0;
  var MAX_CONCURRENT = 4;

  function runQueue() {
    while (activeRequests < MAX_CONCURRENT && queue.length) {
      var job = queue.shift();
      activeRequests++;
      job().finally(function () {
        activeRequests--;
        runQueue();
      });
    }
  }
  function enqueue(fn) {
    return new Promise(function (resolve) {
      queue.push(function () { return fn().then(resolve, resolve); });
      runQueue();
    });
  }

  function looksUnusable(sourceText, translated) {
    if (!translated) return true;
    var t = translated.trim();
    if (!t) return true;
    if (t.toLowerCase() === sourceText.trim().toLowerCase()) return true; // MyMemory just echoed English back
    if (/INVALID|MYMEMORY WARNING|QUOTA/i.test(t)) return true;           // MyMemory error/warning strings
    return false;
  }

  function callMyMemory(text, mmCode) {
    var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) +
      "&langpair=en|" + encodeURIComponent(mmCode);
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var translated = data && data.responseData && data.responseData.translatedText;
        return { ok: !looksUnusable(text, translated), text: translated };
      })
      .catch(function () { return { ok: false, text: null }; });
  }

  // Returns a Promise<string|null>: the translated text, or null if none is usable right now.
  function translateText(text, lang) {
    if (lang === "en") return Promise.resolve(text);

    var cached = getCached(lang, text);
    if (cached) return Promise.resolve(cached);

    if (isNegativelyCached(lang, text)) return Promise.resolve(null);

    if (!navigator.onLine) return Promise.resolve(null); // don't burn requests while offline

    var dedupeKey = lang + "\u0001" + text;
    if (inFlight[dedupeKey]) return inFlight[dedupeKey];

    var mmCode = MYMEMORY_CODE[lang];
    if (!mmCode) return Promise.resolve(null); // unknown language value, nothing we can do

    var p = enqueue(function () { return callMyMemory(text, mmCode); }).then(function (result) {
      delete inFlight[dedupeKey];
      if (result.ok) {
        setCached(lang, text, result.text);
        return result.text;
      }
      setNegativeCached(lang, text); // remembered only for NEGATIVE_TTL_MS, then retried automatically
      return null;
    });
    inFlight[dedupeKey] = p;
    return p;
  }

  // ---- 5. Generic DOM translator: walks rendered text, swaps in translations ----
  // originalText remembers, per live Text node, the English string it started with — so we
  // always translate from the true source even after we've overwritten node.nodeValue, and
  // never re-translate our own translated output.
  var originalText = new WeakMap();
  var HAS_LETTERS = /[A-Za-z]/;

  function splitWhitespace(s) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    return { lead: m[1], core: m[2], trail: m[3] };
  }

  function applyTranslation(node, core, lead, trail) {
    var next = lead + core + trail;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      runTranslationPass();
    });
  }

  function runTranslationPass() {
    var lang = currentLang();
    var root = document.body;
    if (!root) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.tagName;
        if (tag === "SCRIPT" || tag === "STYLE") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var raw = node.nodeValue;
      if (!raw || !HAS_LETTERS.test(raw)) continue;

      if (!originalText.has(node)) originalText.set(node, raw);
      var source = originalText.get(node);
      var parts = splitWhitespace(source);
      if (!parts.core || !HAS_LETTERS.test(parts.core)) continue;

      if (lang === "en") {
        applyTranslation(node, parts.core, parts.lead, parts.trail);
        continue;
      }

      var cached = getCached(lang, parts.core);
      if (cached) {
        applyTranslation(node, cached, parts.lead, parts.trail);
        continue;
      }
      if (isNegativelyCached(lang, parts.core)) {
        applyTranslation(node, parts.core, parts.lead, parts.trail); // show real English, not a guess
        continue;
      }

      (function (nodeRef, src, lead, trail, forLang) {
        translateText(src, forLang).then(function (translated) {
          // Guard against a re-render (or language switch) happening while this was in flight.
          if (originalText.get(nodeRef) !== src) return;
          if (currentLang() !== forLang) return;
          applyTranslation(nodeRef, translated || src, lead, trail);
        });
      })(node, parts.core, parts.lead, parts.trail, lang);
    }
  }

  function init() {
    var observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    schedule();
    // Retry anything sitting in the (short-lived) negative cache once it expires, even if the
    // DOM itself doesn't change in the meantime.
    setInterval(schedule, 30 * 1000);
  }
  if (document.body) init(); else document.addEventListener("DOMContentLoaded", init);

  // Small debug/testing helpers.
  window.__i18n = {
    clearCache: function () {
      cache = {}; negativeCache = {};
      saveStore(CACHE_KEY, cache); saveStore(NEGATIVE_CACHE_KEY, negativeCache);
    },
    // Forces an immediate retry of anything currently stuck in the negative cache for the
    // active language (or all languages), without discarding successful translations.
    retryNow: function (lang) {
      clearNegativeCache(lang);
      schedule();
    },
    stats: function () {
      return {
        lang: currentLang(),
        cachedTranslations: Object.keys(cache[currentLang()] || {}).length,
        pendingRetry: Object.keys(negativeCache[currentLang()] || {}).length
      };
    }
  };
})();