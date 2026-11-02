// ===== إتمام الطلب =====
// الزائر: شراء كضيف (يُحفظ آخر نموذج على الجهاز للتسهيل). العميل المسجّل: تُعبَّأ بياناته المحفوظة تلقائيًا، ويُربط الطلب بحسابه على الخادم
// (place_order يقرأ هوية الجلسة بنفسه — لا يُرسَل أي معرّف عميل من المتصفح). يمكن مراجعة البيانات وتعديلها قبل التأكيد.
const F={name:"",phone:"",gov:"",area:"",address:"",notes:""};
Object.assign(F,ld("form",{}));
let SL={},HAS_SLOTS=false,RES="",busy=false,SAVEP=null;
const real=()=>!!(ME&&!ME.local);
const gov=()=>{const l=activeGovs();return l.includes(F.gov)?F.gov:(l[0]||"")};
// حقل المنطقة: قائمة اختيار إن كانت المحافظة تُغطّي مناطق محددة فقط، وإلا حقل كتابة مع اقتراحات المناطق ذات الرسوم الخاصة
function areaField(){const g=gov(),as=govAreas(g);if(as.length&&!govWide(g))return `<label>المنطقة<select id="area">${as.map(z=>`<option value="${esc(z.area)}" ${normA(z.area)==normA(F.area)?"selected":""}>${esc(z.area)} — ${fmt(z.fee)}</option>`).join("")}</select><span class="err" id="e_area"></span></label>`;
 return `<label>المنطقة<input id="area" placeholder="مثال: سموحة" value="${esc(F.area)}" ${as.length?'list="arealist"':""}>${as.length?`<datalist id="arealist">${as.map(z=>`<option value="${esc(z.area)}">رسوم التوصيل ${fmt(z.fee)}</option>`).join("")}</datalist>`:""}<span class="err" id="e_area"></span></label>`}
const errText=e=>{const m=String((e&&e.message)||e||"");return/[\u0600-\u06FF]/.test(m)?m:(!navigator.onLine||/fetch|network/i.test(m)?"تعذر الاتصال بالخادم، لم يُرسل الطلب. تحقق من الإنترنت وحاول مرة أخرى.":"تعذر إتمام الطلب، حاول مرة أخرى.")};
function readForm(){if(!$("f"))return;for(const k in F){const e=$(k);if(e)F[k]=e.value.trim()}}
// تعبئة الحقول من الملف المحفوظ: حساب حقيقي = بياناته تتفوق على المسودة، ملف محلي = يملأ الفارغ فقط
function applyProfile(force){if(!ME)return;for(const [k,v] of[["name",ME.name],["phone",ME.phone],["gov",ME.gov],["area",ME.area],["address",ME.address]])if(v&&(force||!F[k]))F[k]=v}
// يستدعيها account.js عند الدخول/الخروج/حفظ البيانات
function onAuth(){readForm();if(ME)applyProfile(real());else{for(const k in F)F[k]="";localStorage.removeItem("form")}SAVEP=null;if($("f")||$("app").querySelector("#go"))form()}
const wantSave=()=>real()&&(SAVEP===null?!ME.address:SAVEP);
function empty(){$("app").innerHTML='<div class="empty"><b style="font-size:20px">السلة فاضية</b><p>ابدأ بإضافة المنتجات اللي محتاجها.</p><a class="btn" href="../index.html">تصفح المنتجات</a></div>'}
function accountBanner(){if(!sb)return"";
 if(real())return `<div class="box note"><div class="row"><span>تشتري بحسابك: <b>${esc(ME.name||"")}</b></span><span class="cid">${custNo(ME.no)}</span></div><small class="hint">بياناتك المحفوظة مُعبّأة تلقائيًا — راجعها وعدّلها قبل التأكيد.</small></div>`;
 return `<div class="box note row" style="flex-wrap:wrap"><span>عندك حساب؟ سجّل الدخول لتعبئة بياناتك تلقائيًا. أو كمّل كضيف.</span><button type="button" class="sm y" onclick="openAccount()">دخول / حساب جديد</button></div>`}
function saveBox(){if(!real())return"";const diff=ME.address&&F.address&&F.address!==ME.address;
 return `<label class="opt"><input type="checkbox" id="savep" ${wantSave()?"checked":""} onchange="SAVEP=this.checked"><span>احفظ هذه البيانات كعنواني الأساسي في حسابي<small class="hint">${ME.address?(diff?"العنوان مختلف عن المحفوظ في حسابك؛ بدون التفعيل يُستخدم لهذا الطلب فقط.":"فعّلها إن غيّرت عنوانك وتريد حفظه."):"ليُعبَّأ تلقائيًا في طلباتك القادمة."}</small></span></label>`}
