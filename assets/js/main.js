/* ── Theme (runs immediately before DOM) ─────────────── */
(function(){
  const saved = localStorage.getItem('cwv-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {
  /* theme toggle */
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cwv-theme', next);
      updateThemeBtn(next);
    });
  });
  function updateThemeBtn(t) {
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.textContent = t === 'dark' ? '☀️' : '🌙';
      b.title = t === 'dark' ? 'Switch to light' : 'Switch to dark';
    });
  }
  updateThemeBtn(document.documentElement.getAttribute('data-theme') || 'light');

  /* sidebar collapse */
  document.querySelectorAll('.sg-head').forEach(h => {
    h.addEventListener('click', () => {
      const items = h.nextElementSibling, arr = h.querySelector('.sg-arr');
      if(items){ items.classList.toggle('open'); if(arr) arr.classList.toggle('open'); }
    });
  });
  const act = document.querySelector('.si.active');
  if(act){ const g=act.closest('.sg-items'); if(g){ g.classList.add('open'); const a=g.previousElementSibling?.querySelector('.sg-arr'); if(a) a.classList.add('open'); } }

  /* TOC spy */
  const tl = document.querySelectorAll('.toc-list a');
  const hs = document.querySelectorAll('.sh2[id],.sh3[id]');
  if(tl.length && hs.length){
    const obs = new IntersectionObserver(e => {
      e.forEach(en => { if(en.isIntersecting){ tl.forEach(a=>a.classList.remove('active')); const a=document.querySelector(`.toc-list a[href="#${en.target.id}"]`); if(a) a.classList.add('active'); } });
    }, {rootMargin:'-10% 0px -75% 0px'});
    hs.forEach(h => obs.observe(h));
  }
});

