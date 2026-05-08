import React from 'react';
import MyCalendar from '../components/Calendar';
import QuickBook from '../components/QuickBook';
import { useAuth } from '../context/GoogleAuthContext';

const BookingCalendar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex gap-8 h-full">
      <div className="flex-1 min-w-0">
        <MyCalendar />
      </div>
      {isAuthenticated && <QuickBook />}
    </div>
  );
};

export default BookingCalendar;
