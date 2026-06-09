# StoryLeap — Project Context for AI Assistants

## Live URLs
- **Frontend (האתר)**: https://storyleap-new-site-1.onrender.com
- **Backend (API)**: נפרד על Render
- **GitHub**: https://github.com/idoweiss96/storyleap-new-site

## מה האתר עושה
StoryLeap הוא אתר ליצירת סיפורים טיפוליים מותאמים אישית לילדים.
הורה ממלא שאלון על הילד → מבצע תשלום → מקבל סיפור מותאם אישית במייל.

## Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js (Node.js)
- **Database + Auth**: Supabase (PostgreSQL)
- **תשלומים**: PayPal
- **מיילים**: Resend
- **Google Sheets**: סנכרון סיפורים עם Service Account

## מבנה תיקיות
```
src/
  pages/        ← דפי האתר (Home, CreateStory, MyStories, Pricing, Admin...)
  components/   ← רכיבי UI משותפים
  api/          ← supabaseClient.js, apiClient.js
  lib/          ← AuthContext, utils
server/
  index.js      ← Express backend (פורט 3001)
```

## דפים עיקריים
- `/` → Home.jsx — דף הבית
- `/CreateStory` → CreateStory.jsx — שאלון יצירת סיפור
- `/MyStories` → MyStories.jsx — סיפורים של המשתמש
- `/Pricing` → Pricing.jsx — רכישת קרדיטים
- `/Login` → Login.jsx — התחברות (Magic Link + Google)
- `/Admin` → Admin.jsx — ניהול (למנהלים בלבד)

## הערות עיצוב
- כיוון: RTL (עברית) / LTR (אנגלית) — נשלט דרך LanguageContext
- צבעי ברירת מחדל: slate-800 (כהה), amber (זהב), violet (סגול)
- UI Library: shadcn/ui (רכיבים בתיקיית src/components/ui/)
- תמונות רקע ולוגו: CDN של Base44 (עדיין פעיל)
