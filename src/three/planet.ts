import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineLoop,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TextureLoader,
  Timer,
  Vector3,
  WebGLRenderer,
} from "three";

/*
 * The planet behind the page: a textured Earth with a dawn terminator,
 * an atmosphere glow, and the sister sites orbiting as labelled satellites.
 * Sections marked with data-state="…" decide where the planet sits.
 */

type Pose = { x: number; y: number; s: number; lab: number };
type StateName = "hero" | "about" | "skills" | "blog" | "contact";

// x, y: fraction of viewport width / height (-0.5…0.5); s: radius relative to viewport height
const POSES: Record<"wide" | "narrow", Record<StateName, Pose>> = {
  wide: {
    hero: { x: 0.3, y: -0.44, s: 0.46, lab: 1 },
    about: { x: 0.27, y: -0.08, s: 0.3, lab: 0 },
    skills: { x: 0.36, y: 0.1, s: 0.2, lab: 0 },
    blog: { x: 0.38, y: 0.3, s: 0.14, lab: 0 },
    contact: { x: 0, y: -0.66, s: 0.5, lab: 0 },
  },
  narrow: {
    hero: { x: 0.14, y: -0.4, s: 0.26, lab: 0 },
    about: { x: 0.32, y: -0.38, s: 0.18, lab: 0 },
    skills: { x: 0.75, y: 0.2, s: 0.12, lab: 0 },
    blog: { x: 0.75, y: 0.2, s: 0.12, lab: 0 },
    contact: { x: 0, y: -0.55, s: 0.3, lab: 0 },
  },
};

const ORBIT_R = 1.38;
const CAMERA_Z = 5;
const smooth = (v: number) => v * v * (3 - 2 * v);
const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

const earthVertex = /* glsl */ `
  varying vec2 vUv; varying vec3 vN;
  void main() {
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }`;

const earthFragment = /* glsl */ `
  uniform sampler2D uMap; uniform vec3 uLight; uniform float uO;
  varying vec2 vUv; varying vec3 vN;
  void main() {
    vec3 c = pow(texture2D(uMap, vUv).rgb, vec3(1. / 2.2));
    float land = smoothstep(.04, .2, max(c.r, c.b));
    vec3 col = mix(vec3(.055, .035, .1), c, land);              // dark ocean keeps the sphere readable
    float l = dot(vN, uLight);
    float lit = smoothstep(-.35, .8, l);
    col *= .32 + lit * .95;
    col += vec3(1., .71, .42) * exp(-pow((l - .02) * 7., 2.)) * (.18 + land * .3); // dawn terminator
    col += vec3(.65, .45, 1.) * pow(1. - max(vN.z, 0.), 3.) * .35 * lit;            // rim light
    gl_FragColor = vec4(pow(col, vec3(2.2)), uO);
  }`;

const atmoVertex = /* glsl */ `
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }`;

const atmoFragment = /* glsl */ `
  uniform vec3 uLight; uniform float uO; varying vec3 vN;
  void main() {
    float i = pow(clamp(-vN.z / .57, 0., 1.), 2.4);
    float side = smoothstep(-.6, .9, dot(-vN, uLight));
    vec3 col = mix(vec3(.4, .2, .75), vec3(1., .66, .38), side * .9);
    gl_FragColor = vec4(col * i * .9 * uO, 1.);
  }`;

