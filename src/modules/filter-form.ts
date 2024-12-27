/**
 * Contains inputs for the filtering system used on the Practice Tests (`/events/practice-tests`) and Group Classes (`/events/group-classes`) pages.
 * Sets the value of the `filters` store to the respective values of the inputs.
 *
 * Alpine Component Name - `filterEventsForm`
 *
 * Input references:
 * - `testsRadioGroup` - Checkbox group for the tests
 * - `locationRadioGroup` - Checkbox for location (online or in-person)
 * - `dateRangePicker` - Date range picker for the date range
 * - `etCheckbox` - Checkbox for extended time
 * - `testDatePicker` - Date picker for the test date
 * - `weekdayCheckboxGroup` - Checkbox group for the days of the week
 */

/* eslint-disable @typescript-eslint/no-this-alias */

import type { Core as EasePickCore } from '@easepick/core';
import { easepick } from '@easepick/core';
import { LockPlugin } from '@easepick/lock-plugin';
import { RangePlugin } from '@easepick/range-plugin';

import type { DaysOfWeek, QueryParams } from '$api/eventQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { getQueryParam, setQueryParam } from '$utils/queryParamOps';
import { FILTER_STORE_NAME } from '$utils/storeNames';

import type { FilterAlpineStore } from './filter-store';

interface filterEventsFormComponent {
  initializeDatePickers(): void;
  /**
   * Triggered on form change event from the frontend attribute
   */
  updateStore(): void;
  processTestQueryParam(): void;
  getTestName(): string;
  getTestTopics(): QueryParams['topics'];
  getSelectedTestDate(): QueryParams['test_date'];
  getLocation(): boolean | '';
  getCheckedWeekdays(): DaysOfWeek[] | undefined;
  getETCheckboxValue(): QueryParams['extended_time_available'];
  updateDateRange(
    start_date: FilterAlpineStore['start_date'],
    end_date: FilterAlpineStore['end_date']
  ): void;
  clearDateRange(): void;
  clearTestDate(): void;
  clearTest(): void;
  clearWeekdays(): void;
  getTestRadioGroupEl(): HTMLElement | undefined;
}