function form0(){const it=cartItems();if(!it.length)return empty();
 if(sb&&!activeGovs().length){$("h").textContent="إتمام الطلب";$("app").innerHTML='<div class="empty"><b style="font-size:20px">التوصيل غير متاح حاليًا</b><p>لا توجد مناطق توصيل مفعّلة الآن. حاول لاحقًا أو تواصل مع المتجر.</p><a class="btn" href="../index.html">العودة للمتجر</a></div>';return}
 $("h").textContent="إتمام الطلب";
 $("app").innerHTML=`${accountBanner()}<form id="f" novalidate class="box"><label>الاسم<input id="name" autocomplete="name" placeholder="اكتب اسمك" value="${esc(F.name)}"><span class="err" id="e_name"></span></label>
<label>رقم الموبايل<input id="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="01XXXXXXXXX" value="${esc(F.phone)}"><span class="err" id="e_phone"></span></label>
<label>المحافظة<select id="gov">${activeGovs().map(g=>`<option ${g==gov()?"selected":""}>${esc(g)}</option>`).join("")}</select></label>
<div id="areabox">${areaField()}</div>
<label>العنوان بالتفصيل<textarea id="address" autocomplete="street-address">${esc(F.address)}</textarea><span class="err" id="e_address"></span></label>
<label>ملاحظات (اختياري)<textarea id="notes">${esc(F.notes)}</textarea></label>${saveBox()}
<div id="slots"></div><p class="box" style="background:var(--g-100);box-shadow:none">طريقة الدفع: <b>الدفع عند الاستلام (كاش)</b></p><div id="sumbox">${summaryHTML()}</div><br><button class="btn full">مراجعة الطلب</button></form>`;
 $("f").onsubmit=submitForm;const g=$("gov");const syncArea=()=>{const a=$("area");window.AREA=a?a.value.trim():"";F.area=window.AREA;$("sumbox").innerHTML=summaryHTML()};
 g.onchange=()=>{F.gov=g.value;window.GOV=g.value;F.area="";$("areabox").innerHTML=areaField();const a=$("area");a.oninput=a.onchange=syncArea;syncArea()};
 {const a=$("area");if(a){a.oninput=a.onchange=syncArea;window.AREA=a.value.trim()}}
 const ad=$("address");if(ad&&$("savep"))ad.oninput=()=>{F.address=ad.value.trim();const h=$("savep").parentNode.querySelector(".hint");if(h&&ME.address)h.textContent=F.address&&F.address!==ME.address?"العنوان مختلف عن المحفوظ في حسابك؛ بدون التفعيل يُستخدم لهذا الطلب فقط.":"فعّلها إن غيّرت عنوانك وتريد حفظه."}}
function submitForm(e){e.preventDefault();readForm();F.phone=normPhone(F.phone);$("phone").value=F.phone;const er={};
 if(F.name.length<2)er.name="اكتب اسمك";if(!okPhone(F.phone))er.phone="اكتب رقم موبايل مصري صحيح (11 رقم)";if(!F.area)er.area="اكتب المنطقة";else if(sb&&!govWide(gov())&&!zoneFor(gov(),F.area))er.area="اختر المنطقة من القائمة";if(F.address.length<5)er.address="اكتب العنوان بالتفصيل";
 for(const k of["name","phone","area","address"]){$("e_"+k).textContent=er[k]||"";$(k).classList.toggle("bad",!!er[k])}
 if(Object.keys(er).length){const f=$(Object.keys(er)[0]);f&&f.focus();return}
 window.GOV=gov();window.AREA=F.area;const t=totals();if(t.blocked)return alert("لا نغطي هذه المنطقة حاليًا");if(t.sub-t.disc<t.min)return alert("الحد الأدنى للطلب في هذه المحافظة "+fmt(t.min));
 if(HAS_SLOTS&&!SL.slot){$("se").textContent="اختر موعد التوصيل";return}
 if(!real())sv("form",F);reserveThenReview()}
