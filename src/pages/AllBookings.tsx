import React from 'react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Calendar, Clock, DoorOpen } from 'lucide-react';

const AllBookings: React.FC = () => {
  const { events, loading } = useCalendarEvents();
  const bookings = events.filter(e => e.resource === 'user');

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>การจองทั้งหมด</h1>
        <p style={{ color: 'var(--text-secondary)' }}>รายการการจองห้องประชุมทั้งหมดในระบบ</p>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>หัวข้อการประชุม</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>ห้องประชุม</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>วันที่</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>เวลา</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>กำลังโหลดข้อมูล...</td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{booking.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <DoorOpen size={14} />
                        {booking.location || 'ไม่ระบุ'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        {booking.start.toLocaleDateString('th-TH', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <Clock size={14} />
                        {booking.start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {booking.end.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500 text-xs font-medium">
                        ยืนยันแล้ว
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>ไม่พบข้อมูลการจอง</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllBookings;
