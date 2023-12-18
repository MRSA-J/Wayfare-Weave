import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];
import { SetStateAction, useState } from "react";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { Dispatch } from "react";
interface IScheduleProps {
  date: Value;
  setDate: Dispatch<SetStateAction<Value>>;
  setFrom: Dispatch<SetStateAction<Date>>;
  setTo: Dispatch<SetStateAction<Date>>;
}
export const formatDate = (date: Date) => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + " " + ampm;
};
export const formatDateString = (date: string) => {
  const now = new Date(0, 0, 0, 0, 0);
  const [time, modifier] = date.split(" ");
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);

  // Convert 12-hour time format to 24-hour time format
  if (modifier === "PM" && hour < 12) {
    hour += 12;
  } else if (modifier === "AM" && hour === 12) {
    hour = 0;
  }
  now.setHours(hour, minute, 0); // Set hours and minutes, reset seconds to 0
  return now;
};
const formDateArray = (from: Date, to: Date, skipFirst: boolean): string[] => {
  const startTime = new Date(from);
  const endTime = new Date(to);
  if (skipFirst) {
    startTime.setMinutes(startTime.getMinutes() + 30);
  } else {
    endTime.setMinutes(endTime.getMinutes() - 30);
  }
  const arr: string[] = [];
  for (
    let time = new Date(startTime);
    time <= endTime;
    time.setMinutes(time.getMinutes() + 30)
  ) {
    arr.push(formatDate(new Date(time)));
  }
  return arr;
};
export const Schedule = (props: IScheduleProps) => {
  const { date, setDate, setFrom, setTo } = props;
  const from = new Date(0, 0, 0, 0, 0);
  const to = new Date(0, 0, 0, 23, 30);
  const fromOptions = formDateArray(from, to, false);
  const toOptions = formDateArray(from, to, true);
  return (
    <div>
      <div>
        <Calendar
          onChange={setDate}
          value={date}
          tileDisabled={({ date, view }) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return view === "month" && date < today;
          }}
        />
      </div>
      <div>
        <FormControl mt={4}>
          <FormLabel>
            <strong>From</strong>
          </FormLabel>
          <Select
            onChange={(event) => {
              setFrom(formatDateString(event.target.value));
            }}
            defaultValue={formatDate(new Date(0, 0, 0, 18, 30))}
          >
            {fromOptions.map((time, key) => (
              <option key={key}>{time}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>
            <strong>To</strong>
          </FormLabel>
          <Select
            onChange={(event) => {
              setTo(formatDateString(event.target.value));
            }}
            defaultValue={formatDate(new Date(0, 0, 0, 19, 30))}
          >
            {toOptions.map((time, key) => (
              <option key={key}>{time}</option>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};
