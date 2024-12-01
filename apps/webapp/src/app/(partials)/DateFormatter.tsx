import formatDate from '@/utils/formatDate.js';

const DateFormatter = ({ date } : {
  date: Date;
}) => (
  <span>{ formatDate(date) }</span>
);

export default DateFormatter;
