// ===== نافذة «حسابي» المشتركة بين كل الصفحات =====
// زائر (مع Supabase): دخول / حساب جديد / نسيت كلمة المرور. عميل مسجّل: بياناته ورقم العميل وطلباته. بلا Supabase: ملف محلي على الجهاز.
const AV={open:false,tab:"acct",mode:"login",orders:null,busy:false,msg:""};
function ensureAcc(){if($("acc"))return;const d=document.createElement("div");d.className="ov";d.id="acc";d.innerHTML='<div class="sheet" id="accBox" role="dialog" aria-modal="true" aria-label="حسابي" tabindex="-1"></div>';d.onclick=e=>{if(e.target===d)closeAcc()};document.body.append(d)}
function openAccount(tab){ensureAcc();AV.open=true;if(tab)AV.tab=tab;AV.mode=RECOVERY?"recover":(AV.mode=="recover"?"login":AV.mode);AV.orders=null;drawAccount();$("acc").classList.add("show");$("accBox").focus({preventScroll:true})}
function closeAcc(){AV.open=false;const e=$("acc");e&&e.classList.remove("show")}
addEventListener("keydown",e=>{if(e.key=="Escape"&&AV.open)closeAcc()});
function updateAccBtn(){const on=!!(ME&&!ME.local),first=on&&ME.name?ME.name.trim().split(/\s+/)[0].slice(0,12):"";const b=$("accBtn");if(b){b.innerHTML=ic("user",20)+esc(first||"حسابي");b.classList.toggle("in",on)}}
function authChanged(){updateAccBtn();if(AV.open){AV.orders=null;drawAccount()}if(typeof onAuth=="function")onAuth()}
const accErr=m=>{const e=$("ac_err");if(e)e.textContent=m||""};
const accBusy=(v,t)=>{AV.busy=v;const b=$("ac_btn");if(b){b.disabled=v;if(t)b.dataset.t=b.dataset.t||b.textContent;b.textContent=v?"جارٍ التنفيذ…":(b.dataset.t||b.textContent)}};
function accTab(t){AV.tab=t;AV.msg="";drawAccount()}
function accMode(m){AV.mode=m;AV.msg="";drawAccount()}
const govOpts=sel=>{const l=[...activeGovs()];if(sel&&!l.includes(sel))l.push(sel);return `<option value="">اختر المحافظة</option>`+l.map(g=>`<option ${g==sel?"selected":""}>${esc(g)}</option>`).join("")};
function drawAccount(){ensureAcc();const rec=RECOVERY&&AV.mode=="recover",real=ME&&!ME.local;
 const tabs=[["acct",real||!sb?"بياناتي":"الدخول"],["orders","طلباتي"],["fav","المفضلة"]];
 const idb=real?`<div class="row" style="margin-bottom:12px;align-items:flex-start"><div><b style="font-size:17px">${esc(ME.name||"عميلنا العزيز")}</b><br><span class="cid" title="رقم العميل">${custNo(ME.no)}</span></div><button class="sm r" onclick="accOut()">تسجيل الخروج</button></div>`:"";
 const seg=`<div class="seg">${tabs.map(([k,n])=>`<button class="${AV.tab==k?"on":""}" aria-pressed="${AV.tab==k}" onclick="accTab('${k}')">${n}</button>`).join("")}</div>`;
 $("accBox").innerHTML=`<div class="pad row"><h2>حسابي</h2><button class="ib" onclick="closeAcc()" aria-label="إغلاق">${ic("x",18)}</button></div><div class="pad" style="padding-top:0">${rec?recoverHTML():idb+seg+(AV.tab=="acct"?acctHTML():AV.tab=="orders"?ordersHTML():favHTML())}</div>`;
 if(!rec&&AV.tab=="orders"&&AV.orders===null)loadOrdersTab()}
// ---------- بياناتي / الدخول ----------
function acctHTML(){if(!sb||ME)return profileHTML();return AV.mode=="signup"?signupHTML():AV.mode=="forgot"?forgotHTML():loginHTML()}
function profileHTML(){const m=ME||{name:"",phone:"",gov:"",area:"",address:""};
 return `${!sb?`<p class="box note" style="font-size:14px">بياناتك هنا محفوظة <b>على هذا الجهاز فقط</b> لتعبئة الطلب تلقائيًا. الحساب برقم عميل وسجل الطلبات من أي جهاز يحتاج ربط المتجر بقاعدة البيانات.</p>`:""}
<form id="ac_f" novalidate onsubmit="accSave(event)"><label>الاسم<input id="ac_name" autocomplete="name" value="${esc(m.name)}"></label>
<label>رقم الموبايل<input id="ac_phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="01XXXXXXXXX" value="${esc(m.phone)}"></label>
<div class="two"><label>المحافظة<select id="ac_gov">${govOpts(m.gov)}</select></label><label>المنطقة<input id="ac_area" value="${esc(m.area)}" placeholder="مثال: سموحة"></label></div>
<label>العنوان بالتفصيل<textarea id="ac_address" autocomplete="street-address">${esc(m.address)}</textarea></label>
${m.email?`<p class="hint" style="margin:-4px 0 10px">البريد: <bdi>${esc(m.email)}</bdi></p>`:""}<p class="err" id="ac_err" role="alert"></p><button class="btn full" id="ac_btn">حفظ بياناتي</button>
<span class="hint" style="margin-top:8px">تُعبَّأ هذه البيانات تلقائيًا في صفحة إتمام الطلب، وتقدر تراجعها وتعدّلها قبل التأكيد.</span></form>`}
async function accSave(e){e.preventDefault();if(AV.busy)return;accErr("");accBusy(true);
 const r=await saveProfile({name:$("ac_name").value,phone:$("ac_phone").value,gov:$("ac_gov").value,area:$("ac_area").value,address:$("ac_address").value});accBusy(false);
 if(r.error)return accErr(r.error);toast("تم حفظ بياناتك");updateAccBtn();drawAccount();if(typeof onAuth=="function")onAuth()}
