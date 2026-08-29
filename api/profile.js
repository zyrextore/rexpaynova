import {supabase,getUser} from "../lib/supabase.js";
export default async function handler(req,res){
 const user=await getUser(req); if(!user)return res.status(401).json({success:false,message:"Unauthorized"});
 if(req.method==="GET"){const {data,error}=await supabase.from("profiles").select("*").eq("id",user.id).single();return error?res.status(500).json({success:false,message:"Profile error"}):res.json({success:true,data});}
 if(req.method==="PATCH"){const {display_name,username,avatar_url}=req.body||{};const {data,error}=await supabase.from("profiles").update({display_name,username,avatar_url,updated_at:new Date().toISOString()}).eq("id",user.id).select().single();return error?res.status(400).json({success:false,message:error.message}):res.json({success:true,data});}
 return res.status(405).json({success:false,message:"Method not allowed"});
}