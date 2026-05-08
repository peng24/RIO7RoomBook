export interface Booking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  room: string;
  user: string;
  description?: string;
  fileUrl?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
}
