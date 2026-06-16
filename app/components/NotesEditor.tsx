import React, { useState, useEffect, useRef } from 'react';
import { Github, Save, CheckCircle, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { GitHubRepo } from '../types';

const CONNECTION_ID = 'conn_se6e89m2etx49b4tgd67';
const NOTES_PATH = '/tasklet/agent/home/dpi-meeting-notes.md';
const DEFAULT_NOTES = `# DPI Strategy Meeting Notes
Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

## Attendees
- 

## Key Decisions Made
- 

## Action Items
- [ ] GenieRocket:
- [ ] DPI (Bubba):

## Next Steps
- 

## Notes
`;

export const NotesEditor: React.FC = () => {
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [reposLoading, setReposLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Load saved notes from disk
    window.tasklet.readFileFromDisk(NOTES_PATH).then((content) => {
      if (content && content.trim()) setNotes(content);
    }).catch(() => {
      // File doesn't exist yet, use default
    });

    // Load repos
    loadRepos();
  }, []);

  const loadRepos = async () => {
    setReposLoading(true);
    try {
      const result = await window.tasklet.invokeTool({
        toolName: 'github_list_repositories',
        connectionId: CONNECTION_ID,
        args: { type: 'owner', per_page: 30 },
      });
      const list = result as GitHubRepo[];
      setRepos(list);
    } catch (err) {
      console.error('Failed to load repos:', err);
    } finally {
      setReposLoading(false);
    }
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    // Auto-save to disk (debounced)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      window.tasklet.writeFileToDisk(NOTES_PATH, val).catch((err) => console.error('Auto-save failed:', err));
    }, 1500);
  };

  const pushToGitHub = async () => {
    if (!selectedRepo) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      // First save latest to disk
      await window.tasklet.writeFileToDisk(NOTES_PATH, notes);

      const result = await window.tasklet.invokeTool({
        toolName: 'github_push_to_branch',
        connectionId: CONNECTION_ID,
        args: {
          owner: selectedRepo.fullName.split('/')[0],
          repo: selectedRepo.name,
          branch: selectedRepo.defaultBranch,
          commitMessage: `DPI meeting notes — ${new Date().toLocaleDateString()}`,
          files: [{ repoPath: 'dpi-meeting-notes.md', localPath: NOTES_PATH }],
        },
      });
      const r = result as { commit: { sha: string } };
      setSaveStatus('success');
      setSaveMsg(`Pushed to ${selectedRepo.fullName} — ${r.commit?.sha?.slice(0, 7) || 'done'}`);
    } catch (err) {
      console.error('Failed to push to GitHub:', err);
      setSaveStatus('error');
      setSaveMsg('Push failed. Check repo access.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-3" style={{ height: 'calc(100vh - 120px)' }}>
      {/* GitHub toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-base-content/50">
          <Github size={14} />
          <span>Save to repo:</span>
        </div>

        {/* Repo selector */}
        <div className="relative">
          <button
            className="btn btn-sm btn-outline gap-1.5 text-xs"
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
            disabled={reposLoading}
          >
            {reposLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                {selectedRepo ? selectedRepo.name : 'Select repo'}
                <ChevronDown size={12} />
              </>
            )}
          </button>
          {showRepoDropdown && repos.length > 0 && (
            <div className="absolute top-full left-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 w-56 max-h-48 overflow-y-auto">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-base-200 flex items-center justify-between"
                  onClick={() => { setSelectedRepo(repo); setShowRepoDropdown(false); }}
                >
                  <span className="font-medium">{repo.name}</span>
                  {repo.private && <span className="badge badge-xs">private</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-sm btn-primary gap-1.5 text-xs ml-auto"
          onClick={pushToGitHub}
          disabled={!selectedRepo || saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Save size={13} />
          )}
          {saving ? 'Pushing...' : 'Push to GitHub'}
        </button>
      </div>

      {/* Status message */}
      {saveStatus !== 'idle' && (
        <div className={`alert ${saveStatus === 'success' ? 'alert-success' : 'alert-error'} py-2 text-xs`}>
          {saveStatus === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {saveMsg}
        </div>
      )}

      {/* Editor */}
      <textarea
        className="textarea textarea-bordered flex-1 font-mono text-xs resize-none leading-relaxed"
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        spellCheck={false}
        placeholder="Start typing meeting notes..."
      />
      <p className="text-xs text-base-content/30 text-right">Auto-saved locally as you type · Push to GitHub when ready</p>
    </div>
  );
};
