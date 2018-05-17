"use strict";
const cacheName = "colinhaber-unicodepizza-0.1.0";
self.addEventListener("install", function (event) {
	event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
		"/",
		"/scripts/pizza.js",
		"/styles/pizza.css"
	])));
});
self.addEventListener("activate", function (event) {
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("colinhaber-unicodepizza") && key != cacheName).map(key => caches.delete(key)))));
});
self.addEventListener("fetch", function (event) {
	if (event.request.method != "GET") return;
	event.respondWith(caches.open(cacheName).then(cache => cache.match(event.request).then(response => {
		if (response) event.waitUntil(cache.add(event.request));
		return response || fetch(event.request);
	})));
});
