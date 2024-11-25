import { format, parseISO, isToday, isYesterday } from "date-fns";

export default (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMMM d, yyyy, h:mm a");
    }
  } catch (error) {
    console.error("Invalid date:", dateString);
    return dateString;
  }
};
