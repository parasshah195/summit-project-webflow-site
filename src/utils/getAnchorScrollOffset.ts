/**
 * Returns the top position of an element accounting for the navbar height
 * @param el The Element to find offset for
 * @param offset Extra offset
 */
export function getAnchorScrollOffset(el: HTMLElement, offset = 0): number {
  const navbarEl = document.querySelector('.navbar_component');
  const navbarHeight = navbarEl?.clientHeight || 0;

  const anchorElPos = el.getBoundingClientRect().top + window.scrollY;

  return anchorElPos - navbarHeight - offset;
}
