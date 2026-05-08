import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, DoorOpen, Users, X, Save, AlertCircle, Palette, Loader2 } from 'lucide-react';
import { db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

// Google Calendar Event Color IDs mapping
export const GOOGLE_COLORS = [
  { id: '1', name: 'Lavender', hex: '#7986cb' },
  { id: '2', name: 'Sage', hex: '#33b679' },
  { id: '3', name: 'Grape', hex: '#8e24aa' },
  { id: '4', name: 'Flamingo', hex: '#e67c73' },
  { id: '5', name: 'Banana', hex: '#f6bf26' },
  { id: '6', name: 'Tangerine', hex: '#f4511e' },
  { id: '7', name: 'Peacock', hex: '#039be5' },
  { id: '8', name: 'Graphite', hex: '#616161' },
  { id: '9', name: 'Blueberry', hex: '#3f51b5' },
  { id: '10', name: 'Basil', hex: '#0b8043' },
  { id: '11', name: 'Tomato', hex: '#d50000' },
];

export interface Room {
  id: string;
  name: string;
  capacity: number;
  status: 'Active' | 'Inactive';
  colorId: string;
}

const ManageRooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: 10,
    status: 'Active' as 'Active' | 'Inactive',
    colorId: '7'
  });

  // Fetch rooms from Firestore
  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('name'));
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

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        capacity: room.capacity,
        status: room.status,
        colorId: room.colorId
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        capacity: 10,
        status: 'Active',
        colorId: '7'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRoom) {
        const roomRef = doc(db, 'rooms', editingRoom.id);
        await updateDoc(roomRef, formData);
      } else {
        await addDoc(collection(db, 'rooms'), formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณต้องการลบห้องประชุมนี้ใช่หรือไม่? ข้อมูลใน Firestore จะถูกลบถาวร')) {
      try {
        await deleteDoc(doc(db, 'rooms', id));
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  const getRoomColorHex = (colorId: string) => {
    return GOOGLE_COLORS.find(c => c.id === colorId)?.hex || '#3b82f6';
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>จัดการห้องประชุม</h1>
          <p style={{ color: 'var(--text-secondary)' }}>ข้อมูลห้องถูกบันทึกใน Firebase Firestore และเชื่อมสีกับ Google Calendar</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="btn-primary flex items-center gap-2 px-6 py-2.5"
        >
          <Plus size={18} />
          เพิ่มห้องประชุมใหม่
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>กำลังโหลดข้อมูลจาก Firebase...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div 
                key={room.id}
                className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-primary)] flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${getRoomColorHex(room.colorId)}20`, color: getRoomColorHex(room.colorId) }}
                  >
                    <DoorOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{room.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <Users size={14} />
                        รองรับ {room.capacity} ท่าน
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRoomColorHex(room.colorId) }}></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                          {GOOGLE_COLORS.find(c => c.id === room.colorId)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openModal(room)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                    title="แก้ไข"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(room.id)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="ลบ"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--border-primary)]">
              <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>ยังไม่มีข้อมูลห้องประชุม</h3>
              <p style={{ color: 'var(--text-secondary)' }}>คลิกปุ่ม "เพิ่มห้องประชุมใหม่" เพื่อเริ่มต้นบันทึกข้อมูลลง Firestore</p>
            </div>
          )}
        </div>
      )}

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-tertiary)]">
              <h3 className="font-bold text-[var(--text-primary)]">
                {editingRoom ? 'แก้ไขห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}
              </h3>
              <button onClick={closeModal} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1.5">ชื่อห้องประชุม</label>
                  <input 
                    type="text" required
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1.5">ความจุ</label>
                    <input 
                      type="number" required
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-1.5">สถานะ</label>
                    <select 
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                    >
                      <option value="Active">เปิดใช้งาน</option>
                      <option value="Inactive">ปิดใช้งาน</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] block mb-3 flex items-center gap-2">
                    <Palette size={14} /> สีสำหรับ Google Calendar
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {GOOGLE_COLORS.map((color) => (
                      <button
                        key={color.id} type="button"
                        onClick={() => setFormData({...formData, colorId: color.id})}
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center hover:scale-110 shadow-sm ${
                          formData.colorId === color.id ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {formData.colorId === color.id && <Save size={16} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-primary)] flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)]">ยกเลิก</button>
                <button 
                  type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  บันทึกลง Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
