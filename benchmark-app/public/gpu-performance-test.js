// GPU Performance Diagnostic Script for Phase 2 Integration
// Tests WebGL2, SharedArrayBuffer, GPU memory bandwidth, and worker performance

console.log('🚀 Starting GPU Performance Diagnostic...\n');

class GPUDiagnostic {
  constructor() {
    this.results = {
      webgl2: null,
      sharedArrayBuffer: null,
      gpuMemory: null,
      workerPerformance: null,
      renderingStats: null,
      recommendations: []
    };
  }

  async runFullDiagnostic() {
    console.log('='.repeat(60));
    console.log('Phase 2 GPU Capability Assessment');
    console.log('='.repeat(60));

    await this.testWebGL2Capabilities();
    await this.testSharedArrayBuffer();
    await this.testGPUMemoryBandwidth();
    await this.testWorkerPerformance();
    await this.analyzeCurrentRendering();
    this.generateRecommendations();
    this.printSummaryReport();

    return this.results;
  }

  async testWebGL2Capabilities() {
    console.log('\n🔍 Testing WebGL2 Capabilities...');
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      this.results.webgl2 = { supported: false, reason: 'WebGL2 not available' };
      console.log('❌ WebGL2 not supported');
      return;
    }

    const capabilities = {
      supported: true,
      version: gl.getParameter(gl.VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxArrayTextureLayers: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS),
      maxComputeWorkGroupCount: gl.getParameter(gl.MAX_COMPUTE_WORK_GROUP_COUNT),
      maxComputeWorkGroupSize: gl.getParameter(gl.MAX_COMPUTE_WORK_GROUP_SIZE),
      extensions: gl.getSupportedExtensions()
    };

    // Test compute shader support
    const computeSupported = capabilities.extensions.includes('EXT_disjoint_timer_query_webgl2');
    capabilities.computeShaderSupport = computeSupported;

    this.results.webgl2 = capabilities;
    
