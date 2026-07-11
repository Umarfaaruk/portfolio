/* Umar Faaruk portfolio — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Navbar: scrolled state ===== */
  var navbar = document.getElementById("navbar");

  function onScrollNavbar() {
    navbar.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollNavbar, { passive: true });
  onScrollNavbar();

  /* ===== Mobile menu ===== */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // close menu when a link is clicked
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ===== Active nav link on scroll ===== */
  var sections = document.querySelectorAll("section[id]");
  var navAnchors = document.querySelectorAll("[data-nav]");

  function setActiveLink() {
    var pos = window.scrollY + 120;
    var currentId = "home";
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) currentId = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();

  /* ===== Typing effect ===== */
  var roles = [
    "AI/ML Engineer",
    "Deep Learning Developer",
    "Computer Vision Engineer",
    "Full-Stack AI Builder"
  ];
  var typedEl = document.getElementById("typed-text");

  if (reduceMotion) {
    typedEl.textContent = roles[0];
  } else {
    var roleIdx = 0, charIdx = 0, deleting = false;

    function typeLoop() {
      var word = roles[roleIdx];
      typedEl.textContent = word.slice(0, charIdx);

      var delay;
      if (!deleting) {
        charIdx++;
        delay = 70;
        if (charIdx > word.length) {
          deleting = true;
          delay = 1800;
        }
      } else {
        charIdx--;
        delay = 38;
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          delay = 350;
        }
      }
      setTimeout(typeLoop, delay);
    }
    typeLoop();
  }

  /* ===== Scroll reveal ===== */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ===== Animated counters ===== */
  var counters = document.querySelectorAll(".stat-num");

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var start = null;
    var duration = 1400;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterIO.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ===== Project filters ===== */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      var filter = btn.getAttribute("data-filter");
      projectCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("hidden", !match);
      });
    });
  });

  /* ===== Tilt effect on cards (desktop, fine pointers only) ===== */
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" +
          (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ===== Cursor glow + card light tracking (desktop only) ===== */
  if (finePointer && !reduceMotion) {
    var glow = document.getElementById("cursor-glow");
    var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    var tx = gx, ty = gy;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      document.body.classList.add("cursor-active");
    }, { passive: true });

    (function glowLoop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = "translate(" + (gx - 230) + "px," + (gy - 230) + "px)";
      requestAnimationFrame(glowLoop);
    })();

    // per-card highlight position
    document.querySelectorAll(".glass-card, .project-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      }, { passive: true });
    });
  }

  /* ===== Contact form (mailto — works on a static site) ===== */
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = form.elements.name;
    var email = form.elements.email;
    var subject = form.elements.subject;
    var message = form.elements.message;

    // validate
    var valid = true;
    [name, email, message].forEach(function (field) {
      var ok = field.value.trim().length > 0;
      if (field.type === "email") {
        ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      field.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      note.textContent = "Please fill in your name, a valid email and a message.";
      note.classList.add("error");
      return;
    }

    note.classList.remove("error");
    var mailSubject = subject.value.trim() || "Portfolio contact from " + name.value.trim();
    var body =
      "Hi Umar,\n\n" + message.value.trim() +
      "\n\n— " + name.value.trim() + " (" + email.value.trim() + ")";

    window.location.href =
      "mailto:umarfaaruk154246@gmail.com" +
      "?subject=" + encodeURIComponent(mailSubject) +
      "&body=" + encodeURIComponent(body);

    note.textContent = "Opening your email app… If nothing happens, email me directly at umarfaaruk154246@gmail.com.";
    form.reset();
  });

  // clear invalid state while typing
  form.querySelectorAll("input, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      field.classList.remove("invalid");
      note.textContent = "";
      note.classList.remove("error");
    });
  });

  /* ===== Back to top ===== */
  var backToTop = document.getElementById("back-to-top");

  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("visible", window.scrollY > 600);
  }, { passive: true });

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ===== Footer year ===== */
  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
