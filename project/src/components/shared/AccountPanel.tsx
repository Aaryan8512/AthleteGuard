import * as React from 'react';
import { Camera, LogOut, Save, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMyAthlete, updateAthlete } from '@/services/api';
import type { Athlete, Sport } from '@/types';

const PHOTO_KEY = 'athleteguard_profile_photo';
const sports: Sport[] = ['Cricket', 'Football', 'Badminton', 'Basketball', 'Hockey', 'Athletics'];

export function AccountPanel({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [athlete, setAthlete] = React.useState<Athlete | null>(null);
  const [photo, setPhoto] = React.useState(() => localStorage.getItem(PHOTO_KEY) ?? '');
  const [form, setForm] = React.useState({ sport: '', position: '', age: '', height: '', team: '' });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const load = async () => {
    try {
      const profile = await getMyAthlete();
      setAthlete(profile);
      setForm({ sport: profile.sport ?? '', position: profile.position ?? '', age: profile.age ? String(profile.age) : '', height: profile.height ? String(profile.height) : '', team: profile.team ?? '' });
    } catch { setMessage('Profile details are unavailable.'); }
  };

  const choosePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMessage('Choose an image smaller than 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { const value = String(reader.result); setPhoto(value); localStorage.setItem(PHOTO_KEY, value); setMessage('Photo updated.'); };
    reader.readAsDataURL(file);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!athlete) return;
    setSaving(true); setMessage('');
    try {
      await updateAthlete(athlete.id, { sport: form.sport, position: form.position, age: form.age ? Number(form.age) : null, height: form.height ? Number(form.height) : null, team: form.team });
      setMessage('Profile details saved.');
    } catch { setMessage('Could not save profile details.'); }
    finally { setSaving(false); }
  };

  return <>
    <button type="button" onClick={() => { setOpen(true); void load(); }} className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-left hover:bg-secondary/70" aria-label="Open account settings">
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-primary">{photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <UserCircle className="h-5 w-5" />}</span>
      <span className="min-w-0 leading-tight"><span className="block truncate text-xs font-semibold text-foreground">{athlete?.name ?? 'Your account'}</span><span className="block truncate text-[10px] text-muted-foreground">Account settings</span></span>
    </button>
    {open && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Account settings" className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-foreground">Account settings</h2><p className="text-xs text-muted-foreground">Manage your profile and fitness details</p></div><button type="button" onClick={() => setOpen(false)} className="text-xl text-muted-foreground" aria-label="Close account settings">×</button></div>
        <div className="flex items-center gap-4"><span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">{photo ? <img src={photo} alt="Profile" className="h-full w-full object-cover" /> : <UserCircle className="h-9 w-9" />}</span><label className="cursor-pointer text-sm font-medium text-primary"><Camera className="mr-2 inline h-4 w-4" />Upload photo<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={choosePhoto} /></label></div>
        <form onSubmit={save} className="grid grid-cols-2 gap-3"><label className="col-span-2 text-xs text-muted-foreground">Sport<select value={form.sport} onChange={(event) => setForm({ ...form, sport: event.target.value })} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="">Select sport</option>{sports.map((sport) => <option key={sport}>{sport}</option>)}</select></label><label className="text-xs text-muted-foreground">Position<Input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} /></label><label className="text-xs text-muted-foreground">Age<Input type="number" min="5" max="100" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></label><label className="text-xs text-muted-foreground">Height (cm)<Input type="number" min="1" max="300" value={form.height} onChange={(event) => setForm({ ...form, height: event.target.value })} /></label><label className="text-xs text-muted-foreground">Team<Input value={form.team} onChange={(event) => setForm({ ...form, team: event.target.value })} /></label><div className="col-span-2 flex items-center justify-between gap-3 pt-2"><span className="text-xs text-muted-foreground">{message}</span><Button type="submit" disabled={saving || !athlete} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save details'}</Button></div></form>
        <Button type="button" variant="destructive" onClick={onLogout} className="w-full gap-2"><LogOut className="h-4 w-4" />Log out / switch account</Button>
      </div>
    </div>}
  </>;
}
