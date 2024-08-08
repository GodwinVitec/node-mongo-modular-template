const {model, Schema, Types} = require('mongoose');
const Commons = require('../../../../helpers/commons');


const signInAttemptSchema = new Schema({
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toObject: {virtuals: true},
  toJSON: {virtuals: true},
});

const SignInAttempt = model('SignInAttempt', signInAttemptSchema);

module.exports = SignInAttempt;