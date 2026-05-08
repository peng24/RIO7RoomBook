import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Paperclip, Loader2, CalendarOff } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '../context/GoogleAuthContext';
import { createEvent } from '../services/googleCalendar';
import { uploadFile, getFileLink } from '../services/googleDrive';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Swal from 'sweetalert2';

const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
// ลำดับห้องที่ต้องการ
const ROOM_ORDER = ['ห้องประชุม SWOC7', 'ห้องประชุมเล็ก', 'ห้องประชุมรวงผึ้ง (ห้องออกแบบ)'];

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

  const now = new Date();
  const [formData, setFormData] = useState({
    room: '',
    day: now.getDate(),
    month: now.getMonth(),   // 0-indexed
    year: now.getFullYear(),
    startHour: '09',
    startMin: '00',
    endHour: '10',
    endMin: '00',
    title: '',
  });
  const [file, setFile] = useState<File | null>(null);
  
  const [meetingFormat, setMeetingFormat] = useState('ประชุม');
  const [otherMeetingFormat, setOtherMeetingFormat] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i);
  const daysInMonth = useMemo(() => {
    return new Date(formData.year, formData.month + 1, 0).getDate();
  }, [formData.year, formData.month]);
  const hours = Array.from({ length: 13 }, (_, i) => String(i + 7).padStart(2, '0'));  // 07-19
  const minutes = ['00', '15', '30', '45'];

  // Fetch active rooms from Firestore, sorted by preferred order
  useEffect(() => {
    const q = query(collection(db, 'rooms'), where('status', '==', 'Active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      // เรียงตามลำดับที่กำหนด
      const sorted = [...roomList].sort((a, b) => {
        const ai = ROOM_ORDER.findIndex(r => a.name.includes(r.split(' ')[1]));
        const bi = ROOM_ORDER.findIndex(r => b.name.includes(r.split(' ')[1]));
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
      setRooms(sorted);
      if (sorted.length > 0 && !formData.room) {
        setFormData(prev => ({ ...prev, room: sorted[0].name }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return Swal.fire({ icon: 'error', title: 'กรุณาเข้าสู่ระบบก่อนจอง', confirmButtonText: 'ตกลง' });
    if (!formData.room) return Swal.fire({ icon: 'warning', title: 'กรุณาเลือกห้องประชุม', confirmButtonText: 'ตกลง' });
    
    const finalMeetingFormat = meetingFormat === 'อื่นๆ' ? (otherMeetingFormat.trim() || 'อื่นๆ') : meetingFormat;

    setLoading(true);
    Swal.fire({
      title: 'กำลังดำเนินการ...',
      html: file ? 'กำลังอัปโหลดไฟล์และสร้างการจอง' : 'กำลังสร้างการจองห้องประชุม',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      let fileUrl = '';
      if (file) {
        try {
          const uploadResult = await uploadFile(accessToken!, file);
          fileUrl = await getFileLink(accessToken!, uploadResult.id);
        } catch (uploadError: any) {
          console.error('File upload failed:', uploadError);
          const result = await Swal.fire({
            icon: 'warning',
            title: 'อัปโหลดไฟล์ไม่สำเร็จ',
            text: 'ไม่สามารถอัปโหลดไฟล์แนบได้เนื่องจากไม่มีสิทธิ์เข้าถึง Google Drive คุณต้องการดำเนินการจองห้องประชุมต่อโดยไม่มีไฟล์แนบหรือไม่?',
            showCancelButton: true,
            confirmButtonText: 'ดำเนินการต่อ',
            cancelButtonText: 'ยกเลิก'
          });
          
          if (!result.isConfirmed) {
            setLoading(false);
            return;
          }
        }
      }

      const dateStr = `${formData.year}-${String(formData.month + 1).padStart(2,'0')}-${String(formData.day).padStart(2,'0')}`;
      const startDateTime = new Date(`${dateStr}T${formData.startHour}:${formData.startMin}:00`).toISOString();
      const endDateTime   = new Date(`${dateStr}T${formData.endHour}:${formData.endMin}:00`).toISOString();

      const selectedRoom = rooms.find(r => r.name === formData.room);

      await createEvent(accessToken!, {
        summary: `[${finalMeetingFormat}] ${formData.title || 'จองห้องประชุม'}`,
        description: fileUrl ? `ไฟล์แนบ: ${fileUrl}` : 'ไม่มีไฟล์แนบ',
        location: formData.room,
        start: { dateTime: startDateTime, timeZone: 'Asia/Bangkok' },
        end: { dateTime: endDateTime, timeZone: 'Asia/Bangkok' },
        colorId: selectedRoom?.colorId || '7',
      });

      Swal.fire({
        icon: 'success',
        title: 'จองห้องประชุมสำเร็จ!',
        showConfirmButton: false,
        timer: 2000
      });
      setFormData({ ...formData, title: '' });
      setFile(null);
      setOtherMeetingFormat('');
      refresh();
    } catch (error: any) {
      console.error('Error booking room:', error);
      if (error?.response?.status === 401) {
        Swal.fire({ icon: 'error', title: 'เซสชั่นหมดอายุ', text: 'กรุณา "ออกจากระบบ" และเข้าสู่ระบบใหม่อีกครั้ง', confirmButtonText: 'ตกลง' });
      } else if (error?.response?.status === 403) {
        Swal.fire({ icon: 'error', title: 'ไม่มีสิทธิ์เข้าถึง (403)', text: 'ไม่มีสิทธิ์เข้าถึง Google Calendar กรุณาตรวจสอบว่าได้เปิดใช้ Google Calendar API ใน Cloud Console แล้ว', confirmButtonText: 'ตกลง' });
      } else {
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง', confirmButtonText: 'ตกลง' });
      }
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
          <div className={isPage ? 'md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6' : 'space-y-4'}>
            <div>
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
              <label style={labelStyle}>รูปแบบการประชุม</label>
              <div className="flex gap-2" style={{ marginTop: '4px' }}>
                <select
                  style={{ ...inputStyle, marginTop: 0 }}
                  value={meetingFormat}
                  onChange={(e) => setMeetingFormat(e.target.value)}
                >
                  <option value="ประชุม">ประชุม</option>
                  <option value="Zoom">Zoom</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                {meetingFormat === 'อื่นๆ' && (
                  <input
                    type="text"
                    placeholder="ระบุรูปแบบ..."
                    style={{ ...inputStyle, marginTop: 0 }}
                    value={otherMeetingFormat}
                    onChange={(e) => setOtherMeetingFormat(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
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

          {/* Thai Date Picker */}
          <div>
            <label style={labelStyle}>วันที่</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: '6px', marginTop: '4px' }}>
              <select style={inputStyle} value={formData.day} onChange={e => setFormData({...formData, day: Number(e.target.value)})}>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select style={inputStyle} value={formData.month} onChange={e => setFormData({...formData, month: Number(e.target.value), day: 1})}>
                {MONTHS_TH.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select style={inputStyle} value={formData.year} onChange={e => setFormData({...formData, year: Number(e.target.value)})}>
                {years.map(y => <option key={y} value={y}>{y + 543}</option>)}
              </select>
            </div>
          </div>

          {/* Thai Time Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>เวลาเริ่ม</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
                <select style={inputStyle} value={formData.startHour} onChange={e => setFormData({...formData, startHour: e.target.value})}>
                  {hours.map(h => <option key={h} value={h}>{h} น.</option>)}
                </select>
                <select style={inputStyle} value={formData.startMin} onChange={e => setFormData({...formData, startMin: e.target.value})}>
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>เวลาสิ้นสุด</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '4px' }}>
                <select style={inputStyle} value={formData.endHour} onChange={e => setFormData({...formData, endHour: e.target.value})}>
                  {hours.map(h => <option key={h} value={h}>{h} น.</option>)}
                </select>
                <select style={inputStyle} value={formData.endMin} onChange={e => setFormData({...formData, endMin: e.target.value})}>
                  {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
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
