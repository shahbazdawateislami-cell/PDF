import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import AllProducts from './pages/AllProducts';
import Admin from './pages/Admin';
import Purchases from './pages/Purchases';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProductProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/success/:orderId" element={<Success />} />
              <Route path="/all" element={<AllProducts />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
            <WhatsAppFloatingButton />
          </Router>
        </ProductProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
