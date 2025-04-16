// utils/getProducts.js
import { supabase } from '../supabaseClient';

export async function getProducts() {
    const { data, error } = await supabase.from('products_data').select('*');
    if (error) throw error;
    return data;
  }
  
  export async function getProductById(id) {
    const { data, error } = await supabase
      .from('products_data')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
  
  export async function getRelatedProducts(description) {
    const { data, error } = await supabase
      .from('products_data')
      .select('*')
      .ilike('description', `%${description}%`);
    if (error) throw error;
    return data;
  }