function review(){const it=cartItems();$("h").textContent="مراجعة الطلب";
 $("app").innerHTML=`<div class="box"><ul class="items" style="margin:0">${it.map(i=>`<li class="row"><span>${i.qty} × ${esc(i.name)}</span><b>${fmt(i.qty*i.price)}</b></li>`).join("")}</ul></div><div class="box">${summaryHTML()}</div>
<div class="box">${real()?`<span class="cid" style="margin-bottom:6px">${custNo(ME.no)}</span><br>`:""}<b>${esc(F.name)}</b> — ${esc(F.phone)}<br>${esc(gov())} - ${esc(F.area)}<br>${esc(F.address)}${F.notes?`<br>ملاحظات: ${esc(F.notes)}`:""}${SL.label?`<br>موعد التوصيل: ${esc(SL.label)}`:""}<br>الدفع: الدفع عند الاستلام${wantSave()?'<br><small class="hint">سيُحفظ هذا العنوان وبياناتك في حسابك.</small>':real()&&ME.address&&F.address!==ME.address?'<br><small class="hint">هذا العنوان لهذا الطلب فقط — عنوان حسابك لن يتغير.</small>':""}</div>
${sb&&RES?`<p class="box note">تم حجز الكميات لك حتى الساعة ${RES}. أكّد الطلب قبل ذلك.</p>`:""}<button class="btn ok full" id="go">تأكيد الطلب</button><button class="btn g full" style="margin-top:8px" onclick="form()">تعديل البيانات</button>`;$("go").onclick=send}
async function send(){if(busy)return;const C=cfg(),it=cartItems();let t=totals(),no="#ORD-"+Math.floor(10000+Math.random()*90000);
 if(sb){
  // الجلسة قد تنتهي أثناء الشراء: لا نُرسل الطلب كضيف بالخطأ بينما العميل يظن أنه مسجَّل
  if(real()){try{const {data:{session}}=await sb.auth.getSession();if(!session){ME=null;authChanged();alert("انتهت جلستك. سجّل الدخول مرة أخرى أو أكمل كضيف.");return form()}}catch(e){}}
  busy=true;$("go").disabled=true;$("go").textContent="جارٍ إرسال الطلب…";const k=okey();
  let r;try{r=await sb.rpc("place_order",{p_items:it.map(i=>({id:i.id,qty:i.qty})),p_name:F.name,p_phone:F.phone,p_gov:gov(),p_area:F.area,p_address:F.address,p_notes:F.notes,p_key:k,p_slot_id:SL.slot||null,p_date:SL.date||null,p_save_profile:wantSave()})}catch(e){r={error:e}}
  busy=false;const {data,error}=r;
  if(error||!data||!data[0]){$("go").disabled=false;$("go").textContent="تأكيد الطلب";return alert(error?errText(error):"تعذر إنشاء الطلب")}
  sessionStorage.removeItem("ok");no=data[0].code;t={...t,total:data[0].total_cents/100,delivery:data[0].delivery_cents/100,free:data[0].delivery_cents==0};
  if(real()){loadProfile().then(()=>{AV.orders=null})}   // الخادم حفظ الطلب وربطه بالحساب؛ نحدّث بيانات الحساب المعروضة
 }else if(!/^\d{11,15}$/.test(C.whatsapp))return alert("رقم واتساب المتجر لم يُضبط بعد.");
 if(!/^\d{11,15}$/.test(C.whatsapp)){sv("cart",{});return alert("تم تسجيل طلبك رقم "+no+" لكن رقم واتساب المتجر غير مضبوط.")}
 const msg=` طلب جديد\nرقم الطلب: ${no}${real()?`\nرقم العميل: ${custNo(ME.no)}`:""}\n\nاسم العميل: ${F.name}\nرقم الهاتف: ${F.phone}\n\nالعنوان:\n${gov()} - ${F.area}\n${F.address}\n\nالطلب:\n\n${it.map(i=>`${i.qty} × ${i.name}${i.weight?" ("+i.weight+")":""}\n${i.price*i.qty} ${C.currency}`).join("\n\n")}\n\nالمجموع الفرعي:\n${t.sub} ${C.currency}${t.disc?`\n\nخصم العروض:\n-${t.disc} ${C.currency}`:""}\n\nالتوصيل:\n${t.free?"مجاني":t.delivery+" "+C.currency}\n\nالإجمالي:\n${t.total} ${C.currency}${it.some(i=>i.weightPriced)?"\n(تقريبي، يُحدَّد بالوزن الفعلي)":""}\n\nطريقة الدفع:\nالدفع عند الاستلام (كاش)${SL.label?`\n\nموعد التوصيل:\n${SL.label}`:""}${F.notes?`\n\nملاحظات:\n${F.notes}`:""}`;
 const url=`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
 if(!real()){const o=ld("orders",[]);o.unshift({lines:it.map(i=>({id:i.id,qty:i.qty})),no,date:new Date().toLocaleString("ar-EG"),name:F.name,phone:F.phone,total:t.total,items:it.map(i=>`${i.qty}× ${i.name}`).join("، "),gov:gov(),area:F.area,address:F.address});sv("orders",o.slice(0,200))}
 sv("cart",{});window.open(url,"_blank");$("h").textContent="تم تجهيز طلبك بنجاح";
 $("app").innerHTML=`<div class="box" style="text-align:center"><p><b>رقم الطلب: ${esc(no)}</b></p>${real()?`<p>تم ربط الطلب بحسابك <span class="cid">${custNo(ME.no)}</span></p><p><button class="sm y" onclick="openAccount('orders')">عرض طلباتي</button></p>`:(sb?'<p><button class="sm" onclick="openAccount()">أنشئ حسابًا لتتبع طلباتك وتعبئة بياناتك تلقائيًا</button></p>':"")}<p>سيتم فتح واتساب لإرسال تفاصيل الطلب.</p><br><a class="btn ok full" href="${url}" target="_blank">لم يفتح؟ افتح واتساب</a><br><a href="../index.html" style="color:var(--k);font-weight:800;text-decoration:underline">العودة للمتجر</a></div>`}
function okey(){let k=sessionStorage.getItem("ok");if(!k){k=crypto.randomUUID();sessionStorage.setItem("ok",k)}return k}
function form(){window.GOV=gov();window.AREA=F.area;form0();if(sb&&cartItems().length)loadSlots()}
async function reserveThenReview(){if(!sb){RES="";return review()}const b=$("f").querySelector(".btn.full");b&&(b.disabled=true);
 let r;try{r=await sb.rpc("reserve_cart",{p_key:okey(),p_items:cartItems().map(i=>({id:i.id,qty:i.qty}))})}catch(e){r={error:e}}
 if(r.error){b&&(b.disabled=false);return alert(errText(r.error))}RES=new Date(Date.now()+6e5).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"});review()}
async function loadSlots(){const box=$("slots");if(!box)return;const days=[0,1,2].map(n=>{const d=new Date(Date.now()+n*864e5);return{iso:d.toLocaleDateString("en-CA"),name:n==0?"اليوم":n==1?"غدًا":d.toLocaleDateString("ar-EG",{weekday:"long"})}});
 const rs=await Promise.all(days.map(d=>sb.rpc("available_slots",{p_date:d.iso})));
 if(rs.some(r=>r.error)){box.innerHTML='<p class="err">تعذر تحميل مواعيد التوصيل</p>';return}
 HAS_SLOTS=rs[0].data.length>0;if(!HAS_SLOTS){box.innerHTML="";return}window._sl=days.map((d,i)=>({...d,slots:rs[i].data}));drawSlots()}
function pickSlot(di,i){const d=window._sl[di],s=d.slots[i];SL={di,slot:s.id,date:d.iso,label:d.name+" - "+s.label};drawSlots()}
function drawSlots(){if(!$("slots"))return;const di=SL.di||0,d=window._sl[di];$("slots").innerHTML=`<div class="box"><b>موعد التوصيل</b><div class="chips" style="margin-block:10px">${window._sl.map((x,i)=>`<button type="button" class="${i==di?"on":""}" onclick="SL={di:${i}};drawSlots()">${esc(x.name)}</button>`).join("")}</div><div class="two">${d.slots.map((s,i)=>{const full=s.booked>=s.capacity,sel=SL.slot==s.id&&SL.date==d.iso;return `<button type="button" class="btn g" style="${sel?"border-color:var(--k);background:var(--y)":""}" aria-pressed="${sel}" ${full?"disabled":""} onclick="pickSlot(${di},${i})">${esc(s.label)}${full?" (مكتمل)":""}</button>`}).join("")}</div><p class="err" id="se"></p></div>`}
$("app").innerHTML='<p class="empty">جارٍ التحميل…</p>';
Promise.all([initData(),initAuth()]).then(()=>{if(real())applyProfile(true);else applyProfile(false);if(RECOVERY)openAccount();form()});
