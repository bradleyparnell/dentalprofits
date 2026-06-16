import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Decision } from '../types';

const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'lead-video',
    question: '1. Which video leads the campaign?',
    options: ['Most compelling result story', 'Best on-camera presence', 'Shortest / most watchable', 'TBD after review'],
    chosen: null,
    notes: '',
  },
  {
    id: 'audience',
    question: '2. Primary outreach audience going forward?',
    options: ['Cold owner-doctor list', 'Warm referral network', 'LinkedIn organic first', 'Paid ads targeting DSO-free practices'],
    chosen: null,
    notes: '',
  },
  {
    id: 'email-sequence',
    question: '3. Which email leads for new audience?',
    options: ['Sports framing (offense/defense)', 'Quad System angle', 'Video testimonial first', 'Plain text from Bubba'],
    chosen: null,
    notes: '',
  },
  {
    id: 'cta-offer',
    question: '4. Primary CTA / offer on the call?',
    options: ['Free P&L review', 'Free 30-min strategy call', 'Watch video first, then book', 'Application-only approach'],
    chosen: null,
    notes: '',
  },
  {
    id: 'linkedin',
    question: '5. LinkedIn carousels — post or hold?',
    options: ['Post Quad System carousel now', 'Post both carousels this week', 'Hold until video is live', 'Use as paid ad creative'],
    chosen: null,
    notes: '',
  },
];

export const DecisionTracker: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_DECISIONS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.tasklet.sqlExec(
      `CREATE TABLE IF NOT EXISTS dpi_decisions (id TEXT PRIMARY KEY, chosen TEXT, notes TEXT)`
    ).then(() => {
      return window.tasklet.sqlQuery(`SELECT id, chosen, notes FROM dpi_decisions`);
    }).then((rows) => {
      if (rows.length > 0) {
        setDecisions(prev => prev.map(d => {
          const row = rows.find(r => r.id === d.id);
          if (row) return { ...d, chosen: row.chosen as string | null, notes: row.notes as string };
          return d;
        }));
      }
    }).catch((err) => console.error('Failed to load decisions:', err));
  }, []);

  const choose = (decisionId: string, option: string) => {
    setDecisions(prev => prev.map(d =>
      d.id === decisionId ? { ...d, chosen: d.chosen === option ? null : option } : d
    ));
    const d = decisions.find(x => x.id === decisionId);
    const newChosen = d?.chosen === option ? '' : option;
    const esc = (s: string) => s.split("'").join("''");
    window.tasklet.sqlExec(
      `INSERT OR REPLACE INTO dpi_decisions (id, chosen, notes) VALUES ('${decisionId}', '${esc(newChosen)}', '${esc(d?.notes || '')}')`
    ).catch((err) => console.error('Failed to save decision:', err));
  };

  const updateNotes = (decisionId: string, notes: string) => {
    setDecisions(prev => prev.map(d => d.id === decisionId ? { ...d, notes } : d));
  };

  const saveNotes = (decisionId: string, notes: string) => {
    const d = decisions.find(x => x.id === decisionId);
    const esc = (s: string) => s.split("'").join("''");
    window.tasklet.sqlExec(
      `INSERT OR REPLACE INTO dpi_decisions (id, chosen, notes) VALUES ('${decisionId}', '${esc(d?.chosen || '')}', '${esc(notes)}')`
    ).catch((err) => console.error('Failed to save notes:', err));
  };

  const decided = decisions.filter(d => d.chosen).length;

  return (
    <div className="p-4 space-y-4">
      {/* Context banner */}
      <div className="bg-base-200 rounded-xl p-4 border border-base-300">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🏈</div>
          <div>
            <h3 className="font-bold text-base-content text-sm mb-1">New Direction: Real Doctors, Real Results</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Moving off the SI client list to cold owner-doctor outreach. The Quad System framework and client testimonial videos are the new hooks. The football framing — "offense sells tickets, defense wins championships" — is the core brand angle.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">Key Decisions</span>
        <span className="badge badge-success badge-sm">{decided}/{decisions.length} decided</span>
      </div>

      {/* Decision cards */}
      {decisions.map((decision) => (
        <div key={decision.id} className={`rounded-xl border p-4 ${decision.chosen ? 'border-success/40 bg-success/5' : 'border-base-300 bg-base-200'}`}>
          <div className="flex items-start gap-2 mb-3">
            {decision.chosen
              ? <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
              : <Circle size={16} className="opacity-30 mt-0.5 shrink-0" />
            }
            <span className="text-sm font-semibold text-base-content">{decision.question}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {decision.options.map((opt) => (
              <button
                key={opt}
                onClick={() => choose(decision.id, opt)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  decision.chosen === opt
                    ? 'bg-success text-success-content border-success font-semibold'
                    : 'bg-base-100 border-base-300 text-base-content/70 hover:border-success/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="input input-bordered input-sm w-full text-xs"
            placeholder="Add a note for this decision..."
            value={decision.notes}
            onChange={(e) => updateNotes(decision.id, e.target.value)}
            onBlur={(e) => saveNotes(decision.id, e.target.value)}
          />
        </div>
      ))}

      {/* Assets summary */}
      <div className="bg-base-200 rounded-xl p-4 border border-base-300">
        <h4 className="text-xs font-bold text-base-content/60 uppercase tracking-wide mb-3">Assets In Hand</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '5 Email Templates', status: 'ready' },
            { label: '4 LinkedIn Posts', status: 'ready' },
            { label: '4 IG Captions', status: 'ready' },
            { label: '2 Facebook Ads', status: 'ready' },
            { label: '2 Carousels (PDF)', status: 'ready' },
            { label: 'Client Videos', status: 'needs-url' },
          ].map((a) => (
            <div key={a.label} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'ready' ? 'bg-success' : 'bg-warning'}`} />
              <span className="text-base-content/70">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
