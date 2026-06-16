import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { google } from 'googleapis';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Clients ───────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@storyleapai.com';

const SPREADSHEET_ID_HE = '1yT2WdAlyjpp8gciT4iZYEL122FyrliTin3MEcTvvr20';
const SPREADSHEET_ID_EN = '1-LZ-ai2LdJ4BoTTdSacDRl-L0LpcIEg5JrCKK6txLxg';

// ── Google Sheets auth (Service Account) ──────────────────────────────────────
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Auth helper ───────────────────────────────────────────────────────────────
async function getUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return null;
  return user;
}

// ── PayPal helpers ────────────────────────────────────────────────────────────
async function getPaypalAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

// ── Email helpers ─────────────────────────────────────────────────────────────
async function sendStoryInProgressEmail(email, childName, isHebrew) {
  if (!email) return;
  const subject = isHebrew
    ? 'הקסם מתחיל! אנחנו כבר עובדים על הסיפור שלך 📝✨'
    : "The magic begins! We're working on your story 📝✨";
  const html = isHebrew
    ? `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
        <h2>היי,</h2>
        <p style="font-size:16px;line-height:1.7;">איזה כיף! קיבלנו את הפרטים בהצלחה.</p>
        <p style="font-size:16px;line-height:1.7;">אנחנו כבר עובדים על יצירת הסיפור המיוחד שלכם.</p>
        <p style="font-size:16px;line-height:1.7;">ברגע שהסיפור יהיה מוכן, נשלח לך מייל עדכון נוסף עם קישור ישיר לקריאה.</p>
        <p style="margin-top:24px;font-size:15px;">תודה,<br/>צוות StoryLeap</p>
      </div>`
    : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
        <h2>Hi there,</h2>
        <p style="font-size:16px;line-height:1.7;">Exciting news! We received your details successfully.</p>
        <p style="font-size:16px;line-height:1.7;">We are already working on creating your special story.</p>
        <p style="font-size:16px;line-height:1.7;">As soon as the story is ready, we will send you another email with a direct link to read it.</p>
        <p style="margin-top:24px;font-size:15px;">Best regards,<br/>StoryLeap</p>
      </div>`;
  await resend.emails.send({ from: 'StoryLeap AI <stories@storyleapai.com>', to: email, subject, html });
}

// ── Sheets helpers ────────────────────────────────────────────────────────────
const genderMapHE = { boy: 'בן', girl: 'בת', other: 'אחר' };
const settingMapHE = { space: 'חלל', forest: 'יער קסום', castle: 'ארמון', sports: 'ספורט', real_life: 'חיים אמיתיים' };
const challengeMapHE = { fears: 'פחדים', social_difficulty: 'קושי חברתי', changes: 'שינויים', emotional_regulation: 'ויסות רגשי', separation_anxiety: 'חרדת נטישה', self_confidence: 'ביטחון עצמי', sleep_issues: 'קשיי שינה' };
const reactionMapHE = { outburst: 'התפרצות', withdrawal: 'הסתגרות', attention_seeking: 'חיפוש תשומת לב', crying: 'בכי', aggression: 'תוקפנות', avoidance: 'הימנעות' };
const genderMapEN = { boy: 'Boy', girl: 'Girl', other: 'Other' };
const settingMapEN = { space: 'Space', forest: 'Enchanted Forest', castle: 'Castle', sports: 'Sports', real_life: 'Real Life' };
const challengeMapEN = { fears: 'Fears', social_difficulty: 'Social Difficulty', changes: 'Changes', emotional_regulation: 'Emotional Regulation', separation_anxiety: 'Separation Anxiety', self_confidence: 'Self Confidence', sleep_issues: 'Sleep Issues' };
const reactionMapEN = { outburst: 'Outburst', withdrawal: 'Withdrawal', attention_seeking: 'Attention Seeking', crying: 'Crying', aggression: 'Aggression', avoidance: 'Avoidance' };

function isHebrewText(text) { return /[֐-׿]/.test(text || ''); }

function storyToRow(story, lang) {
  const createdDate = story.created_at ? new Date(story.created_at).toLocaleDateString('he-IL') : '';
  const gMap = lang === 'he' ? genderMapHE : genderMapEN;
  const sMap = lang === 'he' ? settingMapHE : settingMapEN;
  const cMap = lang === 'he' ? challengeMapHE : challengeMapEN;
  const rMap = lang === 'he' ? reactionMapHE : reactionMapEN;
  return [
    createdDate,
    story.child_name || '',
    story.child_age || '',
    gMap[story.gender] || story.gender || '',
    sMap[story.setting] || story.setting || '',
    cMap[story.challenge_type] || story.challenge_type || '',
    story.trigger_desc || '',
    rMap[story.reaction_type] || story.reaction_type || '',
    story.hobbies || '',
    story.contact_email || '',
    story.contact_phone || '',
    story.child_image || '',
    story.story_link || '',
  ];
}

// ── Functions ─────────────────────────────────────────────────────────────────

async function submitStoryWithCredits({ story_id }, user) {
  const { data: users } = await supabase.from('users').select('*').eq('email', user.email);
  const dbUser = users?.[0];
  if (!dbUser) throw new Error('User not found');

  const currentCredits = dbUser.credits || 0;
  if (currentCredits < 20) {
    return { success: false, reason: 'insufficient_credits', credits: currentCredits };
  }

  await supabase.from('users').update({ credits: currentCredits - 20 }).eq('id', dbUser.id);
  await supabase.from('stories').update({ payment_status: 'paid' }).eq('id', story_id);

  const { data: story } = await supabase.from('stories').select('*').eq('id', story_id).single();
  const isHebrew = isHebrewText(story?.child_name);
  if (story?.contact_email) {
    sendStoryInProgressEmail(story.contact_email, story.child_name, isHebrew).catch(() => {});
  }

  // Add to Google Sheets asynchronously
  addStoryToSheet({ data: story }).catch(() => {});

  return { success: true, credits_remaining: currentCredits - 20 };
}

async function createPaypalOrder({ story_id }, user) {
  const { data: story } = await supabase.from('stories').select('*').eq('id', story_id).single();
  if (!story) throw new Error('Story not found');

  const { data: existingOrders } = await supabase.from('orders').select('*')
    .eq('story_id', story_id).eq('user_email', user.email);
  const existingPending = existingOrders?.find(o => o.status === 'pending_payment' && o.paypal_order_id);
  if (existingPending) return { order_id: existingPending.id, paypal_order_id: existingPending.paypal_order_id };

  const accessToken = await getPaypalAccessToken();
  const ppRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `storyleap-${story_id}-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: story_id,
        description: `Personalized Therapeutic Story by StoryLeap for ${story.child_name}`,
        amount: { currency_code: 'ILS', value: '45.00' },
      }],
      application_context: {
        brand_name: 'StoryLeap AI',
        user_action: 'PAY_NOW',
        return_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/PaymentSuccess?story_id=${story_id}`,
        cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:5173'}/PaymentCancel`,
      },
    }),
  });
  const ppData = await ppRes.json();
  if (!ppRes.ok || !ppData.id) throw new Error(ppData.message || 'PayPal error');

  const { data: order } = await supabase.from('orders').insert({
    story_id, user_email: user.email, paypal_order_id: ppData.id,
    status: 'pending_payment', amount: 45, currency: 'ILS',
  }).select().single();

  return { order_id: order.id, paypal_order_id: ppData.id };
}

