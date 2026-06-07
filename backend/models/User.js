const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, maxlength: 500 },
}, { _id: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 300 },
  techStack: [{ type: String }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  imageUrl: { type: String },
}, { _id: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  refreshToken: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Profile
  name: { type: String, trim: true, maxlength: 50 },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, select: false },
  bio: { type: String, maxlength: 200, default: '' },
  headline: { type: String, maxlength: 100, default: '' },
  location: { type: String, maxlength: 100, default: '' },
  website: { type: String, default: '' },
  githubUsername: { type: String, trim: true, default: '' },
  twitterHandle: { type: String, trim: true, default: '' },
  linkedinUrl: { type: String, default: '' },

  // Developer-specific
  skills: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30,
  }],
  techStack: [{ type: String, trim: true }],
  openToWork: { type: Boolean, default: false },
  yearsOfExperience: { type: Number, min: 0, max: 50, default: 0 },
  experience: [experienceSchema],
  projects: [projectSchema],

  // Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },

  // Bookmarks
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

  // Skill endorsements: { skill: [userId, ...] }
  endorsements: {
    type: Map,
    of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: {},
  },

  // Analytics
  profileViews: { type: Number, default: 0 },
  profileViewsThisWeek: { type: Number, default: 0 },

  // Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
// userSchema.index({ username: 1 });
// userSchema.index({ email: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ name: 'text', username: 'text', headline: 'text', skills: 'text' });
userSchema.index({ followersCount: -1 }); // trending algorithm
userSchema.index({ createdAt: -1 });

// Virtual: full GitHub URL
userSchema.virtual('githubUrl').get(function () {
  return this.githubUsername ? `https://github.com/${this.githubUsername}` : '';
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.avatarPublicId;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
