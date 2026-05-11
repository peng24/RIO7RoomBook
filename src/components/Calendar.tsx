import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { th } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents, type FormattedEvent } from '../hooks/useCalendarEvents';
import { useAuth } from '../context/GoogleAuthContext';
import { updateEvent, deleteEvent } from '../services/googleCalendar';
import { X, Clock, MapPin, AlignLeft, Edit2, Trash2, Save, Loader2, Paperclip, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

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
  const [date, setDate] = useState(new Date());
  const { events, refresh, loading: eventsLoading, error } = useCalendarEvents();
  const { isAuthenticated, accessToken, canEdit } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<FormattedEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMoreEvents, setShowMoreEvents] = useState<FormattedEvent[] | null>(null);
  const [showMoreDate, setShowMoreDate] = useState<Date | null>(null);
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
    Swal.fire({
      title: 'กำลังบันทึก...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
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
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error('Error updating event:', error);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถแก้ไขการจองได้', confirmButtonText: 'ตกลง' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent || !accessToken) return;
    
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ลบการจอง?',
      text: 'คุณต้องการลบการจองนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    Swal.fire({
      title: 'กำลังลบ...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
    try {
      await deleteEvent(accessToken, selectedEvent.id);
      refresh();
      setSelectedEvent(null);
      Swal.fire({ icon: 'success', title: 'ลบสำเร็จ!', showConfirmButton: false, timer: 1500 });
    } catch (error) {
      console.error('Error deleting event:', error);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบการจองได้', confirmButtonText: 'ตกลง' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    if (view === 'month' || view === 'agenda') setDate(d => subMonths(d, 1));
    else if (view === 'week') setDate(d => subWeeks(d, 1));
    else if (view === 'day') setDate(d => subDays(d, 1));
  };

  const handleNext = () => {
    if (view === 'month' || view === 'agenda') setDate(d => addMonths(d, 1));
    else if (view === 'week') setDate(d => addWeeks(d, 1));
    else if (view === 'day') setDate(d => addDays(d, 1));
  };

  const getLabel = () => {
    if (view === 'day') {
      return `${format(date, 'd MMMM', { locale: th })} พ.ศ. ${date.getFullYear() + 543}`;
    }
    return `${format(date, 'MMMM', { locale: th })} พ.ศ. ${date.getFullYear() + 543}`;
  };

  const renderDescription = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    const plainText = text.replace(urlRegex, '').trim();

    return (
      <div className="flex flex-col gap-2 w-full">
        {plainText && <div className="whitespace-pre-wrap">{plainText}</div>}
        {urls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {urls.map((url, i) => (
               <a 
                 key={i} 
                 href={url} 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 hover:text-blue-700 transition-colors"
               >
                  <Paperclip size={14} />
                  เปิดดูไฟล์แนบ {urls.length > 1 ? i + 1 : ''}
               </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card p-6 h-full relative flex flex-col" style={{ minHeight: '700px' }}>
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 shrink-0 gap-4">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <h2 className="text-lg font-bold shrink-0 hidden md:block" style={{ color: 'var(--text-primary)' }}>ปฏิทินการจอง</h2>
          
          <div className="flex flex-1 items-center gap-4">
            <div className="flex items-center bg-[var(--bg-tertiary)] rounded-xl p-1 border border-[var(--border-primary)] shadow-sm">
              <button onClick={handlePrev} className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={() => setDate(new Date())} className="px-3 py-1 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">วันนี้</button>
              <button onClick={handleNext} className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-secondary)] transition-colors"><ChevronRight size={18} /></button>
            </div>
            
            <div className="text-base md:text-lg font-bold" style={{ color: 'var(--accent-primary)', minWidth: '150px' }}>
              {getLabel()}
            </div>
          </div>

          {eventsLoading && <Loader2 size={18} className="animate-spin text-blue-500 shrink-0" />}
        </div>

        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0" style={{ scrollbarWidth: 'none' }}>
          {['Day', 'Week', 'Month', 'Agenda'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v.toLowerCase())}
              className="px-4 py-2 text-sm rounded-xl font-medium transition-all duration-200 shrink-0 border"
              style={
                view === v.toLowerCase() 
                  ? { background: 'var(--accent-gradient)', color: 'white', borderColor: 'transparent', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' } 
                  : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-primary)' }
              }
            >
              {v === 'Day' ? 'วัน' : v === 'Week' ? 'สัปดาห์' : v === 'Month' ? 'เดือน' : v === 'Agenda' ? 'กำหนดการ' : v}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ไม่สามารถโหลดข้อมูลได้</h3>
          <p className="max-w-xs mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button 
            onClick={() => refresh()}
            className="btn-primary px-6 py-2 text-sm"
          >
            ลองใหม่ซ้ำอีกครั้ง
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            onSelectEvent={handleSelectEvent}
            onShowMore={(events, date) => {
              setShowMoreEvents(events as FormattedEvent[]);
              setShowMoreDate(date);
            }}
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
              agendaDateFormat: (date: Date) => `${format(date, 'EEEE', { locale: th })} ${date.getDate()} ${format(date, 'MMMM', { locale: th })} ${date.getFullYear() + 543}`,
              agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                `${format(start, 'd MMM', { locale: th })} – ${format(end, 'd MMM', { locale: th })} ${end.getFullYear() + 543}`,
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
              toolbar: () => null,
              month: {
                dateHeader: ({ date, label }: { date: Date; label: string }) => {
                  const holidayName = getHolidayName(date);
                  const isToday = isSameDay(date, new Date());
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '3px 0' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: isToday ? '28px' : 'auto',
                        height: isToday ? '28px' : 'auto',
                        borderRadius: isToday ? '50%' : '0',
                        backgroundColor: isToday ? 'var(--accent-primary)' : 'transparent',
                        color: isToday ? '#ffffff' : 'inherit',
                        fontWeight: isToday || holidayName ? 800 : 500,
                        fontSize: isToday ? '0.85rem' : 'inherit',
                        boxShadow: isToday ? '0 4px 10px rgba(59, 130, 246, 0.4)' : 'none',
                        marginTop: '2px',
                        transition: 'all 0.2s ease'
                      }}>
                        {label}
                      </div>
                      {holidayName && (
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--cal-holiday-text)',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          marginTop: '3px',
                          textAlign: 'center',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          padding: '0 4px',
                          letterSpacing: '0.01em',
                        }}>
                          {holidayName}
                        </div>
                      )}
                    </div>
                  );
                }
              },
              agenda: {
                event: ({ event }: { event: FormattedEvent }) => (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '10px 14px',
                      borderLeft: '3px solid var(--cal-event-border)',
                      borderRadius: '0 8px 8px 0',
                      background: 'var(--cal-event-bg)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectEvent(event)}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {event.title}
                    </span>
                    {event.location && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {event.location}
                      </span>
                    )}
                  </div>
                ),
              },
            }}
            style={{ height: '100%' }}
          />
        </div>
      )}

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
                      <AlignLeft size={18} className="mt-0.5 text-slate-400 shrink-0" />
                      {renderDescription(selectedEvent.description)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-primary)] flex justify-between items-center">
              {canEdit ? (
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
                  {!isAuthenticated ? (
                    <p className="text-xs text-[var(--text-tertiary)]">เข้าสู่ระบบเพื่อแก้ไขหรือลบการจอง</p>
                  ) : (
                    <p className="text-xs text-[var(--text-tertiary)]">คุณไม่มีสิทธิ์แก้ไขการจอง — ติดต่อ Admin เพื่อขอสิทธิ์</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* More Events Modal */}
      {showMoreEvents && showMoreDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-tertiary)] shrink-0">
              <h3 className="font-bold text-[var(--text-primary)]">
                การจองวันที่ {format(showMoreDate, 'd MMMM yyyy', { locale: th })}
              </h3>
              <button 
                onClick={() => {
                  setShowMoreEvents(null);
                  setShowMoreDate(null);
                }}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {showMoreEvents.map((event) => (
                <div 
                  key={event.id}
                  onClick={() => {
                    handleSelectEvent(event);
                    setShowMoreEvents(null);
                    setShowMoreDate(null);
                  }}
                  className="p-3 rounded-xl border border-[var(--border-primary)] hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--cal-event-bg)',
                    borderLeft: '4px solid var(--cal-event-border)'
                  }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cal-event-text)' }}>
                    {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')} น.
                  </p>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                  {event.location && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <MapPin size={12} />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
