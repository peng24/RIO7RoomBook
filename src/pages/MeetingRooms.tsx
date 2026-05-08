import React, { useState, useEffect } from 'react';
import { DoorOpen, Users, Monitor, Wifi, Coffee, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

interface Room {
  id: string;
  name: string;
  capacity: number;
  status: string;
  colorId: string;
}

const MeetingRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), where('status', '==', 'Active'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(roomList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRoomColorHex = (colorId: string) => {
    const colors: Record<string, string> = {
      '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
      '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
      '9': '#3f51b5', '10': '#0b8043', '11': '#d50000'
    };
    return colors[colorId] || '#3b82f6';
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ห้องประชุม</h1>
        <p style={{ color: 'var(--text-secondary)' }}>รายละเอียดและสถานะของห้องประชุมทั้งหมดจากระบบ Firebase</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูลห้องประชุม...</p>
        </div>
      ) : rooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id}
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${getRoomColorHex(room.colorId)}15`, color: getRoomColorHex(room.colorId) }}
                >
                  <DoorOpen size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                  พร้อมใช้งาน
                </span>
              </div>
              
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
              
              <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <Users size={16} />
                <span>รองรับ {room.capacity} ท่าน</span>
              </div>

              <div className="border-t border-[var(--border-primary)] pt-4 mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>สิ่งอำนวยความสะดวก</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">
                    <Monitor size={14} />
                    <span>จอภาพ/TV</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">
                    <Wifi size={14} />
                    <span>Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs">
                    <Coffee size={14} />
                    <span>น้ำดื่ม/กาแฟ</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border-primary)]">
          <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>ไม่พบข้อมูลห้องประชุม</h3>
          <p style={{ color: 'var(--text-secondary)' }}>กรุณาเพิ่มข้อมูลห้องประชุมในหน้าจัดการระบบ</p>
        </div>
      )}
    </div>
  );
};

export default MeetingRooms;
