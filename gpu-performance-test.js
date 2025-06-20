/**
 * GPU Performance Diagnostic Script
 * 
 * This script can be run in the browser console to test GPU rendering capabilities
 * and diagnose performance issues with the ReaGraph implementation.
 */

(function() {
  'use strict';
  
  console.log('🔬 ReaGraph GPU Performance Diagnostic Tool');
  console.log('==============================================');
  
  // 1. Check WebGL Support
  function checkWebGLSupport() {
    console.log('\n📊 WebGL Support Check:');
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      console.error('❌ WebGL2 not supported');
      const gl1 = canvas.getContext('webgl');
      if (gl1) {
        console.warn('⚠️  WebGL1 available, but WebGL2 required for GPU compute');
      }
      return false;
    }
    
    console.log('✅ WebGL2 supported');
    
    // Check specific capabilities
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    const maxFragmentUniformVectors = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
    
    console.log(`   Max Texture Size: ${maxTextureSize}px`);
    console.log(`   Max Vertex Attributes: ${maxVertexAttribs}`);
    console.log(`   Max Fragment Uniforms: ${maxFragmentUniformVectors}`);
    console.log(`   Max Varying Vectors: ${maxVaryingVectors}`);
    
    // Check for transform feedback (compute simulation)
    const transformFeedbackSupported = gl.getExtension('EXT_transform_feedback');
    console.log(`   Transform Feedback: ${transformFeedbackSupported ? '✅' : '❌'}`);
    
    return true;
  }
  
  // 2. Check SharedArrayBuffer Support
  function checkSharedArrayBufferSupport() {
    console.log('\n🔧 SharedArrayBuffer Support Check:');
    
    if (typeof SharedArrayBuffer === 'undefined') {
      console.error('❌ SharedArrayBuffer not available');
      console.log('   This may be due to missing COOP/COEP headers');
      return false;
    }
    
    if (typeof Atomics === 'undefined') {
      console.error('❌ Atomics not available');
      return false;
    }
    
    if (!self.crossOriginIsolated) {
      console.warn('⚠️  Cross-origin isolation not enabled');
      console.log('   SharedArrayBuffer available but may be limited');
      console.log('   Add COOP/COEP headers for full functionality');
    } else {
      console.log('✅ SharedArrayBuffer fully supported');
    }
    
    return true;
  }
  
  // 3. Check GPU Performance
  function checkGPUPerformance() {
    console.log('\n⚡ GPU Performance Test:');
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { 
      powerPreference: 'high-performance',
      antialias: false 
    });
    
    if (!gl) {
      console.error('❌ Cannot create WebGL2 context for performance test');
      return;
    }
    
    // Test large texture operations
    const size = 1024;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    const data = new Float32Array(size * size * 4);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random();
    }
    
    const startTime = performance.now();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, size, size, 0, gl.RGBA, gl.FLOAT, data);
    gl.finish(); // Wait for GPU
    const endTime = performance.now();
    
    const uploadTime = endTime - startTime;
    const dataSize = data.length * 4; // bytes
    const bandwidth = (dataSize / (uploadTime / 1000)) / (1024 * 1024); // MB/s
    
    console.log(`   Texture Upload (${size}x${size} RGBA32F): ${uploadTime.toFixed(2)}ms`);
    console.log(`   GPU Bandwidth: ${bandwidth.toFixed(2)} MB/s`);
    
    if (bandwidth > 1000) {
      console.log('✅ Excellent GPU performance');
    } else if (bandwidth > 100) {
      console.log('⚠️  Moderate GPU performance');
    } else {
      console.log('❌ Poor GPU performance');
    }
    
    gl.deleteTexture(texture);
  }
  
  // 4. Check Current Page Performance
  function checkCurrentPagePerformance() {
    console.log('\n📈 Current Page Performance:');
    
    // Check for Three.js
    if (typeof THREE !== 'undefined') {
      console.log('✅ Three.js detected:', THREE.REVISION);
    } else {
      console.log('❌ Three.js not found');
    }
    
    // Check for ReaGraph
    const canvases = document.querySelectorAll('canvas');
    console.log(`   Canvas elements found: ${canvases.length}`);
    
    canvases.forEach((canvas, i) => {
      const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (ctx) {
        console.log(`   Canvas ${i + 1}: WebGL context active`);
        
        // Check draw calls and performance
        const ext = ctx.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
          const vendor = ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL);
          const renderer = ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL);
          console.log(`     GPU: ${vendor} - ${renderer}`);
        }
        
        // Memory usage
        const memExt = ctx.getExtension('WEBGL_debug_shaders');
        if (memExt) {
          console.log('     Debug shaders extension available');
        }
      }
    });
    
    // Performance observer for frame timing
    if ('PerformanceObserver' in window) {
      let frameCount = 0;
      let totalFrameTime = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'measure-frame') {
            frameCount++;
            totalFrameTime += entry.duration;
            
            if (frameCount === 60) { // Average over 60 frames
              const avgFrameTime = totalFrameTime / frameCount;
              const fps = 1000 / avgFrameTime;
              
              console.log(`\n📊 Frame Performance (60 frame average):`);
              console.log(`   Average frame time: ${avgFrameTime.toFixed(2)}ms`);
              console.log(`   Average FPS: ${fps.toFixed(1)}`);
              
              if (fps >= 55) {
                console.log('✅ Excellent frame rate');
              } else if (fps >= 30) {
                console.log('⚠️  Moderate frame rate');
              } else {
                console.log('❌ Poor frame rate');
              }
              
              observer.disconnect();
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      // Start measuring frames
      let lastTime = performance.now();
      function measureFrame() {
        const currentTime = performance.now();
        performance.measure('measure-frame', { start: lastTime, end: currentTime });
        lastTime = currentTime;
        
        if (frameCount < 60) {
          requestAnimationFrame(measureFrame);
        }
      }
      
      requestAnimationFrame(measureFrame);
    }
  }
  
  // 5. Test Worker Performance
  function testWorkerPerformance() {
    console.log('\n👷 Worker Performance Test:');
    
    if (typeof Worker === 'undefined') {
      console.error('❌ Web Workers not supported');
      return;
    }
    
    console.log('✅ Web Workers supported');
    
    // Test basic worker performance
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        if (type === 'performance-test') {
          const start = performance.now();
          
          // Simulate force calculation
          const nodes = data.nodes;
          const result = [];
          
          for (let i = 0; i < nodes.length; i++) {
            let fx = 0, fy = 0;
            
            for (let j = 0; j < nodes.length; j++) {
              if (i === j) continue;
              
              const dx = nodes[j].x - nodes[i].x;
              const dy = nodes[j].y - nodes[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy) + 0.01;
              
              const force = 1000 / (distance * distance);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
            
            result.push({ x: nodes[i].x + fx * 0.01, y: nodes[i].y + fy * 0.01 });
          }
          
          const end = performance.now();
          
          self.postMessage({
            type: 'performance-result',
            computeTime: end - start,
            nodeCount: nodes.length
          });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    // Generate test data
    const testNodes = [];
    for (let i = 0; i < 1000; i++) {
      testNodes.push({
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100
      });
    }
    
    worker.onmessage = function(e) {
      const { type, computeTime, nodeCount } = e.data;
      
      if (type === 'performance-result') {
        console.log(`   Worker compute time (${nodeCount} nodes): ${computeTime.toFixed(2)}ms`);
        
        const nodesPerMs = nodeCount / computeTime;
        console.log(`   Performance: ${nodesPerMs.toFixed(0)} nodes/ms`);
        
        if (nodesPerMs > 100) {
          console.log('✅ Excellent worker performance');
        } else if (nodesPerMs > 50) {
          console.log('⚠️  Moderate worker performance');
        } else {
          console.log('❌ Poor worker performance');
        }
        
        worker.terminate();
      }
    };
    
    worker.postMessage({
      type: 'performance-test',
      data: { nodes: testNodes }
    });
  }
  
  // 6. Overall Assessment
  function overallAssessment() {
    console.log('\n🎯 Performance Recommendations:');
    
    const hasWebGL2 = checkWebGLSupport();
    const hasSharedArrayBuffer = checkSharedArrayBufferSupport();
    
    if (hasWebGL2 && hasSharedArrayBuffer) {
      console.log('✅ EXCELLENT: Full GPU acceleration and advanced worker features available');
      console.log('   → Use HIGH_PERFORMANCE profile');
      console.log('   → Enable all Phase 2 optimizations');
    } else if (hasWebGL2) {
      console.log('⚠️  GOOD: GPU acceleration available, limited worker features');
      console.log('   → Use BALANCED profile');
      console.log('   → Enable GPU compute but fallback worker communication');
    } else {
      console.log('❌ LIMITED: CPU-only performance');
      console.log('   → Use POWER_SAVING profile');
      console.log('   → Focus on memory optimization and culling');
    }
    
    console.log('\n🔧 Debug Commands:');
    console.log('   window.debugReaGraphGPU() - Run this diagnostic again');
    console.log('   window.enableGPUDebugging() - Enable detailed GPU logging');
  }
  
  // Export debugging functions to global scope
  window.debugReaGraphGPU = function() {
    checkWebGLSupport();
    checkSharedArrayBufferSupport();
    checkGPUPerformance();
    checkCurrentPagePerformance();
    testWorkerPerformance();
    overallAssessment();
  };
  
  window.enableGPUDebugging = function() {
    // Enable detailed GPU debugging
    if (typeof THREE !== 'undefined') {
      console.log('Enabling Three.js GPU debugging...');
      
      // Hook into Three.js renderer
      const originalRender = THREE.WebGLRenderer.prototype.render;
      THREE.WebGLRenderer.prototype.render = function(...args) {
        const info = this.info;
        const before = {
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines
        };
        
        const result = originalRender.apply(this, args);
        
        const after = {
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines
        };
        
        console.log('🎨 Render Stats:', {
          drawCalls: after.calls - before.calls,
          triangles: after.triangles - before.triangles,
          points: after.points - before.points,
          lines: after.lines - before.lines
        });
        
        return result;
      };
    }
  };
  
  // Run the full diagnostic
  console.log('Starting comprehensive GPU performance diagnostic...\n');
  
  checkWebGLSupport();
  checkSharedArrayBufferSupport();
  checkGPUPerformance();
  checkCurrentPagePerformance();
  testWorkerPerformance();
  overallAssessment();
  
  console.log('\n🎉 Diagnostic complete! Check the output above for performance assessment.');
  
})();