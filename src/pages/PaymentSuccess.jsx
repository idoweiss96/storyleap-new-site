import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, Mail, Clock } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [childName, setChildName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('story_id');
    const pendingStoryId = localStorage.getItem('pendingStoryId');
    const targetStoryId = storyId || pendingStoryId;

    if (targetStoryId) {
      supabase.from('stories').select('child_name').eq('id', targetStoryId).single().then(({ data }) => {
        if (data) setChildName(data.child_name);
      });
    }
    if (pendingStoryId) localStorage.removeItem('pendingStoryId');
  }, []);

  return (
    <div className="max-w-md mx-auto pb-12">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <Card className="border-0 shadow-2xl shadow-slate-100 text-center">
          <CardContent className="p-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-amber-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">🎉 התשלום התקבל! 🎉</h1>
            <p className="text-slate-500 mb-8 text-lg">הסיפור המותאם אישית שלכם נמצא כעת ביצירה ויישלח אליכם בקרוב.</p>
            <div className="space-y-3 mb-8 text-right">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <BookOpen className="w-5 h-5 text-violet-500 shrink-0" />
                <span className="text-slate-700 text-sm">הסיפור יוצר ע"י AI בשבילכם</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-slate-700 text-sm">תקבלו אימייל כשהסיפור מוכן</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-slate-700 text-sm">זמן יצירה: עד 24 שעות</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/MyStories')} className="w-full h-12 bg-slate-800 hover:bg-slate-700 rounded-xl">
                <BookOpen className="w-4 h-4 ml-2" />לסיפורים שלי
              </Button>
              <Button variant="outline" onClick={() => navigate('/CreateStory')} className="w-full h-12 rounded-xl">
                <Sparkles className="w-4 h-4 ml-2" />צרו סיפור נוסף
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
