import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * The hero's 3D scene: a cluster of class rings, the motif the rest of the site
 * already uses in CSS, rendered in WebGL so it has real depth and lighting.
 *
 * Isolated as a leaf component and loaded lazily (see Home.jsx) so three.js
 * lands in its own chunk instead of the main bundle. Everything here lives
 * outside React state: the render loop writes to refs only, so a pointer move
 * never re-renders the tree.
 *
 * Degrades in three steps:
 *   1. prefers-reduced-motion  -> one static frame, no animation loop
 *   2. no WebGL / context lost -> canvas removed, the CSS backdrop shows through
 *   3. offscreen or hidden tab -> loop suspended, so it does not drain battery
 */
export default function HeroScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 640;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSmall,
        powerPreference: "low-power",
      });
    } catch {
      return; // No WebGL. The CSS backdrop on .hero__scene is the fallback.
    }

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1 : 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Brand palette, same hex values as the CSS tokens in styles/style.css.
    const TEAL_700 = 0x0e6e64;
    const TEAL_500 = 0x1cab98;
    const ORANGE_500 = 0xf2622e;
    const PEACH_300 = 0xffc38a;

    // Warm key light from the upper left, cool fill from the lower right, so the
    // rings read as metal against a cream page rather than flat silhouettes.
    scene.add(new THREE.AmbientLight(0xfbf6ee, 2.2));

    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(-4, 5, 6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(TEAL_500, 1.1);
    fill.position.set(5, -3, 2);
    scene.add(fill);

    const warm = new THREE.PointLight(PEACH_300, 18, 14);
    warm.position.set(2.5, 1.5, 3.5);
    scene.add(warm);

    const disposables = [];
    const track = (obj) => {
      disposables.push(obj);
      return obj;
    };

    const ringGeometry = track(
      new THREE.TorusGeometry(1, 0.3, isSmall ? 12 : 18, isSmall ? 48 : 90)
    );
    const gemGeometry = track(new THREE.IcosahedronGeometry(0.42, 1));

    const ringMaterial = (color) =>
      track(
        new THREE.MeshStandardMaterial({
          color,
          metalness: 0.82,
          roughness: 0.34,
        })
      );

    const tealRing = ringMaterial(TEAL_500);
    const deepRing = ringMaterial(TEAL_700);

    // Hand-placed rather than randomised: the composition reads as a deliberate
    // cluster, and it renders identically on every visit. The first entry is the
    // front ring that carries the gem.
    const layout = [
      { pos: [-0.3, 0.1, 0], scale: 1.5, tilt: [0.42, 0.26], material: tealRing, spin: 0.05 },
      { pos: [-2.9, 1.8, -2.2], scale: 0.74, tilt: [1.1, -0.4], material: deepRing, spin: 0.085 },
      { pos: [2.7, -1.4, -1.6], scale: 0.88, tilt: [-0.6, 0.8], material: deepRing, spin: -0.07 },
      { pos: [2.2, 1.9, -3.2], scale: 0.58, tilt: [0.5, 0.55], material: tealRing, spin: 0.11 },
      { pos: [-2.4, -2.0, -2.9], scale: 0.62, tilt: [-1.0, -0.9], material: deepRing, spin: -0.095 },
    ];

    const cluster = new THREE.Group();
    const spinning = [];
    let frontRing = null;

    layout.forEach(({ pos, scale, tilt, material, spin }, i) => {
      if (isSmall && i > 2) return; // Lighter cluster on phones.

      const ring = new THREE.Mesh(ringGeometry, material);
      ring.position.set(...pos);
      ring.scale.setScalar(scale);
      ring.rotation.set(tilt[0], tilt[1], 0);
      cluster.add(ring);
      spinning.push({ mesh: ring, spin });
      if (i === 0) frontRing = ring;
    });

    // The gem is a child of the front ring, set on the band at the top of the
    // torus, so it rides around with the ring exactly as a stone set in a real
    // class ring would. Same relationship as the CSS .class-ring__gem.
    const gem = new THREE.Mesh(
      gemGeometry,
      track(
        new THREE.MeshStandardMaterial({
          color: ORANGE_500,
          metalness: 0.4,
          roughness: 0.18,
          emissive: new THREE.Color(ORANGE_500),
          emissiveIntensity: 0.15,
        })
      )
    );
    gem.position.set(0, 1.16, 0);
    gem.scale.setScalar(0.78);
    frontRing.add(gem);

    scene.add(cluster);

    // Pointer parallax. Written to a plain object, never to React state, so this
    // costs one float per event and no re-render.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (event) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    let frame = 0;
    let visible = true;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();

      spinning.forEach(({ mesh, spin }) => {
        mesh.rotation.z += spin * 0.016;
        mesh.rotation.y += spin * 0.008;
      });

      // Slow vertical drift, so the cluster breathes instead of sitting still.
      cluster.position.y = Math.sin(elapsed * 0.35) * 0.12;

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      cluster.rotation.y = pointer.x * 0.22;
      cluster.rotation.x = pointer.y * 0.14;

      renderer.render(scene, camera);
    };

    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (visible) renderFrame();
    };

    if (reduceMotion) {
      renderer.render(scene, camera); // One static frame, nothing moves.
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      loop();
    }

    // Suspend the loop while the hero is scrolled away or the tab is in the
    // background. IntersectionObserver, not a scroll listener.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0 }
    );
    observer.observe(mount);

    const onVisibilityChange = () => {
      visible = !document.hidden;
    };
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
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  return <div className="hero__scene" ref={mountRef} aria-hidden="true" />;
}
