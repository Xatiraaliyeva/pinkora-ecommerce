import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { api, tokenStore } from "./api/http";
import { AppStateProvider, useAppState } from "./context/AppState";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrdersPage from "./pages/OrdersPage";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminComments from "./pages/admin/AdminComments";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import AdminLayout from "./pages/Admin/AdminLayout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";

function AdminGuard() {
  const { me, loadMe } = useAppState();
  const loc = useLocation();

  useEffect(() => {
    if (!me) loadMe();
  }, [me, loadMe]);

  if (!me) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(loc.pathname)}`}
        replace
      />
    );
  }

  if (me.role !== "admin") return <Navigate to="/login" replace />;

  return <Outlet />;
}

function AppContent() {
  const { loadMe } = useAppState();
  const location = useLocation();

  useEffect(() => {
    api
      .post("/auth/refresh")
      .then((r) => {
        if (r?.data?.accessToken) {
          tokenStore.set(r.data.accessToken);
          loadMe();
        }
      })
      .catch(() => {});
  }, [loadMe]);

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Header />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/p/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout-success" element={<CheckoutSuccess />} />
        <Route path="/checkout-cancel" element={<CheckoutCancel />} />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
}

function InnerApp() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <InnerApp />
    </AppStateProvider>
  );
}