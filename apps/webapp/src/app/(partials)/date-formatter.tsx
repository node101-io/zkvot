import formatDate from '@/utils/formatDate';

const DateFormatter = ({ date } : {
  date: Date | undefined;
}) => (
  <>
    {date ?
      <span>{ formatDate(date) }</span> :
      <span>{'loading...'}</span>
    }
  </>
);

export default DateFormatter;
