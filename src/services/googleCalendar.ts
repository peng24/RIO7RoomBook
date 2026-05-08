import axios from 'axios';
import type { GoogleCalendarEvent } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CALENDAR_ID = import.meta.env.VITE_CALENDAR_ID;
const HOLIDAY_CALENDAR_ID = import.meta.env.VITE_HOLIDAY_CALENDAR_ID;

/**
 * Fetch events from the main calendar (sarabun07@gmail.com).
 * Always uses API key to ensure we get data from the correct calendar,
 * not the logged-in user's personal calendar.
 */
export const fetchEvents = async (accessToken?: string) => {
  // Calculate time range: 3 months back to 12 months forward
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

  // Use access token if available for write operations,
  // but always target the specific CALENDAR_ID
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await axios.get(url, { headers });
  return (response.data.items || []) as GoogleCalendarEvent[];
};

/**
 * Fetch Thai holidays from the holiday calendar.
 */
export const fetchHolidays = async () => {
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const timeMax = new Date(now.getFullYear(), now.getMonth() + 12, 0).toISOString();

  const params: Record<string, string> = {
    key: API_KEY,
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '100',
    timeZone: 'Asia/Bangkok',
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(HOLIDAY_CALENDAR_ID)}/events?${queryString}`;

  const response = await axios.get(url);
  return (response.data.items || []) as GoogleCalendarEvent[];
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
  const response = await axios.put(
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
