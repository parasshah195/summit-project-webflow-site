/**
 * A frontend configurable general events slider component
 * Configuration to be done via attribute names matching the respective API parameters
 *
 * Add a reference to the main component element with the name `componentEl`
 *
 * Component name - `eventsList`
 *
 * To show blog posts shuffled in with the events, add `x-ref` reference attributes:
 *  1. to the blog post collection list with the value `blogPostsList`
 *  2. to the slider mask with the value `sliderMask`
 *
 * To link webinar images, add attribute:
 *  1. `x-ref`to the blog post collection list with the value `blogTagsList`
 *  2. `tag_name` to the image in the collection item with the dynamic value of the Blog's Tag
 *
 * To use on non-slider elements, add attribute:
 * - the value of the `NON_SLIDER_ATTRIBUTE` property in this class to the `componentEl` element
 */

import EventQuery from '$api/eventQuery';
import type { APIResponse, QueryParams } from '$api/eventQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { getEventDateRange, getTimeRange } from '$utils/getDateTime';
import isMultiDayEvent from '$utils/isMultiDayEvent';
import { reInitSliders } from '$utils/reinitSliders';
import { setEventQueryFromAttr } from '$utils/setEventQueryFromAttr';

interface APIResponseWithImage extends APIResponse {
  image_src: string | null;
  image_alt: string;
}

/**
 * Alpine Component properties and functions
 */
interface EventsListComponent {
  /**
   * List of events matching the given criteria
   */
  events: APIResponse[] | APIResponseWithImage[] | [];
  /**
   * List of blog articles to be shown in the slider
   * Optional functionality for mixed webinars + blog sliders
   */
  blogList: NodeListOf<HTMLElement> | null;
  /**
   * The events API query parameters
   */
  apiBody: QueryParams;
  /**
   * Event Slide Item attributes
   */
  eventSlideAttr: object;
  /**
   * Attribute to set image on the webinar according to the blog tag
   * Also removes responsive images to avoid default image showing instead of event images
   */
  eventWebinarImage: object;
  /**
   * Tracks whether we are waiting for the API response or not
   */
  isLoading: boolean;
  /**
   * Tracks whether we have any events at all to show or not
   */
  areEventsAvailable: boolean;
  /**
   * Tracks whether more events are currently loading or not
   * For loading state of the "View More" button
   */
  moreEventsLoading: boolean;
  /**
   * Tracks whether we have any more events to load for the given query or not
   * Used alongside "View More" button functionality
   */
  eventsDepleted: boolean;
  /**
   * Tracks whether we had any error while querying the API
   */
  isQueryError: boolean;
  /**
   * Auto-runs on component initialization
   * Sets the API parameters, and initializes the query
   */
  init(): void;
  /**
   * Fetches attributes from the data attribute of the `componentEl` reference and updates the apiBody accordingly
   */
  setAPIParams(): void;
  /**
   * Queries the Events API, updates the events list, and re-initializes the sliders
   * @param viewMoreQuery whether the query is for loading more events or not
   */
  processQuery(viewMoreQuery?: boolean): Promise<void>;
  /**
   * Show more events for the given query
   * Primarily used in webinar table
   */
  viewMoreEvents(): Promise<void>;
  getTimeRange(start: string, end: string, includeTimeZone: boolean): string;
  /**
   * For webinars
   */
  getPresenters(event: APIResponse): string;
  /**
   * Appends blog posts to the event slider and shuffles the cards in a 1:1 order
   * E.g: 1 event, 1 blog post...
   */
  appendBlogPostsAndShuffle(): true | null;
  getEventDateRange(event: APIResponse): string;
  isMultiDayEvent(event: APIResponse): boolean;
  setTagImage(event: APIResponseWithImage): void;
}

