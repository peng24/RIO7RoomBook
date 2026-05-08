import React, { useState, useEffect } from 'react';
import { ChevronRight, Paperclip, Loader2, CalendarOff } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '../context/GoogleAuthContext';
import { createEvent } from '../services/googleCalendar';
import { uploadFile, getFileLink } from '../services/googleDrive';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface QuickBookProps {
  isPage?: boolean;
}

interface Room {
  id: string;
  name: string;
  colorId: string;
  status: string;
}

const QuickBook: React.FC<QuickBookProps> = ({ isPage = false }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const { upcomingEvents, refresh } = useCalendarEvents();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [formData, setFormData] = useState({
    room: '',
    date: new Date().toISOString().split('T')[0],
    start: '09:00',
    end: '10:00',
    title: '',
  });
  const [file, setFile] = useState<File | null>(null);

  // Fetch active rooms from Firestore
  useEffect(() => {
    const q = query(collection(db, 'rooms'), where('status', '==', 'Active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(roomList);
      if (roomList.length > 0 && !formData.room) {
        setFormData(prev => ({ ...prev, room: roomList[0].name }));
      }
    });

    return () => unsubscribe();
  }, [formData.room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('กรุณาเข้าสู่ระบบก่อนจอง');
    if (!formData.room) return alert('กรุณาเลือกห้องประชุม');
    
    setLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        const uploadResult = await uploadFile(accessToken!, file);
        fileUrl = await getFileLink(accessToken!, uploadResult.id);
      }

      const startDateTime = new Date(`${formData.date}T${formData.start}:00`).toISOString();
      const endDateTime = new Date(`${formData.date}T${formData.end}:00`).toISOString();

      const selectedRoom = rooms.find(r => r.name === formData.room);

      await createEvent(accessToken!, {
        summary: `[${formData.room}] ${formData.title || 'จองห้องประชุม'}`,
        description: fileUrl ? `ไฟล์แนบ: ${fileUrl}` : 'ไม่มีไฟล์แนบ',
        location: formData.room,
        start: { dateTime: startDateTime, timeZone: 'Asia/Bangkok' },
        end: { dateTime: endDateTime, timeZone: 'Asia/Bangkok' },
        colorId: selectedRoom?.colorId || '7',
      });

      alert('จองห้องประชุมสำเร็จ!');
      setFormData({ ...formData, title: '' });
      setFile(null);
      refresh();
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    marginTop: '4px',
    padding: '10px 12px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-primary)',
    borderRadius: '10px',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div className={`${isPage ? 'w-full' : 'w-80'} shrink-0 flex flex-col gap-6`}>
      <div className={`${isPage ? '' : 'glass-card p-6'}`}>
        {!isPage && (
          <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1.5 h-6 rounded-full" style={{ background: 'var(--accent-gradient)' }}></span>
            จองด่วน
          </h3>
        )}
        <form className={`space-y-4 ${isPage ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6' : ''}`} onSubmit={handleSubmit}>
          <div className={isPage ? 'md:col-span-2' : ''}>
            <label style={labelStyle}>หัวข้อการประชุม</label>
            <input 
              type="text" 
              placeholder="ระบุหัวข้อ..."
              style={inputStyle}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>เลือกห้อง</label>
            <select 
              style={inputStyle}
              value={formData.room}
              onChange={(e) => setFormData({...formData, room: e.target.value})}
            >
              {rooms.map(room => <option key={room.id} value={room.name}>{room.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>วันที่</label>
            <input 
              type="date" 
              style={inputStyle}
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>เริ่ม</label>
              <input 
                type="time" 
                style={inputStyle}
                value={formData.start}
                onChange={(e) => setFormData({...formData, start: e.target.value})}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>ถึง</label>
              <input 
                type="time" 
                style={inputStyle}
                value={formData.end}
                onChange={(e) => setFormData({...formData, end: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>ไฟล์แนบ</label>
            <label className="flex items-center justify-center gap-2 cursor-pointer transition-all duration-200" style={{ marginTop: '4px', padding: '14px 12px', border: '2px dashed var(--border-primary)', borderRadius: '10px', background: 'var(--bg-input)' }}>
              <Paperclip size={16} style={{ color: 'var(--text-tertiary)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{file ? file.name : 'แนบไฟล์เอกสาร'}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className={`${isPage ? 'md:col-span-2 mt-4' : ''}`}>
            <button 
              type="submit"
              disabled={loading || !isAuthenticated || rooms.length === 0}
              className="btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <>{isPage ? 'ยืนยันการจองห้องประชุม' : 'จองเลย'} <ChevronRight size={18} /></>}
            </button>
          </div>
        </form>
      </div>

      {!isPage && (
        <div className="glass-card p-6 flex-1">
          <h3 className="font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-1.5 h-6 rounded-full" style={{ background: 'var(--text-primary)' }}></span>
            การจองถัดไป
          </h3>
          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                <CalendarOff size={28} className="mb-2" />
                <p className="text-sm">ไม่มีการจองที่กำลังจะมาถึง</p>
              </div>
            ) : (
              upcomingEvents.map((event, index) => (
                <div key={event.id} className="p-4 rounded-xl transition-all duration-200" style={{ background: 'var(--bg-tertiary)', borderLeft: `3px solid ${index === 0 ? 'var(--accent-primary)' : 'var(--border-primary)'}` }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: index === 0 ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}>
                    {formatEventDateLabel(event.start)} • {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')} น.
                  </p>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                  {event.location && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{event.location}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickBook;
