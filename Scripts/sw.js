const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1");
    await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([
            "./",
            "./index.html",
            "./Styles/main.css",
            "./Styles/index.css",
            "./Scripts/main.js",
            "./Scripts/index.js",
            "./Images/icon.png",
        ])
    );
});
