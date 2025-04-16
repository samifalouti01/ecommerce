// utils/createOrder.js
import { supabase } from '../supabaseClient';

export async function createOrder(orderData) {
  const { data, error } = await supabase.from('orders_data').insert(orderData).select().single();
  if (error) throw error;
  return data;
}
