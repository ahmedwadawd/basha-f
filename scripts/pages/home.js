
let cat="all",q="",sort="",maxP=0,PMAX=500;
const catName=id=>(CATS.find(c=>c[0]==id)||[])[1]||"";
function render(){const s=q.trim().toLowerCase();let l=products().filter(p=>(cat=="all"||catIn(p.category,cat))&&(!$("of").checked||disc(p)>0||!!promoInfo(p))&&(!$("av").checked||p.available)&&(!maxP||p.price<=maxP)&&(!s||[p.name,p.description,p.weight,p.brand,catName(p.category),catName(parentId(p.category))].join(" ").toLowerCase().includes(s)));
if(sort)l=[...l].sort((a,b)=>sort=="asc"?a.price-b.price:b.price-a.price);
$("grid").innerHTML=l.length?l.map(card).join(""):`<div class="empty" style="grid-column:1/-1"><b style="font-size:20px">مش لاقيين المنتج ده</b><p>جرّب كلمة بحث أخرى أو قسمًا آخر.</p><button class="btn" onclick="reset()">عرض كل المنتجات</button></div>`;
const all=products(),b=all.filter(p=>p.popular).slice(0,4);$("bestG").innerHTML=b.map(card).join("");$("best").style.display=b.length?"":"none";const rv=ld("rv",[]).map(id=>all.find(p=>p.id===id)).filter(Boolean).slice(0,4);$("rvG").innerHTML=rv.map(card).join("");$("rvSec").style.display=rv.length?"":"none";
const lc=liveCats(),tops=lc.filter(c=>!c[3]),tp=parentId(cat)||cat,subs=cat=="all"?[]:lc.filter(c=>c[3]==tp),cb=(i,n,on)=>`<button class="${on?"on":""}" aria-pressed="${on}" onclick="pick('${i}',1)">${esc(n)}</button>`;
$("chips").innerHTML=cb("all","الكل",cat=="all")+tops.map(c=>cb(c[0],c[1],cat!="all"&&tp==c[0])).join("");
$("subchips").innerHTML=subs.length?cb(tp,"الكل",cat==tp)+subs.map(c=>cb(c[0],c[1],cat==c[0])).join(""):"";
const t=totals();if(t.count>(window._lc||0))for(const id of["cartBtn","bCart"]){const e=$(id);e.classList.remove("pulse");void e.offsetWidth;e.classList.add("pulse")}window._lc=t.count;for(const id of["cnt","bcnt"]){$(id).textContent=t.count;$(id).style.display=t.count?"flex":"none"}if($("drw").classList.contains("show"))drawer()}
function pick(i,stay){cat=i;render();if(!stay)$("products").scrollIntoView()}
function reset(){$("of").checked=false;$("av").checked=false;$("mp").value=PMAX;maxP=0;$("mpv").textContent="الكل";q="";$("q").value=$("q2").value="";cat="all";sort="";$("sort").value="";render()}
function search(v){q=v;$("q").value=$("q2").value=v;render();if(v)$("products").scrollIntoView()}
// ---- init
function paintStatic(){const C0=cfg();
$("sname").textContent=$("fname").textContent=C0.name;document.title=C0.name;$("fdesc").textContent=C0.description;
$("ben").innerHTML=C0.benefits.map(([i,a,b])=>`<div>${ic(i,30)}<b>${esc(a)}</b><small>${esc(b)}</small></div>`).join("");
$("fcon").innerHTML=[C0.phone&&`<li><a href="tel:${esc(C0.phone)}">${esc(C0.phone)}</a></li>`,C0.address&&`<li>${esc(C0.address)}</li>`,/^\d{11,15}$/.test(C0.whatsapp)?`<li><a href="https://wa.me/${C0.whatsapp}" target="_blank" rel="noopener">واتساب</a></li>`:"",safeUrl(C0.facebook)&&`<li><a href="${esc(safeUrl(C0.facebook))}" target="_blank" rel="noopener">فيسبوك</a></li>`,safeUrl(C0.instagram)&&`<li><a href="${esc(safeUrl(C0.instagram))}" target="_blank" rel="noopener">إنستجرام</a></li>`].filter(Boolean).join("")||"<li>أضف بيانات التواصل من لوحة التحكم</li>";
$("fpay").textContent="طرق الدفع: "+C0.payments;$("copy").textContent=`© ${new Date().getFullYear()} ${C0.name}. جميع الحقوق محفوظة.`}
paintStatic();
$("si").innerHTML=ic("search",20);$("sBtn").innerHTML=ic("search");$("ci").innerHTML=ic("cart");updateAccBtn();
document.querySelectorAll(".bi").forEach(e=>e.innerHTML=ic(e.dataset.i));
const im=(id,src,ph)=>{const e=$(id);e.onerror=()=>{e.remove()};e.onload=()=>$(ph).remove();e.src=src};im("heroImg",cfg().heroImage,"heroPh");im("offImg",cfg().offerImage,"offPh");
function paintCats(){const T=liveCats().filter(c=>!c[3]);$("tiles").innerHTML=T.map(([i,n])=>`<button class="tile" onclick="pick('${i}')" aria-label="${esc(n)}"><span class="e">${ic("img",34)}</span><img src="assets/images/cat-${i}.jpg" alt="" loading="lazy" onerror="this.remove()"><span>${esc(n)}</span></button>`).join("");
$("fcats").innerHTML=T.map(c=>`<li><a href="#products" onclick="pick('${c[0]}')">${esc(c[1])}</a></li>`).join("")}
$("cartBtn").onclick=$("bCart").onclick=drawer;$("accBtn").onclick=$("bAcc").onclick=()=>openAccount();$("q").oninput=e=>search(e.target.value);$("q2").oninput=e=>search(e.target.value);$("av").onchange=$("of").onchange=render;$("mp").oninput=e=>{maxP=+e.target.value>=PMAX?0:+e.target.value;$("mpv").textContent=maxP?fmt(maxP):"الكل";render()};$("sort").onchange=e=>{sort=e.target.value;render()};
$("sBtn").onclick=()=>{$("ms").classList.toggle("show");$("q2").focus()};
$("drw").onclick=e=>{if(e.target===$("drw"))closeAll()};addEventListener("keydown",e=>{if(e.key=="Escape")closeAll()}); // addEventListener وليس onkeydown: القيمة المعادة false كانت تمنع كتابة أي حرف في كل الحقول
$("grid").innerHTML=$("bestG").innerHTML=Array(4).fill('<div class="card sk-card"><div class="img sk"></div><div class="info"><div class="sk l1"></div><div class="sk l2"></div></div></div>').join("");const io="IntersectionObserver" in window?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{rootMargin:"0px 0px -8% 0px"}):null;document.querySelectorAll("main>section").forEach(e=>{if(io){e.classList.add("rv");io.observe(e)}});Promise.all([initData(),initAuth()]).then(()=>{paintStatic();paintCats();paintOffer();updateAccBtn();if(RECOVERY)openAccount();PMAX=Math.max(10,Math.ceil(Math.max(0,...products().map(p=>p.price))/10)*10);$("mp").max=PMAX;$("mp").value=PMAX;render()});


addEventListener("load",()=>{const v=new URLSearchParams(location.search).get("q");if(v)search(v)});
// بنر العروض يعرض العروض الفعّالة فعلًا فقط (يُخفى إن لم يوجد). الزر يفعّل فلتر «عروض فقط».
function showOffers(){cat="all";$("of").checked=true;render();$("products").scrollIntoView({behavior:"smooth"})}
function paintOffer(){const live=PROMOS.filter(promoLive),b=$("offer"),hl=$("heroOffer");if(hl)hl.style.display=live.length?"":"none";if(!live.length){b.style.display="none";return}
 const m=live.slice().sort((x,y)=>(y.pct||0)-(x.pct||0))[0],lbl=m.kind=="percent"?`خصم ${m.pct}%`:`اشترِ ${m.buy} واحصل على ${m.get} ${m.pct==100?"مجانًا":"بخصم "+m.pct+"%"}`,
  tg=m.product?((products().find(p=>p.id==m.product)||{}).name||""):(catName(m.cat)||"");
 $("offT").textContent=m.name;$("offP").textContent=lbl+(tg?" على "+tg:"")+(live.length>1?` — و${live.length-1} عروض أخرى`:"");b.style.display=""}
