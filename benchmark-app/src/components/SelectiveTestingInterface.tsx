import React, { useState, useEffect, useMemo } from 'react';
import { BenchmarkTest } from '../types/benchmark.types';

export interface TestConfiguration {
  datasetId: string;
  layoutType: 'forceDirected' | 'hierarchical' | 'circular' | 'custom';
  renderingMode?: 'standard' | 'instanced' | 'gpu';
  size: 'small' | 'medium' | 'large' | 'xlarge';
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
}

export interface TestPreset {
  id: string;
  name: string;
  description: string;
  configurations: TestConfiguration[];
  estimatedTotalTime: number;
}

interface SelectiveTestingInterfaceProps {
  availableTests: BenchmarkTest[];
  onSelectionChange: (selectedConfigs: TestConfiguration[]) => void;
  onStartTests: (configs: TestConfiguration[]) => void;
  isRunning?: boolean;
}

export const SelectiveTestingInterface: React.FC<SelectiveTestingInterfaceProps> = ({
  availableTests,
  onSelectionChange,
  onStartTests,
  isRunning = false
}) => {
  const [selectedMode, setSelectedMode] = useState<'matrix' | 'presets' | 'custom'>('matrix');
  const [selectedConfigs, setSelectedConfigs] = useState<TestConfiguration[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Categorize tests by size
  const testsBySize = useMemo(() => {
    const categorized = {
      small: availableTests.filter(t => t.nodeCount <= 500),
      medium: availableTests.filter(t => t.nodeCount > 500 && t.nodeCount <= 2000),
      large: availableTests.filter(t => t.nodeCount > 2000 && t.nodeCount <= 10000),
      xlarge: availableTests.filter(t => t.nodeCount > 10000)
    };
    return categorized;
  }, [availableTests]);

  // Define test presets
  const presets: TestPreset[] = useMemo(() => [
    {
      id: 'quick-validation',
      name: 'Quick Validation',
      description: 'Fast validation tests for development (2-3 minutes)',
      configurations: [
        { datasetId: 'storybook-small', layoutType: 'forceDirected', size: 'small', estimatedTime: 45, priority: 'high' },
        { datasetId: 'random-medium', layoutType: 'forceDirected', size: 'medium', estimatedTime: 90, priority: 'medium' }
      ],
      estimatedTotalTime: 135
    },
    {
      id: 'performance-critical',
      name: 'Performance Critical',
      description: 'Tests for performance-critical scenarios (5-8 minutes)',
      configurations: [
        { datasetId: 'storybook-large', layoutType: 'forceDirected', size: 'large', estimatedTime: 180, priority: 'high' },
        { datasetId: 'hierarchical-medium', layoutType: 'hierarchical', size: 'medium', estimatedTime: 120, priority: 'high' },
        { datasetId: 'circular-large', layoutType: 'circular', size: 'large', estimatedTime: 150, priority: 'medium' }
      ],
      estimatedTotalTime: 450
    },
    {
      id: 'layout-comparison',
      name: 'Layout Comparison',
      description: 'Compare performance across all layout types (8-12 minutes)',
      configurations: [
        { datasetId: 'medium-dataset', layoutType: 'forceDirected', size: 'medium', estimatedTime: 120, priority: 'high' },
        { datasetId: 'medium-dataset', layoutType: 'hierarchical', size: 'medium', estimatedTime: 100, priority: 'high' },
        { datasetId: 'medium-dataset', layoutType: 'circular', size: 'medium', estimatedTime: 110, priority: 'high' },
        { datasetId: 'large-dataset', layoutType: 'forceDirected', size: 'large', estimatedTime: 200, priority: 'medium' }
      ],
      estimatedTotalTime: 530
    },
    {
      id: 'stress-testing',
      name: 'Stress Testing',
      description: 'Maximum performance validation (12-15 minutes)',
      configurations: [
        { datasetId: 'xlarge-dataset', layoutType: 'forceDirected', size: 'xlarge', estimatedTime: 300, priority: 'high' },
        { datasetId: 'xlarge-dataset', layoutType: 'hierarchical', size: 'xlarge', estimatedTime: 250, priority: 'high' },
        { datasetId: 'large-dataset', layoutType: 'custom', size: 'large', estimatedTime: 180, priority: 'medium' }
      ],
      estimatedTotalTime: 730
    }
  ], []);

  // Matrix selection state
  const [matrixSelection, setMatrixSelection] = useState<Record<string, boolean>>({});

  // Generate matrix configurations
  const matrixConfigurations = useMemo(() => {
    const layouts: TestConfiguration['layoutType'][] = ['forceDirected', 'hierarchical', 'circular', 'custom'];
    const sizes: TestConfiguration['size'][] = ['small', 'medium', 'large', 'xlarge'];
    
    const configs: TestConfiguration[] = [];
    
    sizes.forEach(size => {
      layouts.forEach(layout => {
        const testsForSize = testsBySize[size];
        if (testsForSize.length > 0) {
          const key = `${size}-${layout}`;
          if (matrixSelection[key]) {
            configs.push({
              datasetId: testsForSize[0].id,
              layoutType: layout,
              size,
              estimatedTime: calculateEstimatedTime(size, layout),
              priority: size === 'small' ? 'low' : size === 'xlarge' ? 'high' : 'medium'
            });
          }
        }
      });
    });
    
    return configs;
  }, [matrixSelection, testsBySize]);

  function calculateEstimatedTime(size: TestConfiguration['size'], layout: TestConfiguration['layoutType']): number {
    const baseTime = {
      small: 30,
      medium: 90,
      large: 180,
      xlarge: 300
    }[size];

    const layoutMultiplier = {
      forceDirected: 1.2,
      hierarchical: 1.0,
      circular: 1.1,
      custom: 1.3
    }[layout];

    return Math.round(baseTime * layoutMultiplier);
  }

  // Update selected configs based on mode
  useEffect(() => {
    let configs: TestConfiguration[] = [];
    
    if (selectedMode === 'matrix') {
      configs = matrixConfigurations;
    } else if (selectedMode === 'presets' && selectedPreset) {
      const preset = presets.find(p => p.id === selectedPreset);
      configs = preset?.configurations || [];
    }
    
    setSelectedConfigs(configs);
    onSelectionChange(configs);
  }, [selectedMode, matrixConfigurations, selectedPreset, presets, onSelectionChange]);

  const handleMatrixToggle = (size: TestConfiguration['size'], layout: TestConfiguration['layoutType']) => {
    const key = `${size}-${layout}`;
    setMatrixSelection(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
  };

  const totalEstimatedTime = selectedConfigs.reduce((sum, config) => sum + config.estimatedTime, 0);

  const renderMatrixSelector = () => {
    const layouts: TestConfiguration['layoutType'][] = ['forceDirected', 'hierarchical', 'circular', 'custom'];
    const sizes: TestConfiguration['size'][] = ['small', 'medium', 'large', 'xlarge'];

    return (
      <div style={styles.matrixContainer}>
        <div style={styles.matrixHeader}>
          <div style={styles.matrixCorner}>Dataset Size ↓ / Layout →</div>
          {layouts.map(layout => (
            <div key={layout} style={styles.matrixColumnHeader}>
              {layout.charAt(0).toUpperCase() + layout.slice(1)}
            </div>
          ))}
        </div>
        
        {sizes.map(size => (
          <div key={size} style={styles.matrixRow}>
            <div style={styles.matrixRowHeader}>
              <div style={styles.sizeLabel}>
                {size.toUpperCase()} ({testsBySize[size].length > 0 ? 
                  `${testsBySize[size][0].nodeCount.toLocaleString()} nodes` : 
                  'No tests'})
              </div>
            </div>
            
            {layouts.map(layout => {
              const key = `${size}-${layout}`;
              const isAvailable = testsBySize[size].length > 0;
              const isSelected = matrixSelection[key];
              const estimatedTime = isAvailable ? calculateEstimatedTime(size, layout) : 0;
              
              return (
                <div key={layout} style={styles.matrixCell}>
                  <label style={{
                    ...styles.matrixCheckbox,
                    opacity: isAvailable ? 1 : 0.3,
                    cursor: isAvailable ? 'pointer' : 'not-allowed'
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isAvailable}
                      onChange={() => handleMatrixToggle(size, layout)}
                      style={styles.checkbox}
                    />
                    <div style={styles.matrixCellContent}>
                      <div style={styles.estimatedTime}>
                        {isAvailable ? `~${Math.round(estimatedTime / 60)}min` : 'N/A'}
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderPresetSelector = () => (
    <div style={styles.presetContainer}>
      {presets.map(preset => (
        <div
          key={preset.id}
          style={{
            ...styles.presetCard,
            ...(selectedPreset === preset.id ? styles.presetCardSelected : {})
          }}
          onClick={() => handlePresetSelect(preset.id)}
        >
          <div style={styles.presetHeader}>
            <h3 style={styles.presetName}>{preset.name}</h3>
            <div style={styles.presetTime}>
              ~{Math.round(preset.estimatedTotalTime / 60)} minutes
            </div>
          </div>
          
          <p style={styles.presetDescription}>{preset.description}</p>
          
          <div style={styles.presetConfigs}>
            <div style={styles.presetConfigCount}>
              {preset.configurations.length} test configurations
            </div>
            <div style={styles.presetConfigBreakdown}>
              {preset.configurations.map((config, index) => (
                <span key={index} style={styles.presetConfigItem}>
                  {config.size}-{config.layoutType}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Selective Performance Testing</h2>
        <div style={styles.modeSelector}>
          <button
            style={{
              ...styles.modeButton,
              ...(selectedMode === 'matrix' ? styles.modeButtonActive : {})
            }}
            onClick={() => setSelectedMode('matrix')}
          >
            Matrix Selection
          </button>
          <button
            style={{
              ...styles.modeButton,
              ...(selectedMode === 'presets' ? styles.modeButtonActive : {})
            }}
            onClick={() => setSelectedMode('presets')}
          >
            Quick Presets
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {selectedMode === 'matrix' && renderMatrixSelector()}
        {selectedMode === 'presets' && renderPresetSelector()}
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryStats}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Selected Tests:</span>
            <span style={styles.summaryValue}>{selectedConfigs.length}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Estimated Time:</span>
            <span style={styles.summaryValue}>
              {Math.round(totalEstimatedTime / 60)} minutes
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Memory Usage:</span>
            <span style={styles.summaryValue}>~2GB peak</span>
          </div>
        </div>

        <button
          style={{
            ...styles.startButton,
            ...(isRunning || selectedConfigs.length === 0 ? styles.startButtonDisabled : {})
          }}
          disabled={isRunning || selectedConfigs.length === 0}
          onClick={() => onStartTests(selectedConfigs)}
        >
          {isRunning ? 'Tests Running...' : `Start ${selectedConfigs.length} Tests`}
        </button>
      </div>

      {selectedConfigs.length > 0 && (
        <div style={styles.configList}>
          <h3 style={styles.configListTitle}>Selected Test Configurations:</h3>
          <div style={styles.configItems}>
            {selectedConfigs.map((config, index) => (
              <div key={index} style={styles.configItem}>
                <div style={styles.configItemMain}>
                  <span style={styles.configSize}>{config.size.toUpperCase()}</span>
                  <span style={styles.configLayout}>{config.layoutType}</span>
                  <span style={styles.configTime}>~{Math.round(config.estimatedTime / 60)}min</span>
                </div>
                <div style={styles.configPriority}>
                  Priority: {config.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  title: {
    margin: 0,
    color: '#00d4ff',
    fontSize: '1.4rem',
    fontWeight: 'bold' as const
  },
  modeSelector: {
    display: 'flex',
    gap: '0.5rem'
  },
  modeButton: {
    padding: '0.5rem 1rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer' as const,
    fontSize: '0.9rem'
  },
  modeButtonActive: {
    background: '#00d4ff',
    color: '#000000',
    borderColor: '#00d4ff'
  },
  content: {
    marginBottom: '1.5rem'
  },
  matrixContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
    background: '#333',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  matrixHeader: {
    display: 'grid',
    gridTemplateColumns: '200px repeat(4, 1fr)',
    background: '#2a2a2a'
  },
  matrixCorner: {
    padding: '0.75rem',
    fontWeight: 'bold' as const,
    fontSize: '0.9rem',
    color: '#cccccc',
    borderRight: '1px solid #333'
  },
  matrixColumnHeader: {
    padding: '0.75rem',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    fontSize: '0.9rem',
    color: '#cccccc',
    borderRight: '1px solid #333'
  },
  matrixRow: {
    display: 'grid',
    gridTemplateColumns: '200px repeat(4, 1fr)',
    background: '#1a1a1a'
  },
  matrixRowHeader: {
    padding: '0.75rem',
    borderRight: '1px solid #333',
    display: 'flex',
    alignItems: 'center'
  },
  sizeLabel: {
    fontWeight: 'bold' as const,
    fontSize: '0.9rem',
    color: '#ffffff'
  },
  matrixCell: {
    borderRight: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  matrixCheckbox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.75rem',
    width: '100%',
    cursor: 'pointer' as const
  },
  matrixCellContent: {
    textAlign: 'center' as const
  },
  estimatedTime: {
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  checkbox: {
    accentColor: '#00d4ff',
    transform: 'scale(1.2)'
  },
  presetContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  presetCard: {
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '1rem',
    cursor: 'pointer' as const,
    transition: 'all 0.2s ease'
  },
  presetCardSelected: {
    borderColor: '#00d4ff',
    background: '#2a3a4a'
  },
  presetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  presetName: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    color: '#ffffff'
  },
  presetTime: {
    fontSize: '0.9rem',
    color: '#00ff88',
    fontWeight: 'bold' as const
  },
  presetDescription: {
    margin: '0 0 1rem 0',
    fontSize: '0.9rem',
    color: '#aaaaaa',
    lineHeight: 1.4
  },
  presetConfigs: {
    borderTop: '1px solid #444',
    paddingTop: '0.75rem'
  },
  presetConfigCount: {
    fontSize: '0.8rem',
    color: '#cccccc',
    marginBottom: '0.5rem'
  },
  presetConfigBreakdown: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.25rem'
  },
  presetConfigItem: {
    background: '#1a1a1a',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
    fontSize: '0.7rem',
    color: '#aaaaaa'
  },
  summary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#2a2a2a',
    borderRadius: '6px',
    marginBottom: '1rem'
  },
  summaryStats: {
    display: 'flex',
    gap: '2rem'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  summaryLabel: {
    fontSize: '0.8rem',
    color: '#aaaaaa'
  },
  summaryValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold' as const,
    color: '#ffffff'
  },
  startButton: {
    padding: '0.75rem 1.5rem',
    background: '#00ff88',
    color: '#000000',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer' as const,
    fontSize: '1rem'
  },
  startButtonDisabled: {
    background: '#666666',
    color: '#aaaaaa',
    cursor: 'not-allowed' as const
  },
  configList: {
    background: '#2a2a2a',
    borderRadius: '6px',
    padding: '1rem'
  },
  configListTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    color: '#ffffff'
  },
  configItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '0.5rem'
  },
  configItem: {
    background: '#1a1a1a',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #333'
  },
  configItemMain: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    marginBottom: '0.25rem'
  },
  configSize: {
    background: '#444',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
    fontSize: '0.8rem',
    fontWeight: 'bold' as const,
    color: '#ffffff'
  },
  configLayout: {
    fontSize: '0.9rem',
    color: '#cccccc'
  },
  configTime: {
    fontSize: '0.8rem',
    color: '#00ff88',
    marginLeft: 'auto'
  },
  configPriority: {
    fontSize: '0.7rem',
    color: '#aaaaaa'
  }
};