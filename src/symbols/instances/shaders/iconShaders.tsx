export const iconVertexShader = `
      attribute float customOpacity;
      attribute vec4 uvOffset;
      attribute vec3 customColor;
      varying vec2 vUv;
      varying float vOpacity;
      varying vec3 vColor;

      void main() {
        vUv = uv * uvOffset.zw + uvOffset.xy;
        vOpacity = customOpacity;
        vColor = customColor;

        // Simple and reliable billboard approach
        // Get the center position from instance matrix
        vec3 center = instanceMatrix[3].xyz;

        // Get scale from instance matrix
        float scale = length(instanceMatrix[0].xyz);

        // Transform center to view space
        vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);

        // Apply billboard effect: add vertex position in view space
        vec4 mvPosition = mvCenter;
        mvPosition.xy += position.xy * scale;

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

export const iconFragmentShader = `
    uniform sampler2D iconTexture;
    uniform float opacity;

    varying vec2 vUv;
    varying float vOpacity;
    varying vec3 vColor;

    void main() {
      vec4 iconColor = texture2D(iconTexture, vUv);
      if (iconColor.a < 0.1) discard;

      gl_FragColor = vec4(iconColor.rgb * vColor, iconColor.a * vOpacity * opacity);
    }
  `;
