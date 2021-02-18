import { useMemo } from "react";
import "tailwindcss/tailwind.css";
import fs from "fs/promises";
import path from "path";
import {
  parse,
  add,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import React, { useState, useEffect, useRef } from "react";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const dateToText = (date) => {
  const arr = [];
  const currDate = new Date();
  const months = differenceInMonths(new Date(), currDate);
  const monthDate = add(date, {
    months,
  });
  if (months !== 0) arr.push(`${months} months`);

  const days = differenceInDays(currDate, monthDate);
  const dayDate = add(monthDate, {
    days,
  });
  if (days !== 0) arr.push(`${days} days`);

  const hours = differenceInHours(currDate, dayDate);
  const hourDate = add(dayDate, {
    hours,
  });
  if (hours !== 0) arr.push(`${hours} hours`);

  const minutes = differenceInMinutes(currDate, hourDate);
  const minuteDate = add(hourDate, {
    minutes,
  });
  if (minutes !== 0) arr.push(`${minutes} minutes`);

  const seconds = differenceInSeconds(currDate, minuteDate);
  if (seconds !== 0) arr.push(`${seconds} seconds`);
  return arr.join(", ");
};

const HeaderDate = ({ date }) => {
  const [text, setText] = useState("");

  useInterval(() => {
    setText(dateToText(date));
  }, 1000);

  return <span>{text} ago</span>;
};

export default function Home({ json }) {
  const parsed = useMemo(
    () => json.map((item) => ({ ...item, date: parseDate(item.date) })),
    []
  );

  return (
    <div className="w-full h-screen flex justify-center flex-col items-center text-center">
      <h1 className="text-xl font-semibold text-gray-900">
        When did my car last turn off while I was driving it?
      </h1>
      <h2 className="text-4xl font-bold mt-6">
        <HeaderDate date={parsed[0].date} />
      </h2>
      <h3 className="mt-3 text-xl text-gray-800">
        on {format(parsed[0].date, "MMMM co, yyyy 'at' hh:mm a")}
      </h3>
      <p className="max-w-xs mt-8 text-gray-500">{parsed[0].comment}</p>
    </div>
  );
}

const parseDate = (date) =>
  zonedTimeToUtc(
    parse(date, "MM-dd-yyyy hh:mm a", new Date()),
    "America/Chicago"
  );

export const getStaticProps = async () => {
  const filePath = path.join(
    path.resolve(process.cwd(), "pages"),
    "../events.json"
  );
  const file = await fs.readFile(filePath);
  const json = Array.from(JSON.parse(file)).sort(
    (a, b) => parseDate(a.date) - parseDate(b.date)
  );

  return {
    props: {
      json,
    },
  };
};
