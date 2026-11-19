import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// A perspective field of dots that rolls like a slow ocean swell.
// Crests pick up the accent colour; the cursor raises a soft ripple.

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vHeight;
  varying float vFade;

  void main() {
    vec3 p = position;

    float h = sin(p.x * 0.32 + uTime * 0.55) * 0.32
            + sin(p.z * 0.45 + uTime * 0.7) * 0.22
            + sin((p.x + p.z) * 0.22 + uTime * 0.35) * 0.38;

    // Ripple around the cursor
    float d = distance(p.xz, uMouse);
    h += exp(-d * d * 0.18) * (0.55 + 0.25 * sin(uTime * 2.4 - d * 1.6));

    h *= 1.35;
    p.y += h;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (7.0 / -mv.z);

    vHeight = h;
    float far = smoothstep(-22.0, -6.0, p.z);
    float near = 1.0 - smoothstep(3.0, 6.0, p.z);
    float side = 1.0 - smoothstep(9.0, 14.0, abs(p.x));
    vFade = far * near * side;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uAccent;
  varying float vHeight;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);

    float crest = smoothstep(0.05, 0.9, vHeight);
    vec3 color = mix(uBase, uAccent, crest);
    float alpha = soft * vFade * mix(0.45, 1.0, crest);

    gl_FragColor = vec4(color, alpha);
  }
`;

function grid(step) {
  const pts = [];
  for (let x = -14; x <= 14; x += step) {
    for (let z = -22; z <= 6; z += step) pts.push(x, 0, z);
  }
  return new Float32Array(pts);
}

const Field = ({ step, size }) => {
  const mat = useRef();
  const gl = useThree((s) => s.gl);
  const positions = useMemo(() => grid(step), [step]);
  const mouse = useRef(new THREE.Vector2(0, -2));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, -2) },
      uPixelRatio: { value: gl.getPixelRatio() },
      uSize: { value: size },
      uBase: { value: new THREE.Color("#b9b9c2") },
      uAccent: { value: new THREE.Color("#c8ff3d") },
    }),
    [gl, size]
  );

  useFrame((state, delta) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value += delta;
    // Map the pointer roughly onto the plane: left/right → x, up/down → depth
    const px = Math.max(-1.2, Math.min(1.2, state.pointer.x));
    const py = Math.max(-1, Math.min(1, state.pointer.y));
    const target = new THREE.Vector2(px * 8, THREE.MathUtils.mapLinear(py, -1, 0.2, 3.5, -8));
    mouse.current.lerp(target, Math.min(delta * 3, 1));
    u.uMouse.value.copy(mouse.current);
  });

  return (
    <points position={[0, -1.4, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Rig = () => {
  const camera = useThree((s) => s.camera);
  useFrame((state, delta) => {
    // Gentle camera drift toward the pointer for depth
    const k = Math.min(delta * 1.5, 1);
    camera.position.x += (state.pointer.x * 0.6 - camera.position.x) * k;
    camera.position.y += (1.5 + state.pointer.y * 0.25 - camera.position.y) * k;
    camera.lookAt(0, -0.9, -6);
  });
  return null;
};

const HeroWave = ({ dense = true }) => (
  <Canvas
    eventSource={document.getElementById("root")}
    eventPrefix="client"
    dpr={[1, 1.75]}
    camera={{ position: [0, 1.5, 6], fov: 55 }}
    gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
  >
    <Rig />
    <Field step={dense ? 0.2 : 0.32} size={dense ? 3.4 : 3.6} />
  </Canvas>
);

export default HeroWave;
