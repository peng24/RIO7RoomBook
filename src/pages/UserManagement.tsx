import React, { useState, useEffect } from 'react';
import {
  collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/GoogleAuthContext';
import { ADMIN_EMAIL, type UserPermission } from '../hooks/usePermission';
import { UserCheck, UserX, Plus, Trash2, Shield, Eye, Loader2, Crown } from 'lucide-react';
import Swal from 'sweetalert2';

const UserManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [allowedUsers, setAllowedUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Subscribe to allowedUsers collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'allowedUsers'), (snap) => {
      const users = snap.docs.map(d => ({ email: d.id, ...d.data() } as UserPermission));
      setAllowedUsers(users.sort((a, b) => a.email.localeCompare(b.email)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Access guard
  if (!isAdmin) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          <Shield size={32} />
        </div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>ไม่มีสิทธิ์เข้าถึง</h2>
        <p style={{ color: 'var(--text-secondary)' }}>เฉพาะ Admin ({ADMIN_EMAIL}) เท่านั้นที่สามารถจัดการสิทธิ์ได้</p>
      </div>
    );
  }

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      Swal.fire({ icon: 'warning', title: 'อีเมลไม่ถูกต้อง', text: 'กรุณากรอกอีเมลที่ถูกต้อง', confirmButtonText: 'ตกลง' });
      return;
    }
    if (email === ADMIN_EMAIL) {
      Swal.fire({ icon: 'info', title: 'Admin มีสิทธิ์เต็มอยู่แล้ว', confirmButtonText: 'ตกลง' });
      return;
    }
    if (allowedUsers.find(u => u.email === email)) {
      Swal.fire({ icon: 'info', title: 'มีผู้ใช้นี้อยู่แล้ว', confirmButtonText: 'ตกลง' });
      return;
    }

    setAdding(true);
    try {
      await setDoc(doc(db, 'allowedUsers', email), {
        email,
        canEdit: true,
        grantedAt: serverTimestamp(),
        grantedBy: user?.email || ADMIN_EMAIL,
      });
      setNewEmail('');
      Swal.fire({ icon: 'success', title: 'เพิ่มสิทธิ์สำเร็จ!', text: `${email} สามารถเพิ่ม/แก้ไข/ลบการจองได้แล้ว`, showConfirmButton: false, timer: 2000 });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเพิ่มผู้ใช้ได้', confirmButtonText: 'ตกลง' });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (email: string, currentCanEdit: boolean) => {
    try {
      await setDoc(doc(db, 'allowedUsers', email), {
        canEdit: !currentCanEdit,
        grantedBy: user?.email || ADMIN_EMAIL,
        grantedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', confirmButtonText: 'ตกลง' });
    }
  };

  const handleRemove = async (email: string) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ลบสิทธิ์?',
      text: `ต้องการลบสิทธิ์ของ ${email} ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteDoc(doc(db, 'allowedUsers', email));
      Swal.fire({ icon: 'success', title: 'ลบสิทธิ์สำเร็จ', showConfirmButton: false, timer: 1500 });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', confirmButtonText: 'ตกลง' });
    }
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>จัดการสิทธิ์ผู้ใช้</h1>
        <p style={{ color: 'var(--text-secondary)' }}>กำหนดว่าผู้ใช้ไหนสามารถ เพิ่ม / แก้ไข / ลบ การจองได้</p>
      </div>

      {/* Admin card */}
      <div className="rounded-2xl p-5 mb-6 flex items-center gap-4 border" style={{ background: 'rgba(99,102,241,0.07)', borderColor: 'rgba(99,102,241,0.2)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
          <Crown size={20} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ADMIN_EMAIL}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Super Admin — สิทธิ์เต็มทุกฟีเจอร์</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>ADMIN</span>
      </div>

      {/* Add user form */}
      <div className="rounded-2xl p-6 mb-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="font-bold mb-4 text-sm uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>เพิ่มผู้มีสิทธิ์แก้ไข</h3>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="กรอกอีเมล Google เช่น user@gmail.com"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newEmail.trim()}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            เพิ่ม
          </button>
        </div>
      </div>

      {/* User list */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>รายชื่อผู้มีสิทธิ์</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}>
            {allowedUsers.length} คน
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
          </div>
        ) : allowedUsers.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--text-tertiary)' }}>
            <UserX size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">ยังไม่มีผู้ใช้ในรายการ</p>
            <p className="text-xs mt-1 opacity-60">เพิ่มอีเมลด้านบนเพื่อให้สิทธิ์แก้ไข</p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            {allowedUsers.map((u) => (
              <li key={u.email} className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--bg-hover)] transition-colors">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                  style={{ background: u.canEdit ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)', color: u.canEdit ? '#3b82f6' : 'var(--text-tertiary)' }}>
                  {u.email[0].toUpperCase()}
                </div>
                {/* Email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{u.email}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {u.canEdit ? 'สามารถเพิ่ม / แก้ไข / ลบ การจองได้' : 'ดูได้อย่างเดียว'}
                  </p>
                </div>
                {/* Status badge */}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={u.canEdit
                    ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                    : { background: 'rgba(100,116,139,0.1)', color: 'var(--text-tertiary)' }}>
                  {u.canEdit ? 'แก้ไขได้' : 'ดูอย่างเดียว'}
                </span>
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(u.email, u.canEdit)}
                  title={u.canEdit ? 'เปลี่ยนเป็นดูอย่างเดียว' : 'ให้สิทธิ์แก้ไข'}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:scale-105"
                  style={{ background: u.canEdit ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: u.canEdit ? '#22c55e' : 'var(--text-tertiary)' }}>
                  {u.canEdit ? <UserCheck size={16} /> : <Eye size={16} />}
                </button>
                {/* Remove */}
                <button
                  onClick={() => handleRemove(u.email)}
                  title="ลบออกจากรายการ"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:scale-105"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-2xl border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>หมายเหตุ</p>
        <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <p>• ผู้ใช้ที่ <strong>ไม่ได้ login</strong> หรือ <strong>ไม่อยู่ในรายการ</strong> → ดูปฏิทินได้อย่างเดียว</p>
          <p>• ผู้ใช้ที่อยู่ในรายการและ <strong>canEdit = true</strong> → เพิ่ม / แก้ไข / ลบ การจองได้</p>
          <p>• กดปุ่ม toggle เพื่อสลับระหว่างสิทธิ์แก้ไขและสิทธิ์ดูอย่างเดียว</p>
          <p>• การเปลี่ยนแปลงมีผลทันทีแบบ Real-time</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