async function capturePaypalOrder({ paypal_order_id, order_id, story_id }, user) {
  let order;
  if (order_id) {
    const { data } = await supabase.from('orders').select('*').eq('id', order_id).single();
    order = data;
  } else if (story_id) {
    const { data: existing } = await supabase.from('orders').select('*')
      .eq('story_id', story_id).eq('status', 'pending_payment');
    if (existing?.length > 0) {
      order = existing[0];
    } else {
      const { data: story } = await supabase.from('stories').select('*').eq('id', story_id).single();
      if (!story) throw new Error('Story not found');
      const { data: newOrder } = await supabase.from('orders').insert({
        story_id, user_email: user.email, paypal_order_id,
        status: 'pending_payment', amount: 45, currency: 'ILS',
      }).select().single();
      order = newOrder;
    }
  }
  if (!order) throw new Error('Order not found');
  if (['paid', 'story_generating', 'story_ready'].includes(order.status)) {
    return { success: true, status: order.status, already_processed: true };
  }

  const accessToken = await getPaypalAccessToken();
  const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypal_order_id}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `capture-${order.id}`,
    },
  });
  const captureData = await captureRes.json();
  if (!captureRes.ok || captureData.status !== 'COMPLETED') {
    await supabase.from('orders').update({ status: 'failed', error_message: captureData.message || 'Capture failed' }).eq('id', order.id);
    throw Object.assign(new Error('Payment capture failed'), { details: captureData, status: 400 });
  }

  const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  await supabase.from('orders').update({ status: 'paid', paypal_capture_id: captureId }).eq('id', order.id);
  await supabase.from('stories').update({ payment_status: 'paid' }).eq('id', order.story_id);

  // Add to Google Sheets + send email
  const { data: story } = await supabase.from('stories').select('*').eq('id', order.story_id).single();
  if (story) {
    const isHebrew = isHebrewText(story.child_name);
    if (story.contact_email) {
      sendStoryInProgressEmail(story.contact_email, story.child_name, isHebrew).catch(() => {});
    }
    addStoryToSheet({ data: story }).catch(() => {});
  }

  // Add 20 credits to the buyer after successful story purchase
  try {
    const { data: users } = await supabase.from('users').select('*').eq('email', order.user_email);
    if (users?.[0]) {
      await supabase.from('users').update({ credits: (users[0].credits || 0) + 20 }).eq('id', users[0].id);
    }
  } catch (_) {}

  return { success: true, status: 'paid', capture_id: captureId };
}

