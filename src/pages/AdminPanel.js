import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './AdminPanel.css';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [website, setWebsite] = useState(null);
  const [deliveryPrices, setDeliveryPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '', price: '', description: '', images_url: '', colors: ''
  });
  const [editProduct, setEditProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [newProductImages, setNewProductImages] = useState([]);
  const [websiteForm, setWebsiteForm] = useState({
    name: '', email: '', phone: '', whatsapp: '', facebook: '', instagram: '',
    tiktok: '', address: '', background_color: '', button_color: '', text_color: '',
    price_color: '', face: '', logo_url: ''
  });
  const [deliveryForm, setDeliveryForm] = useState({ wilaya: '', price_home: '', price_office: '' });
  const [editDeliveryPrice, setEditDeliveryPrice] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const logoFileInputRef = useRef(null);
  const navigate = useNavigate();

  // Authentication check
  const handleLogin = useCallback((e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      if (username === 'Admin' && password === 'adminadmin') {
        setIsAuthenticated(true);
      } else {
        alert('Invalid credentials');
      }
      setIsLoading(false);
    }, 800);
  }, [username, password]);

  // Simplified input handler
  const handleInputChange = (setter, field) => (e) => {
    const { value } = e.target;
    if (field) {
      setter(prev => ({ ...prev, [field]: value }));
    } else {
      setter(value);
    }
  };

  // Fetch data
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchProducts();
      fetchWebsite();
      fetchDeliveryPrices();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('orders_data').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching orders:', error);
    setOrders(data || []);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('products_data').select('*');
    if (error) console.error('Error fetching products:', error);
    setProducts(data || []);
    setIsLoading(false);
  };

  const fetchWebsite = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('website').select('*').single();
    if (error) console.error('Error fetching website settings:', error);
    setWebsite(data);
    setWebsiteForm(data || {});
    setLogoPreview(data?.logo_url || null);
    setIsLoading(false);
  };

  const fetchDeliveryPrices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('delivery_prices').select('*');
    if (error) console.error('Error fetching delivery prices:', error);
    setDeliveryPrices(data || []);
    setIsLoading(false);
  };

  // Image Upload Helpers
  const uploadImageToSupabase = async (file, folder = 'products') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('productsdata')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('productsdata')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error('Failed to get public URL');
        return null;
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadImageToSupabase:', error);
      return null;
    }
  };

  const handleFileChange = async (e, isEdit = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsLoading(true);
    
    if (isEdit) {
      const file = files[0];
      const uploadedUrl = await uploadImageToSupabase(file);
      
      if (uploadedUrl) {
        const currentUrls = editProduct.images_url ? editProduct.images_url.split(',') : [];
        const newUrls = [...currentUrls, uploadedUrl].join(',');
        setEditProduct(prev => ({ ...prev, images_url: newUrls }));
        setProductImages(prev => [...prev, uploadedUrl]);
      }
    } else {
      const uploadPromises = files.map(file => uploadImageToSupabase(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null);
      
      const currentUrls = newProduct.images_url ? newProduct.images_url.split(',').filter(url => url) : [];
      const newUrls = [...currentUrls, ...validUrls].join(',');
      setNewProduct(prev => ({ ...prev, images_url: newUrls }));
      setNewProductImages(prev => [...prev, ...validUrls]);
    }
    
    setIsLoading(false);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const uploadedUrl = await uploadImageToSupabase(file, 'logos');
    
    if (uploadedUrl) {
      setWebsiteForm(prev => ({ ...prev, logo_url: uploadedUrl }));
      setLogoPreview(uploadedUrl);
    } else {
      alert('Failed to upload logo. Please try again.');
    }
    
    setIsLoading(false);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleRemoveImage = (urlToRemove, isEdit = false) => {
    if (isEdit) {
      const currentUrls = editProduct.images_url.split(',');
      const filteredUrls = currentUrls.filter(url => url !== urlToRemove).join(',');
      setEditProduct(prev => ({ ...prev, images_url: filteredUrls }));
      setProductImages(prev => prev.filter(url => url !== urlToRemove));
    } else {
      const currentUrls = newProduct.images_url.split(',');
      const filteredUrls = currentUrls.filter(url => url !== urlToRemove).join(',');
      setNewProduct(prev => ({ ...prev, images_url: filteredUrls }));
      setNewProductImages(prev => prev.filter(url => url !== urlToRemove));
    }
  };

  const handleRemoveLogo = () => {
    setWebsiteForm(prev => ({ ...prev, logo_url: '' }));
    setLogoPreview(null);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  useEffect(() => {
    if (editProduct && editProduct.images_url) {
      const urls = editProduct.images_url.split(',').filter(url => url.trim() !== '');
      setProductImages(urls);
    } else {
      setProductImages([]);
    }
  }, [editProduct]);

  // Color picker handlers
  const handleAddColor = (color, isEdit = false) => {
    if (isEdit) {
      const currentColors = editProduct.colors ? editProduct.colors.split(',') : [];
      if (!currentColors.includes(color)) {
        const newColors = [...currentColors, color].join(',');
        setEditProduct(prev => ({ ...prev, colors: newColors }));
      }
    } else {
      const currentColors = newProduct.colors ? newProduct.colors.split(',') : [];
      if (!currentColors.includes(color)) {
        const newColors = [...currentColors, color].join(',');
        setNewProduct(prev => ({ ...prev, colors: newColors }));
      }
    }
  };

  const handleRemoveColor = (colorToRemove, isEdit = false) => {
    if (isEdit) {
      const currentColors = editProduct.colors.split(',');
      const filteredColors = currentColors.filter(color => color !== colorToRemove).join(',');
      setEditProduct(prev => ({ ...prev, colors: filteredColors }));
    } else {
      const currentColors = newProduct.colors.split(',');
      const filteredColors = currentColors.filter(color => color !== colorToRemove).join(',');
      setNewProduct(prev => ({ ...prev, colors: filteredColors }));
    }
  };

  // Orders Tab
  const OrdersTab = () => (
    <div className="orders-container">
      <div className="section-header">
        <h2>Orders Management</h2>
        <button className="refresh-button" onClick={fetchOrders}>
          <span className="refresh-icon">↻</span> Refresh
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Orders Found</h3>
          <p>When customers place orders, they will appear here.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="data-table orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Color</th>
                <th>Total Price</th>
                <th>Location</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>{order.name}</td>
                  <td>{order.product_title}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <span className="color-dot" style={{backgroundColor: order.color}}></span>
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
                        if (error) console.error('Error updating status:', error);
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
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

  // Manage Products Tab
  const ManageProductsTab = () => {
    const handleAddProduct = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.from('products_data').insert([newProduct]);
        
        if (error) throw error;
        
        setNewProduct({ title: '', price: '', description: '', images_url: '', colors: '' });
        setNewProductImages([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchProducts();
        alert('Product added successfully!');
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product. Please try again.');
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
          .update(editProduct)
          .eq('id', editProduct.id);
          
        if (error) throw error;
        
        setEditProduct(null);
        fetchProducts();
        alert('Product updated successfully!');
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeleteProduct = async (id) => {
      if (window.confirm('Are you sure you want to delete this product?')) {
        setIsLoading(true);
        try {
          const { error } = await supabase.from('products_data').delete().eq('id', id);
          
          if (error) throw error;
          
          fetchProducts();
          alert('Product deleted successfully!');
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    return (
      <div className="manage-products-container">
        <div className="section-header">
          <h2>Product Management</h2>
          <button className="refresh-button" onClick={fetchProducts}>
            <span className="refresh-icon">↻</span> Refresh
          </button>
        </div>
        
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {/* Add Product Form */}
        <div className="form-container add-product-form">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label htmlFor="product-title">Product Title</label>
              <input
                id="product-title"
                type="text"
                placeholder="Enter product title"
                value={newProduct.title}
                onChange={handleInputChange(setNewProduct, 'title')}
                required
                autoComplete="off"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-price">Price (DZD)</label>
                <input
                  id="product-price"
                  type="number"
                  placeholder="Enter price"
                  value={newProduct.price}
                  onChange={handleInputChange(setNewProduct, 'price')}
                  required
                  autoComplete="off"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="product-colors">Colors</label>
                <div className="color-picker-container">
                  <input
                    id="product-colors"
                    type="color"
                    onChange={(e) => handleAddColor(e.target.value, false)}
                  />
                </div>
                {newProduct.colors && (
                  <div className="selected-colors">
                    {newProduct.colors.split(',').map((color, idx) => (
                      color && (
                        <div key={idx} className="color-preview">
                          <span 
                            className="color-dot" 
                            style={{backgroundColor: color}}
                          ></span>
                          <button
                            type="button"
                            className="remove-color-button"
                            onClick={() => handleRemoveColor(color, false)}
                          >
                            ×
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                placeholder="Enter product description"
                value={newProduct.description}
                onChange={handleInputChange(setNewProduct, 'description')}
                rows="4"
                autoComplete="off"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="product-images">Product Images</label>
              <div className="file-input-container">
                <input
                  id="product-images"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                />
                <label htmlFor="product-images" className="file-input-label">
                  <span className="upload-icon">+</span>
                  Choose Images
                </label>
              </div>
              
              {newProductImages.length > 0 && (
                <div className="image-preview-container">
                  {newProductImages.map((url, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={url} alt={`Product preview ${index + 1}`} />
                      <button 
                        type="button" 
                        className="remove-image-button"
                        onClick={() => handleRemoveImage(url, false)}
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
                {isLoading ? 'Adding...' : 'Add Product'}
              </button>
              <button
                type="button"
                className="reset-button"
                onClick={() => {
                  setNewProduct({ title: '', price: '', description: '', images_url: '', colors: '' });
                  setNewProductImages([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Product List */}
        <div className="products-list">
          <h3>All Products</h3>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <h3>No Products Found</h3>
              <p>Add your first product using the form above.</p>
            </div>
          ) : (
            <table className="data-table products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Colors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const firstImage = product.images_url ? product.images_url.split(',')[0] : '';
                  return (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td className="product-image-cell">
                        {firstImage ? (
                          <img src={firstImage} alt={product.title} />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                      <td>{product.title}</td>
                      <td className="price-cell">{product.price} DZD</td>
                      <td>
                        {product.colors && product.colors.split(',').map((color, idx) => (
                          <span 
                            key={idx} 
                            className="color-dot" 
                            style={{backgroundColor: color.trim()}}
                            title={color.trim()}
                          ></span>
                        ))}
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="edit-button"
                          onClick={() => setEditProduct(product)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Product Form */}
        {editProduct && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Edit Product</h3>
                <button 
                  className="close-button" 
                  onClick={() => setEditProduct(null)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleEditProduct}>
                  <div className="form-group">
                    <label htmlFor="edit-product-title">Product Title</label>
                    <input
                      id="edit-product-title"
                      type="text"
                      placeholder="Enter product title"
                      value={editProduct.title}
                      onChange={handleInputChange(setEditProduct, 'title')}
                      required
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-product-price">Price (DZD)</label>
                      <input
                        id="edit-product-price"
                        type="number"
                        placeholder="Enter price"
                        value={editProduct.price}
                        onChange={handleInputChange(setEditProduct, 'price')}
                        required
                        autoComplete="off"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="edit-product-colors">Colors</label>
                      <div className="color-picker-container">
                        <input
                          id="edit-product-colors"
                          type="color"
                          onChange={(e) => handleAddColor(e.target.value, true)}
                        />
                      </div>
                      {editProduct.colors && (
                        <div className="selected-colors">
                          {editProduct.colors.split(',').map((color, idx) => (
                            color && (
                              <div key={idx} className="color-preview">
                                <span 
                                  className="color-dot" 
                                  style={{backgroundColor: color}}
                                ></span>
                                <button
                                  type="button"
                                  className="remove-color-button"
                                  onClick={() => handleRemoveColor(color, true)}
                                >
                                  ×
                                </button>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-product-description">Description</label>
                    <textarea
                      id="edit-product-description"
                      placeholder="Enter product description"
                      value={editProduct.description}
                      onChange={handleInputChange(setEditProduct, 'description')}
                      rows="4"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Current Images</label>
                    {productImages.length > 0 ? (
                      <div className="image-preview-container">
                        {productImages.map((url, index) => (
                          <div key={index} className="image-preview-item">
                            <img src={url} alt={`Product image ${index + 1}`} />
                            <button 
                              type="button" 
                              className="remove-image-button"
                              onClick={() => handleRemoveImage(url, true)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-images-message">No images available</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-product-images">Add Image (One at a time)</label>
                    <div className="file-input-container">
                      <input
                        id="edit-product-images"
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, true)}
                      />
                      <label htmlFor="edit-product-images" className="file-input-label">
                        <span className="upload-icon">+</span>
                        Choose Image
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditProduct(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Settings Tab
  const SettingsTab = () => {
    const handleWebsiteUpdate = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        const { error } = await supabase
          .from('website')
          .update(websiteForm)
          .eq('id', website.id);
          
        if (error) throw error;
        
        fetchWebsite();
        alert('Website settings updated successfully!');
      } catch (error) {
        console.error('Error updating website settings:', error);
        alert('Failed to update website settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleDeliveryPriceUpdate = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        const { error } = await supabase
          .from('delivery_prices')
          .insert([deliveryForm]);
          
        if (error) throw error;
        
        setDeliveryForm({ wilaya: '', price_home: '', price_office: '' });
        fetchDeliveryPrices();
        alert('Delivery price added successfully!');
      } catch (error) {
        console.error('Error adding delivery price:', error);
        alert('Failed to add delivery price. Please try again.');
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
            price_office: price.price_office
          })
          .eq('id', price.id);
          
        if (error) throw error;
        
        setEditDeliveryPrice(null);
        fetchDeliveryPrices();
        alert('Delivery price updated successfully!');
      } catch (error) {
        console.error('Error updating delivery price:', error);
        alert('Failed to update delivery price. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="settings-container">
        <div className="section-header">
          <h2>Website Settings</h2>
        </div>
        
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Processing...</p>
          </div>
        )}
        
        <div className="settings-grid">
          {/* Website Settings */}
          <div className="form-container website-settings">
            <h3>General Settings</h3>
            <form onSubmit={handleWebsiteUpdate}>
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-group">
                  <label htmlFor="website-name">Website Name</label>
                  <input
                    id="website-name"
                    type="text"
                    placeholder="Enter website name"
                    value={websiteForm.name || ''}
                    onChange={handleInputChange(setWebsiteForm, 'name')}
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="website-email">Email</label>
                    <input
                      id="website-email"
                      type="email"
                      placeholder="Enter email address"
                      value={websiteForm.email || ''}
                      onChange={handleInputChange(setWebsiteForm, 'email')}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="website-phone">Phone</label>
                    <input
                      id="website-phone"
                      type="text"
                      placeholder="Enter phone number"
                      value={websiteForm.phone || ''}
                      onChange={handleInputChange(setWebsiteForm, 'phone')}
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="website-address">Address</label>
                  <input
                    id="website-address"
                    type="text"
                    placeholder="Enter physical address"
                    value={websiteForm.address || ''}
                    onChange={handleInputChange(setWebsiteForm, 'address')}
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h4>Social Media</h4>
                <div className="form-group">
                  <label htmlFor="website-whatsapp">WhatsApp</label>
                  <input
                    id="website-whatsapp"
                    type="text"
                    placeholder="https://wa.me/1234567890"
                    value={websiteForm.whatsapp || ''}
                    onChange={handleInputChange(setWebsiteForm, 'whatsapp')}
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website-facebook">Facebook URL</label>
                  <input
                    id="website-facebook"
                    type="text"
                    placeholder="Enter Facebook page URL"
                    value={websiteForm.facebook || ''}
                    onChange={handleInputChange(setWebsiteForm, 'facebook')}
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website-instagram">Instagram URL</label>
                  <input
                    id="website-instagram"
                    type="text"
                    placeholder="Enter Instagram profile URL"
                    value={websiteForm.instagram || ''}
                    onChange={handleInputChange(setWebsiteForm, 'instagram')}
                    autoComplete="off"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="website-tiktok">TikTok URL</label>
                  <input
                    id="website-tiktok"
                    type="text"
                    placeholder="Enter TikTok profile URL"
                    value={websiteForm.tiktok || ''}
                    onChange={handleInputChange(setWebsiteForm, 'tiktok')}
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div className="form-section">
                <h4>Appearance</h4>
                <div className="form-row colors-row">
                  <div className="form-group color-picker-group">
                    <label htmlFor="website-bg-color">Background Color</label>
                    <div className="color-picker-container">
                      <input
                        id="website-bg-color"
                        type="color"
                        value={websiteForm.background_color || '#ffffff'}
                        onChange={handleInputChange(setWebsiteForm, 'background_color')}
                      />
                      <input
                        type="text"
                        placeholder="#ffffff"
                        value={websiteForm.background_color || ''}
                        onChange={handleInputChange(setWebsiteForm, 'background_color')}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group color-picker-group">
                    <label htmlFor="website-text-color">Text Color</label>
                    <div className="color-picker-container">
                      <input
                        id="website-text-color"
                        type="color"
                        value={websiteForm.text_color || '#000000'}
                        onChange={handleInputChange(setWebsiteForm, 'text_color')}
                      />
                      <input
                        type="text"
                        placeholder="#000000"
                        value={websiteForm.text_color || ''}
                        onChange={handleInputChange(setWebsiteForm, 'text_color')}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-row colors-row">
                  <div className="form-group color-picker-group">
                    <label htmlFor="website-button-color">Button Color</label>
                    <div className="color-picker-container">
                      <input
                        id="website-button-color"
                        type="color"
                        value={websiteForm.button_color || '#4a90e2'}
                        onChange={handleInputChange(setWebsiteForm, 'button_color')}
                      />
                      <input
                        type="text"
                        placeholder="#4a90e2"
                        value={websiteForm.button_color || ''}
                        onChange={handleInputChange(setWebsiteForm, 'button_color')}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="form-group color-picker-group">
                    <label htmlFor="website-price-color">Price Color</label>
                    <div className="color-picker-container">
                      <input
                        id="website-price-color"
                        type="color"
                        value={websiteForm.price_color || '#e74c3c'}
                        onChange={handleInputChange(setWebsiteForm, 'price_color')}
                      />
                      <input
                        type="text"
                        placeholder="#e74c3c"
                        value={websiteForm.price_color || ''}
                        onChange={handleInputChange(setWebsiteForm, 'price_color')}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="website-logo">Logo</label>
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
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </label>
                  </div>
                  {logoPreview && (
                    <div className="image-preview-container">
                      <div className="image-preview-item">
                        <img src={logoPreview} alt="Logo preview" />
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
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
                <button
                  type="button"
                  className="reset-button"
                  onClick={() => {
                    setWebsiteForm(website || {});
                    setLogoPreview(website?.logo_url || null);
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Delivery Prices */}
          <div className="form-container delivery-prices">
            <h3>Delivery Prices</h3>
            <form onSubmit={handleDeliveryPriceUpdate}>
              <div className="form-section">
                <h4>Add New Delivery Price</h4>
                <div className="form-group">
                  <label htmlFor="delivery-wilaya">Wilaya</label>
                  <input
                    id="delivery-wilaya"
                    type="text"
                    placeholder="Enter wilaya name"
                    value={deliveryForm.wilaya}
                    onChange={handleInputChange(setDeliveryForm, 'wilaya')}
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="delivery-price-home">Home Delivery Price (DZD)</label>
                    <input
                      id="delivery-price-home"
                      type="number"
                      placeholder="Enter home delivery price"
                      value={deliveryForm.price_home}
                      onChange={handleInputChange(setDeliveryForm, 'price_home')}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="delivery-price-office">Office Delivery Price (DZD)</label>
                    <input
                      id="delivery-price-office"
                      type="number"
                      placeholder="Enter office delivery price"
                      value={deliveryForm.price_office}
                      onChange={handleInputChange(setDeliveryForm, 'price_office')}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Adding...' : 'Add Delivery Price'}
                  </button>
                  <button
                    type="button"
                    className="reset-button"
                    onClick={() => setDeliveryForm({ wilaya: '', price_home: '', price_office: '' })}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>

            {/* Delivery Prices List */}
            <div className="delivery-prices-list">
              <h4>Current Delivery Prices</h4>
              {deliveryPrices.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚚</div>
                  <h3>No Delivery Prices Found</h3>
                  <p>Add delivery prices using the form above.</p>
                </div>
              ) : (
                <table className="data-table delivery-prices-table">
                  <thead>
                    <tr>
                      <th>Wilaya</th>
                      <th>Home Delivery</th>
                      <th>Office Delivery</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryPrices.map(price => (
                      <tr key={price.id}>
                        <td>{price.wilaya}</td>
                        <td>{price.price_home} DZD</td>
                        <td>{price.price_office} DZD</td>
                        <td>
                          <button
                            className="edit-button"
                            onClick={() => setEditDeliveryPrice(price)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Edit Delivery Price Modal */}
            {editDeliveryPrice && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Edit Delivery Prices for {editDeliveryPrice.wilaya}</h3>
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
                          <label htmlFor="edit-price-home">Home Delivery Price (DZD)</label>
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
                          <label htmlFor="edit-price-office">Office Delivery Price (DZD)</label>
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
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => setEditDeliveryPrice(null)}
                        >
                          Cancel
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
  };

  // Main render
  return (
    <div className="admin-panel">
      {!isAuthenticated ? (
        <div className="login-container">
          <div className="login-card">
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={handleInputChange(setUsername)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  required
                  autoComplete="off"
                />
              </div>

              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard">
          <div className="sidebar">
            <div className="sidebar-header">
              <h3>Admin Panel</h3>
            </div>
            <nav className="sidebar-nav">
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <span className="nav-icon">📋</span> Orders
              </button>
              <button
                className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <span className="nav-icon">🛍️</span> Products
              </button>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <span className="nav-icon">⚙️</span> Settings
              </button>
              <button
                className="nav-item logout-button"
                onClick={() => {
                  setIsAuthenticated(false);
                  setUsername('');
                  setPassword('');
                  navigate('/admin');
                }}
              >
                <span className="nav-icon">🚪</span> Logout
              </button>
            </nav>
          </div>

          <div className="main-content">
            <div className="header">
              <h1>Dashboard</h1>
              <div className="user-info">
                <span>Welcome, Admin</span>
              </div>
            </div>

            <div className="content">
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