import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents, type FormattedEvent } from '../hooks/useCalendarEvents';
import { useAuth } from '../context/GoogleAuthContext';
import { updateEvent, deleteEvent } from '../services/googleCalendar';
import { X, Clock, MapPin, AlignLeft, Edit2, Trash2, Save, Loader2 } from 'lucide-react';

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
  const { events, refresh } = useCalendarEvents();
  const { isAuthenticated, accessToken } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<FormattedEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    location: '',
  });

  // Filter out holidays from events (shown as day backgrounds instead)
  const calendarEvents = useMemo(() => events.filter(e => e.resource !== 'holiday'), [events]);
  const holidayDates = useMemo(() => events.filter(e => e.resource === 'holiday'), [events]);

  const getHolidayName = (date: Date) => {
    const holiday = holidayDates.find(h => isSameDay(h.start, date));
    return holiday?.title || '';
  };

  const handleSelectEvent = (event: FormattedEvent) => {
    setSelectedEvent(event);
    setEditData({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
    });
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !accessToken) return;
    setLoading(true);
    try {
      await updateEvent(accessToken, selectedEvent.id, {
        summary: editData.title,
        description: editData.description,
        location: editData.location,
        start: { dateTime: selectedEvent.start.toISOString() },
        end: { dateTime: selectedEvent.end.toISOString() },
      });
      refresh();
      setSelectedEvent(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขการจอง');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !accessToken || !window.confirm('คุณต้องการลบการจองนี้ใช่หรือไม่?')) return;
    setLoading(true);
    try {
      await deleteEvent(accessToken, selectedEvent.id);
      refresh();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('เกิดข้อผิดพลาดในการลบการจอง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 h-full relative" style={{ minHeight: '700px' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>ปฏิทินการจอง</h2>
        <div className="flex gap-2">
          {['Day', 'Week', 'Month'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase())}
              className="px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200"
              style={
                view === v.toLowerCase() 
                  ? { background: 'var(--accent-gradient)', color: 'white', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' } 
                  : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }
              }
            >
              {v === 'Day' ? 'วัน' : v === 'Week' ? 'สัปดาห์' : 'เดือน'}
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
        onSelectEvent={handleSelectEvent}
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
            return { className: 'holiday-day' };
          }
          return {};
        }}
        eventPropGetter={() => ({
          style: {
            backgroundColor: 'var(--cal-event-bg)',
            color: 'var(--cal-event-text)',
            borderLeft: '3px solid var(--cal-event-border)',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
          }
        })}
        components={{
          month: {
            dateHeader: ({ date, label }: { date: Date; label: string }) => {
              const holidayName = getHolidayName(date);
              return (
                <div>
                  <span>{label}</span>
                  {holidayName && (
                    <div style={{
                      fontSize: '0.6rem',
                      color: 'var(--cal-holiday-text)',
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
        style={{ height: 'calc(100% - 60px)' }}
      />

      {/* Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-tertiary)]">
              <h3 className="font-bold text-[var(--text-primary)]">
                {isEditing ? 'แก้ไขการจอง' : 'รายละเอียดการจอง'}
              </h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">หัวข้อ</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">ห้อง/สถานที่</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1">รายละเอียด</label>
                    <textarea 
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none"
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-[var(--text-primary)]">{selectedEvent.title}</h4>
                  
                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <Clock size={18} className="text-blue-500" />
                    <div>
                      <p className="font-medium">{format(selectedEvent.start, 'd MMMM yyyy', { locale: th })}</p>
                      <p>{format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')} น.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <MapPin size={18} className="text-red-500" />
                    <span>{selectedEvent.location || 'ไม่ได้ระบุสถานที่'}</span>
                  </div>

                  {selectedEvent.description && (
                    <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-primary)]">
                      <AlignLeft size={18} className="mt-0.5 text-slate-400" />
                      <div className="whitespace-pre-wrap">{selectedEvent.description}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-primary)] flex justify-between items-center">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                    ลบ
                  </button>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => setIsEditing(false)}
                          disabled={loading}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          ยกเลิก
                        </button>
                        <button 
                          onClick={handleUpdate}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          บันทึก
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                      >
                        <Edit2 size={16} />
                        แก้ไข
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-1">
                  <p className="text-xs text-[var(--text-tertiary)]">เข้าสู่ระบบเพื่อแก้ไขหรือลบการจอง</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