async function createCreditsOrder({ currency = 'ILS', amount = '45.00', return_url, cancel_url }, user) {
  const accessToken = await getPaypalAccessToken();
  const ppRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `credits-${user.email}-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ description: 'StoryLeap - 20 Credits', amount: { currency_code: currency, value: amount } }],
      application_context: {
        brand_name: 'StoryLeap AI', user_action: 'PAY_NOW',
        return_url: return_url || `${process.env.VITE_APP_URL || 'http://localhost:5173'}/Pricing`,
        cancel_url: cancel_url || `${process.env.VITE_APP_URL || 'http://localhost:5173'}/Pricing`,
      },
    }),
  });
  const ppData = await ppRes.json();
  if (!ppRes.ok || !ppData.id) throw new Error(ppData.message || 'PayPal error');
  return { paypal_order_id: ppData.id, client_id: process.env.PAYPAL_CLIENT_ID };
}

async function validateCoupon({ code }, user) {
  if (!code) throw Object.assign(new Error('Missing coupon code'), { status: 400 });
  const normalizedCode = code.trim().toUpperCase();

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .single();

  if (error || !coupon) throw Object.assign(new Error('Invalid coupon code'), { status: 400 });
  if (!coupon.active) throw Object.assign(new Error('Coupon is no longer active'), { status: 400 });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw Object.assign(new Error('Coupon has expired'), { status: 400 });
  }

  // Check total usage limit
  if (coupon.max_uses !== null) {
    const { count } = await supabase
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_code', normalizedCode);
    if (count >= coupon.max_uses) throw Object.assign(new Error('Coupon usage limit reached'), { status: 400 });
  }

  // Check per-user usage limit
  if (coupon.max_uses_per_user !== null) {
    const { count } = await supabase
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_code', normalizedCode)
      .eq('user_email', user.email);
    if (count >= coupon.max_uses_per_user) {
      throw Object.assign(new Error('You have already used this coupon'), { status: 400 });
    }
  }

  return { valid: true, coupon };
}

async function captureCreditsOrder({ paypal_order_id, credits = 20, coupon, coupon_code }, user) {
  // If this is a free-credit coupon redemption, validate it server-side
  if (coupon && coupon_code) {
    const normalizedCode = coupon_code.trim().toUpperCase();
    // Re-validate to prevent replay attacks
    await validateCoupon({ code: normalizedCode }, user);

    const { data: users } = await supabase.from('users').select('*').eq('email', user.email);
    const currentUser = users?.[0];
    if (!currentUser) throw new Error('User not found');

    const newCredits = (currentUser.credits || 0) + credits;
    await supabase.from('users').update({ credits: newCredits }).eq('id', currentUser.id);

    // Record redemption
    await supabase.from('coupon_redemptions').insert({ coupon_code: normalizedCode, user_email: user.email });

    return { success: true, credits_added: credits, new_total: newCredits };
  }

  // Standard PayPal payment flow (coupon=true means hosted button, no code needed)
  if (!coupon) {
    const accessToken = await getPaypalAccessToken();
    const orderCheckRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypal_order_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const orderData = await orderCheckRes.json();

    if (orderData.status !== 'COMPLETED') {
      if (orderData.status === 'APPROVED' || orderData.status === 'CREATED') {
        const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypal_order_id}/capture`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `capture-credits-${paypal_order_id}`,
          },
        });
        const captureData = await captureRes.json();
        if (!captureRes.ok || captureData.status !== 'COMPLETED') {
          throw Object.assign(new Error('Payment capture failed'), { details: captureData, status: 400 });
        }
      } else {
        throw Object.assign(new Error(`Invalid order status: ${orderData.status}`), { status: 400 });
      }
    }
  }

  const { data: users } = await supabase.from('users').select('*').eq('email', user.email);
  const currentUser = users?.[0];
  if (!currentUser) throw new Error('User not found');

  const newCredits = (currentUser.credits || 0) + credits;
  await supabase.from('users').update({ credits: newCredits }).eq('id', currentUser.id);

  return { success: true, credits_added: credits, new_total: newCredits };
}

