import { format, isToday, isYesterday } from 'date-fns';

export default (date: Date) => {
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMMM d, yyyy, h:mm a');
  }
};
