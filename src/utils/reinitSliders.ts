/**
 * Re-initializes all Webflow sliders on the page
 * To be used after adding/removing any slider items
 */
export const reInitSliders = () => {
  window.Webflow?.require('slider').redraw();

  // resize event triggering the slider refresh
  window.dispatchEvent(new Event('resize'));
};
