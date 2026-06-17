import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';

export default function GiftBanner() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      style={{ background: '#F0E8FF', borderRadius: 16 }}
      className="flex items-center justify-between gap-4 px-6 py-5 my-8 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#4A3FB5' }}>
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#4A3FB5' }}>
            מתנה מושלמת לילדים
          </span>
          <h3 className="font-bold text-lg leading-tight" style={{ color: '#1E1B4B' }}>
            הפתיעו ילד שאתם אוהבים בסיפור מיוחד
          </h3>
          <p className="text-sm mt-0.5" style={{ color: '#6B63A8' }}>
            כרטיס מתנה דיגיטלי - שולחים בקליק
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/gift-card')}
        style={{ background: '#FAC775', color: '#412402' }}
        className="shrink-0 font-bold text-sm px-5 py-2.5 rounded-xl hover:brightness-105 transition-all whitespace-nowrap"
      >
        לרכישת מתנה ←
      </button>
    </div>
  );
}
