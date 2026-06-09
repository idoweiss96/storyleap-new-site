import React, { useState } from 'react';
import { uploadFile } from '@/api/apiClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Upload, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

async function convertHeicToJpeg(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
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

export default function StoryForm({ formData, setFormData, onSubmit, isLoading }) {
  const { t, lang } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const genders = [
    { value: 'boy', label: t('gender_boy') },
    { value: 'girl', label: t('gender_girl') },
    { value: 'other', label: t('gender_other') },
  ];
  const settings = [
    { value: 'space', label: t('setting_space'), emoji: '🚀' },
    { value: 'forest', label: t('setting_forest'), emoji: '🌳' },
    { value: 'castle', label: t('setting_castle'), emoji: '🏰' },
    { value: 'sports', label: t('setting_sports'), emoji: '⚽' },
    { value: 'real_life', label: t('setting_real_life'), emoji: '🏠' },
  ];
  const challengeTypes = [
    { value: 'fears', label: t('ch_fears'), emoji: '😨' },
    { value: 'social_difficulty', label: t('ch_social'), emoji: '👥' },
    { value: 'changes', label: t('ch_changes'), emoji: '🔄' },
    { value: 'emotional_regulation', label: t('ch_emotional'), emoji: '💭' },
    { value: 'separation_anxiety', label: t('ch_separation'), emoji: '🤗' },
    { value: 'self_confidence', label: t('ch_confidence'), emoji: '💪' },
    { value: 'sleep_issues', label: t('ch_sleep'), emoji: '🌙' },
  ];
  const reactionTypes = [
    { value: 'outburst', label: t('r_outburst') },
    { value: 'withdrawal', label: t('r_withdrawal') },
    { value: 'attention_seeking', label: t('r_attention') },
    { value: 'crying', label: t('r_crying') },
    { value: 'aggression', label: t('r_aggression') },
    { value: 'avoidance', label: t('r_avoidance') },
  ];

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    let file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (/\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif') {
        file = await convertHeicToJpeg(file);
      }
      const { file_url } = await uploadFile(file);
      handleChange('childImage', file_url);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => handleChange('childImage', '');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Section 1: Child Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">{t('form_child_info')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="childName" className="text-gray-700 font-medium">{t('form_child_name')}</Label>
            <Input id="childName" value={formData.childName} onChange={(e) => handleChange('childName', e.target.value)}
              placeholder={t('form_child_name_ph')} className="h-11 rounded-xl border-violet-200 focus:border-violet-400 focus:ring-violet-400" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="childAge" className="text-gray-700 font-medium">{t('form_age')}</Label>
            <Input id="childAge" type="number" min="1" max="12" value={formData.childAge} onChange={(e) => handleChange('childAge', e.target.value)}
              placeholder={t('form_age_ph')} className="h-11 rounded-xl border-violet-200 focus:border-violet-400 focus:ring-violet-400" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-gray-700 font-medium">{t('form_gender')}</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)} required>
              <SelectTrigger className="h-11 rounded-xl border-violet-200 focus:border-violet-400 focus:ring-violet-400">
                <SelectValue placeholder={t('form_gender_ph')} />
              </SelectTrigger>
              <SelectContent>{genders.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">{t('form_image')} <span className="text-red-500">*</span></Label>
          {formData.childImage ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-violet-200">
              <img src={formData.childImage} alt="Child" className="w-full h-full object-cover" />
              <button type="button" onClick={removeImage} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-red-200 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
              <input type="file" accept="image/jpeg,image/png,image/jpg,.heic,.heif" onChange={handleImageUpload} className="hidden" />
              {uploading ? <Loader2 className="w-6 h-6 text-slate-400 animate-spin" /> : (
                <><Upload className="w-6 h-6 text-red-400 mb-1" /><span className="text-xs text-red-500 font-medium">{t('form_upload')}</span></>
              )}
            </label>
          )}
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
            {lang === 'he' ? 'העלו תמונה של הילד/ה כדי שהסיפור יהיה אישי ומיוחד 📸 התמונה נמחקת מיד עם סיום יצירת הסיפור.' : "Upload a photo to make the story personal and unique 📸 The photo is deleted as soon as the story is created."}
          </p>
        </div>
      </div>

      {/* Section 2: Story Setting */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">{t('form_story_world')}</h3>
        <div className="space-y-2">
          <Label htmlFor="setting" className="text-gray-700 font-medium">{t('form_setting')}</Label>
          <Select value={formData.setting} onValueChange={(value) => handleChange('setting', value)} required>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400">
              <SelectValue placeholder={t('form_setting_ph')} />
            </SelectTrigger>
            <SelectContent>
              {settings.map((s) => <SelectItem key={s.value} value={s.value}><span className="flex items-center gap-2"><span>{s.emoji}</span><span>{s.label}</span></span></SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section 3: Challenge */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">{t('form_challenge_section')}</h3>
        <div className="space-y-2">
          <Label htmlFor="challengeType" className="text-gray-700 font-medium">{t('form_challenge')}</Label>
          <Select value={formData.challengeType} onValueChange={(value) => handleChange('challengeType', value)} required>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400">
              <SelectValue placeholder={t('form_challenge_ph')} />
            </SelectTrigger>
            <SelectContent>
              {challengeTypes.map((c) => <SelectItem key={c.value} value={c.value}><span className="flex items-center gap-2"><span>{c.emoji}</span><span>{c.label}</span></span></SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="triggerDesc" className="text-gray-700 font-medium">{t('form_trigger')}</Label>
          <Textarea id="triggerDesc" value={formData.triggerDesc} onChange={(e) => handleChange('triggerDesc', e.target.value)}
            placeholder={t('form_trigger_ph')} className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400 resize-none" rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reactionType" className="text-gray-700 font-medium">{t('form_reaction')}</Label>
          <Select value={formData.reactionType} onValueChange={(value) => handleChange('reactionType', value)}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400">
              <SelectValue placeholder={t('form_reaction_ph')} />
            </SelectTrigger>
            <SelectContent>{reactionTypes.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {/* Section 4: Personal Connection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">{t('form_personal')}</h3>
        <div className="space-y-2">
          <Label htmlFor="hobbies" className="text-gray-700 font-medium">{t('form_hobbies')}</Label>
          <Textarea id="hobbies" value={formData.hobbies} onChange={(e) => handleChange('hobbies', e.target.value)}
            placeholder={t('form_hobbies_ph')} className="rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400 resize-none" rows={2} />
        </div>
      </div>

      {/* Section 5: Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">{t('form_contact')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-gray-700 font-medium">{t('form_email')}</Label>
            <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="your@email.com" className="h-11 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-gray-700 font-medium">{t('form_phone')}</Label>
            <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={(e) => handleChange('contactPhone', e.target.value)}
              placeholder="050-0000000" className="h-11 rounded-xl border-slate-200 focus:border-slate-400 focus:ring-slate-400" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button type="submit" disabled={isLoading || uploading}
          className="w-full h-14 text-lg rounded-xl bg-slate-800 hover:bg-slate-700 shadow-lg shadow-slate-200 hover:shadow-slate-300 transition-all">
          {isLoading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('form_writing')}</span>
          ) : (
            <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" />{lang === 'he' ? 'המשך ליצירת הספר ←' : 'Continue to Create Book →'}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
