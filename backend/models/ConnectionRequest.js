const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
    index: true,
  },
  message: {
    type: String,
    maxlength: 300,
    default: '',
  },
}, {
  timestamps: true,
});

connectionRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
connectionRequestSchema.index({ receiver: 1, status: 1 });
connectionRequestSchema.index({ sender: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
