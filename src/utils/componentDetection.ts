import { ReactNode, Children, isValidElement } from 'react';

/**
 * Checks if a React component is an HTML component that should be rendered
 * outside the React Three Fiber Canvas context.
 *
 * @param child - The React child element to check
 * @returns true if the component is an HTML component, false otherwise
 */
export const isHTMLComponent = (child: ReactNode): boolean => {
  if (!isValidElement(child)) return false;

  // Check if it's a MiniMap component
  if (child.type && typeof child.type === 'function') {
    const componentName =
      (child.type as any).displayName || (child.type as any).name;
    if (componentName === 'MiniMap') return true;
  }

  // Check if it's a built-in HTML element
  if (typeof child.type === 'string') {
    return [
      'div',
      'span',
      'button',
      'input',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ].includes(child.type);
  }

  return false;
};

/**
 * Separates React children into 3D components and HTML components.
 * 3D components should be rendered inside the React Three Fiber Canvas,
 * while HTML components should be rendered outside the Canvas but inside the Provider.
 *
 * @param children - The React children to separate
 * @returns Object containing separated threeDChildren and htmlChildren arrays
 */
export const separateChildren = (children: ReactNode) => {
  const threeDChildren: ReactNode[] = [];
  const htmlChildren: ReactNode[] = [];

  Children.forEach(children, child => {
    if (isHTMLComponent(child)) {
      htmlChildren.push(child);
    } else {
      threeDChildren.push(child);
    }
  });

  return { threeDChildren, htmlChildren };
};
