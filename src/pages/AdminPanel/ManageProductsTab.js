// src/components/AdminPanel/ManageProductsTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { fetchProducts } from './utils/fetchData';
import { handleFileChange, handleRemoveImage, handleAddColor, handleRemoveColor, updateColor } from './utils/imageUtils';

export default function ManageProductsTab() {
  const [products, setProducts] = useState([]);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImagesUrl, setNewProductImagesUrl] = useState('');
  const [newProductColors, setNewProductColors] = useState([]); // Tableau pour les couleurs du nouveau produit
  const [editProduct, setEditProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [newProductImages, setNewProductImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts(setProducts, setIsLoading);
  }, []);

  useEffect(() => {
    if (editProduct && editProduct.images_url) {
      const urls = editProduct.images_url.split(',').filter((url) => url.trim() !== '');
      setProductImages(urls);
    } else {
      setProductImages([]);
    }
  }, [editProduct]);

  const handleInputChange = (setter, field) => (e) => {
    const { value } = e.target;
    if (field) {
      setter((prev) => ({ ...prev, [field]: value }));
    } else {
      setter(value);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('products_data').insert([
        {
          title: newProductTitle,
          price: newProductPrice,
          description: newProductDescription,
          images_url: newProductImagesUrl,
          colors: newProductColors.join(','), // Convertir le tableau en chaîne
        },
      ]);
      if (error) throw error;
      setNewProductTitle('');
      setNewProductPrice('');
      setNewProductDescription('');
      setNewProductImagesUrl('');
      setNewProductColors([]);
      setNewProductImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProducts(setProducts, setIsLoading);
      alert('Produit ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit :', error);
      alert('Échec de l\'ajout du produit. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products_data')
        .update({
          ...editProduct,
          colors: editProduct.colors.join(','), // Convertir le tableau en chaîne
        })
        .eq('id', editProduct.id);
      if (error) throw error;
      setEditProduct(null);
      fetchProducts(setProducts, setIsLoading);
      alert('Produit mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit :', error);
      alert('Échec de la mise à jour du produit. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase.from('products_data').delete().eq('id', id);
        if (error) throw error;
        fetchProducts(setProducts, setIsLoading);
        alert('Produit supprimé avec succès !');
      } catch (error) {
        console.error('Erreur lors de la suppression du produit :', error);
        alert('Échec de la suppression du produit. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="manage-products-container">
      <div className="section-header">
        <h2>Gestion des Produits</h2>
        <button className="refresh-button" onClick={() => fetchProducts(setProducts, setIsLoading)}>
          <span className="refresh-icon">↻</span> Actualiser
        </button>
      </div>
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Traitement en cours...</p>
        </div>
      )}
      {/* Formulaire d'ajout de produit */}
      <div className="form-container add-product-form">
        <h3>Ajouter un Nouveau Produit</h3>
        <form onSubmit={handleAddProduct}>
          <div className="form-group">
            <label htmlFor="product-title">Titre du Produit</label>
            <input
              id="product-title"
              type="text"
              placeholder="Entrez le titre du produit"
              value={newProductTitle}
              onChange={handleInputChange(setNewProductTitle)}
              required
              autoComplete="off"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-price">Prix (DZD)</label>
              <input
                id="product-price"
                type="number"
                placeholder="Entrez le prix"
                value={newProductPrice}
                onChange={handleInputChange(setNewProductPrice)}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label>Couleurs</label>
              {newProductColors.map((color, index) => (
                <div key={index} className="color-picker-container" style={{ marginBottom: '0.5rem' }}>
                  <input
                    id={`product-color-${index}`}
                    type="color"
                    value={color || '#000000'}
                    onChange={(e) => updateColor(index, e.target.value, false, setNewProductColors)}
                  />
                  <input
                    type="text"
                    placeholder="#000000"
                    value={color || ''}
                    onChange={(e) => updateColor(index, e.target.value, false, setNewProductColors)}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="remove-color-button"
                    onClick={() => handleRemoveColor(index, false, setNewProductColors)}
                    style={{ marginLeft: '0.5rem' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-color-button"
                onClick={() => handleAddColor('#000000', false, setNewProductColors)}
                style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Ajouter une Couleur
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              placeholder="Entrez la description du produit"
              value={newProductDescription}
              onChange={handleInputChange(setNewProductDescription)}
              rows="4"
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label htmlFor="product-images">Images du Produit</label>
            <div className="file-input-container">
              <input
                id="product-images"
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  handleFileChange(
                    e,
                    false,
                    setIsLoading,
                    setNewProductImagesUrl,
                    setNewProductImages,
                    fileInputRef
                  )
                }
              />
              <label htmlFor="product-images" className="file-input-label">
                <span className="upload-icon">+</span>
                Choisir des Images
              </label>
            </div>
            {newProductImages.length > 0 && (
              <div className="image-preview-container">
                {newProductImages.map((url, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={url} alt={`Aperçu du produit ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() =>
                        handleRemoveImage(url, false, setNewProductImagesUrl, setNewProductImages)
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Ajout en cours...' : 'Ajouter le Produit'}
            </button>
            <button
              type="button"
              className="reset-button"
              onClick={() => {
                setNewProductTitle('');
                setNewProductPrice('');
                setNewProductDescription('');
                setNewProductImagesUrl('');
                setNewProductColors([]);
                setNewProductImages([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Réinitialiser le Formulaire
            </button>
          </div>
        </form>
      </div>
      {/* Liste des produits */}
      <div className="products-list">
        <h3>Tous les Produits</h3>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h3>Aucun Produit Trouvé</h3>
            <p>Ajoutez votre premier produit en utilisant le formulaire ci-dessus.</p>
          </div>
        ) : (
          <table className="data-table products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Titre</th>
                <th>Prix</th>
                <th>Couleurs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const firstImage = product.images_url ? product.images_url.split(',')[0] : '';
                return (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td className="product-image-cell">
                      {firstImage ? (
                        <img src={firstImage} alt={product.title} />
                      ) : (
                        <div className="no-image">Aucune Image</div>
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td className="price-cell">{product.price} DZD</td>
                    <td>
                      {product.colors &&
                        product.colors.split(',').map((color, idx) => (
                          <span
                            key={idx}
                            className="color-dot"
                            style={{ backgroundColor: color.trim() }}
                            title={color.trim()}
                          ></span>
                        ))}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="copy-button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://ecommerce-pi-six-51.vercel.app/product/${product.id}`);
                          alert('Lien du produit copié dans le presse-papiers !');
                        }}
                      >
                        Copier le Lien
                      </button>
                      <button
                        className="edit-button"
                        onClick={() =>
                          setEditProduct({
                            ...product,
                            colors: product.colors ? product.colors.split(',').filter((color) => color.trim()) : [],
                          })
                        }
                      >
                        Modifier
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {/* Formulaire de modification de produit */}
      {editProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Modifier le Produit</h3>
              <button className="close-button" onClick={() => setEditProduct(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditProduct}>
                <div className="form-group">
                  <label htmlFor="edit-product-title">Titre du Produit</label>
                  <input
                    id="edit-product-title"
                    type="text"
                    placeholder="Entrez le titre du produit"
                    value={editProduct.title}
                    onChange={handleInputChange(setEditProduct, 'title')}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-product-price">Prix (DZD)</label>
                    <input
                      id="edit-product-price"
                      type="number"
                      placeholder="Entrez le prix"
                      value={editProduct.price}
                      onChange={handleInputChange(setEditProduct, 'price')}
                      required
                      autoComplete="off"
                    />
                  </div>
                  <div className="form-group">
                    <label>Couleurs</label>
                    {editProduct.colors.map((color, index) => (
                      <div key={index} className="color-picker-container" style={{ marginBottom: '0.5rem' }}>
                        <input
                          id={`edit-product-color-${index}`}
                          type="color"
                          value={color || '#000000'}
                          onChange={(e) => updateColor(index, e.target.value, true, setEditProduct)}
                        />
                        <input
                          type="text"
                          placeholder="#000000"
                          value={color || ''}
                          onChange={(e) => updateColor(index, e.target.value, true, setEditProduct)}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="remove-color-button"
                          onClick={() => handleRemoveColor(index, true, setEditProduct)}
                          style={{ marginLeft: '0.5rem' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-color-button"
                      onClick={() => handleAddColor('#000000', true, setEditProduct)}
                      style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Ajouter une Couleur
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-product-description">Description</label>
                  <textarea
                    id="edit-product-description"
                    placeholder="Entrez la description du produit"
                    value={editProduct.description}
                    onChange={handleInputChange(setEditProduct, 'description')}
                    rows="4"
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label>Images Actuelles</label>
                  {productImages.length > 0 ? (
                    <div className="image-preview-container">
                      {productImages.map((url, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={url} alt={`Image du produit ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-button"
                            onClick={() =>
                              handleRemoveImage(url, true, setEditProduct, setProductImages)
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-images-message">Aucune image disponible</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-product-images">Ajouter une Image (Une à la fois)</label>
                  <div className="file-input-container">
                    <input
                      id="edit-product-images"
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          true,
                          setIsLoading,
                          setEditProduct,
                          setProductImages,
                          editFileInputRef
                        )
                      }
                    />
                    <label htmlFor="edit-product-images" className="file-input-label">
                      <span className="upload-icon">+</span>
                      Choisir une Image
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setEditProduct(null)}
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
  );
}