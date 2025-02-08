/**
 * A list of online events grouped by locations on practice test (located at `/events/practice-test`) and group class pages (located at `/events/group-classes`)
 *
 * The query is done according to the options set in the filter store (which are mutated by the filtering options).
 * The resulting query is grouped into locations, and then outputted
 *
 * Location sorting order is picked up by the order of elements in the Webflow CMS output.
 * For location specific events loading, the further query is done by supplying the `location_id` parameter.
 *
 * Location images are also fetched from the Webflow CMS collection tagged as x-ref `locationList`
 *
 * Component name - `filterEventsLocations`
 */

import EventQuery from '$api/eventQuery';
import type { APIResponse, QueryParams } from '$api/eventQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import {
  getDays,
  getEventDateRange,
  getTestsList,
  getTimeRange,
  getTimings,
} from '$utils/getDateTime';
import isMultiDayEvent from '$utils/isMultiDayEvent';
import { setEventQueryFromAttr } from '$utils/setEventQueryFromAttr';
import { FILTER_STORE_NAME } from '$utils/storeNames';

/**
 * Individual location structure
 */
interface FilterEventsLocation {
  id: number; // id of the location
  name: APIResponse['location_name']; // name of the location
  address: APIResponse['address']; // address of the location
  directions: APIResponse['google_maps_url']; // url to the location
  events: APIResponse[]; // list of events in the location
  moreEventsLoading: boolean; // loading state for the events in the location
  eventsDepleted: boolean; // tracking whether we have any more events to show or not
}

interface FilterEventsLocationsComponent {
  /**
   * Events grouped by locations
   */
  locations: FilterEventsLocation[] | [];
  isLoading: boolean;
  areEventsAvailable: boolean;
  isQueryError: boolean;
  /**
   * API body to be sent to the server for locations query
   */
  apiBody: QueryParams;
  /**
   * Dynamic loop key for events within a given location
   */
  filterLocationItemAttr: { ':key'(): number };
  /**
   * Dynamic loop key for events within a given location
   */
  filterLocationEventsItemAttr: { ':key'(): number };
  /**
   * Set location image from the CMS Collection. Also disables default responsive images
   */
  locationImageAttr: object;
  /**
   * Sync API body with filter store data
   */
  setAPIQueryFilters(): void;
  processQuery(): Promise<void>;
  /**
   * Populates more events for given locations when not enough are assigned
   */
  fillInitEvents(): Promise<void>;
  /**
   * Return the days on which the events are held for the given location
   */
  getGroupedDays(location_id: number): Promise<string>;
  /**
   * Return the timings of the day for which the events are held for the given location
   */
  getGroupedTimings(location_id: number): Promise<string>;
  /**
   * The group of tests for the events in the given location
   */
  getGroupedTests(location_id: number): Promise<string>;
  /**
   * Loading more events matching the criteria and filters for the given location
   * @param location_id the id of the location in the locations array
   * @param limit number of events to fetch
   * @param loadExtraEvent boolean loading an extra event to check if there are enough events to load more
   */
  viewMoreEvents(location_id: number, limit?: number, loadExtraEvent: boolean): Promise<void>;
  getTimeRange(start: string, end: string, includeTimezone: boolean): string;
  getEventDateRange(event: APIResponse): string;
  isMultiDayEvent(event: APIResponse): boolean;
  getLocationArrayByID(location_id: number): FilterEventsLocation | undefined;
}

