# 4.22.0 - 4/15/25
- [feature] Remove default hotkeys #319

# 4.21.6 - 4/14/25
- [fix] Update reakeys & fix hotkeys #317

# 4.21.5 - 3/7/25
- [fix] bugfix: Validation when adding nodes and edges when building the graph #312

# 4.21.4 - 3/5/25
- [fix] bugfix: Fixing hardcoded radius #311

# 4.21.3 - 3/5/25
- [fix] bugfix: Exporting types for hierarchical layout #310

# 4.21.2 - 1/13/25
- [fix] Fix to make Copy/Paste keyboard shortcuts working with useSelection #302

# 4.21.1 - 12/24/24
- [fix] fix pan mode on touch devices

# 4.21.0 - 11/22/24
- [feature] Add ability to define custom cluster #297

# 4.20.1 - 11/13/24
- [feature] Add onClusterDragged event #296

# 4.20.0 - 11/13/24
- [chore] Performance Optimizations #295
- [feature] Cluster Dragging #294

# 4.19.5 - 11/1/24
- [fix] Update cluster position after node dragging #292

# 4.19.4 - 10/17/24
- [chore] Add ability to customise Label font size and offset #285

# 4.19.3 - 8/20/24
- [fix] fixed labelType none still shows label when hovering over node
- [chore] replace react-use-gesture to @use-gesture/react #257

# 4.19.2 - 6/24/24
- [chore] Update reakeys #251

# 4.19.1 - 6/3/24
- [fix] Fix camera pan while dragging node #248

# 4.19.0 - 5/30/24
- [feature] Add dolly camera controls #247

# 4.18.1 - 5/23/24
- [fix] Fix fit view bug after panning and zooming #246

# 4.18.0 - 5/23/24
- [feature] Add fitNodesInView function #244

# 4.17.4 - 5/8/24
- [chore] upgrade reakeys

# 4.17.3 - 5/02/24
- [feature] add new parameters to Ring #239
 
# 4.17.2 - 4/30/24
- [fix] Fix eslint setup #236
- [fix] Fix label rotation #237
- [fix] Fix jerky layout switching #238

# 4.17.1 - 4/25/24
- [fix] Remove active state from selection property #233

# 4.17.0 - 4/23/24
- [feature] decouple Ring from Node and move to sphere.
- [feature] add `selected` to `NodeRendererCallback` props.

# 4.16.1 - 4/15/24
- [fix] Fix Edge context menu position #229

# 4.16.0 - 4/10/24
- [feature] Expose events for Click and Pointer API  #224
- [fix] Node render order #225

# 4.15.27 - 4/4/24
- [fix] Fix camera view resetting on label visibility change #215

# 4.15.26 - 3/26/24
- [feature] expose `minDistance` and `maxDistance`.

# 4.15.25 - 3/22/24
- [fix] Fix graph only centering when nodes out of view #208
- [fix] Improve label visibility for small nodes #212

# 4.15.24 - 3/18/24
- [feature] add `strokeWidth` to ring

# 4.15.23 - 3/18/24
- [fix] Fix zoom to cursor
- [fix] Fix can't zoom while hovering a node
- [fix] Re-center camera when nodes update

# 4.15.22 - 3/13/24
- [fix] Fix camera moving slightly on drag #202

# 4.15.21 - 3/12/24
- [fix] Fix camera reorient on deselect #201

# 4.15.20 - 3/6/24
- [fix] Fix 2d graph over-rotating on node select #198

# 4.15.19 - 3/4/24
- [fix] update reakeys for nextjs support
- [fix] improve tick counting by using alpha number
- [chore] update various deps

# 4.15.18 - 2/27/24
- [fix] #188 fix center rotation on 3d graph

# 4.15.17 - 2/23/24
- [improvement] Adjust force directed 2d graph spacing #184

# 4.15.16 - 2/23/24
- [improvement] hide labels based on zoom #187
- [improvement] hide labels based on rank #185
- [fix] improve graph reorientation #186
- [fix] improve performance by only calling render on screenshot
- [chore] upgrade some deps

# 4.15.15 - 2/21/24
- [fix] fix graph centering on small graphs #182
- [fix] improve cluster overlap #183

# 4.15.14 - 2/19/24
- [fix] fix centering logic
- [fix] improve performance on load

# 4.15.13 - 2/19/24
- [fix] fix disabled not working correctly
- [improvement] zoom to cursor rather than center
- [fix] better null handling
- [chore] remove some dead code

# 4.15.12 - 2/19/24
- [feature] Save As Image #17

# 4.15.11 - 2/19/24
- [fix] fix initial animations and updates
- [fix] improve performance on 500+ nodes
- [fix] Improve graph selection re-orientation #179

# 4.15.10 - 2/12/24
- [improvement] bring nodes up a z-index when highlighted

# 4.15.9 - 2/8/24
- [fix] fix inverted logic on lasso

# 4.15.8 - 2/8/24
- [fix] attempt to improve nextjs support

# 4.15.7 - 2/7/24
- [fix] @react-three/drei type error fixed #175
- [fix] fix issue with disabled graphs #169
- [chore] upgrade drei package #173

