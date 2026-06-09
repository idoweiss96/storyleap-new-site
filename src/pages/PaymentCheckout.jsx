import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invokeFunction } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, AlertCircle, ArrowRight, Star } from 'lucide-react';

const PAYPAL_CLIENT_ID = 'AUlDxKcPJNwHXhUVlvzN8WF2Ug8wpivDo8BuLKDkcbnfqLpJTTtPoWv7IWIbM-Ryq6Hs7dq2TUsvcHma';
const STORY_PRICE_ILS = 45;
const STORY_PRICE = '₪45';

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const paypalContainerRef = useRef(null);
  const rendered = useRef(false);
  const [storyId, setStoryId] = useState(null);
  const [childName, setChildName] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('ready');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('story_id');
    const name = params.get('child_name') || 'ילדך';
    if (!sid) { navigate('/CreateStory'); return; }
    setStoryId(sid);
    setChildName(name);
    loadPaypalAndRender(sid);
  }, []);

  const loadPaypalAndRender = (sid) => {
    const tryRender = () => {
      if (window.paypal?.Buttons && paypalContainerRef.current && !rendered.current) {
        rendered.current = true;
        renderButtons(sid);
      } else if (!rendered.current) { setTimeout(tryRender, 300); }
    };
    const existingScript = document.querySelector('script[data-paypal-checkout]');
    if (window.paypal?.Buttons && existingScript) { tryRender(); return; }
    document.querySelectorAll('script[data-paypal-checkout]').forEach(s => s.remove());
    delete window.paypal;
    const script = document.createElement('script');
    script.setAttribute('data-paypal-checkout', 'true');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=ILS&disable-funding=venmo,credit`;
    script.onload = () => tryRender();
    script.onerror = () => { setError('שגיאה בטעינת PayPal, נסו לרענן את הדף'); setStatus('failed'); };
    document.body.appendChild(script);
  };

  const renderButtons = (sid) => {
    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      createOrder: (data, actions) => actions.order.create({
        purchase_units: [{ amount: { value: String(STORY_PRICE_ILS), currency_code: 'ILS' }, description: 'סיפור טיפולי מותאם אישית - StoryLeap' }],
      }),
      onApprove: async (data) => {
        setStatus('processing');
        try {
          const res = await invokeFunction('capturePaypalOrder', { paypal_order_id: data.orderID, story_id: sid });
          if (res.data?.success) { setStatus('success'); setTimeout(() => navigate(`/PaymentSuccess?story_id=${sid}`), 1500); }
          else throw new Error(res.data?.error || 'Capture failed');
        } catch (err) { setError('אירעה שגיאה בעיבוד התשלום. אנא פנו לתמיכה.'); setStatus('failed'); }
      },
      onCancel: () => navigate(`/PaymentCancel?story_id=${sid}`),
      onError: () => { setError('שגיאת PayPal. אנא נסו שנית.'); setStatus('failed'); },
    }).render(paypalContainerRef.current);
  };

  return (
    <div className="max-w-md mx-auto pb-12">
      <div className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">השלמת הסיפור</h1>
          <p className="text-slate-500">תשלום עבור הסיפור המותאם אישית של <strong>{childName}</strong></p>
          <div className="mt-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 inline-block">
            💡 אין מספיק קרדיטים — ניתן לרכוש את הסיפור ישירות בתשלום חד פעמי
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {status === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium">מעבד את התשלום...</p>
          </motion.div>
        )}
        {status === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-green-700 font-bold text-xl">התשלום הצליח! ✨</p>
            <p className="text-slate-500 mt-2">מעביר אותך לדף האישור...</p>
          </motion.div>
        )}
        {status === 'failed' && (
          <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-slate-700 font-semibold text-lg mb-2">לא ניתן לעבד תשלום כרגע</p>
            <p className="text-slate-500 text-sm mb-6">{error || 'אירעה שגיאה. ניתן לרכוש קרדיטים ולנסות שוב.'}</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Button onClick={() => navigate('/Pricing')} className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg">
                <Star className="w-4 h-4 ml-2" />רכישת קרדיטים
              </Button>
              <Button variant="outline" onClick={() => { setStatus('ready'); setError(''); rendered.current = false; loadPaypalAndRender(storyId); }} className="w-full h-12 rounded-xl">נסה שוב</Button>
            </div>
          </motion.div>
        )}
        {(status === 'loading' || status === 'ready') && (
          <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-0 shadow-xl shadow-slate-100 mb-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">סיפור טיפולי מותאם אישית</p>
                    <p className="text-sm text-slate-500">סיפור טיפולי מותאם אישית של StoryLeap</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{STORY_PRICE}</p>
                    <p className="text-xs text-slate-400">חד פעמי</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {['סיפור מותאם אישית לילד/ה', 'טיפול בקושי הרגשי הספציפי', 'נכתב ע"י AI + מומחי ילדים', 'יישלח לאימייל תוך 24 שעות'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <div ref={paypalContainerRef} className="min-h-[50px]" />
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            <button onClick={() => navigate(`/PaymentCancel?story_id=${storyId}`)} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mt-2">
              <ArrowRight className="w-4 h-4" /> חזרה לשאלון
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
