// src/components/AdminPanel/AdminPanel.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OrdersTab from './OrdersTab';
import ManageProductsTab from './ManageProductsTab';
import DashboardTab from './DashboardTab';
import SettingsTab from './SettingsTab';
import { handleLogin } from './utils/auth';
import './AdminPanel.css';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const login = useCallback(
    (e) => handleLogin(e, username, password, setIsAuthenticated, setIsLoading),
    [username, password]
  );

  return (
    <div className="admin-panel">
      {!isAuthenticated ? (
        <div className="login-container">
          <div className="login-card">
            <h2>Connexion Administrateur</h2>
            <form onSubmit={login}>
              <div className="form-group">
                <label htmlFor="username">Nom d'utilisateur</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Entrez le nom d'utilisateur"
                  value={username}
                  onChange={handleInputChange(setUsername)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Entrez le mot de passe"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Connexion'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard">
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>Administration</h3>
            </div>
            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <span className="nav-icon">📊</span> Tableau de bord
              </button>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="nav-icon">📋</span> Commandes
              </button>
              <button
                className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <span className="nav-icon">🛍️</span> Produits
              </button>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="nav-icon">⚙️</span> Paramètres
              </button>
              <button
                className="nav-item logout-button"
                onClick={() => {
                  setIsAuthenticated(false);
                  setUsername('');
                  setPassword('');
                  navigate('/');
                }}
              >
                <span className="nav-icon">🚪</span> Déconnexion
              </button>
            </nav>
          </div>
          <div className="main-content">
            <div className="header">
              <h1>Panneau d'Administration</h1>
              <div className="user-info">
                <span>Bienvenue, Administrateur</span>
              </div>
            </div>
            <div className="content">
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'orders' && <OrdersTab />}
              {activeTab === 'products' && <ManageProductsTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}