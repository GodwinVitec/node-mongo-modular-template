const {Schema, model} = require("mongoose");
const bcrypt = require('bcryptjs');
const Commons = require("../../../../helpers/commons");

const config = (new Commons()).config;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    index: true,
  },
  lastName: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    index: true,
    default: null,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    default: null,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  countryPhoneCode: {
    type: String,
    index: true,
    default: null
  },
  phone: {
    type: String,
    index: true,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  role: {
    type: String,
    required: true
  },
  clearanceLevel: {
    type: Number,
    required: true
  },
  identificationType: {
    type: String,
    index: true,
    default: null
  },
  identificationNumber: {
    type: String,
    index: true,
    default: null
  },
  status: {
    type: String,
    required: true,
    index: true,
    enum: config("auth.account.allowedStatuses")
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  failedSignIns: {
    type: Number,
    default: null
  },
  suspensionDuration: {
    type: Number,
    default: null
  },
  suspensionTimeUnit: {
    type: String,
    default: null,
    enum: config("auth.account.suspension.allowedTimeUnits")
  },
  suspendedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', async function (next) {
  if (
    !this.isModified('firstName') &&
    !this.isModified('lastName')
  ) {
    return next();
  }

  this.firstName = this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1).toLowerCase();
  this.lastName = this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1).toLowerCase();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('initials').get(function () {
  return `${this.firstName.charAt(0).toUpperCase()}${this.lastName.charAt(0).toUpperCase()}`;
});

userSchema.virtual('phoneNumber').get(function () {
  return `${this.countryPhoneCode ?? ''}${this.phone ?? ''}`;
});

const User = model("User", userSchema);

module.exports = User;