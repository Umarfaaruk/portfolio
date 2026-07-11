/* 3D particle-field background (Three.js).
   Degrades gracefully: if THREE fails to load or WebGL is unavailable,
   the page simply shows the static gradient background. */
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

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050810, 0.0012);

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 420;

  // --- Particle field ---
  var isMobile = window.innerWidth < 768;
  var COUNT = isMobile ? 350 : 800;
  var SPREAD = 900;

  var positions = new Float32Array(COUNT * 3);
  var colors = new Float32Array(COUNT * 3);
  var cyan = new THREE.Color(0x00d4ff);
  var violet = new THREE.Color(0x7c3aed);

  for (var i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;

    var c = Math.random() > 0.35 ? cyan : violet;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  var material = new THREE.PointsMaterial({
    size: 2.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true
  });

  var particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // --- Floating wireframe shapes ---
  var wireMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  var wireMat2 = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    wireframe: true,
    transparent: true,
    opacity: 0.09
  });

  var icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(110, 1), wireMat);
  icosa.position.set(-260, 120, -180);
  scene.add(icosa);

  var torus = new THREE.Mesh(new THREE.TorusGeometry(90, 26, 12, 40), wireMat2);
  torus.position.set(280, -100, -220);
  scene.add(torus);

  var octa = new THREE.Mesh(new THREE.OctahedronGeometry(60, 0), wireMat);
  octa.position.set(60, 220, -320);
  scene.add(octa);

  // --- Mouse parallax ---
  var mouseX = 0, mouseY = 0;
  document.addEventListener("mousemove", function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Pause rendering when the tab is hidden
  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
  });

  var clock = new THREE.Clock();

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

    particles.rotation.y = t * 0.03;
    particles.rotation.x = t * 0.008;

    icosa.rotation.x = t * 0.12;
    icosa.rotation.y = t * 0.18;
    torus.rotation.x = t * 0.16;
    torus.rotation.z = t * 0.1;
    octa.rotation.y = t * 0.22;

    icosa.position.y = 120 + Math.sin(t * 0.6) * 18;
    torus.position.y = -100 + Math.cos(t * 0.5) * 22;
    octa.position.y = 220 + Math.sin(t * 0.4) * 14;

    // gentle camera parallax toward the cursor
    camera.position.x += (mouseX * 40 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 40 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();
