const CACHE="memorysaathi-v2";
const ASSETS=["/","/index.html","/firebase-config.js","/css/main.css","/js/app.js","/js/i18n.js","/js/offline.js","/js/games/pattern.js","/js/games/faceRecognition.js","/js/games/sequence.js","/js/games/memoryAssociation.js","/js/games/nBack.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(new URL(e.request.url).origin===location.origin){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return resp}).catch(()=>caches.match("/index.html"))))});
