export const vertexShader = `
  attribute float opacity;
  attribute vec3 color;

  varying vec2 vUv;
  varying float vOpacity;
  varying vec3 vColor;

  void main() {
    vUv = uv;
    vOpacity = opacity;
    vColor = color;

    // Billboard effect
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

    // Scale and orient to camera
    vec3 scale = vec3(
      length(instanceMatrix[0].xyz),
      length(instanceMatrix[1].xyz),
      length(instanceMatrix[2].xyz)
    );

    mvPosition.xy += position.xy * scale.xy;

    gl_Position = projectionMatrix * mvPosition;
  }
`;
