// src/components/AdminPanel/SettingsTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { fetchWebsite, fetchDeliveryPrices, uploadImageToSupabase } from './utils/fetchData';

export default function SettingsTab() {
  const [website, setWebsite] = useState(null);
  const [deliveryPrices, setDeliveryPrices] = useState([]);
  const [websiteName, setWebsiteName] = useState('');
  const [websiteEmail, setWebsiteEmail] = useState('');
  const [websitePhone, setWebsitePhone] = useState('');
  const [websiteWhatsapp, setWebsiteWhatsapp] = useState('');
  const [websiteFacebook, setWebsiteFacebook] = useState('');
  const [websiteInstagram, setWebsiteInstagram] = useState('');
  const [websiteTiktok, setWebsiteTiktok] = useState('');
  const [websiteAddress, setWebsiteAddress] = useState('');
  const [websiteFace, setWebsiteFace] = useState('');
  const [websiteLogoUrl, setWebsiteLogoUrl] = useState('');
  const [deliveryWilaya, setDeliveryWilaya] = useState('');
  const [deliveryPriceHome, setDeliveryPriceHome] = useState('');
  const [deliveryPriceOffice, setDeliveryPriceOffice] = useState('');
  const [editDeliveryPrice, setEditDeliveryPrice] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const logoFileInputRef = useRef(null);

  useEffect(() => {
    fetchWebsite(setWebsite, setIsLoading, {
      setWebsiteName,
      setWebsiteEmail,
      setWebsitePhone,
      setWebsiteWhatsapp,
      setWebsiteFacebook,
      setWebsiteInstagram,
      setWebsiteTiktok,
      setWebsiteAddress,
      setWebsiteFace,
      setWebsiteLogoUrl,
      setLogoPreview,
    });
    fetchDeliveryPrices(setDeliveryPrices, setIsLoading);
  }, []);

  const handleInputChange = (setter, field) => (e) => {
    const { value } = e.target;
    if (field) {
      setter((prev) => ({ ...prev, [field]: value }));
    } else {
      setter(value);
    }
  };

  const handleWebsiteUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('website')
        .update({
          name: websiteName,
          email: websiteEmail,
          phone: websitePhone,
          whatsapp: websiteWhatsapp,
          facebook: websiteFacebook,
          instagram: websiteInstagram,
          tiktok: websiteTiktok,
          address: websiteAddress,
          face: websiteFace,
          logo_url: websiteLogoUrl,
        })
        .eq('id', website.id);
      if (error) throw error;
      fetchWebsite(setWebsite, setIsLoading, {
        setWebsiteName,
        setWebsiteEmail,
        setWebsitePhone,
        setWebsiteWhatsapp,
        setWebsiteFacebook,
        setWebsiteInstagram,
        setWebsiteTiktok,
        setWebsiteAddress,
        setWebsiteFace,
        setWebsiteLogoUrl,
        setLogoPreview,
      });
      alert('Paramètres du site mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres du site :', error);
      alert('Échec de la mise à jour des paramètres du site. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryPriceUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.from('delivery_prices').insert([
        {
          wilaya: deliveryWilaya,
          price_home: deliveryPriceHome,
          price_office: deliveryPriceOffice,
        },
      ]);
      if (error) throw error;
      setDeliveryWilaya('');
      setDeliveryPriceHome('');
      setDeliveryPriceOffice('');
      fetchDeliveryPrices(setDeliveryPrices, setIsLoading);
      alert('Frais de livraison ajoutés avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des frais de livraison :', error);
      alert('Échec de l\'ajout des frais de livraison. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDeliveryPrice = async (e, price) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('delivery_prices')
        .update({
          price_home: price.price_home,
          price_office: price.price_office,
        })
        .eq('id', price.id);
      if (error) throw error;
      setEditDeliveryPrice(null);
      fetchDeliveryPrices(setDeliveryPrices, setIsLoading);
      alert('Frais de livraison mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des frais de livraison :', error);
      alert('Échec de la mise à jour des frais de livraison. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    const uploadedUrl = await uploadImageToSupabase(file, 'logos');
    if (uploadedUrl) {
      setWebsiteLogoUrl(uploadedUrl);
      setLogoPreview(uploadedUrl);
    } else {
      alert('Échec du téléchargement du logo. Veuillez réessayer.');
    }
    setIsLoading(false);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    setWebsiteLogoUrl('');
    setLogoPreview(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  return (
    <div className="settings-container">
      <div className="section-header">
        <h2>Paramètres du Site</h2>
      </div>
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Traitement en cours...</p>
        </div>
      )}
      <div className="settings-grid">
        {/* Paramètres du site */}
        <div className="form-container website-settings">
          <h3>Paramètres Généraux</h3>
          <form onSubmit={handleWebsiteUpdate}>
            <div className="form-section">
              <h4>Informations de Base</h4>
              <div className="form-group">
                <label htmlFor="website-name">Nom du Site</label>
                <input
                  id="website-name"
                  type="text"
                  placeholder="Entrez le nom du site"
                  value={websiteName}
                  onChange={handleInputChange(setWebsiteName)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-email">Email</label>
                <input
                  id="website-email"
                  type="email"
                  placeholder="Entrez l'email"
                  value={websiteEmail}
                  onChange={handleInputChange(setWebsiteEmail)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-phone">Téléphone</label>
                <input
                  id="website-phone"
                  type="tel"
                  placeholder="Entrez le numéro de téléphone"
                  value={websitePhone}
                  onChange={handleInputChange(setWebsitePhone)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-whatsapp">WhatsApp</label>
                <input
                  id="website-whatsapp"
                  type="tel"
                  placeholder="Entrez le numéro WhatsApp"
                  value={websiteWhatsapp}
                  onChange={handleInputChange(setWebsiteWhatsapp)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-facebook">Facebook</label>
                <input
                  id="website-facebook"
                  type="url"
                  placeholder="Entrez l'URL Facebook"
                  value={websiteFacebook}
                  onChange={handleInputChange(setWebsiteFacebook)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-instagram">Instagram</label>
                <input
                  id="website-instagram"
                  type="url"
                  placeholder="Entrez l'URL Instagram"
                  value={websiteInstagram}
                  onChange={handleInputChange(setWebsiteInstagram)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-tiktok">TikTok</label>
                <input
                  id="website-tiktok"
                  type="url"
                  placeholder="Entrez l'URL TikTok"
                  value={websiteTiktok}
                  onChange={handleInputChange(setWebsiteTiktok)}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="website-address">Adresse</label>
                <input
                  id="website-address"
                  type="text"
                  placeholder="Entrez l'adresse"
                  value={websiteAddress}
                  onChange={handleInputChange(setWebsiteAddress)}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="form-section">
              <h4>Logo</h4>
              <div className="form-group">
                <div className="file-input-container">
                  <input
                    id="website-logo"
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <label htmlFor="website-logo" className="file-input-label">
                    <span className="upload-icon">+</span>
                    {logoPreview ? 'Changer le Logo' : 'Télécharger le Logo'}
                  </label>
                </div>
                {logoPreview && (
                  <div className="image-preview-container">
                    <div className="image-preview-item">
                      <img src={logoPreview} alt="Aperçu du logo" />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={handleRemoveLogo}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={() => {
                  setWebsiteName(website?.name || '');
                  setWebsiteEmail(website?.email || '');
                  setWebsitePhone(website?.phone || '');
                  setWebsiteWhatsapp(website?.whatsapp || '');
                  setWebsiteFacebook(website?.facebook || '');
                  setWebsiteInstagram(website?.instagram || '');
                  setWebsiteTiktok(website?.tiktok || '');
                  setWebsiteAddress(website?.address || '');
                  setWebsiteFace(website?.face || '');
                  setWebsiteLogoUrl(website?.logo_url || '');
                  setLogoPreview(website?.logo_url || null);
                }}
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
        {/* Frais de livraison */}
        <div className="form-container delivery-prices">
          <h3>Frais de Livraison</h3>
          <form onSubmit={handleDeliveryPriceUpdate}>
            <div className="form-section">
              <h4>Ajouter de Nouveaux Frais de Livraison</h4>
              <div className="form-group">
                <label htmlFor="delivery-wilaya">Wilaya</label>
                <input
                  id="delivery-wilaya"
                  type="text"
                  placeholder="Entrez le nom de la wilaya"
                  value={deliveryWilaya}
                  onChange={handleInputChange(setDeliveryWilaya)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="delivery-price-home">Prix de Livraison à Domicile (DZD)</label>
                  <input
                    id="delivery-price-home"
                    type="number"
                    placeholder="Entrez le prix de livraison à domicile"
                    value={deliveryPriceHome}
                    onChange={handleInputChange(setDeliveryPriceHome)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="delivery-price-office">Prix de Livraison au Bureau (DZD)</label>
                  <input
                    id="delivery-price-office"
                    type="number"
                    placeholder="Entrez le prix de livraison au bureau"
                    value={deliveryPriceOffice}
                    onChange={handleInputChange(setDeliveryPriceOffice)}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? 'Ajout en cours...' : 'Ajouter les Frais de Livraison'}
                </button>
                <button
                  type="button"
                  className="reset-button"
                  onClick={() => {
                    setDeliveryWilaya('');
                    setDeliveryPriceHome('');
                    setDeliveryPriceOffice('');
                  }}
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </form>
          {/* Liste des frais de livraison */}
          <div className="delivery-prices-list">
            <h4>Frais de Livraison Actuels</h4>
            {deliveryPrices.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚚</div>
                <h3>Aucun Frais de Livraison Trouvé</h3>
                <p>Ajoutez des frais de livraison en utilisant le formulaire ci-dessus.</p>
              </div>
            ) : (
              <table className="data-table delivery-prices-table">
                <thead>
                  <tr>
                    <th>Wilaya</th>
                    <th>Livraison à Domicile</th>
                    <th>Livraison au Bureau</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPrices.map((price) => (
                    <tr key={price.id}>
                      <td>{price.wilaya}</td>
                      <td>{price.price_home} DZD</td>
                      <td>{price.price_office} DZD</td>
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => setEditDeliveryPrice(price)}
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Modal de modification des frais de livraison */}
          {editDeliveryPrice && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Modifier les Frais de Livraison pour {editDeliveryPrice.wilaya}</h3>
                  <button
                    className="close-button"
                    onClick={() => setEditDeliveryPrice(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => handleEditDeliveryPrice(e, editDeliveryPrice)}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="edit-price-home">Prix de Livraison à Domicile (DZD)</label>
                        <input
                          id="edit-price-home"
                          type="number"
                          value={editDeliveryPrice.price_home}
                          onChange={handleInputChange(setEditDeliveryPrice, 'price_home')}
                          required
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edit-price-office">Prix de Livraison au Bureau (DZD)</label>
                        <input
                          id="edit-price-office"
                          type="number"
                          value={editDeliveryPrice.price_office}
                          onChange={handleInputChange(setEditDeliveryPrice, 'price_office')}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                      </button>
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => setEditDeliveryPrice(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}