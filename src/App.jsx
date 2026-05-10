import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { Toaster } from "./components/Toaster.jsx";
import { initializeImageCache, preloadCriticalImages } from "./lib/cache.js";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CollectionsIndexPage from "./pages/CollectionsIndexPage.jsx";
import CollectionCategoryPage from "./pages/CollectionCategoryPage.jsx";
import NewArrivalsPage from "./pages/NewArrivalsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ComingSoonPage from "./pages/ComingSoonPage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const comingSoon = import.meta.env.VITE_COMING_SOON === "true";

  if (comingSoon) {
    return <ComingSoonPage />;
  }

  useEffect(() => {
    initializeImageCache();
    preloadCriticalImages();
  }, []);

  return (
    <>
      <ScrollToTop />
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/collections" element={<CollectionsIndexPage />} />
            <Route
              path="/collections/:category"
              element={<CollectionCategoryPage />}
            />
            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
