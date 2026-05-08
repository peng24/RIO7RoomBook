import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

const locales = {
  'th': th,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const MyCalendar: React.FC = () => {
  const [view, setView] = useState<any>(Views.MONTH);
  const { events } = useCalendarEvents();

  // Filter out holidays from the event list (they'll be shown as day backgrounds)
  const calendarEvents = useMemo(() => events.filter(e => e.resource !== 'holiday'), [events]);

  // Get holiday dates for dayPropGetter
  const holidayDates = useMemo(() => events.filter(e => e.resource === 'holiday'), [events]);

  // Get holiday name for a given date
  const getHolidayName = (date: Date) => {
    const holiday = holidayDates.find(h => isSameDay(h.start, date));
    return holiday?.title || '';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[700px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900">ปฏิทินการจอง</h2>
        <div className="flex gap-2">
          {['Day', 'Week', 'Month'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase())}
              className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                view === v.toLowerCase() 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={(newView) => setView(newView)}
        culture="th"
        messages={{
            next: "ถัดไป",
            previous: "ก่อนหน้า",
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            agenda: "กำหนดการ",
            date: "วันที่",
            time: "เวลา",
            event: "กิจกรรม",
            noEventsInRange: "ไม่มีกิจกรรมในช่วงนี้"
        }}
        formats={{
          monthHeaderFormat: (date: Date) => `${format(date, 'MMMM', { locale: th })} ${date.getFullYear() + 543}`,
          dayHeaderFormat: (date: Date) => `${format(date, 'EEEEที่ d MMMM', { locale: th })} ${date.getFullYear() + 543}`,
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => 
            `${format(start, 'd MMM', { locale: th })} - ${format(end, 'd MMM', { locale: th })} ${end.getFullYear() + 543}`,
          agendaDateFormat: (date: Date) => `${format(date, 'd MMMM', { locale: th })} ${date.getFullYear() + 543}`,
          timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: th }),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
          agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
        }}
        dayPropGetter={(date) => {
          const holidayName = getHolidayName(date);
          if (holidayName) {
            return {
              className: 'holiday-day',
              style: {
                backgroundColor: '#fef2f2',
              }
            };
          }
          return {};
        }}
        eventPropGetter={() => {
          return {
            style: {
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderColor: '#3b82f6',
              fontSize: '0.875rem',
              borderRadius: '4px',
            }
          };
        }}
        components={{
          month: {
            dateHeader: ({ date, label }: { date: Date; label: string }) => {
              const holidayName = getHolidayName(date);
              return (
                <div>
                  <span>{label}</span>
                  {holidayName && (
                    <div style={{
                      fontSize: '0.65rem',
                      color: '#dc2626',
                      fontWeight: 600,
                      lineHeight: 1.2,
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {holidayName}
                    </div>
                  )}
                </div>
              );
            }
          }
        }}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default MyCalendar;
