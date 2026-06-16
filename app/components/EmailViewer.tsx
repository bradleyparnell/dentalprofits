import React, { useState, useEffect } from 'react';
import { Mail, ExternalLink, ChevronRight } from 'lucide-react';
import { EmailTemplate } from '../types';

const EMAILS: EmailTemplate[] = [
  { id: 'promo', name: 'Main Promo', subject: 'Is Your P&L Telling You the Full Story?', filepath: '/tasklet/agent/home/dental-profits-email-template.html', status: 'ready' },
  { id: 'followup', name: 'Follow-Up', subject: 'Still not getting the full picture?', filepath: '/tasklet/agent/home/dental-profits-followup-email.html', status: 'ready' },
  { id: 'video', name: 'Video Story', subject: 'Watch: Before & After P&L', filepath: '/tasklet/agent/home/dental-profits-video-email.html', status: 'needs-video' },
  { id: 'bubba', name: 'Bubba Plain Text', subject: 'something I keep seeing with dental practices...', filepath: '/tasklet/agent/home/dental-profits-bubba-plaintext-email.html', status: 'ready' },
  { id: 'objections', name: 'Objection Handler', subject: 'I know what you\'re thinking...', filepath: '/tasklet/agent/home/dental-profits-objection-handler-email.html', status: 'ready' },
];

export const EmailViewer: React.FC = () => {
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadEmail = async (email: EmailTemplate) => {
    setSelected(email);
    setLoading(true);
    setHtmlContent('');
    try {
      const content = await window.tasklet.readFileFromDisk(email.filepath);
      setHtmlContent(content);
    } catch (err) {
      console.error('Failed to load email:', err);
      setHtmlContent('<p style="color:red;padding:20px">Failed to load email content.</p>');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Sidebar */}
      <div className="w-52 shrink-0 border-r border-base-300 overflow-y-auto p-3 space-y-1">
        <p className="text-xs font-bold text-base-content/50 uppercase tracking-wide px-2 py-1">Templates</p>
        {EMAILS.map((email) => (
          <button
            key={email.id}
            onClick={() => loadEmail(email)}
            className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${
              selected?.id === email.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-base-200'
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className={`text-xs font-semibold ${selected?.id === email.id ? 'text-primary' : 'text-base-content'}`}>
                {email.name}
              </span>
              {email.status === 'needs-video' && (
                <span className="badge badge-warning badge-xs shrink-0 mt-0.5">video</span>
              )}
            </div>
            <p className="text-xs text-base-content/50 mt-0.5 leading-tight line-clamp-2">{email.subject}</p>
          </button>
        ))}
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!selected && (
          <div className="flex-1 flex flex-col items-center justify-center text-base-content/30 gap-3">
            <Mail size={40} />
            <p className="text-sm">Select an email to preview</p>
          </div>
        )}
        {selected && (
          <>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300 bg-base-200">
              <div>
                <p className="text-sm font-semibold text-base-content">{selected.name}</p>
                <p className="text-xs text-base-content/50">Subject: {selected.subject}</p>
              </div>
              {selected.status === 'needs-video' && (
                <span className="badge badge-warning badge-sm">Needs video URL</span>
              )}
            </div>
            <div className="flex-1 overflow-auto bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="loading loading-spinner loading-md text-primary" />
                </div>
              ) : (
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-full border-0"
                  style={{ minHeight: '600px' }}
                  sandbox="allow-same-origin"
                  title={selected.name}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
