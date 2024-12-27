import type { APIResponse as EventsAPIResponse } from '$api/eventQueryTypes';

export default function isMultiDayEvent(event: EventsAPIResponse) {
  if ('class' !== event.type || !event.class_schedule) {
    return false;
  }

  if (1 >= event.class_schedule.sessions_count) {
    return false;
  }

  return true;
}
