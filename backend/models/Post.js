const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Post cannot exceed 2000 characters'],
    trim: true,
  },
  images: [{
    url: String,
    publicId: String,
  }],
  codeSnippet: {
    code: { type: String, maxlength: 5000 },
    language: { type: String, default: 'javascript' },
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30,
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0, index: true },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  bookmarkCount: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public',
  },
  // For trending algorithm: engagement score
  engagementScore: { type: Number, default: 0, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ content: 'text', tags: 'text' });

// Recalculate engagement score before save
postSchema.pre('save', function (next) {
  this.engagementScore =
    this.likesCount * 1 +
    this.commentsCount * 2 +
    this.sharesCount * 3;
  next();
});

module.exports = mongoose.model('Post', postSchema);
