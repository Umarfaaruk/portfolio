/* Scroll-driven 3D scene — Three.js r160 (ES modules) with UnrealBloom post-processing.
   - Hero: fresnel-glow AI core with orbiting rings
   - Particle field morphs per section (7 formations) with cursor repulsion
   - Neural synapse lines between nearby particles
   Degrades gracefully: module/import failure, no WebGL or reduced motion -> static bg. */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("bg-canvas");

if (canvas && !reduceMotion) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch (e) {
    renderer = null; // no WebGL — keep static background
  }

  if (renderer) {
    init(renderer);
  }
}

function init(renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050810);
  scene.fog = new THREE.FogExp2(0x050810, 0.001);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 460;

  const isMobile = window.innerWidth < 768;

  /* ---------- post-processing: cinematic bloom (desktop) ---------- */
  let composer = null;
  if (!isMobile) {
    composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.85,  // strength
      0.55,  // radius
      0.16   // threshold
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ---------- AI core ---------- */
  const core = new THREE.Group();
  scene.add(core);

  const fresnelMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x00d4ff) },
      uColorB: { value: new THREE.Color(0x7c3aed) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
        float pulse = 0.75 + 0.25 * sin(uTime * 1.6);
        vec3 col = mix(uColorA, uColorB, 0.5 + 0.5 * sin(uTime * 0.4));
        gl_FragColor = vec4(col, rim * pulse * 0.9);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const coreScale = isMobile ? 62 : 92;
  core.add(new THREE.Mesh(new THREE.IcosahedronGeometry(coreScale, 3), fresnelMat));

  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.13
  });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(coreScale * 1.45, 1), shellMat);
  core.add(shell);

  const ringMatA = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
  const ringMatB = new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.34 });

  const ringA = new THREE.Mesh(new THREE.TorusGeometry(coreScale * 2.1, 1.1, 8, 90), ringMatA);
  ringA.rotation.x = Math.PI / 2.25;
  core.add(ringA);

  const ringB = new THREE.Mesh(new THREE.TorusGeometry(coreScale * 2.6, 0.8, 8, 90), ringMatB);
  ringB.rotation.x = Math.PI / 1.8;
  ringB.rotation.y = Math.PI / 5;
  core.add(ringB);

  const sparkMat = new THREE.MeshBasicMaterial({ color: 0x9be8ff });
  const sparks = [];
  for (let s = 0; s < 3; s++) {
    const spark = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 8), sparkMat);
    spark.userData = { radius: coreScale * (2.1 + s * 0.25), speed: 0.5 + s * 0.22, phase: s * 2.1 };
    sparks.push(spark);
    core.add(spark);
  }

  /* ---------- morphing particle field ---------- */
  const COUNT = isMobile ? 550 : 1400;
  const makeArray = () => new Float32Array(COUNT * 3);

  function sphereFormation() {
    const a = makeArray();
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const R = 250 + (Math.random() - 0.5) * 26;
      a[i * 3] = Math.cos(th) * r * R;
      a[i * 3 + 1] = y * R;
      a[i * 3 + 2] = Math.sin(th) * r * R;
    }
    return a;
  }

  function galaxyFormation() {
    const a = makeArray();
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const r = 36 + 300 * Math.sqrt(t);
      const ang = arm + t * 4.6 + (Math.random() - 0.5) * 0.32;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = (Math.random() - 0.5) * (46 - t * 34);
      a[i * 3 + 2] = Math.sin(ang) * r - 60;
    }
    return a;
  }

  function helixFormation() {
    const a = makeArray();
    const half = Math.floor(COUNT / 2);
    for (let i = 0; i < COUNT; i++) {
      const strand = i < half ? 0 : Math.PI;
      const t = (i % half) / half;
      const ang = t * Math.PI * 6 + strand;
      a[i * 3] = Math.cos(ang) * 120 + (Math.random() - 0.5) * 14;
      a[i * 3 + 1] = -300 + t * 600;
      a[i * 3 + 2] = Math.sin(ang) * 120 + (Math.random() - 0.5) * 14;
    }
    return a;
  }

  function gridFormation() {
    const a = makeArray();
    const cols = Math.ceil(Math.sqrt(COUNT * 1.6));
    const rows = Math.ceil(COUNT / cols);
    for (let i = 0; i < COUNT; i++) {
      const x = ((i % cols) / (cols - 1) - 0.5) * 760;
      const y = (Math.floor(i / cols) / (rows - 1) - 0.5) * 430;
      a[i * 3] = x;
      a[i * 3 + 1] = y;
      a[i * 3 + 2] = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 46 - 40;
    }
    return a;
  }

  function knotFormation() {
    const a = makeArray();
    const p = 2, q = 3, scale = 92;
    for (let i = 0; i < COUNT; i++) {
      const t = (i / COUNT) * Math.PI * 2;
      const r = Math.cos(q * t) + 2;
      a[i * 3] = r * Math.cos(p * t) * scale + (Math.random() - 0.5) * 18;
      a[i * 3 + 1] = r * Math.sin(p * t) * scale * 0.72 + (Math.random() - 0.5) * 18;
      a[i * 3 + 2] = -Math.sin(q * t) * scale + (Math.random() - 0.5) * 18;
    }
    return a;
  }

  function latticeFormation() {
    const a = makeArray();
    const n = Math.ceil(Math.cbrt(COUNT));
    const spacing = 480 / n;
    for (let i = 0; i < COUNT; i++) {
      const x = i % n;
      const y = Math.floor(i / n) % n;
      const z = Math.floor(i / (n * n));
      a[i * 3] = (x - (n - 1) / 2) * spacing + (Math.random() - 0.5) * 6;
      a[i * 3 + 1] = (y - (n - 1) / 2) * spacing + (Math.random() - 0.5) * 6;
      a[i * 3 + 2] = (z - (n - 1) / 2) * spacing - 60 + (Math.random() - 0.5) * 6;
    }
    return a;
  }

  function vortexFormation() {
    const a = makeArray();
    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const ang = t * Math.PI * 14 + (Math.random() - 0.5) * 0.5;
      const r = 30 + (1 - t) * 280;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = -250 + t * 520;
      a[i * 3 + 2] = Math.sin(ang) * r - 40;
    }
    return a;
  }

  const sectionOrder = ["home", "services", "work", "projects", "about", "experience", "skills", "terminal", "contact"];
  const sphere = sphereFormation(), galaxy = galaxyFormation(), helix = helixFormation(),
    grid = gridFormation(), knot = knotFormation(), lattice = latticeFormation(), vortex = vortexFormation();
  const formations = [sphere, grid, galaxy, knot, helix, grid, vortex, lattice, vortex];

  const positions = new Float32Array(formations[0]);
  const colors = makeArray();
  const cyan = new THREE.Color(0x00d4ff);
  const violet = new THREE.Color(0x7c3aed);
  const white = new THREE.Color(0xbfe9ff);

  for (let ci = 0; ci < COUNT; ci++) {
    const rnd = Math.random();
    const c = rnd > 0.55 ? cyan : (rnd > 0.12 ? violet : white);
    colors[ci * 3] = c.r;
    colors[ci * 3 + 1] = c.g;
    colors[ci * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // soft radial sprite so particles glow instead of rendering as squares
  function makeGlowSprite() {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(0.35, "rgba(255,255,255,0.5)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const material = new THREE.PointsMaterial({
    size: 3.8,
    map: makeGlowSprite(),
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  particles.position.z = -80;
  scene.add(particles);

  /* ---------- neural synapse lines ---------- */
  const LINK_N = isMobile ? 60 : 130;
  const MAX_SEGS = isMobile ? 220 : 520;
  const LINK_DIST2 = 68 * 68;

  const linePositions = new Float32Array(MAX_SEGS * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);

  const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.13,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  lines.position.z = -80;
  scene.add(lines);
  const linePosAttr = lineGeo.getAttribute("position");

  function updateLines(arr) {
    let seg = 0;
    for (let i = 0; i < LINK_N && seg < MAX_SEGS; i++) {
      const ix = arr[i * 3], iy = arr[i * 3 + 1], iz = arr[i * 3 + 2];
      for (let j = i + 1; j < LINK_N && seg < MAX_SEGS; j++) {
        const dx = ix - arr[j * 3];
        const dy = iy - arr[j * 3 + 1];
        const dz = iz - arr[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < LINK_DIST2) {
          const o = seg * 6;
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

  /* ---------- scroll + mouse state ---------- */
  let targetFormation = 0;
  let heroProgress = 0;

  const sectionEls = sectionOrder.map((id) => document.getElementById(id));

  function onScroll() {
    const vh = window.innerHeight;
    const mid = window.scrollY + vh * 0.5;
    let idx = 0;
    for (let i = 0; i < sectionEls.length; i++) {
      if (sectionEls[i] && sectionEls[i].offsetTop <= mid) idx = i;
    }
    targetFormation = idx;
    heroProgress = Math.min(window.scrollY / (vh * 0.85), 1);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  let mouseX = 0, mouseY = 0, mouseActive = false;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseActive = true;
  }, { passive: true });
  document.addEventListener("mouseleave", () => { mouseActive = false; });

  const repelRay = new THREE.Vector3();
  const repelLocal = new THREE.Vector3();
  const REPEL_R = 130;
  const REPEL_R2 = REPEL_R * REPEL_R;

  function setSize(w, h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
  }
  window.addEventListener("resize", () => setSize(window.innerWidth, window.innerHeight));

  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });

  /* ---------- render loop ---------- */
  const clock = new THREE.Clock();
  const posAttr = geometry.getAttribute("position");
  const rendererSize = new THREE.Vector2();
  let frameCount = 0;

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;

    // recover if the page loaded in a hidden/zero-size tab
    renderer.getSize(rendererSize);
    if ((rendererSize.x !== window.innerWidth || rendererSize.y !== window.innerHeight) &&
      window.innerWidth > 0 && window.innerHeight > 0) {
      setSize(window.innerWidth, window.innerHeight);
    }

    const t = clock.getElapsedTime();
    fresnelMat.uniforms.uTime.value = t;

    // morph particles toward the active section's formation
    const target = formations[targetFormation];
    const arr = posAttr.array;
    for (let i = 0; i < arr.length; i++) {
      arr[i] += (target[i] - arr[i]) * 0.042;
    }

    // cursor repulsion: particles dodge the mouse
    if (mouseActive && !isMobile) {
      repelRay.set(mouseX, -mouseY, 0.5).unproject(camera).sub(camera.position).normalize();
      const planeDist = (particles.position.z - camera.position.z) / repelRay.z;
      if (planeDist > 0) {
        repelLocal.copy(camera.position).addScaledVector(repelRay, planeDist);
        particles.updateMatrixWorld();
        particles.worldToLocal(repelLocal);
        const lx = repelLocal.x, ly = repelLocal.y, lz = repelLocal.z;
        for (let p = 0; p < COUNT; p++) {
          const dx = arr[p * 3] - lx;
          const dy = arr[p * 3 + 1] - ly;
          const dz = arr[p * 3 + 2] - lz;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < REPEL_R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / REPEL_R) * 9;
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

    frameCount++;
    if (frameCount % 3 === 0) updateLines(arr);

    // AI core: alive in the hero, sinks away on scroll
    const coreVis = Math.max(0, 1 - heroProgress * 1.15);
    core.visible = coreVis > 0.01;
    if (core.visible) {
      const breathe = 1 + Math.sin(t * 1.2) * 0.03;
      core.scale.setScalar((0.4 + 0.6 * coreVis) * breathe);
      core.position.y = -heroProgress * 340;
      core.rotation.y = t * 0.22;

      shell.rotation.y = -t * 0.3;
      shell.rotation.x = t * 0.14;
      ringA.rotation.z = t * 0.4;
      ringB.rotation.z = -t * 0.32;

      shellMat.opacity = 0.13 * coreVis;
      ringMatA.opacity = 0.3 * coreVis;
      ringMatB.opacity = 0.34 * coreVis;

      for (const sp of sparks) {
        const d = sp.userData;
        const ang = t * d.speed + d.phase;
        sp.position.set(
          Math.cos(ang) * d.radius,
          Math.sin(ang * 1.4) * d.radius * 0.28,
          Math.sin(ang) * d.radius
        );
      }
    }

    camera.position.x += (mouseX * 46 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 46 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  animate();
}
