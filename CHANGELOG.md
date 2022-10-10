# 4.5.1 - 10/10/22
- [fix] getIsCollapsed missing a not #80

# 4.5.0 - 10/5/22
- [improvement] rewrote edges for performance
- [improvement] add `useCollapse` hook

# 4.4.5 - 9/13/22
- [fix] Collapsible refactor #74

# 4.4.4 - 9/12/22
- [feature] add ability to pass classnames to radial menus

# 4.4.3 - 9/12/22
- [fix] fix initial graph layout not considering collapsed states

# 4.4.2 - 9/12/22
- [fix] fix dragging trigger click
- [chore] cleanup old hidden logic in node/edge

# 4.4.1 - 9/12/22
- [fix] fix graph eating global keyboard events not in inputs
- [fix] fix graph nodes being hidden affecting perf/layout

# 4.4.0 - 9/7/22
- [feature] nodes and edges use hover intent for activation events
- [feature] add ability to override layouts
- [feature] expose `nodeLevelRatio` in overrides
- [feature] expose collapse props on node click event
- [fix] fix context menu event not passing collapse props
- [fix] tweak tree 2d/radial 2d for much better layouts

# 4.3.1 - 9/6/22
- [fix] fix nodes/edges still clickable when hidden

# 4.3.0 - 9/5/22
- [feature] Add new API to customize nodes: `renderNode` #58

# 4.2.0 - 8/17/22
- [feature] add collapse / expand for nodes #69

# 4.1.0 - 8/17/22
- [feature] add `pathHoverType` to `useSelection` which allows for custom highlighting
- [fix] decreased precision of animation to 0.1 from 0.0001 for performance

# 4.0.5 - 8/9/22
- [fix] improving force layout when more than 25 edges

# 4.0.4 - 8/9/22
- [fix] improve mounted transition so it doesn't flicker

# 4.0.3 - 8/9/22
- [fix] improve hover events of nodes
- [demo] cyber-security use case demo

# 4.0.2 - 7/28/22
- [fix] fix incorrect variable name from `theme.edge.opacityOnlySelected` to `theme.edge.inactiveOpacity`.
- [fix] use callback memos for useSelection hook
- [fix] fix edge selection opacity inverted
- [fix] improve focus padding math

# 4.0.1 - 7/28/22
- [fix] fix graph error on init for new selection types

# 4.0.0 - 7/28/22
- [BREAKING] reworked how selections/actives work. See selection stories.
- [BREAKING] removed theme settings for radial menu in favor of css vars
- [feature] lasso select
- [feature] add pointer over/out events for nodes/edges
- [fix] fix dragging causing selection
- [fix] improve zoom level when selecting

# 3.0.2 - 7/26/22
- [feature] Use theme to define opacity #49
- [fix] Set DoubleSide on the arrow heads #53

# 3.0.1 - 7/25/22
- [fix] update radial menu slice props for new interface

# 3.0.0 - 7/25/22
- [BREAKING] `contextMenuItems` has been removed in favor of `contextMenu` callback. Radial menu is still available but needs to be implemented directly. This opens up more flexible menus.
- [feature] `onNodeContextMenu` and `onEdgeContextMenu` methods are exposed.
- [feature] Edges now support context menus
- [feature] Edge arrow positions
- [feature] add disabled to radial context menu items
- [fix] hide radial context menu if no slices visible
- [fix] Hovering edge arrow would not highlight

# 2.1.6 - 7/25/22
- [improvement] Add `visible` prop to radial menu items

# 2.1.5 - 7/25/22
- [improvement] Add event and model to radial slice click event

# 2.1.4 - 7/20/22
- [fix] Cannot read properties of undefined (reading 'size') error within nodeSizeProvider #54

# 2.1.3 - 7/20/22
- [fix] upgrade reakeys

# 2.1.2 - 7/20/22
- [improvement] improve hover events for edges
- [fix] revert reakeys for regression with binding

# 2.1.1 - 7/19/22
- [fix] fix empty attributes causing node error

# 2.1.0 - 7/19/22
- [feature] add ability to click edges
- [fix] warn when switching to attribute with no attribute selected
- [fix] fix when panning not to highlight nodes

# 2.0.10 - 7/19/22
- [chore] upgrade deps

# 2.0.9 - 7/12/22
- [fix] fix node size not being applied
- [fix] fix dragging node after zooming resetting zoom

# 2.0.8 - 7/12/22
- [fix] cleanup sizing logic to be relative #51
- [fix] improve various layout distances

# 2.0.7 - 7/11/22
- [feature] add min/max/default sizes to nodes

# 2.0.6 - 7/11/22
- [feature] add `orbit` camera mode for auto rotating

# 2.0.5 - 7/11/22
- [fix] fix edge selection #46

# 2.0.4 - 7/6/22
- [fix] fix dragging node not getting reset on layout change
- [fix] fix null reference in camera controls #25

# 2.0.3 - 7/5/22
- [fix] fix dragging a node and then resetting layout not retaining position #43

# 2.0.2 - 7/5/22
- [fix] add stroke to labels and fix colors

# 2.0.1 - 7/5/22
- [fix] fix cursor not correct when draggable and not clickable

# 2.0.0 - 7/5/22
- [BREAKING] update theme to include label options
- [feature] add ability to add stroke to labels
- [feature] improve label handling and show all label on hover
- [fix] improve dark theme arrow/edges
- [fix] center align labels better
- [fix] improve color mappings
- [fix] fix drag offset incorrect #42

# 1.2.0 - 6/28/22
- [feature] clustering
- [feature] layout recommender mvp
- [feature] add font url for labels #37
- [fix] improve fog
- [fix] fix label positioning
- [fix] fix radial menu not working until you cause CD
- [fix] fix line arrow position
- [fix] hide pointer unless clickable
- [fix] fix drag highlighting
- [fix] add threshold to dragging
- [fix] update ellipsis default length to 24
- [chore] improve drag selection

# 1.1.0 - 6/24/22
- [feature] improved label positioning for edges
- [feature] dragging of nodes
- [fix] improve fog on nodes
- [fix] improve distortion on nodes
- [fix] increase speed on camera transitions
- [chore] use zustand for state

# 1.0.3 - 6/21/22
- [fix] useSelection make input can't accept typing #24

# 1.0.2 - 5/10/22
- [enhancement] improve force layout #19
- [chore] fix types #20
