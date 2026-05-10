import {
  products,
  categories,
  HERO_IMAGE,
  EDITORIAL_IMAGE,
  STORY_IMAGE,
} from "./products.js";

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
    const cacheName = "FIT & FINE-image-cache-v1";
    const cache = await caches.open(cacheName);

    // Check if we already have some images cached to avoid re-fetching everything
    const cachedRequests = await cache.keys();
    if (cachedRequests.length >= ALL_IMAGES.length * 0.8) {
      console.log("Cache already populated");
      return;
    }

    console.log("Starting background image caching...");

    // We cache in small batches to keep the main thread smooth
    const batchSize = 3;
    for (let i = 0; i < ALL_IMAGES.length; i += batchSize) {
      const batch = ALL_IMAGES.slice(i, i + batchSize);
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
