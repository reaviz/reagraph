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