async function sendFormEmail(body) {
  const {
    formType = 'טופס כללי', name = '', email = '', phone = '', message = '',
    childName = '', childAge = '', gender = '', setting = '',
    challengeType = '', hobbies = '', additionalFields = {},
  } = body;

  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
  const timeStr = now.toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem' });

  let fieldsHtml = `
    <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;width:160px;">סוג הטופס</td><td style="padding:8px 12px;color:#1f2937;">${formType}</td></tr>
    <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">תאריך ושעה</td><td style="padding:8px 12px;color:#1f2937;">${dateStr} ${timeStr}</td></tr>
  `;
  if (name) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">שם</td><td style="padding:8px 12px;color:#1f2937;">${name}</td></tr>`;
  if (email) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">אימייל</td><td style="padding:8px 12px;color:#1f2937;">${email}</td></tr>`;
  if (phone) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">טלפון</td><td style="padding:8px 12px;color:#1f2937;">${phone}</td></tr>`;
  if (childName) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">שם הילד/ה</td><td style="padding:8px 12px;color:#1f2937;">${childName}</td></tr>`;
  if (childAge) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">גיל</td><td style="padding:8px 12px;color:#1f2937;">${childAge}</td></tr>`;
  if (gender) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">מגדר</td><td style="padding:8px 12px;color:#1f2937;">${gender}</td></tr>`;
  if (setting) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">תפאורה</td><td style="padding:8px 12px;color:#1f2937;">${setting}</td></tr>`;
  if (challengeType) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">אתגר רגשי</td><td style="padding:8px 12px;color:#1f2937;">${challengeType}</td></tr>`;
  if (hobbies) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">תחביבים</td><td style="padding:8px 12px;color:#1f2937;">${hobbies}</td></tr>`;
  if (message) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">הודעה</td><td style="padding:8px 12px;color:#1f2937;">${message}</td></tr>`;
  for (const [key, value] of Object.entries(additionalFields)) {
    if (value) fieldsHtml += `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">${key}</td><td style="padding:8px 12px;color:#1f2937;">${value}</td></tr>`;
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;direction:rtl;">
      <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">StoryLeap AI — הגשה חדשה 📬</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">${formType}</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px;">
        <table style="width:100%;border-collapse:collapse;">${fieldsHtml}</table>
      </div>
    </div>`;

  await resend.emails.send({
    from: 'StoryLeap AI <onboarding@resend.dev>',
    to: [ADMIN_EMAIL],
    subject: `[StoryLeap] ${formType} — ${name || email}`,
    html,
  });
  return { success: true };
}

async function sendStoryReadyEmail({ to, childName, storyLink, isHebrew }) {
  if (!to) throw new Error('Missing required fields');
  const subject = isHebrew
    ? `✨ הסיפור האישי של ${childName} מוכן!`
    : `✨ ${childName}'s personalized story is ready!`;

  const linkSection = storyLink
    ? (isHebrew
        ? `<p style="font-size:15px;font-weight:bold;">לקריאת הסיפור:</p><p><a href="${storyLink}" style="display:inline-block;background:#1e293b;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:16px;">לקריאת הסיפור ←</a></p>`
        : `<p style="font-size:15px;font-weight:bold;">Read the story here:</p><p><a href="${storyLink}" style="display:inline-block;background:#1e293b;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:16px;">Read the story here →</a></p>`)
    : '';

  const html = isHebrew
    ? `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;line-height:1.8;">
        <p style="font-size:18px;">היי ✨</p>
        <p style="font-size:18px;font-weight:bold;">הסיפור האישי של ${childName} מוכן 💛</p>
        <p style="font-size:15px;">🤍 אחרי הקריאה, אפשר לעצור רגע יחד ולפתוח בשיחה קטנה ונעימה.</p>
        ${linkSection}
        <p style="font-size:15px;margin-top:24px;">תודה שבחרתם ב-StoryLeap 💛<br/>צוות StoryLeap</p>
      </div>`
    : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;line-height:1.8;">
        <p style="font-size:18px;">Hi there ✨</p>
        <p style="font-size:18px;font-weight:bold;">${childName}'s personalized story is ready 💛</p>
        ${linkSection}
        <p style="font-size:15px;margin-top:24px;">Thank you for choosing StoryLeap 💛<br/>The StoryLeap Team</p>
      </div>`;

  await resend.emails.send({ from: 'StoryLeap AI <stories@storyleapai.com>', to, subject, html });
  return { success: true };
}

async function notifyNewStory(body) {
  const story = body.data || body;
  const now = new Date();
  const dateStr = now.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' });
  const timeStr = now.toLocaleTimeString('he-IL', { timeZone: 'Asia/Jerusalem' });

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;direction:rtl;">
      <div style="background:linear-gradient(135deg,#1e293b,#334155);padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">StoryLeap AI — הגשת סיפור חדש 📬</h1>
        <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">${dateStr} ${timeStr}</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;width:160px;">שם הילד/ה</td><td style="padding:8px 12px;color:#1f2937;">${story.child_name || ''}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">גיל</td><td style="padding:8px 12px;color:#1f2937;">${story.child_age || ''}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">אתגר רגשי</td><td style="padding:8px 12px;color:#1f2937;">${story.challenge_type || ''}</td></tr>
          ${story.contact_email ? `<tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">אימייל</td><td style="padding:8px 12px;color:#1f2937;">${story.contact_email}</td></tr>` : ''}
        </table>
      </div>
    </div>`;

  await resend.emails.send({
    from: 'StoryLeap AI <onboarding@resend.dev>',
    to: [ADMIN_EMAIL],
    subject: `[StoryLeap] הגשה חדשה — ${story.child_name || ''}`,
    html,
  });
  return { success: true };
}

async function addStoryToSheet(body) {
  const story = body.data || body;
  const lang = (isHebrewText(story.child_name) || isHebrewText(story.trigger_desc)) ? 'he' : 'en';
  const spreadsheetId = lang === 'he' ? SPREADSHEET_ID_HE : SPREADSHEET_ID_EN;
  const row = storyToRow(story, lang);

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
  return { success: true, lang };
}

async function syncLinksFromSheet(_payload, user) {
  // Fetch rows from both sheets
  const sheets = getSheetsClient();
  const fetchRows = async (spreadsheetId) => {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'A:M' });
    return (res.data.values || []).slice(1); // skip header
  };

  const [heRows, enRows] = await Promise.all([
    fetchRows(SPREADSHEET_ID_HE),
    fetchRows(SPREADSHEET_ID_EN),
  ]);

  // Build name→link map (column index 1=name, 12=story_link)
  const sheetLinks = {};
  for (const row of [...heRows, ...enRows]) {
    const name = (row[1] || '').trim().toLowerCase();
    const link = (row[12] || '').trim();
    if (name && link) sheetLinks[name] = link;
  }

  // Fetch all stories from DB
  const { data: stories } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
  let updated = 0;

  for (const story of (stories || [])) {
    const name = (story.child_name || '').trim().toLowerCase();
    const sheetLink = sheetLinks[name];
    if (sheetLink && sheetLink !== story.story_link) {
      await supabase.from('stories').update({ story_link: sheetLink, payment_status: 'story_ready' }).eq('id', story.id);
      updated++;
      if (story.contact_email) {
        sendStoryReadyEmail({
          to: story.contact_email,
          childName: story.child_name,
          storyLink: sheetLink,
          isHebrew: isHebrewText(story.child_name),
        }).catch(() => {});
      }
    }
  }

  return { success: true, updated };
}

// ── Admin: story status management ───────────────────────────────────────────

const VALID_STORY_STATUSES = ['pending_payment', 'paid', 'story_generating', 'review', 'story_ready', 'failed'];

async function updateStoryStatus({ story_id, status }, user) {
  if (!VALID_STORY_STATUSES.includes(status)) {
    throw Object.assign(new Error(`Invalid status: ${status}`), { status: 400 });
  }
  const { data: dbUser } = await supabase.from('users').select('role').eq('email', user.email).single();
  if (dbUser?.role !== 'admin') throw Object.assign(new Error('Admin only'), { status: 403 });

  await supabase.from('stories').update({ payment_status: status }).eq('id', story_id);

  // If marking as ready and story has a link + email, send notification
  if (status === 'story_ready') {
    const { data: story } = await supabase.from('stories').select('*').eq('id', story_id).single();
    if (story?.story_link && story?.contact_email) {
      sendStoryReadyEmail({ to: story.contact_email, childName: story.child_name, storyLink: story.story_link, isHebrew: isHebrewText(story.child_name) }).catch(() => {});
    }
  }

  return { success: true, story_id, status };
}

async function retryStory({ story_id }, user) {
  const { data: dbUser } = await supabase.from('users').select('role').eq('email', user.email).single();
  if (dbUser?.role !== 'admin') throw Object.assign(new Error('Admin only'), { status: 403 });

  const { data: story } = await supabase.from('stories').select('*').eq('id', story_id).single();
  if (!story) throw Object.assign(new Error('Story not found'), { status: 404 });
  if (story.payment_status !== 'failed') {
    throw Object.assign(new Error('Only failed stories can be retried'), { status: 400 });
  }

  // Reset to 'paid' (waiting) so it can be picked up for generation again
  await supabase.from('stories').update({ payment_status: 'paid' }).eq('id', story_id);

  // Also add back to Google Sheets for manual re-processing
  addStoryToSheet({ data: story }).catch(() => {});

  return { success: true, story_id, status: 'paid' };
}

// ── Therapist functions ───────────────────────────────────────────────────────

async function generateInviteToken(_, user) {
  const { data: dbUser } = await supabase.from('users').select('role').eq('email', user.email).single();
  if (dbUser?.role !== 'admin') throw Object.assign(new Error('Admin only'), { status: 403 });

  const { data: token } = await supabase
    .from('invite_tokens')
    .insert({ role: 'therapist', created_by: user.email })
    .select()
    .single();

  const appUrl = process.env.VITE_APP_URL || 'https://storyleap-new-site-1.onrender.com';
  return { token: token.token, url: `${appUrl}/TherapistRegister?token=${token.token}` };
}

async function registerAsTherapist({ token, full_name, license_number, specialization, clinic_name, phone }, user) {
  // Validate invite token
  const { data: inviteToken } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (!inviteToken) throw Object.assign(new Error('קוד הזמנה לא תקין'), { status: 400 });
  if (inviteToken.used_at) throw Object.assign(new Error('קוד הזמנה כבר נוצל'), { status: 400 });
  if (new Date(inviteToken.expires_at) < new Date()) throw Object.assign(new Error('קוד הזמנה פג תוקף'), { status: 400 });

  // Check not already registered
  const { data: existing } = await supabase
    .from('therapist_profiles')
    .select('user_email')
    .eq('user_email', user.email)
    .single();
  if (existing) throw Object.assign(new Error('כבר רשום/ה כמטפל/ת'), { status: 400 });

  // Create therapist profile
  await supabase.from('therapist_profiles').insert({
    user_email: user.email, full_name, license_number, specialization, clinic_name, phone, status: 'pending',
  });

  // Mark token as used
  await supabase.from('invite_tokens').update({ used_at: new Date().toISOString(), used_by_email: user.email }).eq('token', token);

  // Notify admin
  await resend.emails.send({
    from: 'StoryLeap AI <stories@storyleapai.com>',
    to: ADMIN_EMAIL,
    subject: `🧑‍⚕️ בקשת הרשמה חדשה כמטפל/ת — ${full_name}`,
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2>בקשת הרשמה חדשה כמטפל/ת</h2>
      <p><b>שם:</b> ${full_name}</p>
      <p><b>מייל:</b> ${user.email}</p>
      <p><b>מספר רישיון:</b> ${license_number || '—'}</p>
      <p><b>התמחות:</b> ${specialization || '—'}</p>
      <p><b>קליניקה:</b> ${clinic_name || '—'}</p>
      <p><b>טלפון:</b> ${phone || '—'}</p>
      <p style="margin-top:24px;"><a href="${process.env.VITE_APP_URL || 'https://storyleap-new-site-1.onrender.com'}/Admin" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">לאישור בפאנל האדמין</a></p>
    </div>`,
  });

  return { success: true };
}

