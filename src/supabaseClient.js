// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://paspytpzdtuyucttmoif.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc3B5dHB6ZHR1eXVjdHRtb2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTI0NTcsImV4cCI6MjA2MDEyODQ1N30.tSg33Z3oOCXlzv4L5fjrgPO8SG2ADLFoHCFO9fk4rzw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);