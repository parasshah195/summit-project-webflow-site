/**
 * Component to show matching resources for a search query (on the search results page)
 * Does an exact text match with the resource heading
 *
 * Add `data-resource-heading="true"` attribute on the resource heading text to filter for
 *
 * Component name - `searchResources`
 */

import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { reInitSliders } from '$utils/reinitSliders';
import { SEARCH_STORE_NAME } from '$utils/storeNames';

window.addEventListener('alpine:init', () => {
  window.Alpine.data('searchResources', function () {
    return {
      /**
       * Flag to show/hide the resources section
       */
      areResourcesAvailable: true,
      /**
       * Empty flag just for re-using the events error component.
       * Not mutated anywhere in this component
       */
      areEventsAvailable: false,

      init() {
        window.fsAttributes = window.fsAttributes || [];
        window.fsAttributes.push([
          'cmsslider',
          () => {
            /**
             * Search query
             */
            const searchQuery = this.$store[SEARCH_STORE_NAME].query.toLowerCase();
            /**
             * List of all resource slides
             */
            const slideList: NodeListOf<HTMLElement> = this.$root.querySelectorAll('.slider_slide');
            /**
             * Total number of resource slides
             */
            const totalSlides = slideList.length;
            /**
             * Counter for slides to hide
             */
            let hiddenSlides = 0;

            slideList.forEach((slideEl) => {
              const headingEl: HTMLElement | null = slideEl.querySelector(
                '[data-resource-heading="true"]'
              );
              if (!headingEl) {
                return;
              }

              // if heading doesn't contain any query text, bail
              if (!headingEl.textContent?.toLowerCase().includes(searchQuery)) {
                slideEl.remove();
                hiddenSlides += 1;
              }

              if (hiddenSlides >= totalSlides) {
                this.areResourcesAvailable = false;
              }
            });

            this.$nextTick(() => {
              reInitSliders();
            });
          },
        ]);
      },
    } as ApplerouthAlpineComponent;
  });
});
