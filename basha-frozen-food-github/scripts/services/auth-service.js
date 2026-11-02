// ===== حساب العميل =====
// مع Supabase: حساب حقيقي (بريد + كلمة مرور) + صف في جدول customers برقم عميل تلقائي فريد يُنشأ مرة واحدة على الخادم.
// بدون Supabase: ملف محلي على هذا الجهاز فقط (للتعبئة التلقائية)، بلا رقم عميل ولا مزامنة — ولا يُعرض كحساب حقيقي.
// الحماية الفعلية على الخادم: دوال get_my_profile / save_my_profile / my_orders تفلتر بـ auth.uid() ولا تقبل معرّف عميل من المتصفح.
let ME=null;                                  // null = زائر. وإلا {local,no,name,phone,email,gov,area,address}
let RECOVERY=/type=recovery/.test(location.hash); // رابط استعادة كلمة المرور (يُلتقط قبل أن تمسحه المكتبة)
const LKEY="profile";
const localMe=()=>{const p=ld(LKEY,null);return p&&typeof p=="object"?{local:true,no:null,name:p.name||"",phone:p.phone||"",email:"",gov:p.gov||"",area:p.area||"",address:p.address||""}:null};
const authMsg=e=>{const m=String((e&&e.message)||e||"");
 if(/already registered|already been registered/i.test(m))return"هذا البريد مسجّل بالفعل، سجّل الدخول.";
 if(/invalid login credentials/i.test(m))return"البريد أو كلمة المرور غير صحيحة.";
 if(/banned|user_banned/i.test(m))return"هذا الحساب موقوف. تواصل مع المتجر.";
  if(/تم إيقاف هذا الحساب|تعذر إتمام الطلب/.test(m))return m;
  if(/not confirmed/i.test(m))return"أكّد بريدك الإلكتروني من الرسالة التي وصلتك أولًا.";
 if(/at least|weak|short/i.test(m)&&/password/i.test(m))return"كلمة المرور قصيرة (8 أحرف على الأقل).";
 if(/rate limit|too many|security purposes/i.test(m))return"محاولات كثيرة، انتظر قليلًا ثم حاول مرة أخرى.";
 if(/signups? (not allowed|are disabled|disabled)/i.test(m))return"إنشاء الحسابات غير مفعّل حاليًا.";
 if(/fetch|network|failed/i.test(m)||!navigator.onLine)return"تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مرة أخرى.";
 return/[\u0600-\u06FF]/.test(m)?m:"تعذر إتمام العملية، حاول مرة أخرى."};
async function loadProfile(){const {data,error}=await sb.rpc("get_my_profile");if(error||!data||!data[0]){ME=null;return null}
 const r=data[0];ME={local:false,no:r.customer_no,name:r.name||"",phone:r.phone||"",email:r.email||"",gov:r.governorate||"",area:r.area||"",address:r.address||""};return ME}
async function initAuth(){if(!sb){ME=localMe();return ME}
 try{const {data:{session}}=await sb.auth.getSession();if(session)await loadProfile();else ME=null}catch(e){ME=null}return ME}
// تُسجَّل مبكرًا (وقت تحميل السكربت) كي لا تفوتنا أحداث الاستعادة وانتهاء الجلسة
if(sb&&sb.auth)sb.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"){ME=null;typeof authChanged=="function"&&authChanged()}if(ev==="PASSWORD_RECOVERY"){RECOVERY=true;typeof authChanged=="function"&&authChanged()}});
async function signUp({name,phone,email,password}){
 try{const {data,error}=await sb.auth.signUp({email,password,options:{data:{name,phone}}});
  if(error)return{error:authMsg(error)};
  if(data.user&&data.user.identities&&data.user.identities.length===0)return{error:"هذا البريد مسجّل بالفعل، سجّل الدخول."};
  if(!data.session)return{confirm:true};                 // تأكيد البريد مفعّل في Supabase
  await loadProfile();return ME?{ok:true}:{error:"تم إنشاء الحساب لكن تعذر تحميل بياناتك، أعد المحاولة."}
 }catch(e){return{error:authMsg(e)}}}
async function signIn(email,password){
 try{const {error}=await sb.auth.signInWithPassword({email,password});if(error)return{error:authMsg(error)};
  await loadProfile();return ME?{ok:true}:{error:"تعذر تحميل بيانات الحساب، حاول مرة أخرى."}
 }catch(e){return{error:authMsg(e)}}}
async function signOutUser(){try{await sb.auth.signOut()}catch(e){}ME=null}
async function sendReset(email){try{const {error}=await sb.auth.resetPasswordForEmail(email);return error?{error:authMsg(error)}:{ok:true}}catch(e){return{error:authMsg(e)}}}
async function setNewPassword(password){try{const {error}=await sb.auth.updateUser({password});if(error)return{error:authMsg(error)};RECOVERY=false;history.replaceState(null,"",location.pathname+location.search);await loadProfile();return{ok:true}}catch(e){return{error:authMsg(e)}}}
// حفظ بيانات العميل (الاسم/الهاتف/العنوان) — الخادم يتحقق ويحفظ على حساب الجلسة الحالية فقط
async function saveProfile(p){const v={name:(p.name||"").trim(),phone:normPhone(p.phone),gov:p.gov||"",area:(p.area||"").trim(),address:(p.address||"").trim()};
 if(v.name.length<2)return{error:"اكتب الاسم"};if(!okPhone(v.phone))return{error:"اكتب رقم موبايل مصري صحيح (11 رقم)"};if(v.address&&v.address.length<5)return{error:"اكتب العنوان بالتفصيل"};
 if(!sb){sv(LKEY,v);ME=localMe();return{ok:true}}      // بلا قاعدة بيانات: ملف محلي على هذا الجهاز
 if(!ME)return{error:"سجّل الدخول أولًا"};
 const {error}=await sb.rpc("save_my_profile",{p_name:v.name,p_phone:v.phone,p_gov:v.gov,p_area:v.area,p_address:v.address});
 if(error)return{error:authMsg(error)};Object.assign(ME,v);return{ok:true}}
async function myOrders(){if(!sb||!ME||ME.local)return{list:ld("orders",[]).map(x=>({code:x.no,created_at:null,date:x.date,total_cents:Math.round((x.total||0)*100),items:null,itemsText:x.items,lines:x.lines,local:true}))};
 const {data,error}=await sb.rpc("my_orders",{p_limit:20});return error?{error:authMsg(error)}:{list:data||[]}}
