/**
 * GPU compute foundation for edge processing
 * Leverages WebGL compute capabilities for high-performance edge calculations
 */

export interface GPUComputeConfig {
  maxTextureSize?: number;
  enableFloatTextures?: boolean;
  enableComputeShaders?: boolean;
  workGroupSize?: number;
  preferredAPI?: 'webgl2' | 'webgpu';
}

export interface EdgeComputeData {
  positions: Float32Array;
  nodePositions: Float32Array;
  edgeIndices: Uint32Array;
  edgeProperties: Float32Array;
}

export interface ComputeResult {
  edgePositions: Float32Array;
  edgeColors: Float32Array;
  edgeVisibility: Uint8Array;
  computeTime: number;
}

/**
 * WebGL2-based edge compute pipeline
 */
export class WebGLEdgeCompute {
  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private config: GPUComputeConfig;
  private isInitialized = false;

  // Shader programs
  private positionComputeProgram: WebGLProgram | null = null;
  private colorComputeProgram: WebGLProgram | null = null;
  private visibilityComputeProgram: WebGLProgram | null = null;

  // Textures and framebuffers
  private nodePositionTexture: WebGLTexture | null = null;
  private edgeIndicesTexture: WebGLTexture | null = null;
  private edgePropertiesTexture: WebGLTexture | null = null;
  private outputFramebuffer: WebGLFramebuffer | null = null;

