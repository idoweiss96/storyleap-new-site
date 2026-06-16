import React, { useState } from 'react';
import { uploadFile } from '@/api/apiClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Upload, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

async function convertHeicToJpeg(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' }));
          else reject(new Error('Conversion failed'));
        }, 'image/jpeg', 0.92);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const TOTAL_STEPS = 4;

function ProgressBar({ step }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
            i + 1 < step ? 'bg-violet-600 text-white' :
            i + 1 === step ? 'bg-slate-800 text-white ring-4 ring-slate-200' :
            'bg-slate-100 text-slate-400'
          }`}>{i + 1 < step ? '✓' : i + 1}</div>
        ))}
      </div>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 right-0 bg-gradient-to-l from-violet-600 to-slate-700 rounded-full"
          initial={false}
          animate={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

function CardOption({ value, label, emoji, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center cursor-pointer ${
        selected
          ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-100'
          : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
      }`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className={`text-xs font-semibold leading-tight ${selected ? 'text-violet-700' : 'text-slate-600'}`}>{label}</span>
    </button>
  );
}

export default function StoryForm({ formData, setFormData, onSubmit, isLoading, user, onNeedAuth }) {
  const { t, lang } = useLanguage();
  const isHe = lang === 'he';
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [stepError, setStepError] = useState('');

  const settings = [
    { value: 'space',     label: t('setting_space'),     emoji: '🚀' },
    { value: 'forest',    label: t('setting_forest'),    emoji: '🌳' },
    { value: 'castle',    label: t('setting_castle'),    emoji: '🏰' },
    { value: 'sports',    label: t('setting_sports'),    emoji: '⚽' },
    { value: 'real_life', label: t('setting_real_life'), emoji: '🏠' },
  ];
  const challengeTypes = [
    { value: 'fears',               label: t('ch_fears'),      emoji: '😨' },
    { value: 'social_difficulty',   label: t('ch_social'),     emoji: '👥' },
    { value: 'changes',             label: t('ch_changes'),    emoji: '🔄' },
    { value: 'emotional_regulation',label: t('ch_emotional'),  emoji: '💭' },
    { value: 'separation_anxiety',  label: t('ch_separation'), emoji: '🤗' },
    { value: 'self_confidence',     label: t('ch_confidence'), emoji: '💪' },
    { value: 'sleep_issues',        label: t('ch_sleep'),      emoji: '🌙' },
  ];
  const reactionTypes = [
    { value: 'outburst',         label: t('r_outburst'),   emoji: '😤' },
    { value: 'withdrawal',       label: t('r_withdrawal'), emoji: '😶' },
    { value: 'attention_seeking',label: t('r_attention'),  emoji: '🙋' },
    { value: 'crying',           label: t('r_crying'),     emoji: '😢' },
    { value: 'aggression',       label: t('r_aggression'), emoji: '😠' },
    { value: 'avoidance',        label: t('r_avoidance'),  emoji: '🙈' },
  ];

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    let file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError('');
    try {
      if (/\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic') file = await convertHeicToJpeg(file);
      const { file_url } = await uploadFile(file);
      handleChange('childImage', file_url);
    } catch {
      setUploadError(isHe ? 'שגיאה בהעלאת התמונה. נסו שוב.' : 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const validateStep = () => {
    setStepError('');
    if (step === 1) {
      if (!formData.childName?.trim()) { setStepError(isHe ? 'נא להזין שם' : 'Please enter a name'); return false; }
      if (!formData.childAge) { setStepError(isHe ? 'נא להזין גיל' : 'Please enter age'); return false; }
      if (!formData.gender) { setStepError(isHe ? 'נא לבחור מגדר' : 'Please select gender'); return false; }
      if (!formData.childImage) { setStepError(isHe ? 'חובה להעלות תמונה 📸' : 'Please upload a photo 📸'); return false; }
    }
    if (step === 2) {
      if (!formData.setting) { setStepError(isHe ? 'נא לבחור תפאורה' : 'Please select a setting'); return false; }
    }
    if (step === 3) {
      if (!formData.challengeType) { setStepError(isHe ? 'נא לבחור אתגר' : 'Please select a challenge'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };
  const prevStep = () => { setStepError(''); setStep(s => s - 1); window.scrollTo(0, 0); };

  const stepTitles = [
    isHe ? 'ספרו לנו על הילד/ה' : 'Tell us about your child',
    isHe ? 'איפה יתרחש הסיפור?' : 'Where will the story take place?',
    isHe ? 'מה מקשה עליו/עליה?' : "What's the challenge?",
    isHe ? 'כמה פרטים אחרונים' : 'A few final details',
  ];

  return (
    <div dir={isHe ? 'rtl' : 'ltr'}>
      <ProgressBar step={step} />

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">{stepTitles[step - 1]}</h2>
        <p className="text-sm text-slate-400 mt-1">{isHe ? `שלב ${step} מתוך ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Child Info ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label className="font-medium text-slate-700">{t('form_child_name')}</Label>
                <Input value={formData.childName} onChange={e => handleChange('childName', e.target.value)}
                  placeholder={t('form_child_name_ph')} className="h-12 rounded-xl border-violet-200 focus:border-violet-400 text-base" />
              </div>
              <div className="space-y-1">
                <Label className="font-medium text-slate-700">{t('form_age')}</Label>
                <Input type="number" min="1" max="12" value={formData.childAge} onChange={e => handleChange('childAge', e.target.value)}
                  placeholder={t('form_age_ph')} className="h-12 rounded-xl border-violet-200 focus:border-violet-400 text-base" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label className="font-medium text-slate-700">{t('form_gender')}</Label>
                <div className="flex gap-2 h-12">
                  {[{ value: 'boy', label: isHe ? 'בן' : 'Boy', emoji: '👦' }, { value: 'girl', label: isHe ? 'בת' : 'Girl', emoji: '👧' }, { value: 'other', label: isHe ? 'אחר' : 'Other', emoji: '🧒' }].map(g => (
                    <button key={g.value} type="button" onClick={() => handleChange('gender', g.value)}
                      className={`flex-1 rounded-xl border-2 text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${formData.gender === g.value ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-violet-300'}`}>
                      <span>{g.emoji}</span><span>{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Photo upload */}
            <div className="space-y-2">
              <Label className="font-medium text-slate-700">{t('form_image')} <span className="text-red-500">*</span></Label>
              {formData.childImage ? (
                <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={formData.childImage} alt="Child" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-700">{isHe ? '✅ תמונה הועלתה בהצלחה!' : '✅ Photo uploaded!'}</p>
                    <button type="button" onClick={() => { handleChange('childImage', ''); setUploadError(''); }}
                      className="text-xs text-red-400 hover:text-red-600 mt-1 underline">
                      {isHe ? 'הסר ובחר תמונה אחרת' : 'Remove and choose another'}
                    </button>
                  </div>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploadError ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-violet-200 bg-violet-50/30 hover:border-violet-400 hover:bg-violet-50'}`}>
                  <input type="file" accept="image/jpeg,image/png,image/jpg,.heic,.heif" onChange={handleImageUpload} className="hidden" />
                  {uploading ? (
                    <><Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-2" /><span className="text-sm text-violet-500">{isHe ? 'מעלה...' : 'Uploading...'}</span></>
                  ) : (
                    <><Upload className="w-8 h-8 text-violet-400 mb-2" />
                    <span className="text-sm font-semibold text-violet-600">{isHe ? 'לחצו להעלאת תמונה' : 'Click to upload photo'}</span>
                    <span className="text-xs text-slate-400 mt-1">{isHe ? 'JPG, PNG, HEIC עד 10MB' : 'JPG, PNG, HEIC up to 10MB'}</span></>
                  )}
                </label>
              )}
              {uploadError && <p className="text-xs text-red-500 font-medium">{uploadError}</p>}
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHe ? '📸 התמונה עוזרת לנו ליצור סיפור אישי ומיוחד. היא נמחקת מיד עם סיום יצירת הסיפור.' : '📸 The photo helps us create a personal story. It is deleted as soon as the story is created.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Setting ── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <p className="text-sm text-slate-500">{isHe ? `בחרו את הסביבה שבה יתרחש הרפתקאת ${formData.childName || 'הילד/ה'}` : `Choose the world where ${formData.childName || "your child"}'s adventure will take place`}</p>
            <div className="grid grid-cols-3 gap-3">
              {settings.map(s => (
                <CardOption key={s.value} value={s.value} label={s.label} emoji={s.emoji}
                  selected={formData.setting === s.value} onClick={v => handleChange('setting', v)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Challenge ── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <p className="text-sm text-slate-500 mb-3">{isHe ? 'הסיפור יעזור לטפל בנושא זה בצורה עדינה ויעילה' : 'The story will gently address this area'}</p>
              <div className="grid grid-cols-3 gap-3">
                {challengeTypes.map(c => (
                  <CardOption key={c.value} value={c.value} label={c.label} emoji={c.emoji}
                    selected={formData.challengeType === c.value} onClick={v => handleChange('challengeType', v)} />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-medium text-slate-700">{t('form_trigger')} <span className="text-slate-400 font-normal text-xs">({isHe ? 'אופציונלי' : 'optional'})</span></Label>
              <Textarea value={formData.triggerDesc} onChange={e => handleChange('triggerDesc', e.target.value)}
                placeholder={t('form_trigger_ph')} className="rounded-xl border-slate-200 resize-none text-sm" rows={2} />
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-slate-700">{t('form_reaction')} <span className="text-slate-400 font-normal text-xs">({isHe ? 'אופציונלי' : 'optional'})</span></Label>
              <div className="grid grid-cols-3 gap-2">
                {reactionTypes.map(r => (
                  <button key={r.value} type="button" onClick={() => handleChange('reactionType', formData.reactionType === r.value ? '' : r.value)}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-xl border-2 text-xs font-medium transition-all ${formData.reactionType === r.value ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:border-amber-300'}`}>
                    <span>{r.emoji}</span><span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Final details ── */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="space-y-1">
              <Label className="font-medium text-slate-700">{t('form_hobbies')} <span className="text-slate-400 font-normal text-xs">({isHe ? 'אופציונלי' : 'optional'})</span></Label>
              <Textarea value={formData.hobbies} onChange={e => handleChange('hobbies', e.target.value)}
                placeholder={t('form_hobbies_ph')} className="rounded-xl border-slate-200 resize-none text-sm" rows={2} />
            </div>
            <div className="space-y-1">
              <Label className="font-medium text-slate-700">{t('form_email')}</Label>
              <Input type="email" value={formData.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)}
                placeholder="your@email.com" className="h-12 rounded-xl border-slate-200 text-sm" dir="ltr" />
              <p className="text-xs text-slate-400">{isHe ? 'לשם כך נשלח לך את הסיפור המוגמר' : 'We\'ll send you the finished story here'}</p>
            </div>
            <div className="space-y-1">
              <Label className="font-medium text-slate-700">{t('form_phone')} <span className="text-slate-400 font-normal text-xs">({isHe ? 'אופציונלי' : 'optional'})</span></Label>
              <Input type="tel" value={formData.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)}
                placeholder="050-0000000" className="h-12 rounded-xl border-slate-200 text-sm" dir="ltr" />
            </div>

            {/* Summary card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-sm">
              <p className="font-semibold text-slate-700">{isHe ? '📋 סיכום:' : '📋 Summary:'}</p>
              <p className="text-slate-600">👤 {formData.childName}, {isHe ? `גיל ${formData.childAge}` : `age ${formData.childAge}`}</p>
              <p className="text-slate-600">{settings.find(s => s.value === formData.setting)?.emoji} {settings.find(s => s.value === formData.setting)?.label}</p>
              <p className="text-slate-600">{challengeTypes.find(c => c.value === formData.challengeType)?.emoji} {challengeTypes.find(c => c.value === formData.challengeType)?.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {stepError && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {stepError}
        </motion.p>
      )}

      {/* Navigation */}
      <div className={`flex gap-3 mt-8 ${isHe ? 'flex-row-reverse' : ''}`}>
        {step > 1 && (
          <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-2 h-12 px-5 rounded-xl border-slate-200">
            {isHe ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isHe ? 'חזרה' : 'Back'}
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button type="button" onClick={nextStep} disabled={uploading}
            className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold flex items-center justify-center gap-2">
            {isHe ? 'המשך' : 'Next'}
            {isHe ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        ) : (
          <Button type="button" onClick={onSubmit} disabled={isLoading || uploading}
            className="flex-1 h-14 text-lg rounded-xl bg-slate-800 hover:bg-slate-700 shadow-lg transition-all flex items-center justify-center gap-2">
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" />{t('form_writing')}</> : <><Sparkles className="w-5 h-5" />{isHe ? 'המשך ליצירת הספר ✨' : 'Continue to Create Book ✨'}</>}
          </Button>
        )}
      </div>
    </div>
  );
}
