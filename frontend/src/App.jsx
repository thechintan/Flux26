import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import InfoPages from './pages/InfoPages';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import CartModal from './components/CartModal';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen font-sans flex flex-col text-slate-900 dark:text-slate-200">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/contact" element={<InfoPages />} />
                <Route path="/quality-guidelines" element={<InfoPages />} />
                <Route path="/report-scam" element={<InfoPages />} />
                <Route path="/dispute-policy" element={<InfoPages />} />
                <Route path="/farmer-guidance" element={<InfoPages />} />
                <Route path="/privacy" element={<InfoPages />} />
                <Route path="/terms" element={<InfoPages />} />
              </Routes>
              <CartModal />
            </main>
              <Footer />
          </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
