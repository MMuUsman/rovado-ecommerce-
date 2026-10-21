import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CategoryListing from "./pages/CategoryListing";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import WishlistPage from "./pages/WishlistPage";
import CellphonesPage from "./pages/CellphonesPage";
import LaptopsPage from "./pages/LaptopsPage";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Contact from "./pages/Contact";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import Chatbot from "./components/Chatbot";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Chatbot />
      <div key={location.pathname} className="page-fade-in">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          {/* Redirect /category to /cellphones */}
          <Route path="/category" element={<Navigate to="/cellphones" replace />} />
          <Route path="/search" element={<CategoryListing />} />
          <Route path="/cellphones" element={<CellphonesPage />} />
          <Route path="/laptops" element={<LaptopsPage />} />
          {/* Support both direct /product and /product/:id */}
          <Route path="/product" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute>
                <Profile defaultTab="My order" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/orders/:orderId"
            element={
              <ProtectedRoute>
                <Profile defaultTab="My order" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/address"
            element={
              <ProtectedRoute>
                <Profile defaultTab="My address" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
