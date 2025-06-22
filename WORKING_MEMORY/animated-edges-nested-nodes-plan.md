# Benchmark App Enhancement: Animated Edges and Nested Expandable Nodes

## Overview
This plan outlines the implementation of animated edges and nested expandable nodes in the benchmarking app to better mirror the components found in the storybook stories.

## Analysis Summary

### Current State
1. **Benchmark App Structure**:
   - Has GraphRenderer and GraphRendererV2 components
   - Supports various test datasets from Storybook
   - Already includes hierarchical dataset (parentNodes/parentEdges)
   - Has performance tracking and selective testing capabilities

2. **Existing Library Features**:
   - **Animated Edges**: Supported via `animated` prop on GraphCanvas
   - **Collapsible Nodes**: Supported via `collapsedNodeIds` prop and `useCollapse` hook
   - **Hierarchical Data**: parentNodes dataset already demonstrates 2-level nesting

## Implementation Plan

### Phase 1: Add Animation Controls to Existing Components

#### 1.1 Update GraphRenderer Component
- Add `animated` prop with default value `false`
- Add animation toggle control in the UI
- Pass animation state to GraphCanvas component

#### 1.2 Update GraphRendererV2 Component  
- Add animation controls to Phase 2 optimization panel
- Include animation state in performance metrics

#### 1.3 Add Animation Configuration to BenchmarkTest Type
- Add optional `animated` field to BenchmarkTest interface
- Update existing tests to specify animation preferences

### Phase 2: Implement Collapsible Node Features

#### 2.1 Create CollapsibleGraphRenderer Component
- New component that extends GraphRenderer functionality
- Integrates `useCollapse` hook from reagraph library
- Manages collapsed node state
- Provides UI controls for collapse/expand operations

#### 2.2 Add Collapse Controls
- Node click handlers for collapse/expand
- Visual indicators for collapsible nodes
- Bulk collapse/expand controls
- Display collapsed node count in UI

#### 2.3 Update Benchmark Tests
- Add new test specifically for collapsible hierarchical graphs
- Use existing parentNodes/parentEdges dataset
- Add tests with different collapse states

### Phase 3: Create Combined Feature Test

#### 3.1 Create AnimatedCollapsibleTest
- New benchmark test that combines:
  - Animated edges (`animated: true`)
  - Two-level nested nodes (using parentNodes dataset)
  - Collapsible functionality
  - Performance tracking for both features

#### 3.2 Add Performance Metrics
- Track animation frame rates
- Measure collapse/expand operation performance
- Monitor memory usage during state changes

### Phase 4: Update UI and Controls

#### 4.1 Enhance BenchmarkDashboard
- Add test category filter for "Interactive" tests
- Add toggle for enabling/disabling animations globally
- Add collapse state persistence option

#### 4.2 Update Test Selection
- Group tests by feature type
- Highlight tests with interactive features
- Add test complexity indicators

## Implementation Details

### New Components Structure

```typescript
// New CollapsibleGraphRenderer component
interface CollapsibleGraphRendererProps extends GraphRendererProps {
  animated?: boolean;
  initialCollapsedIds?: string[];
  onCollapseChange?: (collapsedIds: string[]) => void;
}

// Updated BenchmarkTest type
interface BenchmarkTest {
  // ... existing fields
  animated?: boolean;
  interactive?: boolean;
  initialCollapsedNodeIds?: string[];
}
```

### Test Configuration Examples

```typescript
// Animated Edges Test
{
  id: 'animated-edges-test',
  name: 'Animated Edges Performance',
  animated: true,
  interactive: false,
  // ... other fields
}

// Collapsible Hierarchy Test  
{
  id: 'collapsible-hierarchy',
  name: 'Two-Level Nested Nodes',
  animated: true,
  interactive: true,
  initialCollapsedNodeIds: ['n-2'],
  dataset: { nodes: parentNodes, edges: parentEdges }
}
```

## Benefits

1. **Better Storybook Parity**: Tests will more accurately reflect real-world usage patterns
2. **Performance Insights**: Measure impact of animations and state changes
3. **Interactive Testing**: Validate performance during user interactions
4. **Comprehensive Coverage**: Test combinations of features together

## Risk Mitigation

1. **Backward Compatibility**: All changes are additive; existing tests remain unchanged
2. **Performance Impact**: Animation defaults to `false` for existing tests
3. **Code Reuse**: Leverage existing reagraph hooks and components
4. **Gradual Rollout**: Implement features incrementally with testing at each phase

## Success Criteria

1. Existing benchmark tests continue to function without modification
2. New animated edge tests show measurable performance metrics
3. Collapsible node functionality works with 2+ hierarchy levels
4. Combined feature test demonstrates both animations and collapsing
5. UI clearly indicates test capabilities and features