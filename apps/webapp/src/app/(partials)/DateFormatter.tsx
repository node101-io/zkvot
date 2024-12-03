import formatDate from "@/utils/formatDate";

const DateFormatter = ({ date }: { date: Date }) => (
  <span>{formatDate(date)}</span>
);

export default DateFormatter;