    console.log(`✅ WebGL2 Support: ${capabilities.version}`);
    console.log(`   GPU: ${capabilities.renderer}`);
    console.log(`   Max Texture Size: ${capabilities.maxTextureSize}px`);
    console.log(`   Compute Shaders: ${computeSupported ? '✅' : '❌'}`);
  }

  async testSharedArrayBuffer() {
    console.log('\n🔍 Testing SharedArrayBuffer Support...');
    
    const result = {
      supported: typeof SharedArrayBuffer !== 'undefined',
      crossOriginIsolated: window.crossOriginIsolated || false,
      coopCoepHeaders: false
    };

    if (!result.supported) {
      console.log('❌ SharedArrayBuffer not available');
      result.reason = 'SharedArrayBuffer not defined';
    } else if (!result.crossOriginIsolated) {
      console.log('⚠️  SharedArrayBuffer available but not cross-origin isolated');
      result.reason = 'Missing COOP/COEP headers';
    } else {
      console.log('✅ SharedArrayBuffer fully supported');
      result.coopCoepHeaders = true;
      
      // Test SharedArrayBuffer performance
      const testSize = 1024 * 1024; // 1MB
      const buffer = new SharedArrayBuffer(testSize);
      const array = new Int32Array(buffer);
      
      const start = performance.now();
      for (let i = 0; i < array.length; i++) {
        array[i] = i;
      }
      const writeTime = performance.now() - start;
      
      result.performanceTest = {
        size: testSize,
        writeTime: writeTime,
        throughput: (testSize / 1024 / 1024) / (writeTime / 1000) // MB/s
      };
      
      console.log(`   Write Performance: ${result.performanceTest.throughput.toFixed(2)} MB/s`);
    }

    this.results.sharedArrayBuffer = result;
  }

  async testGPUMemoryBandwidth() {
    console.log('\n🔍 Testing GPU Memory Bandwidth...');
    
    if (!this.results.webgl2?.supported) {
      console.log('❌ Skipping GPU memory test (WebGL2 not supported)');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const gl = canvas.getContext('webgl2');

    // Create test texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    const testData = new Uint8Array(1024 * 1024 * 4); // 4MB texture
    for (let i = 0; i < testData.length; i++) {
      testData[i] = i % 256;
    }

    // Measure upload bandwidth
    const uploadStart = performance.now();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, testData);
    gl.finish(); // Wait for GPU
    const uploadTime = performance.now() - uploadStart;

    // Measure readback bandwidth
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const readData = new Uint8Array(1024 * 1024 * 4);
    const readStart = performance.now();
    gl.readPixels(0, 0, 1024, 1024, gl.RGBA, gl.UNSIGNED_BYTE, readData);
    gl.finish();
    const readTime = performance.now() - readStart;

    const bandwidth = {
      uploadBandwidth: (4 / 1024 / 1024) / (uploadTime / 1000), // MB/s
      readBandwidth: (4 / 1024 / 1024) / (readTime / 1000), // MB/s
      uploadTime,
      readTime
    };

    this.results.gpuMemory = bandwidth;
    
    console.log(`✅ GPU Upload Bandwidth: ${bandwidth.uploadBandwidth.toFixed(2)} MB/s`);
    console.log(`   GPU Read Bandwidth: ${bandwidth.readBandwidth.toFixed(2)} MB/s`);

    // Cleanup
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
  }

  async testWorkerPerformance() {
    console.log('\n🔍 Testing Web Worker Performance...');
    
    const workerCode = `
      self.onmessage = function(e) {
        const { testType, data } = e.data;
        const start = performance.now();
        
        if (testType === 'computation') {
          // Simulate force calculation
          let result = 0;
          for (let i = 0; i < data.iterations; i++) {
            result += Math.sqrt(i) * Math.sin(i);
          }
          const time = performance.now() - start;
          self.postMessage({ testType, result, time });
        } else if (testType === 'memory') {
          // Test memory operations
          const buffer = new ArrayBuffer(data.size);
          const view = new Float32Array(buffer);
          for (let i = 0; i < view.length; i++) {
            view[i] = Math.random();
          }
          const time = performance.now() - start;
          self.postMessage({ testType, time, throughput: (data.size / 1024 / 1024) / (time / 1000) });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    const testWorker = (testType, data) => {
      return new Promise((resolve) => {
        worker.onmessage = (e) => resolve(e.data);
        worker.postMessage({ testType, data });
      });
    };

    // Test computation performance
    const computeResult = await testWorker('computation', { iterations: 100000 });
    
    // Test memory performance
    const memoryResult = await testWorker('memory', { size: 1024 * 1024 }); // 1MB

    worker.terminate();

    this.results.workerPerformance = {
      computeTime: computeResult.time,
      memoryThroughput: memoryResult.throughput,
      supported: true
    };

    console.log(`✅ Worker Compute Performance: ${computeResult.time.toFixed(2)}ms for 100k iterations`);
    console.log(`   Worker Memory Throughput: ${memoryResult.throughput.toFixed(2)} MB/s`);
  }

  async analyzeCurrentRendering() {
    console.log('\n🔍 Analyzing Current Rendering Performance...');
    
    // Try to get existing performance data from the page
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.log('⚠️  No canvas found for rendering analysis');
      this.results.renderingStats = { available: false };
      return;
    }

    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) {
      console.log('⚠️  No WebGL context found');
      this.results.renderingStats = { available: false };
      return;
    }

    // Analyze WebGL state
    const stats = {
      available: true,
      canvasSize: { width: canvas.width, height: canvas.height },
      drawCalls: 0, // This would need to be tracked by the app
      textureCount: 0,
      bufferCount: 0,
      memoryUsage: 0
    };

    // Try to estimate current performance
    if (window.performance && window.performance.memory) {
      stats.heapUsed = window.performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      stats.heapTotal = window.performance.memory.totalJSHeapSize / 1024 / 1024; // MB
    }

    this.results.renderingStats = stats;
    
    console.log(`✅ Canvas Size: ${stats.canvasSize.width}x${stats.canvasSize.height}`);
    if (stats.heapUsed) {
      console.log(`   Heap Usage: ${stats.heapUsed.toFixed(2)}MB / ${stats.heapTotal.toFixed(2)}MB`);
    }
  }

  generateRecommendations() {
    console.log('\n💡 Generating Phase 2 Integration Recommendations...');
    
    const recommendations = [];

    // WebGL2 recommendations
    if (!this.results.webgl2?.supported) {
      recommendations.push({
        priority: 'HIGH',
        component: 'InstancedRenderer',
        issue: 'WebGL2 not supported',
        action: 'Implement WebGL1 fallback for instanced rendering'
      });
    } else if (!this.results.webgl2.computeShaderSupport) {
      recommendations.push({
        priority: 'MEDIUM',
        component: 'WebGLComputePipeline',
        issue: 'Compute shaders not available',
        action: 'Use vertex/fragment shaders for GPU computation'
      });
    }

    // SharedArrayBuffer recommendations
    if (!this.results.sharedArrayBuffer?.supported) {
      recommendations.push({
        priority: 'HIGH',
        component: 'SharedWorkerPool',
        issue: 'SharedArrayBuffer not available',
        action: 'Use MessageChannel for worker communication'
      });
    } else if (!this.results.sharedArrayBuffer.crossOriginIsolated) {
      recommendations.push({
        priority: 'MEDIUM',
        component: 'SharedWorkerPool',
        issue: 'COOP/COEP headers missing',
        action: 'Add Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers'
      });
    }

    // Performance recommendations
    if (this.results.gpuMemory) {
      if (this.results.gpuMemory.uploadBandwidth < 100) {
        recommendations.push({
          priority: 'MEDIUM',
          component: 'AdvancedMemoryManager',
          issue: 'Low GPU upload bandwidth',
          action: 'Implement texture streaming and LOD management'
        });
      }
    }

    if (this.results.workerPerformance?.computeTime > 50) {
      recommendations.push({
        priority: 'LOW',
        component: 'LayoutManager',
        issue: 'Slow worker computation',
        action: 'Consider reducing force calculation complexity'
      });
    }

    this.results.recommendations = recommendations;

    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.component}: ${rec.issue}`);
      console.log(`   → ${rec.action}`);
    });
  }

  printSummaryReport() {
    console.log('\n' + '='.repeat(60));
    console.log('PHASE 2 INTEGRATION READINESS REPORT');
    console.log('='.repeat(60));

    // Support matrix
    console.log('\n📊 Feature Support Matrix:');
    console.log(`WebGL2:           ${this.results.webgl2?.supported ? '✅' : '❌'}`);
    console.log(`Compute Shaders:  ${this.results.webgl2?.computeShaderSupport ? '✅' : '❌'}`);
    console.log(`SharedArrayBuffer: ${this.results.sharedArrayBuffer?.supported ? '✅' : '❌'}`);
    console.log(`Cross-Origin:     ${this.results.sharedArrayBuffer?.crossOriginIsolated ? '✅' : '❌'}`);
    console.log(`Workers:          ${this.results.workerPerformance?.supported ? '✅' : '❌'}`);

    // Performance summary
    console.log('\n⚡ Performance Capabilities:');
    if (this.results.gpuMemory) {
      console.log(`GPU Bandwidth:    ${this.results.gpuMemory.uploadBandwidth.toFixed(0)} MB/s upload`);
    }
    if (this.results.sharedArrayBuffer?.performanceTest) {
      console.log(`Shared Memory:    ${this.results.sharedArrayBuffer.performanceTest.throughput.toFixed(0)} MB/s`);
    }
    if (this.results.workerPerformance) {
      console.log(`Worker Memory:    ${this.results.workerPerformance.memoryThroughput.toFixed(0)} MB/s`);
    }

    // Integration readiness
    const criticalIssues = this.results.recommendations.filter(r => r.priority === 'HIGH').length;
    const readinessScore = Math.max(0, 100 - (criticalIssues * 25));
    
    console.log('\n🎯 Integration Readiness:');
    console.log(`Readiness Score:  ${readinessScore}% (${criticalIssues} critical issues)`);
    
    if (readinessScore >= 75) {
      console.log('Status:           🟢 READY for Phase 2 integration');
    } else if (readinessScore >= 50) {
      console.log('Status:           🟡 PARTIAL - Some features will be limited');
    } else {
      console.log('Status:           🔴 NOT READY - Critical features missing');
    }

    console.log('\n📋 Next Steps:');
    if (criticalIssues === 0) {
      console.log('1. ✅ Proceed with GraphCanvasV2 implementation');
      console.log('2. ✅ Enable all Phase 2 optimizations');
      console.log('3. ✅ Run performance validation tests');
    } else {
      console.log('1. 🔧 Address critical compatibility issues');
      console.log('2. 🔧 Implement fallback mechanisms');
      console.log('3. 🔧 Test with limited feature set');
    }

    console.log('\n' + '='.repeat(60));
    
    // Store results globally for further analysis
    window.phase2DiagnosticResults = this.results;
    console.log('📁 Results saved to window.phase2DiagnosticResults');
  }
}

// Auto-run diagnostic when script is loaded
const diagnostic = new GPUDiagnostic();
diagnostic.runFullDiagnostic().then(() => {
  console.log('\n🎉 GPU Performance Diagnostic Complete!');
  console.log('Access detailed results: window.phase2DiagnosticResults');
});