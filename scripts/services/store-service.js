const ld=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{alert("المساحة امتلأت، استخدم صور أصغر");return false}};
const cfg=()=>({...DEF_CFG,...(sb?{}:ld("cfg",{})),...(_S||{})}); // مع قاعدة البيانات تُتجاهل إعدادات المتصفح المحلية
// توحيد رقم الموبايل: أرقام عربية/فارسية، مسافات وشرطات، +20 / 0020 / 20 → 01XXXXXXXXX
const normPhone=v=>{let s=String(v||"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[\s\-().]/g,"");if(s.startsWith("+20"))s="0"+s.slice(3);else if(s.startsWith("0020"))s="0"+s.slice(4);else if(/^20\d{10}$/.test(s))s="0"+s.slice(2);return s};
const safeUrl=u=>/^https?:\/\//i.test(String(u||""))?String(u):"";
const okPhone=v=>/^01[0125]\d{8}$/.test(v);
const custNo=n=>"C-"+String(n).padStart(5,"0");
const wish=()=>ld("wish",[]);const toggleWish=id=>{const w=wish(),i=w.indexOf(id);i<0?w.push(id):w.splice(i,1);sv("wish",w);return i<0};
const PK="products_v2";
const products=()=>_P||(sb?[]:(Array.isArray(ld(PK,null))?ld(PK,null):DEF_PRODUCTS));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>`${n} ${cfg().currency}`;
const disc=p=>p.oldPrice>p.price?Math.round((1-p.price/p.oldPrice)*100):0;
const thumb=p=>p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<span class="ph-ic" role="img" aria-label="${esc(p.name)}">${ic("img",34)}</span>`;
function getCart(){const c=ld("cart",{}),all=products(),o={};for(const k in c){const p=all.find(x=>x.id==k);if(p&&p.available&&c[k]>0)o[k]=Math.min(c[k],p.stock||99)}return o}
function setQty(id,q){const c=getCart(),p=products().find(x=>x.id==id);if(!p||!p.available)return;q=Math.min(q,p.stock||99);q>0?c[id]=q:delete c[id];sv("cart",c)}
function cartItems(){const c=getCart();return products().filter(p=>c[p.id]).map(p=>({...p,qty:c[p.id]}))}
// عرض فعّال الآن؟ (يطابق شروط الخادم: active وتاريخ البداية/النهاية) — والخادم هو المرجع النهائي عند الطلب
const promoLive=m=>m.active!==false&&(m.starts==null||m.starts<=Date.now())&&(m.ends==null||m.ends>Date.now());
const promoHits=(m,p)=>m.product==p.id||(m.cat&&(m.cat==p.category||m.cat==parentId(p.category)));
function promoDisc(i){if(i.weightPriced)return{d:0};const pc=Math.round(i.price*100);let b={d:0};for(const m of PROMOS){if(!promoLive(m)||!promoHits(m,i))continue;const d=m.kind=="percent"?Math.floor(pc*i.qty*m.pct/100):Math.floor(pc*Math.floor(i.qty/(m.buy+m.get))*m.get*m.pct/100);if(d>b.d)b={d:d/100,name:m.name}}return b.d?{d:b.d,name:b.name}:{d:0}}
// أفضل عرض فعّال على المنتج: {label,name,price} — price = سعر الوحدة بعد خصم النسبة (نفس معادلة الخادم)، وnull لعروض «اشترِ واحصل»
function promoInfo(p){if(p.weightPriced)return null;let b=null,bd=0;for(const m of PROMOS){if(!promoLive(m)||!promoHits(m,p))continue;const q=m.kind=="percent"?1:m.buy+m.get,d=promoDisc({...p,qty:q}).d/q;if(d>bd||!b){b=m;bd=d}}if(!b)return null;return{name:b.name,label:b.kind=="percent"?`خصم ${b.pct}%`:`اشترِ ${b.buy} واحصل على ${b.get} ${b.pct==100?"مجانًا":"بخصم "+b.pct+"%"}`,price:b.kind=="percent"?Math.round((p.price*100-Math.floor(p.price*100*b.pct/100)))/100:null}}
const lineTotal=(p,q)=>Math.round((p.price*q-promoDisc({...p,qty:q}).d)*100)/100;
const promoLabel=p=>{const i=promoInfo(p);return i?i.label:""};
function totals(items=cartItems()){const C=cfg(),sub=items.reduce((s,i)=>s+i.price*i.qty,0),saved=items.reduce((s,i)=>s+(Math.max(i.oldPrice,i.price)-i.price)*i.qty,0),disc=Math.round(items.reduce((s,i)=>s+promoDisc(i).d,0)*100)/100,net=sub-disc;
const z=window.GOV?zoneFor(window.GOV,window.AREA):null,blocked=!!(window.GOV&&sb&&!z),fee=z?+z.fee:+C.deliveryFee,freeAbove=z&&z.freeOver!=null?+z.freeOver:+C.freeDeliveryAbove,min=z&&z.min!=null?+z.min:+C.minimumOrder;
const free=items.length>0&&freeAbove>0&&net>=freeAbove,delivery=items.length&&!free?fee:0;
return{sub,saved,disc,free,delivery,total:net+delivery,count:items.reduce((s,i)=>s+i.qty,0),blocked,min,freeAbove}}
function summaryHTML(){const t=totals(),C=cfg();return `<div class="sum"><div><span>المجموع الفرعي</span><span>${fmt(t.sub)}</span></div>${t.saved?`<div class="free"><span>وفّرت</span><span>${fmt(t.saved)}</span></div>`:""}${t.disc?`<div class="free"><span>خصم العروض</span><span>- ${fmt(t.disc)}</span></div>`:""}<div><span>التوصيل</span><span ${t.free?'class="free"':""}>${t.free?"التوصيل مجاني":fmt(t.delivery)}</span></div>${!t.free&&t.freeAbove>0&&t.sub>0?`<div class="prog" aria-hidden="true"><i style="width:${Math.min(100,Math.round((t.sub-t.disc)/t.freeAbove*100))}%"></i></div><small style="color:var(--mut)">أضف ${fmt(t.freeAbove-t.sub+t.disc)} للتوصيل المجاني</small>`:""}${t.blocked?'<p class="err">لا نغطي هذه المحافظة حاليًا</p>':""}${cartItems().some(i=>i.weightPriced)?'<small style="color:var(--mut)">الإجمالي تقريبي: بعض المنتجات تُسعَّر بالوزن الفعلي</small>':""}<div class="t"><span>الإجمالي</span><span>${fmt(t.total)}</span></div></div>`}
function toast(m,bad){let t=document.getElementById("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");document.body.append(t)}t.textContent=m;t.classList.toggle("bad",!!bad);t.classList.add("show");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),bad?3400:1800)}
// ---- أقسام هرمية: CATS = [id, الاسم, رمز, القسم الأب]
const catById=id=>CATS.find(c=>c[0]==id),parentId=id=>(catById(id)||[])[3]||"";
const catIn=(pc,sel)=>pc==sel||parentId(pc)==sel; // المنتج داخل القسم المختار أو أحد فروعه
function liveCats(){const u=new Set(products().map(p=>p.category));return CATS.filter(c=>c[3]?u.has(c[0]):(u.has(c[0])||CATS.some(s=>s[3]==c[0]&&u.has(s[0]))))} // الأقسام غير الفارغة فقط
// ---- مناطق التوصيل (من جدول delivery_zones): منطقة فعّالة محددة أولًا ثم المحافظة كلها. بلا Supabase (وضع تجريبي محلي) كل المحافظات متاحة.
const normA=s=>String(s||"").trim().toLowerCase();
const zoneFor=(g,a)=>ZONES.find(z=>z.active&&z.governorate==g&&z.area&&normA(z.area)==normA(a))||ZONES.find(z=>z.active&&z.governorate==g&&!z.area)||null;
const activeGovs=()=>sb?[...new Set(ZONES.filter(z=>z.active).map(z=>z.governorate))].sort((a,b)=>a=="الإسكندرية"?-1:b=="الإسكندرية"?1:a.localeCompare(b,"ar")):GOVS;
const govAreas=g=>ZONES.filter(z=>z.active&&z.governorate==g&&z.area);
const govWide=g=>ZONES.some(z=>z.active&&z.governorate==g&&!z.area);
