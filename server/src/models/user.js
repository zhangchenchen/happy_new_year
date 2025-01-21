const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true
  },
  nickname: String,
  avatarUrl: String,
  sessionKey: String,
  isVip: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新 updatedAt 字段
userSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 