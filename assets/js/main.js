/* Umar Faaruk portfolio — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ===== Boot preloader ===== */
  (function () {
    var pre = document.getElementById("preloader");
    if (!pre) return;

    var seen = false;
    try { seen = sessionStorage.getItem("uf-booted") === "1"; } catch (e) { }

    if (reduceMotion || seen) {
      pre.classList.add("skip");
      return;
    }
    try { sessionStorage.setItem("uf-booted", "1"); } catch (e) { }

    var linesEl = document.getElementById("pre-lines");
    var bootLines = [
      "> initializing neural core .......... <span class=\"ok\">ok</span>",
      "> loading 3d particle field ......... <span class=\"ok\">ok</span>",
      "> mounting portfolio.sys ............ <span class=\"ok\">ready ✓</span>"
    ];
    var li = 0;

    function nextLine() {
      if (li < bootLines.length) {
        var d = document.createElement("div");
        d.innerHTML = bootLines[li++];
        linesEl.appendChild(d);
        setTimeout(nextLine, 420);
      } else {
        setTimeout(finish, 480);
      }
    }

    function finish() {
      pre.classList.add("done");
      setTimeout(function () {
        if (pre.parentNode) pre.parentNode.removeChild(pre);
      }, 700);
    }

    setTimeout(nextLine, 260);
    // absolute failsafe — never trap the visitor behind the overlay
    setTimeout(finish, 3200);
  })();

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
  var roles = ["SHIP.", "SELL.", "SCALE.", "LAST."];
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

  /* ===== Cursor glow + ring + card light tracking (desktop only) ===== */
  if (finePointer && !reduceMotion) {
    var glow = document.getElementById("cursor-glow");
    var ring = document.createElement("div");
    ring.id = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);

    var gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    var rx = gx, ry = gy, rs = 1, rsTarget = 1;
    var tx = gx, ty = gy;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      document.body.classList.add("cursor-active");
    }, { passive: true });

    document.addEventListener("mouseover", function (e) {
      rsTarget = e.target.closest("a, button, input, textarea, .tilt-card") ? 1.9 : 1;
    }, { passive: true });

    (function glowLoop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = "translate(" + (gx - 230) + "px," + (gy - 230) + "px)";
      rx += (tx - rx) * 0.3;
      ry += (ty - ry) * 0.3;
      rs += (rsTarget - rs) * 0.18;
      ring.style.transform = "translate(" + (rx - 18) + "px," + (ry - 18) + "px) scale(" + rs.toFixed(3) + ")";
      requestAnimationFrame(glowLoop);
    })();

    // magnetic pull on primary buttons and social icons
    document.querySelectorAll(".hero-cta .btn, .social-btn").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.18;
        var dy = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy - 2).toFixed(1) + "px)";
      }, { passive: true });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });

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

  /* ===== Decoder effect: name scrambles into place ===== */
  (function () {
    var nameEl = document.querySelector(".hero-title .gradient-text");
    if (!nameEl || reduceMotion) return;
    var final = nameEl.textContent;
    var glyphs = "!<>-_\\/[]{}=+*^?#01";
    var start = null;
    var duration = 1100;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var lock = Math.floor(p * final.length);
      var s = final.slice(0, lock);
      for (var i = lock; i < final.length; i++) {
        s += final[i] === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      nameEl.textContent = s;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        nameEl.textContent = final;
      }
    }
    setTimeout(function () { requestAnimationFrame(step); }, 600);
  })();

  /* ===== Kinetic section titles: characters stagger in ===== */
  if (!reduceMotion) {
    document.querySelectorAll(".section-title").forEach(function (title) {
      var idx = 0;
      function split(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split("").forEach(function (ch) {
              if (ch.trim() === "") {
                frag.appendChild(document.createTextNode(ch));
                return;
              }
              var s = document.createElement("span");
              s.className = "tchar";
              s.style.setProperty("--i", idx++);
              s.textContent = ch;
              frag.appendChild(s);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            // keep gradient words whole so the gradient spans the full word
            child.classList.add("tchar");
            child.style.setProperty("--i", idx++);
          }
        });
      }
      split(title);
    });
  }

  /* ===== Scroll progress bar ===== */
  var progressBar = document.getElementById("scroll-progress");
  window.addEventListener("scroll", function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }, { passive: true });

  /* ===== Rotating greeting (a nod to the Telugu LLM work) ===== */
  var greetEl = document.getElementById("greet");
  if (greetEl && !reduceMotion) {
    var greetings = ["Hi", "నమస్తే", "Hello", "Namaste"];
    var gi = 0;
    setInterval(function () {
      greetEl.classList.add("greet-out");
      setTimeout(function () {
        gi = (gi + 1) % greetings.length;
        greetEl.textContent = greetings[gi];
        greetEl.classList.remove("greet-out");
      }, 320);
    }, 3200);
  }

  /* ===== Live GitHub stats (fails silently offline) ===== */
  (function () {
    var fact = document.getElementById("gh-fact");
    var text = document.getElementById("gh-fact-text");
    if (!fact || !text || typeof fetch === "undefined") return;
    fetch("https://api.github.com/users/Umarfaaruk")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && typeof d.public_repos === "number") {
          text.textContent = d.public_repos + " public repos · " +
            d.followers + " followers on GitHub";
          fact.hidden = false;
        }
      })
      .catch(function () { /* offline or rate-limited — fact stays hidden */ });
  })();

  /* ===== Matrix rain Easter egg (Telugu edition) ===== */
  var matrixRaf = null;
  var matrixCanvas = null;
  var matrixTimeout = null;

  function stopMatrix() {
    if (matrixRaf) cancelAnimationFrame(matrixRaf);
    matrixRaf = null;
    if (matrixTimeout) clearTimeout(matrixTimeout);
    matrixTimeout = null;
    if (matrixCanvas) {
      var c = matrixCanvas;
      matrixCanvas = null;
      c.classList.remove("on");
      setTimeout(function () {
        if (c.parentNode) c.parentNode.removeChild(c);
      }, 650);
    }
  }

  function startMatrix() {
    if (matrixCanvas || reduceMotion) return;
    var c = document.createElement("canvas");
    c.id = "matrix-canvas";
    document.body.appendChild(c);
    matrixCanvas = c;

    var ctx = c.getContext("2d");
    var chars = "01అఆఇఈఉఊఎఏఐఒఓకఖగఘచఛజఝటఠడఢణతథదధనపఫబభమయరలవశషసహ01";
    var fontSize = 16;
    var cols, drops;

    function size() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      cols = Math.floor(c.width / fontSize);
      drops = new Array(cols).fill(1);
    }
    size();

    var frame = 0;
    function rain() {
      matrixRaf = requestAnimationFrame(rain);
      if (++frame % 2 !== 0) return; // ~30fps
      ctx.fillStyle = "rgba(5, 8, 16, 0.09)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = fontSize + "px monospace";
      for (var i = 0; i < cols; i++) {
        var ch = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillStyle = Math.random() > 0.92 ? "#7c3aed" : "#00d4ff";
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    requestAnimationFrame(function () { c.classList.add("on"); });
    rain();
    // auto-dissolve so nobody gets stuck in the rain
    matrixTimeout = setTimeout(stopMatrix, 15000);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") stopMatrix();
  });

  /* ===== Services scroll-line (ref: video_portfolio tag cards) ===== */
  (function () {
    var wrap = document.getElementById("svc-wrap");
    var fill = document.getElementById("svc-line-fill");
    if (!wrap || !fill) return;
    var cards = wrap.querySelectorAll(".svc-card");

    function updateLine() {
      var r = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = Math.min(1, Math.max(0, (vh * 0.72 - r.top) / r.height));
      fill.style.height = (progress * 100).toFixed(2) + "%";
      var tipY = r.top + progress * r.height;
      cards.forEach(function (c) {
        c.classList.toggle("svc-active", tipY >= c.getBoundingClientRect().top + 46);
      });
    }
    window.addEventListener("scroll", updateLine, { passive: true });
    updateLine();
    if (reduceMotion) {
      fill.style.height = "100%";
      cards.forEach(function (c) { c.classList.add("svc-active"); });
    }
  })();

  /* ===== Timeline draw-in ===== */
  var timelineEl = document.querySelector(".timeline");
  if (timelineEl && "IntersectionObserver" in window && !reduceMotion) {
    var tlIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("drawn");
          tlIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".timeline").forEach(function (el) { tlIO.observe(el); });
  } else {
    document.querySelectorAll(".timeline").forEach(function (el) { el.classList.add("drawn"); });
  }

  /* ===== Interactive terminal ===== */
  (function () {
    var body = document.getElementById("term-body");
    var out = document.getElementById("term-out");
    var input = document.getElementById("term-input");
    if (!body || !out || !input) return;

    var history = [];
    var histIdx = -1;

    function esc(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function print(html, cls) {
      var d = document.createElement("div");
      if (cls) d.className = cls;
      d.innerHTML = html;
      out.appendChild(d);
      while (out.childNodes.length > 260) out.removeChild(out.firstChild);
      body.scrollTop = body.scrollHeight;
    }

    var LINK = function (href, label) {
      return '<a href="' + href + '" target="_blank" rel="noopener">' + label + "</a>";
    };

    var commands = {
      help: function () {
        print(
          "<span class='t-accent'>available commands</span>\n" +
          "  about        who is umar?\n" +
          "  skills       tech stack\n" +
          "  projects     featured work\n" +
          "  freelance    live client sites\n" +
          "  experience   internships\n" +
          "  education    degree & college\n" +
          "  publication  published research\n" +
          "  certs        certifications\n" +
          "  resume       download resume (pdf)\n" +
          "  contact      email / linkedin / github\n" +
          "  whoami       identity check\n" +
          "  namaste      a Telugu hello\n" +
          "  matrix       enter the matrix (Esc exits)\n" +
          "  sudo hire-me you know you want to\n" +
          "  clear        wipe the screen"
        );
      },
      about: function () {
        print("Mahmmed Umar Faaruk — AI/ML engineer from Hyderabad, India.\nB.Tech CSE (AI & ML), Sreyas Institute, 2025. Published researcher\nin deep-learning object detection. Builds systems that learn, adapt and ship.");
      },
      skills: function () {
        print("<span class='t-accent'>langs</span>   python · sql · javascript\n<span class='t-accent'>ml</span>      pytorch · cnn/lstm · yolov11 · opencv · federated learning\n<span class='t-accent'>genai</span>   prompt engineering · langchain · dify.ai · llm fine-tuning\n<span class='t-accent'>cloud</span>   aws · render · streamlit cloud · fastapi · docker\n<span class='t-accent'>db</span>      postgresql · supabase · firestore");
      },
      projects: function () {
        print(
          "<span class='t-accent'>freelance (live)</span> — type <span class='t-accent'>freelance</span> for links\n" +
          "  EduOnx · Jobly · Café Spice QR · Bazaar Premier · Founder & Growth · Aerowash · Aura Villa\n" +
          "<span class='t-accent'>research & personal</span>\n" +
          "1. Adaptive AI-SIEM — 99% acc, federated learning + blockchain\n   " +
          LINK("https://github.com/Umarfaaruk/Adaptive-AI-SIEM-for-Cyber-Threats", "github.com/Umarfaaruk/Adaptive-AI-SIEM-for-Cyber-Threats") +
          "\n2. Fire & Smoke Detection — 93.5% mAP @ 60 FPS <span class='t-ok'>[published]</span>\n   " +
          LINK("https://github.com/Umarfaaruk/Fire-and-Smoke-detection", "github.com/Umarfaaruk/Fire-and-Smoke-detection") +
          "\n3. Craft Connect — AWS + Supabase, offline-sync\n4. Tune Buddy — LLM chatbot (Dify.ai)\n5. Chess Buddy — Stockfish engine + Streamlit"
        );
      },
      freelance: function () {
        print(
          "<span class='t-ok'>live client work</span> — click to open:\n" +
          "  " + LINK("https://eduonx.in", "eduonx.in") + "  — AI learning platform (custom domain)\n" +
          "  " + LINK("https://jobly-pearl.vercel.app", "jobly") + "  — ATS resumes & job matching\n" +
          "  " + LINK("https://qr-table-ordering-system.vercel.app", "café spice") + "  — QR table ordering\n" +
          "  " + LINK("https://bazaar-premier.vercel.app", "bazaar premier") + "  — dubai classifieds marketplace\n" +
          "  " + LINK("https://founder-growth-website.vercel.app", "founder & growth") + "  — VA services site\n" +
          "  " + LINK("https://aerowash-lac.vercel.app", "aerowash") + "  — waterless car wash, hyd\n" +
          "  " + LINK("https://villa-demo-lemon.vercel.app", "aura villa") + "  — luxury stays concept\n" +
          "hiring for a project? run <span class='t-accent'>sudo hire-me</span>"
        );
      },
      experience: function () {
        print("<span class='t-accent'>Viswam AI</span> — AI Developer Intern (May–Jul 2025)\n  India's first Telugu LLM · AWS · FastAPI gateway · Supabase sync\n<span class='t-accent'>Intrainz</span> — Web Dev Intern (Oct–Dec 2024)\n  3 JavaScript apps: calculator, e-commerce, task manager");
      },
      education: function () {
        print("B.Tech, Computer Science & Engineering (AI & ML)\nSreyas Institute of Engineering and Technology, Hyderabad — 2025");
      },
      publication: function () {
        print("<span class='t-ok'>Employing Deep Learning Paradigms for Fire and Smoke Detection</span>\nAccepted — AI Health Care book, 2025 (in press)\n+ technical articles on NumPy and Python functions (2026)");
      },
      certs: function () {
        print("· AWS APAC Solutions Architecture — Forage (2025)\n· Generative AI Workshop — Growth School (2026)\n· Goldman Sachs Software Engineering — Forage (2025)\n· Tata Data Visualization — Forage (2025)\n· ML Workshops — Innomatics (2025), IEEE Sreyas (2023)");
      },
      resume: function () {
        print("fetching resume.pdf ... <span class='t-ok'>done</span> — opening in a new tab.");
        window.open("./assets/Umar-Faaruk-Resume.pdf", "_blank", "noopener");
      },
      contact: function () {
        print("email    " + LINK("mailto:umarfaaruk154246@gmail.com", "umarfaaruk154246@gmail.com") +
          "\nlinkedin " + LINK("https://www.linkedin.com/in/mahmmed-umar-faaruk-15a04626a/", "mahmmed-umar-faaruk") +
          "\ngithub   " + LINK("https://github.com/Umarfaaruk", "github.com/Umarfaaruk"));
      },
      whoami: function () {
        print("visitor — possibly a recruiter with excellent taste 👀");
      },
      namaste: function () {
        print("<span class='t-accent'>నమస్కారం!</span> 🙏 — I helped build India's first Telugu LLM\nat Viswam AI with Swecha, IIIT Hyderabad and Meta.");
      },
      matrix: function () {
        if (reduceMotion) {
          print("matrix disabled — your system prefers reduced motion, and I respect that.");
          return;
        }
        print("<span class='t-ok'>wake up, neo...</span> the rain speaks Telugu here.\n(press <span class='t-accent'>Esc</span> or type <span class='t-accent'>matrix off</span> to exit — auto-exits in 15s)");
        startMatrix();
      },
      "matrix off": function () {
        stopMatrix();
        print("back to reality.");
      },
      clear: function () {
        out.innerHTML = "";
      },
      "sudo hire-me": function () {
        print("<span class='t-ok'>permission granted ✓</span> — opening mail client with the good news...");
        setTimeout(function () {
          window.location.href = "mailto:umarfaaruk154246@gmail.com?subject=" +
            encodeURIComponent("Let's talk — found you via the portfolio terminal") +
            "&body=" + encodeURIComponent("Hi Umar,\n\nI ran `sudo hire-me` in your portfolio and it worked.\n");
        }, 700);
      }
    };
    commands.social = commands.contact;
    commands.ls = commands.help;

    function run(raw) {
      var cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");
      print(esc(raw), "t-cmd");
      if (!cmd) return;
      history.push(raw);
      histIdx = history.length;
      if (commands[cmd]) {
        commands[cmd]();
      } else {
        print("command not found: <span class='t-err'>" + esc(cmd) + "</span> — try <span class='t-accent'>help</span>");
      }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIdx > 0) input.value = history[--histIdx] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIdx < history.length - 1) {
          input.value = history[++histIdx];
        } else {
          histIdx = history.length;
          input.value = "";
        }
      }
    });

    body.addEventListener("click", function (e) {
      if (e.target.tagName !== "A") input.focus({ preventScroll: true });
    });

    print("<span class='t-accent'>umar-portfolio</span> v2.0 — neural interface online.\ntype <span class='t-accent'>help</span> to see what I can do.");
  })();

  /* ===== Console Easter egg for the devtools crowd ===== */
  try {
    console.log(
      "%c<UF/> %cHey, you found the console! 🕵️\n" +
      "%cI'm Umar — AI/ML engineer & published researcher.\n" +
      "This site: vanilla JS + Three.js, zero frameworks, zero errors.\n" +
      "Try the terminal section, or just email me: umarfaaruk154246@gmail.com",
      "font-size:20px;font-weight:bold;color:#00d4ff",
      "font-size:14px;color:#7c3aed;font-weight:bold",
      "font-size:12px;color:#94a3b8"
    );
  } catch (e) { }

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
