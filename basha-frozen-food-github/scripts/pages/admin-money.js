// ===== الأرباح + فلوس الموقع (حسابان منفصلان تمامًا) =====
// الأرباح = صافي المبيعات بعد الخصم − تكلفة المنتجات المعروفة. رسوم التوصيل تُعرض منفصلة ولا تدخل في الربح.
// لا تُخترع تكلفة لمنتج بلا تكلفة: يُعرض الربح للمنتجات معروفة التكلفة فقط مع تنبيه واضح. «فلوس الموقع» لا تُخصم من الأرباح هنا.
const PR={from:"",to:"",deliv:false,today:"",tok:0};
const kpi=(l,v,cls="",sub="")=>`<div class="kpi ${cls}"><small>${l}</small><b>${v}</b>${sub?`<em>${sub}</em>`:""}</div>`;
async function profit(){PR.today=await egToday();if(!PR.from){PR.from=PR.to=PR.today}
 $("v").innerHTML=`<div class="toolbar"><button class="btn k" onclick="prQuick('today')">أرباح اليوم</button><button class="btn g" onclick="prQuick('7')">آخر 7 أيام</button><button class="btn g" onclick="prQuick('month')">هذا الشهر</button></div>
<div class="toolbar"><label>من<input type="date" id="p1" value="${esc(PR.from)}" max="${esc(PR.today)}"></label><label>إلى<input type="date" id="p2" value="${esc(PR.to)}" max="${esc(PR.today)}"></label><label>الطلبات المحتسبة<select id="p3"><option value="0" ${PR.deliv?"":"selected"}>كل غير الملغاة</option><option value="1" ${PR.deliv?"selected":""}>المُسلَّمة فقط</option></select></label><button class="btn" onclick="runProfit()">عرض</button></div><div id="pd">${LOADING}</div>`;runProfit()}
function prQuick(k){const t=PR.today;PR.to=t;PR.from=k=="today"?t:k=="7"?addDays(t,-6):t.slice(0,8)+"01";$("p1").value=PR.from;$("p2").value=PR.to;runProfit()}
async function runProfit(){const a=$("p1").value,b=$("p2").value;PR.deliv=$("p3").value=="1";if(!a||!b||b<a){toast("اختر نطاق تاريخ صحيحًا",true);return}PR.from=a;PR.to=b;const tok=++PR.tok;$("pd").innerHTML=LOADING;
 let r;try{r=await sb.rpc("admin_profit_report",{p_from:a,p_to:b,p_delivered_only:PR.deliv})}catch(e){r={error:e}}if(tok!==PR.tok||tab!=="profit")return;if(!guard(r)){$("pd").innerHTML=EMPTY("تعذر تحميل التقرير.");return}
 const d=r.data,when=a==b?(a==PR.today?"اليوم — ":"")+fmtDay(a):`${fmtDay(a)} ← ${fmtDay(b)}`;
 if(!d.orders){$("pd").innerHTML=`<div class="box"><b>${esc(when)}</b></div>`+EMPTY("لا توجد طلبات في هذه الفترة.");return}
 const miss=d.lines_missing_cost,full=miss==0;
 $("pd").innerHTML=`<div class="box"><b>${esc(when)}</b> · ${d.orders} طلب${PR.deliv?" (مُسلَّمة)":" (غير ملغاة)"}</div>
<div class="kpis">${kpi("المبيعات قبل الخصم",M(d.gross_cents))}${kpi("الخصومات","− "+M(d.discount_cents))}${kpi("صافي المبيعات (بعد الخصم، بدون التوصيل)",M(d.net_sales_cents),"main")}${kpi("رسوم التوصيل المحصّلة",M(d.delivery_cents),"muted","منفصلة ولا تدخل في الربح")}</div>
<div class="kpis">${kpi(full?"صافي الربح":"ربح المنتجات معروفة التكلفة فقط",M(d.profit_known_cents),full?"good":"warnk",full?"= صافي المبيعات − تكلفة المنتجات":`محسوب على مبيعات ${M(d.net_known_cents)} فقط من أصل ${M(d.net_sales_cents)}`)}${kpi("تكلفة المنتجات (المعروفة)",M(d.cost_known_cents),"muted")}</div>
${full?"":`<p class="err">⚠ ${miss} بند مبيعات (بقيمة ${M(d.net_unknown_cents)}) لمنتجات بلا سعر تكلفة، فلم يُحتسب لها ربح ولا يُعتبر الرقم أعلاه صافي ربح مؤكدًا. أضف «سعر التكلفة» من تبويب المنتجات (يُطبَّق على الطلبات الجديدة فقط، فتكلفة الطلبات القديمة لا تتغير).</p>`}
<div class="box scroll"><table><tr><th>المنتج</th><th>الكمية</th><th>صافي المبيعات</th><th>التكلفة</th><th>الربح</th></tr>${d.rows.map(x=>`<tr><td>${esc(x.name)}${x.missing_cost?" *":""}</td><td>${x.qty}</td><td>${M(x.net_cents)}</td><td>${x.missing_cost?"—":M(x.cost_cents)}</td><td>${x.profit_cents==null?"—":M(x.profit_cents)}</td></tr>`).join("")}</table></div>
<p class="hint">* بلا سعر تكلفة. الطلبات الملغاة مستبعدة. لا يوجد نظام استرداد في المتجر؛ الإلغاء وحده يُستبعد. <b>«فلوس الموقع» لا تُخصم من هذه الأرقام</b> — تظهر منفصلة في تبويب «فلوس الموقع».</p>`}

