import { toast } from '@/hooks/use-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  age?: number;
  gender?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  };
  phone?: string;
  photo?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  _id: string;
  userId: string;
  caseType: 'Family' | 'Business' | 'Criminal' | 'Property' | 'Employment' | 'Other';
  title: string;
  description: string;
  oppositePartyName: string;
  oppositePartyEmail: string;
  oppositePartyPhone: string;
  oppositePartyAddress?: {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  };
  isPendingInCourt: boolean;
  firNumber?: string;
  courtName?: string;
  policeStation?: string;
  proofFiles: FileUpload[];
  witnesses: Witness[];
  status: CaseStatus;
  assignedPanel?: Panel;
  timeline: TimelineEvent[];
  resolutionDetails?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
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
  _id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  path: string;
  size: number;
  uploadedAt: string;
}

export interface Witness {
  _id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface Panel {
  _id: string;
  members: PanelMember[];
  assignedAt: string;
}

export interface PanelMember {
  _id: string;
  name: string;
  role: 'Lawyer' | 'Religious Leader' | 'Community Representative';
  email: string;
  phone: string;
}

export interface TimelineEvent {
  _id: string;
  title: string;
  description: string;
  status: CaseStatus;
  createdBy: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCases: number;
  pendingVerification: number;
  awaitingResponse: number;
  inProgress: number;
  resolved: number;
  unresolved: number;
  rejected: number;
  totalUsers: number;
  totalAdmins: number;
  resolutionRate: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  age?: number;
  gender?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  };
}

export interface CreateCaseData {
  caseType: string;
  title: string;
  description: string;
  oppositePartyName: string;
  oppositePartyEmail: string;
  oppositePartyPhone: string;
  oppositePartyAddress?: {
    street: string;
    city: string;
    zipCode: string;
    state: string;
  };
  isPendingInCourt: boolean;
  firNumber?: string;
  courtName?: string;
  policeStation?: string;
  witnesses?: Witness[];
}

// Utility functions
const getAuthToken = (): string | null => {
  return localStorage.getItem('resolveIt_token');
};

const setAuthToken = (token: string): void => {
  localStorage.setItem('resolveIt_token', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('resolveIt_token');
};

const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  
  let message = 'An unexpected error occurred';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  
  throw new Error(message);
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    handleApiError(error);
  }
};

// Auth API
export const authApi = {
  // Register user
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }
    
    return response;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    return await apiRequest<{ user: User }>('/auth/me');
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    return await apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Logout
  logout: (): void => {
    removeAuthToken();
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

// Cases API
export const casesApi = {
  // Create new case
  createCase: async (caseData: CreateCaseData): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  // Get user cases
  getUserCases: async (params?: {
    status?: string;
    caseType?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ cases: Case[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.caseType) queryParams.append('caseType', params.caseType);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiRequest<{ cases: Case[]; pagination: any }>(endpoint);
  },

  // Get single case
  getCase: async (caseId: string): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>(`/cases/${caseId}`);
  },

  // Update case
  updateCase: async (caseId: string, updateData: Partial<Case>): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>(`/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Upload files to case
  uploadFiles: async (caseId: string, files: File[]): Promise<ApiResponse<{ case: Case }>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  },

  // Add witness to case
  addWitness: async (caseId: string, witnessData: Omit<Witness, '_id'>): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>(`/cases/${caseId}/witnesses`, {
      method: 'POST',
      body: JSON.stringify(witnessData),
    });
  },

  // Remove witness from case
  removeWitness: async (caseId: string, witnessId: string): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>(`/cases/${caseId}/witnesses/${witnessId}`, {
      method: 'DELETE',
    });
  },

  // Delete case
  deleteCase: async (caseId: string): Promise<ApiResponse<void>> => {
    return await apiRequest<void>(`/cases/${caseId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminApi = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<ApiResponse<{ stats: DashboardStats; recentCases: Case[]; casesByType: any[]; casesByStatus: any[] }>> => {
    return await apiRequest<{ stats: DashboardStats; recentCases: Case[]; casesByType: any[]; casesByStatus: any[] }>('/admin/dashboard');
  },

  // Get all cases
  getAllCases: async (params?: {
    status?: string;
    caseType?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<{ cases: Case[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.caseType) queryParams.append('caseType', params.caseType);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `/admin/cases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiRequest<{ cases: Case[]; pagination: any }>(endpoint);
  },

  // Get all users
  getAllUsers: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiRequest<{ users: User[]; pagination: any }>(endpoint);
  },

  // Update case status
  updateCaseStatus: async (caseId: string, status: CaseStatus, resolutionDetails?: string): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>(`/cases/${caseId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolutionDetails }),
    });
  },

  // Assign panel to case
  assignPanel: async (caseId: string, members: Omit<PanelMember, '_id'>[]): Promise<ApiResponse<{ case: Case }>> => {
    return await apiRequest<{ case: Case }>(`/cases/${caseId}/panel`, {
      method: 'POST',
      body: JSON.stringify({ members }),
    });
  },

  // Bulk update case statuses
  bulkUpdateCaseStatus: async (caseIds: string[], status: CaseStatus, resolutionDetails?: string): Promise<ApiResponse<{ modifiedCount: number }>> => {
    return await apiRequest<{ modifiedCount: number }>('/admin/cases/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ caseIds, status, resolutionDetails }),
    });
  },

  // Get system analytics
  getSystemAnalytics: async (period?: number): Promise<ApiResponse<any>> => {
    const endpoint = `/admin/analytics${period ? `?period=${period}` : ''}`;
    return await apiRequest<any>(endpoint);
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<ApiResponse<{ timestamp: string; environment: string }>> => {
    return await apiRequest<{ timestamp: string; environment: string }>('/health');
  },
};

export default {
  auth: authApi,
  cases: casesApi,
  admin: adminApi,
  health: healthApi,
}; 