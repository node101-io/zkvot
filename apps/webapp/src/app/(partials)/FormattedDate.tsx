import React from "react";

import { formatDate } from "@/utils/dateFormatter";

const FormattedDate = ({ dateString }) => {
  return <span>{formatDate(dateString)}</span>;
};

export default FormattedDate;
