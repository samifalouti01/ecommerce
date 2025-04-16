import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ProductStyles.css';

export default function Home() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: site } = await supabase.from('website').select('*').single();
      const { data: products } = await supabase.from('products_data').select('*');
      setWebsite(site);
      setProducts(products);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Function to process image URLs from text
  const processImageUrls = (imageUrlString) => {
    if (!imageUrlString) return [];
    return imageUrlString.split(',').map(url => url.trim());
  };

  // Image Carousel Component
  const ImageCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
      if (images.length <= 1) return;
      
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
      
      return () => clearInterval(interval);
    }, [images]);
    
    if (images.length === 0) {
      return <img src="/api/placeholder/300/300" alt="No image available" className="carousel-image" />;
    }
    
    if (images.length === 1) {
      return <img src={images[0]} alt="Product" className="carousel-image" />;
    }
    
    return (
      <div className="carousel-container">
        <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`Product view ${index + 1}`} 
              className="carousel-image"
            />
          ))}
        </div>
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <span 
              key={index} 
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-container">
      <header className="site-header">
        <div className="header-content">
          {website?.logo_url && (
            <img src={website.logo_url} alt="logo" className="site-logo" />
          )}
          {website?.name && <h1 className="site-name">{website.name}</h1>}
        </div>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="main-content">
        {filtered.length === 0 ? (
          <div className="no-results">
            <p>No products found matching your search.</p>
          </div>
        ) : (
          <>
          <div className="products-count">
            {filtered.length} {filtered.length === 1 ? 'Product' : 'Products'} Found
          </div>
          <div className="products-grid">
            {filtered.map(p => (
              <div
                key={p.id}
                className="product-card"
                onClick={() => navigate(`/product/${p.id}`)}
              >
                <div className="product-image">
                  <ImageCarousel images={processImageUrls(p.images_url)} />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{p.title}</h3>
                  <p className="product-price" style={{ color: website?.price_color || '#e63946' }}>
                    {p.price} DZD
                  </p>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          
          <div className="footer-column company-info">
            {website?.logo_url && (
              <img src={website.logo_url} alt="logo" className="footer-logo" />
            )}
            {website?.name && <h3 className="footer-title">{website.name}</h3>}
            {website?.description && <p className="footer-description">{website.description}</p>}
          </div>

          <div className="footer-column contact-info">
            <h3>Contact</h3>
            <ul className="social-icons icon-only-list">
              {website?.email && (
                <li>
                  <a href={`mailto:${website.email}`}>
                    <ion-icon name="mail-outline"></ion-icon>
                  </a>
                </li>
              )}
              {website?.phone && (
                <li>
                  <a href={`tel:${website.phone}`}>
                    <ion-icon name="call-outline"></ion-icon>
                  </a>
                </li>
              )}
              {website?.whatsapp && (
                <li>
                  <a href={`https://wa.me/${website.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <ion-icon name="logo-whatsapp"></ion-icon>
                  </a>
                </li>
              )}
              {website?.address && (
                <li>
                  <ion-icon name="location-outline"></ion-icon>
                  <span>{website.address}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="footer-column social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              {website?.facebook && (
                <a href={website.facebook} target="_blank" rel="noopener noreferrer">
                  <ion-icon name="logo-facebook"></ion-icon>
                </a>
              )}
              {website?.instagram && (
                <a href={website.instagram} target="_blank" rel="noopener noreferrer">
                  <ion-icon name="logo-instagram"></ion-icon>
                </a>
              )}
              {website?.tiktok && (
                <a href={website.tiktok} target="_blank" rel="noopener noreferrer">
                  <ion-icon name="logo-tiktok"></ion-icon>
                </a>
              )}
            </div>
          </div>
          
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {website?.name}. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}