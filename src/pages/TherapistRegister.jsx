import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { invokeFunction } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const LOGO_URL = 'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/Storyleap.svg';

export default function TherapistRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState('check'); // 'check' | 'form' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '', license_number: '', specialization: '', clinic_name: '', phone: '',
  });

  useEffect(() => {
    if (!token) { setErrorMsg('לינק הזמנה לא תקין — חסר טוקן'); setStep('error'); setAuthLoading(false); return; }
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setAuthLoading(false);
      if (!u) { navigate(`/Login?redirectTo=/TherapistRegister?token=${token}`); return; }
      setUser(u);
      setStep('form');
    });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setErrorMsg('נא להזין שם מלא'); return; }
    setIsSubmitting(true); setErrorMsg('');
    try {
      await invokeFunction('registerAsTherapist', { token, ...form });
      setStep('success');
    } catch (err) {
      setErrorMsg(err.message || 'שגיאה בהרשמה, נסי שוב');
    } finally { setIsSubmitting(false); }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-amber-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="StoryLeap" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">הרשמה כמטפל/ת</h1>
          <p className="text-slate-500 text-sm mt-1">StoryLeap לאנשי מקצוע</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-slate-200">
          <CardContent className="p-8">
            {step === 'error' && (
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
                <p className="text-red-600 font-medium">{errorMsg}</p>
                <p className="text-slate-500 text-sm">פנו לצוות StoryLeap לקבלת לינק חדש</p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-800">הבקשה נשלחה בהצלחה!</h2>
                <p className="text-slate-600">הצוות שלנו יבחן את הבקשה ויצור איתך קשר בהקדם.</p>
                <p className="text-slate-500 text-sm">תקבלו מייל עם אישור לכתובת <b>{user?.email}</b></p>
                <Button onClick={() => navigate('/')} className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-4">
                  חזרה לדף הבית
                </Button>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                <div className="flex items-center gap-3 mb-6 p-3 bg-violet-50 rounded-xl border border-violet-200">
                  <Stethoscope className="w-5 h-5 text-violet-600 shrink-0" />
                  <p className="text-sm text-violet-700">מחובר/ת בתור: <b>{user?.email}</b></p>
                </div>

                <div>
                  <Label htmlFor="full_name">שם מלא *</Label>
                  <Input id="full_name" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="ד״ר / גב׳ / מר..." className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="license_number">מספר רישיון מטפל</Label>
                  <Input id="license_number" value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} placeholder="מספר רישיון (אופציונלי)" className="mt-1" dir="ltr" />
                </div>
                <div>
                  <Label htmlFor="specialization">התמחות</Label>
                  <Input id="specialization" value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="פסיכולוג/ת ילדים, מטפל/ת בCBT..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="clinic_name">שם קליניקה / מוסד</Label>
                  <Input id="clinic_name" value={form.clinic_name} onChange={e => setForm(p => ({ ...p, clinic_name: e.target.value }))} placeholder="שם הקליניקה (אופציונלי)" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">טלפון</Label>
                  <Input id="phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="050-0000000" className="mt-1" dir="ltr" />
                </div>

                {errorMsg && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{errorMsg}</p>}

                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white mt-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Stethoscope className="w-5 h-5 ml-2" />}
                  שליחת בקשת הרשמה
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
