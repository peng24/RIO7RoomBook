import React, { useState, useEffect } from 'react';
import { DoorOpen, Users, Monitor, Wifi, Coffee, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ห้องประชุม</h1>
        <p style={{ color: 'var(--text-secondary)' }}>รายละเอียดและสถานะของห้องประชุมทั้งหมดจากระบบ Firebase</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-card p-6 h-[250px] flex flex-col gap-4">
               <div className="flex justify-between items-start">
                 <Skeleton className="w-12 h-12 rounded-xl" />
                 <Skeleton className="w-20 h-6 rounded-full" />
               </div>
               <Skeleton className="w-3/4 h-8" />
               <Skeleton className="w-1/2 h-5" />
               <div className="mt-auto border-t border-[var(--border-primary)] pt-4 flex gap-2">
                 <Skeleton className="w-20 h-8 rounded-lg" />
                 <Skeleton className="w-16 h-8 rounded-lg" />
               </div>
            </div>
          ))}
        </div>
      ) : rooms.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {rooms.map((room) => (
            <motion.div 
              variants={itemVariants}
              key={room.id}
              className="glass-card group p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${getRoomColorHex(room.colorId)}15`, color: getRoomColorHex(room.colorId) }}
                >
                  <DoorOpen size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                  พร้อมใช้งาน
                </span>
              </div>
              
              <h3 className="text-lg font-bold mb-2 relative z-10" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
              
              <div className="flex items-center gap-2 mb-4 text-sm relative z-10" style={{ color: 'var(--text-secondary)' }}>
                <Users size={16} />
                <span>รองรับ {room.capacity} ท่าน</span>
              </div>

              <div className="border-t border-[var(--border-primary)] pt-4 mt-4 relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>สิ่งอำนวยความสะดวก</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs transition-colors hover:bg-[var(--bg-hover)]">
                    <Monitor size={14} />
                    <span>จอภาพ/TV</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs transition-colors hover:bg-[var(--bg-hover)]">
                    <Wifi size={14} />
                    <span>Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs transition-colors hover:bg-[var(--bg-hover)]">
                    <Coffee size={14} />
                    <span>น้ำดื่ม/กาแฟ</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 glass-card border-dashed"
        >
          <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>ไม่พบข้อมูลห้องประชุม</h3>
          <p style={{ color: 'var(--text-secondary)' }}>กรุณาเพิ่มข้อมูลห้องประชุมในหน้าจัดการระบบ</p>
        </motion.div>
      )}
    </div>
  );
};

export default MeetingRooms;
