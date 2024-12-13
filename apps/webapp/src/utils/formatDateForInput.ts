const formatDateForInput = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";

  const pad = (n: number): string => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default formatDateForInput;
