const CACHE = 'vcf-v17-patch';
const ASSETS = ['./questions.js','./review-patch-v17.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache:'no-store'}).then(async response => {
      let html = await response.text();
      const oldNext = "function next(){if(S.mode==='exam'&&S.pos>=S.order.length-1)return finishExam();S.pos=(S.pos+1)%S.order.length;save();quiz();scrollTo({top:0,behavior:'smooth'})}";
      const newNext = "function next(){if(S.mode==='exam'&&S.pos>=S.order.length-1)return finishExam();if(S.mode==='learn'&&S.pos>=S.order.length-1){S.pos=0;save();show('home');setTimeout(()=>alert('Lernrunde abgeschlossen. Du kannst jetzt eine neue Runde starten.'),80);return}S.pos=(S.pos+1)%S.order.length;save();quiz();scrollTo({top:0,behavior:'smooth'})}";
      if (html.includes(oldNext)) html = html.replace(oldNext, newNext);
      html = html.replace(/<script src="\.\/review-patch-v1[56]\.js"><\/script>/g, '');
      if (!html.includes('review-patch-v17.js')) html = html.replace('</body>', '<script src="./review-patch-v17.js"></script></body>');
      return new Response(html, {status:response.status, statusText:response.statusText, headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
