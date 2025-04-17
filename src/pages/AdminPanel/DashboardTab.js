// src/components/AdminPanel/DashboardTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './AdminPanel.css';

// Enregistrer les composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function DashboardTab() {
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Récupérer le nombre de commandes par statut
        let orders = [];
        let ordersError = null;
        try {
          const { data, error } = await supabase.from('orders_data').select('status');
          orders = data || [];
          ordersError = error;
        } catch (err) {
          console.warn('Erreur d\'accès à la table des commandes :', err);
        }

        if (ordersError && ordersError.code !== 'PGRST103') {
          // Ignorer les erreurs "tableau non trouvé" ; traiter comme vide
          throw ordersError;
        }

        const stats = {
          pending: orders.filter((order) => order.status === 'pending').length,
          processing: orders.filter((order) => order.status === 'processing').length,
          shipped: orders.filter((order) => order.status === 'shipped').length,
          delivered: orders.filter((order) => order.status === 'delivered').length,
          cancelled: orders.filter((order) => order.status === 'cancelled').length,
        };
        setOrderStats(stats);
        setTotalOrders(orders.length);

        // Récupérer le total des produits
        const { count: productCount, error: productsError } = await supabase
          .from('products_data')
          .select('*', { count: 'exact', head: true });

        if (productsError) throw productsError;
        setTotalProducts(productCount || 0);

        let totalSales = 0;
        try {
          const { data: deliveredOrders, error: deliveredError } = await supabase
            .from('orders_data')
            .select('product_id, quantity')
            .eq('status', 'delivered');

          if (deliveredError) throw deliveredError;

          // Get all unique product IDs from delivered orders
          const productIds = [...new Set(deliveredOrders.map(order => order.product_id))];

          // Fetch prices for those product IDs
          const { data: products, error: productsError } = await supabase
            .from('products_data')
            .select('id, price')
            .in('id', productIds);

          if (productsError) throw productsError;

          // Build a map of product_id to price
          const priceMap = {};
          products.forEach(product => {
            priceMap[product.id] = parseFloat(product.price || '0');
          });

          // Calculate total sales
          deliveredOrders.forEach(order => {
            const price = priceMap[order.product_id] || 0;
            const quantity = parseInt(order.quantity || '1');
            totalSales += price * quantity;
          });

          setTotalSales(totalSales);
        } catch (err) {
          console.error('Erreur lors du calcul du chiffre d’affaires :', err);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
        alert('Échec du chargement de certaines données du tableau de bord. Affichage des données disponibles.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Données pour le graphique en barres des statuts de commande
  const barChartData = {
    labels: ['En attente', 'En traitement', 'Expédié', 'Livré', 'Annulé'],
    datasets: [
      {
        label: 'Nombre de commandes',
        data: [
          orderStats.pending,
          orderStats.processing,
          orderStats.shipped,
          orderStats.delivered,
          orderStats.cancelled,
        ],
        backgroundColor: [
          '#FFBB28', // En attente
          '#00C4B4', // En traitement
          '#4a90e2', // Expédié
          '#4CAF50', // Livré
          '#F44336', // Annulé
        ],
        borderColor: ['#D89E22', '#00A69A', '#3176c5', '#388E3C', '#D32F2F'],
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique en anneau des produits vs commandes
  const pieChartData = {
    labels: ['Produits', 'Commandes'],
    datasets: [
      {
        label: 'Nombre',
        data: [totalProducts, totalOrders],
        backgroundColor: ['#4a90e2', '#FF9800'],
        borderColor: ['#3176c5', '#F57C00'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'titre', // Titre dynamique défini dans le composant graphique
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Tableau de bord</h2>
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Chargement...</p>
        </div>
      )}
      {/* Cartes de statistiques */}
      <div className="stats-grid">
        {Object.entries(orderStats).map(([status, count]) => (
          <div key={status} className="stat-card">
            <h3 className="stat-title">
              {status === 'pending' && 'En attente'}
              {status === 'processing' && 'En traitement'}
              {status === 'shipped' && 'Expédié'}
              {status === 'delivered' && 'Livré'}
              {status === 'cancelled' && 'Annulé'}
            </h3>
            <p className="stat-value">{count}</p>
            <p className="stat-label">Commandes</p>
          </div>
        ))}
        <div className="stat-card">
          <h3 className="stat-title">Total des produits</h3>
          <p className="stat-value">{totalProducts}</p>
          <p className="stat-label">Articles</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Chiffre d’affaires</h3>
          <p className="stat-value">{totalSales.toFixed(2)} DZD</p>
          <p className="stat-label">Total des ventes livrées</p>
        </div>
      </div>
      {/* Graphiques */}
      <div className="charts-grid">
        <div className="chart-container">
          <Bar
            data={barChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Répartition des statuts de commande' },
              },
            }}
          />
        </div>
        <div className="chart-container">
          <Pie
            data={pieChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: { display: true, text: 'Produits vs Commandes' },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}