/** Builds the scene on `canvas` and returns a cleanup function. */
export function createPlanet(canvas: HTMLCanvasElement, labels: (HTMLAnchorElement | null)[]) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true });
  } catch {
    return () => {}; // no WebGL: the page still works on the plain background
  }
  renderer.setClearColor(0x0a0713, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);

  const planet = new Group();
  const tilt = new Group();
  const globe = new Group();
  tilt.rotation.set(0.18, 0, 0.32);
  scene.add(planet);
  planet.add(tilt);
  tilt.add(globe);

  // Earth
  const light = new Vector3(-0.75, 0.45, 0.55).normalize(); // from upper-left front (view space)
  const tex = new TextureLoader().load("/earth.webp");
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const earthMat = new ShaderMaterial({
    transparent: true,
    uniforms: { uMap: { value: tex }, uLight: { value: light }, uO: { value: reduce ? 1 : 0 } },
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
  });
  const earthGeo = new SphereGeometry(1, 96, 96);
  globe.add(new Mesh(earthGeo, earthMat));

  // Atmosphere glow around the rim
  const atmoMat = new ShaderMaterial({
    side: BackSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uLight: { value: light }, uO: { value: reduce ? 1 : 0 } },
    vertexShader: atmoVertex,
    fragmentShader: atmoFragment,
  });
  const atmoGeo = new SphereGeometry(1.22, 64, 64);
  planet.add(new Mesh(atmoGeo, atmoMat));

  // Orbit ring and sister-site satellites
  const orbit = new Group();
  orbit.rotation.set(1.18, -0.28, 0);
  planet.add(orbit);
  const ringGeo = new BufferGeometry().setFromPoints(
    Array.from({ length: 256 }, (_, i) => {
      const a = (i / 256) * Math.PI * 2;
      return new Vector3(Math.cos(a) * ORBIT_R, Math.sin(a) * ORBIT_R, 0);
    }),
  );
  const ringMat = new LineBasicMaterial({ color: 0xe8defe, transparent: true, opacity: 0.16 });
  orbit.add(new LineLoop(ringGeo, ringMat));

  const satGeo = new SphereGeometry(0.022, 12, 12);
  const satMat = new MeshBasicMaterial({ color: 0xffb46b });
  const sats = labels.map((el, i) => {
    const mesh = new Mesh(satGeo, satMat);
    orbit.add(mesh);
    return { mesh, el, phase: (i / labels.length) * Math.PI * 2 + 0.4 };
  });

  // Stars
  const starPos = new Float32Array(1400 * 3);
  for (let i = 0; i < 1400; i++) {
    const r = 12 + Math.random() * 18;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    starPos.set([r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b) - 6], i * 3);
  }
  const starGeo = new BufferGeometry().setAttribute("position", new BufferAttribute(starPos, 3));
  const starMat = new PointsMaterial({
    color: 0xcfc2f5,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const stars = new Points(starGeo, starMat);
  scene.add(stars);

  // Scroll → target pose, eased between neighbouring sections
  const sections = [...document.querySelectorAll<HTMLElement>("[data-state]")];
  let tops: number[] = [];
  const measure = () => {
    tops = sections.map((s) => s.getBoundingClientRect().top + scrollY);
  };
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);
  measure();

  const target = (): Pose => {
    const set = innerWidth / innerHeight < 0.9 ? POSES.narrow : POSES.wide;
    const pose = (el: HTMLElement) => set[el.dataset.state as StateName] ?? set.hero;
    const y = scrollY + innerHeight * 0.5;
    let i = 0;
    while (i < sections.length - 1 && tops[i + 1] <= y) i++;
    const a = pose(sections[i]);
    if (!sections[i + 1]) return a;
    const b = pose(sections[i + 1]);
    // start moving 40% into the current section
    const h = tops[i + 1] - tops[i];
    const t = smooth(clamp01((y - tops[i] - h * 0.4) / (h * 0.6)));
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      s: a.s + (b.s - a.s) * t,
      lab: a.lab + (b.lab - a.lab) * t,
    };
  };
  const cur = target();

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener("resize", resize);

  const pointer = { x: 0, y: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  };
  addEventListener("pointermove", onPointer, { passive: true });

  const viewH = 2 * CAMERA_Z * Math.tan(MathUtils.degToRad(camera.fov / 2));
  const world = new Vector3();
  const ndc = new Vector3();
  const center = new Vector3();
  const timer = new Timer();
  const born = reduce ? -Infinity : performance.now() + 250;
  let rot = 0;

  renderer.setAnimationLoop((now: number) => {
    timer.update(now);
    const dt = Math.min(timer.getDelta(), 0.05);

    // Intro: fade and grow in
    const p = clamp01((now - born) / 2600);
    earthMat.uniforms.uO.value = Math.min(p * 1.6, 1);
    atmoMat.uniforms.uO.value = smooth(clamp01((p - 0.3) / 0.7));
    tilt.scale.setScalar(0.86 + (1 - (1 - p) ** 3) * 0.14);

    // Follow the scroll target
    const t = target();
    const k = 1 - 0.0016 ** dt;
    cur.x += (t.x - cur.x) * k;
    cur.y += (t.y - cur.y) * k;
    cur.s += (t.s - cur.s) * k;
    cur.lab += (t.lab - cur.lab) * k;
    const vw = viewH * camera.aspect;
    planet.position.set(cur.x * vw + pointer.x * 0.08, cur.y * viewH - pointer.y * 0.06, 0);
    planet.scale.setScalar(cur.s * viewH);

    if (!reduce) {
      rot += dt * 0.045;
      globe.rotation.y = rot - (1 - p) * 0.9;
      stars.rotation.y = rot * 0.15;
    }

    // Satellites and their HTML labels
    center.copy(planet.position).project(camera);
    const cx = (center.x * 0.5 + 0.5) * innerWidth;
    const cy = (-center.y * 0.5 + 0.5) * innerHeight;
    const radiusPx = (planet.scale.x / viewH) * innerHeight;
    sats.forEach((s) => {
      const a = s.phase + (reduce ? 0 : (now / 1000) * 0.07);
      s.mesh.position.set(Math.cos(a) * ORBIT_R, Math.sin(a) * ORBIT_R, 0);
      s.mesh.getWorldPosition(world);
      ndc.copy(world).project(camera);
      const sx = (ndc.x * 0.5 + 0.5) * innerWidth;
      const sy = (-ndc.y * 0.5 + 0.5) * innerHeight;
      const behind = world.z < planet.position.z;
      const hidden = behind && Math.hypot(sx - cx, sy - cy) < radiusPx;
      s.mesh.visible = !hidden;

      const el = s.el;
      if (!el) return;
      const o = cur.lab * p * (hidden ? 0 : behind ? 0.45 : 1);
      el.style.transform = `translate(${(sx + 10).toFixed(1)}px, ${(sy - 14).toFixed(1)}px)`;
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.04 ? "hidden" : "visible";
      el.style.pointerEvents = o > 0.5 ? "auto" : "none";
      el.tabIndex = o > 0.5 ? 0 : -1;
    });

    renderer.render(scene, camera);
  });

  return () => {
    renderer.setAnimationLoop(null);
    removeEventListener("resize", resize);
    removeEventListener("pointermove", onPointer);
    ro.disconnect();
    timer.dispose();
    tex.dispose();
    [earthGeo, atmoGeo, ringGeo, satGeo, starGeo].forEach((g) => g.dispose());
    [earthMat, atmoMat, ringMat, satMat, starMat].forEach((m) => m.dispose());
    renderer.dispose();
  };
}
