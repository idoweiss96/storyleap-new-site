import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { invokeFunction } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, BookOpen, Loader2, ShieldAlert, Pencil, Check, ExternalLink, RefreshCw, Star, Users, Search, Image, Download, Shield, ShieldOff, Tag, Plus, Trash2, ClipboardList, RotateCcw, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../components/LanguageContext';

export default function Admin() {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingStory, setEditingStory] = useState(null);
  const [storyLink, setStoryLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [isSyncingLinks, setIsSyncingLinks] = useState(false);
  const [syncLinksMsg, setSyncLinksMsg] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState('');
  const [isSavingCredits, setIsSavingCredits] = useState(false);
  const [searchStories, setSearchStories] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [viewingImage, setViewingImage] = useState(null);
  const [togglingRole, setTogglingRole] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'discount', price_ils: '15', price_usd: '5', credits_amount: '20', max_uses: '', max_uses_per_user: '1', expires_at: '' });
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [ordersTab, setOrdersTab] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [retryingStory, setRetryingStory] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [therapistActionLoading, setTherapistActionLoading] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const settingLabels = { space: t('setting_space'), forest: t('setting_forest'), castle: t('setting_castle'), sports: t('setting_sports'), real_life: t('setting_real_life') };
  const challengeLabels = { fears: t('ch_fears'), social_difficulty: t('ch_social'), changes: t('ch_changes'), emotional_regulation: t('ch_emotional'), separation_anxiety: t('ch_separation'), self_confidence: t('ch_confidence'), sleep_issues: t('ch_sleep') };
  const genderLabels = { boy: t('gender_boy'), girl: t('gender_girl'), other: t('gender_other') };
  const reactionLabels = { outburst: t('r_outburst'), withdrawal: t('r_withdrawal'), attention_seeking: t('r_attention'), crying: t('r_crying'), aggression: t('r_aggression'), avoidance: t('r_avoidance') };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { window.location.href = '/Login?redirectTo=/Admin'; return; }
      const { data: userRow } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (userRow?.role === 'admin') {
        setIsAdmin(true);
        const [{ data: allStories }, { data: allUsers }, { data: allCoupons }, therapistsRes] = await Promise.all([
          supabase.from('stories').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('*').order('created_at', { ascending: false }),
          supabase.from('coupons').select('*').order('created_at', { ascending: false }),
          invokeFunction('getPendingTherapists', {}),
        ]);
        setStories(allStories || []);
        setUsers(allUsers || []);
        setCoupons(allCoupons || []);
        setTherapists(therapistsRes.data?.therapists || []);
      }
    } catch (_) {}
    finally { setIsLoading(false); }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = [t('field_date'), t('field_name'), t('field_age'), t('field_gender'), t('field_setting'), t('field_challenge'), t('field_trigger'), t('field_reaction'), t('field_hobbies'), t('form_email'), t('form_phone'), 'Content'];
      const rows = stories.map(story => [
        story.created_at ? format(new Date(story.created_at), 'dd/MM/yyyy HH:mm') : '',
        story.child_name || '', story.child_age || '',
        genderLabels[story.gender] || story.gender || '',
        settingLabels[story.setting] || story.setting || '',
        challengeLabels[story.challenge_type] || story.challenge_type || '',
        story.trigger_desc || '', reactionLabels[story.reaction_type] || story.reaction_type || '',
        story.hobbies || '', story.contact_email || '', story.contact_phone || '',
        (story.content || '').replace(/"/g, '""').replace(/\n/g, ' ')
      ]);
      const csvContent = '﻿' + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `storyleap-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally { setIsExporting(false); }
  };

  const handleSyncSheet = async () => {
    setIsSyncing(true); setSyncMsg('');
    try {
      const res = await invokeFunction('initSheet', {});
      setSyncMsg(`✓ סונכרן: ${res.data?.hebrew || 0} עברית, ${res.data?.english || 0} אנגלית`);
    } catch (_) { setSyncMsg('שגיאה בסנכרון'); }
    finally { setIsSyncing(false); }
  };

  const handleSyncLinks = async () => {
    setIsSyncingLinks(true); setSyncLinksMsg('');
    try {
      const res = await invokeFunction('syncLinksFromSheet', {});
      setSyncLinksMsg(`✓ עודכנו ${res.data?.updated || 0} לינקים`);
      if (res.data?.updated > 0) {
        const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false });
        setStories(data || []);
      }
    } catch (_) { setSyncLinksMsg('שגיאה בסנכרון לינקים'); }
    finally { setIsSyncingLinks(false); }
  };

  const handleToggleRole = async (u) => {
    if (!u.email.endsWith('@storyleapai.com')) {
      alert('ניתן להעניק הרשאת אדמין רק למשתמשים עם כתובת @storyleapai.com');
      return;
    }
    setTogglingRole(u.id);
    try {
      const newRole = u.role === 'admin' ? 'user' : 'admin';
      await supabase.from('users').update({ role: newRole }).eq('id', u.id);
      setUsers(users.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    } catch (err) { alert('שגיאה בעדכון תפקיד: ' + err.message); }
    finally { setTogglingRole(null); }
  };

  const handleSaveCredits = async () => {
    if (!editingUser || creditsToAdd === '') return;
    setIsSavingCredits(true);
    try {
      const amount = parseInt(creditsToAdd);
      const newCredits = Math.max(0, (editingUser.credits || 0) + amount);
      await supabase.from('users').update({ credits: newCredits }).eq('id', editingUser.id);
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
      setEditingUser(null); setCreditsToAdd('');
    } catch (err) { alert('שגיאה בעדכון קרדיטים: ' + err.message); }
    finally { setIsSavingCredits(false); }
  };

  const handleSaveStoryLink = async () => {
    if (!editingStory || !storyLink.trim()) return;
    setIsSaving(true);
    try {
      await supabase.from('stories').update({ story_link: storyLink.trim() }).eq('id', editingStory.id);
      if (editingStory.contact_email) {
        await invokeFunction('sendStoryReadyEmail', {
          to: editingStory.contact_email,
          childName: editingStory.child_name,
          storyLink: storyLink.trim(),
          isHebrew: true,
        });
      }
      setStories(stories.map(s => s.id === editingStory.id ? { ...s, story_link: storyLink.trim() } : s));
      setEditingStory(null); setStoryLink('');
    } catch (_) {}
    finally { setIsSaving(false); }
  };

  const STATUS_META = {
    pending_payment: { label: 'Draft',      color: 'bg-gray-100 text-gray-600' },
    paid:            { label: 'Waiting',    color: 'bg-blue-100 text-blue-700' },
    story_generating:{ label: 'Generating', color: 'bg-yellow-100 text-yellow-700' },
    review:          { label: 'Review',     color: 'bg-violet-100 text-violet-700' },
    story_ready:     { label: 'Ready',      color: 'bg-green-100 text-green-700' },
    failed:          { label: 'Failed',     color: 'bg-red-100 text-red-700' },
  };
  const STATUS_FLOW = ['pending_payment', 'paid', 'story_generating', 'review', 'story_ready', 'failed'];
  const ORDERS_TABS = [
    { key: 'all',              label: 'הכל' },
    { key: 'paid',             label: 'Waiting' },
    { key: 'story_generating', label: 'Generating' },
    { key: 'review',           label: 'Review' },
    { key: 'story_ready',      label: 'Ready' },
    { key: 'failed',           label: 'Failed' },
  ];

  const paidStories = stories.filter(s => s.payment_status !== 'pending_payment');
  const filteredOrders = ordersTab === 'all' ? paidStories : paidStories.filter(s => s.payment_status === ordersTab);

  const handleUpdateStatus = async (story, newStatus) => {
    setUpdatingStatus(story.id);
    try {
      await invokeFunction('updateStoryStatus', { story_id: story.id, status: newStatus });
      setStories(stories.map(s => s.id === story.id ? { ...s, payment_status: newStatus } : s));
    } catch (err) { alert('שגיאה: ' + err.message); }
    finally { setUpdatingStatus(null); }
  };

  const handleRetry = async (story) => {
    setRetryingStory(story.id);
    try {
      await invokeFunction('retryStory', { story_id: story.id });
      setStories(stories.map(s => s.id === story.id ? { ...s, payment_status: 'paid' } : s));
    } catch (err) { alert('שגיאה: ' + err.message); }
    finally { setRetryingStory(null); }
  };

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const res = await invokeFunction('generateInviteToken', {});
      setInviteUrl(res.data.url);
    } catch (err) { alert('שגיאה: ' + err.message); }
    finally { setGeneratingInvite(false); }
  };

  const handleApproveTherapist = async (email) => {
    setTherapistActionLoading(email);
    try {
      await invokeFunction('approveTherapist', { user_email: email });
      setTherapists(therapists.map(t => t.user_email === email ? { ...t, status: 'approved' } : t));
    } catch (err) { alert('שגיאה: ' + err.message); }
    finally { setTherapistActionLoading(null); }
  };

  const handleRejectTherapist = async () => {
    if (!rejectDialog) return;
    setTherapistActionLoading(rejectDialog.user_email);
    try {
      await invokeFunction('rejectTherapist', { user_email: rejectDialog.user_email, reason: rejectReason });
      setTherapists(therapists.map(t => t.user_email === rejectDialog.user_email ? { ...t, status: 'rejected', reject_reason: rejectReason } : t));
      setRejectDialog(null); setRejectReason('');
    } catch (err) { alert('שגיאה: ' + err.message); }
    finally { setTherapistActionLoading(null); }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code.trim()) { setCouponMsg('חסר קוד קופון'); return; }
    setIsSavingCoupon(true); setCouponMsg('');
    try {
      const payload = {
        code: newCoupon.code.trim().toUpperCase(),
        type: newCoupon.type,
        active: true,
        max_uses: newCoupon.max_uses ? parseInt(newCoupon.max_uses) : null,
        max_uses_per_user: newCoupon.max_uses_per_user ? parseInt(newCoupon.max_uses_per_user) : null,
        expires_at: newCoupon.expires_at || null,
      };
      if (newCoupon.type === 'discount') { payload.price_ils = parseFloat(newCoupon.price_ils); payload.price_usd = parseFloat(newCoupon.price_usd); }
      if (newCoupon.type === 'free_credits') { payload.credits_amount = parseInt(newCoupon.credits_amount); }
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) { setCouponMsg('שגיאה: ' + error.message); return; }
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      setCoupons(data || []);
      setNewCoupon({ code: '', type: 'discount', price_ils: '15', price_usd: '5', credits_amount: '20', max_uses: '', max_uses_per_user: '1', expires_at: '' });
      setCouponMsg('✓ קופון נוצר בהצלחה');
    } catch (err) { setCouponMsg('שגיאה: ' + err.message); }
    finally { setIsSavingCoupon(false); }
  };

  const handleToggleCoupon = async (coupon) => {
    await supabase.from('coupons').update({ active: !coupon.active }).eq('code', coupon.code);
    setCoupons(coupons.map(c => c.code === coupon.code ? { ...c, active: !c.active } : c));
  };

  const handleDeleteCoupon = async (code) => {
    if (!confirm(`למחוק קופון ${code}?`)) return;
    await supabase.from('coupons').delete().eq('code', code);
    setCoupons(coupons.filter(c => c.code !== code));
  };

  const downloadImage = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}-${Date.now()}.jpg`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" /></div>;

  if (!isAdmin) return (
    <div className="max-w-md mx-auto py-20 text-center">
      <Card className="border-0 shadow-xl"><CardContent className="p-8">
        <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('admin_no_access')}</h2>
        <p className="text-gray-600">{t('admin_no_access_msg')}</p>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin_title')}</h1>
          <p className="text-gray-600">{t('admin_subtitle')}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-0 shadow-lg shadow-slate-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-slate-600" />
            </div>
            <div><p className="text-sm text-gray-500">{t('admin_total')}</p><p className="text-2xl font-bold text-gray-900">{stories.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-100">
          <CardContent className="p-6 space-y-3">
            <Button onClick={exportToCSV} disabled={isExporting || stories.length === 0} className="w-full h-12 bg-slate-700 hover:bg-slate-600 rounded-xl">
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <FileSpreadsheet className="w-5 h-5 ml-2" />}{t('admin_export')}
            </Button>
            <Button onClick={handleSyncSheet} disabled={isSyncing} variant="outline" className="w-full h-12 rounded-xl">
              {isSyncing ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <RefreshCw className="w-5 h-5 ml-2" />}סנכרן לגיליון Google
            </Button>
            {syncMsg && <p className="text-sm text-center text-green-600">{syncMsg}</p>}
            <Button onClick={handleSyncLinks} disabled={isSyncingLinks} variant="outline" className="w-full h-12 rounded-xl border-green-300 text-green-700 hover:bg-green-50">
              {isSyncingLinks ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <RefreshCw className="w-5 h-5 ml-2" />}סנכרן לינקים מהגיליון
            </Button>
            {syncLinksMsg && <p className="text-sm text-center text-green-600">{syncLinksMsg}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Orders Management Panel */}
      <Card className="border-0 shadow-xl shadow-slate-100 mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> ניהול הזמנות
            <span className="ml-auto text-sm font-normal text-slate-500">{paidStories.length} הזמנות בסה"כ</span>
          </CardTitle>
          {/* Status tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {ORDERS_TABS.map(tab => {
              const count = tab.key === 'all' ? paidStories.length : paidStories.filter(s => s.payment_status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setOrdersTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${ordersTab === tab.key ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {tab.label}
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${ordersTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">אין הזמנות בסטטוס זה</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">תאריך</TableHead>
                    <TableHead className="text-right">שם ילד/ה</TableHead>
                    <TableHead className="text-right">אימייל</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">לינק סיפור</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(story => {
                    const meta = STATUS_META[story.payment_status] || STATUS_META['pending_payment'];
                    const isUpdating = updatingStatus === story.id;
                    const isRetrying = retryingStory === story.id;
                    return (
                      <TableRow key={story.id}>
                        <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                          {story.created_at ? format(new Date(story.created_at), 'dd/MM/yy HH:mm') : '-'}
                        </TableCell>
                        <TableCell className="font-medium">{story.child_name}</TableCell>
                        <TableCell className="text-sm text-slate-500">{story.contact_email || '-'}</TableCell>
                        <TableCell>
                          <Badge className={meta.color}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {story.story_link
                            ? <a href={story.story_link} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />פתח</a>
                            : <span className="text-slate-300">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Status transition buttons */}
                            {story.payment_status === 'paid' && (
                              <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => handleUpdateStatus(story, 'story_generating')} className="text-xs h-7 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : '→ Generating'}
                              </Button>
                            )}
                            {story.payment_status === 'story_generating' && (
                              <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => handleUpdateStatus(story, 'review')} className="text-xs h-7 border-violet-300 text-violet-700 hover:bg-violet-50">
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : '→ Review'}
                              </Button>
                            )}
                            {story.payment_status === 'review' && (
                              <Button size="sm" variant="outline" disabled={isUpdating} onClick={() => handleUpdateStatus(story, 'story_ready')} className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-50">
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : '→ Ready ✓'}
                              </Button>
                            )}
                            {story.payment_status === 'failed' && (
                              <Button size="sm" variant="outline" disabled={isRetrying} onClick={() => handleRetry(story)} className="text-xs h-7 border-blue-300 text-blue-700 hover:bg-blue-50">
                                {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RotateCcw className="w-3 h-3 ml-1" />Retry</>}
                              </Button>
                            )}
                            {/* Mark as failed */}
                            {['paid', 'story_generating', 'review'].includes(story.payment_status) && (
                              <Button size="sm" variant="ghost" disabled={isUpdating} onClick={() => handleUpdateStatus(story, 'failed')} className="text-xs h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                                Failed
                              </Button>
                            )}
                            {/* Edit link */}
                            <Button variant="ghost" size="sm" onClick={() => { setEditingStory(story); setStoryLink(story.story_link || ''); }} className="h-7 w-7 p-0">
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl shadow-slate-100 mb-8">
        <CardHeader>
          <CardTitle className="text-lg">{t('admin_table_title')}</CardTitle>
          <div className="mt-4 relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input placeholder="חפש לפי שם ילד או אימייל..." value={searchStories} onChange={(e) => setSearchStories(e.target.value)} className="pl-4 pr-10" dir="rtl" />
          </div>
        </CardHeader>
        <CardContent>
          {stories.length === 0 ? <p className="text-center text-gray-500 py-8">{t('admin_no_stories')}</p> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('admin_col_date')}</TableHead>
                    <TableHead className="text-right">{t('admin_col_name')}</TableHead>
                    <TableHead className="text-right">{t('admin_col_age')}</TableHead>
                    <TableHead className="text-right">תמונה</TableHead>
                    <TableHead className="text-right">{t('admin_col_setting')}</TableHead>
                    <TableHead className="text-right">{t('admin_col_challenge')}</TableHead>
                    <TableHead className="text-right">{t('admin_col_email')}</TableHead>
                    <TableHead className="text-right">{t('admin_col_status')}</TableHead>
                    <TableHead className="text-right">{t('admin_col_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stories.filter(story => story.child_name.toLowerCase().includes(searchStories.toLowerCase()) || (story.contact_email || '').toLowerCase().includes(searchStories.toLowerCase())).map((story) => (
                    <TableRow key={story.id}>
                      <TableCell className="text-sm">{story.created_at ? format(new Date(story.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell className="font-medium">{story.child_name}</TableCell>
                      <TableCell>{story.child_age}</TableCell>
                      <TableCell>
                        {story.child_image ? (
                          <button onClick={() => setViewingImage({ url: story.child_image, name: story.child_name })} className="hover:opacity-80 transition-opacity">
                            <img src={story.child_image} alt={story.child_name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                          </button>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Image className="w-4 h-4 text-gray-300" /></div>
                        )}
                      </TableCell>
                      <TableCell>{settingLabels[story.setting] || story.setting}</TableCell>
                      <TableCell>{challengeLabels[story.challenge_type] || story.challenge_type}</TableCell>
                      <TableCell className="text-sm text-gray-500">{story.contact_email || '-'}</TableCell>
                      <TableCell>
                        {story.story_link ? <Badge className="bg-green-100 text-green-700"><Check className="w-3 h-3 ml-1" />{t('admin_done')}</Badge> : <Badge className="bg-amber-100 text-amber-700">{t('admin_pending')}</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingStory(story); setStoryLink(story.story_link || ''); }} className="h-8 px-2"><Pencil className="w-4 h-4" /></Button>
                          {story.story_link && <a href={story.story_link} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800"><ExternalLink className="w-4 h-4" /></a>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl shadow-slate-100 mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5" /> ניהול קרדיטים למשתמשים</CardTitle>
          <div className="mt-4 relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <Input placeholder="חפש לפי שם או אימייל..." value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} className="pl-4 pr-10" dir="rtl" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">אימייל</TableHead>
                  <TableHead className="text-right">קרדיטים</TableHead>
                  <TableHead className="text-right">תפקיד</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(u => (u.full_name || '').toLowerCase().includes(searchUsers.toLowerCase()) || u.email.toLowerCase().includes(searchUsers.toLowerCase())).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-500">{u.email}</TableCell>
                    <TableCell><div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-400" /><span className="font-semibold">{u.credits ?? 0}</span></div></TableCell>
                    <TableCell>
                      <Badge className={u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}>
                        {u.role === 'admin' ? 'אדמין' : 'משתמש'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingUser(u); setCreditsToAdd(''); }}><Star className="w-3 h-3 ml-1" /> קרדיטים</Button>
                        {u.email.endsWith('@storyleapai.com') && (
                          <Button variant="outline" size="sm" onClick={() => handleToggleRole(u)} disabled={togglingRole === u.id} className={u.role === 'admin' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-violet-200 text-violet-600 hover:bg-violet-50'}>
                            {togglingRole === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : u.role === 'admin' ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Therapist Management */}
      <Card className="border-0 shadow-xl shadow-slate-100 mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-600" /> ניהול מטפלים
            {therapists.filter(t => t.status === 'pending').length > 0 && (
              <Badge className="bg-red-100 text-red-700 mr-2">{therapists.filter(t => t.status === 'pending').length} ממתינים</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generate invite link */}
          <div className="bg-violet-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-violet-700">יצירת לינק הזמנה למטפל/ת</p>
            <div className="flex gap-2">
              <Button onClick={handleGenerateInvite} disabled={generatingInvite} className="bg-violet-600 hover:bg-violet-700 text-white shrink-0">
                {generatingInvite ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Plus className="w-4 h-4 ml-1" />}צור לינק
              </Button>
              {inviteUrl && (
                <div className="flex-1 flex gap-2 items-center">
                  <Input value={inviteUrl} readOnly dir="ltr" className="text-xs bg-white" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(inviteUrl); alert('הועתק!'); }}>העתק</Button>
                </div>
              )}
            </div>
            <p className="text-xs text-violet-500">הלינק תקף ל-30 יום ולשימוש חד-פעמי</p>
          </div>

          {/* Therapists list */}
          {therapists.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם</TableHead>
                    <TableHead className="text-right">מייל</TableHead>
                    <TableHead className="text-right">התמחות</TableHead>
                    <TableHead className="text-right">קליניקה</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {therapists.map(t => (
                    <TableRow key={t.user_email}>
                      <TableCell className="font-medium">{t.full_name}</TableCell>
                      <TableCell className="text-sm text-slate-500">{t.user_email}</TableCell>
                      <TableCell className="text-sm">{t.specialization || '—'}</TableCell>
                      <TableCell className="text-sm">{t.clinic_name || '—'}</TableCell>
                      <TableCell>
                        <Badge className={
                          t.status === 'approved' ? 'bg-green-100 text-green-700' :
                          t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }>
                          {t.status === 'approved' ? 'מאושר/ת' : t.status === 'rejected' ? 'נדחה/תה' : 'ממתין/ה'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" disabled={therapistActionLoading === t.user_email} onClick={() => handleApproveTherapist(t.user_email)} className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-50">
                              {therapistActionLoading === t.user_email ? <Loader2 className="w-3 h-3 animate-spin" /> : '✓ אשר'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setRejectDialog(t); setRejectReason(''); }} className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">דחה</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {therapists.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">אין מטפלים רשומים עדיין</p>}
        </CardContent>
      </Card>

      {/* Reject therapist dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader><DialogTitle>דחיית בקשת {rejectDialog?.full_name}</DialogTitle></DialogHeader>
          <div className="py-3 space-y-3">
            <Label>סיבת הדחייה (אופציונלי — תשלח למטפל/ת)</Label>
            <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="למשל: נדרש מידע נוסף על הרישיון..." className="min-h-20" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialog(null)}>ביטול</Button>
            <Button onClick={handleRejectTherapist} disabled={!!therapistActionLoading} className="bg-red-500 hover:bg-red-600 text-white">
              {therapistActionLoading ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : null}אישור דחייה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupons Management */}
      <Card className="border-0 shadow-xl shadow-slate-100 mt-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Tag className="w-5 h-5" /> ניהול קופונים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create new coupon */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">יצירת קופון חדש</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">קוד</Label>
                <Input value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER25" className="mt-1 uppercase" dir="ltr" />
              </div>
              <div>
                <Label className="text-xs">סוג</Label>
                <select value={newCoupon.type} onChange={e => setNewCoupon(p => ({ ...p, type: e.target.value }))} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="discount">הנחה (discount)</option>
                  <option value="free_credits">קרדיטים חינם</option>
                </select>
              </div>
              {newCoupon.type === 'discount' && <>
                <div><Label className="text-xs">מחיר ILS ₪</Label><Input type="number" value={newCoupon.price_ils} onChange={e => setNewCoupon(p => ({ ...p, price_ils: e.target.value }))} className="mt-1" dir="ltr" /></div>
                <div><Label className="text-xs">מחיר USD $</Label><Input type="number" value={newCoupon.price_usd} onChange={e => setNewCoupon(p => ({ ...p, price_usd: e.target.value }))} className="mt-1" dir="ltr" /></div>
              </>}
              {newCoupon.type === 'free_credits' && (
                <div><Label className="text-xs">מספר קרדיטים</Label><Input type="number" value={newCoupon.credits_amount} onChange={e => setNewCoupon(p => ({ ...p, credits_amount: e.target.value }))} className="mt-1" dir="ltr" /></div>
              )}
              <div><Label className="text-xs">מקסימום שימושים (ריק = ללא הגבלה)</Label><Input type="number" value={newCoupon.max_uses} onChange={e => setNewCoupon(p => ({ ...p, max_uses: e.target.value }))} placeholder="ללא הגבלה" className="mt-1" dir="ltr" /></div>
              <div><Label className="text-xs">מקסימום למשתמש</Label><Input type="number" value={newCoupon.max_uses_per_user} onChange={e => setNewCoupon(p => ({ ...p, max_uses_per_user: e.target.value }))} className="mt-1" dir="ltr" /></div>
              <div><Label className="text-xs">תאריך תפוגה (אופציונלי)</Label><Input type="date" value={newCoupon.expires_at} onChange={e => setNewCoupon(p => ({ ...p, expires_at: e.target.value }))} className="mt-1" dir="ltr" /></div>
            </div>
            <Button onClick={handleCreateCoupon} disabled={isSavingCoupon} className="bg-violet-600 hover:bg-violet-700 text-white">
              {isSavingCoupon ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}צור קופון
            </Button>
            {couponMsg && <p className={`text-sm ${couponMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{couponMsg}</p>}
          </div>

          {/* Coupons list */}
          {coupons.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">קוד</TableHead>
                    <TableHead className="text-right">סוג</TableHead>
                    <TableHead className="text-right">פרטים</TableHead>
                    <TableHead className="text-right">הגבלות</TableHead>
                    <TableHead className="text-right">תפוגה</TableHead>
                    <TableHead className="text-right">סטטוס</TableHead>
                    <TableHead className="text-right">פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map(c => (
                    <TableRow key={c.code}>
                      <TableCell className="font-mono font-bold text-slate-800">{c.code}</TableCell>
                      <TableCell>{c.type === 'discount' ? 'הנחה' : c.type === 'free_credits' ? 'קרדיטים חינם' : 'Hosted Button'}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {c.type === 'discount' && `₪${c.price_ils} / $${c.price_usd}`}
                        {c.type === 'free_credits' && `${c.credits_amount} ⭐`}
                        {c.type === 'hosted_button' && c.hosted_display}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {c.max_uses ? `עד ${c.max_uses} שימושים` : 'ללא הגבלה'} / {c.max_uses_per_user ? `${c.max_uses_per_user} למשתמש` : 'ללא הגבלה'}
                      </TableCell>
                      <TableCell className="text-sm">{c.expires_at ? format(new Date(c.expires_at), 'dd/MM/yyyy') : '—'}</TableCell>
                      <TableCell>
                        <Badge className={c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{c.active ? 'פעיל' : 'כבוי'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleCoupon(c)}>{c.active ? 'כבה' : 'הפעל'}</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCoupon(c.code)} className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle>תמונת {viewingImage?.name}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => downloadImage(viewingImage.url, viewingImage.name)} className="h-8 w-8 p-0"><Download className="w-4 h-4" /></Button>
          </DialogHeader>
          <div className="py-2 flex justify-center">{viewingImage && <img src={viewingImage.url} alt={viewingImage.name} className="max-w-full max-h-96 rounded-xl object-contain" />}</div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>עריכת קרדיטים — {editingUser?.full_name || editingUser?.email}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg px-3 py-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />קרדיטים נוכחיים: <span className="font-bold text-amber-700">{editingUser?.credits ?? 0}</span>
            </div>
            <div>
              <Label htmlFor="creditsToAdd">שינוי כמות קרדיטים (מספר חיובי להוספה, שלילי להורדה)</Label>
              <Input id="creditsToAdd" type="number" value={creditsToAdd} onChange={(e) => setCreditsToAdd(e.target.value)} placeholder="לדוגמה: 20 או -10" className="mt-2" dir="ltr" />
            </div>
            {creditsToAdd !== '' && !isNaN(parseInt(creditsToAdd)) && (
              <p className="text-sm text-gray-500">לאחר שינוי: <span className={`font-bold ${Math.max(0, (editingUser?.credits ?? 0) + parseInt(creditsToAdd)) < (editingUser?.credits ?? 0) ? 'text-red-600' : 'text-green-600'}`}>{Math.max(0, (editingUser?.credits ?? 0) + parseInt(creditsToAdd))}</span> קרדיטים</p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingUser(null)}>ביטול</Button>
            <Button onClick={handleSaveCredits} disabled={isSavingCredits || creditsToAdd === ''} className="bg-amber-500 hover:bg-amber-600 text-white">
              {isSavingCredits ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Star className="w-4 h-4 ml-2" />}שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingStory} onOpenChange={() => setEditingStory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('admin_edit_title_prefix')} {editingStory?.child_name}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label htmlFor="storyLink" className="text-sm font-medium text-gray-700">{t('admin_link_label')}</Label>
            <Input id="storyLink" value={storyLink} onChange={(e) => setStoryLink(e.target.value)} placeholder="https://..." className="mt-2" dir="ltr" />
            {editingStory?.contact_email && <p className="text-sm text-gray-500 mt-3">{t('admin_email_note_prefix')} {editingStory.contact_email}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingStory(null)}>{t('admin_cancel')}</Button>
            <Button onClick={handleSaveStoryLink} disabled={isSaving || !storyLink.trim()} className="bg-slate-800 hover:bg-slate-700">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}{t('admin_save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
