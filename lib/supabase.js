import { createClient } from "@supabase/supabase-js";
export const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY);
export async function getUser(req){const h=req.headers.authorization||"";if(!h.startsWith("Bearer "))return null;const {data,error}=await supabase.auth.getUser(h.slice(7));return error?null:data.user;}