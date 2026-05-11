import React, { useMemo, useState } from 'react';
import DashboardStats from '../components/DashboardStats';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Calendar, Clock, MapPin, TrendingUp, BarChart2, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInMinutes, getHours, isWeekend } from 'date-fns';
import { th } from 'date-fns/locale';

const ROOMS = ['ห้องประชุม SWOC7', 'ห้องประชุมรวงผึ้ง (ห้องออกแบบ)', 'ห้องประชุมเล็ก'];
const WORKING_HOURS_PER_DAY = 9;

const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];

function countWorkingDays(start: Date, end: Date) {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    if (!isWeekend(d)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

const AdminDashboard: React.FC = () => {
  const { events, upcomingEvents } = useCalendarEvents();

  const now = new Date();
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const { rangeStart, rangeEnd } = useMemo(() => {
    if (period === 'month') {
      const ref = new Date(selectedYear, selectedMonth, 1);
      return { rangeStart: startOfMonth(ref), rangeEnd: endOfMonth(ref) };
    } else {
      const ref = new Date(selectedYear, 0, 1);
      return { rangeStart: startOfYear(ref), rangeEnd: endOfYear(ref) };
    }
  }, [period, selectedMonth, selectedYear]);

  const workingDays = useMemo(() => countWorkingDays(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
  const totalMinutesPerRoom = workingDays * WORKING_HOURS_PER_DAY * 60;

  // กิจกรรมผู้ใช้ในช่วงที่เลือก
  const periodEvents = useMemo(() =>
    events.filter(e => e.resource !== 'holiday' && e.start >= rangeStart && e.start <= rangeEnd),
    [events, rangeStart, rangeEnd]
  );

  // ชั่วโมงยอดนิยม (peak hour)
  const hourCounts = useMemo(() => {
    const counts = Array(24).fill(0);
    periodEvents.forEach(e => { counts[getHours(e.start)]++; });
    return counts;
  }, [periodEvents]);

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakHourCount = Math.max(...hourCounts);

  // วันยอดนิยม
  const dayNames = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const dayCounts = useMemo(() => {
    const counts = Array(7).fill(0);
    periodEvents.forEach(e => { counts[e.start.getDay()]++; });
    return counts;
  }, [periodEvents]);
  const peakDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))];

  // รวมชั่วโมงทั้งหมด
  const totalBookedMinutes = useMemo(() =>
    periodEvents.reduce((sum, e) => sum + Math.max(0, differenceInMinutes(e.end, e.start)), 0),
    [periodEvents]
  );

  // อัตราการใช้งานห้อง
  const roomUsage = useMemo(() => {
    return ROOMS.map(roomName => {
      const keyword = roomName.split(' ')[1] || roomName.split(' ')[0];
      const roomEvents = periodEvents.filter(e =>
        e.location?.includes(keyword) || e.title?.includes(keyword)
      );
      const usedMinutes = roomEvents.reduce((sum, e) => sum + Math.max(0, differenceInMinutes(e.end, e.start)), 0);
      const pct = totalMinutesPerRoom > 0 ? Math.min(100, Math.round((usedMinutes / totalMinutesPerRoom) * 100)) : 0;
      return { name: roomName, pct, bookingCount: roomEvents.length, usedMinutes };
    }).sort((a, b) => b.pct - a.pct);
  }, [periodEvents, totalMinutesPerRoom]);

  const topRoom = roomUsage[0];

  const getBarColor = (pct: number) => {
    if (pct >= 80) return '#ef4444';
    if (pct >= 50) return '#f59e0b';
    return 'var(--accent-primary)';
  };

  const summaryCards = [
    {
      label: 'การจองทั้งหมด',
      value: periodEvents.length,
      unit: 'ครั้ง',
      icon: <Calendar size={20} />,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
    },
    {
      label: 'ชั่วโมงการใช้งาน',
      value: Math.round(totalBookedMinutes / 60),
      unit: 'ชั่วโมง',
      icon: <Clock size={20} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'ชั่วโมงยอดนิยม',
      value: peakHourCount > 0 ? `${String(peakHour).padStart(2,'0')}:00` : '-',
      unit: peakHourCount > 0 ? `${peakHourCount} การจอง` : '',
      icon: <TrendingUp size={20} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'วันยอดนิยม',
      value: dayCounts.every(c => c === 0) ? '-' : peakDay,
      unit: dayCounts.every(c => c === 0) ? '' : `${Math.max(...dayCounts)} ครั้ง`,
      icon: <BarChart2 size={20} />,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
    },
    {
      label: 'ห้องยอดนิยม',
      value: topRoom?.bookingCount > 0 ? topRoom.name.split(' ').slice(0, 2).join(' ') : '-',
      unit: topRoom?.bookingCount > 0 ? `${topRoom.bookingCount} การจอง` : '',
      icon: <Award size={20} />,
      color: '#ec4899',
      bg: 'rgba(236,72,153,0.08)',
    },
    {
      label: 'วันทำการในช่วง',
      value: workingDays,
      unit: 'วัน',
      icon: <Users size={20} />,
      color: '#06b6d4',
      bg: 'rgba(6,182,212,0.08)',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>ภาพรวม Admin</h1>
          <p style={{ color: 'var(--text-secondary)' }}>สรุปข้อมูลและสถิติการใช้งานห้องประชุม</p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3 glass-card p-1">
          {/* Month / Year toggle */}
          <div className="flex rounded-lg overflow-hidden">
            {(['month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-2 text-sm font-medium transition-all duration-300"
                style={period === p
                  ? { background: 'var(--accent-gradient)', color: 'white', boxShadow: '0 2px 10px rgba(59,130,246,0.3)' }
                  : { background: 'transparent', color: 'var(--text-secondary)' }}
              >
                {p === 'month' ? 'รายเดือน' : 'รายปี'}
              </button>
            ))}
          </div>

          {/* Month picker (only for month mode) */}
          {period === 'month' && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 text-sm rounded-lg bg-transparent focus:ring-2 outline-none transition-all"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
            >
              {MONTHS_TH.map((m, i) => (
                <option key={i} value={i} className="bg-[var(--bg-card)]">{m}</option>
              ))}
            </select>
          )}

          {/* Year picker */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-sm rounded-lg bg-transparent focus:ring-2 outline-none transition-all"
            style={{ color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-[var(--bg-card)]">{y + 543}</option>
            ))}
          </select>
        </div>
      </div>

      <DashboardStats rooms={ROOMS} />

      {/* Summary Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
      >
        {summaryCards.map(card => (
          <motion.div
            variants={itemVariants}
            key={card.label}
            className="glass-card p-4 hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 hover:rotate-12 hover:scale-110" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{card.label}</p>
            <p className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            {card.unit && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{card.unit}</p>}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Bookings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>การจองที่กำลังมาถึง</h3>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  key={event.id} 
                  className="group flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:border-blue-400/50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm transition-colors group-hover:text-blue-500" style={{ color: 'var(--text-primary)' }}>{event.title}</p>
                    <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {format(event.start, 'd MMM', { locale: th })} • {format(event.start, 'HH:mm')}–{format(event.end, 'HH:mm')}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1 truncate"><MapPin size={11} />{event.location}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10" style={{ color: 'var(--text-tertiary)' }}>
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                <p>ไม่มีการจองที่กำลังมาถึง</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Usage */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>อัตราการใช้งานห้อง</h3>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
              {period === 'month' ? `${MONTHS_TH[selectedMonth]} ${selectedYear + 543}` : `ปี ${selectedYear + 543}`}
            </span>
          </div>
          <div className="space-y-5">
            {roomUsage.map(room => (
              <div key={room.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex-1 min-w-0 mr-3">
                    <span className="text-sm font-medium truncate block" style={{ color: 'var(--text-secondary)' }}>{room.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {room.bookingCount} การจอง · {Math.round(room.usedMinutes / 60)} ชม.
                    </span>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: getBarColor(room.pct) }}>{room.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${room.pct}%`, background: getBarColor(room.pct) }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            {[['#3b82f6','< 50% ปกติ'],['#f59e0b','50-79% ปานกลาง'],['#ef4444','≥ 80% ใช้งานหนัก']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
            * เทียบกับชั่วโมงทำการ {WORKING_HOURS_PER_DAY} ชม./วัน · {workingDays} วันทำการ = {Math.round(totalMinutesPerRoom / 60)} ชม.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
