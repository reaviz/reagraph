# Storybook Controls Implementation Plan

## Overview
Adding comprehensive interactive controls to all 24 storybook stories in the reagraph project.

## Goals
- Transform static story examples into interactive, controllable demonstrations
- Provide comprehensive controls for all major GraphCanvas props
- Maintain existing functionality while enhancing discoverability
- Create consistent control patterns across all stories

## GraphCanvas Props for Controls

### Core Layout & Positioning
- `layoutType`: Layout algorithm selection (forceDirected2d, forceDirected3d, circular2d, treeTd2d, treeTd3d, treeLr2d, treeLr3d, radialOut2d, radialOut3d, hierarchicalTd, hierarchicalLr, nooverlap, forceatlas2, custom)
- `cameraMode`: Camera interaction mode (pan, rotate, orbit)
- `animated`: Enable/disable animations (boolean)

### Visual Properties
- `theme`: Theme selection (lightTheme, darkTheme, custom)
- `sizingType`: Node sizing strategy (none, centrality, attribute, pageRank, default)
- `labelType`: Label visibility (none, auto, all, nodes, edges)
- `edgeLabelPosition`: Edge label placement (above, below, inline, natural)
- `edgeArrowPosition`: Arrow placement on edges
- `edgeInterpolation`: Edge curve type

### Node & Edge Properties
- `defaultNodeSize`: Default node size (number)
- `minNodeSize`: Minimum node size when using sizing strategies
- `maxNodeSize`: Maximum node size when using sizing strategies
- `sizingAttribute`: Attribute name for attribute-based sizing
- `clusterAttribute`: Attribute name for clustering

### Interaction
- `disabled`: Disable all interactions (boolean)
- `draggable`: Allow node dragging (boolean)
- `selections`: Selected node IDs (array)
- `actives`: Active node IDs (array)
- `lassoType`: Lasso selection mode

### Advanced
- `labelFontUrl`: Custom font URL for labels
- `maxDistance`: Maximum camera distance
- `minDistance`: Minimum camera distance

## Implementation Status

### Phase 1: Foundation ✅
- [x] WORKING_MEMORY directory created
- [x] .gitignore updated
- [ ] Shared argTypes configuration created
- [ ] Basic.story.tsx updated

### Phase 2: Core Stories
- [ ] Nodes.story.tsx
- [ ] Edges.story.tsx  
- [ ] Layouts.story.tsx
- [ ] Themes.story.tsx
- [ ] Controls.story.tsx
- [ ] Sizing.story.tsx

### Phase 3: Interaction Stories
- [ ] SingleSelection.story.tsx
- [ ] MultiSelection.story.tsx
- [ ] Lasso.story.tsx
- [ ] ContextMenu.story.tsx
- [ ] Hotkeys.story.tsx
- [ ] RadialMenu.story.tsx

### Phase 4: Remaining Stories
- [ ] Cluster.story.tsx
- [ ] Collapsible.story.tsx
- [ ] Labels.story.tsx
- [ ] UseCases.story.tsx
- [ ] EdgeArrows.story.tsx
- [ ] EdgeCurved.story.tsx
- [ ] EdgeLabels.story.tsx
- [ ] ClickHighlightTypes.story.tsx
- [ ] HoverHighlightTypes.story.tsx
- [ ] ThreeLayouts.story.tsx
- [ ] TwoLayouts.story.tsx

### Phase 5: Testing & Documentation
- [ ] Test all controls functionality
- [ ] Create completion summary
- [ ] Git commit with changes

## Notes
- Each story will maintain its existing functionality
- Controls will be added using Storybook's argTypes system
- Default values will be provided for all controls
- Existing static stories will be preserved alongside new controllable versions where appropriate