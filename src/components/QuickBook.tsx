import React, { useState } from 'react';
import { ChevronRight, Paperclip, Loader2, CalendarOff } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '../context/GoogleAuthContext';
import { createEvent } from '../services/googleCalendar';
import { uploadFile, getFileLink } from '../services/googleDrive';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

const QuickBook: React.FC = () => {
  const { accessToken, isAuthenticated } = useAuth();
  const { upcomingEvents, refresh } = useCalendarEvents();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    room: 'ห้องประชุม 1',
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '10:00',
    title: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const rooms = ['ห้องประชุม 1', 'ห้องประชุม 2', 'ห้องประชุม 3', 'ห้องบอร์ดรูม'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('กรุณาเข้าสู่ระบบก่อนจอง');
    
    setLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        const uploadResult = await uploadFile(accessToken!, file);
        fileUrl = await getFileLink(accessToken!, uploadResult.id);
      }

      const startDateTime = new Date(`${formData.date}T${formData.start}:00`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.end}:00`).toISOString();

      await createEvent(accessToken!, {
        summary: `[${formData.room}] ${formData.title || 'จองห้องประชุม'}`,
        description: fileUrl ? `ไฟล์แนบ: ${fileUrl}` : 'ไม่มีไฟล์แนบ',
        location: formData.room,
        start: { dateTime: startDateTime, timeZone: 'Asia/Bangkok' },
        end: { dateTime: endDateTime, timeZone: 'Asia/Bangkok' },
      });

      alert('จองห้องประชุมสำเร็จ!');
      setFormData({ ...formData, title: '' });
      setFile(null);
      refresh(); // reload events after booking
    } catch (error) {
      console.error('Error booking room:', error);
      alert('เกิดข้อผิดพลาดในการจอง');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDateLabel = (date: Date) => {
    if (isToday(date)) return 'วันนี้';
    if (isTomorrow(date)) return 'พรุ่งนี้';
    return format(date, 'd MMM', { locale: th });
  };

  return (
    <div className="w-80 shrink-0 flex flex-col gap-8">
      {/* Quick Book Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          จองด่วน
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">เลือกห้อง</label>
            <select 
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.room}
              onChange={(e) => setFormData({...formData, room: e.target.value})}
            >
              {rooms.map(room => <option key={room}>{room}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">หัวข้อการประชุม</label>
            <input 
              type="text" 
              placeholder="ระบุหัวข้อ..."
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">วันที่</label>
            <input 
              type="date" 
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">เริ่ม</label>
              <input 
                type="time" 
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.start}
                onChange={(e) => setFormData({...formData, start: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">ถึง</label>
              <input 
                type="time" 
                className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.end}
                onChange={(e) => setFormData({...formData, end: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">ไฟล์แนบ</label>
            <label className="flex items-center justify-center gap-2 mt-1 px-3 py-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <Paperclip size={16} className="text-slate-400" />
              <span className="text-xs text-slate-500">{file ? file.name : 'แนบไฟล์เอกสาร'}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <button 
            type="submit"
            disabled={loading || !isAuthenticated}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>ไปหน้าจอง <ChevronRight size={18} /></>}
          </button>
        </form>
      </div>

      {/* Upcoming Bookings - synced from Google Calendar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex-1">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-slate-900 rounded-full"></span>
          การจองถัดไป
        </h3>
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CalendarOff size={32} className="mb-2" />
              <p className="text-sm">ไม่มีการจองที่กำลังจะมาถึง</p>
            </div>
          ) : (
            upcomingEvents.map((event, index) => (
              <div key={event.id} className={`p-4 bg-slate-50 rounded-lg border-l-4 ${index === 0 ? 'border-blue-500' : 'border-slate-300'}`}>
                <p className={`text-xs font-bold mb-1 ${index === 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {formatEventDateLabel(event.start)} • {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">{event.title}</p>
                {event.location && (
                  <p className="text-xs text-slate-500 mt-1">{event.location}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickBook;
