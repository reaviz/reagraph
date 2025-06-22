# Update Storybook Controls Plan

## Objective
Update 5 storybook demo files to add comprehensive controls using shared argTypes and commonArgs from `../shared/storybook-args`.

## Files to Update
1. docs/demos/Edges.story.tsx
2. docs/demos/Controls.story.tsx
3. docs/demos/SingleSelection.story.tsx
4. docs/demos/MultiSelection.story.tsx
5. docs/demos/Lasso.story.tsx

## Changes for Each File

### 1. Import Changes
- Add import: `import { commonArgTypes, commonArgs } from '../shared/storybook-args';`

### 2. Default Export Updates
- Add `argTypes: commonArgTypes` to the default export object

### 3. Story Structure Changes
For each story:
- Convert functional components to template functions
- Use `.bind({})` pattern
- Add args object that includes `...commonArgs` plus any story-specific props
- Maintain existing functionality while making props controllable

## Implementation Strategy
1. Read each file to understand current structure
2. Update imports and default export
3. Convert each story to template pattern
4. Test that stories maintain their functionality
5. Commit changes

## Expected Benefits
- Users can interactively control graph properties via Storybook controls
- Consistent control interface across all demo stories  
- Better documentation and testing capabilities
- Improved developer experience when exploring component features