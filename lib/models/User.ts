import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = models.User || mongoose.model('User', UserSchema);