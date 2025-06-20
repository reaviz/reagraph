// Baseline Performance Analysis Script
// Analyzes current GraphCanvas rendering performance before Phase 2 integration

console.log('📊 Starting Baseline Performance Analysis...\n');

class BaselinePerformanceAnalyzer {
  constructor() {
    this.metrics = {
      rendering: {},
      memory: {},
      interaction: {},
      scaling: {}
    };
    this.samples = [];
  }

  async runBaselineAnalysis() {
    console.log('='.repeat(60));
    console.log('BASELINE PERFORMANCE ANALYSIS');
    console.log('='.repeat(60));

    await this.analyzeRenderingPerformance();
    await this.analyzeMemoryUsage();
    await this.analyzeInteractionPerformance();
    await this.analyzeScalingLimits();
    this.generateBaselineReport();

    return this.metrics;
  }

  async analyzeRenderingPerformance() {
    console.log('\n🎯 Analyzing Rendering Performance...');
    
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.log('❌ No canvas found - cannot analyze rendering');
      return;
    }

    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    if (!gl) {
      console.log('❌ No WebGL context found');
      return;
    }

    // Monitor frame timing
    const frameTimings = [];
    let lastFrame = performance.now();
    let drawCallCount = 0;

    // Hook into requestAnimationFrame to measure frame timing
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      return originalRAF(() => {
        const now = performance.now();
        const frameTime = now - lastFrame;
        frameTimings.push(frameTime);
        lastFrame = now;
        
        // Keep only last 100 frames
        if (frameTimings.length > 100) {
          frameTimings.shift();
        }
        
        callback();
      });
    };

    // Try to estimate draw calls by monitoring WebGL calls
    const originalDrawArrays = gl.drawArrays;
    const originalDrawElements = gl.drawElements;
    
    gl.drawArrays = function(...args) {
      drawCallCount++;
      return originalDrawArrays.apply(this, args);
    };
    
    gl.drawElements = function(...args) {
      drawCallCount++;
      return originalDrawElements.apply(this, args);
    };

    // Wait for some frames to be rendered
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate frame statistics
    const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
    const fps = 1000 / avgFrameTime;
    const minFrameTime = Math.min(...frameTimings);
    const maxFrameTime = Math.max(...frameTimings);

    this.metrics.rendering = {
      averageFrameTime: avgFrameTime,
      fps: fps,
      minFrameTime,
      maxFrameTime,
      frameConsistency: (maxFrameTime - minFrameTime) / avgFrameTime,
      estimatedDrawCalls: drawCallCount,
      canvasSize: { width: canvas.width, height: canvas.height }
    };

    console.log(`✅ Average FPS: ${fps.toFixed(1)}`);
    console.log(`   Frame Time: ${avgFrameTime.toFixed(2)}ms (min: ${minFrameTime.toFixed(2)}ms, max: ${maxFrameTime.toFixed(2)}ms)`);
    console.log(`   Frame Consistency: ${(this.metrics.rendering.frameConsistency * 100).toFixed(1)}% variation`);
    console.log(`   Estimated Draw Calls: ${drawCallCount} (over 2 seconds)`);

    // Restore original functions
    window.requestAnimationFrame = originalRAF;
    gl.drawArrays = originalDrawArrays;
    gl.drawElements = originalDrawElements;
  }

  async analyzeMemoryUsage() {
    console.log('\n💾 Analyzing Memory Usage...');
    
    const initialMemory = window.performance?.memory ? {
      used: window.performance.memory.usedJSHeapSize,
      total: window.performance.memory.totalJSHeapSize,
      limit: window.performance.memory.jsHeapSizeLimit
    } : null;

    if (!initialMemory) {
      console.log('⚠️  Memory API not available');
      this.metrics.memory = { available: false };
      return;
    }

    // Monitor memory over time
    const memorySnapshots = [];
    const startTime = performance.now();
    
    const measureMemory = () => {
      const memory = window.performance.memory;
      memorySnapshots.push({
        timestamp: performance.now() - startTime,
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      });
    };

    // Take memory snapshots every 500ms for 5 seconds
    const interval = setInterval(measureMemory, 500);
    await new Promise(resolve => setTimeout(resolve, 5000));
    clearInterval(interval);

    // Analyze memory growth
    const memoryGrowth = memorySnapshots[memorySnapshots.length - 1].used - memorySnapshots[0].used;
    const peakMemory = Math.max(...memorySnapshots.map(s => s.used));
    
    this.metrics.memory = {
      available: true,
      initialUsed: initialMemory.used / 1024 / 1024, // MB
      peakUsed: peakMemory / 1024 / 1024, // MB
      memoryGrowth: memoryGrowth / 1024 / 1024, // MB
      memoryEfficiency: (initialMemory.used / initialMemory.limit) * 100,
      snapshots: memorySnapshots.length
    };

    console.log(`✅ Initial Memory: ${this.metrics.memory.initialUsed.toFixed(2)}MB`);
    console.log(`   Peak Memory: ${this.metrics.memory.peakUsed.toFixed(2)}MB`);
    console.log(`   Memory Growth: ${this.metrics.memory.memoryGrowth.toFixed(2)}MB over 5 seconds`);
    console.log(`   Memory Efficiency: ${this.metrics.memory.memoryEfficiency.toFixed(1)}% of heap limit`);
  }

  async analyzeInteractionPerformance() {
    console.log('\n🖱️  Analyzing Interaction Performance...');
    
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      console.log('❌ No canvas found for interaction testing');
      return;
    }

    let interactionTimes = [];
    let lastInteraction = 0;

    // Monitor mouse events
    const trackInteraction = (event) => {
      const now = performance.now();
      if (lastInteraction > 0) {
        const responseTime = now - lastInteraction;
        interactionTimes.push(responseTime);
      }
      lastInteraction = now;
    };

    canvas.addEventListener('mousemove', trackInteraction);
    canvas.addEventListener('click', trackInteraction);

    console.log('   Move mouse over canvas for 3 seconds to test interaction responsiveness...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    canvas.removeEventListener('mousemove', trackInteraction);
    canvas.removeEventListener('click', trackInteraction);

    if (interactionTimes.length === 0) {
      console.log('⚠️  No interactions detected');
      this.metrics.interaction = { available: false };
      return;
    }

    const avgResponseTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
    const maxResponseTime = Math.max(...interactionTimes);
    const responsiveInteractions = interactionTimes.filter(t => t < 16.67).length; // 60fps threshold

    this.metrics.interaction = {
      available: true,
      averageResponseTime: avgResponseTime,
      maxResponseTime,
      responsivePercent: (responsiveInteractions / interactionTimes.length) * 100,
      totalInteractions: interactionTimes.length
    };

    console.log(`✅ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
    console.log(`   Responsive Interactions: ${this.metrics.interaction.responsivePercent.toFixed(1)}% (< 16.67ms)`);
  }

  async analyzeScalingLimits() {
    console.log('\n📈 Analyzing Current Scaling Limits...');
    
    // Try to determine current node count and performance characteristics
    const currentGraphData = this.estimateCurrentGraphSize();
    
    if (currentGraphData.nodes === 0) {
      console.log('⚠️  No graph data detected');
      this.metrics.scaling = { available: false };
      return;
    }

    // Estimate performance scaling based on current metrics
    const currentFPS = this.metrics.rendering?.fps || 0;
    const currentMemory = this.metrics.memory?.peakUsed || 0;

    // Rough scaling estimates (these would be more accurate with actual testing)
    const estimatedScaling = {
      currentNodes: currentGraphData.nodes,
      currentEdges: currentGraphData.edges,
      currentFPS: currentFPS,
      currentMemoryMB: currentMemory,
      
      // Estimate maximum nodes at 30fps (minimum acceptable)
      estimatedMaxNodes30fps: currentGraphData.nodes * (currentFPS / 30),
      
      // Estimate maximum nodes at 60fps (target)
      estimatedMaxNodes60fps: currentGraphData.nodes * (currentFPS / 60),
      
      // Memory scaling estimate
      memoryPerNode: currentMemory / currentGraphData.nodes,
      estimatedMaxNodesMemory: (1000 - currentMemory) / (currentMemory / currentGraphData.nodes) // Assume 1GB limit
    };

    this.metrics.scaling = {
      available: true,
      ...estimatedScaling
    };

    console.log(`✅ Current Graph: ${currentGraphData.nodes} nodes, ${currentGraphData.edges} edges`);
    console.log(`   Est. Max Nodes (30fps): ${Math.floor(estimatedScaling.estimatedMaxNodes30fps)}`);
    console.log(`   Est. Max Nodes (60fps): ${Math.floor(estimatedScaling.estimatedMaxNodes60fps)}`);
    console.log(`   Memory per Node: ${estimatedScaling.memoryPerNode.toFixed(3)}MB`);
  }

  estimateCurrentGraphSize() {
    // Try to find graph data in the React app
    let nodes = 0;
    let edges = 0;

    // Look for common graph data patterns
    try {
      // Check if there's a React component with graph data
      const reactFiber = document.querySelector('[data-reactroot]') || document.querySelector('#root');
      if (reactFiber && reactFiber._reactInternalFiber) {
        // This is a simplified approach - in reality, we'd need to traverse the React tree
        console.log('   Detected React app, but cannot easily access graph data');
      }

      // Try to find DOM elements that might indicate graph size
      const canvasElements = document.querySelectorAll('canvas');
      const svgElements = document.querySelectorAll('svg circle, svg rect');
      
      if (svgElements.length > 0) {
        nodes = svgElements.length;
        console.log(`   Estimated ${nodes} nodes from SVG elements`);
      }

      // Try to access global variables that might contain graph data
      if (window.graphData) {
        nodes = window.graphData.nodes?.length || 0;
        edges = window.graphData.edges?.length || 0;
      }

    } catch (error) {
      console.log('   Could not access graph data directly');
    }

    return { nodes, edges };
  }

  generateBaselineReport() {
    console.log('\n' + '='.repeat(60));
    console.log('BASELINE PERFORMANCE REPORT');
    console.log('='.repeat(60));

    console.log('\n📊 Current Performance Characteristics:');
    
    if (this.metrics.rendering.fps) {
      console.log(`Rendering FPS:    ${this.metrics.rendering.fps.toFixed(1)} fps`);
      console.log(`Frame Consistency: ${(this.metrics.rendering.frameConsistency * 100).toFixed(1)}% variation`);
    }

    if (this.metrics.memory.available) {
      console.log(`Memory Usage:     ${this.metrics.memory.peakUsed.toFixed(2)}MB peak`);
      console.log(`Memory Growth:    ${this.metrics.memory.memoryGrowth.toFixed(2)}MB/5sec`);
    }

    if (this.metrics.interaction.available) {
      console.log(`Interaction:      ${this.metrics.interaction.averageResponseTime.toFixed(2)}ms avg response`);
      console.log(`Responsiveness:   ${this.metrics.interaction.responsivePercent.toFixed(1)}% < 16.67ms`);
    }

    console.log('\n🎯 Phase 2 Improvement Targets:');
    console.log('Node Capacity:    50x increase (current → 50,000+ nodes)');
    console.log('Draw Calls:       95% reduction through instancing');
    console.log('Memory Usage:     75% reduction through TypedArrays');
    console.log('GPU Computation:  10x faster force calculations');
    console.log('UI Responsiveness: Zero blocking during layout');

    console.log('\n📈 Expected Post-Phase 2 Performance:');
    
    if (this.metrics.rendering.fps) {
      const expectedFPS = Math.min(60, this.metrics.rendering.fps * 2); // Conservative estimate
      console.log(`Target FPS:       ${expectedFPS} fps (sustained)`);
    }
    
    if (this.metrics.memory.available) {
      const expectedMemory = this.metrics.memory.peakUsed * 0.25; // 75% reduction
      console.log(`Target Memory:    ${expectedMemory.toFixed(2)}MB (75% reduction)`);
    }

    if (this.metrics.scaling.available) {
      console.log(`Target Nodes:     50,000+ (current: ${this.metrics.scaling.currentNodes})`);
    }

    console.log('\n🔍 Key Bottlenecks Identified:');
    
    const bottlenecks = [];
    
    if (this.metrics.rendering.fps < 60) {
      bottlenecks.push('Low FPS - GPU instancing will help');
    }
    
    if (this.metrics.rendering.frameConsistency > 0.3) {
      bottlenecks.push('Inconsistent frame timing - worker threads will help');
    }
    
    if (this.metrics.memory.memoryGrowth > 10) {
      bottlenecks.push('High memory growth - TypedArrays will help');
    }
    
    if (this.metrics.interaction.responsivePercent < 80) {
      bottlenecks.push('Poor interaction responsiveness - compute shaders will help');
    }

    bottlenecks.forEach((bottleneck, i) => {
      console.log(`${i + 1}. ${bottleneck}`);
    });

    console.log('\n' + '='.repeat(60));
    
    // Store results globally
    window.baselinePerformanceResults = this.metrics;
    console.log('📁 Results saved to window.baselinePerformanceResults');
  }
}

// Auto-run baseline analysis when script is loaded
const analyzer = new BaselinePerformanceAnalyzer();
analyzer.runBaselineAnalysis().then(() => {
  console.log('\n🎉 Baseline Performance Analysis Complete!');
  console.log('Access detailed results: window.baselinePerformanceResults');
});