import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://havqhypgtrncssxcckdy.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdnFoeXBndHJuY3NzeGNja2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzc2MTIsImV4cCI6MjA3MjY1MzYxMn0.SOM94IwLmSANw_31y-j1a1VLTDMNYY06OcAinUJ9hfk";

const supabase = createClient(supabaseUrl,supabaseAnonKey);
export default supabase;