window.addEventListener('alpine:init', () => {
  // TODO: this variable is already defined in `eventQuery`. Don't repeat
  const DEFAULT_EVENTS_LIMIT = 12;
  /**
   * Declares if the current events component is not a slider
   * Primarily used for table list
   */
  const NON_SLIDER_ATTRIBUTE = 'data-non-slider';

  window.Alpine.data('eventsList', function () {
    const API_BODY: QueryParams = {
      category: ['marketing_event'],
      start: 0,
      limit: DEFAULT_EVENTS_LIMIT,
      name: undefined,
      tags: undefined,
      topics: undefined,
      before: undefined,
      after: undefined,
      is_online: undefined,
      extended_time_available: undefined,
      days_of_week: undefined,
      location_id: undefined,
    };

    return {
      areEventsAvailable: true,
      isLoading: false,
      isQueryError: false,
      moreEventsLoading: false,
      eventsDepleted: false,

      events: [],

      blogList: null,

      apiBody: API_BODY,

      eventSlideAttr: {
        [':key']() {
          return this.event.id;
        },
      },

      eventWebinarImage: {
        [':src']() {
          // bail if tags are not set
          if (!this.event.tags || !this.event.tags.length) {
            return null;
          }

          return this.event.image_src;
        },

        [':alt']() {
          // bail if tags are not set
          if (!this.event.tags || !this.event.tags.length) {
            return null;
          }

          return this.event.image_alt;
        },

        // Disable responsive images on the event webinar image to avoid use of the default image over the new one
        ['srcset']: '',
        ['sizes']: '',
      },

      async init() {
        this.isLoading = true;

        if (this.$refs.blogPostsList) {
          const blogPostsList = this.$refs.blogPostsList.querySelectorAll(
            ':scope > div'
          ) as NodeListOf<HTMLElement>;
          this.blogList = blogPostsList.length ? blogPostsList : null;
        }

        /**
         * wait for Alpine to process any attribute bind with dynamic values
         * e.g: store query on the search page
         */
        await this.$nextTick();

        this.setAPIParams();
        this.processQuery();
      },

      setAPIParams() {
        if (!this.$refs.componentEl) {
          console.warn(
            '`componentEl` reference not found on the main component element - eventSlider',
            'Processing query with the default attributes of',
            this.apiBody
          );
        }

        // loop through all attributes that has the API query attribute prefix
        setEventQueryFromAttr(this.$refs.componentEl, this);
      },

      async processQuery(viewMoreQuery = false) {
        if (!viewMoreQuery) {
          this.isLoading = true;
        }

        this.areEventsAvailable = true;
        this.isQueryError = false;

        const eventsData = (await new EventQuery(this.apiBody).getQueryData()) as
          | APIResponse[]
          | []
          | null;

        // If query resulted in an error, bail
        if (!eventsData) {
          this.isLoading = false;
          this.isQueryError = true;
          this.areEventsAvailable = false;
          return;
        }

        // If no events and blog list available to render, bail
        if (!eventsData.length && !this.blogList && !viewMoreQuery) {
          this.isLoading = false;
          this.areEventsAvailable = false;
          return;
        }

        if (
          (!eventsData.length && viewMoreQuery) ||
          eventsData.length < (this.apiBody.limit || DEFAULT_EVENTS_LIMIT)
        ) {
          this.eventsDepleted = true;
        }

        eventsData.forEach((event: APIResponse) => {
          if (event.tags && event.tags.length) {
            this.setTagImage(event as APIResponseWithImage);
          }
        });

        if (eventsData.length) {
          this.events.push(...eventsData);
        }

        // wait for events to be fully rendered by the browser before appending blog posts
        this.$nextTick(() => {
          // NOTE: without this being a callback function inside `$nextTick`, the `$refs.sliderMask` element returns `undefined`
          if (this.$refs.sliderMask && this.blogList) {
            const appendBlogPosts = this.appendBlogPostsAndShuffle();

            if (null === appendBlogPosts && !eventsData.length) {
              // if the function returns null, means no blog posts exists
              this.areEventsAvailable = false;
            }
          }
        });

        this.isLoading = false;

        await this.$nextTick();

        if (!this.$refs?.componentEl?.hasAttribute(NON_SLIDER_ATTRIBUTE) ?? false) {
          reInitSliders();
        }
      },

      async viewMoreEvents() {
        if (!this.apiBody.start) {
          this.apiBody.start = 0;
        }

        if (!this.apiBody.limit) {
          this.apiBody.limit = 6;
        }

        this.apiBody.start += this.apiBody.limit;

        this.moreEventsLoading = true;
        await this.processQuery(true);
        this.moreEventsLoading = false;
      },

      getTimeRange(start, end, includeTimeZone = true) {
        return getTimeRange(start, end, includeTimeZone);
      },

      getPresenters(event) {
        const { presenters } = event;

        if (!presenters || !presenters.length) {
          return 'No presenters';
        }

        return presenters.join(', ');
      },

      appendBlogPostsAndShuffle() {
        if (!this.blogList) {
          console.warn(
            'Trying to shuffle event slider cards when blogList is null',
            'slider mask element -',
            this.$refs.sliderMask
          );
          return null;
        }

        const eventCardsRef: NodeListOf<HTMLElement> =
          this.$refs.sliderMask.querySelectorAll(':scope > div');

        if (!eventCardsRef.length) {
          return null;
        }

        const eventCards = [...eventCardsRef];

        eventCardsRef.forEach((card) => card.remove());

        // fragment to hold the blog elements
        const fragment = document.createDocumentFragment();

        // Iterate over event and blog cards in mixed order and append to sliderMask
        let eventIndex = 0;
        let blogIndex = 0;
        while (eventIndex < eventCards.length || blogIndex < this.blogList.length) {
          if (eventIndex < eventCards.length) {
            fragment.appendChild(eventCards[eventIndex]);
            eventIndex += 1;
          }
          if (blogIndex < this.blogList.length) {
            const blogPostEl = this.blogList[blogIndex];
            // add slide class to blog post element
            blogPostEl.classList.add('w-slide');

            fragment.appendChild(blogPostEl);
            blogIndex += 1;
          }
        }

        this.$refs.sliderMask.appendChild(fragment);

        return true;
      },

      getEventDateRange(event) {
        return getEventDateRange(event);
      },

      isMultiDayEvent(event) {
        return isMultiDayEvent(event);
      },

      setTagImage(event) {
        // Used for picking a random tag and image from the list
        const randomFraction = Math.random();
        const randomTagIndex = Math.floor(randomFraction * event.tags.length);

        // Find the image matching the first tag name set for this webinar
        const locationImageList = this.$refs.blogTagsList?.querySelectorAll(
          `img[tag_name="${event.tags[randomTagIndex]}"]`
        ) as NodeListOf<HTMLElement>;

        if (!locationImageList || !locationImageList.length) {
          return null;
        }

        // pick a random element from the `locationImageEL` nodelist
        const randomImageIndex = Math.floor(randomFraction * locationImageList.length);
        const randomLocationImageEl = locationImageList[randomImageIndex];

        event.image_src = randomLocationImageEl.getAttribute('src') || null;
        event.image_alt = randomLocationImageEl.getAttribute('alt') || '';
      },
    } as ApplerouthAlpineComponent<EventsListComponent>;
  });
});
