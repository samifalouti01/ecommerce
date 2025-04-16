import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ProductStyles.css';

export default function ProductPreview() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [wilayas, setWilayas] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', wilaya: '', commune: '', deliveryType: 'home' });
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [website, setWebsite] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    fetchData();
  }, [id, form.wilaya, form.deliveryType]);

  async function fetchData() {
    const { data: site } = await supabase.from('website').select('*').single();
    const { data: product } = await supabase.from('products_data').select('*').eq('id', id).single();
    const { data: delivery } = await supabase.from('delivery_prices').select('*');

    setWebsite(site);
    setProduct(product);
    setWilayas(delivery);

    if (product?.description) {
      const { data: related } = await supabase
        .from('products_data')
        .select('*')
        .neq('id', id)
        .ilike('description', `%${product.description}%`)
        .limit(4);
      setRelated(related || []);
    }

    const selectedWilaya = delivery.find(w => w.wilaya === form.wilaya);
    const price = selectedWilaya ? form.deliveryType === 'home' ? +selectedWilaya.price_home : +selectedWilaya.price_office : 0;
    setDeliveryPrice(price);
  }

  const totalPrice = (parseFloat(product?.price || 0) * quantity) + deliveryPrice;

  async function submitOrder(e) {
    e.preventDefault();
  
    if (!form.name || !form.phone || !form.wilaya || !form.commune || !selectedColor) {
      alert('Please fill all required fields and select a color');
      return;
    }
  
    const lastOrderTime = localStorage.getItem(`order_${id}`);
    if (lastOrderTime) {
      const lastOrderDate = new Date(lastOrderTime);
      const now = new Date();
      const diffHours = (now - lastOrderDate) / (1000 * 60 * 60);
  
      if (diffHours < 24) {
        alert('You have already placed an order for this product in the last 24 hours.');
        return;
      }
    }
  
    try {
      await supabase.from('orders_data').insert({
        name: form.name,
        phone: form.phone,
        wilaya: form.wilaya,
        commune: form.commune,
        total_price: totalPrice.toString(),
        quantity: quantity.toString(),
        product_id: id,
        product_title: product.title,
        color: selectedColor
      });
  
      localStorage.setItem(`order_${id}`, new Date().toISOString());
      alert('Order submitted successfully!');
  
      setForm({ name: '', phone: '', wilaya: '', commune: '', deliveryType: 'home' });
      setQuantity(1);
      setSelectedColor('');
    } catch (error) {
      alert('Error submitting order. Please try again.');
      console.error(error);
    }
  }  

  // Function to process image URLs from text
  const processImageUrls = (imageUrlString) => {
    if (!imageUrlString) return [];
    return imageUrlString.split(',').map(url => url.trim());
  };

  if (!product) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  const images = processImageUrls(product.images_url);

  return (
    <div className="product-preview-container">
      <header className="site-header">
        <div className="header-content">
          {website.logo_url && (
            <img src={website.logo_url} alt="logo" className="site-logo" />
          )}
          {website.name && <h1 className="site-name">{website.name}</h1>}
        </div>
      </header>

      <div className="product-content">
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={images[activeImage] || '/api/placeholder/400/320'} 
              alt={product.title} 
            />
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((url, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={url} alt={`${product.title} thumbnail ${idx+1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <h2 className="product-title">{product.title}</h2>
          <p className="product-price" style={{ color: website.price_color || '#e63946' }}>
            {product.price} DZD
          </p>
          <div className="product-description">
            <p>{product.description}</p>
          </div>


          <form className="order-form" onSubmit={submitOrder}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input 
                id="name"
                type="text" 
                placeholder="Enter your full name" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required
                />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input 
                id="phone"
                type="tel" 
                placeholder="Enter your phone number" 
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} 
                required
                />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="wilaya">Wilaya *</label>
                <select 
                  id="wilaya"
                  value={form.wilaya}
                  onChange={e => setForm({ ...form, wilaya: e.target.value })}
                  required
                  >
                  <option value="">Select Wilaya</option>
                  {wilayas.map(w => (
                      <option key={w.id} value={w.wilaya}>{w.wilaya}</option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="commune">Commune *</label>
                <input 
                  id="commune"
                  type="text" 
                  placeholder="Enter your commune" 
                  value={form.commune}
                  onChange={e => setForm({ ...form, commune: e.target.value })} 
                  required
                  />
              </div>
            </div>
                  {product.colors && (
                    <div className="form-group">
                        <label>Select Color *</label>
                        <div className="color-options">
                        {product.colors.split(',').map((color, idx) => (
                            <button
                            key={idx}
                            type="button"
                            className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                            style={{
                                backgroundColor: color.trim(),
                                border: selectedColor === color ? '3px solid #000' : '1px solid #ccc',
                                width: '30px',
                                height: '30px',
                                margin: '5px',
                                borderRadius: '50%',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedColor(color.trim())}
                            />
                        ))}
                        </div>
                    </div>
                    )}

            <div className="form-group">
              <label htmlFor="deliveryType">Delivery Method *</label>
              <select 
                id="deliveryType"
                value={form.deliveryType}
                onChange={e => setForm({ ...form, deliveryType: e.target.value })}
                required
              >
                <option value="home">Delivery at Home</option>
                <option value="office">Stop at Office</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <div className="quantity-selector">
                <button 
                  type="button" 
                  className="quantity-btn"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  type="button" 
                  className="quantity-btn"
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div className="price-summary">
              <div className="price-row">
                <span>Item Price:</span>
                <span>{product.price} DA</span>
              </div>
              <div className="price-row">
                <span>Quantity:</span>
                <span>× {quantity}</span>
              </div>
              <div className="price-row">
                <span>Delivery Fee:</span>
                <span>{deliveryPrice} DA</span>
              </div>
              <div className="price-row total">
                <span>Total Price:</span>
                <span style={{ color: website.price_color || '#e63946' }}>{totalPrice} DA</span>
              </div>
            </div>

            <button type="submit" className="order-button">
              Complete Order
            </button>
          </form>
        </div>
      </div>

      {related.length > 0 && (
        <div className="related-products">
          <h3 className="section-title">Related Products</h3>
          <div className="related-grid">
            {related.map(p => (
              <div key={p.id} className="related-item">
                <div className="related-image">
                  <img 
                    src={processImageUrls(p.images_url)?.[0] || '/api/placeholder/200/200'} 
                    alt={p.title} 
                  />
                </div>
                <h4 className="related-title">{p.title}</h4>
                <p className="related-price" style={{ color: website.price_color || '#e63946' }}>
                  {p.price} DA
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}