// src/components/AdminPanel/utils/fetchData.js
import { supabase } from '../../../supabaseClient';

export const fetchOrders = async (setOrders, setIsLoading) => {
  setIsLoading(true);
  const { data, error } = await supabase.from('orders_data').select('*').order('created_at', { ascending: false });
  if (error) console.error('Error fetching orders:', error);
  setOrders(data || []);
  setIsLoading(false);
};

export const fetchProducts = async (setProducts, setIsLoading) => {
  setIsLoading(true);
  const { data, error } = await supabase.from('products_data').select('*');
  if (error) console.error('Error fetching products:', error);
  setProducts(data || []);
  setIsLoading(false);
};

export const fetchWebsite = async (setWebsite, setIsLoading, setters) => {
  setIsLoading(true);
  const { data, error } = await supabase.from('website').select('*').single();
  if (error) console.error('Error fetching website settings:', error);
  setWebsite(data);
  setters.setWebsiteName(data?.name || '');
  setters.setWebsiteEmail(data?.email || '');
  setters.setWebsitePhone(data?.phone || '');
  setters.setWebsiteWhatsapp(data?.whatsapp || '');
  setters.setWebsiteFacebook(data?.facebook || '');
  setters.setWebsiteInstagram(data?.instagram || '');
  setters.setWebsiteTiktok(data?.tiktok || '');
  setters.setWebsiteAddress(data?.address || '');
  setters.setWebsiteFace(data?.face || '');
  setters.setWebsiteLogoUrl(data?.logo_url || '');
  setters.setLogoPreview(data?.logo_url || null);
  setIsLoading(false);
};

export const fetchDeliveryPrices = async (setDeliveryPrices, setIsLoading) => {
  setIsLoading(true);
  const { data, error } = await supabase.from('delivery_prices').select('*');
  if (error) console.error('Error fetching delivery prices:', error);
  setDeliveryPrices(data || []);
  setIsLoading(false);
};

export const uploadImageToSupabase = async (file, folder = 'products') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('productsdata')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage.from('productsdata').getPublicUrl(filePath);

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