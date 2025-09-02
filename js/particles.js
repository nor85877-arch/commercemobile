/* Quantum particle network – ultra-light for mobile */
(() => {
  const canvas = document.createElement('canvas');
  canvas.id = 'quantum-canvas';
  Object.assign(canvas.style, {
    position:'fixed', inset:'0', zIndex:'0', pointerEvents:'none'
  });
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha:true });

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let W=0, H=0, particles=[], mouse={x:-9999,y:-9999}, productNodes=[];

  const PALETTE = ['#00e5ff','#1de9b6'];
  const CONFIG = {
    count: 35,              // ↓ even fewer particles
    maxSpeed: 0.25,         // slightly slower
    linkDist: 160,          // ↑ wider links
    mouseDist: 180,
    nodeLinkDist: 220       // ↑ pull radius
  };

  function resize(){
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth+'px';
    canvas.style.height = window.innerHeight+'px';
  }
  function rand(n){ return Math.random()*n }
  function choice(arr){ return arr[(Math.random()*arr.length)|0] }

  class Particle{
    constructor(){
      this.x = rand(W); this.y = rand(H);
      this.vx = (Math.random()*2-1) * CONFIG.maxSpeed * DPR;
      this.vy = (Math.random()*2-1) * CONFIG.maxSpeed * DPR;
      this.c = choice(PALETTE);
      this.r = (Math.random()*1.4 + 0.6) * DPR; // slightly smaller dots
    }
    step(){
      this.x += this.vx; this.y += this.vy;
      if(this.x<0||this.x>W) this.vx*=-1;
      if(this.y<0||this.y>H) this.vy*=-1;
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d2 = dx*dx+dy*dy, md = CONFIG.mouseDist*DPR;
      if(d2 < md*md){
        const f = (md - Math.sqrt(d2)) / md * 0.012;
        this.vx += (dx/Math.sqrt(d2+0.001))*f;
        this.vy += (dy/Math.sqrt(d2+0.001))*f;
      }
      if(productNodes.length){
        let nx=0,ny=0,mind=Infinity;
        for(const n of productNodes){
          const ddx=(n.x*DPR)-this.x, ddy=(n.y*DPR)-this.y, d=Math.hypot(ddx,ddy);
          if(d<mind){mind=d;nx=ddx;ny=ddy;}
        }
        if(mind<CONFIG.nodeLinkDist*DPR){
          const f=(CONFIG.nodeLinkDist*DPR-mind)/(CONFIG.nodeLinkDist*DPR)*0.006;
          this.vx+=(nx/(mind+0.001))*f;
          this.vy+=(ny/(mind+0.001))*f;
        }
      }
    }
    draw(){
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = this.c; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha=1;
    }
  }

  function collectProductNodes(){
    productNodes = [];
    document.querySelectorAll('.product-card').forEach(el=>{
      const r = el.getBoundingClientRect();
      productNodes.push({x:r.left+r.width/2,y:r.top+r.height/2});
    });
  }

  function init(){
    resize();
    particles = Array.from({length:CONFIG.count},()=>new Particle());
    collectProductNodes();
    loop();
    const setVh=()=>document.documentElement.style.setProperty('--vh',window.innerHeight*0.01+'px');
    setVh();
    window.addEventListener('resize',()=>{resize();collectProductNodes();setVh();});
    window.addEventListener('scroll',collectProductNodes,{passive:true});
    window.addEventListener('mousemove',e=>{mouse.x=e.clientX*DPR;mouse.y=e.clientY*DPR;},{passive:true});
    window.addEventListener('mouseout',()=>{mouse.x=-9999;mouse.y=-9999;});
  }

  function drawLinks(){
    const maxD=CONFIG.linkDist*DPR;
    ctx.lineWidth=0.8*DPR;
    for(let i=0;i<particles.length;i++){
      const a=particles[i];
      for(let j=i+1;j<particles.length;j++){
        const b=particles[j];
        const dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
        if(d<maxD){
          const t=1-d/maxD;
          ctx.strokeStyle=`rgba(0,229,255,${0.25*t})`;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
  }

  function loop(){
    ctx.clearRect(0,0,W,H);
    for(const p of particles){p.step(); p.draw();}
    drawLinks();
    requestAnimationFrame(loop);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
