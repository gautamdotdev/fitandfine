import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { Toaster } from "./components/Toaster.jsx";
import { initializeImageCache, preloadCriticalImages } from "./lib/cache.js";
import { consumeCacheResetFlag } from "./lib/siteCache.js";
import { useToasts } from "./lib/store";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CollectionsIndexPage from "./pages/CollectionsIndexPage.jsx";
import CollectionCategoryPage from "./pages/CollectionCategoryPage.jsx";
import NewArrivalsPage from "./pages/NewArrivalsPage.jsx";
import SalePage from "./pages/SalePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ComingSoonPage from "./pages/ComingSoonPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage.jsx";
import AdminProductDetailPage from "./pages/admin/AdminProductDetailPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import OrderTrackingPage from "./pages/OrderTrackingPage.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage.jsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";
import AdminWebsiteSettingsPage from "./pages/admin/AdminWebsiteSettingsPage.jsx";
import AdminCouponSettingsPage from "./pages/admin/AdminCouponSettingsPage.jsx";
import AdminShippingSettingsPage from "./pages/admin/AdminShippingSettingsPage.jsx";
import {AnnouncementBar} from "./components/AnnouncementBar.jsx"

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function CacheBootstrap() {
  const pushToast = useToasts((state) => state.push);

  useEffect(() => {
    initializeImageCache();
    preloadCriticalImages();

    if (consumeCacheResetFlag()) {
      pushToast({
        title: "Cache cleared",
        message: "The website cache was reset on this device.",
        type: "success",
      });
    }
  }, [pushToast]);

  return null;
}

function ConditionalAnnouncementBar() {
  const { pathname } = useLocation();

  const hidePaths = [
    "/cart",
    "/auth",
    "/profile",
    "/wishlist",
    "/search",
    "/order"
  ];

  const hide =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/order/") ||
    hidePaths.includes(pathname);

  if (hide) return null;

  return <AnnouncementBar />;
}


export default function App() {
  const comingSoon = import.meta.env.VITE_COMING_SOON === "true";

  if (comingSoon) {
    return <ComingSoonPage />;
  }

  return (
    <>
      <CacheBootstrap />
      <ScrollToTop />
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <ConditionalAnnouncementBar />
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
            <Route path="/sale" element={<SalePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/add" element={<AdminProductFormPage />} />
              <Route
                path="products/edit/:id"
                element={<AdminProductFormPage />}
              />
              <Route
                path="products/view/:id"
                element={<AdminProductDetailPage />}
              />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="settings/website" element={<AdminWebsiteSettingsPage />} />
              <Route path="settings/shipping" element={<AdminShippingSettingsPage />} />
              <Route path="settings/coupons" element={<AdminCouponSettingsPage />} />
            </Route>

            <Route path="/order" element={<OrderTrackingPage />} />
            <Route path="/order/:uuid" element={<OrderTrackingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
