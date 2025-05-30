export const isNotEditableElement = (element: HTMLElement) => {
  return (
    element.tagName !== 'INPUT' &&
    element.tagName !== 'SELECT' &&
    element.tagName !== 'TEXTAREA' &&
    !element.isContentEditable
  );
};
