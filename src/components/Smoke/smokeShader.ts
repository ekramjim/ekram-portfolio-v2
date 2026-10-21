export const SMOKE_VERTEX = /* glsl */ `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

/**
 * Teal smoke after the "Allegro Midnight" wallpaper, turned upside down: domain-warped noise sets a turbulent front
 * between midnight water (top) and pale mist (bottom), which clears into the paper ground. The warp drifts slowly.
 */
export const SMOKE_FRAGMENT = /* glsl */ `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;   // 0..1, y up
uniform float uStir;     // 0..1, how hard the pointer is stirring
uniform vec3 uPaper;     // the page ground the smoke clears into

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
const mat2 ROT = mat2(0.8, 0.6, -0.6, 0.8);
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = ROT * p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

// Colours sampled from the wallpaper, darkest to palest.
vec3 ramp(float k) {
  vec3 c = vec3(0.004, 0.047, 0.082);
  c = mix(c, vec3(0.000, 0.133, 0.212), smoothstep(0.00, 0.35, k));
  c = mix(c, vec3(0.000, 0.290, 0.369), smoothstep(0.35, 0.55, k));
  c = mix(c, vec3(0.059, 0.502, 0.529), smoothstep(0.55, 0.70, k));
  c = mix(c, vec3(0.231, 0.643, 0.620), smoothstep(0.70, 0.84, k));
  c = mix(c, vec3(0.424, 0.753, 0.694), smoothstep(0.84, 1.00, k));
  return c;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.7;
  float t = uTime * 0.035;

  // The pointer swirls the field around itself.
  vec2 toPointer = (uv - uPointer) * vec2(aspect, 1.0);
  p += uStir * 0.35 * vec2(-toPointer.y, toPointer.x) * exp(-dot(toPointer, toPointer) * 9.0);

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
  vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 0.9));
  float f = fbm(p + 3.0 * r);

  // The wallpaper upside down: midnight water above, pale mist below. The front sits lower on the left so the
  // headline stays on dark water, and the warp tears it into wisps.
  float front = 0.44 + 0.16 * uv.x + (f - 0.5) * 0.45 + (r.x - 0.5) * 0.2;
  float k = smoothstep(-0.35, 0.28, front - uv.y + (q.y - 0.5) * 0.08);
  k = clamp(k + (f - 0.5) * 0.12, 0.0, 1.0);
  vec3 col = ramp(k);

  // Fine grain hides banding in the long dark gradients.
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * (2.0 / 255.0);

  // The mist clears into the page's paper at the bottom edge. The edge is wispy, but lands exactly on paper.
  float clearing = smoothstep(0.34, 0.0, uv.y + (f - 0.5) * 0.3 * smoothstep(0.0, 0.2, uv.y));
  col = mix(col, uPaper, clearing);
  gl_FragColor = vec4(col, 1.0);
}
`;
