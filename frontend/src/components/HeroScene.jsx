import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { HeroMark } from "./HeroFallback";

/**
 * The hero's 3D scene: The Quad's brand mark built as a real object, and the
 * alumni network drawn around it.
 *
 *   - A polished metal ring (the class ring the whole site is themed on),
 *     carrying the four quad blocks from the logo, one of them orange.
 *   - A shell of alumni nodes orbiting it, wired to their nearest neighbours.
 *     Each node breathes on its own phase, so the graph reads as alive rather
 *     than as a static lattice.
 *
 * What makes it read as genuinely three-dimensional rather than as a picture:
 * the metal is lit by a real environment map (generated here, not downloaded),
 * so the ring picks up a bright key reflection on one side and a warm bounce on
 * the other, and those reflections travel across it as it turns. Flat shading
 * with a couple of directional lights is what makes WebGL look like a decal.
 *
 * Everything lives outside React state: the loop writes to refs and plain
 * objects, so a pointer move costs two floats and no re-render.
 *
 * Degrades in four steps:
 *   1. prefers-reduced-motion  -> one composed static frame, no loop
 *   2. no WebGL / context lost -> canvas removed, the CSS backdrop shows
 *   3. offscreen or hidden tab -> loop suspended, no battery drain
 *   4. small screens           -> fewer nodes, lower DPR, no antialias
 */

const TEAL_900 = 0x0b4f49;
const TEAL_700 = 0x0e6e64;
const TEAL_500 = 0x1cab98;
const ORANGE_500 = 0xf2622e;
const PEACH_300 = 0xffc38a;
const CREAM = 0xfbf6ee;

/**
 * The environment the metal reflects. Painted into a canvas as an
 * equirectangular panorama and convolved by PMREM, which is what gives the
 * ring a soft wide highlight instead of a hard specular dot.
 */
function buildEnvironment(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  const sky = ctx.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, "#fffaf2");
  sky.addColorStop(0.45, "#cfe6e0");
  sky.addColorStop(1, "#0b3d38");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 256);

  const blob = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  blob(130, 60, 110, "rgba(255,255,255,0.95)");   // key
  blob(360, 95, 120, "rgba(255,195,138,0.75)");   // warm bounce
  blob(250, 215, 130, "rgba(28,171,152,0.55)");   // teal floor bounce

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(texture).texture;
  pmrem.dispose();
  texture.dispose();
  return envMap;
}

/** Evenly spaced points on a sphere. Avoids the clumping of random placement. */
function fibonacciSphere(count, radius) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius)
    );
  }
  return points;
}

/**
 * Builds a renderer, stepping down through progressively cheaper options.
 *
 * A desktop with hardware acceleration disabled, an outdated or blocklisted
 * driver, or hybrid graphics can refuse a context that a phone grants without
 * complaint, and `powerPreference: "high-performance"` plus MSAA is the exact
 * combination most likely to be refused. Asking once and giving up is what
 * makes a scene that works everywhere else silently vanish on one machine.
 *
 * Returns null only when every option fails, which means WebGL really is
 * unavailable and the static fallback should be shown instead.
 */
function createRenderer(isSmall) {
  const attempts = [
    { alpha: true, antialias: !isSmall, powerPreference: "high-performance" },
    { alpha: true, antialias: !isSmall },
    { alpha: true, antialias: false },
    { alpha: true, antialias: false, failIfMajorPerformanceCaveat: false }
  ];

  for (const options of attempts) {
    try {
      const renderer = new THREE.WebGLRenderer(options);
      // three.js can hand back a renderer whose context never actually came
      // up; this is the check that catches that case rather than failing
      // later on the first draw call.
      if (renderer.getContext()) return renderer;
      renderer.dispose();
    } catch { /* try the next, cheaper set of options */ }
  }
  return null;
}

