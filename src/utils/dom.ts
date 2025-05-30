/**
 * Check if an element is not editable (input, select, textarea, contentEditable).
 * @param element - The element to check
 * @returns True if the element is not editable, false otherwise
 */
export const isNotEditableElement = (element: HTMLElement) => {
  return (
    element.tagName !== 'INPUT' &&
    element.tagName !== 'SELECT' &&
    element.tagName !== 'TEXTAREA' &&
    !element.isContentEditable
  );
};
