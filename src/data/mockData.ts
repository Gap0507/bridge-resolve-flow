import { Case, DashboardStats, TimelineEvent } from '@/types';

export const mockCases: Case[] = [
  {
    id: '1',
    userId: '1',
    caseType: 'Family',
    title: 'Property Dispute with Brother',
    description: 'Dispute over inheritance of family property after father\'s death. Brother is claiming full ownership despite will clearly stating equal division.',
    oppositePartyName: 'Robert Doe',
    oppositePartyEmail: 'robert.doe@email.com',
    oppositePartyPhone: '+1-555-0123',
    isPendingInCourt: true,
    firNumber: 'FIR-2024-001234',
    courtName: 'City Family Court',
    proofFiles: [
      {
        id: '1',
        name: 'property_documents.pdf',
        type: 'document',
        url: '/mock-files/property_docs.pdf',
        size: 2048000,
        uploadedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'will_copy.jpg',
        type: 'image',
        url: '/mock-files/will_copy.jpg',
        size: 1024000,
        uploadedAt: '2024-01-15T10:05:00Z'
      }
    ],
    witnesses: [
      {
        id: '1',
        name: 'Mary Johnson',
        email: 'mary.johnson@email.com',
        phone: '+1-555-0567',
        relationship: 'Family Friend'
      }
    ],
    status: 'Awaiting Response',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    timeline: [
      {
        id: '1',
        caseId: '1',
        title: 'Case Submitted',
        description: 'Case submitted for verification',
        status: 'Pending Verification',
        createdAt: '2024-01-15T09:30:00Z',
        createdBy: 'John Doe'
      },
      {
        id: '2',
        caseId: '1',
        title: 'Case Verified',
        description: 'Documents verified and case approved',
        status: 'Verified',
        createdAt: '2024-01-16T11:15:00Z',
        createdBy: 'Admin'
      },
      {
        id: '3',
        caseId: '1',
        title: 'Notification Sent',
        description: 'Opposite party notified about the case',
        status: 'Awaiting Response',
        createdAt: '2024-01-18T09:00:00Z',
        createdBy: 'System'
      }
    ]
  },
  {
    id: '2',
    userId: '1',
    caseType: 'Business',
    title: 'Payment Dispute with Contractor',
    description: 'Contractor completed only 60% of agreed work but demanding full payment. Quality of work is also substandard.',
    oppositePartyName: 'BuildRight Construction',
    oppositePartyEmail: 'contact@buildright.com',
    oppositePartyPhone: '+1-555-0789',
    isPendingInCourt: false,
    proofFiles: [
      {
        id: '3',
        name: 'contract_agreement.pdf',
        type: 'document',
        url: '/mock-files/contract.pdf',
        size: 1536000,
        uploadedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '4',
        name: 'work_photos.jpg',
        type: 'image',
        url: '/mock-files/work_photos.jpg',
        size: 2048000,
        uploadedAt: '2024-01-20T15:35:00Z'
      }
    ],
    witnesses: [],
    status: 'Panel Created',
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-01-25T10:15:00Z',
    assignedPanel: {
      id: '1',
      members: [
        {
          id: '1',
          name: 'James Wilson',
          role: 'Lawyer',
          email: 'james.wilson@lawfirm.com',
          phone: '+1-555-0321'
        },
        {
          id: '2',
          name: 'Rev. Michael Brown',
          role: 'Religious Leader',
          email: 'pastor@community.church',
          phone: '+1-555-0654'
        },
        {
          id: '3',
          name: 'Lisa Garcia',
          role: 'Community Representative',
          email: 'lisa.garcia@community.org',
          phone: '+1-555-0987'
        }
      ],
      assignedAt: '2024-01-25T10:15:00Z'
    },
    timeline: [
      {
        id: '4',
        caseId: '2',
        title: 'Case Submitted',
        description: 'Case submitted for verification',
        status: 'Pending Verification',
        createdAt: '2024-01-20T15:00:00Z',
        createdBy: 'John Doe'
      },
      {
        id: '5',
        caseId: '2',
        title: 'Case Verified',
        description: 'Case verified and opposite party contacted',
        status: 'Verified',
        createdAt: '2024-01-21T10:00:00Z',
        createdBy: 'Admin'
      },
      {
        id: '6',
        caseId: '2',
        title: 'Case Accepted',
        description: 'Opposite party agreed to mediation',
        status: 'Accepted',
        createdAt: '2024-01-23T14:30:00Z',
        createdBy: 'BuildRight Construction'
      },
      {
        id: '7',
        caseId: '2',
        title: 'Panel Assigned',
        description: 'Mediation panel has been created and assigned',
        status: 'Panel Created',
        createdAt: '2024-01-25T10:15:00Z',
        createdBy: 'Admin'
      }
    ]
  },
  {
    id: '3',
    userId: '1',
    caseType: 'Employment',
    title: 'Wrongful Termination Claim',
    description: 'Terminated without proper notice period and cause. Company citing performance issues but no prior warnings given.',
    oppositePartyName: 'TechCorp Solutions',
    oppositePartyEmail: 'hr@techcorp.com',
    oppositePartyPhone: '+1-555-0456',
    isPendingInCourt: false,
    proofFiles: [
      {
        id: '5',
        name: 'employment_contract.pdf',
        type: 'document',
        url: '/mock-files/employment.pdf',
        size: 1024000,
        uploadedAt: '2024-01-25T12:00:00Z'
      }
    ],
    witnesses: [
      {
        id: '2',
        name: 'Alice Cooper',
        email: 'alice.cooper@email.com',
        phone: '+1-555-0234',
        relationship: 'Colleague'
      }
    ],
    status: 'Pending Verification',
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
    timeline: [
      {
        id: '8',
        caseId: '3',
        title: 'Case Submitted',
        description: 'Employment dispute case submitted',
        status: 'Pending Verification',
        createdAt: '2024-01-25T12:00:00Z',
        createdBy: 'John Doe'
      }
    ]
  }
];

export const mockDashboardStats: DashboardStats = {
  totalCases: 156,
  pendingVerification: 23,
  awaitingResponse: 18,
  inProgress: 31,
  resolved: 67,
  unresolved: 12,
  rejected: 5
};

// Additional mock cases for admin dashboard
export const mockAllCases: Case[] = [
  ...mockCases,
  {
    id: '4',
    userId: '3',
    caseType: 'Criminal',
    title: 'Assault Case Settlement',
    description: 'Physical altercation at workplace needs resolution',
    oppositePartyName: 'Mike Johnson',
    oppositePartyEmail: 'mike.j@email.com',
    oppositePartyPhone: '+1-555-0111',
    isPendingInCourt: true,
    firNumber: 'FIR-2024-002567',
    courtName: 'District Criminal Court',
    proofFiles: [],
    witnesses: [],
    status: 'Resolved',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-30T16:45:00Z',
    timeline: []
  },
  {
    id: '5',
    userId: '4',
    caseType: 'Property',
    title: 'Land Boundary Dispute',
    description: 'Neighbor encroaching on property line',
    oppositePartyName: 'David Smith',
    oppositePartyEmail: 'david.smith@email.com',
    oppositePartyPhone: '+1-555-0222',
    isPendingInCourt: false,
    proofFiles: [],
    witnesses: [],
    status: 'Rejected',
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    timeline: []
  }
];