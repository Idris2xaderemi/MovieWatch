import mongoose, { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// NextAuth creates a 'users' collection – this model matches that schema.
export const User = models.User || mongoose.model('User', UserSchema);