window.addEventListener('alpine:init', () => {
  window.Alpine.data('filterEventsLocations', function () {
    /**
     * Array of Alpine effects to released on destroy
     */
    const effectWatchers: unknown[] = [];
    const EVENT_LIMIT_PER_LOCATION = 6;

    return {
      isLoading: false,
      isQueryError: false,
      areEventsAvailable: true,

      locations: [],

      apiBody: {
        category: ['practice_test'],
        start: 0,
        limit: 30,
        is_online: false,
        timezone: dayjs().format('Z'),
      },

      filterLocationItemAttr: {
        [':key'](): number {
          return this.location.id;
        },
      },

      filterLocationEventsItemAttr: {
        [':key']() {
          return this.event.id;
        },
      },

      locationImageAttr: {
        [':src']() {
          const defaultImageSrc = this.$el.getAttribute('src');

          const locationImageEL: HTMLElement | null = this.$refs.locationList?.querySelector(
            `img[location_id="${this.location.id}"]`
          );

          // return the image src if available, else return null
          if (locationImageEL) {
            return locationImageEL.getAttribute('src') || defaultImageSrc;
          }

          return defaultImageSrc;
        },

        // Disable responsive image tags
        ['srcset']: '',
        ['sizes']: '',
      },

      async init(): Promise<void> {
        await this.$nextTick();

        setEventQueryFromAttr(this.$refs.componentEl, this);

        effectWatchers.push(
          window.Alpine.effect(() => {
            this.setAPIQueryFilters();

            // wait for DOM to update. wrapped in anonymous function to avoid watching properties of `processQuery()`
            this.$nextTick(() => {
              this.processQuery();
            });
          })
        );
      },

      destroy() {
        // remove all component effects
        effectWatchers.forEach((effect: any) => {
          window.Alpine.release(effect);
        });
      },

      setAPIQueryFilters(): void {
        const filterStore = this.$store[FILTER_STORE_NAME];
        this.apiBody.topics = filterStore.testTopics;
        this.apiBody.after = filterStore.start_date;
        this.apiBody.before = filterStore.end_date;
        this.apiBody.extended_time_available = filterStore.extended_time_available;
        this.apiBody.test_date = filterStore.test_date;
        this.apiBody.days_of_week = filterStore.days_of_week;
      },

      async processQuery(): Promise<void> {
        this.areEventsAvailable = true;
        this.isLoading = true;
        this.isQueryError = false;
        this.locations = [];

        const eventsData = (await new EventQuery(this.apiBody).getQueryData()) as
          | APIResponse[]
          | []
          | null;

        this.isLoading = false;

        if (!eventsData) {
          this.isQueryError = true;
          return;
        }

        if (!eventsData.length) {
          this.areEventsAvailable = false;
          return;
        }

        // Group events by location
        const locations: FilterEventsLocation[] = (eventsData as APIResponse[]).reduce(
          (locationsList: FilterEventsLocation[], event: APIResponse) => {
            // skip events that don't have a location ID
            if (!event.location_id) {
              return locationsList;
            }

            const existingLocation = locationsList.find(
              (location) => location.id === event.location_id
            );
            if (existingLocation) {
              if (existingLocation.events.length < EVENT_LIMIT_PER_LOCATION) {
                existingLocation.events.push(event);
              } else {
                return locationsList;
              }
            } else {
              locationsList.push({
                id: event.location_id,
                name: event.location_name,
                address: event.address,
                directions: event.google_maps_url,
                events: [event],
                eventsDepleted: false,
                moreEventsLoading: false,
              });
            }
            return locationsList;
          },
          this.locations
        );

        // Sort locations by the order defined in the CMS items
        const locationsOrderNodeList: NodeListOf<HTMLElement> | null =
          this.$refs.locationList?.querySelectorAll('[data-el="collection-item"]');

        if (locationsOrderNodeList) {
          const locationsOrderedIDList = Array.from(locationsOrderNodeList).map((el) =>
            el.getAttribute('location_id')
          );

          locations.sort((a, b) => {
            const aIndex = locationsOrderedIDList.findIndex(
              (location) => location === a.id?.toString()
            );
            const bIndex = locationsOrderedIDList.findIndex(
              (location) => location === b.id?.toString()
            );

            return aIndex - bIndex;
          });
        }

        this.locations = locations;

        this.fillInitEvents();
      },

      async fillInitEvents(): Promise<void> {
        this.locations.forEach((location) => {
          if (EVENT_LIMIT_PER_LOCATION <= location.events.length) {
            return;
          }

          const fillEventsCount = EVENT_LIMIT_PER_LOCATION - location.events.length;

          this.viewMoreEvents(location.id, fillEventsCount, true);
        });
      },

      async getGroupedDays(location_id) {
        const currentLocation = this.getLocationArrayByID(location_id);

        if (!currentLocation) {
          return;
        }

        // wait for DOM to update. Avoids error in case of no events
        await this.$nextTick();
        return getDays(currentLocation.events);
      },

      async getGroupedTimings(location_id) {
        const currentLocation = this.getLocationArrayByID(location_id);

        if (!currentLocation) {
          return;
        }

        // wait for DOM to update. Avoids error in case of no events
        await this.$nextTick();
        return getTimings(currentLocation.events);
      },

      async getGroupedTests(location_id) {
        const currentLocation = this.getLocationArrayByID(location_id);

        if (!currentLocation) {
          return;
        }

        // wait for DOM to update. Avoids error in case of no events
        await this.$nextTick();
        return getTestsList(currentLocation.events);
      },

      async viewMoreEvents(location_id, limit = EVENT_LIMIT_PER_LOCATION, loadExtraEvent = false) {
        const currentLocation = this.getLocationArrayByID(location_id);

        if (!currentLocation) {
          console.warn('No location found to view more events for the Location ID - ', location_id);
          return;
        }

        // create new API request body request object
        const API_BODY = { ...this.apiBody };
        API_BODY.location_id = currentLocation.id;
        API_BODY.start = currentLocation.events.length;
        API_BODY.limit = loadExtraEvent ? limit + 1 : limit;

        currentLocation.moreEventsLoading = true;

        const responseData = (await new EventQuery(API_BODY).getQueryData()) as APIResponse[] | [];

        currentLocation.moreEventsLoading = false;

        if (
          !responseData.length ||
          (limit === EVENT_LIMIT_PER_LOCATION && responseData.length < EVENT_LIMIT_PER_LOCATION) ||
          (loadExtraEvent && responseData.length <= limit)
        ) {
          currentLocation.eventsDepleted = true;
        }

        if (!responseData.length) {
          return;
        }

        if (loadExtraEvent && responseData.length > limit) {
          // remove the extra event from being shown in the UI
          responseData.pop();
        }

        currentLocation.events.push(...responseData);
      },

      getTimeRange(start, end, includeTimeZone = true) {
        return getTimeRange(start, end, includeTimeZone);
      },

      getEventDateRange(event) {
        return getEventDateRange(event);
      },

      isMultiDayEvent(event) {
        return isMultiDayEvent(event);
      },

      getLocationArrayByID(location_id) {
        return this.locations.find((location) => location.id === location_id);
      },
    } as ApplerouthAlpineComponent<FilterEventsLocationsComponent>;
  });
});
