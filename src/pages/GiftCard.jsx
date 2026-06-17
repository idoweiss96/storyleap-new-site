import React from 'react';
import { Gift } from 'lucide-react';

export default function GiftCard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center" dir="rtl">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: '#4A3FB5' }}>
        <Gift className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-3">כרטיסי מתנה</h1>
      <p className="text-slate-500 text-lg">בקרוב — אנחנו עובדים על זה! 🎁</p>
    </div>
  );
}
