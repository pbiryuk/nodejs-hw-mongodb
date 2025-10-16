import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // автоматично створює createdAt і updatedAt
    versionKey: false,
    collection: 'users',
  },
);

const User = mongoose.model('User', userSchema);

export default User;
