/* eslint-disable use-isnan */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');

function toStrictString(value) {
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(value)) {
    throw new Error(`${value} should be a string data type`);
  }
  return value;
}

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Pls, provide your firstname'],
    set: toStrictString,
  },
  lastName: {
    type: String,
    required: [true, 'Pls, provide your lastname'],
    set: toStrictString,
  },
  userName: {
    type: String,
    required: [true, 'Pls, provide a username'],
    set: toStrictString,
  },
  image: String,
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: [true, 'Kindly provide your email'],
    validate: [validator.isEmail, 'Pls, provide a valid email'],
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: [true, 'Kindly provide a password'],
    minLength: [8, 'Minimum length should be 8'],
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
  isVerified: {
    type: Boolean,
    default: false,
  },
});

// eslint-disable-next-line func-names, consistent-return
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = sha1(this.password);

  this.passwordConfirmation = undefined;
  next();
});

// create index on email and phoneNumber field
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phoneNumber: 1 }, { sparse: true });

customerSchema.on('index', (err) => {
  console.log(err);
});

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
