import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/GoogleAuthContext';
import { fetchEvents, fetchHolidays } from '../services/googleCalendar';

export interface FormattedEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  resource: 'user' | 'holiday';
  allDay?: boolean;
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<FormattedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const [userEvents, holidayEvents] = await Promise.all([
        fetchEvents(accessToken || undefined),
        fetchHolidays()
      ]);

      const formattedUserEvents: FormattedEvent[] = (userEvents || []).map(event => {
        const isAllDay = !event.start?.dateTime;
        const startDate = new Date(event.start?.dateTime || event.start?.date || new Date());
        let endDate = new Date(event.end?.dateTime || event.end?.date || new Date());
        // Google Calendar API returns exclusive end date for all-day events
        // e.g. a 1-day event on May 1 has end = May 2, so subtract 1 day
        if (isAllDay && event.end?.date) {
          endDate = new Date(endDate.getTime() - 1);
        }
        return {
          id: event.id,
          title: event.summary,
          start: startDate,
          end: endDate,
          location: event.location,
          description: event.description,
          resource: 'user' as const,
          allDay: isAllDay,
        };
      });

      const formattedHolidays: FormattedEvent[] = (holidayEvents || []).map(event => {
        const startDate = new Date(event.start?.date || event.start?.dateTime || new Date());
        let endDate = new Date(event.end?.date || event.end?.dateTime || new Date());
        // Same fix for holidays - subtract 1 day from exclusive end date
        if (event.end?.date) {
          endDate = new Date(endDate.getTime() - 1);
        }
        return {
          id: event.id,
          title: event.summary,
          start: startDate,
          end: endDate,
          location: event.location,
          description: event.description,
          resource: 'holiday' as const,
          allDay: true,
        };
      });

      setEvents([...formattedUserEvents, ...formattedHolidays]);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Helper: get today's events (user events only, not holidays)
  const todayEvents = events.filter(e => {
    if (e.resource === 'holiday') return false;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return e.start >= startOfDay && e.start <= endOfDay;
  });

  // Helper: get events happening right now
  const activeEvents = events.filter(e => {
    if (e.resource === 'holiday') return false;
    const now = new Date();
    return e.start <= now && e.end >= now;
  });

  // Helper: get upcoming events (from now onward, sorted by start time, max 5)
  const upcomingEvents = events
    .filter(e => {
      if (e.resource === 'holiday') return false;
      return e.start >= new Date();
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  return {
    events,
    loading,
    todayEvents,
    activeEvents,
    upcomingEvents,
    refresh: loadEvents,
  };
}
