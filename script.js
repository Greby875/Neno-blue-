/* ============================================================
   GREBY AFFILIATE — interaction layer
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. Intro sequence (~3s, skippable) ---------- */
  const intro = document.getElementById("intro");
  const introSkip = document.getElementById("introSkip");
  const INTRO_DURATION = 3000;
  let introClosed = false;

  function closeIntro() {
    if (introClosed) return;
    introClosed = true;
    intro.classList.add("hide");
    document.body.style.overflow = "";
    revealOnScroll();
  }

  document.body.style.overflow = "hidden";
  const introTimer = setTimeout(closeIntro, INTRO_DURATION);
  introSkip.addEventListener("click", () => { clearTimeout(introTimer); closeIntro(); });

  /* ---------- 2. Intro particle canvas ---------- */
  function initNetwork(canvasId, density) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [], w, h;
    function resize(){ w = canvas.width = canvas.offsetWidth * devicePixelRatio; h = canvas.height = canvas.offsetHeight * devicePixelRatio; }
    function make(){
      const count = Math.round((canvas.offsetWidth * canvas.offsetHeight) / (density * 1000));
      particles = Array.from({length: Math.max(24, Math.min(count, 80))}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        vx: (Math.random()-0.5)*0.3*devicePixelRatio, vy: (Math.random()-0.5)*0.3*devicePixelRatio,
        r: Math.random()*1.7+0.6
      }));
    }
    function step(){
      ctx.clearRect(0,0,w,h);
      const maxDist = 140*devicePixelRatio;
      particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1; });
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const a=particles[i], b=particles[j];
          const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<maxDist){
            ctx.strokeStyle = `rgba(79,168,255,${0.22*(1-dist/maxDist)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      particles.forEach(p=>{
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*devicePixelRatio,0,Math.PI*2);
        ctx.fillStyle = "rgba(150,210,255,0.85)";
        ctx.shadowColor = "rgba(79,168,255,0.9)"; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      requestAnimationFrame(step);
    }
    resize(); make(); step();
    window.addEventListener("resize", ()=>{ resize(); make(); });
  }
  initNetwork("introCanvas", 75);

  /* ---------- 3. Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  function revealOnScroll(){
    revealEls.forEach(el=>{
      const rect = el.getBoundingClientRect();
      if(rect.top < window.innerHeight*0.9) el.classList.add("in");
    });
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add("in"); });
  }, { threshold:0.15 });
  revealEls.forEach(el=>io.observe(el));

  /* ---------- 4. Staggered pin-card reveal ---------- */
  const pinCards = document.querySelectorAll(".pin-card");
  const pinIo = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const delay = parseInt(entry.target.dataset.step || 1) * 120;
        setTimeout(()=> entry.target.classList.add("in"), delay);
      }
    });
  }, { threshold:0.3 });
  pinCards.forEach(el=>pinIo.observe(el));

  /* ---------- 5. Nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const navMobile = document.getElementById("navMobile");
  burger.addEventListener("click", ()=> navMobile.classList.toggle("open"));
  navMobile.querySelectorAll("a").forEach(el=> el.addEventListener("click", ()=> navMobile.classList.remove("open")));

  document.querySelectorAll("[data-scroll]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const target = document.querySelector(btn.dataset.scroll);
      if(target) target.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });

  /* ---------- 6. Scroll-linked hero orb rotation + parallax bg ---------- */
  const orbStage = document.getElementById("orbStage");
  const parallaxImg = document.querySelector(".parallax-img");
  const parallaxSection = document.querySelector(".parallax-section");
  let ticking = false;

  function onScroll(){
    const scrollY = window.scrollY;

    // hero orb rotates as the page scrolls, then eases off after the hero
    if(orbStage){
      const heroHeight = window.innerHeight;
      const progress = Math.min(scrollY / heroHeight, 1.4);
      const rotY = progress * 220;
      const rotX = progress * -18;
      const scale = 1 - Math.min(progress * 0.12, 0.15);
      orbStage.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`;
    }

    // parallax image drifts slower than scroll while its section is in view
    if(parallaxImg && parallaxSection){
      const rect = parallaxSection.getBoundingClientRect();
      if(rect.top < window.innerHeight && rect.bottom > 0){
        const shift = rect.top * 0.15;
        parallaxImg.style.transform = `translateY(${shift}px)`;
      }
    }

    nav.style.boxShadow = scrollY > 12 ? "0 8px 24px rgba(0,0,0,.45)" : "none";
    revealOnScroll();
    ticking = false;
  }

  window.addEventListener("scroll", ()=>{
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });
  onScroll();

  /* ---------- 7. Forms (demo — no backend wired) ---------- */
  document.querySelectorAll(".alert-form, .join-form").forEach(form=>{
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const btn = form.querySelector("button");
      const original = btn.textContent;
      btn.textContent = "You're in ✓";
      setTimeout(()=> btn.textContent = original, 2200);
      form.reset();
    });
  });

});
