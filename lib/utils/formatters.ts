export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', '₹');
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateToYYYYMMDD = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getCurrentDate = () => {
  const today = new Date().toISOString();
  let currentDate = new Date(today);
  // currentDate.setMonth(currentDate.getMonth() + 1); // move to next month
  currentDate.setDate(currentDate.getDate() + 20); // add 4 days to the current date
  return currentDate;
};

export const formatDateForAPI = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatCategory = (cat: string) => {
  return cat
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Get next month's rent start date (1st of next month)
export const getNextMonthRentStartDate = (): Date => {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return nextMonth;
};


// Calculate next month's rent period based on existing rent record dates
export const getNextMonthRentPeriodFromRecord = (rentRecord: any) => {

  // Parse the existing rent record dates
  const currentStartDate = new Date(rentRecord.startDate);
  const currentEndDate = new Date(rentRecord.endDate);

  // Calculate the next month's start date (same day of month, next month)
  const nextStartDate = new Date(
    currentStartDate.getFullYear(),
    currentStartDate.getMonth() + 1,
    currentStartDate.getDate()
  );

  // Calculate the next month's end date (same day of month, next month)
  const nextEndDate = new Date(
    currentEndDate.getFullYear(),
    currentEndDate.getMonth() + 1,
    currentEndDate.getDate()
  );

  return {
    startDate: nextStartDate,
    endDate: nextEndDate,
    startDateString: formatDateForAPI(nextStartDate),
    endDateString: formatDateForAPI(nextEndDate),
  };
};