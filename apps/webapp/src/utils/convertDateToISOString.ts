export default (date: Date) => {
  if (isNaN(date.getTime()))
    return '';

  return date.toISOString().slice(0, 16);
};
