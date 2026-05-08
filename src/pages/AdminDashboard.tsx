import React from 'react';
import DashboardStats from '../components/DashboardStats';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Calendar, Clock, User } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { upcomingEvents } = useCalendarEvents();
  const rooms = ['Room 1', 'Room 2', 'Room 3']; // Mock rooms

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ภาพรวม Admin</h1>
        <p style={{ color: 'var(--text-secondary)' }}>สรุปข้อมูลและสถิติการใช้งานห้องประชุม</p>
      </div>

      <DashboardStats rooms={rooms} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>การจองที่กำลังมาถึง</h3>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                    <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="flex items-center gap-1"><Clock size={12} /> {event.start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                      <span className="flex items-center gap-1"><User size={12} /> {event.location || 'ไม่ระบุห้อง'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>ไม่มีการจองที่กำลังมาถึง</p>
            )}
          </div>
        </div>

        {/* Room Usage (Placeholder) */}
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)]">
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>อัตราการใช้งานห้อง</h3>
          <div className="space-y-6">
            {rooms.map(room => (
              <div key={room}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{room}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{Math.floor(Math.random() * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
