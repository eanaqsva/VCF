const CACHE='vcf-v18-patch';
const ASSETS=['./questions.js','./review-patch-v18.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
   let html=await r.text();
   const oldNext="function next(){if(S.mode==='exam'&&S.pos>=S.order.length-1)return finishExam();S.pos=(S.pos+1)%S.order.length;save();quiz();scrollTo({top:0,behavior:'smooth'})}";
   const newNext="function next(){if(S.mode==='exam'&&S.pos>=S.order.length-1)return finishExam();if(S.mode==='learn'&&S.pos>=S.order.length-1){S.pos=0;save();show('home');setTimeout(()=>alert('Lernrunde abgeschlossen. Du kannst jetzt eine neue Runde starten.'),80);return}S.pos=(S.pos+1)%S.order.length;save();quiz();scrollTo({top:0,behavior:'smooth'})}";
   if(html.includes(oldNext))html=html.replace(oldNext,newNext);
   html=html.replace(/<script src="\.\/review-patch-v1[567]\.js"><\/script>/g,'');
   if(!html.includes('review-patch-v18.js'))html=html.replace('</body>','<script src="./review-patch-v18.js"></script></body>');
   return new Response(html,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})
  }));return;
 }
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