// ---------- فلوس الموقع ----------
const FE={month:"",today:"",tok:0};
async function feesTab(){FE.today=await egToday();if(!FE.month)FE.month=FE.today.slice(0,7);
 $("v").innerHTML=`<div class="toolbar"><label>الشهر<input type="month" id="fm" value="${esc(FE.month)}" max="${esc(FE.today.slice(0,7))}" onchange="feMonth(this.value)"></label><button class="btn k" onclick="feMonth('${FE.today.slice(0,7)}')">هذا الشهر</button></div><div id="fd">${LOADING}</div>`;runFees()}
function feMonth(m){if(!m)return;FE.month=m;$("fm").value=m;runFees()}
async function runFees(){const tok=++FE.tok;$("fd").innerHTML=LOADING;
 let r,c;try{[r,c]=await Promise.all([sb.rpc("admin_site_fee_report",{p_month:FE.month+"-01"}),sb.from("product_private").select("product_id",{count:"exact",head:true}).gt("site_fee_cents",0)])}catch(e){r={error:e};c={}}
 if(tok!==FE.tok||tab!=="fees")return;if(!guard(r)){$("fd").innerHTML=EMPTY("تعذر تحميل التقرير.");return}
 const d=r.data,none=c&&c.count===0;
 $("fd").innerHTML=`${none?'<p class="box note">لم تحدّد «فلوس الموقع» لأي منتج بعد. افتح تبويب المنتجات، وعدّل منتجًا، واكتب المبلغ (مثلاً 3 جنيه) في حقل «فلوس الموقع». يُطبَّق على المبيعات الجديدة من لحظة حفظه.</p>':""}
<div class="kpis">${kpi("إجمالي فلوس الموقع — "+esc(fmtMonth(d.month)),M(d.total_cents),"main")}${kpi("القطع المباعة (التي عليها فلوس)",d.pieces)}${kpi("عدد الطلبات",d.orders)}${kpi("الإجمالي منذ البداية",M(d.all_time_cents),"muted")}</div>
${d.by_product.length?`<div class="box scroll"><div class="row"><h3>تفصيل الشهر حسب المنتج</h3><button class="sm" onclick="feCSV()">تصدير CSV</button></div><table><tr><th>المنتج</th><th>فلوس القطعة</th><th>القطع</th><th>الإجمالي</th></tr>${d.by_product.map(x=>`<tr><td>${esc(x.name)}</td><td>${M(x.fee_cents)}</td><td>${x.pieces}</td><td><b>${M(x.total_cents)}</b></td></tr>`).join("")}</table></div>`:EMPTY("لا توجد مبيعات عليها فلوس موقع في هذا الشهر.")}
<h3 class="sec2">آخر 12 شهرًا</h3><div class="box scroll"><table><tr><th>الشهر</th><th>القطع</th><th>الإجمالي</th></tr>${d.months.map(x=>`<tr class="clk ${x.m==d.month?"rowsel":""}" onclick="feMonth('${x.m}')" tabindex="0" onkeydown="if(event.key=='Enter')feMonth('${x.m}')"><td>${esc(fmtMonth(x.m))}</td><td>${x.pieces}</td><td><b>${M(x.total_cents)}</b></td></tr>`).join("")}</table></div>
<p class="hint">يُحسب = (عدد القطع المباعة × فلوس الموقع المحدّدة للمنتج وقت البيع). الطلبات الملغاة مستبعدة، وتغيير المبلغ لاحقًا لا يغيّر المبيعات القديمة. الأشهر بتوقيت مصر. <b>هذا الحساب منفصل تمامًا عن الأرباح</b> ولا يدخل فيها.</p>`;window._fe=d}
function feCSV(){const d=window._fe;if(!d)return;downloadCSV(`site-fees-${d.month}.csv`,[["المنتج","فلوس القطعة","القطع","الإجمالي"],...d.by_product.map(x=>[x.name,x.fee_cents/100,x.pieces,x.total_cents/100]),["الإجمالي","","",d.total_cents/100]])}
