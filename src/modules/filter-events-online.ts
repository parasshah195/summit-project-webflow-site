/**
 * A list of online events based on the defined filters on practice test (located at `/events/practice-test`) and group class pages (located at `/events/group-classes`)
 *
 * Components - `filterEventsOnline` and `filterEventsOnlineOnDemand`
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
import { setGeoStoreWatcher } from '$utils/setGeoStoreWatcher';
import { FILTER_STORE_NAME, GEOLOCATION_STORE_NAME } from '$utils/storeNames';

import type { FilterAlpineStore } from './filter-store';

interface EventsScheduledComponent {
  /**
   * Loading state for the event query
   */
  isLoading: boolean;
  /**
   * Tracking whether we have any event locations to show at all or not
   */
  areEventsAvailable: boolean;
  isQueryError: boolean;
  apiBody: QueryParams;
  events: APIResponse[];
  moreEventsLoading: boolean;
  eventsDepleted: boolean;
  /**
   * Dynamic loop key for event item
   */
  filterOnlineEventsItemAttr: { ':key'(): number };
  init(): void;
  /**
   * Runs when a component is destroyed (for e.g: by `x-if` condition)
   * NOTE: This function is not documented in Alpine Docs, but has been present since long
   * @link: https://github.com/alpinejs/alpine/discussions/3654#discussioncomment-6423075
   */
  destroy(): void;
  /**
   * Set API body to link to filter store data
   * Done from individual component instead of parent class for Alpine to be able to listen to the store changes and update the results
   */
  setAPIQueryFilters(): void;
  /**
   * Initiates the query
   */
  processQuery(): Promise<void>;
  /**
   * Sends the query to the API and populates the locations in the list
   */
  sendQuery(): Promise<void>;
  getGroupedDays(): string;
  getGroupedTimings(): string;
  getGroupedTests(): string;
  viewMoreEvents(): Promise<void>;
  getTimeRange(start: string, end: string, includeTimeZone: boolean): string;
  getEventDateRange(event: APIResponse): string;
  isMultiDayEvent(event: APIResponse): boolean;
}

interface EventsOnDemandComponent {
  filterName: undefined | FilterAlpineStore['testName'];
  filterEventCount: number;
  eventRowsElList: undefined | NodeListOf<HTMLElement>;
  eventNamesElList: undefined | NodeListOf<HTMLElement>;
  init(): void;
  destroy(): void;
  setFilterStoreWatcher(): void;
}

window.addEventListener('alpine:init', () => {
  /**
   * Number of events to load at once
   */
  const BATCH_COUNT = 6;

  window.Alpine.data('filterEventsOnline', function () {
    /**
     * Array of Alpine effects to released on destroy
     */
    const effectWatchers = [];

    return {
      isLoading: false,
      areEventsAvailable: true,
      isQueryError: false,

      events: [],

      moreEventsLoading: false,
      eventsDepleted: false,

      apiBody: {
        category: ['practice_test'],
        market: window.Alpine.store(GEOLOCATION_STORE_NAME).market_id,
        start: 0,
        limit: 6,
        is_online: true,
        timezone: dayjs().format('Z'),
      },

      filterOnlineEventsItemAttr: {
        [':key']() {
          return this.event.id;
        },
      },

      async init(): Promise<void> {
        await this.$nextTick();

        // set the query params from the component attributes
        setEventQueryFromAttr(this.$refs.componentEl, this);

        this.apiBody.limit = BATCH_COUNT;

        effectWatchers.push(
          window.Alpine.effect(() => {
            this.setAPIQueryFilters();

            this.$nextTick(() => {
              this.processQuery();
            });
          })
        );

        setGeoStoreWatcher(this, () => {
          this.setAPIQueryFilters();
          this.processQuery();
        });
      },

      destroy() {
        effectWatchers.forEach((effect) => {
          window.Alpine.release(effect);
        });
      },

      setAPIQueryFilters(): void {
        const filterStore: FilterAlpineStore = this.$store[FILTER_STORE_NAME];

        this.apiBody.topics = filterStore.testTopics;
        this.apiBody.after = filterStore.start_date;
        this.apiBody.before = filterStore.end_date;
        this.apiBody.extended_time_available = filterStore.extended_time_available;
        this.apiBody.test_date = filterStore.test_date;
        this.apiBody.days_of_week = filterStore.days_of_week;
      },

      async processQuery(): Promise<void> {
        this.events = [];

        this.areEventsAvailable = true;
        this.eventsDepleted = false;

        this.apiBody.start = 0;

        this.isLoading = true;
        await this.sendQuery();
        this.isLoading = false;
      },

      async sendQuery(): Promise<void> {
        this.isQueryError = false;

        const eventsData = (await new EventQuery(this.apiBody).getQueryData()) as
          | APIResponse[]
          | [];

        if (!eventsData) {
          this.isQueryError = true;
          return;
        }

        if (!eventsData.length) {
          this.areEventsAvailable = false;
          return;
        }

        this.events.push(...eventsData);

        // wait for events update in DOM
        await this.$nextTick();

        if (eventsData.length < BATCH_COUNT) {
          this.eventsDepleted = true;
        }
      },

      getGroupedDays() {
        return getDays(this.events);
      },

      getGroupedTimings() {
        return getTimings(this.events);
      },

      getGroupedTests() {
        return getTestsList(this.events);
      },

      async viewMoreEvents() {
        if (!this.apiBody.start) {
          this.apiBody.start = 0;
        }

        this.moreEventsLoading = true;

        this.apiBody.start += BATCH_COUNT;

        await this.sendQuery();

        this.$nextTick(() => {
          this.moreEventsLoading = false;
        });
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
    } as ApplerouthAlpineComponent<EventsScheduledComponent>;
  });

  window.Alpine.data('filterEventsOnlineOnDemand', function () {
    const effectWatchers = [];
    let defaultRowDisplayValue = 'grid';

    return {
      filterName: undefined,
      filterEventCount: 0,
      eventRowsElList: undefined,
      eventNamesElList: undefined,

      async init() {
        await this.$nextTick();

        this.eventRowsElList =
          this.$refs.eventsListEl?.querySelectorAll<HTMLElement>('[data-event-row]');
        this.eventNamesElList =
          this.$refs.eventsListEl?.querySelectorAll<HTMLElement>('[data-event-name]');

        if (this.eventRowsElList) {
          defaultRowDisplayValue = this.eventRowsElList[0].style.display;
        }

        effectWatchers.push(
          window.Alpine.effect(() => {
            this.setFilterStoreWatcher();
          })
        );
      },

      destroy() {
        effectWatchers.forEach((effect) => {
          window.Alpine.release(effect);
        });
      },

      setFilterStoreWatcher() {
        this.filterName = this.$store[FILTER_STORE_NAME].testName;
        this.filterEventCount = 0;

        if (!this.eventRowsElList || !this.eventRowsElList.length) {
          return;
        }

        this.eventRowsElList.forEach((eventRowEl: HTMLElement) => {
          eventRowEl.style.display = defaultRowDisplayValue;
        });

        const filterNameWordMatchRegex = new RegExp(`\\b${this.filterName}\\b`, 'gi');

        this.eventNamesElList?.forEach((eventNameEl: HTMLElement, index: number) => {
          if (!eventNameEl.innerText.match(filterNameWordMatchRegex)) {
            this.eventRowsElList[index].style.display = 'none';
          } else {
            this.filterEventCount += 1;
          }
        });
      },
    } as ApplerouthAlpineComponent<EventsOnDemandComponent>;
  });
});
