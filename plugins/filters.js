import Vue from 'vue'
import dayjs from "~/utils/_dayjs";

Vue.filter('time', stamp => {
  const dayOld = dayjs.utc(stamp);
  const dayNew = dayjs.utc();
  const subDay = dayNew.diff(dayOld, 'day');
  const subWeek = dayNew.diff(dayOld, 'week');
  const subMonth = dayNew.diff(dayOld, 'month');
  const subYear = dayNew.diff(dayOld, 'year');
  if (dayOld.isToday()) {
    return '今天'
  }
  if (subWeek < 1) {
    return `${subDay+1}天前`
  }
  if (subMonth < 1) {
    return `${subWeek}周前`
  }
  if (subYear < 1) {
    return `${subMonth}个月前`
  }
  return `${subYear}年前`
})

Vue.filter('formattime', stamp => {
  return dayjs.utc(stamp).format('YYYY-MM-DD HH:mm:ss');
})
