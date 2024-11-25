import React from 'react';

import formatDate from '@/utils/formatDate.js';

const FormattedDate = (dateString: string) => (
  <span>{ formatDate(dateString) }</span>
);

export default FormattedDate;