# 4.15.6 - 1/31/24
- [fix] fix clusters not entering animation correctly

# 4.15.5 - 1/31/24
- [fix] fix issue initial zoom off center #167
- [chore] upgrade easy depedencies

# 4.15.4 - 12/29/23
- [fix] fix error with clustering

# 4.15.3 - 12/28/23
- [fix] Make partial clusters if clusterAttribute it not defined #161

# 4.15.2 - 12/16/23
- [feature] Add overrides for node size to Hierarchical 2D #158
- [chore] upgrade storybook

# 4.15.1 - 12/11/23
- [fix] fix cluster theme not nullable
- [fix] fix cluster allowing to be set on non clusterable layouts
- [chore] upgrade deps

# 4.15.0 - 12/11/23
- [feature] Add parallel edge graph support #153
- [feature] Add custom label font size #152
- [feature] Add transparent backgrounds #151
- [fix] Fix label position on curved edges #150
- [chore] update FAQ with resize canvas #148

# 4.14.2 - 11/27/23
- [fix] change labelFontUrl to fontUrl for cluster #143

# 4.14.1 - 9/28/23
- [fix] Fix imports with webpack 5 #135

# 4.14.0 - 9/18/23
- [feature] node sublabels #134
- [feature] add double click to nodes #133
- [feature] Add glOptions to GraphCanvas to extend gl configutation #132
- [feature] Allow passing deltaTime to CameraControl movements #131
- [fix] attempt to fix graphology error #115

# 4.13.0 - 8/28/23
- [feature] added highlighting to clusters ( new theme properties )

# 4.12.4 - 8/28/23
- [fix] fix null exception with clustering

# 4.12.3 - 8/28/23
- [fix] improved clustering

# 4.12.2 - 8/21/23
- [fix] Updated heuristics for cluster boundary spacing #123

# 4.12.1 - 8/14/23
- [fix] upgrade graphology for esm fix #115
- [fix] decrease default cluster strength from 0.5 to 0.3

# 4.12.0 - 8/8/23
- [feature] add ability to override node positions
- [feature] add custom layout option
- [fix] improve cluster positioning
- [fix] fix large edge code not accept font url
- [chore] move to npm

# 4.11.1 - 7/26/23
- [fix] fix cluster fill issue

# 4.11.0 - 7/26/23
- [feature] expose `resetControls` in Graph ref
- [feature] add click/over/out events to cluster props
- [feature] add fill option cluster circles
- [fix] fix SVG node not looking at camera at all times

# 4.10.5 - 7/19/23
- [fix] fix svg sphere node not passing down all props

# 4.10.4 - 7/19/23
- [fix] fix svg color passed wrong

# 4.10.3 - 7/19/23
- [feature] add ability to pass svg fill color seperately
- [fix] fix color being applied to wrong prop in svg icon

# 4.10.2 - 7/19/23
- [feature] add svg icon node type
- [feature] add `default` as sizing strategy and allow `none` to ignore size prop
- [chore] upgrade depdencies
- [fix] normalize cluster stroke color

# 4.10.1 - 7/18/23
- [fix] improve cluster ring jagged

# 4.10.0 - 7/18/23
- [feature] clustering improvements
- [feature] add ability to pass additional props

# 4.9.3 - 7/11/23
- [fix] fix clustering with edges not working

# 4.9.2 - 7/10/23
- [fix] better handle rogue edges

# 4.9.1 - 7/10/23
- [fix] fix attribute sizing using wrong prop
- [chore] misc docs improvements
- [chore] make selection/camera control hotkey category `Graph`

# 4.9.0 - 7/6/23
- [fix] node drag disappears
- [feature] add no overlap layout
- [feature] add forceatlas2 layout
- [chore] migrate from ngraph to graphology

# 4.8.3 - 6/14/23
- [chore] fix exports

# 4.8.2 - 5/15/23
- [fix] improve falsey check in node isSelected
- [fix] fix SphereWithIcon not getting opacity

# 4.8.1 - 5/9/23
- [fix] fix init jumping

# 4.8.0 - 5/9/23
- [fix] set max zoom to 1k
- [fix] improve performance
- [fix] improve default padding on zoom
- [fix] speed up dolly speed
- [fix] fix min zoom not working

# 4.7.1 to 4.7.11 - 5/8/23
- [fix] fix min zoom going out of range
- [fix] improve min/max distances
- [fix] allow fog to be optional
- [chore] upgrade to sb latest
- [chore] move to vite library build vs rollup

# 4.7.0 - 10/26/22
- [feature] Add Lasso + Drag #87
- [improvement] Add `singleOnly` option to `focusOnSelect` on `useSelect`

# 4.6.3 - 10/24/22
- [fix] Fix edge label positioning #86

# 4.6.2 - 10/18/22
- [fix] Don't intersect edges until scene is interacted with #84

# 4.6.1 - 10/17/22
- [fix] Fix edge ends and label rotation #83

# 4.6.0 - 10/14/22
- [feature] add edge curve interpolation #81

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
