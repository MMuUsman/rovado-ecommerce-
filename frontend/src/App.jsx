import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CategoryListing from "./pages/CategoryListing";
import ProductDetail from "./pages/ProductDetail"; // ✅ Ye zaroori
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CellphonesPage from "./pages/CellphonesPage";
import LaptopsPage from "./pages/LaptopsPage";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Contact from "./pages/Contact";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<CategoryListing />} />
        <Route path="/cellphones" element={<CellphonesPage />} />
        <Route path="/laptops" element={<LaptopsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />{" "}
        {/* ✅ Route */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
