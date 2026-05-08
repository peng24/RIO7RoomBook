import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';

const ExportExcel: React.FC = () => {
  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>ส่งออกข้อมูล Excel</h1>
        <p style={{ color: 'var(--text-secondary)' }}>เลือกช่วงเวลาที่ต้องการส่งออกข้อมูลการจองห้องประชุม</p>
      </div>

      <div className="max-w-2xl bg-[var(--bg-secondary)] rounded-2xl p-8 border border-[var(--border-primary)] shadow-xl">
        <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20">
          <FileSpreadsheet size={32} />
          <div>
            <h3 className="font-bold">รายงานการจองห้องประชุม</h3>
            <p className="text-sm">ไฟล์รูปแบบ .xlsx (Microsoft Excel)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>วันที่เริ่มต้น</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>วันที่สิ้นสุด</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>ตัวเลือกเพิ่มเติม</p>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="inc-holidays" className="rounded border-[var(--border-primary)]" />
            <label htmlFor="inc-holidays" className="text-sm" style={{ color: 'var(--text-primary)' }}>รวมวันหยุดราชการ</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="inc-cancelled" className="rounded border-[var(--border-primary)]" />
            <label htmlFor="inc-cancelled" className="text-sm" style={{ color: 'var(--text-primary)' }}>รวมรายการที่ยกเลิก</label>
          </div>
        </div>

        <button className="w-full mt-10 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]">
          <Download size={20} />
          ดาวน์โหลดไฟล์ Excel
        </button>
      </div>
    </div>
  );
};

export default ExportExcel;
