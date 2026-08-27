const C='vcf-readable-v7';
const A=['./','./index.html','./questions.js','./readability.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A.filter(x=>x!=='./'&&x!=='./index.html'))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/')){
    e.respondWith(fetch(e.request).then(async r=>{
      let t=await r.text();
      if(!t.includes('readability.js')) t=t.replace('</body>','<script src="./readability.js"></script></body>');
      return new Response(t,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}});
    }).catch(()=>caches.match('./index.html')));return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp.ok){const c=resp.clone();caches.open(C).then(x=>x.put(e.request,c))}return resp})));
});