// Initialize form component
window.addEventListener('alpine:init', () => {
  window.Alpine.data('filterEventsForm', function () {
    const testQueryParamID = 'test';
    /**
     * Reference to the date range picker
     */
    let dateRangeInstance: EasePickCore;

    const EASEPICK_CORE_CSS = 'https://cdn.jsdelivr.net/npm/@easepick/core@1.2.1/dist/index.css';
    const EASEPICK_RANGE_CSS =
      'https://cdn.jsdelivr.net/npm/@easepick/range-plugin@1.2.1/dist/index.css';
    const EASEPICK_LOCK_CSS =
      'https://cdn.jsdelivr.net/npm/@easepick/lock-plugin@1.2.1/dist/index.css';

    return {
      init() {
        this.initializeDatePickers();
        this.processTestQueryParam();

        // update store initially on page load
        this.updateStore();
      },

      initializeDatePickers() {
        // Date range picker
        const dateRangePickerEl: HTMLElement | null = this.$refs.dateRangePicker;
        if (dateRangePickerEl) {
          dateRangeInstance = new easepick.create({
            element: dateRangePickerEl,
            css: [EASEPICK_CORE_CSS, EASEPICK_RANGE_CSS, EASEPICK_LOCK_CSS],
            calendars: 2,
            format: 'MMM DD YYYY',
            grid: 2,
            plugins: [RangePlugin, LockPlugin],
            zIndex: 10,
            RangePlugin: {
              // startDate: new Date(),
              tooltip: false,
            },
            LockPlugin: {
              minDate: new Date(), // limit minimum date selection to today
            },
            setup: (picker: EasePickCore) => {
              picker.on('select', () => {
                // update the store on change of date range
                this.updateDateRange(picker.getStartDate(), picker.getEndDate());
              });
              picker.on('clear', () => {
                this.updateDateRange(undefined, undefined);
              });
            },
          });
        }
      },

      async updateStore() {
        // wait for Alpine components to finish DOM render
        await this.$nextTick();

        const testName = this.getTestName();
        const testTopics = this.getTestTopics();

        // update the query param
        setQueryParam(testQueryParamID, testName);

        this.$store[FILTER_STORE_NAME].testName = testName;
        this.$store[FILTER_STORE_NAME].testTopics = testTopics;
        this.$store[FILTER_STORE_NAME].test_date = this.getSelectedTestDate();
        this.$store[FILTER_STORE_NAME].is_online = this.getLocation();
        this.$store[FILTER_STORE_NAME].extended_time_available = this.getETCheckboxValue();
        this.$store[FILTER_STORE_NAME].days_of_week = this.getCheckedWeekdays();
      },

      processTestQueryParam() {
        const testQueryParamValue = getQueryParam(testQueryParamID);

        const testRadioGroupEl = this.getTestRadioGroupEl();

        if ('' !== testQueryParamValue) {
          const radioEl = testRadioGroupEl?.querySelector<HTMLInputElement>(
            `input[data-name="${testQueryParamValue}"]`
          );
          if (radioEl) {
            radioEl.click();

            const radioChangeEvent = new Event('change', { bubbles: true });
            radioEl.dispatchEvent(radioChangeEvent);
          } else {
            console.warn(
              `Test radio button with the value "${testQueryParamValue}" not found in the form`
            );
          }
        }
      },

      getTestName() {
        const defaultTest = '';

        const testRadioGroupEl = this.getTestRadioGroupEl();

        const selectedTest: string | undefined = testRadioGroupEl?.querySelector<HTMLInputElement>(
          'input[name="test"]:checked'
        )?.dataset.name;

        return selectedTest || defaultTest;
      },

      getTestTopics() {
        let topicsArray: QueryParams['topics'] = undefined;

        const testRadioGroupEl = this.getTestRadioGroupEl();
        const selectedTest = testRadioGroupEl?.querySelector<HTMLInputElement>(
          'input[name="test"]:checked'
        );

        const selectedTestTopics: string | undefined = selectedTest?.dataset.topics;

        if (!selectedTestTopics) {
          console.warn('No test topics selected', selectedTest);
          return undefined;
        }

        try {
          topicsArray = JSON.parse(`[${selectedTestTopics}]`);
        } catch (e) {
          console.warn(
            'Failed to parse the filter test topics. Please check the proper format of topic IDs entry in the CMS Collection',
            e,
            selectedTest?.dataset.name,
            { selectedTestTopics }
          );
        }

        return topicsArray;
      },

      getLocation() {
        const defaultLocation = '';

        const selectedLocation: string | undefined =
          this.$refs.locationRadioGroup?.querySelector<HTMLInputElement>(
            'input[name="location"]:checked'
          )?.value;

        return selectedLocation || defaultLocation;
      },

      getCheckedWeekdays() {
        const checkedWeekdays: Set<DaysOfWeek> = new Set();

        const checkedWeekdaysEl: NodeListOf<HTMLInputElement> =
          this.$refs.weekdayCheckboxGroup.querySelectorAll('input[name="weekday_group[]"]:checked');

        checkedWeekdaysEl.forEach((el) => {
          checkedWeekdays.add(el.value as DaysOfWeek);
        });

        if (!checkedWeekdaysEl.length) {
          return undefined;
        }

        return [...checkedWeekdays];
      },

      getETCheckboxValue() {
        if (!this.$refs.etCheckbox) {
          return undefined;
        }

        const checkboxEl = this.$refs.etCheckbox as HTMLInputElement;
        return checkboxEl.checked || undefined;
      },

      getSelectedTestDate() {
        const selectEl = this.$refs.testDateSelect as HTMLSelectElement;
        if (!selectEl) {
          return undefined;
        }

        const selectedTestDate = selectEl.value;

        if ('' === selectedTestDate) {
          return undefined;
        }

        return dayjs(`${selectedTestDate} 00:00:00 UTC`).utc().format() || undefined;
      },

      updateDateRange(start_date: Date, end_date: Date) {
        this.$store[FILTER_STORE_NAME].start_date = start_date;
        this.$store[FILTER_STORE_NAME].end_date = end_date;
      },

      clearDateRange() {
        dateRangeInstance.clear();
      },

      async clearTestDate() {
        if (!this.$refs.testDateSelect) {
          return;
        }

        const selectEl = this.$refs.testDateSelect as HTMLSelectElement;
        selectEl.selectedIndex = 0;

        await this.$nextTick;
        this.updateStore();
      },

      clearTest() {
        setQueryParam(testQueryParamID, null);
        window.location.reload();
      },

      clearWeekdays() {
        const checkedWeekdaysEl: NodeListOf<HTMLInputElement> =
          this.$refs.weekdayCheckboxGroup.querySelectorAll('input[name="weekday_group[]"]:checked');

        checkedWeekdaysEl.forEach((checkedWeekdayEl) => {
          // click is required to trigger visual changes on the Webflow form checkbox
          // simple `checked = false` on the checkbox does not trigger the visual `checked` state updates
          checkedWeekdayEl.click();
        });
      },

      getTestRadioGroupEl() {
        return this.$refs.testsRadioGroup;
      },
    } as ApplerouthAlpineComponent<filterEventsFormComponent>;
  });
});
