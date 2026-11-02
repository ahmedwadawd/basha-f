// ===== مناطق التوصيل: يديرها المدير. العميل يرى المناطق الفعّالة فقط، والخادم يرفض أي طلب لمنطقة غير فعّالة =====
// صف بلا «منطقة» = المحافظة كلها؛ وصف بمنطقة/مدينة = رسوم خاصة لها. الإسكندرية مفعّلة افتراضيًا.
const ZN={edit:null};
const znGovs=()=>{const l=(window._zn||[]).map(z=>z.governorate);return [...new Set(l)]};
async function zones(){$("v").innerHTML=LOADING;const r=await sb.from("delivery_zones").select("*");
 if(!guard(r)){$("v").innerHTML=EMPTY("تعذر تحميل المناطق.");return}window._zn=r.data;znDraw()}
function znGroups(){const g={};(window._zn||[]).forEach(z=>(g[z.governorate]=g[z.governorate]||[]).push(z));
 return Object.entries(g).sort(([a],[b])=>a=="الإسكندرية"?-1:b=="الإسكندرية"?1:a.localeCompare(b,"ar")).map(([k,v])=>[k,v.sort((x,y)=>(x.area?1:0)-(y.area?1:0)||String(x.area).localeCompare(String(y.area),"ar"))])}
