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

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const appUrl = window.location.origin;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${appUrl}${redirectTo}` },
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות עם Google.');
      setIsLoading(false);
    }
  };

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

                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-200 font-semibold flex items-center gap-3 mb-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  המשך עם Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs text-slate-400 bg-white px-2"><span>או עם מייל</span></div>
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
