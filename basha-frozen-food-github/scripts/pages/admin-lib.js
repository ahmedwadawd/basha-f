// ===== أدوات مشتركة للوحة الإدارة (تُحمَّل قبل admin.js) =====
// "اليوم" يُحسب دائمًا بتوقيت مصر (من الخادم، وعند تعذره من Intl) وليس بتوقيت جهاز المدير.
async function egToday(){try{const r=await sb.rpc("egypt_today");if(r&&r.data)return String(r.data).slice(0,10)}catch(e){}
 return new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Cairo"}).format(new Date())}
const addDays=(ymd,n)=>{const d=new Date(ymd+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const fmtDay=ymd=>new Date(ymd+"T12:00:00Z").toLocaleDateString("ar-EG",{timeZone:"UTC",weekday:"long",year:"numeric",month:"long",day:"numeric"});
const fmtMonth=ym=>new Date(ym+"-15T12:00:00Z").toLocaleDateString("ar-EG",{timeZone:"UTC",year:"numeric",month:"long"});
const LOADING='<p class="empty" role="status">جارٍ التحميل…</p>';
const EMPTY=m=>`<p class="empty">${esc(m)}</p>`;
// تنفيذ إجراء مع منع الإرسال المزدوج: يعطّل الزر حتى ينتهي الإجراء
async function withBusy(btn,fn){if(btn&&btn.dataset.busy)return;if(btn){btn.dataset.busy="1";btn.disabled=true}
 try{return await fn()}finally{if(btn){delete btn.dataset.busy;btn.disabled=false}}}
const subBtn=e=>e&&(e.submitter||(e.target&&e.target.querySelector&&e.target.querySelector("button:not([type=button])")));
// "YYYY-MM-DDTHH:mm" بتوقيت القاهرة  <->  ISO (UTC)
function cairoOffsetMin(date){const p=new Intl.DateTimeFormat("en-US",{timeZone:"Africa/Cairo",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(date);
 const g=k=>+p.find(x=>x.type==k).value;return Math.round((Date.UTC(g("year"),g("month")-1,g("day"),g("hour"),g("minute"),g("second"))-date.getTime())/6e4)}
function cairoToISO(v){if(!v)return null;const g=new Date(v+":00Z");if(isNaN(g))return null;return new Date(g.getTime()-cairoOffsetMin(g)*6e4).toISOString()}
function isoToCairo(iso){if(!iso)return"";const d=new Date(iso);return new Date(d.getTime()+cairoOffsetMin(d)*6e4).toISOString().slice(0,16)}
const fmtCairo=iso=>iso?new Date(iso).toLocaleString("ar-EG",{timeZone:"Africa/Cairo",dateStyle:"medium",timeStyle:"short"}):"";
// قسم هرمي للقوائم المنسدلة: الرئيسي ثم فروعه (مع "— " قبل الفرعي)
function catOptions(cats,sel,onlyActive){const t=cats.filter(x=>!x.parent),o=[];const ok=x=>!onlyActive||x.active!==false||x.slug==sel;
 t.forEach(x=>{if(ok(x))o.push([x.slug,x.name+(x.active===false?" (معطّل)":"")]);cats.filter(y=>y.parent==x.slug&&ok(y)).forEach(y=>o.push([y.slug,"— "+y.name+(y.active===false?" (معطّل)":"")]))});return o}
const optHTML=(list,sel)=>list.map(([v,n])=>`<option value="${esc(v)}" ${v==sel?"selected":""}>${esc(n)}</option>`).join("");
const csvCell=v=>{v=String(v??"");if(/^[=+\-@\t\r]/.test(v))v="'"+v;return'"'+v.replace(/"/g,'""')+'"'};
function downloadCSV(name,rows){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+rows.map(r=>r.map(csvCell).join(",")).join("\r\n")],{type:"text/csv;charset=utf-8"}));a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000)}
