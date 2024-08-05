const {Schema, model, mongo} = require('mongoose');
const mongoose = require("mongoose");


const userAuthTokenSchema = new Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

const UserAuthToken = mongoose.model(
  'UserAuthToken',
  userAuthTokenSchema
);


module.exports = UserAuthToken;