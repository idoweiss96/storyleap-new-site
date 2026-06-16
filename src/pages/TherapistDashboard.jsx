import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { invokeFunction } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Users, MessageSquare, Plus, Loader2, Send, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TherapistDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('clients');
  const [addingClient, setAddingClient] = useState(false);
  const [messagingClient, setMessagingClient] = useState(null);
  const [savingClient, setSavingClient] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [newClient, setNewClient] = useState({ parent_email: '', child_name: '', child_age: '', gender: '', notes: '' });
  const [msgForm, setMsgForm] = useState({ subject: '', message: '' });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/Login?redirectTo=/TherapistDashboard'); return; }

      try {
        const [profileRes, clientsRes] = await Promise.all([
          invokeFunction('getTherapistProfile', {}),
          invokeFunction('getTherapistClients', {}),
        ]);
        setProfile(profileRes.data?.profile);
        setClients(clientsRes.data?.clients || []);

        if (!profileRes.data?.profile) { navigate('/'); return; }
        if (profileRes.data.profile.status === 'pending') {
          // Show pending state
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    init();
  }, [navigate]);

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.parent_email || !newClient.child_name) { toast.error('נא למלא מייל הורה ושם ילד/ה'); return; }
    setSavingClient(true);
    try {
      const res = await invokeFunction('addTherapistClient', { ...newClient, child_age: newClient.child_age ? parseInt(newClient.child_age) : null });
      setClients(c => [res.data.client, ...c]);
      setAddingClient(false);
      setNewClient({ parent_email: '', child_name: '', child_age: '', gender: '', notes: '' });
      toast.success('מטופל/ת נוסף/ה בהצלחה');
    } catch (err) { toast.error(err.message || 'שגיאה'); }
    finally { setSavingClient(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgForm.subject || !msgForm.message) { toast.error('נא למלא נושא והודעה'); return; }
    setSendingMsg(true);
    try {
      await invokeFunction('sendTherapistMessage', {
        parent_email: messagingClient.parent_email,
        child_name: messagingClient.child_name,
        subject: msgForm.subject,
        message: msgForm.message,
      });
      setMessagingClient(null);
      setMsgForm({ subject: '', message: '' });
      toast.success('ההודעה נשלחה להורה בהצלחה!');
    } catch (err) { toast.error(err.message || 'שגיאה בשליחה'); }
    finally { setSendingMsg(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
    </div>
  );

  if (profile?.status === 'pending') return (
    <div className="max-w-md mx-auto py-20 text-center">
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8 space-y-4">
          <Clock className="w-16 h-16 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">הבקשה שלך בבחינה</h2>
          <p className="text-slate-600">הצוות שלנו יאשר את הפרופיל שלך בהקדם.</p>
          <p className="text-slate-400 text-sm">תקבלי הודעת מייל עם אישור.</p>
        </CardContent>
      </Card>
    </div>
  );

  if (profile?.status === 'rejected') return (
    <div className="max-w-md mx-auto py-20 text-center">
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8 space-y-4">
          <p className="text-red-500 font-medium">הבקשה שלך לא אושרה</p>
          {profile.reject_reason && <p className="text-slate-600 text-sm">{profile.reject_reason}</p>}
          <p className="text-slate-400 text-sm">לפניות: hello@storyleapai.com</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">שלום, {profile?.full_name}</h1>
            <p className="text-slate-500 text-sm">{profile?.specialization}{profile?.clinic_name ? ` · ${profile.clinic_name}` : ''}</p>
          </div>
          <Badge className="mr-auto bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> מטפל/ת מאושר/ת
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="border-0 shadow-lg shadow-slate-100">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">מטופלים</p>
              <p className="text-2xl font-bold text-slate-800">{clients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-100">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">ליצירת סיפור</p>
              <p className="text-sm font-medium text-violet-600 cursor-pointer hover:underline" onClick={() => navigate('/Pricing')}>רכישת קרדיטים ←</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {[{ key: 'clients', label: 'המטופלים שלי', icon: Users }, { key: 'messages', label: 'שליחת המלצה', icon: MessageSquare }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Clients tab */}
      {activeTab === 'clients' && (
        <Card className="border-0 shadow-xl shadow-slate-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">המטופלים שלי</CardTitle>
              <Button onClick={() => setAddingClient(true)} className="bg-violet-600 hover:bg-violet-700 text-white h-9">
                <Plus className="w-4 h-4 ml-1" /> הוסף מטופל/ת
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>עוד אין מטופלים — הוסיפו את הראשון!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {clients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-violet-200 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-800">{client.child_name}</p>
                      <p className="text-sm text-slate-500">{client.parent_email}{client.child_age ? ` · גיל ${client.child_age}` : ''}</p>
                      {client.notes && <p className="text-xs text-slate-400 mt-1">{client.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setMessagingClient(client); setActiveTab('messages'); }} className="h-8 text-xs border-violet-200 text-violet-600 hover:bg-violet-50">
                        <MessageSquare className="w-3 h-3 ml-1" /> המלצה
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/CreateStory?for_client=${client.id}&child_name=${encodeURIComponent(client.child_name)}&child_age=${client.child_age || ''}&gender=${client.gender || ''}&parent_email=${encodeURIComponent(client.parent_email)}`)} className="h-8 text-xs border-amber-200 text-amber-700 hover:bg-amber-50">
                        <BookOpen className="w-3 h-3 ml-1" /> סיפור
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages tab */}
      {activeTab === 'messages' && (
        <Card className="border-0 shadow-xl shadow-slate-100">
          <CardHeader>
            <CardTitle className="text-lg">שליחת המלצה להורה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4 max-w-lg">
              <div>
                <Label>מטופל/ת</Label>
                <Select value={messagingClient?.id || ''} onValueChange={val => setMessagingClient(clients.find(c => c.id === val))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="בחר/י מטופל/ת" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.child_name} ({c.parent_email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>נושא ההמלצה</Label>
                <Input value={msgForm.subject} onChange={e => setMsgForm(p => ({ ...p, subject: e.target.value }))} placeholder="למשל: פעילות מומלצת לשיפור ויסות רגשי" className="mt-1" />
              </div>
              <div>
                <Label>תוכן ההמלצה</Label>
                <Textarea value={msgForm.message} onChange={e => setMsgForm(p => ({ ...p, message: e.target.value }))} placeholder="כתבו כאן את ההמלצה שתשלח להורה במייל..." className="mt-1 min-h-32" />
              </div>
              <Button type="submit" disabled={sendingMsg || !messagingClient} className="bg-violet-600 hover:bg-violet-700 text-white">
                {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                שלח/י ההמלצה להורה
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add client dialog */}
      <Dialog open={addingClient} onOpenChange={setAddingClient}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>הוספת מטופל/ת חדש/ה</DialogTitle></DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-3 py-2">
            <div>
              <Label>מייל הורה *</Label>
              <Input type="email" value={newClient.parent_email} onChange={e => setNewClient(p => ({ ...p, parent_email: e.target.value }))} placeholder="parent@example.com" className="mt-1" dir="ltr" required />
            </div>
            <div>
              <Label>שם הילד/ה *</Label>
              <Input value={newClient.child_name} onChange={e => setNewClient(p => ({ ...p, child_name: e.target.value }))} placeholder="שם הילד/ה" className="mt-1" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>גיל</Label>
                <Input type="number" min="1" max="18" value={newClient.child_age} onChange={e => setNewClient(p => ({ ...p, child_age: e.target.value }))} placeholder="גיל" className="mt-1" dir="ltr" />
              </div>
              <div>
                <Label>מגדר</Label>
                <Select value={newClient.gender} onValueChange={val => setNewClient(p => ({ ...p, gender: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="בחר" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">בן</SelectItem>
                    <SelectItem value="girl">בת</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>הערות</Label>
              <Textarea value={newClient.notes} onChange={e => setNewClient(p => ({ ...p, notes: e.target.value }))} placeholder="אתגרים, רקע רלוונטי..." className="mt-1 min-h-20" />
            </div>
            <DialogFooter className="gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setAddingClient(false)}>ביטול</Button>
              <Button type="submit" disabled={savingClient} className="bg-violet-600 hover:bg-violet-700 text-white">
                {savingClient ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}הוסף/י
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
