export const fragmentShader = `
  uniform sampler2D map;

  varying vec2 vUv;
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    vec4 texColor = texture2D(map, vUv);

    // Only discard completely transparent pixels
    if (texColor.a < 0.01) {
      discard;
    }

    gl_FragColor = vec4(texColor.rgb * vColor, texColor.a * vOpacity);
  }
`;