function znForm(){const z=ZN.edit?(window._zn||[]).find(x=>x.id==ZN.edit):null,gv=z?z.governorate:"الإسكندرية",known=GOVS.includes(gv),cfgFee=cfg().deliveryFee;
 return `<form class="box" id="znf" onsubmit="znSave(event)"><h3>${z?"تعديل منطقة توصيل":"إضافة منطقة توصيل"}</h3><div class="two">
<label>المحافظة<select id="zg" onchange="$('zg2w').style.display=this.value=='__new'?'':'none'">${GOVS.filter(g=>g!="أخرى").map(g=>`<option ${g==gv?"selected":""}>${esc(g)}</option>`).join("")}${known?"":`<option selected>${esc(gv)}</option>`}<option value="__new">+ محافظة غير مذكورة…</option></select></label>
<label id="zg2w" style="display:none">اسم المحافظة<input id="zg2" maxlength="60"></label>
<label>المنطقة / المدينة (اختياري)<input id="za" maxlength="100" placeholder="اتركه فارغًا لتغطية المحافظة كلها" value="${esc(z?z.area:"")}"></label>
<label>رسوم التوصيل (جنيه)<input id="zf" type="number" min="0" step="0.01" required value="${z?z.fee_cents/100:cfgFee}"></label>
<label>حد أدنى للطلب (اختياري)<input id="zm" type="number" min="0" step="0.01" value="${z&&z.min_order_cents!=null?z.min_order_cents/100:""}"></label>
<label>توصيل مجاني فوق (اختياري)<input id="zr" type="number" min="0" step="0.01" value="${z&&z.free_over_cents!=null?z.free_over_cents/100:""}"></label></div>
<label class="chk"><input type="checkbox" id="zact" ${!z||z.active?"checked":""}> مفعّلة (يستطيع العملاء الطلب منها)</label><p class="err" id="ze" role="alert"></p><button class="btn">${z?"حفظ التعديل":"إضافة"}</button>${z?' <button type="button" class="btn g" onclick="ZN.edit=null;znDraw()">إلغاء</button>':""}</form>`}
function znDraw(){const groups=znGroups(),act=(window._zn||[]).filter(z=>z.active).length;
 $("v").innerHTML=`<div class="box note">العميل يرى <b>المناطق الفعّالة فقط</b> عند إتمام الطلب، ولا يستطيع الطلب من منطقة غير فعّالة حتى لو حاول تجاوز الواجهة. الطلبات القديمة لا تتأثر. ${act?"":'<b class="err">⚠ لا توجد أي منطقة فعّالة: لن يستطيع أي عميل إتمام طلب.</b>'}</div>${znForm()}
<div class="box scroll">${groups.length?`<table><tr><th>المحافظة</th><th>المنطقة</th><th>الرسوم</th><th>الحد الأدنى</th><th>مجاني فوق</th><th>فعّالة</th><th></th></tr>${groups.map(([g,zs])=>zs.map((z,i)=>`<tr class="${z.active?"":"rowoff"}"><td>${i==0?`<b>${esc(g)}</b>`:""}</td><td>${z.area?esc(z.area):'<span class="hint">كل المحافظة</span>'}</td><td>${M(z.fee_cents)}</td><td>${z.min_order_cents==null?"—":M(z.min_order_cents)}</td><td>${z.free_over_cents==null?"—":M(z.free_over_cents)}</td><td><label class="sw"><input type="checkbox" ${z.active?"checked":""} onchange="znToggle(${z.id},this.checked)" aria-label="تفعيل ${esc(g)} ${esc(z.area||"")}"><span>${z.active?"فعّالة":"معطّلة"}</span></label></td><td style="white-space:nowrap"><button class="sm" onclick="ZN.edit=${z.id};znDraw();$('znf').scrollIntoView({behavior:'smooth'})">تعديل</button> <button class="sm r" onclick="znDel(${z.id})">حذف</button></td></tr>`).join("")).join("")}</table>`:EMPTY("لا توجد مناطق. أضف منطقة ليتمكن العملاء من الطلب.")}</div>`}
const znOnlyActive=id=>{const a=(window._zn||[]).filter(z=>z.active);return a.length==1&&a[0].id==id};
async function znSave(e){e.preventDefault();$("ze").textContent="";let g=$("zg").value;if(g=="__new")g=$("zg2").value.trim();
 const area=$("za").value.trim()||null,fee=cents("zf");if(!g)return $("ze").textContent="اكتب اسم المحافظة";if(fee==null||fee<0||!isFinite(fee))return $("ze").textContent="اكتب رسوم التوصيل (صفر أو أكثر)";
 const mn=cents("zm"),fr=cents("zr");if((mn!=null&&mn<0)||(fr!=null&&fr<0))return $("ze").textContent="القيم لا يمكن أن تكون سالبة";
 const row={governorate:g,area,fee_cents:fee,min_order_cents:mn,free_over_cents:fr,active:$("zact").checked};
 await withBusy(subBtn(e),async()=>{const r=ZN.edit?await sb.from("delivery_zones").update(row).eq("id",ZN.edit):await sb.from("delivery_zones").insert(row);
  if(r.error){$("ze").textContent=r.error.code=="23505"?"هذه المنطقة مضافة بالفعل لنفس المحافظة":mErr(r.error);return}
  ZN.edit=null;toast("تم الحفظ");zones()})}
async function znToggle(id,v){if(!v&&znOnlyActive(id)&&!confirm("هذه آخر منطقة فعّالة. تعطيلها يمنع كل العملاء من إتمام أي طلب. متابعة؟")){znDraw();return}
 const r=await sb.from("delivery_zones").update({active:v}).eq("id",id);if(guard(r)){toast(v?"تم تفعيل المنطقة":"تم تعطيل المنطقة");zones()}else znDraw()}
async function znDel(id){const z=(window._zn||[]).find(x=>x.id==id);if(!z)return;
 if(!confirm(`حذف منطقة «${z.governorate}${z.area?" - "+z.area:""}»؟\nلن يستطيع العملاء الطلب منها بعد الحذف، والطلبات القديمة تبقى كما هي.${znOnlyActive(id)?"\n⚠ هذه آخر منطقة فعّالة: لن يستطيع أي عميل إتمام طلب.":""}`))return;
 const r=await sb.from("delivery_zones").delete().eq("id",id);if(guard(r)){if(ZN.edit==id)ZN.edit=null;toast("تم الحذف");zones()}}
