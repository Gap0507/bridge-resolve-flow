import mongoose from 'mongoose';

const fileUploadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'audio', 'video', 'document'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const witnessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Witness name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Witness email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Witness phone is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  relationship: {
    type: String,
    required: [true, 'Relationship to case is required'],
    trim: true
  }
});

const panelMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Lawyer', 'Religious Leader', 'Community Representative'],
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  }
});

const panelSchema = new mongoose.Schema({
  members: [panelMemberSchema],
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

const timelineEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: [
      'Pending Verification',
      'Verified',
      'Awaiting Response',
      'Accepted',
      'Rejected',
      'Panel Created',
      'Mediation in Progress',
      'Resolved',
      'Unresolved'
    ],
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const caseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caseType: {
    type: String,
    enum: ['Family', 'Business', 'Criminal', 'Property', 'Employment', 'Other'],
    required: [true, 'Case type is required']
  },
  title: {
    type: String,
    required: [true, 'Case title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Case description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  oppositePartyName: {
    type: String,
    required: [true, 'Opposite party name is required'],
    trim: true
  },
  oppositePartyEmail: {
    type: String,
    required: [true, 'Opposite party email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  oppositePartyPhone: {
    type: String,
    required: [true, 'Opposite party phone is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  oppositePartyAddress: {
    street: String,
    city: String,
    zipCode: String,
    state: String
  },
  isPendingInCourt: {
    type: Boolean,
    default: false
  },
  firNumber: {
    type: String,
    trim: true
  },
  courtName: {
    type: String,
    trim: true
  },
  policeStation: {
    type: String,
    trim: true
  },
  proofFiles: [fileUploadSchema],
  witnesses: [witnessSchema],
  status: {
    type: String,
    enum: [
      'Pending Verification',
      'Verified',
      'Awaiting Response',
      'Accepted',
      'Rejected',
      'Panel Created',
      'Mediation in Progress',
      'Resolved',
      'Unresolved'
    ],
    default: 'Pending Verification'
  },
  assignedPanel: panelSchema,
  timeline: [timelineEventSchema],
  isOppositePartyNotified: {
    type: Boolean,
    default: false
  },
  notificationSentAt: Date,
  resolutionDetails: {
    type: String,
    trim: true
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
caseSchema.index({ userId: 1, status: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ caseType: 1 });
caseSchema.index({ createdAt: -1 });

// Virtual for case duration
caseSchema.virtual('duration').get(function() {
  if (this.resolvedAt) {
    return Math.ceil((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Add timeline event method
caseSchema.methods.addTimelineEvent = function(title, description, status, createdBy) {
  this.timeline.push({
    title,
    description,
    status,
    createdBy
  });
  return this.save();
};

// Update status method
caseSchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  this.addTimelineEvent(
    `Status Updated to ${newStatus}`,
    `Case status has been updated to ${newStatus}`,
    newStatus,
    userId
  );
  return this.save();
};

export default mongoose.model('Case', caseSchema); 