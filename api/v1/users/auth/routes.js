const express = require('express');
const router = express.Router();

const AuthController = require('./Controllers/AuthController');
let Auth = require('../../../helpers/auth');

Auth = new Auth();

// Request Validators
const SignUpRequest = require('./Middlewares/RequestValidators/SignUpRequest');
const SignInRequest = require('./Middlewares/RequestValidators/SignInRequest');
const RefreshTokenRequest = require('./Middlewares/RequestValidators/RefreshTokenRequest');

// Middlewares
const authenticateToken = Auth.authenticate;
const clearanceLevel1 = Auth.clearanceLevel1;


// Request Handlers
const authHandler = new AuthController();

// Open Routes
router.post('/signup', SignUpRequest, authHandler.signup);
router.post(
  '/login',
  SignInRequest,
  authHandler.signIn
);

router.post(
  '/tokens/refresh',
  RefreshTokenRequest,
  authHandler.refreshToken
);

// Authenticated Routes
router.use(authenticateToken);

router.get('/me', authHandler.me);

router.use(clearanceLevel1);

module.exports = router;