const {model, Schema, Types} = require('mongoose');
const Commons = require("../../../../helpers/commons");
const bcrypt = require("bcryptjs");

const config = (new Commons()).config;

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
  },
  purpose: {
    type: String,
    required: true,
    index: true,
    enum: config("auth.otp.allowedTypes")
  },
  email: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  next();
});

otpSchema.methods.compare = async function (otp) {
  return await bcrypt.compare(otp, this.otp);
};


const OTP = model('OTP', otpSchema);

module.exports = OTP;