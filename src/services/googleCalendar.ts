import axios from 'axios';
import type { GoogleCalendarEvent } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = import.meta.env.VITE_CALENDAR_ID;
const HOLIDAY_CALENDAR_ID = import.meta.env.VITE_HOLIDAY_CALENDAR_ID;

/**
 * Fetch events from the main calendar (sarabun07@gmail.com).
 * Always uses API key to read from the specific CALENDAR_ID.
 * Bearer token is NOT used here — it would redirect reads to the logged-in user's personal calendar.
 */
export const fetchEvents = async () => {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 12, 0).toISOString();

  const params: Record<string, string> = {
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeZone: 'Asia/Bangkok',
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${queryString}`;

  try {
    const response = await axios.get(url);
    console.log(`[Events] fetched ${response.data.items?.length ?? 0} events`);
    return (response.data.items || []) as GoogleCalendarEvent[];
  } catch (err: any) {
    console.error('[Events] fetch error:', err?.response?.data || err.message);
    return [] as GoogleCalendarEvent[];
  }
};

/**
 * Fetch Thai holidays from the holiday calendar.
 */
export const fetchHolidays = async () => {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), 0, 1).toISOString();
  const timeMax = new Date(now.getFullYear() + 1, 11, 31).toISOString();

  const params: Record<string, string> = {
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '200',
  };

  const queryString = new URLSearchParams(params).toString();
  // Holiday calendar IDs with @import must be double-encoded for the URL path
  const encodedId = encodeURIComponent(HOLIDAY_CALENDAR_ID);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events?${queryString}`;

  try {
    const response = await axios.get(url);
    console.log(`[Holidays] fetched ${response.data.items?.length ?? 0} events`);
    return (response.data.items || []) as GoogleCalendarEvent[];
  } catch (err: any) {
    console.error('[Holidays] fetch error:', err?.response?.data || err.message);
    return [] as GoogleCalendarEvent[];
  }
};

export const createEvent = async (accessToken: string, event: Partial<GoogleCalendarEvent>) => {
  const response = await axios.post(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
    event,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};

export const updateEvent = async (accessToken: string, eventId: string, event: Partial<GoogleCalendarEvent>) => {
  const response = await axios.patch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${eventId}`,
    event,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};

export const deleteEvent = async (accessToken: string, eventId: string) => {
  await axios.delete(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${eventId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
};
