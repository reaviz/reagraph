import React from 'react';
import { isHTMLComponent, separateChildren } from './componentDetection';
import { expect, describe, it } from 'vitest';

// Mock components for testing - using proper React component patterns
const MockMiniMap: React.FC = () => React.createElement('div', null, 'MiniMap');
MockMiniMap.displayName = 'MiniMap';
const MockLight: React.FC = () => React.createElement('ambientLight');

// Test the component detection utilities
describe('Component Detection Utilities', () => {
  describe('isHTMLComponent', () => {
    it('should identify HTML elements as HTML components', () => {
      expect(isHTMLComponent(React.createElement('div', null, 'test'))).toBe(
        true
      );
      expect(isHTMLComponent(React.createElement('span', null, 'test'))).toBe(
        true
      );
      expect(isHTMLComponent(React.createElement('button', null, 'test'))).toBe(
        true
      );
      expect(isHTMLComponent(React.createElement('p', null, 'test'))).toBe(
        true
      );
    });

    it('should identify MiniMap component as HTML component', () => {
      expect(isHTMLComponent(React.createElement(MockMiniMap))).toBe(true);
    });

    it('should not identify 3D components as HTML components', () => {
      expect(isHTMLComponent(React.createElement('ambientLight'))).toBe(false);
      expect(isHTMLComponent(React.createElement('directionalLight'))).toBe(
        false
      );
      expect(isHTMLComponent(React.createElement(MockLight))).toBe(false);
    });
  });

  describe('separateChildren', () => {
    it('should separate HTML and 3D children correctly', () => {
      const children = [
        React.createElement('div', { key: '1' }, 'HTML'),
        React.createElement('ambientLight', { key: '2' }),
        React.createElement(MockMiniMap, { key: '3' }),
        React.createElement('directionalLight', { key: '4' })
      ];

      const result = separateChildren(children);

      // Test the core functionality: correct categorization
      expect(result.htmlChildren).toHaveLength(2); // div + MiniMap
      expect(result.threeDChildren).toHaveLength(2); // ambientLight + directionalLight

      // Verify the categorization logic works correctly
      expect(result.htmlChildren).toContainEqual(
        expect.objectContaining({ type: 'div' })
      );
      expect(result.htmlChildren).toContainEqual(
        expect.objectContaining({ type: MockMiniMap })
      );
      expect(result.threeDChildren).toContainEqual(
        expect.objectContaining({ type: 'ambientLight' })
      );
      expect(result.threeDChildren).toContainEqual(
        expect.objectContaining({ type: 'directionalLight' })
      );
    });

    it('should handle empty children array', () => {
      const result = separateChildren([]);
      expect(result.htmlChildren).toHaveLength(0);
      expect(result.threeDChildren).toHaveLength(0);
    });

    it('should handle mixed component types', () => {
      const children = [
        React.createElement(MockMiniMap, { key: '1' }),
        React.createElement('div', { key: '2' }, 'Content'),
        React.createElement('ambientLight', { key: '3' })
      ];

      const result = separateChildren(children);
      expect(result.htmlChildren).toHaveLength(2);
      expect(result.threeDChildren).toHaveLength(1);
    });
  });
});
