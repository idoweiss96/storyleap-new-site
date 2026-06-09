import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import { invokeFunction } from '@/api/apiClient';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.message) { setError(t('contact_error_required')); return; }
    setIsLoading(true);
    try {
      await invokeFunction('sendFormEmail', {
        formType: 'Contact Form - StoryLeap',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        additionalFields: { 'Message': formData.message }
      });
      setSubmitted(true);
    } catch (_) { setError(t('contact_error_send')); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #BAD1FA, #9ab8f5)' }}>
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{t('contact_title')}</h1>
          <p className="text-slate-500">{t('contact_subtitle')}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-0 shadow-xl shadow-slate-100">
          <CardContent className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('contact_success_title')}</h2>
                <p className="text-slate-500">{t('contact_success_msg')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="p-3 rounded-xl text-red-700 text-sm" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">{t('contact_name')} *</Label>
                    <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder={t('contact_name_ph')} className="h-11 rounded-xl border-slate-200" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">{t('contact_email')} *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="your@email.com" className="h-11 rounded-xl border-slate-200" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">{t('contact_phone')}</Label>
                  <Input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="050-0000000" className="h-11 rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">{t('contact_message')} *</Label>
                  <Textarea value={formData.message} onChange={(e) => handleChange('message', e.target.value)} placeholder={t('contact_message_ph')} className="rounded-xl border-slate-200 resize-none" rows={4} required />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-white font-semibold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #BAD1FA, #7eb3f5)' }}>
                  {isLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('contact_sending')}</span> : <span className="flex items-center gap-2"><Send className="w-4 h-4" />{t('contact_send')}</span>}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-md text-center p-4">
            <Mail className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-xs text-slate-500">{t('contact_info_email')}</p>
            <p className="text-sm font-medium text-slate-700">hello@storyleapai.com</p>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-md text-center p-4">
            <Phone className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-xs text-slate-500">{t('contact_info_phone')}</p>
            <p className="text-sm font-medium text-slate-700">+972-528330198</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