async function approveTherapist({ user_email }, user) {
  const { data: dbUser } = await supabase.from('users').select('role').eq('email', user.email).single();
  if (dbUser?.role !== 'admin') throw Object.assign(new Error('Admin only'), { status: 403 });

  await supabase.from('therapist_profiles').update({ status: 'approved' }).eq('user_email', user_email);
  await supabase.from('users').update({ role: 'therapist' }).eq('email', user_email);

  const appUrl = process.env.VITE_APP_URL || 'https://storyleap-new-site-1.onrender.com';
  await resend.emails.send({
    from: 'StoryLeap AI <stories@storyleapai.com>',
    to: user_email,
    subject: 'ברוכים הבאים לStoryLeap — הבקשה שלכם אושרה! 🎉',
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2>הבקשה שלכם אושרה! 🎉</h2>
      <p>שמחים לבשר שהצטרפתם לקהילת המטפלים של StoryLeap.</p>
      <p>כעת תוכלו להיכנס לדשבורד המטפל ולהתחיל לעבוד עם המטופלים שלכם.</p>
      <p style="margin-top:24px;"><a href="${appUrl}/TherapistDashboard" style="background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">כניסה לדשבורד</a></p>
    </div>`,
  });

  return { success: true };
}

async function rejectTherapist({ user_email, reason }, user) {
  const { data: dbUser } = await supabase.from('users').select('role').eq('email', user.email).single();
  if (dbUser?.role !== 'admin') throw Object.assign(new Error('Admin only'), { status: 403 });

  await supabase.from('therapist_profiles').update({ status: 'rejected', reject_reason: reason || '' }).eq('user_email', user_email);

  await resend.emails.send({
    from: 'StoryLeap AI <stories@storyleapai.com>',
    to: user_email,
    subject: 'עדכון על בקשת ההרשמה שלכם ל-StoryLeap',
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2>עדכון על בקשתכם</h2>
      <p>לאחר בחינת הבקשה, לא נוכל לאשר את הצטרפותכם בשלב זה.</p>
      ${reason ? `<p><b>סיבה:</b> ${reason}</p>` : ''}
      <p>לשאלות ניתן לפנות אלינו ב-<a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
    </div>`,
  });

  return { success: true };
}

