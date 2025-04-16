// utils/getDeliveryPrices.js
import { supabase } from '../supabaseClient';

export async function getDeliveryPrices() {
  const { data, error } = await supabase.from('delivery_prices').select('*');
  if (error) throw error;
  return data;
}

export default getDeliveryPrices;