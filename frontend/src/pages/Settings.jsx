import { useState } from 'react';
import { Save, Store, Sparkles, ShieldCheck, Bell, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from '../components/ui/sonner';
import { useStore } from '../lib/store';
import { PageTitle } from '../components/dashboard/Shared';

export default function Settings() {
  const { settings, saveSettings, reset } = useStore();
  const [form, setForm] = useState(settings); const [confirm, setConfirm] = useState(false);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = e => {
    e.preventDefault();
    if (!form.name.trim() || !form.owner.trim() || !form.address.trim()) { toast.error('Informasi toko tidak boleh kosong'); return; }
    saveSettings({ ...form, name: form.name.trim(), owner: form.owner.trim(), address: form.address.trim() });
    toast.success('Pengaturan toko berhasil disimpan');
  };
  const confirmReset = () => {
    reset();
    setForm({ name: 'Ruang Rupa', owner: 'Rina', phone: '0812-3456-7890', address: 'Jl. Cempaka No. 21, Jakarta Selatan', assistant: true, notifications: true });
    setConfirm(false); toast.success('Data demo dikembalikan ke kondisi awal');
  };
  return <>
    <PageTitle title="Pengaturan" subtitle="Ruang kerja yang sesuai dengan cara Anda berbisnis." />
    <form className="settings-form" onSubmit={submit}>
      <section className="settings-section">
        <div className="settings-section-title"><Store size={22} /><h2 data-testid="store-settings-heading">Profil toko</h2><p>Identitas bisnis dan informasi pemilik.</p></div>
        <div className="form-stack">
          <div className="form-grid">
            <label>Nama toko<input data-testid="store-name-input" name="name" value={form.name} onChange={change} required maxLength={50} /></label>
            <label>Nama pemilik<input data-testid="owner-name-input" name="owner" value={form.owner} onChange={change} required maxLength={40} /></label>
          </div>
          <label>Nomor WhatsApp bisnis<input type="tel" autoComplete="tel" data-testid="store-phone-input" name="phone" value={form.phone} onChange={change} required pattern="(?:[0-9+ ]|-){8,22}" title="Gunakan 8–22 karakter nomor telepon" /></label>
          <label>Alamat toko<textarea data-testid="store-address-input" name="address" value={form.address} onChange={change} required maxLength={200} rows="3" /></label>
        </div>
      </section>
      <section className="settings-section">
        <div className="settings-section-title"><Sparkles size={22} /><h2 data-testid="assistant-settings-heading">Asisten & notifikasi</h2><p>Atur ritme kerja asisten bisnis Anda.</p></div>
        <div className="settings-options">
          <div className="setting-toggle"><span><strong>Asisten Tuntas</strong><small>Status asisten di ruang kerja Anda</small></span><Switch data-testid="assistant-toggle" aria-label="Aktifkan Asisten Tuntas" checked={form.assistant} onCheckedChange={v => setForm({ ...form, assistant: v })} /></div>
          <div className="setting-toggle"><span><strong><Bell size={15} />Notifikasi persetujuan</strong><small>Tanda notifikasi untuk pesanan yang menunggu</small></span><Switch data-testid="notifications-toggle" aria-label="Notifikasi persetujuan" checked={form.notifications} onCheckedChange={v => setForm({ ...form, notifications: v })} /></div>
          <div className="safe-note"><ShieldCheck size={17} /><span>Persetujuan pemilik selalu aktif untuk setiap pesanan.</span></div>
        </div>
      </section>
      <div className="settings-save"><Button type="submit" className="primary-button" data-testid="save-settings-button"><Save size={16} />Simpan perubahan</Button></div>
    </form>
    <section className="reset-section"><div><h2 data-testid="reset-heading">Mulai lagi dari awal</h2><p>Kembalikan pesanan, percakapan, dan produk ke data awal.</p></div><Button variant="outline" data-testid="reset-demo-button" onClick={() => setConfirm(true)}><RotateCcw size={15} />Reset data demo</Button></section>
    <Dialog open={confirm} onOpenChange={setConfirm}>
      <DialogContent className="app-modal" data-testid="reset-dialog">
        <DialogTitle data-testid="reset-dialog-title">Reset data demo?</DialogTitle>
        <DialogDescription data-testid="reset-dialog-description">Semua perubahan di browser ini akan dihapus dan diganti data awal. Tindakan ini tidak dapat dibatalkan.</DialogDescription>
        <div className="modal-actions"><Button variant="outline" data-testid="cancel-reset-button" onClick={() => setConfirm(false)}>Batal</Button><Button variant="destructive" data-testid="confirm-reset-button" onClick={confirmReset}>Ya, reset data</Button></div>
      </DialogContent>
    </Dialog>
  </>;
}