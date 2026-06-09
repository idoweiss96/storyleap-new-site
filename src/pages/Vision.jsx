import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] } })
};

const content = {
  en: {
    docLabel: 'Company Vision',
    originLabel: 'Where It Started',
    originText: 'In the early days of the war, we watched families navigate fear, separation, and uncertainty with their children, without the knowledge or tools to help them through it. We saw parents who loved their children deeply, but felt helpless. We knew technology could do better. So we started building.',
    believeLabel: 'What We Believe',
    believeTitle: "Every child's story is their own.",
    believe1: ['Children are not a category. Every child carries a unique emotional world, shaped by their family, their experiences, their fears, and their strengths. ', 'Generic support often fails them', ', not because the intention is not there, but because it does not speak to who they actually are.'],
    believe2: ['We believe that ', 'parents are the most powerful force in a child\'s emotional life.', ' Not therapists, not teachers — parents. The problem is not that parents do not care. It is that they often lack the tools, the language, or the guidance to translate that care into the right kind of support. And when they cannot help, they feel it deeply.'],
    believe3: ['We also believe that ', 'therapists and professionals deserve better tools.', ' The methods they use are proven. What is missing is the technology to deliver those methods faster, more personally, and with greater reach. StoryLeap builds that technology.'],
    serveLabel: 'Who We Serve',
    serveTitle: 'Three partners. One journey.',
    serve: [
      { icon: '🩺', role: 'The Therapist', desc: 'We give professionals AI-powered tools to create personalized therapeutic content for each child they work with, extending their impact beyond the session.', tag: 'Primary Partner' },
      { icon: '👨‍👩‍👧', role: 'The Parent', desc: 'We give parents the tools, language, and guidance to continue the emotional work at home, turning good intentions into confident, effective support.', tag: 'Operator at Home' },
      { icon: '🌱', role: 'The Child', desc: 'Every story, video, and exercise is built around them. They see themselves as the hero, build real coping tools, and grow through challenges they once faced alone.', tag: 'Ultimate Beneficiary' },
    ],
    journeyLabel: "The Parent's Journey",
    journeyTitle: 'From helpless to equipped.',
    journey: [
      { emoji: '😔', emotion: 'Frustrated', sub: 'My child is struggling and I do not know what to do' },
      { emoji: '💛', emotion: 'Relieved', sub: 'This is okay. We are not alone in this' },
      { emoji: '🤝', emotion: 'Connected', sub: 'I have tools. I can do this with my child' },
      { emoji: '🌿', emotion: 'Empowered', sub: 'We grew through this together' },
    ],
    valuesLabel: 'Our Values',
    valuesTitle: 'What we will never compromise on.',
    values: [
      { icon: '👨‍👩‍👧', name: 'Parents First', desc: "Parents are the key to a child's emotional resilience. We build tools that give them knowledge, confidence, and a clear way in.", color: '#c4a0d0' },
      { icon: '🌀', name: 'Radical Personalization', desc: "Every child has their own emotions and story. We will never offer a one-size-fits-all answer to something as personal as a child's inner world.", color: '#5a7a9a' },
      { icon: '🔍', name: 'Honest Transparency', desc: 'It is okay to make mistakes, as long as we show them, talk about them, and fix them. We hold ourselves to this as a company and model it for the families we serve.', color: '#9ab8d0' },
      { icon: '⚡', name: 'Technology With Purpose', desc: 'We harness what AI makes possible, not for its own sake, but to give therapists, parents, and children better tools than they have ever had before.', color: '#b0c9a0' },
    ],
    visionLabel: '10-Year Vision',
    visionText1: "StoryLeap will be the ",
    visionBold: "compass for children's emotional development",
    visionText2: " — a platform that helps parents navigate the challenges their children face, and gives therapists and professionals the tools to guide, track, and support their clients' journeys with clarity and confidence.",
    visionText3: "A world where no parent feels helpless, and no child faces their challenges alone.",
    howLabel: 'How We Get There',
    howTitle: 'Step by step, story by story.',
    how1: ['We start where the need is most immediate: ', 'personalized therapeutic stories', ' built around each child\'s real challenge, grounded in clinical methods therapists already use. We prove it works. We listen to families and professionals. We refine until the product earns trust.'],
    how2: 'From there, we expand. Stories become videos, art, and games — a full toolkit of therapeutic content that therapists can use with their patients, and parents can continue at home between sessions. The practitioner and the parent work together, with StoryLeap as the bridge between them.',
    how3: 'Over time, that bridge becomes a platform — one that connects the clinical world with the home, makes professional-grade emotional support accessible to every family, and turns the distance between "I do not know how to help" and "I know exactly what to do" into something we can close, together.',
    roadmapLabel: 'The Journey Ahead',
    roadmapTitle: 'From stories to a full platform.',
    roadmap: [
      { num: 'Now', title: 'Personalized Stories', desc: "Therapeutic storybooks built around each child's real challenge, grounded in bibliotherapy and CBT. Proving the model works with real families and professionals." },
      { num: 'Next', title: "A Therapist's Toolkit", desc: 'Stories expand into videos, art exercises, and games. Therapists get a platform to assign, track, and adapt personalized content for each patient they work with.' },
      { num: 'Vision', title: 'The Emotional Navigator', desc: "A platform that guides families through every stage of a child's emotional development, connecting therapists and parents around each child's unique journey." },
    ],
    closing: "We did not start this because it was a good market opportunity. We started it because we saw children who needed help, and parents who wanted to give it, and knew we could build the bridge between them.",
  },
  he: {
    docLabel: 'החזון שלנו',
    originLabel: 'איך הכל התחיל',
    originText: 'בימים הראשונים של המלחמה, ראינו משפחות שמתמודדות עם פחד, פרידה ואי-ודאות – ללא הידע או הכלים שיכולים לעזור לילדיהן לעבור את התקופה הזו. פגשנו הורים שאוהבים מאוד את ילדיהם, אך הרגישו מולם חסרי אונים. ידענו שהטכנולוגיה יכולה לעשות יותר. אז התחלנו לבנות.',
    believeLabel: 'במה אנחנו מאמינים',
    believeTitle: 'לכל ילד יש סיפור משלו.',
    believe1: ['ילדים הם לא תבנית. לכל ילד יש עולם רגשי ייחודי, שעוצב על ידי המשפחה שלו, החוויות שעבר, הפחדים והחוזקות שלו. ', 'תמיכה כללית לרוב לא עובדת', ' - לא בגלל שחסרה כוונה טובה, אלא פשוט כי היא לא מדברת אל מי שהילד באמת.'],
    believe2: ['אנחנו מאמינים שההורים הם ', 'הכוח המשמעותי ביותר בחייו הרגשיים של הילד', '. לא המטפלים, לא המורים - ההורים. הבעיה היא לא שלאכפת להם; הבעיה היא שלעתים קרובות חסרים להם הכלים, השפה וההכוונה כדי לנתב את האהבה שלהם לתמיכה הנכונה והמדויקת ביותר. וכשהם לא מצליחים לעזור לילד שלהם, הכאב שלהם עמוק.'],
    believe3: ['אנחנו גם מאמינים שלמטפלים ולאנשי מקצוע ', 'מגיעים כלים טובים יותר', '. השיטות שבהן הם משתמשים כבר הוכחו כיעילות. מה שחסר זו הטכנולוגיה שתאפשר ליישם אותן מהר יותר, באופן מותאם אישית, ועם יכולת להגיע ליותר משפחות. StoryLeap בונה בדיוק את הטכנולוגיה הזו.'],
    serveLabel: 'את מי אנחנו משרתים',
    serveTitle: 'שלושה שותפים. מסע אחד.',
    serve: [
      { icon: '🩺', role: 'המטפל/ת', desc: 'אנחנו נותנים לאנשי מקצוע כלים מבוססי AI ליצירת תוכן טיפולי מותאם אישית לכל ילד שהם עובדים איתו, ומאריכים את השפעתם מעבר לפגישה.', tag: 'השותף המקצועי' },
      { icon: '👨‍👩‍👧', role: 'ההורה', desc: 'אנחנו נותנים להורים כלים, שפה והדרכה להמשיך את העבודה הרגשית בבית, ולהפוך כוונות טובות לתמיכה בטוחה ואפקטיבית.', tag: 'מפעיל בבית' },
      { icon: '🌱', role: 'הילד/ה', desc: 'כל סיפור, סרטון ותרגיל נבנה סביבם. הם רואים את עצמם כגיבורים, בונים כלי התמודדות אמיתיים, וצומחים מאתגרים שפעם התמודדו איתם לבד.', tag: 'גיבור המסע' },
    ],
    journeyLabel: 'מסע ההורה',
    journeyTitle: 'מתחושת חוסר אונים – לארגז כלים מעשי.',
    journey: [
      { emoji: '😔', emotion: 'תסכול', sub: 'הילד שלי מתקשה ואני לא יודע/ת מה לעשות' },
      { emoji: '💛', emotion: 'הקלה', sub: 'זה בסדר. אנחנו לא לבד בזה' },
      { emoji: '🤝', emotion: 'חיבור', sub: 'יש לי כלים. אני יכול/ה לעשות את זה עם הילד שלי' },
      { emoji: '🌿', emotion: 'העצמה', sub: 'צמחנו מזה ביחד' },
    ],
    valuesLabel: 'הערכים שלנו',
    valuesTitle: 'על מה לא נתפשר.',
    values: [
      { icon: '👨‍👩‍👧', name: 'ההורים במרכז', desc: 'ההורים הם המפתח לחוסן הרגשי של הילד. אנחנו בונים כלים שמעניקים להם ידע, ביטחון ודרך ברורה לגשת אל עולמו הפנימי.', color: '#c4a0d0' },
      { icon: '🌀', name: 'התאמה אישית', desc: 'לכל ילד יש רגשות וסיפור משלו. לא נציע פתרון של "מידה אחת מתאימה לכולם" כשמדובר בדבר אישי כל כך כמו עולמו הפנימי של הילד.', color: '#5a7a9a' },
      { icon: '🔍', name: 'שקיפות מלאה', desc: 'מותר לטעות – כל עוד מכירים בכך, מדברים על זה ומתקנים. אנחנו מציבים את הסטנדרט הזה לעצמנו כחברה, ומשמשים מודל למשפחות שאנחנו מלווים.', color: '#9ab8d0' },
      { icon: '⚡', name: 'טכנולוגיה עם מטרה', desc: 'אנחנו רותמים את היכולות של הבינה המלאכותית לא כמטרה בפני עצמה, אלא כאמצעי להעניק למטפלים, להורים ולילדים את הכלים הטובים ביותר שנוצרו אי פעם.', color: '#b0c9a0' },
    ],
    visionLabel: 'חזון ל-10 שנים',
    visionText1: '',
    visionBold: 'StoryLeap תהפוך למצפן המרכזי בהתפתחות הרגשית של ילדים',
    visionText2: ' – פלטפורמה שעוזרת להורים לנווט דרך האתגרים שילדיהם חווים, ומעניקה למטפלים ולאנשי מקצוע כלים להנחות, לעקוב ולתמוך במסע של הלקוחות שלהם בבהירות ובביטחון. החזון שלנו הוא עולם שבו שום הורה אינו מרגיש חסר אונים, ואף ילד אינו מתמודד עם אתגריו לבדו.',
    visionText3: '',
    howLabel: 'איך אנחנו מגיעים לשם',
    howTitle: 'צעד אחר צעד, סיפור אחר סיפור.',
    how1: ['אנחנו מתחילים היכן שהצורך הוא המיידי ביותר: ', 'סיפורים טיפוליים מותאמים אישית', ', שנבנים סביב האתגר האמיתי של הילד ומבוססים על שיטות קליניות מוכחות שמטפלים כבר משתמשים בהן. אנחנו מוכיחים שזה עובד, מקשיבים למשפחות ולאנשי מקצוע, ומשכללים את המוצר עד שהוא זוכה לאמון מלא.'],
    how2: 'משם, אנחנו מתרחבים. הסיפורים יהפכו לסרטונים, ליצירות אמנות ולמשחקים – ארגז כלים טיפולי שלם שמטפלים יוכלו לשלב בקליניקה, והורים יוכלו להמשיך ליישם בבית בין הפגישות. המטפל וההורה יעבדו יחד, כאשר StoryLeap משמשת כגשר ביניהם.',
    how3: 'עם הזמן, הגשר הזה יהפוך לפלטפורמה מלאה – כזו שמחברת בין העולם הקליני לבית, הופכת תמיכה רגשית ברמה מקצועית לנגישה לכל משפחה, ומצמצמת את הפער בין "אני לא יודע איך לעזור" לבין "אני יודע בדיוק מה לעשות".',
    roadmapLabel: 'המסע קדימה',
    roadmapTitle: 'מסיפורים לפלטפורמה שלמה.',
    roadmap: [
      { num: 'עכשיו', title: 'סיפורים מותאמים אישית', desc: 'ספרי ילדים טיפוליים הנבנים סביב האתגר הספציפי של כל ילד, מבוססים על עקרונות של ביבליותרפיה ו-CBT. הוכחת המודל בשטח יחד עם משפחות ואנשי מקצוע מן השורה.' },
      { num: 'הבא', title: 'ארגז הכלים של המטפל', desc: 'הסיפורים יתרחבו לסרטונים, תרגילי יצירה ומשחקים. המטפלים יקבלו פלטפורמה חכמה להקצאת משימות, מעקב והתאמת תוכן מדויק לכל מטופל.' },
      { num: 'חזון', title: 'המנחה הרגשי', desc: 'פלטפורמה שמלווה משפחות בכל שלב בהתפתחות הרגשית של הילד, ומחברת בין מטפלים והורים סביב המסע הייחודי של הילד שלהם.' },
    ],
    closing: 'לא יצאנו לדרך הזו כי זיהינו הזדמנות עסקית טובה. התחלנו כי ראינו ילדים שזקוקים לעזרה, והורים שרוצים לתת אותה – וידענו שאנחנו יכולים לבנות את הגשר ביניהם.',
  }
};

