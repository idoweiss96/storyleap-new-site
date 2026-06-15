import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { invokeFunction } from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import StoryForm from '../components/story/StoryForm';
import LoginPromptModal from '../components/story/LoginPromptModal';
import { useLanguage } from '../components/LanguageContext';

const PENDING_FORM_KEY = 'storyLeap_pendingFormData';

export default function CreateStory() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const isHe = lang === 'he';
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');
  const [generatedStory, setGeneratedStory] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    childName: '', childAge: '', gender: '', childImage: '',
    setting: '', challengeType: '', triggerDesc: '',
    reactionType: '', hobbies: '', contactEmail: '', contactPhone: '',
  });

  useEffect(() => { initPage(); }, []);

  const initPage = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userRow } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(authUser);
        setDbUser(userRow);
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('resume') === '1') {
        window.history.replaceState({}, '', window.location.pathname);
        const saved = sessionStorage.getItem(PENDING_FORM_KEY);
        if (saved) { setFormData(JSON.parse(saved)); setStep('credits_check'); }
      }
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const validateForm = () => {
    if (!formData.childName || !formData.childAge || !formData.gender || !formData.setting || !formData.challengeType) {
      setError(t('create_error_required')); return false;
    }
    if (!formData.childImage) {
      setError(isHe ? 'חובה להעלות תמונה של הילד/ה לפני שליחת הטופס 📸' : 'Please upload a photo of your child before submitting 📸');
      return false;
    }
    return true;
  };

  const buildStoryData = (paymentStatus) => ({
    child_name: formData.childName, child_age: parseInt(formData.childAge), gender: formData.gender,
    child_image: formData.childImage || null, setting: formData.setting,
    challenge_type: formData.challengeType, trigger_desc: formData.triggerDesc || null,
    reaction_type: formData.reactionType || null, hobbies: formData.hobbies || null,
    contact_email: formData.contactEmail || null, contact_phone: formData.contactPhone || null,
    content: null, story_link: null, payment_status: paymentStatus,
    created_by: user?.email,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    if (!user) {
      sessionStorage.setItem(PENDING_FORM_KEY, JSON.stringify(formData));
      setShowLoginModal(true);
      return;
    }
    setStep('credits_check');
  };

  const handleCreateStory = async () => {
    setError('');
    setIsCreating(true);
    try {
      const { data: savedStory, error: insertErr } = await supabase.from('stories').insert(buildStoryData('draft')).select().single();
      if (insertErr) throw insertErr;

      const result = await invokeFunction('submitStoryWithCredits', { story_id: savedStory.id });
      if (result.data?.success) {
        const newCredits = result.data.credits_remaining;
        await supabase.from('users').update({ credits: newCredits }).eq('id', user.id);
        setDbUser(prev => ({ ...prev, credits: newCredits }));
        window.dispatchEvent(new Event('credits-updated'));
        sessionStorage.removeItem(PENDING_FORM_KEY);
        setGeneratedStory(savedStory);
        setStep('success');
      } else {
        setError(t('create_error_save'));
      }
    } catch (_) { setError(t('create_error_save')); }
    finally { setIsCreating(false); }
  };

  const handleBuyCredits = async () => {
    setError('');
    setIsCreating(true);
    try {
      const { error: insertErr } = await supabase.from('stories').insert(buildStoryData('pending_payment')).select().single();
      if (insertErr) throw insertErr;
      sessionStorage.removeItem(PENDING_FORM_KEY);
      navigate('/Pricing');
    } catch (_) { setError(t('create_error_save')); }
    finally { setIsCreating(false); }
  };

  const resetForm = () => {
    sessionStorage.removeItem(PENDING_FORM_KEY);
    setGeneratedStory(null);
    setStep('form');
    setFormData({ childName: '', childAge: '', gender: '', childImage: '', setting: '', challengeType: '', triggerDesc: '', reactionType: '', hobbies: '', contactEmail: '', contactPhone: '' });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-slate-700 rounded-full" /></div>;

  const userCredits = dbUser?.credits ?? 0;
  const hasCredits = userCredits >= 20;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="text-center mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg shadow-slate-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('create_title')}</h1>
        <p className="text-gray-600">{t('create_subtitle')}</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'success' && generatedStory && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-100">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{isHe ? `✨ הספר של ${generatedStory.child_name} בהכנה 🎬` : `✨ ${generatedStory.child_name}'s story is being created 🎬`}</h2>
                <p className="text-gray-600 mb-6">{isHe ? `אנחנו יוצרים עכשיו את הסיפור של ${generatedStory.child_name}. אתה תקבל מייל כשהסיפור יהיה מוכן לקריאה!` : `We're creating ${generatedStory.child_name}'s story now. You'll receive an email when the story is ready!`}</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate(createPageUrl('MyStories'))} className="rounded-xl">{t('create_to_stories')}</Button>
                  <Button onClick={resetForm} className="bg-slate-800 hover:bg-slate-700 rounded-xl">{t('create_another')}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'credits_check' && user && (
          <motion.div key="credits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-100">
              <CardContent className="p-8">
                {error && <Alert className="mb-6 border-red-200 bg-red-50"><AlertCircle className="w-4 h-4 text-red-600" /><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>}
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-2 text-sm">{isHe ? '✅ השאלון מולא עבור:' : '✅ Questionnaire filled for:'}</h3>
                  <p className="text-slate-800 font-bold text-lg">{formData.childName}</p>
                  <p className="text-slate-500 text-sm">{isHe ? `גיל ${formData.childAge}` : `Age ${formData.childAge}`}</p>
                </div>
                {hasCredits ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                      <p className="text-sm text-green-700 font-medium">⭐ {isHe ? `יש לך ${userCredits} קרדיטים — מספיק ליצירת הספר!` : `You have ${userCredits} credits — enough to create the book!`}</p>
                    </div>
                    <Button onClick={handleCreateStory} disabled={isCreating} className="w-full h-14 text-lg rounded-xl bg-slate-800 hover:bg-slate-700 shadow-lg transition-all">
                      {isCreating ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('form_writing')}</span> : <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" />{isHe ? 'צור ספר (20 ⭐)' : 'Create Book (20 ⭐)'}</span>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <p className="text-amber-800 font-semibold mb-1">{isHe ? '⚠️ נדרשים 20 קרדיטים ליצירת ספר' : '⚠️ 20 credits required to create a book'}</p>
                      <p className="text-amber-600 text-sm">{isHe ? `יש לך כרגע ${userCredits} קרדיטים` : `You currently have ${userCredits} credits`}</p>
                    </div>
                    <Button onClick={handleBuyCredits} disabled={isCreating} className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base">
                      {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2"><ShoppingCart className="w-5 h-5" />{isHe ? 'רכישת קרדיטים והמשך' : 'Buy Credits & Continue'}</span>}
                    </Button>
                  </div>
                )}
                <button onClick={() => { setStep('form'); setError(''); }} className="w-full text-sm text-slate-400 hover:text-slate-600 pt-4 mt-2 border-t border-slate-100">
                  {isHe ? '← חזרה לעריכת השאלון' : '← Back to edit questionnaire'}
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-0 shadow-xl shadow-slate-100">
              <CardContent className="p-6 md:p-8">
                {error && <Alert className="mb-6 border-red-200 bg-red-50"><AlertCircle className="w-4 h-4 text-red-600" /><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>}
                <StoryForm formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} isLoading={false} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && <LoginPromptModal onClose={() => setShowLoginModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
