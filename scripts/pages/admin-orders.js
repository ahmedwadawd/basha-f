// ===== الطلبات: عرض يوم واحد (بتوقيت مصر) + بحث + ترقيم على الخادم =====
// OR (الحالة) مُعرَّف في admin.js: {q,st,day,all,sort,pg,open,editing,tok,today}
function orBar(){const dn=OR.day==OR.today;
 return `<div class="toolbar" id="otool"><div class="dnav" role="group" aria-label="التنقل بين الأيام"><button class="sm" onclick="orDay(-1)">اليوم السابق</button><input type="date" id="odate" value="${esc(OR.day)}" max="${esc(OR.today||"")}" onchange="orPick(this.value)" aria-label="تاريخ الطلبات"><button class="sm" onclick="orDay(1)" ${dn?"disabled":""}>اليوم التالي</button></div><button class="btn ${dn?"k":""}" onclick="orToday()" aria-pressed="${dn}">طلبات اليوم</button></div>
<div class="toolbar"><label class="grow">بحث (رقم الطلب / الاسم / الهاتف)<input id="oq" value="${esc(OR.q)}" onkeydown="if(event.key=='Enter')orSearch()"></label><label>الحالة<select id="ost" onchange="orSearch()"><option value="">الكل</option>${Object.entries(ORDER_ST).map(([k,n])=>`<option value="${k}" ${OR.st==k?"selected":""}>${n}</option>`).join("")}</select></label><label>الترتيب<select id="osr" onchange="orSearch()"><option value="new" ${OR.sort=="new"?"selected":""}>الأحدث</option><option value="old" ${OR.sort=="old"?"selected":""}>الأقدم</option><option value="total" ${OR.sort=="total"?"selected":""}>الأعلى قيمة</option></select></label><label class="chk"><input type="checkbox" id="oall" ${OR.all?"checked":""} onchange="orSearch()"> بحث في كل الأيام</label><button class="btn" onclick="orSearch()">بحث</button></div>`}
async function ords(){
 if(!OR.today){OR.today=await egToday()}if(!OR.day)OR.day=OR.today;
 const tok=++OR.tok,wide=OR.all&&OR.q.trim()!=="";
 $("v").innerHTML=orBar()+`<div id="osum"></div><div id="ol">${LOADING}</div><div id="opg"></div>`;
 const s0=OR.q.trim(),s=/^[\d٠-٩+\s-]{6,}$/.test(s0)?normPhone(s0):s0;
 let r;try{r=await sb.rpc("admin_orders_list",{p_from:wide?null:OR.day,p_to:wide?null:OR.day,p_status:OR.st||null,p_q:s||null,p_sort:OR.sort,p_limit:ORN,p_offset:OR.pg*ORN})}catch(e){r={error:e}}
 if(tok!==OR.tok||tab!=="orders")return;                      // طلب أحدث بدأ، تجاهل هذه النتيجة المتأخرة
 if(!guard(r)){$("ol").innerHTML=EMPTY("تعذر تحميل الطلبات. تحقق من الاتصال وأعد المحاولة.");return}
 const d=r.data,rows=d.rows||[];window._o=rows;
 const title=wide?"نتائج البحث في كل الأيام":(OR.day==OR.today?"طلبات اليوم — ":"")+fmtDay(OR.day);
 const by=d.summary.by_status||{};
 $("osum").innerHTML=`<div class="box ordsum"><b class="ttl">${esc(title)}</b><div class="row" style="justify-content:flex-start;gap:18px;flex-wrap:wrap"><span>عدد الطلبات: <b>${d.total}</b></span><span>إجمالي المبيعات (دون الملغاة): <b>${M(d.summary.revenue_cents)}</b></span></div>${Object.keys(by).length?`<div class="chips" style="margin-top:6px">${Object.entries(by).map(([k,n])=>`<span class="stt ${esc(k)}">${esc(ORDER_ST[k]||k)}: ${n}</span>`).join(" ")}</div>`:""}</div>`;
 $("ol").innerHTML=rows.length?rows.map(orderCard).join(""):EMPTY(wide?"لا توجد طلبات مطابقة للبحث.":`لا توجد طلبات ${OR.st?"بهذه الحالة ":""}في ${fmtDay(OR.day)}.`);
 $("opg").innerHTML=pager(d.total,OR.pg,ORN,"orPage")}
function orSearch(){OR.q=$("oq").value.trim();OR.st=$("ost").value;OR.sort=$("osr").value;OR.all=$("oall").checked;OR.pg=0;ords()}
function orDay(n){OR.day=addDays(OR.day,n);if(OR.today&&OR.day>OR.today)OR.day=OR.today;OR.pg=0;OR.open=null;ords()}
function orPick(v){if(!v)return;OR.day=OR.today&&v>OR.today?OR.today:v;OR.pg=0;OR.open=null;ords()}
async function orToday(){OR.today=await egToday();OR.day=OR.today;OR.q="";OR.st="";OR.all=false;OR.pg=0;OR.open=null;ords()}
function orPage(d){OR.pg+=d;ords()}