function loginHTML(){return `<p class="hint" style="margin:0 0 12px">الشراء بدون حساب متاح دائمًا. الحساب يحفظ بياناتك وعنوانك ويعرض طلباتك من أي جهاز.</p>
<div class="seg"><button class="on" type="button">دخول</button><button type="button" onclick="accMode('signup')">حساب جديد</button></div>${AV.msg?`<p class="box note" style="font-size:14px">${esc(AV.msg)}</p>`:""}
<form id="ac_f" novalidate onsubmit="accLogin(event)"><label>البريد الإلكتروني<input id="ac_email" type="email" autocomplete="username" dir="ltr" style="text-align:start"></label>
<label>كلمة المرور<input id="ac_pw" type="password" autocomplete="current-password" dir="ltr" style="text-align:start"></label><p class="err" id="ac_err" role="alert"></p><button class="btn full" id="ac_btn">دخول</button>
<button type="button" class="sm" style="margin-top:10px;border:0;background:none;text-decoration:underline" onclick="accMode('forgot')">نسيت كلمة المرور؟</button></form>`}
function signupHTML(){return `<div class="seg"><button type="button" onclick="accMode('login')">دخول</button><button class="on" type="button">حساب جديد</button></div>
<form id="ac_f" novalidate onsubmit="accSignup(event)"><label>الاسم<input id="ac_name" autocomplete="name"></label>
<label>رقم الموبايل<input id="ac_phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="01XXXXXXXXX"></label>
<label>البريد الإلكتروني<input id="ac_email" type="email" autocomplete="username" dir="ltr" style="text-align:start"></label>
<label>كلمة المرور<input id="ac_pw" type="password" autocomplete="new-password" dir="ltr" style="text-align:start"><span class="hint">8 أحرف على الأقل</span></label>
<p class="err" id="ac_err" role="alert"></p><button class="btn full" id="ac_btn">إنشاء الحساب</button><span class="hint" style="margin-top:8px">سيُنشأ لك رقم عميل خاص بك تلقائيًا، ويبقى ثابتًا في كل مرة تدخل فيها.</span></form>`}
function forgotHTML(){return `<form id="ac_f" novalidate onsubmit="accForgot(event)"><p style="margin-bottom:12px">اكتب بريدك وسنرسل لك رابطًا لتعيين كلمة مرور جديدة.</p><label>البريد الإلكتروني<input id="ac_email" type="email" dir="ltr" style="text-align:start"></label>
<p class="err" id="ac_err" role="alert"></p><button class="btn full" id="ac_btn">إرسال الرابط</button><button type="button" class="btn g full" style="margin-top:8px" onclick="accMode('login')">رجوع</button></form>`}
function recoverHTML(){return `<form id="ac_f" novalidate onsubmit="accRecover(event)"><p style="margin-bottom:12px"><b>تعيين كلمة مرور جديدة</b></p><label>كلمة المرور الجديدة<input id="ac_pw" type="password" autocomplete="new-password" dir="ltr" style="text-align:start"><span class="hint">8 أحرف على الأقل</span></label><p class="err" id="ac_err" role="alert"></p><button class="btn full" id="ac_btn">حفظ كلمة المرور</button></form>`}
const okMail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
async function accLogin(e){e.preventDefault();if(AV.busy)return;accErr("");const em=$("ac_email").value.trim(),pw=$("ac_pw").value;
 if(!okMail(em))return accErr("اكتب بريدًا إلكترونيًا صحيحًا");if(!pw)return accErr("اكتب كلمة المرور");accBusy(true);const r=await signIn(em,pw);accBusy(false);if(r.error)return accErr(r.error);toast("أهلًا بعودتك");afterAuth()}
async function accSignup(e){e.preventDefault();if(AV.busy)return;accErr("");const name=$("ac_name").value.trim(),phone=normPhone($("ac_phone").value),em=$("ac_email").value.trim(),pw=$("ac_pw").value;
 if(name.length<2)return accErr("اكتب اسمك");if(!okPhone(phone))return accErr("اكتب رقم موبايل مصري صحيح (11 رقم)");if(!okMail(em))return accErr("اكتب بريدًا إلكترونيًا صحيحًا");if(pw.length<8)return accErr("كلمة المرور 8 أحرف على الأقل");
 accBusy(true);const r=await signUp({name,phone,email:em,password:pw});accBusy(false);if(r.error)return accErr(r.error);
 if(r.confirm){AV.mode="login";AV.msg="تم إنشاء حسابك. أرسلنا رابط تأكيد إلى بريدك — افتحه ثم سجّل الدخول.";return drawAccount()}toast("تم إنشاء حسابك");afterAuth()}
