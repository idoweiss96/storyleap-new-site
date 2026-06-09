import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, ArrowRight } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [storyId, setStoryId] = useState(null);
  const [childName, setChildName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('story_id');
    setStoryId(sid);
    if (sid) {
      supabase.from('stories').select('child_name').eq('id', sid).single().then(({ data }) => {
        if (data) setChildName(data.child_name);
      });
    }
  }, []);

  const retryPayment = () => {
    if (storyId) navigate(`/PaymentCheckout?story_id=${storyId}&child_name=${childName}`);
    else navigate('/CreateStory');
  };

  return (
    <div className="max-w-md mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-xl shadow-slate-100 text-center">
          <CardContent className="p-10">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">התשלום לא הושלם</h1>
            <p className="text-slate-500 mb-2">{childName ? `הנתונים של ${childName} נשמרו כטיוטה.` : 'הנתונים שלכם נשמרו כטיוטה.'}</p>
            <p className="text-slate-400 text-sm mb-8">תוכלו לחזור ולהשלים את התשלום בכל עת — הסיפור יחכה לכם.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={retryPayment} className="w-full h-12 bg-slate-800 hover:bg-slate-700 rounded-xl">
                <CreditCard className="w-4 h-4 ml-2" />נסו שנית לתשלום
              </Button>
              <Button variant="outline" onClick={() => navigate('/MyStories')} className="w-full h-12 rounded-xl">
                <ArrowRight className="w-4 h-4 ml-2" />לסיפורים שלי
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
