/* ── Theme (runs immediately before DOM) ─────────────── */
(function(){
  const saved = localStorage.getItem('cwv-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', () => {
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

  /* ── DSA dropdown submenu (injected on every page) ── */
  const dsaLink = Array.from(document.querySelectorAll('.nav-link'))
    .find(a => a.textContent.trim().startsWith('DSA'));

  if (dsaLink) {
    /* The logo link always points to the root index.html — use it to get the
       site root URL reliably from any page depth, then build the leet-150 path. */
    const logoLink    = document.querySelector('.nav-logo');
    const rootUrl     = logoLink
      ? logoLink.href.replace(/index\.html([?#].*)?$/, '')   // strip index.html → root/
      : dsaLink.href.replace(/dsa\/index\.html([?#].*)?$/, '');
    const leet150Href = rootUrl + 'dsa/leet-150/index.html';

    /* wrap the link in a relative-positioned container */
    const wrap = document.createElement('div');
    wrap.className = 'nav-link-wrap';
    dsaLink.parentNode.insertBefore(wrap, dsaLink);
    wrap.appendChild(dsaLink);

    /* build the dropdown */
    const dd = document.createElement('div');
    dd.className = 'nav-dropdown';
    dd.innerHTML = `
      <div class="nav-dd-label">Series</div>
      <a href="${leet150Href}" class="nav-dd-item">
        <span>⚡</span> LeetCode 150
        <span class="nav-dd-badge">NEW</span>
      </a>
      <!-- future series rows go here:
      <div class="nav-dd-sep"></div>
      <a href="..." class="nav-dd-item soon">🏢 Top 50 MANG</a>
      -->
    `;
    wrap.appendChild(dd);
  }

  /* ── Mobile hamburger menu (injected on every page) ── */
  const nav      = document.querySelector('.nav');
  const navLinks = nav && nav.querySelector('.nav-links');
  if (nav && navLinks) {
    const HAM_ICON  = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>`;
    const CLOSE_ICON= `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>`;

    const ham = document.createElement('button');
    ham.className   = 'nav-ham';
    ham.setAttribute('aria-label', 'Open menu');
    ham.innerHTML   = HAM_ICON;

    /* insert just before the theme button */
    const themeBtn = nav.querySelector('.theme-btn');
    nav.insertBefore(ham, themeBtn || null);

    function closeMenu() {
      navLinks.classList.remove('mobile-open');
      ham.classList.remove('open');
      ham.innerHTML = HAM_ICON;
      ham.setAttribute('aria-label', 'Open menu');
    }
    function openMenu() {
      navLinks.classList.add('mobile-open');
      ham.classList.add('open');
      ham.innerHTML = CLOSE_ICON;
      ham.setAttribute('aria-label', 'Close menu');
    }

    ham.addEventListener('click', e => {
      e.stopPropagation();
      navLinks.classList.contains('mobile-open') ? closeMenu() : openMenu();
    });

    /* close on any nav-link tap */
    navLinks.querySelectorAll('.nav-link').forEach(a =>
      a.addEventListener('click', closeMenu)
    );

    /* close when tapping outside the nav */
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) closeMenu();
    });
  }

  document.querySelectorAll('.sg-head').forEach(h => {
    h.addEventListener('click', () => {
      const items = h.nextElementSibling, arr = h.querySelector('.sg-arr');
      if(items){ items.classList.toggle('open'); if(arr) arr.classList.toggle('open'); }
    });
  });
  const act = document.querySelector('.si.active');
  if(act){ const g=act.closest('.sg-items'); if(g){ g.classList.add('open'); const a=g.previousElementSibling?.querySelector('.sg-arr'); if(a) a.classList.add('open'); } }

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
   HERO CANVAS — Modern SDE Universe 2025
   DSA · System Design · DevOps/Cloud · AI/ML Stack
═══════════════════════════════════════════════════════ */
(function(){
  const canvas = document.getElementById('hero-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, tick = 0, pktTimer = 0;

  /* ── core helpers ── */
  function h2r(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return `rgba(${r},${g},${b},${a})`;}
  function eio(t){return t<.5?2*t*t:-1+(4-2*t)*t;}
  function isDark(){return document.documentElement.getAttribute('data-theme')==='dark';}
  function fg(a=1){return isDark()?`rgba(215,215,230,${a})`:`rgba(18,18,38,${a})`;}
  const P={indigo:'#6366F1',green:'#34D399',amber:'#FBBF24',blue:'#60A5FA',purple:'#A78BFA',teal:'#2DD4BF',pink:'#F472B6',red:'#F87171'};

  function rr(x,y,w,h,r=4){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

  /* section header chip */
  function chip(text,cx,cy,col){
    ctx.shadowBlur=0;
    ctx.font=`700 8.5px 'JetBrains Mono',monospace`;
    const tw=ctx.measureText(text).width,pw=tw+14,ph=17;
    rr(cx-pw/2,cy-ph/2,pw,ph,4);
    ctx.fillStyle=isDark()?h2r(col,0.22):'rgba(255,255,255,0.88)';ctx.fill();
    ctx.strokeStyle=h2r(col,0.75);ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=h2r(col,1);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,cx,cy);
  }

  /* small topic tag */
  function tag(text,cx,cy,col){
    ctx.font=`600 7px 'JetBrains Mono',monospace`;
    const tw=ctx.measureText(text).width,pw=tw+10,ph=13;
    rr(cx-pw/2,cy-ph/2,pw,ph,3);
    ctx.fillStyle=h2r(col,isDark()?0.14:0.1);ctx.fill();
    ctx.strokeStyle=h2r(col,0.5);ctx.lineWidth=0.7;ctx.stroke();
    ctx.fillStyle=h2r(col,0.95);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,cx,cy);
  }

  /* row pill for list items */
  function rowPill(cx,y,w,h,col,active){
    rr(cx-w/2,y-h/2,w,h,4);
    ctx.fillStyle=active?h2r(col,0.2):(isDark()?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)');ctx.fill();
    ctx.strokeStyle=active?h2r(col,0.85):h2r(col,0.3);ctx.lineWidth=active?1:0.7;ctx.stroke();
  }

  /* dashed connection curves */
  function drawConn(sx,sy,ex,ey,col){
    const cpx=(sx+ex)/2+(ey-sy)*0.18,cpy=(sy+ey)/2-(ex-sx)*0.18;
    ctx.strokeStyle=h2r(col,isDark()?0.12:0.18);ctx.lineWidth=0.8;ctx.setLineDash([3,8]);
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cpx,cpy,ex,ey);ctx.stroke();ctx.setLineDash([]);
  }
  function cpFor(sx,sy,ex,ey){return{cpx:(sx+ex)/2+(ey-sy)*0.18,cpy:(sy+ey)/2-(ex-sx)*0.18};}

  /* ══ PACKETS ══ */
  let pkts=[];
  function addPkt(sx,sy,ex,ey,col,cpx,cpy){pkts.push({sx,sy,ex,ey,cpx,cpy,col,t:0,speed:0.007+Math.random()*0.005,sz:2.2+Math.random()*1.2});}
  function stepPkts(){pkts.forEach(p=>{p.t=Math.min(1,p.t+p.speed);});pkts=pkts.filter(p=>p.t<0.98);}
  function drawPkts(){
    pkts.forEach(p=>{
      const t=eio(p.t),mt=1-t;
      const px=mt*mt*p.sx+2*mt*t*p.cpx+t*t*p.ex,py=mt*mt*p.sy+2*mt*t*p.cpy+t*t*p.ey;
      for(let i=3;i>=1;i--){const tt=Math.max(0,p.t-i*0.022),t2=eio(tt),mt2=1-t2;const tx=mt2*mt2*p.sx+2*mt2*t2*p.cpx+t2*t2*p.ex,ty=mt2*mt2*p.sy+2*mt2*t2*p.cpy+t2*t2*p.ey;ctx.beginPath();ctx.arc(tx,ty,p.sz*(0.5-i*0.1),0,Math.PI*2);ctx.fillStyle=h2r(p.col,0.25-i*0.06);ctx.fill();}
      ctx.shadowBlur=10;ctx.shadowColor=p.col;
      ctx.beginPath();ctx.arc(px,py,p.sz,0,Math.PI*2);ctx.fillStyle=h2r(p.col,0.9);ctx.fill();
      ctx.beginPath();ctx.arc(px,py,p.sz*0.38,0,Math.PI*2);ctx.fillStyle=fg(0.95);ctx.fill();
      ctx.shadowBlur=0;
    });
  }

  /* ══ BACKGROUND ══ */
  let stars=[];
  function buildStars(){stars=[];for(let i=0;i<55;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*0.7,ph:Math.random()*Math.PI*2,sp:0.001+Math.random()*0.003});}
  function drawBG(){
    ctx.fillStyle=isDark()?'#09090C':'#F8F8FA';ctx.fillRect(0,0,W,H);
    const gc=isDark()?'rgba(38,38,55,0.28)':'rgba(155,155,195,0.12)';ctx.strokeStyle=gc;ctx.lineWidth=0.5;
    for(let x=0;x<W;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    stars.forEach(s=>{const a=(isDark()?0.07:0.03)*Math.abs(Math.sin(tick*s.sp+s.ph));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=isDark()?`rgba(255,255,255,${a})`:`rgba(99,102,241,${a*0.6})`;ctx.fill();});
  }

  /* ══════════════════════════════════════
     1. DSA · ALGORITHMS  (top-left)
     Binary tree with in-order traversal
     + topic tags below
  ══════════════════════════════════════ */
  let TR={};
  function buildTR(cx,cy){
    const vg=Math.min(W*0.055,H*0.09),r=Math.min(W,H)*0.03;
    TR={nodes:{},order:[],step:0,visited:new Set(),timer:0,parts:[],cx,cy,vg,R:r};
    const nd=(id,v,x,y,l,ri)=>{TR.nodes[id]={id,v,x,y,l,ri,R:r,glow:0};};
    nd(1,50,cx,cy-vg,2,3);nd(2,25,cx-vg*1.1,cy,4,5);nd(3,75,cx+vg*1.1,cy,null,null);
    nd(4,12,cx-vg*1.8,cy+vg,null,null);nd(5,37,cx-vg*0.35,cy+vg,null,null);
    TR.order=[4,2,5,1,3];
  }
  function stepTR(){
    TR.timer++;if(TR.timer%32!==0)return;
    if(TR.step>=TR.order.length){TR.step=0;TR.visited=new Set();Object.values(TR.nodes).forEach(n=>n.glow=0);return;}
    const id=TR.order[TR.step];TR.visited.add(id);const n=TR.nodes[id];
    if(n){n.glow=1;for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2;TR.parts.push({x:n.x,y:n.y,vx:Math.cos(a)*(0.7+Math.random()*1.4),vy:Math.sin(a)*(0.7+Math.random()*1.4),life:1});}}
    TR.step++;
  }
  function drawTR(){
    const{nodes,visited,parts,cx,cy,vg,R:nr}=TR;const root=nodes[1];
    chip('DSA · ALGORITHMS',cx,root?(root.y-nr-18):cy-52,P.green);
    Object.values(nodes).forEach(n=>{[n.l,n.ri].forEach(cid=>{if(!cid||!nodes[cid])return;const c=nodes[cid],both=visited.has(n.id)&&visited.has(cid);ctx.strokeStyle=both?h2r(P.green,0.65):h2r(isDark()?'#ffffff':'#000000',0.1);ctx.lineWidth=both?1.8:0.7;ctx.setLineDash(both?[]:[3,5]);ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(c.x,c.y);ctx.stroke();ctx.setLineDash([]);});});
    parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.life-=0.03;ctx.beginPath();ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fillStyle=`rgba(52,211,153,${p.life*0.8})`;ctx.fill();});TR.parts=parts.filter(p=>p.life>0);
    Object.values(nodes).forEach(n=>{
      const vis=visited.has(n.id),act=n.glow>0.05;n.glow=Math.max(0,(n.glow||0)-0.018);
      ctx.shadowBlur=act?20:vis?8:0;ctx.shadowColor=P.green;
      ctx.beginPath();ctx.arc(n.x,n.y,n.R,0,Math.PI*2);
      if(act){ctx.fillStyle='#34D399';}else if(vis){ctx.fillStyle=isDark()?'#064e3b':'#d1fae5';}else{ctx.fillStyle=isDark()?'rgba(28,28,42,0.92)':'rgba(238,240,255,0.92)';}
      ctx.fill();ctx.strokeStyle=act?P.green:vis?h2r(P.green,0.7):h2r(isDark()?'#fff':'#555',0.22);ctx.lineWidth=act?2:1;ctx.stroke();ctx.shadowBlur=0;
      ctx.fillStyle=act?'#000':vis?(isDark()?'#34D399':'#065f46'):fg(1);
      ctx.font=`700 ${Math.round(n.R*0.65)}px 'JetBrains Mono',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.v,n.x,n.y);
    });
    /* topic tags */
    const topics=['Arrays','Trees','Graphs','DP'];
    const tagW=Math.min(W*0.075,48),gap=5,totalTW=topics.length*(tagW+gap)-gap;
    const tagY=cy+vg+nr+22;
    topics.forEach((t,i)=>{tag(t,cx-totalTW/2+i*(tagW+gap)+tagW/2,tagY,P.green);});
    ctx.fillStyle=h2r(P.green,0.75);ctx.font=`600 7.5px 'JetBrains Mono',monospace`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('in-order · '+TR.step+'/'+TR.order.length,cx,tagY+18);
  }

  /* ══════════════════════════════════════
     2. SYSTEM DESIGN  (top-right)
     Distributed system components
  ══════════════════════════════════════ */
  let SD={};
  function buildSD(cx,cy){
    SD={cx,cy,timer:0,activeIdx:-1,items:[]};
    const rows=[
      {label:'load-balancer', col:P.blue},
      {label:'api-gateway',   col:P.indigo},
      {label:'redis-cache',   col:P.green},
      {label:'postgresql',    col:P.blue},
      {label:'kafka-queue',   col:P.amber},
    ];
    rows.forEach((r,i)=>SD.items.push({...r,x:cx,y:cy-22+i*23,glow:0}));
  }
  function stepSD(){SD.timer++;SD.items.forEach(d=>d.glow=Math.max(0,d.glow-0.015));if(SD.timer%44===0){const i=Math.floor(Math.random()*SD.items.length);SD.items[i].glow=1;SD.activeIdx=i;}}
  function drawSD(){
    const{cx,cy,items}=SD;
    chip('SYSTEM DESIGN',cx,cy-58,P.blue);
    /* tiny server rack icon */
    ctx.strokeStyle=h2r(P.blue,0.45);ctx.lineWidth=0.9;
    for(let i=0;i<3;i++){rr(cx-12,cy-49+i*6,24,5,1);ctx.stroke();ctx.beginPath();ctx.arc(cx+9,cy-46.5+i*6,1.5,0,Math.PI*2);ctx.fillStyle=h2r(P.blue,0.6);ctx.fill();}
    items.forEach(d=>{
      const act=d.glow>0.05,dw=96,dh=18;
      ctx.shadowBlur=act?12:0;ctx.shadowColor=d.col;
      rowPill(d.x,d.y,dw,dh,d.col,act);ctx.shadowBlur=0;
      if(act){ctx.fillStyle=h2r(d.col,1);ctx.font=`700 9px monospace`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('›',d.x-dw/2+5,d.y);}
      ctx.fillStyle=fg(act?1:0.85);ctx.font=`600 8px 'JetBrains Mono',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.label,d.x+(act?4:0),d.y);
    });
    /* topic tags */
    const topics=['HLD','LLD','CAP','Scaling'];
    const tagW=Math.min(W*0.075,44),gap=4,totalTW=topics.length*(tagW+gap)-gap;
    const tagY=items[items.length-1].y+18;
    topics.forEach((t,i)=>{tag(t,cx-totalTW/2+i*(tagW+gap)+tagW/2,tagY,P.blue);});
  }

  /* ══════════════════════════════════════
     3. DEVOPS · CLOUD  (bottom-left)
     CI/CD pipeline stages
  ══════════════════════════════════════ */
  let DV={};
  function buildDV(cx,cy){
    DV={cx,cy,timer:0,step:0,items:[]};
    const stages=[
      {label:'git-commit',  col:P.amber},
      {label:'docker-build',col:P.blue},
      {label:'run-tests',   col:P.green},
      {label:'k8s-deploy',  col:P.teal},
      {label:'monitoring',  col:P.purple},
    ];
    stages.forEach((s,i)=>DV.items.push({...s,x:cx,y:cy-22+i*23,glow:0,done:false}));
  }
  function stepDV(){
    DV.timer++;DV.items.forEach(d=>d.glow=Math.max(0,d.glow-0.014));
    if(DV.timer%36===0){
      if(DV.step>=DV.items.length){DV.step=0;DV.items.forEach(d=>{d.glow=0;d.done=false;});}
      else{DV.items[DV.step].glow=1;DV.items[DV.step].done=true;DV.step++;}
    }
  }
  function drawDV(){
    const{cx,cy,items}=DV;
    chip('DEVOPS · CLOUD',cx,cy-58,P.amber);
    /* tiny pipeline icon */
    ctx.strokeStyle=h2r(P.amber,0.45);ctx.lineWidth=0.9;
    ctx.beginPath();ctx.moveTo(cx-12,cy-49);ctx.lineTo(cx+12,cy-49);ctx.stroke();
    [cx-12,cx,cx+12].forEach(x=>{ctx.beginPath();ctx.arc(x,cy-49,2.5,0,Math.PI*2);ctx.fillStyle=h2r(P.amber,0.5);ctx.fill();});
    /* pipeline line connecting items */
    ctx.strokeStyle=h2r(P.amber,0.15);ctx.lineWidth=1;ctx.setLineDash([2,4]);
    ctx.beginPath();ctx.moveTo(cx,items[0].y);ctx.lineTo(cx,items[items.length-1].y);ctx.stroke();ctx.setLineDash([]);
    items.forEach((d,i)=>{
      const act=d.glow>0.05,done=d.done,dw=96,dh=18;
      ctx.shadowBlur=act?12:0;ctx.shadowColor=d.col;
      rowPill(d.x,d.y,dw,dh,d.col,act||done);ctx.shadowBlur=0;
      /* step dot */
      ctx.beginPath();ctx.arc(d.x-dw/2-6,d.y,3,0,Math.PI*2);
      ctx.fillStyle=done?h2r(d.col,0.9):h2r(isDark()?'#fff':'#000',0.12);ctx.fill();
      ctx.fillStyle=fg(act?1:done?0.9:0.8);ctx.font=`600 8px 'JetBrains Mono',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.label,d.x,d.y);
      if(act){ctx.fillStyle=h2r(d.col,1);ctx.font=`700 9px monospace`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('›',d.x-dw/2+5,d.y);}
    });
    /* topic tags */
    const topics=['Docker','K8s','Terraform','GitHub'];
    const tagW=Math.min(W*0.075,46),gap=4,totalTW=topics.length*(tagW+gap)-gap;
    const tagY=items[items.length-1].y+18;
    topics.forEach((t,i)=>{tag(t,cx-totalTW/2+i*(tagW+gap)+tagW/2,tagY,P.amber);});
  }

  /* ══════════════════════════════════════
     4. AI / ML STACK  (bottom-right)
     Modern AI engineering skills
  ══════════════════════════════════════ */
  let AI={};
  function buildAI(cx,cy){
    AI={cx,cy,timer:0,activeIdx:-1,items:[]};
    const rows=[
      {label:'llm / gpt-4o',  col:P.purple},
      {label:'rag-pipeline',  col:P.blue},
      {label:'ai-agents',     col:P.indigo},
      {label:'embeddings',    col:P.teal},
      {label:'fine-tuning',   col:P.pink},
    ];
    rows.forEach((r,i)=>AI.items.push({...r,x:cx,y:cy-22+i*23,glow:0}));
  }
  function stepAI(){AI.timer++;AI.items.forEach(d=>d.glow=Math.max(0,d.glow-0.015));if(AI.timer%42===0){const i=Math.floor(Math.random()*AI.items.length);AI.items[i].glow=1;AI.activeIdx=i;}}
  function drawAI(){
    const{cx,cy,items}=AI;
    chip('AI · ML STACK',cx,cy-58,P.purple);
    /* tiny brain/neural icon */
    ctx.strokeStyle=h2r(P.purple,0.5);ctx.lineWidth=0.9;
    ctx.beginPath();ctx.arc(cx,cy-48,8,0,Math.PI*2);ctx.stroke();
    [[cx-4,cy-48],[cx+4,cy-48],[cx,cy-44],[cx,cy-52]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fillStyle=h2r(P.purple,0.55);ctx.fill();});
    items.forEach(d=>{
      const act=d.glow>0.05,dw=96,dh=18;
      ctx.shadowBlur=act?12:0;ctx.shadowColor=d.col;
      rowPill(d.x,d.y,dw,dh,d.col,act);ctx.shadowBlur=0;
      if(act){ctx.fillStyle=h2r(d.col,1);ctx.font=`700 9px monospace`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('›',d.x-dw/2+5,d.y);}
      ctx.fillStyle=fg(act?1:0.85);ctx.font=`600 8px 'JetBrains Mono',monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.label,d.x+(act?4:0),d.y);
    });
    /* topic tags */
    const topics=['LLMs','RAG','MCP','Agents'];
    const tagW=Math.min(W*0.075,44),gap=4,totalTW=topics.length*(tagW+gap)-gap;
    const tagY=items[items.length-1].y+18;
    topics.forEach((t,i)=>{tag(t,cx-totalTW/2+i*(tagW+gap)+tagW/2,tagY,P.purple);});
  }

  /* ══════════════════════════════════════
     CENTER: SDE 2025 HUB  (faded)
  ══════════════════════════════════════ */
  let agRings=[0,0.33,0.66];
  function drawHub(cx,cy){
    const R=Math.min(W,H)*0.082,pulse=0.5+Math.sin(tick*0.036)*0.5;
    agRings=agRings.map(r=>(r+0.0025)%1);
    agRings.forEach(r=>{ctx.beginPath();ctx.arc(cx,cy,R+r*R*1.5,0,Math.PI*2);ctx.strokeStyle=h2r(P.indigo,(1-r)*0.05);ctx.lineWidth=1;ctx.stroke();});
    ctx.shadowBlur=6+pulse*5;ctx.shadowColor=P.indigo;
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
    const go=ctx.createRadialGradient(cx,cy,R*0.5,cx,cy,R);go.addColorStop(0,h2r(P.indigo,0.06));go.addColorStop(1,h2r(P.indigo,0.01));
    ctx.fillStyle=go;ctx.fill();ctx.strokeStyle=h2r(P.indigo,0.12+pulse*0.07);ctx.lineWidth=1;ctx.stroke();ctx.shadowBlur=0;
    const R2=R*0.68;ctx.beginPath();ctx.arc(cx,cy,R2,0,Math.PI*2);
    const gi=ctx.createRadialGradient(cx,cy,0,cx,cy,R2);gi.addColorStop(0,'#1a1845');gi.addColorStop(1,'#0f0e28');
    ctx.fillStyle=gi;ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.22)';
    ctx.font=`800 ${Math.round(R*0.28)}px 'Plus Jakarta Sans',sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('SDE',cx,cy-R2*0.16);
    ctx.fillStyle=h2r(P.indigo,0.3);
    ctx.font=`600 ${Math.round(R*0.17)}px 'JetBrains Mono',monospace`;
    ctx.fillText('2025',cx,cy+R2*0.22);
    [P.green,P.blue,P.amber,P.purple].forEach((col,i)=>{
      const a=tick*0.022+i*Math.PI/2;
      ctx.beginPath();ctx.arc(cx+Math.cos(a)*(R+5),cy+Math.sin(a)*(R+5),1.8,0,Math.PI*2);
      ctx.fillStyle=h2r(col,0.45);ctx.shadowBlur=3;ctx.shadowColor=col;ctx.fill();ctx.shadowBlur=0;
    });
  }

  /* ══ PACKET SPAWNER ══ */
  function spawnPkts(agCx,agCy){
    pktTimer++;
    const tN=TR.nodes,tO=TR.order,sI=SD.items,dI=DV.items,aI=AI.items;
    /* DSA → hub */
    if(pktTimer%52===2&&TR.step>0){const id=tO[(TR.step-1)%tO.length];const n=tN[id];if(n){const{cpx,cpy}=cpFor(n.x,n.y,agCx,agCy);addPkt(n.x,n.y,agCx,agCy,P.green,cpx,cpy);}}
    /* hub → DSA query */
    if(pktTimer%68===18){const n=tN[tO[Math.floor(Math.random()*tO.length)]];if(n){const{cpx,cpy}=cpFor(agCx,agCy,n.x,n.y);addPkt(agCx,agCy,n.x,n.y,P.indigo,cpx,cpy);}}
    /* System Design ↔ hub */
    if(pktTimer%46===8){const d=sI[Math.floor(Math.random()*sI.length)];const{cpx,cpy}=cpFor(d.x,d.y,agCx,agCy);addPkt(d.x,d.y,agCx,agCy,P.blue,cpx,cpy);}
    if(pktTimer%60===24){const d=sI[Math.floor(Math.random()*sI.length)];const{cpx,cpy}=cpFor(agCx,agCy,d.x,d.y);addPkt(agCx,agCy,d.x,d.y,P.indigo,cpx,cpy);}
    /* DevOps ↔ hub */
    if(pktTimer%50===30&&DV.step>0){const d=dI[(DV.step-1)%dI.length];const{cpx,cpy}=cpFor(d.x,d.y,agCx,agCy);addPkt(d.x,d.y,agCx,agCy,P.amber,cpx,cpy);}
    if(pktTimer%64===40){const d=dI[Math.floor(Math.random()*dI.length)];const{cpx,cpy}=cpFor(agCx,agCy,d.x,d.y);addPkt(agCx,agCy,d.x,d.y,P.amber,cpx,cpy);}
    /* AI/ML ↔ hub */
    if(pktTimer%44===12){const d=aI[Math.floor(Math.random()*aI.length)];const{cpx,cpy}=cpFor(d.x,d.y,agCx,agCy);addPkt(d.x,d.y,agCx,agCy,P.purple,cpx,cpy);}
    if(pktTimer%56===35){const d=aI[Math.floor(Math.random()*aI.length)];const{cpx,cpy}=cpFor(agCx,agCy,d.x,d.y);addPkt(agCx,agCy,d.x,d.y,P.purple,cpx,cpy);}
  }

  /* ══ MAIN LOOP ══ */
  const lblEl=document.getElementById('cb-scene-label');
  const rpsEl=document.getElementById('cb-rps');
  const latEl=document.getElementById('cb-lat');
  let rpsTimer=0;

  function draw(){
    ctx.clearRect(0,0,W,H);tick++;drawBG();
    const agCx=W/2,agCy=H/2;
    /* connection curves */
    drawConn(TR.cx,TR.cy,agCx,agCy,P.green);
    drawConn(SD.cx,SD.cy,agCx,agCy,P.blue);
    drawConn(DV.cx,DV.cy,agCx,agCy,P.amber);
    drawConn(AI.cx,AI.cy,agCx,agCy,P.purple);
    /* step & draw all sections */
    stepTR();stepSD();stepDV();stepAI();spawnPkts(agCx,agCy);stepPkts();
    drawPkts();drawTR();drawSD();drawDV();drawAI();drawHub(agCx,agCy);
    rpsTimer++;
    if(rpsTimer>=60){
      if(rpsEl)rpsEl.textContent=(5+Math.floor(Math.random()*8))+'k loc/day';
      if(latEl)latEl.textContent=(8+Math.floor(Math.random()*12))+'ms';
      rpsTimer=0;
    }
    requestAnimationFrame(draw);
  }

  function build(){
    buildTR(W*0.18,H*0.26);
    buildSD(W*0.82,H*0.28);
    buildDV(W*0.18,H*0.72);
    buildAI(W*0.82,H*0.72);
    pkts=[];
  }

  function resize(){
    const r=canvas.getBoundingClientRect();
    W=canvas.width=r.width;H=canvas.height=r.height;
    buildStars();build();
  }
  window.addEventListener('resize',resize);
  if(lblEl)lblEl.textContent='SDE · FULL STACK 2025';
  resize();draw();
})();