async function accForgot(e){e.preventDefault();if(AV.busy)return;accErr("");const em=$("ac_email").value.trim();if(!okMail(em))return accErr("اكتب بريدًا إلكترونيًا صحيحًا");
 accBusy(true);const r=await sendReset(em);accBusy(false);if(r.error)return accErr(r.error);AV.mode="login";AV.msg="لو البريد مسجّل لدينا فسيصلك رابط تعيين كلمة المرور خلال دقائق.";drawAccount()}
async function accRecover(e){e.preventDefault();if(AV.busy)return;accErr("");const pw=$("ac_pw").value;if(pw.length<8)return accErr("كلمة المرور 8 أحرف على الأقل");
 accBusy(true);const r=await setNewPassword(pw);accBusy(false);if(r.error)return accErr(r.error);toast("تم تغيير كلمة المرور");AV.mode="login";afterAuth()}
function afterAuth(){AV.tab="acct";AV.mode="login";AV.orders=null;updateAccBtn();drawAccount();if(typeof onAuth=="function")onAuth()}
async function accOut(){await signOutUser();AV.tab="acct";AV.mode="login";AV.orders=null;updateAccBtn();drawAccount();toast("تم تسجيل الخروج");if(typeof onAuth=="function")onAuth()}
// ---------- طلباتي ----------
async function loadOrdersTab(){AV.orders={loading:true};drawAccount();AV.orders=await myOrders();if(AV.open&&AV.tab=="orders")drawAccount()}
function orderLine(o){return o.items?o.items.map(i=>`${i.qty}× ${esc(i.name)}`).join("، "):esc(o.itemsText||"")}
function ordersHTML(){const O=AV.orders;if(!O||O.loading)return '<p class="empty">جارٍ تحميل طلباتك…</p>';if(O.error)return `<p class="err">${esc(O.error)}</p><button class="sm" onclick="AV.orders=null;drawAccount()">إعادة المحاولة</button>`;
 const hint=sb&&!ME?'<p class="box note" style="font-size:14px">هذه الطلبات محفوظة على هذا الجهاز فقط. سجّل الدخول لمتابعة كل طلباتك من أي جهاز.</p>':"";
 return hint+(O.list.length?O.list.slice(0,20).map((o,i)=>`<div class="ord"><div class="row"><b>${esc(o.code)}</b>${o.status?`<span class="stt ${esc(o.status)}">${esc(ORDER_ST[o.status]||o.status)}</span>`:""}</div>
<small class="hint" style="margin:0">${o.created_at?new Date(o.created_at).toLocaleString("ar-EG"):esc(o.date||"")}${o.address?` · ${esc(o.governorate||"")} - ${esc(o.area||"")}`:""}${o.slot_label?` · ${esc(o.slot_label)}`:""}</small><p>${orderLine(o)}</p>
<div class="row"><b>${fmt(o.total_cents/100)}</b>${(o.items||o.lines)?`<button class="sm" onclick="accReorder(${i})">أعد الطلب</button>`:""}</div></div>`).join(""):'<p class="empty">لا توجد طلبات بعد.</p>')+(sb?`<p style="margin-top:10px"><a class="sm" href="${PAGES}track.html">تتبع طلب برقمه</a></p>`:"")}
function accReorder(i){const o=AV.orders&&AV.orders.list&&AV.orders.list[i];if(!o)return;const lines=(o.items?o.items.map(x=>({id:x.id,qty:x.qty})):o.lines||[]).filter(l=>l.id);let n=0;
 lines.forEach(l=>{const p=products().find(x=>x.id==l.id);if(p&&p.available){setQty(p.id,Math.min((getCart()[p.id]||0)+l.qty,p.stock||99));n++}});closeAcc();typeof refresh=="function"&&refresh();toast(n?"أُعيدت المنتجات المتاحة إلى السلة":"المنتجات غير متاحة حاليًا");if(n&&typeof drawer=="function")drawer()}
// ---------- المفضلة ----------
function favHTML(){const w=products().filter(p=>wish().includes(p.id));return w.length?`<ul class="items">${w.map(p=>`<li><div class="th">${thumb(p)}</div><div style="flex:1"><b>${esc(p.name)}</b><br><span class="price" style="font-size:15px">${fmt(p.price)}</span></div><button class="sm y" ${p.available?"":"disabled"} onclick="accAdd(${p.id})">أضف</button></li>`).join("")}</ul>`:'<p class="empty">لا توجد منتجات مفضلة بعد.</p>'}
function accAdd(id){setQty(id,(getCart()[id]||0)+1);toast("تمت إضافة المنتج للسلة");typeof refresh=="function"&&refresh()}
