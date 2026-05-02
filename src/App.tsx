import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';

/**
 * Main Application Component
 * Handles the routing logic of the application using React Router 7.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all routes within it to provide common UI elements like Header/Footer */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="shop/product/:id" element={<ProductDetail />} />
          
          {/* 404 Fallback */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl font-bold text-text-muted">404 - Page Not Found</h1>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
