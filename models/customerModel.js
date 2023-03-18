/* eslint-disable consistent-return */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const validator = require('validator');
const sha1 = require('sha1');

function strictString(val) {
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(val)) throw new Error(`${val} should be a string`);
  return val;
}

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Pls, provide your firstname'],
    set: strictString,
  },
  lastName: {
    type: String,
    required: [true, 'Pls, provide your lastname'],
    set: strictString,
  },
  userName: String,
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
    required: [true, 'Kindly provide your phone number'],
    validate: {
      validator(el) {
        return (
          Number(el) > 999999999 && Number(el) < 9999999999 && el[0] === '0'
        );
      },
      message: 'Invalid phone number',
    },
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
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) return next();

  this.password = sha1(this.password);

  this.passwordConfirmation = undefined;
  next();
});

customerSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
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
