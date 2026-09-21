import { useState } from 'react';
import { Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from '../ui/sonner';
import { SCENARIOS } from '../../lib/scenarios';
import { useStore } from '../../lib/store';

export const ScenarioPicker = ({ open, onClose, onStart }) => {
  const [selected, setSelected] = useState('normal'); const { startScenario } = useStore();
  const start = () => { const result = startScenario(selected); if (!result.ok) return toast.error(result.message); onStart(result.id); onClose(); };
  return <Dialog open={open} onOpenChange={v => !v && onClose()}><DialogContent className="app-modal scenario-modal" data-testid="scenario-dialog"><DialogTitle data-testid="scenario-title">Jalankan percakapan terpandu</DialogTitle><DialogDescription data-testid="scenario-description">Data dan respons sudah ditentukan dalam skenario. Pesan bebas tidak dipahami otomatis oleh AI.</DialogDescription><div className="scenario-options" role="radiogroup" aria-label="Pilih skenario">{SCENARIOS.map(s => <button role="radio" aria-checked={selected === s.id} key={s.id} className={selected === s.id ? 'selected' : ''} data-testid={`scenario-${s.id}`} onClick={() => setSelected(s.id)}><span className="scenario-radio" /><span><strong>{s.title}</strong><small>{s.description}</small></span></button>)}</div><Button className="primary-button" data-testid="start-scenario-button" onClick={start}><Play size={15} />Mulai skenario</Button></DialogContent></Dialog>;
};