/* ═══════════════════════════════════════════════════════
   HERO CANVAS — Infrastructure · BST · Neural Net
   Canvas is ALWAYS dark regardless of page theme
═══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  /* keep canvas bg in sync when theme toggles */
  const themeObserver = new MutationObserver(() => { /* redraws on next frame */ });
  themeObserver.observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  const ctx = canvas.getContext('2d');
  let W, H, tick = 0, rpsCount = 0, rpsTimer = 0;
  let sceneIdx = 0, sceneTick = 0, sceneAlpha = 0;
  const SCENES = [
    {key:'infra', label:'INFRA · DATA PIPELINE', dur:500},
    {key:'dsa',   label:'DSA · BST TRAVERSAL',   dur:380},
    {key:'nn',    label:'GEN AI · NEURAL NET',    dur:420},
  ];
  const FADE = 50;

  /* colours — always dark canvas palette */
  function h2r(hex, a){ const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; }
  const P = { bg:'#09090C', bg1:'#0F0F14', bg2:'#131320', bd:'#1E1E2A', bd2:'#2A2A38',
    indigo:'#6366F1', green:'#34D399', amber:'#FBBF24', blue:'#60A5FA', purple:'#A78BFA', red:'#F87171',
    teal:'#2DD4BF', pink:'#F472B6' };

  function eio(t){ return t<.5 ? 2*t*t : -1+(4-2*t)*t; }
  function lerp(a,b,t){ return a+(b-a)*t; }
  function nc(n){ return {x:n.x+n.w/2, y:n.y+n.h/2}; }
  function rr(x,y,w,h,r=4){
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
  }

  /* ── SVG-style icon drawing functions ── */
  function iconDB(cx,cy,s,col){
    /* database cylinder */
    const ew=s*0.9, eh=s*0.28;
    ctx.strokeStyle=col; ctx.lineWidth=1.2; ctx.fillStyle='none';
    ctx.beginPath(); ctx.ellipse(cx,cy-s*0.4,ew,eh,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx,cy,ew,eh,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-ew,cy-s*0.4); ctx.lineTo(cx-ew,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+ew,cy-s*0.4); ctx.lineTo(cx+ew,cy); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx,cy+s*0.4,ew,eh,0,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-ew,cy); ctx.lineTo(cx-ew,cy+s*0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+ew,cy); ctx.lineTo(cx+ew,cy+s*0.4); ctx.stroke();
  }
  function iconServer(cx,cy,s,col){
    /* server rack — 3 rows */
    const w=s*1.8, h=s*0.38, gap=2;
    ctx.strokeStyle=col; ctx.lineWidth=1.1;
    for(let i=0;i<3;i++){
      const y=cy-s*0.5+i*(h+gap);
      rr(cx-w/2,y,w,h,2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+w/2-6,y+h/2,2,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
    }
  }
  function iconLB(cx,cy,s,col){
    /* load balancer — triangle fan */
    ctx.strokeStyle=col; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(cx,cy-s*0.4,4,0,Math.PI*2); ctx.strokeStyle=col; ctx.stroke();
    const targets=[{x:cx-s*0.7,y:cy+s*0.4},{x:cx,y:cy+s*0.4},{x:cx+s*0.7,y:cy+s*0.4}];
    targets.forEach(t=>{
      ctx.beginPath(); ctx.moveTo(cx,cy-s*0.4+4); ctx.lineTo(t.x,t.y-4); ctx.stroke();
      ctx.beginPath(); ctx.arc(t.x,t.y,3,0,Math.PI*2); ctx.stroke();
    });
  }
  function iconCache(cx,cy,s,col){
    /* cache — grid of small cells */
    const cw=s*0.55, rows=2, cols=3;
    const totalW=cols*cw+(cols-1)*2, totalH=rows*cw+(rows-1)*2;
    ctx.strokeStyle=col; ctx.lineWidth=1;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const x=cx-totalW/2+c*(cw+2), y=cy-totalH/2+r*(cw+2);
      rr(x,y,cw,cw,1); ctx.stroke();
    }
  }
  function iconQueue(cx,cy,s,col){
    /* message queue — stacked envelope lines */
    ctx.strokeStyle=col; ctx.lineWidth=1.1;
    const w=s*1.6, h=s*0.32;
    for(let i=0;i<3;i++){
      const y=cy-s*0.42+i*(h+2.5);
      rr(cx-w/2,y,w,h,2); ctx.stroke();
      if(i===0){ ctx.beginPath(); ctx.moveTo(cx-w/2,y); ctx.lineTo(cx,y+h*0.6); ctx.lineTo(cx+w/2,y); ctx.stroke(); }
    }
  }
  function iconClient(cx,cy,s,col){
    /* monitor screen */
    ctx.strokeStyle=col; ctx.lineWidth=1.2;
    rr(cx-s*0.9,cy-s*0.65,s*1.8,s*1.1,3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-s*0.35,cy+s*0.45); ctx.lineTo(cx+s*0.35,cy+s*0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx,cy+s*0.45); ctx.lineTo(cx,cy+s*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx-s*0.4,cy+s*0.7); ctx.lineTo(cx+s*0.4,cy+s*0.7); ctx.stroke();
  }
  function iconAnalytics(cx,cy,s,col){
    /* bar chart */
    ctx.strokeStyle=col; ctx.lineWidth=1.1;
    const bars=[0.4,0.7,0.55,0.9];
    const bw=s*0.3, gap=3, totalW=bars.length*(bw+gap)-gap;
    bars.forEach((h,i)=>{
      const x=cx-totalW/2+i*(bw+gap), barH=s*1.0*h, y=cy+s*0.4-barH;
      rr(x,y,bw,barH,1.5); ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(cx-totalW/2-2,cy+s*0.4); ctx.lineTo(cx+totalW/2+2,cy+s*0.4); ctx.stroke();
  }
  function iconWarehouse(cx,cy,s,col){
    /* data warehouse — house shape with lines inside */
    ctx.strokeStyle=col; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(cx,cy-s*0.8); ctx.lineTo(cx+s*1.0,cy-s*0.2); ctx.lineTo(cx+s*1.0,cy+s*0.7); ctx.lineTo(cx-s*1.0,cy+s*0.7); ctx.lineTo(cx-s*1.0,cy-s*0.2); ctx.closePath(); ctx.stroke();
    for(let i=1;i<3;i++){ ctx.beginPath(); ctx.moveTo(cx-s*0.7,cy-s*0.2+i*s*0.3); ctx.lineTo(cx+s*0.7,cy-s*0.2+i*s*0.3); ctx.stroke(); }
  }

  /* NODE icon dispatcher */
  const ICONS = { client:iconClient, lb:iconLB, api:iconServer, cache:iconCache, queue:iconQueue, db:iconDB, replica:iconDB, analytics:iconAnalytics, warehouse:iconWarehouse };

  /* ════ INFRA SCENE ════ */
  let INF={}, infPkts=[], infTimer=0;
  const NT = {
    client:   {ico:'client',   col:P.blue,   label:'Client'},
    lb:       {ico:'lb',       col:P.indigo, label:'Load Balancer'},
    api:      {ico:'api',      col:P.indigo, label:'API'},
    cache:    {ico:'cache',    col:P.green,  label:'Redis Cache'},
    queue:    {ico:'queue',    col:P.amber,  label:'Kafka Queue'},
    db:       {ico:'db',       col:P.purple, label:'DB Primary'},
    replica:  {ico:'replica',  col:P.purple, label:'DB Replica'},
    analytics:{ico:'analytics',col:P.blue,   label:'Analytics'},
    warehouse:{ico:'warehouse',col:P.teal,   label:'Data Warehouse'},
  };
  const IR = [
    ['client','lb','api0','cache','db','warehouse'],
    ['client','lb','api1','db','replica'],
    ['client','lb','api2','queue','analytics','warehouse'],
    ['client','lb','api0','queue','analytics'],
    ['client','lb','api1','cache','db','replica'],
    ['client','lb','api2','db','warehouse'],
  ];
  const IE = [['client','lb'],['lb','api0'],['lb','api1'],['lb','api2'],['api0','cache'],['api1','cache'],['api2','queue'],['api0','queue'],['api1','db'],['api2','db'],['cache','db'],['queue','analytics'],['db','replica'],['db','warehouse'],['analytics','warehouse']];

  function buildINF(){
    INF={}; infPkts=[]; infTimer=0;
    const cx=W/2, nw=Math.min(82,W*0.12), nh=26;
    const rows=[
      [{id:'client',type:'client'}],
      [{id:'lb',type:'lb'}],
      [{id:'api0',type:'api',label:'API Server 1'},{id:'api1',type:'api',label:'API Server 2'},{id:'api2',type:'api',label:'API Server 3'}],
      [{id:'cache',type:'cache'},{id:'queue',type:'queue'}],
      [{id:'db',type:'db'},{id:'replica',type:'replica'},{id:'analytics',type:'analytics'}],
      [{id:'warehouse',type:'warehouse'}],
    ];
    const rowH = H/(rows.length+0.8);
    rows.forEach((row,ri)=>{
      const y=rowH*(ri+1)-nh/2;
      const tw=row.length*nw+(row.length-1)*18;
      const sx=cx-tw/2;
      row.forEach((nd,ni)=>{
        const t=NT[nd.type];
        INF[nd.id]={id:nd.id,type:nd.type,col:t.col,ico:t.ico,label:nd.label||t.label,x:sx+ni*(nw+18),y,w:nw,h:nh,beat:Math.random()*Math.PI*2,pulse:0};
      });
    });
  }

  function stepINF(){
    infTimer++;
    Object.values(INF).forEach(n=>n.pulse=0.35+Math.sin(tick*0.03+n.beat)*0.3);
    if(infTimer%22===0 && infPkts.length<18){
      const route=IR[Math.floor(Math.random()*IR.length)];
      infPkts.push({route,step:0,phase:0,speed:0.046+Math.random()*0.026,col:INF[route[route.length-1]]?.col||P.indigo});
      rpsCount++;
    }
    infPkts.forEach(p=>{p.phase+=p.speed; if(p.phase>=1){p.phase=0;p.step++;if(p.step>=p.route.length-1)p.done=true;}});
    infPkts=infPkts.filter(p=>!p.done);
  }

  function drawINFNode(n){
    const c=nc(n), col=n.col;
    const nw=n.w, nh=n.h;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    /* outer ambient glow ring */
    ctx.beginPath(); ctx.arc(c.x,c.y,nw*0.52,0,Math.PI*2);
    ctx.strokeStyle=h2r(col,0.04+n.pulse*0.06); ctx.lineWidth=8; ctx.stroke();

    /* card shadow */
    ctx.shadowBlur=8+n.pulse*12; ctx.shadowColor=h2r(col,0.3);

    /* card background */
    rr(n.x,n.y,nw,nh,7);
    const cardBg = isDark ? '#0D0D18' : '#FFFFFF';
    ctx.fillStyle=cardBg; ctx.fill();
    ctx.strokeStyle=h2r(col,0.3+n.pulse*0.25); ctx.lineWidth=1; ctx.stroke();
    ctx.shadowBlur=0;

    /* colored fill tint inside */
    rr(n.x+1,n.y+1,nw-2,nh-2,6);
    ctx.fillStyle=h2r(col,0.06+n.pulse*0.04); ctx.fill();

    /* icon — large, centered, NO label */
    const ico = ICONS[n.ico];
    if(ico){
      const iconSize = nh * 0.42; /* big enough to be self-explanatory */
      ico(c.x, c.y, iconSize, h2r(col, 0.85+n.pulse*0.12));
    }
  }

  function drawINF(a){
    ctx.globalAlpha=a;
    /* edges */
    IE.forEach(([ai,bi])=>{
      const na=INF[ai],nb=INF[bi]; if(!na||!nb)return;
      const ca=nc(na),cb=nc(nb);
      ctx.strokeStyle=h2r('#FFFFFF',0.06); ctx.lineWidth=0.6; ctx.setLineDash([3,6]);
      ctx.beginPath(); ctx.moveTo(ca.x,ca.y); ctx.lineTo(cb.x,cb.y); ctx.stroke();
      ctx.setLineDash([]);
    });
    /* nodes */
    Object.values(INF).forEach(n=>drawINFNode(n));
    /* packets */
    infPkts.forEach(p=>{
      const from=INF[p.route[p.step]], to=INF[p.route[p.step+1]]; if(!from||!to)return;
      const t=eio(p.phase), px=lerp(nc(from).x,nc(to).x,t), py=lerp(nc(from).y,nc(to).y,t);
      /* trail */
      for(let i=3;i>=0;i--){ const tt=Math.max(0,p.phase-i*0.06); const tx=lerp(nc(from).x,nc(to).x,eio(tt)),ty=lerp(nc(from).y,nc(to).y,eio(tt)); ctx.beginPath();ctx.arc(tx,ty,3-i*0.6,0,Math.PI*2);ctx.fillStyle=h2r(p.col,(0.35-i*0.08));ctx.fill(); }
      ctx.shadowBlur=14; ctx.shadowColor=p.col;
      ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fillStyle=h2r(p.col,0.92); ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,2.2,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
      ctx.shadowBlur=0;
    });
    ctx.globalAlpha=1;
  }

  /* ════ BST SCENE ════ */
  let BST={},bstOrder=[],bstStep=0,bstTimer=0,bstVisited=new Set(),bstActive=-1,bstPart=[];
  function buildBST(){
    BST={};bstOrder=[];bstVisited=new Set();bstActive=-1;bstPart=[];bstStep=0;bstTimer=0;
    const cx=W/2,top=H*0.09,vg=H*0.155,r=Math.min(W,H)*0.042;
    const nd=(id,v,x,y,l,ri)=>{BST[id]={id,v,x,y,l,ri,R:r,glow:0};};
    nd(1,50,cx,top,2,3); nd(2,25,cx-W*0.22,top+vg,4,5); nd(3,75,cx+W*0.22,top+vg,6,7);
    nd(4,12,cx-W*0.34,top+vg*2,8,9); nd(5,37,cx-W*0.10,top+vg*2,null,null);
    nd(6,62,cx+W*0.10,top+vg*2,null,null); nd(7,87,cx+W*0.34,top+vg*2,null,null);
    nd(8,6,cx-W*0.40,top+vg*3,null,null); nd(9,18,cx-W*0.28,top+vg*3,null,null);
    bstOrder=[8,4,9,2,5,1,6,3,7];
  }
  function stepBST(){
    bstTimer++;
    if(bstTimer%28!==0)return;
    if(bstStep>=bstOrder.length){bstStep=0;bstVisited=new Set();bstActive=-1;Object.values(BST).forEach(n=>n.glow=0);return;}
    const id=bstOrder[bstStep]; bstActive=id; bstVisited.add(id);
    const n=BST[id]; if(n){n.glow=1;for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2;bstPart.push({x:n.x,y:n.y,vx:Math.cos(a)*(1+Math.random()*2.5),vy:Math.sin(a)*(1+Math.random()*2.5),life:1});}}
    bstStep++;
  }
  function drawBST(a){
    ctx.globalAlpha=a;
    Object.values(BST).forEach(n=>{[n.l,n.ri].forEach(cid=>{if(!cid||!BST[cid])return;const c=BST[cid],both=bstVisited.has(n.id)&&bstVisited.has(cid);ctx.strokeStyle=both?h2r(P.green,0.55):h2r('#fff',0.08);ctx.lineWidth=both?1.5:0.75;ctx.setLineDash(both?[]:[4,6]);ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(c.x,c.y);ctx.stroke();ctx.setLineDash([]);});});
    bstPart.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.life-=0.028;ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fillStyle=`rgba(52,211,153,${p.life})`;ctx.fill();});
    bstPart=bstPart.filter(p=>p.life>0);
    Object.values(BST).forEach(n=>{
      const vis=bstVisited.has(n.id),isAct=n.id===bstActive;
      n.glow=Math.max(0,(n.glow||0)-0.014);
      ctx.shadowBlur=isAct?24:n.glow>0.05?14*n.glow:0; ctx.shadowColor=P.green;
      ctx.beginPath();ctx.arc(n.x,n.y,n.R,0,Math.PI*2);
      const g=ctx.createRadialGradient(n.x,n.y-n.R*.3,0,n.x,n.y,n.R);
      if(isAct){g.addColorStop(0,'#5EEAA0');g.addColorStop(1,'#065F46');}
      else if(vis){g.addColorStop(0,'#042f1e');g.addColorStop(1,'#021a12');}
      else{g.addColorStop(0,'#131320');g.addColorStop(1,'#0D0D18');}
      ctx.fillStyle=g; ctx.strokeStyle=isAct?P.green:vis?h2r(P.green,0.45):h2r('#fff',0.1);
      ctx.lineWidth=isAct?2:1; ctx.fill();ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle=isAct?'#000':vis?P.green:h2r('#fff',0.5);
      ctx.font=`${isAct?700:500} ${Math.round(n.R*0.62)}px 'JetBrains Mono',monospace`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.v,n.x,n.y);
    });
    const bw=W*0.28,bx=(W-bw)/2,by=H*0.92;
    rr(bx,by,bw,2.5,2);ctx.fillStyle=h2r('#fff',0.07);ctx.fill();
    const prog=bstStep/bstOrder.length;
    if(prog>0){rr(bx,by,bw*prog,2.5,2);ctx.fillStyle=P.green;ctx.fill();}
    ctx.fillStyle=h2r(P.green,0.4);ctx.font='8px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(`IN-ORDER  ${bstStep}/${bstOrder.length}`,W/2,by+6);
    ctx.globalAlpha=1;
  }

  /* ════ NEURAL NET SCENE ════ */
  let NNL=[],NNW=[],nnStep=0,nnTimer=0,nnPart=[];
  const NNS=[4,6,8,6,3], NNC=[P.blue,'#818CF8',P.indigo,P.purple,P.pink];
  function buildNN(){
    NNL=[];NNW=[];nnPart=[];nnStep=0;nnTimer=0;
    const xs=W/(NNS.length+1);
    NNS.forEach((sz,li)=>{
      const x=xs*(li+1),ys=H/(sz+1),neurons=[];
      for(let ni=0;ni<sz;ni++) neurons.push({x,y:ys*(ni+1),act:Math.random(),col:NNC[li],glow:0,name:li===0?['x₁','x₂','x₃','x₄'][ni]:li===4?['y₁','y₂','y₃'][ni]:''});
      NNL.push(neurons);
    });
    for(let li=0;li<NNL.length-1;li++) NNL[li].forEach((f,fi)=>NNL[li+1].forEach((t,ti)=>NNW.push({fl:li,fn:fi,tl:li+1,tn:ti,w:Math.random()*2-1,p:0,col:NNC[li]})));
  }
  function stepNN(){
    nnTimer++;if(nnTimer%16!==0)return;
    const li=nnStep%(NNL.length+4);
    if(li<NNL.length){NNL[li].forEach(n=>{n.act=Math.random();n.glow=1;for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2;nnPart.push({x:n.x,y:n.y,vx:Math.cos(a)*(0.6+Math.random()),vy:Math.sin(a)*(0.6+Math.random()),life:1,col:n.col});}});NNW.forEach(w=>{if(w.fl===li)w.p=1;});}
    else{NNL.forEach(l=>l.forEach(n=>n.glow=0));NNW.forEach(w=>w.p=0);}
    nnStep++;
  }
  function drawNN(a){
    ctx.globalAlpha=a;
    NNW.forEach(w=>{const f=NNL[w.fl][w.fn],t=NNL[w.tl][w.tn];if(!f||!t)return;const active=w.p>0.05,str=Math.abs(w.w);ctx.strokeStyle=active?h2r(w.col,0.12+w.p*0.45):`rgba(255,255,255,${0.03+str*0.05})`;ctx.lineWidth=active?0.8+w.p*0.7:0.4;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(t.x,t.y);ctx.stroke();if(active&&w.p>0.3){const tp=1-w.p,px=f.x+(t.x-f.x)*tp,py=f.y+(t.y-f.y)*tp;ctx.beginPath();ctx.arc(px,py,1.6,0,Math.PI*2);ctx.fillStyle=h2r(w.col,0.75);ctx.fill();}if(active)w.p=Math.max(0,w.p-0.016);});
    nnPart.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.04;ctx.beginPath();ctx.arc(p.x,p.y,1.2,0,Math.PI*2);ctx.fillStyle=h2r(p.col,p.life*0.75);ctx.fill();});nnPart=nnPart.filter(p=>p.life>0);
    const lnames=['Input','Hidden','Hidden','Hidden','Output'];
    NNL.forEach((layer,li)=>{
      layer.forEach(n=>{
        n.glow=Math.max(0,(n.glow||0)-0.012);const r=7+n.act*5+n.glow*5;
        ctx.shadowBlur=n.glow>0.05?18*n.glow:4;ctx.shadowColor=h2r(n.col,0.6);
        ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r);
        g.addColorStop(0,h2r(n.col,n.glow>0.05?0.7:0.25));g.addColorStop(1,h2r(n.col,0.05));
        ctx.fillStyle=g;ctx.strokeStyle=h2r(n.col,n.glow>0.05?0.8:0.2);ctx.lineWidth=1;ctx.fill();ctx.stroke();ctx.shadowBlur=0;
        if(n.name){ctx.fillStyle='rgba(255,255,255,0.88)';ctx.font='600 7px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.name,n.x,n.y);}
      });
      ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='8px Plus Jakarta Sans,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(lnames[li],layer[0]?.x||0,H*0.93);
    });
    const li=nnStep%(NNL.length+4);
    if(li<NNL.length){const bx=W*0.05,by=H*0.9,bw=W*0.9;rr(bx,by,bw,2,1);ctx.fillStyle=h2r('#fff',0.07);ctx.fill();rr(bx,by,bw*(li/NNL.length),2,1);ctx.fillStyle=P.indigo;ctx.fill();}
    ctx.globalAlpha=1;
  }

  /* ════ STARFIELD ════ */
  let stars=[];
  function buildStars(){ stars=[];for(let i=0;i<90;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*0.7,ph:Math.random()*Math.PI*2,sp:Math.random()*0.003+0.001}); }
  function getPageBg(){
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? '#09090C' : '#F8F8FA';
  }
  function drawBG(){
    const bg = getPageBg();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    /* subtle grid - adapts to theme */
    const gridCol = isDark ? 'rgba(42,42,56,0.4)' : 'rgba(180,180,200,0.18)';
    ctx.strokeStyle=gridCol;ctx.lineWidth=0.5;
    for(let x=0;x<W;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    /* stars only in dark, light particles in light mode */
    stars.forEach(s=>{
      const a=0.04+Math.abs(Math.sin(tick*s.sp+s.ph))*0.15;
      const col = isDark ? `rgba(255,255,255,${a})` : `rgba(91,84,240,${a*0.5})`;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();
    });
  }

  /* ════ MAIN LOOP ════ */
  const lblEl=document.getElementById('cb-scene-label');
  const rpsEl=document.getElementById('cb-rps');
  const latEl=document.getElementById('cb-lat');

  function draw(){
    ctx.clearRect(0,0,W,H);tick++;sceneTick++;
    drawBG();
    if(sceneTick>SCENES[sceneIdx].dur){
      sceneIdx=(sceneIdx+1)%SCENES.length;sceneTick=0;sceneAlpha=0;
      if(lblEl)lblEl.textContent=SCENES[sceneIdx].label;
      if(sceneIdx===0)buildINF();if(sceneIdx===1)buildBST();if(sceneIdx===2)buildNN();
    }
    sceneAlpha=Math.min(1,sceneAlpha+0.04);
    let a=sceneAlpha;
    if(sceneTick>SCENES[sceneIdx].dur-FADE) a*=Math.max(0,(SCENES[sceneIdx].dur-sceneTick)/FADE);
    a=Math.max(0,Math.min(1,a));
    if(sceneIdx===0){stepINF();drawINF(a);}
    if(sceneIdx===1){stepBST();drawBST(a);}
    if(sceneIdx===2){stepNN();drawNN(a);}
    rpsTimer++;
    if(rpsTimer>=60){
      if(rpsEl)rpsEl.textContent=rpsCount+' req/s';
      if(latEl)latEl.textContent=(11+Math.floor(Math.random()*9))+'ms';
      rpsCount=0;rpsTimer=0;
    }
    requestAnimationFrame(draw);
  }

  function resize(){
    const r=canvas.getBoundingClientRect();
    W=canvas.width=r.width;H=canvas.height=r.height;
    buildStars();buildINF();
  }
  window.addEventListener('resize',resize);
  resize();draw();
})();
