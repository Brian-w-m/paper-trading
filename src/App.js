// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TradeStockPage from './pages/TradeStockPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trade-stock" element={<TradeStockPage />} />
      </Routes>
    </Router>
  );
}

export default App;
