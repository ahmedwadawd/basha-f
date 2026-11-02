// ===== الأقسام والوحدات: يديرها المدير من اللوحة، وتظهر في الموقع ونماذج المنتجات تلقائيًا =====
// قسم رئيسي + فروع (مستويان). حذف قسم فيه منتجات يتطلب نقلها لقسم آخر. الوحدات المستخدمة لا تُحذف (تُعطَّل).
const CG={edit:null,del:null};
const cgTops=()=>(window._cg||[]).filter(x=>!x.parent),cgKids=s=>(window._cg||[]).filter(x=>x.parent==s);
const cgCount=s=>(window._cn&&window._cn.categories&&window._cn.categories[s])||0;
async function catalog(){$("v").innerHTML=LOADING;
 const [c,u,n]=await Promise.all([sb.from("categories").select("*").order("sort"),sb.from("units").select("*").order("sort"),sb.rpc("admin_catalog_counts")]);
 if(!guard(c)||!guard(u)||!guard(n)){$("v").innerHTML=EMPTY("تعذر تحميل الأقسام والوحدات.");return}
 window._cg=c.data;window._ug=u.data;window._cn=n.data;cgDraw()}
function cgRow(x,sub,sibs,i){const own=cgCount(x.slug),kids=sub?0:cgKids(x.slug).reduce((s,k)=>s+cgCount(k.slug),0);
 return `<tr class="${x.active===false?"rowoff":""}"><td>${sub?'<span class="ind">└</span> ':""}<b>${esc(x.name)}</b><br><small class="mono">${esc(x.slug)}</small></td><td>${own}${kids?` <small>(+${kids} في الفروع)</small>`:""}</td>
 <td><label class="sw"><input type="checkbox" ${x.active!==false?"checked":""} onchange="cgToggle('${x.slug}',this.checked)" aria-label="تفعيل القسم ${esc(x.name)}"><span>${x.active!==false?"ظاهر":"معطّل"}</span></label></td>
 <td style="white-space:nowrap"><button class="sm" ${i==0?"disabled":""} onclick="cgMove('${x.slug}',-1)" aria-label="أعلى">↑</button> <button class="sm" ${i==sibs.length-1?"disabled":""} onclick="cgMove('${x.slug}',1)" aria-label="أسفل">↓</button> <button class="sm" onclick="CG.edit='${x.slug}';CG.del=null;cgDraw()">تعديل</button> <button class="sm r" onclick="cgDelAsk('${x.slug}')">حذف</button></td></tr>`}
function cgEditPanel(){const x=(window._cg||[]).find(y=>y.slug==CG.edit);if(!x)return"";const hasKids=cgKids(x.slug).length>0;
 return `<form class="panel" onsubmit="cgSave(event,'${x.slug}')"><h3>تعديل القسم</h3><div class="two"><label>الاسم<input id="cg_n" required maxlength="60" value="${esc(x.name)}"></label><label>يتبع قسم<select id="cg_p" ${hasKids?"disabled":""}><option value="">— قسم رئيسي —</option>${optHTML(cgTops().filter(t=>t.slug!=x.slug).map(t=>[t.slug,t.name]),x.parent)}</select></label></div>${hasKids?'<p class="hint">هذا القسم له أقسام فرعية، فلا يمكن جعله فرعيًا.</p>':""}<p class="err" id="cg_e" role="alert"></p><button class="btn">حفظ</button> <button type="button" class="btn g" onclick="CG.edit=null;cgDraw()">إلغاء</button></form>`}
function cgDelPanel(){const x=(window._cg||[]).find(y=>y.slug==CG.del);if(!x)return"";const n=cgCount(x.slug),kids=cgKids(x.slug);
 if(kids.length)return `<div class="panel"><h3>لا يمكن حذف «${esc(x.name)}» الآن</h3><p>له ${kids.length} أقسام فرعية (${kids.map(k=>esc(k.name)).join("، ")}). احذفها أو انقلها لقسم آخر أولًا.</p><button class="btn g" onclick="CG.del=null;cgDraw()">حسنًا</button></div>`;
 const others=catOptions((window._cg||[]).filter(y=>y.slug!=x.slug),"",false);
 return `<div class="panel"><h3>حذف القسم «${esc(x.name)}»</h3>${n?`<p>يحتوي على <b>${n}</b> منتج. اختر القسم الذي ستُنقل إليه المنتجات قبل الحذف (لن يُحذف أي منتج):</p><label>نقل المنتجات إلى<select id="cg_mv">${optHTML(others,"")}</select></label>`:"<p>القسم فارغ ولا يحتوي منتجات.</p>"}<p class="hint">العروض المرتبطة بهذا القسم تُحذف معه. لا يمكن التراجع.</p><p class="err" id="cg_de" role="alert"></p><button class="btn r" id="cg_go" onclick="cgDelDo('${x.slug}')">${n?"نقل المنتجات وحذف القسم":"حذف القسم"}</button> <button class="btn g" onclick="CG.del=null;cgDraw()">إلغاء</button></div>`}
