// utils/getWebsiteInfo.js
import { supabase } from '../supabaseClient';

export async function getWebsiteInfo() {
  const { data, error } = await supabase.from('website').select('*').single();
  if (error) throw error;
  return data;
}

export default getWebsiteInfo;