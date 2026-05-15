import {
  products,
  categories,
  HERO_IMAGE,
  EDITORIAL_IMAGE,
  STORY_IMAGE,
} from "./products.js";

const IMAGE_CACHE_NAME = "FIT & FINE-image-cache-v2";
const IMAGE_CACHE_PREFIX = "FIT & FINE-image-cache-";

const ALL_IMAGES = [
  HERO_IMAGE,
  EDITORIAL_IMAGE,
  STORY_IMAGE,
  ...categories.map((c) => c.image),
  ...products.flatMap((p) => p.images.slice(0, 2)), // Cache primary and secondary images
];

/**
 * Uses the Cache API to persistently store images in the browser.
 * This ensures that even after a page refresh or browser restart,
 * the images load instantly from the local disk.
 */
export async function initializeImageCache() {
  if (typeof window === "undefined" || !("caches" in window)) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(
          (name) =>
            name.startsWith(IMAGE_CACHE_PREFIX) && name !== IMAGE_CACHE_NAME,
        )
        .map((name) => caches.delete(name)),
    );

    const cache = await caches.open(IMAGE_CACHE_NAME);

    const expectedUrls = new Set(
      ALL_IMAGES.map((url) => new URL(url, window.location.origin).href),
    );

    const cachedRequests = await cache.keys();
    await Promise.all(
      cachedRequests
        .filter((request) => !expectedUrls.has(request.url))
        .map((request) => cache.delete(request)),
    );

    const missingImages = [];
    for (const url of ALL_IMAGES) {
      const match = await cache.match(url);
      if (!match) missingImages.push(url);
    }

    if (missingImages.length === 0) {
      console.log("Cache already populated");
      return;
    }

    console.log("Starting background image caching...");

    // We cache in small batches to keep the main thread smooth
    const batchSize = 3;
    for (let i = 0; i < missingImages.length; i += batchSize) {
      const batch = missingImages.slice(i, i + batchSize);
      await Promise.all(
        batch.map((url) =>
          cache
            .add(url)
            .catch((err) => console.warn(`Could not cache image: ${url}`, err)),
        ),
      );

      // Small delay between batches to prioritize user interaction
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("Image caching complete.");
  } catch (error) {
    console.error("Error initializing image cache:", error);
  }
}

/**
 * Simple preloader that ensures images are in memory.
 */
export function preloadCriticalImages() {
  const critical = [HERO_IMAGE, ...categories.map((c) => c.image)];
  critical.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}
