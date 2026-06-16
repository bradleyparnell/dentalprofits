export interface Decision {
  id: string;
  question: string;
  options: string[];
  chosen: string | null;
  notes: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  filepath: string;
  status: 'ready' | 'needs-video';
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

export type Tab = 'meeting' | 'emails' | 'notes';