function cgDraw(){const tops=cgTops(),cats=window._cg||[],units=window._ug||[],uc=(window._cn&&window._cn.units)||{};
 $("v").innerHTML=`<h3 class="sec2">الأقسام</h3>
<form class="box" onsubmit="cgAdd(event)"><div class="two"><label>اسم القسم الجديد<input id="cn_n" required maxlength="60" placeholder="مثال: المخبوزات"></label><label>يتبع<select id="cn_p"><option value="">— قسم رئيسي —</option>${optHTML(tops.map(t=>[t.slug,t.name]),"")}</select></label></div><p class="err" id="cn_e" role="alert"></p><button class="btn">+ إضافة قسم</button><p class="hint">القسم الجديد يظهر في الموقع فور إضافة منتج له. الأقسام الفارغة تُخفى عن العملاء تلقائيًا.</p></form>
${CG.edit?cgEditPanel():""}${CG.del?cgDelPanel():""}
<div class="box scroll">${cats.length?`<table><tr><th>القسم</th><th>المنتجات</th><th>الحالة</th><th></th></tr>${tops.map((t,i)=>cgRow(t,false,tops,i)+cgKids(t.slug).map((k,j,a)=>cgRow(k,true,a,j)).join("")).join("")}</table>`:EMPTY("لا توجد أقسام. أضف أول قسم من الأعلى.")}</div>
<h3 class="sec2">وحدات القياس</h3>
<form class="box" onsubmit="unAdd(event)"><div class="row" style="justify-content:flex-start;gap:10px;flex-wrap:wrap"><label class="grow" style="margin:0">اسم الوحدة الجديدة<input id="un_n" required maxlength="30" placeholder="مثال: دستة"></label><button class="btn">+ إضافة وحدة</button></div><p class="err" id="un_e" role="alert"></p></form>
<div class="box scroll">${units.length?`<table><tr><th>الوحدة</th><th>المنتجات</th><th>الحالة</th><th></th></tr>${units.map(x=>`<tr class="${x.active?"":"rowoff"}"><td><b>${esc(x.name)}</b></td><td>${uc[x.name]||0}</td><td><label class="sw"><input type="checkbox" ${x.active?"checked":""} onchange="unToggle(${x.id},this.checked)" aria-label="تفعيل الوحدة ${esc(x.name)}"><span>${x.active?"متاحة":"معطّلة"}</span></label></td><td style="white-space:nowrap"><button class="sm" onclick="unRename(${x.id})">تعديل الاسم</button> <button class="sm r" onclick="unDel(${x.id})">حذف</button></td></tr>`).join("")}</table><p class="hint">تغيير اسم وحدة يتحدّث تلقائيًا في كل المنتجات المرتبطة بها. الوحدة المعطّلة لا تظهر عند إضافة منتج جديد.</p>`:EMPTY("لا توجد وحدات.")}</div>`}
// ---- الأقسام
async function cgAdd(e){e.preventDefault();$("cn_e").textContent="";const name=$("cn_n").value.trim(),par=$("cn_p").value||null,cats=window._cg||[];
 if(!name)return $("cn_e").textContent="اكتب اسم القسم";if(cats.some(c=>(c.parent||null)==par&&c.name.trim()==name))return $("cn_e").textContent="يوجد قسم بنفس الاسم في هذا المستوى";
 const sib=cats.filter(c=>(c.parent||null)==par&&c.slug!="mixed"),sort=(sib.reduce((m,c)=>Math.max(m,c.sort),0)||0)+1;
 await withBusy(subBtn(e),async()=>{const r=await sb.from("categories").insert({slug:"c-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name,parent:par,sort,active:true});if(guard(r)){toast("تمت إضافة القسم");catalog()}})}
async function cgSave(e,slug){e.preventDefault();$("cg_e").textContent="";const name=$("cg_n").value.trim(),par=$("cg_p").disabled?undefined:($("cg_p").value||null);
 if(!name)return $("cg_e").textContent="اكتب اسم القسم";const row={name};if(par!==undefined)row.parent=par;
 await withBusy(subBtn(e),async()=>{const r=await sb.from("categories").update(row).eq("slug",slug);if(guard(r)){CG.edit=null;toast("تم حفظ القسم");catalog()}})}
async function cgToggle(slug,v){const x=(window._cg||[]).find(y=>y.slug==slug),n=cgCount(slug);
 if(!v&&!confirm(`تعطيل «${x?x.name:""}»؟\nسيختفي من الموقع${n?` مع ${n} منتج فيه (لن يستطيع العملاء رؤيتها أو طلبها)`:""}. يمكنك إعادة تفعيله في أي وقت.`)){cgDraw();return}
 const r=await sb.from("categories").update({active:v}).eq("slug",slug);if(guard(r)){toast(v?"تم تفعيل القسم":"تم تعطيل القسم");catalog()}else cgDraw()}
async function cgMove(slug,d){const x=(window._cg||[]).find(y=>y.slug==slug);if(!x)return;const sibs=(window._cg||[]).filter(y=>(y.parent||null)==(x.parent||null)).sort((a,b)=>a.sort-b.sort),i=sibs.findIndex(y=>y.slug==slug),j=i+d;if(j<0||j>=sibs.length)return;
 [sibs[i],sibs[j]]=[sibs[j],sibs[i]];const rs=await Promise.all(sibs.map((y,k)=>sb.from("categories").update({sort:k*10+10}).eq("slug",y.slug)));if(rs.every(r=>guard(r)))catalog()}
function cgDelAsk(slug){CG.del=slug;CG.edit=null;cgDraw();scrollTo(0,0)}
async function cgDelDo(slug){const mv=$("cg_mv")?$("cg_mv").value:null;$("cg_de").textContent="";
 await withBusy($("cg_go"),async()=>{const r=await sb.rpc("admin_delete_category",{p_slug:slug,p_move_to:mv||null});if(r.error){$("cg_de").textContent=mErr(r.error);return}CG.del=null;toast(r.data&&r.data.moved?`تم حذف القسم ونقل ${r.data.moved} منتج`:"تم حذف القسم");catalog()})}
// ---- الوحدات
async function unAdd(e){e.preventDefault();$("un_e").textContent="";const name=$("un_n").value.trim();if(!name)return $("un_e").textContent="اكتب اسم الوحدة";
 if((window._ug||[]).some(u=>u.name==name))return $("un_e").textContent="هذه الوحدة موجودة بالفعل";
 const sort=((window._ug||[]).reduce((m,u)=>Math.max(m,u.sort),0)||0)+1;
 await withBusy(subBtn(e),async()=>{const r=await sb.from("units").insert({name,sort});if(guard(r)){toast("تمت إضافة الوحدة");catalog()}})}
async function unRename(id){const u=(window._ug||[]).find(x=>x.id==id);if(!u)return;const name=(prompt("اسم الوحدة",u.name)||"").trim();if(!name||name==u.name)return;
 if((window._ug||[]).some(x=>x.name==name))return toast("هذه الوحدة موجودة بالفعل",true);const r=await sb.from("units").update({name}).eq("id",id);if(guard(r)){toast("تم تعديل الوحدة وتحديث منتجاتها");catalog()}}
async function unToggle(id,v){const r=await sb.from("units").update({active:v}).eq("id",id);if(guard(r)){toast(v?"تم تفعيل الوحدة":"تم تعطيل الوحدة");catalog()}else cgDraw()}
async function unDel(id){const u=(window._ug||[]).find(x=>x.id==id);if(!u)return;const n=((window._cn&&window._cn.units)||{})[u.name]||0;
 if(n)return alert(`الوحدة «${u.name}» مستخدمة في ${n} منتج، فلا يمكن حذفها.\nعطّلها لإخفائها من القوائم، أو غيّر وحدة هذه المنتجات أولًا.`);
 if(!confirm(`حذف الوحدة «${u.name}»؟`))return;const r=await sb.from("units").delete().eq("id",id);if(guard(r)){toast("تم حذف الوحدة");catalog()}}
