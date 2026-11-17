// Service worker do Painel PCDF (gerado por ferramentas/site.py; não edite à mão).
// Guarda a página no aparelho: abre na hora, mesmo sem internet. Versão nova (este arquivo muda) é baixada em segundo
// plano e vale a partir da abertura seguinte.
const VERSAO = '4.15.0-e697070a7d';
const CACHE = 'painel-pcdf-' + VERSAO;
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icone-180.png', './icone-192.png', './icone-512.png'];
self.addEventListener('install', (e) => {
  // cache: 'reload' para não guardar uma cópia velha que o navegador ainda tenha em cache
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith('painel-pcdf-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    // Abrir o site (navegação) é sempre a página guardada; o resto, o arquivo guardado de mesmo nome
    const guardado = await c.match(r.mode === 'navigate' ? './index.html' : r, { ignoreSearch: true });
    if (guardado) return guardado;
    try { return await fetch(r); }
    catch (err) { return new Response('Sem internet e sem cópia guardada. Abra o painel uma vez com internet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
  })());
});
