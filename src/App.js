// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductPreview from './pages/ProductPreview';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPreview />} />
        <Route path="adminpanel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}