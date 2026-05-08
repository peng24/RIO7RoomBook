import React from 'react';
import QuickBook from '../components/QuickBook';
import { useAuth } from '../context/GoogleAuthContext';
import { LogIn } from 'lucide-react';

const BookRoom: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>จองห้องประชุม</h1>
        <p style={{ color: 'var(--text-secondary)' }}>กรุณากรอกข้อมูลเพื่อทำการจองห้องประชุม</p>
      </div>

      {isAuthenticated ? (
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 border border-[var(--border-primary)] shadow-xl">
          <QuickBook isPage={true} />
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-2xl p-12 border border-[var(--border-primary)] text-center">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} />
          </div>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>กรุณาเข้าสู่ระบบ</h2>
          <p className="mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            คุณต้องเข้าสู่ระบบด้วย Google Account เพื่อดำเนินการจองห้องประชุม
          </p>
          <button 
            onClick={() => login()}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3"
          >
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      )}
    </div>
  );
};

export default BookRoom;
