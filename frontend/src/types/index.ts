export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: string;
  address?: string;
  phone?: string;
  photo?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Case {
  id: string;
  userId: string;
  caseType: 'Family' | 'Business' | 'Criminal' | 'Property' | 'Employment' | 'Other';
  title: string;
  description: string;
  oppositePartyName: string;
  oppositePartyEmail: string;
  oppositePartyPhone: string;
  isPendingInCourt: boolean;
  firNumber?: string;
  courtName?: string;
  proofFiles: FileUpload[];
  witnesses: Witness[];
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  assignedPanel?: Panel;
  timeline: TimelineEvent[];
}

export type CaseStatus = 
  | 'Pending Verification'
  | 'Verified'
  | 'Awaiting Response'
  | 'Accepted'
  | 'Rejected'
  | 'Panel Created'
  | 'Mediation in Progress'
  | 'Resolved'
  | 'Unresolved';

export interface FileUpload {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Witness {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface Panel {
  id: string;
  members: PanelMember[];
  assignedAt: string;
}

export interface PanelMember {
  id: string;
  name: string;
  role: 'Lawyer' | 'Religious Leader' | 'Community Representative';
  email: string;
  phone: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdAt: string;
  createdBy: string;
}

export interface DashboardStats {
  totalCases: number;
  pendingVerification: number;
  awaitingResponse: number;
  inProgress: number;
  resolved: number;
  unresolved: number;
  rejected: number;
}