async function getTherapistProfile(_, user) {
  const { data } = await supabase.from('therapist_profiles').select('*').eq('user_email', user.email).single();
  return { profile: data };
}

async function getTherapistClients(_, user) {
  const { data } = await supabase.from('therapist_clients').select('*').eq('therapist_email', user.email).order('created_at', { ascending: false });
  return { clients: data || [] };
}

async function addTherapistClient({ parent_email, child_name, child_age, gender, notes }, user) {
  const { data: profile } = await supabase.from('therapist_profiles').select('status').eq('user_email', user.email).single();
  if (profile?.status !== 'approved') throw Object.assign(new Error('רק מטפלים מאושרים יכולים להוסיף מטופלים'), { status: 403 });

  const { data } = await supabase.from('therapist_clients').insert({
    therapist_email: user.email, parent_email, child_name, child_age, gender, notes,
  }).select().single();

  return { success: true, client: data };
}

async function sendTherapistMessage({ parent_email, child_name, subject, message }, user) {
  const { data: profile } = await supabase.from('therapist_profiles').select('*').eq('user_email', user.email).single();
  if (profile?.status !== 'approved') throw Object.assign(new Error('רק מטפלים מאושרים יכולים לשלוח הודעות'), { status: 403 });

  await supabase.from('therapist_messages').insert({
    therapist_email: user.email, parent_email, child_name, subject, message,
  });

  await resend.emails.send({
    from: 'StoryLeap AI <stories@storyleapai.com>',
    to: parent_email,
    subject: `המלצה מהמטפל/ת בנוגע ל${child_name} — ${subject}`,
    html: `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b;">
      <div style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">StoryLeap — המלצה מהמטפל/ת</h1>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px 32px;">
        <p>שלום,</p>
        <p>קיבלת המלצה מ<b>${profile.full_name}</b> בנוגע ל<b>${child_name}</b>:</p>
        <h3 style="color:#7c3aed;">${subject}</h3>
        <p style="white-space:pre-wrap;line-height:1.8;">${message}</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="font-size:13px;color:#64748b;">הודעה זו נשלחה דרך מערכת StoryLeap</p>
      </div>
    </div>`,
  });

  return { success: true };
}

