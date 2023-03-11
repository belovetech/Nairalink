const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Pls, provide your firstname'],
  },
  lastName: {
    type: String,
    required: [true, 'Pls, provide your lastname'],
  },
  userName: {
    type: String,
    required: [true, 'Pls, provide a username'],
  },
  image: String,
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'Kindly provide your email'],
    validate: [validator.isEmail, 'Pls, provide a valid email'],
  },
  phoneNumber: {
    type: Number,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Kindly provide a password'],
    min: [8, 'Minimum length should be 8'],
    select: false,
  },
  passwordConfirmation: {
    type: String,
    required: [true, 'Kindly re-enter your password'],
    validate: {
      validator(el) {
        return this.password === el;
      },
      message: 'Password are not the same!',
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  isVerified: Boolean,
});

const Customer = mongoose.model('Customer', customerSchema);

customerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  this.password = sha1(this.password);

  this.passwordConfirm = undefined;
  return next();
});

module.exports = Customer;
