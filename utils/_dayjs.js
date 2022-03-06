import dayjs from "dayjs";
const weekOfYear = require('dayjs/plugin/weekOfYear'),
      utc = require('dayjs/plugin/utc'),
      isToday = require('dayjs/plugin/isToday');
dayjs.extend(weekOfYear);
dayjs.extend(utc);
dayjs.extend(isToday);

export default dayjs;

export function getNowDayjs() {
  return dayjs.utc().add(8, 'hour');
}

export function getNow() {
  return getNowDayjs().toDate().getTime();
}
