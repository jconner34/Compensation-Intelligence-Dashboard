/* Compensation Intelligence — zero-dependency, GitHub Pages-ready dashboard. */
'use strict';
const $ = id => document.getElementById(id);
const USD = new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0});
const pct = n => `${(n*100).toFixed(1)}%`;
const state = {employees:[],bands:[],page:0,pageSize:10};
const clean = value => String(value ?? '').toLowerCase();
const average = (list,key) => list.length ? list.reduce((sum,item)=>sum+Number(item[key]||0),0)/list.length : 0;
const sum = (list,key) => list.reduce((total,item)=>total+Number(item[key]||0),0);
const esc = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const elements = ['departmentFilter','locationFilter','roleFilter','statusFilter'];
function allFiltered(){
 const [dep,loc,role,status]=elements.map(id=>$(id).value);
 return state.employees.filter(e=>(!dep||e.department===dep)&&(!loc||e.location===loc)&&(!role||e.jobCode===role)&&(!status||e.payPosition===status));
}
function searched(list){const q=clean($('employeeSearch').value).trim();return q?list.filter(e=>[e.id,e.department,e.jobTitle,e.location,e.jobCode,e.payPosition].some(field=>clean(field).includes(q))):list;}
function fillSelect(id,values,label){const node=$(id);values.forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text||value;node.appendChild(option)});}
function summary(list){
 $('kpiEmployees').textContent=list.length.toLocaleString();$('kpiSalary').textContent=list.length?USD.format(average(list,'salary')):'—';$('kpiCompa').textContent=list.length?pct(average(list,'compaRatio')):'—';
 const below=list.filter(e=>e.payPosition==='Below Minimum').length;
 $('kpiBelow').textContent=below;$('kpiBelowSub').textContent=list.length?`${(below/list.length*100).toFixed(1)}% of filtered workforce`:'No employees in selection';$('kpiCost').textContent=USD.format(sum(list,'costToMinimum'));
 $('filterCount').textContent=`${list.length} of ${state.employees.length} employees`;
}
function histogram(list){
 const node=$('salaryHistogram');if(!list.length){node.innerHTML='<p class="empty">No data for current filters.</p>';return;}
 const step=20000, min=Math.floor(Math.min(...list.map(e=>e.salary))/step)*step, max=Math.ceil((Math.max(...list.map(e=>e.salary))+1)/step)*step;
 const bins=[];for(let start=min;start<max;start+=step)bins.push({start,count:list.filter(e=>e.salary>=start&&e.salary<start+step).length});
 const W=620,H=245,L=42,R=12,T=14,B=37,chartW=W-L-R,chartH=H-T-B,peak=Math.max(1,...bins.map(b=>b.count));
 const grid=[0,.25,.5,.75,1].map(f=>{const y=T+chartH*(1-f);return `<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" class="grid-line"/><text x="${L-10}" y="${y+4}" class="axis-text" text-anchor="end">${Math.round(peak*f)}</text>`}).join('');
 const bars=bins.map((b,i)=>{const slot=chartW/bins.length,width=Math.max(4,slot-13),x=L+i*slot+6,barH=b.count/peak*chartH,y=T+chartH-barH,label='$'+(b.start/1000)+'k';return `<rect class="bar" x="${x}" y="${y}" width="${width}" height="${barH}" rx="4"><title>${label}–$${(b.start+step)/1000}k: ${b.count} employees</title></rect><text class="axis-text" x="${x+width/2}" y="${H-12}" text-anchor="middle">${label}</text>`}).join('');
 node.innerHTML=`<svg role="img" aria-label="Salary histogram with ${bins.length} bins" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${grid}${bars}</svg>`;
}
function donut(list){
 const labels=[['Below Minimum','#e1a057'],['In Range','#17aa97'],['Above Maximum','#d96972']];const total=list.length;let current=0;
 const segments=labels.map(([label,color])=>{const count=list.filter(e=>e.payPosition===label).length;const from=current;current+=total?count/total*100:0;return {label,color,count,from,to:current}});
 $('payDonut').style.background=total?`conic-gradient(${segments.filter(s=>s.count).map(s=>`${s.color} ${s.from}% ${s.to}%`).join(',')})`:'#e9eef3';
 $('payDonut').innerHTML=`<div class="donut-center">${total}<small>EMPLOYEES</small></div>`;
 $('donutLegend').innerHTML=segments.map(s=>`<div class="legend-row"><span><i class="legend-dot" style="background:${s.color}"></i>${s.label}</span><strong>${s.count}</strong></div>`).join('');
}
function departments(list){
 const names=[...new Set(list.map(e=>e.department))].sort();
 $('departmentChart').innerHTML=names.length?names.map(name=>{const rows=list.filter(e=>e.department===name),ratio=average(rows,'compaRatio');return `<div class="dept-row"><div class="dept-label">${esc(name)} <span style="color:#aab4c1;font-size:10px">(${rows.length})</span></div><div class="dept-track"><div class="dept-fill" style="width:${Math.min(100,ratio/1.4*100).toFixed(2)}%"></div></div><div class="dept-value">${pct(ratio)}</div></div>`}).join(''):'<p>No departments in this selection.</p>';
}
function roles(list){
 const roleKeys=[...new Set(list.map(e=>e.jobCode))].sort();const rows=roleKeys.map(code=>{const subset=list.filter(e=>e.jobCode===code),sample=subset[0];return {code,name:sample.jobTitle,dep:sample.department,people:subset.length,salary:average(subset,'salary'),midpoint:sample.midpoint,compa:average(subset,'compaRatio'),below:subset.filter(e=>e.payPosition==='Below Minimum').length,cost:sum(subset,'costToMinimum')}}).sort((a,b)=>b.below-a.below||a.name.localeCompare(b.name));
 $('roleTable').innerHTML=rows.length?rows.map(r=>`<tr><td><div class="role-name">${esc(r.name)}</div><div class="role-sub">${esc(r.dep)} · ${esc(r.code)}</div></td><td>${r.people}</td><td class="num">${USD.format(r.salary)}</td><td class="num">${USD.format(r.midpoint)}</td><td><strong>${pct(r.compa)}</strong></td><td>${r.below?`<span class="chip low">${r.below} flagged</span>`:'0'}</td><td>${USD.format(r.cost)}</td></tr>`).join(''):'<tr><td colspan="7">No roles in this selection.</td></tr>';
}
function employees(list){
 const results=searched(list),total=results.length,pageCount=Math.max(1,Math.ceil(total/state.pageSize));state.page=Math.min(state.page,pageCount-1);
 const first=state.page*state.pageSize,items=results.slice(first,first+state.pageSize);
 $('resultCount').textContent=`${total} matching records`;
 $('employeeTable').innerHTML=items.length?items.map(e=>`<tr><td class="role-name">${esc(e.id)}</td><td><div class="role-name">${esc(e.jobTitle)}</div><div class="role-sub">${esc(e.department)}</div></td><td>${esc(e.location)}</td><td class="num">${USD.format(e.salary)}</td><td><strong>${pct(e.compaRatio)}</strong></td><td><span class="chip ${e.payPosition==='Below Minimum'?'low':e.payPosition==='Above Maximum'?'high':'good'}">${esc(e.payPosition)}</span></td><td><button class="view-button" data-employee="${esc(e.id)}">View →</button></td></tr>`).join(''):'<tr><td colspan="7">No matching employees.</td></tr>';
 $('pageSummary').textContent=total?`Showing ${first+1}–${Math.min(first+state.pageSize,total)} of ${total}`:'Showing 0 results';$('prevPage').disabled=state.page===0;$('nextPage').disabled=state.page>=pageCount-1;
}
function recommendations(list){
 const below=list.filter(e=>e.payPosition==='Below Minimum'),above=list.filter(e=>e.payPosition==='Above Maximum'),cost=sum(list,'costToMinimum');
 const byRole=[...new Set(below.map(e=>e.jobTitle))].map(role=>({role,people:below.filter(e=>e.jobTitle===role).length,cost:sum(below.filter(e=>e.jobTitle===role),'costToMinimum')})).sort((a,b)=>b.cost-a.cost);
 const first=byRole[0],messages=[
 {tag:'PRIORITY 01 / RANGE COMPLIANCE',title:'Review below-minimum salaries',description:below.length?`${below.length} employee${below.length===1?' is':'s are'} below assigned salary minimums. Estimated annual base salary needed to reach minimum: ${USD.format(cost)}. Confirm job mapping, salary-band validity, and applicable policies before adjustments.`:'No below-minimum salaries in the current selection. Continue routine range-compliance monitoring.',warn:true},
 {tag:'PRIORITY 02 / FOCUSED REVIEW',title:'Prioritize by role and exposure',description:first?`${first.role} has the highest modeled correction cost (${USD.format(first.cost)}) across ${first.people} below-minimum employee${first.people===1?'':'s'} in the filtered data. Investigate causes and budget scenarios by job classification.`:'No role-specific minimum corrections are indicated in this selection.'},
 {tag:'PRIORITY 03 / CONTEXT & GOVERNANCE',title:'Investigate exceptions—not assumptions',description:`${above.length} employee${above.length===1?' is':'s are'} above range maximum. Review tenure, prior increases, market dynamics and range governance. Simple salary differences alone do not establish inequity or discrimination.`}
 ];
 $('recommendationsList').innerHTML=messages.map(m=>`<article class="recommendation ${m.warn?'warn':''}"><div class="tag">${m.tag}</div><h3>${m.title}</h3><p>${esc(m.description)}</p></article>`).join('');
}
function render(){const list=allFiltered();summary(list);histogram(list);donut(list);departments(list);roles(list);employees(list);recommendations(list);}
function showDetails(id){const e=state.employees.find(e=>e.id===id);if(!e)return;
 $('detailTitle').textContent=`${e.id} · ${e.jobTitle}`;const pos=Math.max(0,Math.min(100,e.rangePenetration*100));
 const fields=[['Department',e.department],['Location',e.location],['Base salary',USD.format(e.salary)],['Band midpoint',USD.format(e.midpoint)],['Compa-ratio',pct(e.compaRatio)],['Range penetration',pct(e.rangePenetration)],['Tenure',`${e.tenure} years`],['Performance rating',`${e.performance} / 5`]];
 $('detailContent').innerHTML=`<div class="detail-grid">${fields.map(([label,value])=>`<div class="detail-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div><h3>Position within salary range</h3><div class="range-line"><div class="range-pointer" style="left:${pos}%"></div></div><div class="range-labels"><span>MIN ${USD.format(e.minimum)}</span><span>MID ${USD.format(e.midpoint)}</span><span>MAX ${USD.format(e.maximum)}</span></div><div class="detail-note"><strong>Pay position:</strong> ${esc(e.payPosition)}<br><strong>Illustrative next action:</strong> ${esc(e.recommendedAction||'Review pay context')}<br><strong>Estimated salary adjustment to band minimum:</strong> ${USD.format(e.costToMinimum)}. Cost excludes benefits, taxes, timing and downstream impacts.</div>`;
 $('employeeDialog').showModal();
}
function exportCSV(){const rows=searched(allFiltered()),cols=[['id','Employee ID'],['department','Department'],['jobCode','Job Code'],['jobTitle','Job Title'],['location','Location'],['tenure','Tenure Years'],['performance','Performance Rating'],['salary','Base Salary'],['minimum','Range Minimum'],['midpoint','Midpoint'],['maximum','Range Maximum'],['compaRatio','Compa Ratio'],['rangePenetration','Range Penetration'],['midpointGap','Midpoint Gap'],['payPosition','Pay Position'],['costToMinimum','Cost To Minimum']];
 const cell=value=>'"'+String(value??'').replace(/"/g,'""')+'"';const csv=[cols.map(c=>cell(c[1])).join(','),...rows.map(e=>cols.map(c=>cell(e[c[0]])).join(','))].join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='compensation-analysis-filtered.csv';a.click();URL.revokeObjectURL(url);
}
async function init(){
 try{const response=await fetch('data/compensation.json');if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();state.employees=data.employees;state.bands=data.salaryBands;
  fillSelect('departmentFilter',[...new Set(state.employees.map(e=>e.department))].sort().map(x=>[x,x]));fillSelect('locationFilter',[...new Set(state.employees.map(e=>e.location))].sort().map(x=>[x,x]));fillSelect('roleFilter',state.bands.map(r=>[r.jobCode,r.jobTitle]).sort((a,b)=>a[1].localeCompare(b[1])));
  elements.forEach(id=>$(id).addEventListener('change',()=>{state.page=0;render()}));$('employeeSearch').addEventListener('input',()=>{state.page=0;employees(allFiltered())});$('resetFilters').addEventListener('click',()=>{elements.forEach(id=>$(id).value='');$('employeeSearch').value='';state.page=0;render()});$('exportCsv').addEventListener('click',exportCSV);
  $('prevPage').addEventListener('click',()=>{state.page=Math.max(0,state.page-1);employees(allFiltered())});$('nextPage').addEventListener('click',()=>{state.page++;employees(allFiltered())});$('employeeTable').addEventListener('click',event=>{const btn=event.target.closest('[data-employee]');if(btn)showDetails(btn.dataset.employee)});
  $('closeDialog').addEventListener('click',()=>$('employeeDialog').close());$('closeDetailBottom').addEventListener('click',()=>$('employeeDialog').close());
  document.querySelectorAll('[data-nav]').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('[data-nav]').forEach(n=>n.classList.remove('active'));link.classList.add('active')}));render();
 }catch(err){document.querySelector('.content').innerHTML=`<div class="error"><h2>Could not load the dashboard dataset</h2><p>Please open this dashboard through a local web server or GitHub Pages, not by double-clicking index.html.</p><p>Try: <code>python -m http.server 8000</code> and visit <code>http://localhost:8000</code>.</p><small>${esc(err.message)}</small></div>`;}
}
document.addEventListener('DOMContentLoaded',init);
