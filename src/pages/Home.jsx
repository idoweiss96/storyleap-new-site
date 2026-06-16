import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Star, BookOpen, Wand2, Heart, ArrowLeft, Dumbbell, ChevronRight, ChevronLeft, Quote } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import GiftBanner from '../components/GiftBanner';

function TestimonialsCarousel() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const testimonials = [
  { name: t('t1_name'), text: t('t1_text'), stars: 5 },
  { name: t('t2_name'), text: t('t2_text'), stars: 5 },
  { name: t('t3_name'), text: t('t3_text'), stars: 5 },
  { name: t('t4_name'), text: t('t4_text'), stars: 5 },
  { name: t('t5_name'), text: t('t5_text'), stars: 5 },
  { name: t('t6_name'), text: t('t6_text'), stars: 5 }];


  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  const prev = () => {setCurrent((current - 1 + testimonials.length) % testimonials.length);setAutoPlay(false);};
  const next = () => {setCurrent((current + 1) % testimonials.length);setAutoPlay(false);};
  const item = testimonials[current];

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{t('testimonials_title')}</h2>
        <p className="text-slate-500">{t('testimonials_subtitle')}</p>
      </div>
      <div className="max-w-2xl mx-auto relative">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-0 shadow-xl shadow-slate-100">
            <CardContent className="p-8 text-center">
              <Quote className="w-10 h-10 text-slate-300 mx-auto mb-4 rotate-180" />
              <p className="text-slate-700 text-lg leading-relaxed mb-6">"{item.text}"</p>
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(item.stars)].map((_, i) =>
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                )}
              </div>
              <p className="font-semibold text-slate-700">{item.name}</p>
            </CardContent>
          </Card>
        </motion.div>
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={prev} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) =>
            <button key={i} onClick={() => {setCurrent(i);setAutoPlay(false);}}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-slate-700 w-6' : 'bg-slate-300'}`} />
            )}
          </div>
          <button onClick={next} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </section>);

}

export default function Home() {
  const { t, lang } = useLanguage();

  const features = [
  { icon: Wand2, title: t('feature1_title'), description: t('feature1_desc'), bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: Dumbbell, title: t('feature2_title'), description: t('feature2_desc'), bg: 'bg-rose-50', iconColor: 'text-rose-500' },
  { icon: Heart, title: t('feature3_title'), description: t('feature3_desc'), bg: 'bg-amber-50', iconColor: 'text-amber-500' }];


  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) =>
          <Star key={i}
          className={`absolute w-3 h-3 text-blue-200 fill-blue-100 opacity-60 star-twinkle${i % 3 === 0 ? '' : i % 3 === 1 ? '-delay' : '-delay-2'}`}
          style={{ top: `${10 + i * 7 % 80}%`, left: `${i * 9 % 100}%` }} />
          )}
        </div>
        <div className="relative text-center max-w-3xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-100">
              <Sparkles className="w-4 h-4" />
               {lang === 'he' ? 'סיפורי העצמה לילדים' : t('hero_badge')}
              </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
              {t('hero_title1')}
              <br />
              <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                 {t('hero_title2')}
               </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed whitespace-pre-line">
               {t('hero_subtitle')}
             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('CreateStory')}>
                <Button size="lg" className="h-14 px-8 text-lg rounded-xl text-white shadow-lg shadow-slate-200 transition-all hover:bg-[#BAD1FA] hover:text-slate-800 hover:shadow-blue-200 bg-[#ffc157]">
                  <Sparkles className="w-5 h-5 ml-2" />
                  {t('hero_cta_new')}
                </Button>
              </Link>
              <Link to={createPageUrl('MyStories')}>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                  <BookOpen className="w-5 h-5 ml-2" />
                  {t('hero_cta_mine')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <GiftBanner />

      {/* Features Section */}
      <section className="py-12 hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card className="h-full border-0 shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-slate-200 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>);

          })}
        </div>
      </section>

      {/* Maya Story CTA */}
      <section className="py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg shadow-amber-100 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8"
              style={{ background: 'linear-gradient(135deg, #fff8ed 0%, #fde8c8 100%)' }}>
                <div className="flex-1 text-center md:text-right">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">✨ {t('maya_sample')}</p>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('maya_title')}</h3>
                  <Link to="/MayaStory">
                    <Button className="rounded-xl px-6" style={{ background: '#c07028', color: 'white' }}>
                       📖 {t('maya_btn')}
                     </Button>
                  </Link>
                </div>
                <img src="https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/MAYA.png"
                alt="Princess Maya"
                className="w-36 md:w-44 object-contain drop-shadow-lg rounded-md" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{t('gallery_title')}</h2>
          <p className="text-slate-500">{t('gallery_subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image4.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image52.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image51.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image5.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image54.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image53.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image1.png',
          'https://xhczjpgnlcqaofqplnxg.supabase.co/storage/v1/object/public/site-assets/gallery/image3.png'].
          map((src, i) =>
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
          className="aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <img src={src} alt={`gallery ${i + 1}`} className="w-full h-full object-cover" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* Security Badge */}
      <section className="py-4 flex justify-center">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm text-slate-500">
          <span className="flex items-center gap-2"><span className="text-green-500">🔒</span> {lang === 'he' ? 'המידע שלכם מוצפן ומאובטח' : 'Your data is encrypted & secure'}</span>
          <span className="w-px h-4 bg-slate-200 hidden sm:block" />
          <span className="flex items-center gap-2"><span>🛡️</span> {lang === 'he' ? 'לא נשתף מידע עם צד שלישי' : 'We never share your data'}</span>
          <span className="w-px h-4 bg-slate-200 hidden sm:block" />
          <span className="flex items-center gap-2"><span>✅</span> {lang === 'he' ? 'עמידה בתקני פרטיות' : 'Privacy compliant'}</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="overflow-hidden border-0 shadow-2xl shadow-slate-200">
            <div className="p-8 md:p-12 text-white text-center relative" style={{ background: 'linear-gradient(135deg, #BAD1FA, #9ab8f5)' }}>
              <Star className="absolute top-4 right-8 w-6 h-6 text-blue-300 fill-blue-300 opacity-60" />
              <Star className="absolute bottom-6 left-12 w-4 h-4 text-blue-200 fill-blue-200 opacity-40" />
              <Star className="absolute top-8 left-20 w-3 h-3 text-white/30 fill-white/30" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('cta_title')}</h2>
              <p className="mb-6 max-w-lg mx-auto text-slate-500">{t('cta_desc')}</p>
              <Link to={createPageUrl('CreateStory')}>
                <Button size="lg" className="h-12 px-8 rounded-xl bg-white text-slate-800 hover:bg-slate-100 font-semibold">
                  {t('cta_btn')}
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>);

}