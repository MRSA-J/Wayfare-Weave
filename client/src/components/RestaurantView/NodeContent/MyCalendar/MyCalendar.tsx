import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import { Calendar, Views, DateLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
// import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import "react-big-calendar/lib/addons/dragAndDrop/styles.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./MyCalendar.scss";
const DragAndDropCalendar = withDragAndDrop(Calendar);
import { Event } from "react-big-calendar";
import { SlotInfo } from "react-big-calendar";
import { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { useRecoilValue, useRecoilState } from "recoil";
import { refreshState, userState } from "~/global/Atoms";
import { IEvent } from "~/types";
import { formatDate } from "~/components/Modals/ScheduleModal/Schedule";
import { IUserProperty } from "~/types/IUserProperty";
import { makeIUserProperty } from "~/types/IUserProperty";
import { FrontendUserGateway } from "~/users";
interface ICalendarProps {
  localizer: DateLocalizer;
}
export const MyCalendar = (props: ICalendarProps) => {
  const { localizer } = props;
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [user, setUser] = useRecoilState(userState);
  const [refresh, setRefresh] = useRecoilState(refreshState);
  useEffect(() => {
    if (user) {
      const events: Event[] = [];
      user.events.map((e) => {
        events.push({
          start: new Date(e.start),
          end: new Date(e.end),
          title: e.title,
        });
      });
      setMyEvents(events);
    }
  }, [user, refresh]);

  const handleUpdate = async (events: Event[]) => {
    if (user) {
      const newEvents: IEvent[] = [];
      events.map((e) =>
        newEvents.push({
          start: e.start as Date,
          end: e.end as Date,
          title: e.title as string,
        })
      );

      const properties: IUserProperty[] = [];
      properties.push(makeIUserProperty("events", newEvents));
      const resp = await FrontendUserGateway.updateUserInfo(
        user.userId,
        properties
      );

      if (!resp.success) {
        console.error("Failed to update user in the backend:", resp.message);
      }
      const newUser = { ...user, events: newEvents };
      setUser(newUser);
      setRefresh(!refresh);
    }
  };
  const handleDragAndDrop = async (args: EventInteractionArgs<Event>) => {
    // const event = args.event;
    if (selectedEvent != null) {
      const start =
        args.start instanceof Date ? args.start : new Date(args.start);
      const end = args.end instanceof Date ? args.end : new Date(args.end);
      const title = args.event.title;
      const newEvent: Event = { start: start, end: end, title: title };
      const newEvents = [
        ...myEvents.filter((e) => e != selectedEvent),
        newEvent,
      ];
      handleUpdate(newEvents);
      setMyEvents(newEvents);
      setSelectedEvent(null);
    }
  };

  const handleSelectEvent = async (toDelete: Event) => {
    const res = window.confirm("Are you sure to delete this event?");
    if (res && myEvents.includes(toDelete)) {
      const newEvents = myEvents.filter((e) => e != toDelete);
      handleUpdate(newEvents);
      setMyEvents(newEvents);
    }
    setRefresh(true);
  };
  const defaultDate = useMemo(() => new Date(2023, 11, 9), []);

  const eventStyleGetter = (
    event: Event,
    start: Date,
    end: Date,
    isSelected: boolean
  ) => {
    const newStyle = {
      borderRadius: "0px",
      fontSize: "12px",
    };

    return {
      className: "s",
      style: newStyle,
    };
  };
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  return (
    <Fragment>
      <div className="calendar rbc-events-container">
        <DragAndDropCalendar
          localizer={localizer}
          views={{ month: true, week: false, day: true, agenda: true }}
          defaultDate={defaultDate}
          events={myEvents}
          eventPropGetter={eventStyleGetter}
          onEventDrop={handleDragAndDrop}
          onSelectEvent={(e) => handleSelectEvent(e as Event)}
          onDragStart={(args) => setSelectedEvent(args.event)}
          selectable
        />
      </div>
    </Fragment>
  );
};
MyCalendar.propTypes = {
  localizer: PropTypes.instanceOf(DateLocalizer),
};