  constructor(config: GPUComputeConfig = {}) {
    this.config = {
      maxTextureSize: 4096,
      enableFloatTextures: true,
      enableComputeShaders: false,
      workGroupSize: 64,
      preferredAPI: 'webgl2',
      ...config
    };

    // Create offscreen canvas for compute operations
    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(1, 1);
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 1;
      this.canvas.height = 1;
    }
  }

  /**
   * Initialize WebGL2 context and resources
   */
  async initialize(): Promise<boolean> {
    try {
      this.gl = this.canvas.getContext('webgl2', {
        powerPreference: 'high-performance'
      }) as WebGL2RenderingContext;

      if (!this.gl) {
        throw new Error('WebGL2 not supported');
      }

      // Check for required extensions
      const requiredExtensions = [
        'EXT_color_buffer_float',
        'OES_texture_float_linear'
      ];

      for (const ext of requiredExtensions) {
        if (!this.gl.getExtension(ext)) {
          console.warn(
            `WebGL extension ${ext} not available, falling back to basic compute`
          );
        }
      }

      // Initialize shaders
      await this.initializeShaders();

      // Initialize textures and framebuffers
      this.initializeResources();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize WebGL edge compute:', error);
      return false;
    }
  }

  /**
   * Initialize compute shader programs
   */
  private async initializeShaders(): Promise<void> {
    if (!this.gl) throw new Error('WebGL context not initialized');

    // Position compute shader
    this.positionComputeProgram = this.createShaderProgram(
      this.getVertexShader(),
      this.getPositionComputeFragmentShader()
    );

    // Color compute shader
    this.colorComputeProgram = this.createShaderProgram(
      this.getVertexShader(),
      this.getColorComputeFragmentShader()
    );

    // Visibility compute shader
    this.visibilityComputeProgram = this.createShaderProgram(
      this.getVertexShader(),
      this.getVisibilityComputeFragmentShader()
    );
  }

  /**
   * Create shader program from vertex and fragment shaders
   */
  private createShaderProgram(
    vertexSource: string,
    fragmentSource: string
  ): WebGLProgram {
    if (!this.gl) throw new Error('WebGL context not initialized');

    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexSource
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSource
    );

    const program = this.gl.createProgram();
    if (!program) throw new Error('Failed to create shader program');

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Shader program linking failed: ${error}`);
    }

    return program;
  }

  /**
   * Compile individual shader
   */
  private compileShader(type: number, source: string): WebGLShader {
    if (!this.gl) throw new Error('WebGL context not initialized');

    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${error}`);
    }

    return shader;
  }

  /**
   * Initialize textures and framebuffers
   */
  private initializeResources(): void {
    if (!this.gl) return;

    // Create output framebuffer
    this.outputFramebuffer = this.gl.createFramebuffer();
  }

  /**
   * Process edges using GPU compute
   */
  async processEdges(data: EdgeComputeData): Promise<ComputeResult> {
    if (!this.isInitialized || !this.gl) {
      throw new Error('GPU compute not initialized');
    }

    const startTime = performance.now();

    // Upload data to textures
    this.uploadDataToTextures(data);

    // Compute edge positions
    const edgePositions = this.computeEdgePositions(data);

    // Compute edge colors
    const edgeColors = this.computeEdgeColors(data);

    // Compute edge visibility
    const edgeVisibility = this.computeEdgeVisibility(data);

    const computeTime = performance.now() - startTime;

    return {
      edgePositions,
      edgeColors,
      edgeVisibility,
      computeTime
    };
  }

  /**
   * Upload data to GPU textures
   */
  private uploadDataToTextures(data: EdgeComputeData): void {
    if (!this.gl) return;

    // Upload node positions
    this.nodePositionTexture = this.createDataTexture(
      data.nodePositions,
      this.gl.RGB32F,
      this.gl.RGB,
      this.gl.FLOAT
    );

    // Upload edge indices
    this.edgeIndicesTexture = this.createDataTexture(
      data.edgeIndices,
      this.gl.RG32UI,
      this.gl.RG_INTEGER,
      this.gl.UNSIGNED_INT
    );

    // Upload edge properties
    this.edgePropertiesTexture = this.createDataTexture(
      data.edgeProperties,
      this.gl.RGBA32F,
      this.gl.RGBA,
      this.gl.FLOAT
    );
  }

  /**
   * Create data texture from array
   */
  private createDataTexture(
    data: Float32Array | Uint32Array,
    internalFormat: number,
    format: number,
    type: number
  ): WebGLTexture {
    if (!this.gl) throw new Error('WebGL context not initialized');

    const texture = this.gl.createTexture();
    if (!texture) throw new Error('Failed to create texture');

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // Calculate texture dimensions
    const width = Math.min(
      Math.ceil(Math.sqrt(data.length)),
      this.config.maxTextureSize!
    );
    const height = Math.ceil(data.length / width);

    // Pad data if necessary
    const paddedSize = width * height;
    let paddedData = data;
    if (data.length < paddedSize) {
      paddedData = new (data.constructor as any)(paddedSize);
      paddedData.set(data);
    }

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      internalFormat,
      width,
      height,
      0,
      format,
      type,
      paddedData
    );

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      this.gl.NEAREST
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );

    return texture;
  }

  /**
   * Compute edge positions using GPU
   */
  private computeEdgePositions(data: EdgeComputeData): Float32Array {
    if (!this.gl || !this.positionComputeProgram) {
      throw new Error('Position compute shader not available');
    }

    // Set up compute pass
    this.gl.useProgram(this.positionComputeProgram);

    // Bind input textures
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.nodePositionTexture);
    this.gl.uniform1i(
      this.gl.getUniformLocation(
        this.positionComputeProgram,
        'u_nodePositions'
      ),
      0
    );

    this.gl.activeTexture(this.gl.TEXTURE1);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.edgeIndicesTexture);
    this.gl.uniform1i(
      this.gl.getUniformLocation(this.positionComputeProgram, 'u_edgeIndices'),
      1
    );

    // Execute compute and read back results
    return this.executeComputePass(data.edgeIndices.length * 2); // 2 positions per edge
  }

  /**
   * Compute edge colors using GPU
   */
  private computeEdgeColors(data: EdgeComputeData): Float32Array {
    if (!this.gl || !this.colorComputeProgram) {
      throw new Error('Color compute shader not available');
    }

    this.gl.useProgram(this.colorComputeProgram);

    // Bind textures and execute
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.edgePropertiesTexture);
    this.gl.uniform1i(
      this.gl.getUniformLocation(this.colorComputeProgram, 'u_edgeProperties'),
      0
    );

    return this.executeComputePass(data.edgeIndices.length);
  }

  /**
   * Compute edge visibility using GPU
   */
  private computeEdgeVisibility(data: EdgeComputeData): Uint8Array {
    if (!this.gl || !this.visibilityComputeProgram) {
      throw new Error('Visibility compute shader not available');
    }

    this.gl.useProgram(this.visibilityComputeProgram);

    // Bind textures and execute
    const result = this.executeComputePass(data.edgeIndices.length);

    // Convert float result to uint8
    return new Uint8Array(result.map(v => (v > 0.5 ? 1 : 0)));
  }

  /**
   * Execute compute pass and read back results
   */
  private executeComputePass(outputSize: number): Float32Array {
    if (!this.gl) throw new Error('WebGL context not initialized');

    // Create output texture
    const outputTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture);

    const width = Math.min(
      Math.ceil(Math.sqrt(outputSize)),
      this.config.maxTextureSize!
    );
    const height = Math.ceil(outputSize / width);

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA32F,
      width,
      height,
      0,
      this.gl.RGBA,
      this.gl.FLOAT,
      null
    );

    // Set up framebuffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.outputFramebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      outputTexture,
      0
    );

    // Set viewport and execute
    this.gl.viewport(0, 0, width, height);

    // Draw full-screen quad to trigger fragment shader
    this.drawFullscreenQuad();

    // Read back results
    const result = new Float32Array(width * height * 4);
    this.gl.readPixels(
      0,
      0,
      width,
      height,
      this.gl.RGBA,
      this.gl.FLOAT,
      result
    );

    // Cleanup
    this.gl.deleteTexture(outputTexture);

    return result.slice(0, outputSize);
  }

  /**
   * Draw fullscreen quad to trigger fragment shader execution
   */
  private drawFullscreenQuad(): void {
    if (!this.gl) return;

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

    const positionLocation = this.gl.getAttribLocation(
      this.gl.getParameter(this.gl.CURRENT_PROGRAM),
      'a_position'
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(
      positionLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    );

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.gl.deleteBuffer(buffer);
  }

  /**
   * Get vertex shader source
   */
  private getVertexShader(): string {
    return `#version 300 es
      in vec2 a_position;
      out vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `;
  }

  /**
   * Get position compute fragment shader
   */
  private getPositionComputeFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      uniform sampler2D u_nodePositions;
      uniform usampler2D u_edgeIndices;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      void main() {
        ivec2 texSize = textureSize(u_edgeIndices, 0);
        ivec2 coord = ivec2(v_texCoord * vec2(texSize));
        
        uvec2 indices = texelFetch(u_edgeIndices, coord, 0).rg;
        
        // Fetch node positions
        vec3 startPos = texelFetch(u_nodePositions, ivec2(indices.x, 0), 0).rgb;
        vec3 endPos = texelFetch(u_nodePositions, ivec2(indices.y, 0), 0).rgb;
        
        // Calculate edge midpoint and direction
        vec3 midpoint = (startPos + endPos) * 0.5;
        vec3 direction = normalize(endPos - startPos);
        
        fragColor = vec4(midpoint, length(endPos - startPos));
      }
    `;
  }

  /**
   * Get color compute fragment shader
   */
  private getColorComputeFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      uniform sampler2D u_edgeProperties;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      void main() {
        vec4 properties = texture(u_edgeProperties, v_texCoord);
        
        // Extract color from properties
        float colorValue = properties.r;
        float opacity = properties.g;
        
        // Convert to RGB
        vec3 color = vec3(
          mod(colorValue, 256.0) / 255.0,
          mod(colorValue / 256.0, 256.0) / 255.0,
          mod(colorValue / 65536.0, 256.0) / 255.0
        );
        
        fragColor = vec4(color, opacity);
      }
    `;
  }

  /**
   * Get visibility compute fragment shader
   */
  private getVisibilityComputeFragmentShader(): string {
    return `#version 300 es
      precision highp float;
      
      uniform sampler2D u_edgeProperties;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      void main() {
        vec4 properties = texture(u_edgeProperties, v_texCoord);
        
        // Extract visibility flags
        float visible = properties.b;
        float highlighted = properties.a;
        
        // Combine visibility conditions
        float finalVisibility = visible * (1.0 + highlighted);
        
        fragColor = vec4(finalVisibility, 0.0, 0.0, 1.0);
      }
    `;
  }

  /**
   * Check if GPU compute is supported
   */
  static async isSupported(): Promise<boolean> {
    try {
      const canvas =
        typeof OffscreenCanvas !== 'undefined'
          ? new OffscreenCanvas(1, 1)
          : document.createElement('canvas');

      const gl = canvas.getContext('webgl2');
      return gl !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get GPU capabilities
   */
  getCapabilities(): {
    maxTextureSize: number;
    maxViewportSize: number;
    floatTexturesSupported: boolean;
    computeShadersSupported: boolean;
  } | null {
    if (!this.gl) return null;

    return {
      maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
      maxViewportSize: this.gl.getParameter(this.gl.MAX_VIEWPORT_DIMS)[0],
      floatTexturesSupported: !!this.gl.getExtension('EXT_color_buffer_float'),
      computeShadersSupported: false // WebGL2 doesn't have compute shaders
    };
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (!this.gl) return;

    // Clean up shaders
    if (this.positionComputeProgram)
      this.gl.deleteProgram(this.positionComputeProgram);
    if (this.colorComputeProgram)
      this.gl.deleteProgram(this.colorComputeProgram);
    if (this.visibilityComputeProgram)
      this.gl.deleteProgram(this.visibilityComputeProgram);

    // Clean up textures
    if (this.nodePositionTexture)
      this.gl.deleteTexture(this.nodePositionTexture);
    if (this.edgeIndicesTexture) this.gl.deleteTexture(this.edgeIndicesTexture);
    if (this.edgePropertiesTexture)
      this.gl.deleteTexture(this.edgePropertiesTexture);

    // Clean up framebuffers
    if (this.outputFramebuffer)
      this.gl.deleteFramebuffer(this.outputFramebuffer);

    this.isInitialized = false;
  }
}

/**
 * High-level GPU edge processor
 */
export class GPUEdgeProcessor {
  private webglCompute: WebGLEdgeCompute | null = null;
  private isInitialized = false;

  constructor(private config: GPUComputeConfig = {}) {}

  /**
   * Initialize GPU processing
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.config.preferredAPI === 'webgl2' || !this.config.preferredAPI) {
        this.webglCompute = new WebGLEdgeCompute(this.config);
        this.isInitialized = await this.webglCompute.initialize();
      }

      return this.isInitialized;
    } catch (error) {
      console.error('Failed to initialize GPU edge processor:', error);
      return false;
    }
  }

  /**
   * Process edges using available GPU compute
   */
  async processEdges(data: EdgeComputeData): Promise<ComputeResult | null> {
    if (!this.isInitialized) {
      console.warn('GPU processor not initialized, falling back to CPU');
      return null;
    }

    if (this.webglCompute) {
      return await this.webglCompute.processEdges(data);
    }

    return null;
  }

  /**
   * Check if GPU processing is available
   */
  static async isAvailable(): Promise<boolean> {
    return await WebGLEdgeCompute.isSupported();
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.webglCompute) {
      this.webglCompute.dispose();
    }
    this.isInitialized = false;
  }
}
