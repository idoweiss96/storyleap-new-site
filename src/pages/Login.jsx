import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, Loader2, CheckCircle } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/697f4b704975c71e9cf56f59/e41c4f352_Storyleap.svg';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = searchParams.get('redirectTo') || '/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(redirectTo, { replace: true });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate(redirectTo, { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate, redirectTo]);

  const handleSendMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('נא להזין כתובת מייל'); return; }
    setIsLoading(true);
    try {
      const appUrl = window.location.origin;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${appUrl}${redirectTo}` },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError(err.message || 'שגיאה בשליחת הקישור. נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundImage: 'url(https://media.base44.com/images/public/697f4b704975c71e9cf56f59/e62ec3a0d_generated_image.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="StoryLeap" className="h-12 mx-auto mb-2" />
        </div>
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">בדוק את המייל שלך ✉️</h2>
                <p className="text-slate-500 text-sm">שלחנו קישור כניסה ל-<strong>{email}</strong>.<br />לחץ על הקישור כדי להיכנס.</p>
                <button onClick={() => setSent(false)} className="mt-4 text-sm text-slate-400 hover:text-slate-600 underline">
                  שלח שוב
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800">התחבר / הירשם</h1>
                  <p className="text-slate-500 text-sm mt-1">אנחנו נשלח לך קישור כניסה למייל</p>
                </div>

                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">כתובת מייל</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-11 rounded-xl pr-10"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'שלח קישור כניסה'}
                  </Button>
                </form>

                <button onClick={() => navigate('/')} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-4">
                  חזרה לדף הבית
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
