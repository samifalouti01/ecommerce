// src/components/AdminPanel/OrdersTab.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { fetchOrders } from './utils/fetchData';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(20);

  useEffect(() => {
    fetchOrders(setOrders, setIsLoading);
  }, []);

  // Calculer les commandes à afficher pour la page actuelle
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Gérer le changement de page
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Gérer le changement du nombre de commandes par page
  const handleOrdersPerPageChange = (e) => {
    setOrdersPerPage(Number(e.target.value));
    setCurrentPage(1); // Réinitialiser à la première page
  };

  // Vider toutes les commandes
  const handleDeleteAllOrders = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les commandes ? Cette action est irréversible.')) {
      setIsLoading(true);
      try {
        const { error } = await supabase.from('orders_data').delete().neq('id', 0); // Supprime toutes les lignes
        if (error) throw error;
        setOrders([]);
        alert('Toutes les commandes ont été supprimées avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression des commandes :', error);
        alert('Échec de la suppression des commandes. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="orders-container">
      <div className="section-header">
        <h2>Gestion des Commandes</h2>
        <div className="header-actions">
          <button className="refresh-button" onClick={() => fetchOrders(setOrders, setIsLoading)}>
            <span className="refresh-icon">↻</span> Actualiser
          </button>
          {orders.length > 0 && (
            <button className="delete-all-button" onClick={handleDeleteAllOrders} disabled={isLoading}>
                <ion-icon name="trash"></ion-icon>
              Vider les Commandes
            </button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Aucune Commande Trouvée</h3>
          <p>Lorsque les clients passeront des commandes, elles apparaîtront ici.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <div className="table-controls">
            <div className="sort-control">
              <label htmlFor="orders-per-page">Commandes par page : </label>
              <select
                id="orders-per-page"
                value={ordersPerPage}
                onChange={handleOrdersPerPageChange}
                className="sort-select"
              >
                {[20, 50, 100, 200, 300, 400, 500, 1000].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </button>
              <span className="pagination-info">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </button>
            </div>
          </div>
          <table className="data-table orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Couleur</th>
                <th>Prix Total</th>
                <th>Localisation</th>
                <th>Téléphone</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{order.name}</td>
                  <td>{order.product_title}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className="color-dot" style={{ backgroundColor: order.color }}></span>
                    {order.color}
                  </td>
                  <td className="price-cell">{order.total_price} DZD</td>
                  <td>{order.wilaya}, {order.commune}</td>
                  <td>{order.phone}</td>
                  <td>
                    <select
                      className="status-select"
                      defaultValue={order.status || 'pending'}
                      onChange={async (e) => {
                        const { error } = await supabase
                          .from('orders_data')
                          .update({ status: e.target.value })
                          .eq('id', order.id);
                        if (error) console.error('Erreur lors de la mise à jour du statut :', error);
                      }}
                      style={{
                        backgroundColor:
                          order.status === 'delivered'
                            ? 'lightgreen'
                            : order.status === 'pending'
                            ? 'white'
                            : order.status === 'processing'
                            ? 'lightgrey'
                            : order.status === 'shipped'
                            ? 'lightblue'
                            : order.status === 'cancelled'
                            ? 'crimson'
                            : 'white',
                        padding: '5px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                      }}
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="shipped">Expédié</option>
                      <option value="delivered">Livré</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}