import { useState, useEffect, useCallback } from 'react';
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

let globalEventsCache: FormattedEvent[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useCalendarEvents() {
  const [events, setEvents] = useState<FormattedEvent[]>(globalEventsCache);
  const [loading, setLoading] = useState(globalEventsCache.length === 0);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async (force = false) => {
    if (!force && globalEventsCache.length > 0 && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      setEvents(globalEventsCache);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Load both in parallel but catch errors individually to prevent total failure
      const [userEventsResult, holidayEventsResult] = await Promise.allSettled([
        fetchEvents(),
        fetchHolidays()
      ]);

      let allFormattedEvents: FormattedEvent[] = [];

      if (userEventsResult.status === 'fulfilled') {
        const formattedUsers = (userEventsResult.value || []).map(event => {
          const isAllDay = !event.start?.dateTime;
          const startDate = new Date(event.start?.dateTime || event.start?.date || new Date());
          let endDate = new Date(event.end?.dateTime || event.end?.date || new Date());
          if (isAllDay && event.end?.date) endDate = new Date(endDate.getTime() - 1);
          
          return {
            id: event.id,
            title: event.summary || '(ไม่มีหัวข้อ)',
            start: startDate,
            end: endDate,
            location: event.location,
            description: event.description,
            resource: 'user' as const,
            allDay: isAllDay,
          };
        });
        allFormattedEvents = [...allFormattedEvents, ...formattedUsers];
      } else {
        console.error('Failed to fetch user events:', userEventsResult.reason);
        // Don't set global error if holidays still work, but maybe log it
      }

      if (holidayEventsResult.status === 'fulfilled') {
        const formattedHolidays = (holidayEventsResult.value || []).map(event => {
          const startDate = new Date(event.start?.date || event.start?.dateTime || new Date());
          let endDate = new Date(event.end?.date || event.end?.dateTime || new Date());
          if (event.end?.date) endDate = new Date(endDate.getTime() - 1);

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
        allFormattedEvents = [...allFormattedEvents, ...formattedHolidays];
      } else {
        console.error('Failed to fetch holidays:', holidayEventsResult.reason);
      }

      if (userEventsResult.status === 'rejected' && holidayEventsResult.status === 'rejected') {
        setError('ไม่สามารถโหลดข้อมูลปฏิทินได้ กรุณาตรวจสอบการเชื่อมต่อหรือการตั้งค่า API');
      }

      setEvents(allFormattedEvents);
      globalEventsCache = allFormattedEvents;
      lastFetchTime = Date.now();
    } catch (err) {
      console.error('Unexpected error loading events:', err);
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const todayEvents = events.filter(e => {
    if (e.resource === 'holiday') return false;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return e.start >= startOfDay && e.start <= endOfDay;
  });

  const activeEvents = events.filter(e => {
    if (e.resource === 'holiday') return false;
    const now = new Date();
    return e.start <= now && e.end >= now;
  });

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
    error,
    todayEvents,
    activeEvents,
    upcomingEvents,
    refresh: () => loadEvents(true),
  };
}