async function getPendingTherapists(_, user) {
  const { data: dbUser } = await supabase.from('users').select('role').eq('email', user.email).single();
  if (dbUser?.role !== 'admin') throw Object.assign(new Error('Admin only'), { status: 403 });

  const { data } = await supabase.from('therapist_profiles').select('*').order('created_at', { ascending: false });
  return { therapists: data || [] };
}

// ── Function router ───────────────────────────────────────────────────────────
const FUNCTIONS = {
  submitStoryWithCredits:  { handler: (p, u) => submitStoryWithCredits(p, u),  requiresAuth: true },
  createPaypalOrder:       { handler: (p, u) => createPaypalOrder(p, u),       requiresAuth: true },
  capturePaypalOrder:      { handler: (p, u) => capturePaypalOrder(p, u),      requiresAuth: true },
  createCreditsOrder:      { handler: (p, u) => createCreditsOrder(p, u),      requiresAuth: true },
  captureCreditsOrder:     { handler: (p, u) => captureCreditsOrder(p, u),     requiresAuth: true },
  validateCoupon:          { handler: (p, u) => validateCoupon(p, u),          requiresAuth: true },
  updateStoryStatus:       { handler: (p, u) => updateStoryStatus(p, u),       requiresAuth: true },
  retryStory:              { handler: (p, u) => retryStory(p, u),              requiresAuth: true },
  generateInviteToken:     { handler: (p, u) => generateInviteToken(p, u),     requiresAuth: true },
  registerAsTherapist:     { handler: (p, u) => registerAsTherapist(p, u),     requiresAuth: true },
  approveTherapist:        { handler: (p, u) => approveTherapist(p, u),        requiresAuth: true },
  rejectTherapist:         { handler: (p, u) => rejectTherapist(p, u),         requiresAuth: true },
  getTherapistProfile:     { handler: (p, u) => getTherapistProfile(p, u),     requiresAuth: true },
  getTherapistClients:     { handler: (p, u) => getTherapistClients(p, u),     requiresAuth: true },
  addTherapistClient:      { handler: (p, u) => addTherapistClient(p, u),      requiresAuth: true },
  sendTherapistMessage:    { handler: (p, u) => sendTherapistMessage(p, u),    requiresAuth: true },
  getPendingTherapists:    { handler: (p, u) => getPendingTherapists(p, u),    requiresAuth: true },
  sendFormEmail:           { handler: (p) => sendFormEmail(p),                 requiresAuth: false },
  sendStoryReadyEmail:     { handler: (p) => sendStoryReadyEmail(p),           requiresAuth: false },
  notifyNewStory:          { handler: (p) => notifyNewStory(p),                requiresAuth: false },
  addStoryToSheet:         { handler: (p) => addStoryToSheet(p),               requiresAuth: false },
  syncLinksFromSheet:      { handler: (p, u) => syncLinksFromSheet(p, u),      requiresAuth: true },
  getPaypalClientId:       { handler: () => ({ client_id: process.env.PAYPAL_CLIENT_ID }), requiresAuth: true },
  getOrderByPaypalId:      { handler: async (p) => { const { data } = await supabase.from('orders').select('*').eq('paypal_order_id', p.paypal_order_id).single(); return { order: data }; }, requiresAuth: true },
  onStoryLinkAdded:        { handler: async (p) => { const s = p.data; if (s?.story_link && s?.contact_email) await sendStoryReadyEmail({ to: s.contact_email, childName: s.child_name, storyLink: s.story_link, isHebrew: isHebrewText(s.child_name) }); return { success: true }; }, requiresAuth: false },
  initSheet:               { handler: () => ({ success: true }), requiresAuth: false },
  paypalWebhook:           { handler: () => ({ success: true }), requiresAuth: false },
  processStoryGeneration:  { handler: async (p) => { await supabase.from('stories').update({ payment_status: 'paid' }).eq('id', p.story_id); return { success: true }; }, requiresAuth: false },
};

app.post('/api/functions/:name', async (req, res) => {
  const { name } = req.params;
  const fn = FUNCTIONS[name];
  if (!fn) return res.status(404).json({ error: `Unknown function: ${name}` });

  try {
    let user = null;
    if (fn.requiresAuth) {
      user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await fn.handler(req.body, user);
    res.json(result);
  } catch (err) {
    console.error(`[${name}]`, err.message);
    res.status(err.status || 500).json({ error: err.message, details: err.details });
  }
});

// ── File upload ───────────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const user = await getUser(req);
    const folder = user ? user.id : `temp/${crypto.randomUUID()}`;
    const ext = req.file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('story-images').upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype, upsert: true,
    });
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('story-images').getPublicUrl(fileName);
    res.json({ file_url: publicUrl });
  } catch (err) {
    console.error('[upload]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── Serve React frontend (production) ─────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
