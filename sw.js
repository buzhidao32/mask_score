const CACHE_VERSION = "20260708-mask-data";
const OCR_CACHE_NAME = "mask-score-ocr-assets-v1";
const VERSIONED_CACHE_NAME = `mask-score-versioned-assets-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => {
              if (key === OCR_CACHE_NAME || key === VERSIONED_CACHE_NAME) {
                return false;
              }
              return (
                key.startsWith("mask-score-static-") ||
                key.startsWith("mask-score-app-") ||
                key.startsWith("mask-score-versioned-assets-") ||
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
  const isVersionedAsset = url.searchParams.has("v");

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

  if (isVersionedAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(VERSIONED_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  event.respondWith(fetch(new Request(request, { cache: "no-store" })));
});
