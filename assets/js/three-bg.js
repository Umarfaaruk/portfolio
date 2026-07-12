/* Scroll-driven 3D scene (Three.js).
   - Hero: glowing "AI core" (fresnel shader) with orbiting rings
   - Particle field morphs into a different formation per section:
     home: sphere | about: galaxy | experience: DNA helix
     projects: grid wave | skills: torus knot | contact: vortex
   Degrades gracefully: no THREE / no WebGL / reduced motion -> static bg. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("bg-canvas");
  if (!canvas || typeof THREE === "undefined" || reduceMotion) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // no WebGL — keep static background
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050810, 0.001);

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 460;

  var isMobile = window.innerWidth < 768;

  /* ============================================================
     AI CORE — fresnel-glow icosahedron + rings + orbiting sparks
     ============================================================ */
  var core = new THREE.Group();
  scene.add(core);

  var fresnelMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x00d4ff) },
      uColorB: { value: new THREE.Color(0x7c3aed) }
    },
    vertexShader: [
      "varying vec3 vNormal;",
      "varying vec3 vView;",
      "void main() {",
      "  vNormal = normalize(normalMatrix * normal);",
      "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
      "  vView = normalize(-mv.xyz);",
      "  gl_Position = projectionMatrix * mv;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "uniform float uTime;",
      "uniform vec3 uColorA;",
      "uniform vec3 uColorB;",
      "varying vec3 vNormal;",
      "varying vec3 vView;",
      "void main() {",
      "  float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.2);",
      "  float pulse = 0.75 + 0.25 * sin(uTime * 1.6);",
      "  vec3 col = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uTime * 0.4));",
      "  gl_FragColor = vec4(col, rim * pulse * 0.9);",
      "}"
    ].join("\n"),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });

  var coreScale = isMobile ? 62 : 92;
  var innerSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(coreScale, 3), fresnelMat);
  core.add(innerSphere);

  var shellMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.14
  });
  var shell = new THREE.Mesh(new THREE.IcosahedronGeometry(coreScale * 1.45, 1), shellMat);
  core.add(shell);

  var ringMatA = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, transparent: true, opacity: 0.3
  });
  var ringMatB = new THREE.MeshBasicMaterial({
    color: 0x7c3aed, transparent: true, opacity: 0.34
  });

  var ringA = new THREE.Mesh(new THREE.TorusGeometry(coreScale * 2.1, 1.1, 8, 90), ringMatA);
  ringA.rotation.x = Math.PI / 2.25;
  core.add(ringA);

  var ringB = new THREE.Mesh(new THREE.TorusGeometry(coreScale * 2.6, 0.8, 8, 90), ringMatB);
  ringB.rotation.x = Math.PI / 1.8;
  ringB.rotation.y = Math.PI / 5;
  core.add(ringB);

  var sparkMat = new THREE.MeshBasicMaterial({ color: 0x9be8ff });
  var sparks = [];
  for (var s = 0; s < 3; s++) {
    var spark = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 8), sparkMat);
    spark.userData = { radius: coreScale * (2.1 + s * 0.25), speed: 0.5 + s * 0.22, phase: s * 2.1 };
    sparks.push(spark);
    core.add(spark);
  }

  /* ============================================================
     MORPHING PARTICLE FIELD
     ============================================================ */
  var COUNT = isMobile ? 550 : 1400;

  function makeArray() { return new Float32Array(COUNT * 3); }

  // -- formations, one per section --
  function sphereFormation() {
    var a = makeArray();
    var golden = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < COUNT; i++) {
      var y = 1 - (i / (COUNT - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var th = golden * i;
      var R = 250 + (Math.random() - 0.5) * 26;
      a[i * 3] = Math.cos(th) * r * R;
      a[i * 3 + 1] = y * R;
      a[i * 3 + 2] = Math.sin(th) * r * R;
    }
    return a;
  }

  function galaxyFormation() {
    var a = makeArray();
    for (var i = 0; i < COUNT; i++) {
      var t = i / COUNT;
      var arm = (i % 3) * ((Math.PI * 2) / 3);
      var r = 36 + 300 * Math.sqrt(t);
      var ang = arm + t * 4.6 + (Math.random() - 0.5) * 0.32;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = (Math.random() - 0.5) * (46 - t * 34);
      a[i * 3 + 2] = Math.sin(ang) * r - 60;
    }
    return a;
  }

  function helixFormation() {
    var a = makeArray();
    var half = Math.floor(COUNT / 2);
    for (var i = 0; i < COUNT; i++) {
      var strand = i < half ? 0 : Math.PI;
      var t = (i % half) / half;
      var y = -300 + t * 600;
      var ang = t * Math.PI * 6 + strand;
      var r = 120;
      a[i * 3] = Math.cos(ang) * r + (Math.random() - 0.5) * 14;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = Math.sin(ang) * r + (Math.random() - 0.5) * 14;
    }
    return a;
  }

  function gridFormation() {
    var a = makeArray();
    var cols = Math.ceil(Math.sqrt(COUNT * 1.6));
    var rows = Math.ceil(COUNT / cols);
    for (var i = 0; i < COUNT; i++) {
      var cx = i % cols;
      var cy = Math.floor(i / cols);
      var x = (cx / (cols - 1) - 0.5) * 760;
      var y = (cy / (rows - 1) - 0.5) * 430;
      a[i * 3] = x;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 46 - 40;
    }
    return a;
  }

  function knotFormation() {
    var a = makeArray();
    var p = 2, q = 3;
    for (var i = 0; i < COUNT; i++) {
      var t = (i / COUNT) * Math.PI * 2;
      var r = Math.cos(q * t) + 2;
      var scale = 92;
      a[i * 3] = r * Math.cos(p * t) * scale + (Math.random() - 0.5) * 18;
      a[i * 3 + 1] = r * Math.sin(p * t) * scale * 0.72 + (Math.random() - 0.5) * 18;
      a[i * 3 + 2] = -Math.sin(q * t) * scale + (Math.random() - 0.5) * 18;
    }
    return a;
  }

  function latticeFormation() {
    var a = makeArray();
    var n = Math.ceil(Math.cbrt(COUNT));
    var spacing = 480 / n;
    for (var i = 0; i < COUNT; i++) {
      var x = i % n;
      var y = Math.floor(i / n) % n;
      var z = Math.floor(i / (n * n));
      a[i * 3] = (x - (n - 1) / 2) * spacing + (Math.random() - 0.5) * 6;
      a[i * 3 + 1] = (y - (n - 1) / 2) * spacing + (Math.random() - 0.5) * 6;
      a[i * 3 + 2] = (z - (n - 1) / 2) * spacing - 60 + (Math.random() - 0.5) * 6;
    }
    return a;
  }

  function vortexFormation() {
    var a = makeArray();
    for (var i = 0; i < COUNT; i++) {
      var t = i / COUNT;
      var ang = t * Math.PI * 14 + (Math.random() - 0.5) * 0.5;
      var r = 30 + (1 - t) * 280;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = -250 + t * 520;
      a[i * 3 + 2] = Math.sin(ang) * r - 40;
    }
    return a;
  }

  // section id -> formation, in page order
  var sectionOrder = ["home", "about", "experience", "projects", "skills", "terminal", "contact"];
  var formations = [
    sphereFormation(), galaxyFormation(), helixFormation(),
    gridFormation(), knotFormation(), latticeFormation(), vortexFormation()
  ];

  var positions = new Float32Array(formations[0]); // start at sphere
  var colors = makeArray();
  var cyan = new THREE.Color(0x00d4ff);
  var violet = new THREE.Color(0x7c3aed);
  var white = new THREE.Color(0xbfe9ff);

  for (var ci = 0; ci < COUNT; ci++) {
    var rnd = Math.random();
    var c = rnd > 0.55 ? cyan : (rnd > 0.12 ? violet : white);
    colors[ci * 3] = c.r;
    colors[ci * 3 + 1] = c.g;
    colors[ci * 3 + 2] = c.b;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // soft radial sprite so particles glow instead of rendering as squares
  function makeGlowSprite() {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.5)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  var material = new THREE.PointsMaterial({
    size: 3.8,
    map: makeGlowSprite(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  var particles = new THREE.Points(geometry, material);
  particles.position.z = -80;
  scene.add(particles);

  /* ============================================================
     NEURAL SYNAPSE LINES — connect nearby particles
     ============================================================ */
  var LINK_N = isMobile ? 60 : 130;      // particles considered for links
  var MAX_SEGS = isMobile ? 220 : 520;   // segment cap
  var LINK_DIST2 = 68 * 68;

  var linePositions = new Float32Array(MAX_SEGS * 6);
  var lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);

  var lineMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var lines = new THREE.LineSegments(lineGeo, lineMat);
  lines.position.z = -80; // match the particle cloud
  scene.add(lines);
  var linePosAttr = lineGeo.getAttribute("position");

  function updateLines(arr) {
    var seg = 0;
    for (var i = 0; i < LINK_N && seg < MAX_SEGS; i++) {
      var ix = arr[i * 3], iy = arr[i * 3 + 1], iz = arr[i * 3 + 2];
      for (var j = i + 1; j < LINK_N && seg < MAX_SEGS; j++) {
        var dx = ix - arr[j * 3];
        var dy = iy - arr[j * 3 + 1];
        var dz = iz - arr[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < LINK_DIST2) {
          var o = seg * 6;
          linePositions[o] = ix;
          linePositions[o + 1] = iy;
          linePositions[o + 2] = iz;
          linePositions[o + 3] = arr[j * 3];
          linePositions[o + 4] = arr[j * 3 + 1];
          linePositions[o + 5] = arr[j * 3 + 2];
          seg++;
        }
      }
    }
    lineGeo.setDrawRange(0, seg * 2);
    linePosAttr.needsUpdate = true;
  }

  /* ============================================================
     SCROLL + MOUSE STATE
     ============================================================ */
  var targetFormation = 0;
  var heroProgress = 0; // 0 at top -> 1 once hero is scrolled past

  var sectionEls = sectionOrder.map(function (id) {
    return document.getElementById(id);
  });

  function onScroll() {
    var vh = window.innerHeight;
    var mid = window.scrollY + vh * 0.5;
    var idx = 0;
    for (var i = 0; i < sectionEls.length; i++) {
      if (sectionEls[i] && sectionEls[i].offsetTop <= mid) idx = i;
    }
    targetFormation = idx;
    heroProgress = Math.min(window.scrollY / (vh * 0.85), 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var mouseX = 0, mouseY = 0, mouseActive = false;
  document.addEventListener("mousemove", function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseActive = true;
  }, { passive: true });
  document.addEventListener("mouseleave", function () {
    mouseActive = false;
  });

  // scratch vectors for cursor repulsion (allocated once)
  var repelRay = new THREE.Vector3();
  var repelLocal = new THREE.Vector3();
  var REPEL_R = 130;
  var REPEL_R2 = REPEL_R * REPEL_R;

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
  });

  /* ============================================================
     RENDER LOOP
     ============================================================ */
  var clock = new THREE.Clock();
  var posAttr = geometry.getAttribute("position");
  var frameCount = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    // recover if the page loaded in a hidden/zero-size tab
    var size = renderer.getSize(new THREE.Vector2());
    if ((size.x !== window.innerWidth || size.y !== window.innerHeight) &&
      window.innerWidth > 0 && window.innerHeight > 0) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    var t = clock.getElapsedTime();
    fresnelMat.uniforms.uTime.value = t;

    // --- morph particles toward the active section's formation ---
    var target = formations[targetFormation];
    var arr = posAttr.array;
    for (var i = 0; i < arr.length; i++) {
      arr[i] += (target[i] - arr[i]) * 0.042;
    }

    // --- cursor repulsion: particles dodge the mouse ---
    if (mouseActive && !isMobile) {
      // project the cursor onto the particle cloud's plane (world z = -80)
      repelRay.set(mouseX, -mouseY, 0.5).unproject(camera).sub(camera.position).normalize();
      var planeDist = (particles.position.z - camera.position.z) / repelRay.z;
      if (planeDist > 0) {
        repelLocal.copy(camera.position).addScaledVector(repelRay, planeDist);
        particles.updateMatrixWorld();
        particles.worldToLocal(repelLocal);
        var lx = repelLocal.x, ly = repelLocal.y, lz = repelLocal.z;
        for (var p = 0; p < COUNT; p++) {
          var dx = arr[p * 3] - lx;
          var dy = arr[p * 3 + 1] - ly;
          var dz = arr[p * 3 + 2] - lz;
          var d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < REPEL_R2 && d2 > 0.01) {
            var d = Math.sqrt(d2);
            var f = (1 - d / REPEL_R) * 9;
            arr[p * 3] += (dx / d) * f;
            arr[p * 3 + 1] += (dy / d) * f;
            arr[p * 3 + 2] += (dz / d) * f;
          }
        }
      }
    }
    posAttr.needsUpdate = true;

    particles.rotation.y = t * 0.055;
    particles.rotation.x = Math.sin(t * 0.11) * 0.08;
    lines.rotation.copy(particles.rotation);

    // refresh synapse links every third frame (cheap O(n²) on a small subset)
    frameCount++;
    if (frameCount % 3 === 0) updateLines(arr);

    // --- AI core: alive in the hero, sinks away as you scroll ---
    var coreVis = Math.max(0, 1 - heroProgress * 1.15);
    core.visible = coreVis > 0.01;
    if (core.visible) {
      var breathe = 1 + Math.sin(t * 1.2) * 0.03;
      core.scale.setScalar((0.4 + 0.6 * coreVis) * breathe);
      core.position.y = -heroProgress * 340;
      core.rotation.y = t * 0.22;

      shell.rotation.y = -t * 0.3;
      shell.rotation.x = t * 0.14;
      ringA.rotation.z = t * 0.4;
      ringB.rotation.z = -t * 0.32;

      shellMat.opacity = 0.14 * coreVis;
      ringMatA.opacity = 0.3 * coreVis;
      ringMatB.opacity = 0.34 * coreVis;

      for (var k = 0; k < sparks.length; k++) {
        var sp = sparks[k];
        var d = sp.userData;
        var ang = t * d.speed + d.phase;
        sp.position.set(
          Math.cos(ang) * d.radius,
          Math.sin(ang * 1.4) * d.radius * 0.28,
          Math.sin(ang) * d.radius
        );
      }
    }

    // gentle camera parallax toward the cursor
    camera.position.x += (mouseX * 46 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 46 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();
