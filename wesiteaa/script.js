/* ===================================================================
   AA INTERIORS — Site Scripts
=================================================================== */
(function(){
  "use strict";

  /* ---------- Preloader ---------- */
  window.addEventListener("load", function(){
    var pre = document.getElementById("preloader");
    setTimeout(function(){ pre.classList.add("is-hidden"); }, 400);
  });

  /* ---------- Sticky header on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var backToTop = document.getElementById("backToTop");
  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    if (y > 60) header.classList.add("scrolled"); else header.classList.remove("scrolled");
    if (y > 600) backToTop.classList.add("show"); else backToTop.classList.remove("show");
    updateActiveNav();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  backToTop.addEventListener("click", function(){ window.scrollTo({ top:0, behavior:"smooth" }); });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", function(){
    var open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = ["home","projects","gallery","about"].map(function(id){ return document.getElementById(id); });
  function updateActiveNav(){
    var y = window.scrollY + 140;
    var current = sections[0];
    sections.forEach(function(sec){ if (sec && sec.offsetTop <= y) current = sec; });
    navLinks.forEach(function(link){
      link.classList.toggle("active", current && link.getAttribute("href") === "#" + current.id);
    });
  }

  /* ---------- Hero auto-slider ---------- */
  var slides = document.querySelectorAll(".hero-slide");
  var dotsWrap = document.getElementById("heroDots");
  var current = 0;
  var heroTimer;

  slides.forEach(function(_, i){
    var d = document.createElement("button");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", "Show slide " + (i+1));
    d.addEventListener("click", function(){ goToSlide(i); resetHeroTimer(); });
    dotsWrap.appendChild(d);
  });
  var dots = dotsWrap.querySelectorAll(".dot");

  function goToSlide(i){
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = i;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }
  function nextSlide(){ goToSlide((current + 1) % slides.length); }
  function resetHeroTimer(){
    clearInterval(heroTimer);
    heroTimer = setInterval(nextSlide, 5000);
  }
  resetHeroTimer();

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".hl-num");
  var countersStarted = false;
  function startCounters(){
    if (countersStarted) return;
    countersStarted = true;
    counters.forEach(function(el){
      var target = parseInt(el.getAttribute("data-count"), 10);
      var dur = 1400;
      var startTime = null;
      function step(ts){
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / dur, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }
  setTimeout(startCounters, 900); // hero is visible on load

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  var revealObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  function applyReveal(){
    document.querySelectorAll(
      ".about-media, .about-copy, .project-card, .why-card, .section-head"
    ).forEach(function(el){
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }
  applyReveal();

  /* ---------- Gallery data + masonry render ---------- */
  var galleryData = [
    { src:'assets/living/slide1.jpeg', cat:"living", label:"Living Room", title:"Warm Walnut Living Space", size:"tall" },
    { src:'assets/kitchen/slide1.jpeg', cat:"kitchen", label:"Kitchen", title:"Handle-less Modular Kitchen", size:"normal" },
    { src:'assets/bedroom/slide1.jpeg', cat:"bedroom", label:"Bedroom", title:"Minimal Master Bedroom", size:"short" },
    { src:'assets/tv/slide1.jpeg', cat:"tvunit", label:"TV Unit", title:"Floating TV Console Wall", size:"tall" },
    { src:'assets/pooja/slide1.jpeg', cat:"ceiling", label:"False Ceiling", title:"Cove-Lit Living Ceiling", size:"normal" },
    { src:'assets/wardrobe/slide1.jpeg', cat:"wardrobe", label:"Wardrobe", title:"Sliding Wardrobe in Oak", size:"short" },
    { src:'assets/kitchen/slide2.jpeg', cat:"kitchen", label:"Kitchen", title:"Island Kitchen with Quartz Top", size:"normal" },
    { src:'assets/wardrobe/slide2.jpeg', cat:"wardrobe", label:"Wardrobe", title:"Walk-in Closet Storage", size:"tall" },
    { src:'assets/living/slide2.jpeg', cat:"living", label:"Living Room", title:"Charcoal &amp; Gold Lounge", size:"normal" },
    { src:'assets/bedroom/slide1.jpeg', cat:"bedroom", label:"Bedroom", title:"Soft Neutral Bedroom Suite", size:"normal" },
    { src:'assets/pooja/slide2.jpeg', cat:"ceiling", label:"False Ceiling", title:"Geometric Ceiling Design", size:"short" },
    { src:'assets/tv/slide1.jpeg', cat:"tvunit", label:"TV Unit", title:"Wood-Panel Media Wall", size:"normal" },
    { src:'assets/living/slide1.jpeg', cat:"living", label:"Living Room", title:"Open-Plan Living &amp; Dining", size:"tall" },
      { src:'assets/wardrobe/slide3.jpeg', cat:"wardrobe", label:"Wardrobe", title:"Sliding Wardrobe in Oak", size:"short" },
  
	{ src:'assets/kitchen/slide3.jpeg', cat:"kitchen", label:"Kitchen", title:"Compact U-Shape Kitchen", size:"short" }
  ];

  var grid = document.getElementById("masonryGrid");
  var VISIBLE_INITIAL = 8;
  var visibleCount = VISIBLE_INITIAL;
  var activeFilter = "all";

  function renderGallery(){
    grid.innerHTML = "";
    var filtered = galleryData.filter(function(item){ return activeFilter === "all" || item.cat === activeFilter; });
    var toShow = filtered.slice(0, visibleCount);

    toShow.forEach(function(item, idx){
      var fig = document.createElement("figure");
      fig.className = "masonry-item";
      fig.setAttribute("data-cat", item.cat);
      fig.innerHTML =
        '<img src="' + item.src + '" alt="' + item.title + ' — AA Interiors" loading="lazy" width="800" height="800">' +
        '<div class="masonry-caption"><span>' + item.label + '</span><strong>' + item.title + '</strong></div>' +
        '<span class="masonry-zoom">&#8599;</span>';
      fig.addEventListener("click", function(){ openLightbox(filtered, idx); });
      grid.appendChild(fig);

      // staggered reveal
      setTimeout(function(){ fig.classList.add("in-view"); }, idx * 60);
    });

    var loadMoreBtn = document.getElementById("loadMoreBtn");
    loadMoreBtn.style.display = (visibleCount >= filtered.length) ? "none" : "inline-flex";
  }

  document.getElementById("galleryFilters").addEventListener("click", function(e){
    var btn = e.target.closest(".filter-swatch");
    if (!btn) return;
    document.querySelectorAll(".filter-swatch").forEach(function(b){ b.classList.remove("active"); });
    btn.classList.add("active");
    activeFilter = btn.getAttribute("data-filter");
    visibleCount = VISIBLE_INITIAL;
    renderGallery();
  });

  document.getElementById("loadMoreBtn").addEventListener("click", function(){
    visibleCount += 6;
    renderGallery();
  });

  renderGallery();

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var currentSet = [];
  var currentIndex = 0;

  function openLightbox(set, idx){
    currentSet = set;
    currentIndex = idx;
    showLightboxImage();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function showLightboxImage(){
    var item = currentSet[currentIndex];
    lightboxImg.src = item.src.replace("w=800", "w=1600");
    lightboxImg.alt = item.title;
    lightboxCaption.innerHTML = item.title + " &middot; " + item.label;
  }
  function closeLightbox(){
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function(e){ if (e.target === lightbox) closeLightbox(); });
  document.getElementById("lightboxNext").addEventListener("click", function(){
    currentIndex = (currentIndex + 1) % currentSet.length;
    showLightboxImage();
  });
  document.getElementById("lightboxPrev").addEventListener("click", function(){
    currentIndex = (currentIndex - 1 + currentSet.length) % currentSet.length;
    showLightboxImage();
  });
  document.addEventListener("keydown", function(e){
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") document.getElementById("lightboxNext").click();
    if (e.key === "ArrowLeft") document.getElementById("lightboxPrev").click();
  });

  /* ---------- Testimonials carousel ---------- */
  var testiCards = document.querySelectorAll(".testi-card");
  var testiDotsWrap = document.getElementById("testiDots");
  var testiIndex = 0;
  var testiTimer;

  testiCards.forEach(function(_, i){
    var d = document.createElement("button");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.setAttribute("aria-label", "Show testimonial " + (i+1));
    d.addEventListener("click", function(){ goToTesti(i); resetTestiTimer(); });
    testiDotsWrap.appendChild(d);
  });
  var testiDots = testiDotsWrap.querySelectorAll(".dot");
  testiCards[0].classList.add("active");

  function goToTesti(i){
    testiCards[testiIndex].classList.remove("active");
    testiDots[testiIndex].classList.remove("active");
    testiIndex = i;
    testiCards[testiIndex].classList.add("active");
    testiDots[testiIndex].classList.add("active");
  }
  function nextTesti(){ goToTesti((testiIndex + 1) % testiCards.length); }
  function resetTestiTimer(){
    clearInterval(testiTimer);
    testiTimer = setInterval(nextTesti, 6000);
  }
  document.getElementById("testiNext").addEventListener("click", function(){ nextTesti(); resetTestiTimer(); });
  document.getElementById("testiPrev").addEventListener("click", function(){
    goToTesti((testiIndex - 1 + testiCards.length) % testiCards.length);
    resetTestiTimer();
  });
  resetTestiTimer();

})();
