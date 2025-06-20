// Diagnostic Runner for Phase 2A.1 Testing
// Integrates GPU diagnostic and baseline performance analysis

export interface DiagnosticResults {
  gpuCapabilities: any;
  baselinePerformance: any;
  timestamp: number;
  environment: {
    userAgent: string;
    platform: string;
    webgl2Supported: boolean;
    sharedArrayBufferSupported: boolean;
  };
}

export class DiagnosticRunner {
  private results: DiagnosticResults | null = null;

  async runFullDiagnostic(): Promise<DiagnosticResults> {
    console.log('🚀 Starting Phase 2A.1 Diagnostic Suite...\n');

    // Collect environment info
    const environment = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      webgl2Supported: this.checkWebGL2Support(),
      sharedArrayBufferSupported: typeof SharedArrayBuffer !== 'undefined'
    };

    console.log('Environment Info:');
    console.log(`Browser: ${environment.userAgent}`);
    console.log(`Platform: ${environment.platform}`);
    console.log(`WebGL2: ${environment.webgl2Supported ? '✅' : '❌'}`);
    console.log(`SharedArrayBuffer: ${environment.sharedArrayBufferSupported ? '✅' : '❌'}\n`);

    try {
      // Load and run GPU diagnostic
      console.log('📊 Running GPU Capability Diagnostic...');
      const gpuResults = await this.runGPUDiagnostic();
      
      // Wait a moment for GPU test to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load and run baseline performance analysis
      console.log('📈 Running Baseline Performance Analysis...');
      const baselineResults = await this.runBaselineAnalysis();

      this.results = {
        gpuCapabilities: gpuResults,
        baselinePerformance: baselineResults,
        timestamp: Date.now(),
        environment
      };

      // Add summary after results are set
      (this.results as any).summary = {
        readiness: this.calculateReadinessScore(),
        recommendations: this.generateIntegrationPlan()
      };

      this.printIntegratedReport();
      return this.results;

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      throw error;
    }
  }

  private checkWebGL2Support(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch {
      return false;
    }
  }

  private async runGPUDiagnostic(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Load the GPU diagnostic script
      const script = document.createElement('script');
      script.src = '/gpu-performance-test.js';
      script.onload = () => {
        // Wait for the diagnostic to complete
        const checkForResults = () => {
          if ((window as any).phase2DiagnosticResults) {
            resolve((window as any).phase2DiagnosticResults);
          } else {
            setTimeout(checkForResults, 100);
          }
        };
        checkForResults();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private async runBaselineAnalysis(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Load the baseline performance script
      const script = document.createElement('script');
      script.src = '/baseline-performance-test.js';
      script.onload = () => {
        // Wait for the analysis to complete
        const checkForResults = () => {
          if ((window as any).baselinePerformanceResults) {
            resolve((window as any).baselinePerformanceResults);
          } else {
            setTimeout(checkForResults, 100);
          }
        };
        checkForResults();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private printIntegratedReport(): void {
    if (!this.results) return;

    console.log('\n' + '='.repeat(70));
    console.log('PHASE 2A.1 INTEGRATED DIAGNOSTIC REPORT');
    console.log('='.repeat(70));

    // GPU Capabilities Summary
    console.log('\n🔧 GPU CAPABILITIES:');
    const gpu = this.results.gpuCapabilities;
    if (gpu) {
      console.log(`WebGL2:           ${gpu.webgl2?.supported ? '✅' : '❌'}`);
      console.log(`Compute Shaders:  ${gpu.webgl2?.computeShaderSupport ? '✅' : '❌'}`);
      console.log(`SharedArrayBuffer: ${gpu.sharedArrayBuffer?.supported ? '✅' : '❌'}`);
      console.log(`Cross-Origin:     ${gpu.sharedArrayBuffer?.crossOriginIsolated ? '✅' : '❌'}`);
      
      if (gpu.gpuMemory) {
        console.log(`GPU Bandwidth:    ${gpu.gpuMemory.uploadBandwidth.toFixed(0)} MB/s`);
      }
    }

    // Baseline Performance Summary
    console.log('\n📊 BASELINE PERFORMANCE:');
    const baseline = this.results.baselinePerformance;
    if (baseline) {
      if (baseline.rendering?.fps) {
        console.log(`Current FPS:      ${baseline.rendering.fps.toFixed(1)}`);
      }
      if (baseline.memory?.peakUsed) {
        console.log(`Peak Memory:      ${baseline.memory.peakUsed.toFixed(2)}MB`);
      }
      if (baseline.interaction?.averageResponseTime) {
        console.log(`Response Time:    ${baseline.interaction.averageResponseTime.toFixed(2)}ms`);
      }
    }

    // Phase 2 Readiness Assessment
    console.log('\n🎯 PHASE 2 READINESS:');
    const readiness = this.calculateReadinessScore();
    console.log(`Overall Score:    ${readiness.score}%`);
    console.log(`Status:           ${readiness.status}`);
    console.log(`Critical Issues:  ${readiness.criticalIssues}`);

    // Integration Recommendations
    console.log('\n💡 INTEGRATION RECOMMENDATIONS:');
    const recommendations = this.generateIntegrationPlan();
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority}] ${rec.action}`);
    });

    console.log('\n🚀 NEXT STEPS:');
    if (readiness.score >= 75) {
      console.log('1. ✅ Proceed with GraphCanvasV2 implementation');
      console.log('2. ✅ Enable full Phase 2 optimization suite');
      console.log('3. ✅ Run performance validation tests');
    } else {
      console.log('1. 🔧 Address critical compatibility issues first');
      console.log('2. 🔧 Implement fallback mechanisms');
      console.log('3. 🔧 Test with reduced feature set');
    }

    console.log('\n' + '='.repeat(70));
  }

  private calculateReadinessScore(): { score: number; status: string; criticalIssues: number } {
    if (!this.results) return { score: 0, status: '❌ NO DATA', criticalIssues: 5 };

    let score = 100;
    let criticalIssues = 0;

    const gpu = this.results.gpuCapabilities;
    
    // WebGL2 is critical for InstancedRenderer
    if (!gpu?.webgl2?.supported) {
      score -= 30;
      criticalIssues++;
    }

    // SharedArrayBuffer is critical for SharedWorkerPool
    if (!gpu?.sharedArrayBuffer?.supported) {
      score -= 25;
      criticalIssues++;
    }

    // Cross-origin isolation for full SharedArrayBuffer features
    if (!gpu?.sharedArrayBuffer?.crossOriginIsolated) {
      score -= 15;
    }

    // Performance indicators
    const baseline = this.results.baselinePerformance;
    if (baseline?.rendering?.fps && baseline.rendering.fps < 30) {
      score -= 10; // Low FPS indicates need for optimization
    }

    if (baseline?.memory?.memoryGrowth && baseline.memory.memoryGrowth > 50) {
      score -= 10; // High memory growth indicates inefficiency
    }

    let status = '🔴 NOT READY';
    if (score >= 75) status = '🟢 READY';
    else if (score >= 50) status = '🟡 PARTIAL';

    return { score: Math.max(0, score), status, criticalIssues };
  }

  private generateIntegrationPlan(): Array<{ priority: string; action: string }> {
    if (!this.results) return [];

    const recommendations = [];
    const gpu = this.results.gpuCapabilities;
    const baseline = this.results.baselinePerformance;

    // Critical issues first
    if (!gpu?.webgl2?.supported) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Implement WebGL1 fallback for InstancedRenderer'
      });
    }

    if (!gpu?.sharedArrayBuffer?.supported) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'Use MessageChannel for SharedWorkerPool communication'
      });
    }

    // High priority optimizations
    if (!gpu?.sharedArrayBuffer?.crossOriginIsolated) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Add COOP/COEP headers for full SharedArrayBuffer support'
      });
    }

    if (baseline?.rendering?.fps && baseline.rendering.fps < 45) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Prioritize InstancedRenderer integration for FPS improvement'
      });
    }

    // Medium priority improvements
    if (baseline?.memory?.memoryGrowth && baseline.memory.memoryGrowth > 20) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Implement AdvancedMemoryManager for memory optimization'
      });
    }

    if (!gpu?.webgl2?.computeShaderSupport) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Use vertex/fragment shaders for WebGLComputePipeline'
      });
    }

    return recommendations;
  }

  getResults(): DiagnosticResults | null {
    return this.results;
  }

  exportResults(): string {
    if (!this.results) return '';
    
    return JSON.stringify({
      ...this.results,
      summary: {
        readiness: this.calculateReadinessScore(),
        recommendations: this.generateIntegrationPlan()
      }
    }, null, 2);
  }
}