export default function HeroScene() {
  const mountRef = useRef(null);
  // Drives the static fallback below. Only ever set once, and only when every
  // attempt at a WebGL context has failed.
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 760;

    const renderer = createRenderer(isSmall);
    if (!renderer) {
      // Left in deliberately: this is the one failure a user can see but
      // cannot explain, and it is the first thing to ask them to check.
      console.warn(
        "[The Quad] WebGL is unavailable in this browser, so the hero is " +
        "showing its static fallback. Usually this means hardware " +
        "acceleration is switched off, or the graphics driver is blocklisted. " +
        "Check chrome://gpu."
      );
      setWebglFailed(true);
      return;
    }

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.25 : 2));
    renderer.setSize(width, height);
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Filmic tone mapping keeps the bright reflection on the ring from
    // clipping to a flat white patch.
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // PMREM needs half-float render targets. They are everywhere now, but an
    // old driver or a software rasteriser can still refuse, and losing the
    // reflections is far better than losing the whole scene.
    let envMap = null;
    try {
      envMap = buildEnvironment(renderer);
      scene.environment = envMap;
    } catch {
      console.warn("[The Quad] Could not build the hero's environment map; falling back to direct lighting only.");
    }

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 13);
    camera.lookAt(0, 0, 0);

    const disposables = envMap ? [envMap] : [];
    const track = (item) => { disposables.push(item); return item; };

    // Lights on top of the environment: the env map does the reflection work,
    // these shape the form and put an edge on the silhouette.
    scene.add(new THREE.AmbientLight(CREAM, envMap ? 0.45 : 1.4));

    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(-5, 6, 7);
    scene.add(key);

    const rim = new THREE.DirectionalLight(PEACH_300, 1.6);
    rim.position.set(6, -2, -4);
    scene.add(rim);

    const fill = new THREE.PointLight(TEAL_500, 24, 22);
    fill.position.set(4, -3, 5);
    scene.add(fill);

    // --- The brand mark, in three dimensions -----------------------------
    const mark = new THREE.Group();
    mark.rotation.set(-0.32, -0.42, 0.06);

    const ring = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.55, 0.34, isSmall ? 20 : 40, isSmall ? 96 : 200)),
      track(new THREE.MeshPhysicalMaterial({
        color: TEAL_500,
        metalness: 1,
        roughness: 0.17,
        envMapIntensity: 1.5,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2
      }))
    );
    mark.add(ring);

    // A second, thinner band sitting just inside the first, in the darker
    // brand teal. Two concentric bands is what makes it read as a ring you
    // could pick up rather than as a torus primitive.
    const innerBand = new THREE.Mesh(
      track(new THREE.TorusGeometry(2.17, 0.085, 14, isSmall ? 80 : 160)),
      track(new THREE.MeshPhysicalMaterial({
        color: TEAL_900,
        metalness: 0.95,
        roughness: 0.3,
        envMapIntensity: 1.1
      }))
    );
    mark.add(innerBand);

    // The four quad blocks from the logo, one orange, set inside the ring.
    const blockGeometry = track(new THREE.BoxGeometry(0.92, 0.92, 0.3));
    const creamBlock = track(new THREE.MeshPhysicalMaterial({
      color: CREAM,
      metalness: 0.15,
      roughness: 0.38,
      envMapIntensity: 0.9,
      clearcoat: 0.5
    }));
    const orangeBlock = track(new THREE.MeshPhysicalMaterial({
      color: ORANGE_500,
      metalness: 0.25,
      roughness: 0.26,
      envMapIntensity: 1.1,
      clearcoat: 0.7,
      emissive: new THREE.Color(ORANGE_500),
      emissiveIntensity: 0.12
    }));

    const BLOCKS = [
      { x: -0.56, y: 0.56, material: creamBlock },
      { x: 0.56, y: 0.56, material: orangeBlock },
      { x: -0.56, y: -0.56, material: creamBlock },
      { x: 0.56, y: -0.56, material: creamBlock }
    ];
    const blocks = BLOCKS.map(({ x, y, material }) => {
      const block = new THREE.Mesh(blockGeometry, material);
      block.position.set(x, y, 0);
      mark.add(block);
      return block;
    });

    scene.add(mark);

    // --- The network around it -------------------------------------------
    const NODE_COUNT = isSmall ? 34 : 64;
    const SHELL_RADIUS = 5.4;
    const nodePositions = fibonacciSphere(NODE_COUNT, SHELL_RADIUS);

    // Squashed on y and nudged in and out so the shell reads as a cloud
    // wrapping the ring rather than a perfect ball sitting behind it.
    nodePositions.forEach((p, i) => {
      p.y *= 0.72;
      p.multiplyScalar(0.86 + ((i * 37) % 23) / 70);
    });

    const nodeGeometry = track(new THREE.IcosahedronGeometry(0.085, 1));
    const nodeMaterial = track(new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.35,
      envMapIntensity: 1.2
    }));
    const nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, NODE_COUNT);
    nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const baseColor = new THREE.Color(TEAL_700);
    const accentColor = new THREE.Color(ORANGE_500);
    const dummy = new THREE.Object3D();
    // Every eighth node is orange, so the accent is distributed rather than
    // clustered, and nothing here is random: the scene composes identically
    // on every visit.
    for (let i = 0; i < NODE_COUNT; i++) {
      dummy.position.copy(nodePositions[i]);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
      nodes.setColorAt(i, i % 8 === 3 ? accentColor : baseColor);
    }
    nodes.instanceColor.needsUpdate = true;

    const constellation = new THREE.Group();
    constellation.add(nodes);

    // Wire each node to its two nearest neighbours. O(n^2) over 64 points is
    // nothing, and it runs once.
    const linePoints = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const distances = [];
      for (let j = 0; j < NODE_COUNT; j++) {
        if (i === j) continue;
        distances.push({ j, d: nodePositions[i].distanceTo(nodePositions[j]) });
      }
      distances.sort((a, b) => a.d - b.d);
      for (const { j } of distances.slice(0, 2)) {
        if (j < i) continue; // Each edge once.
        linePoints.push(nodePositions[i], nodePositions[j]);
      }
    }

    const lineGeometry = track(new THREE.BufferGeometry().setFromPoints(linePoints));
    const lineMaterial = track(new THREE.LineBasicMaterial({
      color: TEAL_500,
      transparent: true,
      opacity: 0.3
    }));
    constellation.add(new THREE.LineSegments(lineGeometry, lineMaterial));
    scene.add(constellation);

    // --- Motion ------------------------------------------------------------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (event) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const clock = new THREE.Clock();
    let frame = 0;
    let visible = true;

    // Entrance: the mark settles in from slightly further away and smaller.
    const ENTRANCE_MS = 1500;
    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();

      const progress = reduceMotion
        ? 1
        : Math.min(1, (performance.now() - start) / ENTRANCE_MS);
      const eased = easeOutCubic(progress);

      mark.scale.setScalar(0.84 + 0.16 * eased);
      camera.position.z = 15.5 - 2.5 * eased;

      // The ring turns slowly on its own axis; the blocks only sway, so the
      // quad stays readable instead of tumbling.
      ring.rotation.z = elapsed * 0.16;
      innerBand.rotation.z = -elapsed * 0.1;
      blocks.forEach((block, i) => {
        block.rotation.z = Math.sin(elapsed * 0.5 + i) * 0.08;
        block.position.z = Math.sin(elapsed * 0.9 + i * 1.7) * 0.07;
      });

      mark.position.y = Math.sin(elapsed * 0.4) * 0.13;

      constellation.rotation.y = elapsed * 0.05;
      constellation.rotation.x = Math.sin(elapsed * 0.22) * 0.08;

      // Nodes breathe on staggered phases. Writing only the scale keeps this
      // to one matrix upload per frame and no geometry churn.
      for (let i = 0; i < NODE_COUNT; i++) {
        const pulse = 0.78 + 0.42 * (0.5 + 0.5 * Math.sin(elapsed * 1.25 + i * 0.9));
        dummy.position.copy(nodePositions[i]);
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        nodes.setMatrixAt(i, dummy.matrix);
      }
      nodes.instanceMatrix.needsUpdate = true;

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      // The camera moves rather than the object, which is what makes the
      // parallax feel like looking around something solid.
      camera.position.x = pointer.x * 1.6;
      camera.position.y = 0.2 - pointer.y * 1.0;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (visible) renderFrame();
    };

    if (reduceMotion) {
      // One composed frame, at the angle the entrance would have settled on.
      camera.position.z = 13;
      mark.scale.setScalar(1);
      renderer.render(scene, camera);
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      loop();
    }

    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting && !document.hidden; },
      { threshold: 0 }
    );
    observer.observe(mount);

    const onVisibilityChange = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (reduceMotion) renderer.render(scene, camera);
    });
    resizeObserver.observe(mount);

    const canvas = renderer.domElement;
    const onContextLost = (event) => {
      event.preventDefault();
      cancelAnimationFrame(frame);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      nodes.dispose();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  // Every WebGL context option was refused: show the same static mark the
  // error boundary uses, rather than two near-identical copies of the SVG.
  if (webglFailed) return <HeroMark />;

  return <div className="hero__scene" ref={mountRef} aria-hidden="true" />;
}