export default function Vision() {
  const { lang, isRTL } = useLanguage();
  const c = content[lang] || content.en;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#fdfaf7', minHeight: '100vh', color: '#2a3a4a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        .vision-serif { font-family: 'DM Serif Display', Georgia, serif; }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '72px 44px 96px' }}>

        {/* HEADER */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="vision-serif" style={{ fontSize: 48, color: '#2a3a4a', letterSpacing: '-0.02em', marginBottom: 10 }}>StoryLeap</div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a867d' }}>{c.docLabel}</div>
          <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, #f5e0f0, #dce8f5)', borderRadius: 999, margin: '18px auto' }} />
        </motion.div>

        {/* ORIGIN */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ background: 'linear-gradient(160deg, #2a3a4a 0%, #3a4a66 60%, #5a7a9a 100%)', borderRadius: 28, padding: '52px 56px', marginBottom: 64, position: 'relative', overflow: 'hidden', boxShadow: '0 18px 40px rgba(42,58,74,0.10)' }}>
          <div style={{ position: 'absolute', top: -30, [isRTL ? 'right' : 'left']: 16, fontSize: 220, color: 'rgba(255,255,255,0.04)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>"</div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f5e0f0', opacity: 0.8, marginBottom: 22 }}>{c.originLabel}</div>
          <p className="vision-serif" style={{ fontSize: 23, fontStyle: 'italic', lineHeight: 1.72, color: 'rgba(253,250,247,0.92)' }}>{c.originText}</p>
        </motion.div>

        {/* WHAT WE BELIEVE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2} style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a7a9a', marginBottom: 12 }}>{c.believeLabel}</div>
          <div className="vision-serif" style={{ fontSize: 34, color: '#2a3a4a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 22 }}>{c.believeTitle}</div>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#5e5b54', marginBottom: 16 }}>
            {c.believe1[0]}<strong style={{ fontWeight: 600, color: '#2a3a4a' }}>{c.believe1[1]}</strong>{c.believe1[2]}
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#5e5b54', marginBottom: 16 }}>
            {c.believe2[0]}<strong style={{ fontWeight: 600, color: '#2a3a4a' }}>{c.believe2[1]}</strong>{c.believe2[2]}
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#5e5b54' }}>
            {c.believe3[0]}<strong style={{ fontWeight: 600, color: '#2a3a4a' }}>{c.believe3[1]}</strong>{c.believe3[2]}
          </p>
        </motion.div>

        {/* WHO WE SERVE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a7a9a', marginBottom: 12 }}>{c.serveLabel}</div>
          <div className="vision-serif" style={{ fontSize: 34, color: '#2a3a4a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>{c.serveTitle}</div>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 60 }}>
          {c.serve.map((s) => (
            <div key={s.role} style={{ background: 'linear-gradient(135deg, #f5e0f0 0%, #f0e8f5 55%, #dce8f5 100%)', borderRadius: 20, padding: '28px 24px', boxShadow: '0 12px 40px rgba(245,224,240,0.55)', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
              <div className="vision-serif" style={{ fontSize: 18, color: '#2a3a4a', marginBottom: 8 }}>{s.role}</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: '#5e5b54' }}>{s.desc}</div>
              <div style={{ display: 'inline-block', marginTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5a7a9a', background: 'rgba(255,255,255,0.6)', borderRadius: 999, padding: '3px 10px' }}>{s.tag}</div>
            </div>
          ))}
        </motion.div>

        {/* PARENT'S JOURNEY */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}
          style={{ background: '#fff', borderRadius: 28, padding: '44px 48px', marginBottom: 60, boxShadow: '0 8px 20px rgba(42,58,74,0.08)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a7a9a', marginBottom: 12 }}>{c.journeyLabel}</div>
          <div className="vision-serif" style={{ fontSize: 30, color: '#2a3a4a', marginBottom: 36, letterSpacing: '-0.02em' }}>{c.journeyTitle}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {c.journey.map((step, i) => (
              <div key={step.emotion} style={{ textAlign: 'center', position: 'relative', padding: '0 8px' }}>
                {i < 3 && <div style={{ position: 'absolute', [isRTL ? 'left' : 'right']: -4, top: 22, width: 8, height: 2, background: '#d8d5cf', borderRadius: 999 }} />}
                <div style={{ width: 44, height: 44, borderRadius: 999, background: 'linear-gradient(135deg, #f5e0f0 0%, #f0e8f5 55%, #dce8f5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 14px', boxShadow: '0 12px 40px rgba(245,224,240,0.55)' }}>{step.emoji}</div>
                <div className="vision-serif" style={{ fontSize: 16, color: '#2a3a4a', marginBottom: 6 }}>{step.emotion}</div>
                <div style={{ fontSize: 12, color: '#8a867d', lineHeight: 1.55, padding: '0 4px' }}>{step.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* VALUES */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a7a9a', marginBottom: 12 }}>{c.valuesLabel}</div>
          <div className="vision-serif" style={{ fontSize: 34, color: '#2a3a4a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>{c.valuesTitle}</div>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
          {c.values.map((v) => (
            <div key={v.name} style={{ background: '#fff', borderRadius: 20, padding: '28px 30px', boxShadow: '0 2px 6px rgba(42,58,74,0.06)', borderTop: `3px solid ${v.color}` }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{v.icon}</div>
              <div className="vision-serif" style={{ fontSize: 20, color: '#2a3a4a', marginBottom: 10, letterSpacing: '-0.01em' }}>{v.name}</div>
              <div style={{ fontSize: 14, lineHeight: 1.72, color: '#8a867d' }}>{v.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* 10-YEAR VISION */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8}
          style={{ background: 'linear-gradient(160deg, #2a3a4a 0%, #3a4a66 60%, #5a7a9a 100%)', borderRadius: 28, padding: '52px 56px', margin: '60px 0', boxShadow: '0 18px 40px rgba(42,58,74,0.10)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f5e0f0', opacity: 0.8, marginBottom: 22 }}>{c.visionLabel}</div>
          <div className="vision-serif" style={{ fontSize: 27, fontStyle: 'italic', lineHeight: 1.68, color: 'rgba(253,250,247,0.92)' }}>
            {c.visionText1}<span style={{ fontStyle: 'normal', color: '#dce8f5' }}>{c.visionBold}</span>{c.visionText2}
            <br /><br />
            {c.visionText3}
          </div>
        </motion.div>

        {/* HOW WE GET THERE */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={9} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a7a9a', marginBottom: 12 }}>{c.howLabel}</div>
          <div className="vision-serif" style={{ fontSize: 34, color: '#2a3a4a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 22 }}>{c.howTitle}</div>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#5e5b54', marginBottom: 16 }}>
            {c.how1[0]}<strong style={{ fontWeight: 600, color: '#2a3a4a' }}>{c.how1[1]}</strong>{c.how1[2]}
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#5e5b54', marginBottom: 16 }}>{c.how2}</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: '#5e5b54' }}>{c.how3}</p>
        </motion.div>

        {/* ROADMAP */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={10} style={{ marginBottom: 20, marginTop: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a7a9a', marginBottom: 12 }}>{c.roadmapLabel}</div>
          <div className="vision-serif" style={{ fontSize: 34, color: '#2a3a4a', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>{c.roadmapTitle}</div>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={11}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 80 }}>
          {c.roadmap.map((r) => (
            <div key={r.num} style={{ background: '#fff', borderRadius: 14, padding: '24px 22px', boxShadow: '0 2px 6px rgba(42,58,74,0.06)', [isRTL ? 'borderRight' : 'borderLeft']: '3px solid #dce8f5' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a867d', marginBottom: 10 }}>{r.num}</div>
              <div className="vision-serif" style={{ fontSize: 18, color: '#2a3a4a', marginBottom: 8 }}>{r.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.65, color: '#8a867d' }}>{r.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* CLOSING */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={12}
          style={{ textAlign: 'center', paddingTop: 52, borderTop: '1px solid rgba(42,58,74,0.10)' }}>
          <p className="vision-serif" style={{ fontSize: 21, fontStyle: 'italic', color: '#8a867d', lineHeight: 1.72, maxWidth: '54ch', margin: '0 auto 20px' }}>
            {c.closing}
          </p>
          <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, #f5e0f0, #dce8f5)', borderRadius: 999, margin: '0 auto 20px' }} />
          <div className="vision-serif" style={{ fontSize: 20, color: '#2a3a4a', letterSpacing: '-0.01em' }}>StoryLeap</div>
        </motion.div>

      </div>
    </div>
  );
}