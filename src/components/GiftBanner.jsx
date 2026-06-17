import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';

export default function GiftBanner() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      style={{ background: '#4A3FB5', borderRadius: 16 }}
      className="flex items-center justify-between gap-4 px-6 py-5 my-8 shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="inline-block text-xs font-bold text-yellow-300 uppercase tracking-wide mb-1">
            מתנה מושלמת לילדים
          </span>
          <h3 className="text-white font-bold text-lg leading-tight">
            הפתיעו ילד שאתם אוהבים בסיפור מיוחד
          </h3>
          <p className="text-white/70 text-sm mt-0.5">
            כרטיס מתנה דיגיטלי — שולחים בקליק
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
