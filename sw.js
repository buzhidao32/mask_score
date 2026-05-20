const OCR_CACHE_NAME = "mask-score-ocr-assets-v1";
const OCR_ASSETS = [
  "./vendor/tesseract/worker.min.js",
  "./vendor/tesseract/tesseract-core-simd-lstm.wasm.js",
  "./vendor/tesseract/tesseract-core-simd-lstm.wasm",
  "./vendor/tesseract/tesseract-core-lstm.wasm.js",
  "./vendor/tesseract/tesseract-core-lstm.wasm",
  "./vendor/tessdata/chi_sim.traineddata.gz",
  "./vendor/tessdata/eng.traineddata.gz",
];

async function cacheMissing(cacheName, urls) {
  const cache = await caches.open(cacheName);
  const missing = [];
  for (const url of urls) {
    const cached = await cache.match(url);
    if (!cached) {
      missing.push(url);
    }
  }
  if (missing.length) {
    await cache.addAll(missing);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    cacheMissing(OCR_CACHE_NAME, OCR_ASSETS)
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => {
              if (key === OCR_CACHE_NAME) {
                return false;
              }
              return (
                key.startsWith("mask-score-static-") ||
                key.startsWith("mask-score-app-") ||
                key.startsWith("mask-score-ocr-assets-")
              );
            })
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== location.origin) {
    return;
  }

  const isOcrAsset =
    url.pathname.includes("/vendor/tesseract/") ||
    url.pathname.includes("/vendor/tessdata/");

  if (isOcrAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(OCR_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  event.respondWith(fetch(new Request(request, { cache: "no-store" })));
});
