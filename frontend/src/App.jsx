import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen font-sans flex flex-col text-slate-900 dark:text-slate-200">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </main>
          <footer className="glass py-6 text-center text-slate-400 text-sm mt-auto border-t border-slate-700/50">
            <p>© {new Date().getFullYear()} Smart Agri Supply Network. Empowering Farmers & Buyers.</p>
          </footer>
        </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
