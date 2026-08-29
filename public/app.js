const cfg=window.ZYREX_CONFIG||{};
const ready=cfg.SUPABASE_URL&&cfg.SUPABASE_URL.startsWith("http")&&cfg.SUPABASE_PUBLISHABLE_KEY&&!cfg.SUPABASE_PUBLISHABLE_KEY.startsWith("PASTE");
const sb=ready?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY):null;
let mode="login", user=null;
const $=s=>document.querySelector(s);
const fmt=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));$("#username").classList.toggle("hidden",mode!=="register");$("#authTitle").textContent=mode==="login"?"Selamat datang":"Buat akun";$("#authDesc").textContent=mode==="login"?"Masuk untuk melanjutkan ke dashboard.":"Daftar untuk memulai.";$("#authBtn").textContent=mode==="login"?"Masuk":"Daftar";});
$("#authBtn").onclick=async()=>{if(!sb)return msg("Isi Supabase URL dan Publishable Key di public/config.js.");const email=$("#email").value.trim(),password=$("#password").value;try{if(mode==="login"){const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;user=data.user}else{const username=$("#username").value.trim();const {data,error}=await sb.auth.signUp({email,password,options:{data:{username,display_name:username}}});if(error)throw error;user=data.user}await openApp()}catch(e){msg(e.message)}};
$("#googleBtn").onclick=async()=>{if(!sb)return msg("Isi konfigurasi Supabase dulu.");const {error}=await sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin}});if(error)msg(error.message)};
function msg(t){$("#authMsg").textContent=t}
async function openApp(){const {data}=await sb.auth.getUser();user=data.user;if(!user)return;$("#authView").classList.add("hidden");$("#appView").classList.remove("hidden");const name=user.user_metadata?.display_name||user.user_metadata?.username||user.email.split("@")[0];$("#userName").textContent=name;$("#userEmail").textContent=user.email;$("#userInitial").textContent=name[0].toUpperCase();await loadData()}
async function token(){return (await sb.auth.getSession()).data.session?.access_token}
async function api(path,opt={}){const t=await token();const r=await fetch((cfg.API_BASE||"")+path,{...opt,headers:{Authorization:"Bearer "+t,"Content-Type":"application/json",...(opt.headers||{})}});return r.json()}
async function loadData(){try{const w=await api("/api/wallet");if(w.success){$("#balance").textContent=fmt(w.data.balance);$("#walletBalance").textContent=fmt(w.data.balance)}}catch{}}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showPage(b.dataset.go));
function showPage(id){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.page===id));$("#"+id).classList.add("active");$("#pageTitle").textContent={dashboard:"Dashboard",wallet:"Wallet",topup:"Top Up",withdraw:"Withdraw",transactions:"Riwayat",ai:"ZYREX AI"}[id]}
$("#logoutBtn").onclick=async()=>{await sb.auth.signOut();location.reload()};
$("#sendAi").onclick=()=>{const text=$("#aiInput").value.trim();if(!text)return;const b=document.createElement("div");b.className="bubble user";b.textContent=text;$("#chatMessages").appendChild(b);$("#aiInput").value="";setTimeout(()=>{const r=document.createElement("div");r.className="bubble bot";r.textContent="API AI belum dihubungkan. Nanti endpoint AI akan ditambahkan di backend.";$("#chatMessages").appendChild(r)},350)};
$("#createInvoiceBtn").onclick=()=>$("#invoiceResult").textContent="Endpoint invoice belum diaktifkan sampai provider API dan validasi backend dikonfigurasi.";
$("#withdrawBtn").onclick=()=>$("#withdrawResult").textContent="Endpoint withdraw belum diaktifkan sampai metode dan validasi backend dikonfigurasi.";
(async()=>{if(sb){const {data}=await sb.auth.getSession();if(data.session)openApp()}})();
// V3 enhancements
const txSearch=document.createElement("input");
txSearch.placeholder="Cari transaksi...";
txSearch.className="search-box";
const txPage=document.querySelector("#transactions .panel");
if(txPage){txPage.insertBefore(txSearch,document.querySelector("#txList"));}
async function loadTransactions(){
 try{
  const d=await api("/api/transactions?limit=50");
  if(!d.success)return;
  $("#txCount").textContent=d.data.length;
  const render=(target,items)=>{
   target.innerHTML=items.length?items.map(x=>`<div class="tx"><div><b>${String(x.type||"transaction").toUpperCase()}</b><small>${new Date(x.created_at).toLocaleString("id-ID")}</small></div><div class="tx-right"><b>${fmt(x.amount)}</b><small class="status ${x.status}">${x.status}</small></div></div>`).join(""):"Belum ada transaksi.";
  };
  render($("#txList"),d.data);render($("#recentTx"),d.data.slice(0,5));
  txSearch?.addEventListener("input",()=>render($("#txList"),d.data.filter(x=>JSON.stringify(x).toLowerCase().includes(txSearch.value.toLowerCase()))));
 }catch(e){}
}
const oldLoad=loadData;loadData=async()=>{await oldLoad();await loadTransactions();}
const bell=document.createElement("button");bell.className="bell";bell.textContent="🔔";document.querySelector("header").appendChild(bell);
bell.onclick=()=>alert("Notifikasi: Sistem siap. Integrasi payment dan AI dapat ditambahkan dari backend.");
const theme=document.createElement("button");theme.className="theme";theme.textContent="◐";document.querySelector("header").appendChild(theme);
theme.onclick=()=>document.body.classList.toggle("light");
