import {supabase,getUser} from "../lib/supabase.js";
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({success:false,message:"Method not allowed"});
 const user=await getUser(req);if(!user)return res.status(401).json({success:false,message:"Unauthorized"});
 const limit=Math.min(Number(req.query.limit||20),100);
 const {data,error}=await supabase.from("transactions").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(limit);
 return error?res.status(500).json({success:false,message:"Transaction error"}):res.json({success:true,data});
}