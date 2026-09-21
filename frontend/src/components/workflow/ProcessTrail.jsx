import { Check, Circle, AlertCircle, UserRound, Sparkles } from 'lucide-react';
import { getStages, timeLabel } from '../../lib/workflowRules';

export const ProcessTrail = ({ flow, order, products, prefix = 'process' }) => <section className="process-trail" data-testid={`${prefix}-trail`}>
  <div className="proposed-label" data-testid={`${prefix}-disclaimer`}><Sparkles size={14} />Usulan alur demonstrasi · 7 tahap</div>
  <p className="simulation-footnote">Nama dan urutan ini bukan kutipan resmi PRD; rincian tujuh tahap pada lampiran belum lengkap.</p>
  <ol>{getStages(flow, order, products).map((stage, i) => <li key={stage.title} className={`process-step ${stage.status === 'Selesai' ? 'done' : ['Gagal', 'Ditolak', 'Dihentikan'].includes(stage.status) ? 'failed' : stage.status === 'Belum dimulai' ? 'waiting' : 'attention'}`} data-testid={`${prefix}-stage-${i + 1}`}>
    <span className="step-marker">{stage.status === 'Selesai' ? <Check size={14} /> : stage.status === 'Gagal' ? <AlertCircle size={14} /> : i + 1}</span>
    <div><div className="step-title"><strong>{stage.title}</strong><span data-testid={`${prefix}-stage-${i + 1}-status`}>{stage.status}</span></div><small>{i === 5 ? <UserRound size={11} /> : <Circle size={9} />}{stage.role}</small>{stage.detail && <p>{stage.detail}</p>}</div>
  </li>)}</ol>
</section>;
export const DecisionHistory = ({ events = [], prefix = 'history' }) => <div className="decision-history" data-testid={`${prefix}-list`}>
  {!events.length && <p className="simulation-footnote" data-testid={`${prefix}-empty`}>Belum ada tindakan pada sesi ini. Data awal tidak diberi jejak keputusan buatan.</p>}
  {[...events].reverse().map(event => <article key={event.id} data-testid={`${prefix}-event-${event.id}`}><div><strong>{event.text}</strong><time>{timeLabel(event.at)}</time></div><p>{event.detail}</p><small>{event.actor} · {event.orderId ? `#${event.orderId}` : 'Percakapan'} · {event.blocked ? 'Ditahan' : 'Tercatat lokal'}</small></article>)}
</div>;