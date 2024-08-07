const BaseController = require('../../../BaseController');
const AuthService = require('../Services/AuthService');
const OTPService = require('../Services/OTPService');
const LoginTransformer = require('../Transformers/LoginTransformer');
const UserAuthTokensTransformer = require('../Transformers/UserAuthTokensTransformer');
const Commons = require('../../../../helpers/commons');
require("../Middlewares/RequestValidators/SignUpRequest");
const UserService = require('../../self/Services/UserService');
const UserTransformer = require("../../self/Transformers/UserTransformer");

class AuthController extends BaseController{
  constructor() {
    super();

    this.authService = new AuthService();
    this.userService = new UserService();
    this.otpService = new OTPService();

    this.loginTransformer = new LoginTransformer();
    this.userAuthTokenTransformer = new UserAuthTokensTransformer();

    this.userTransformer = new UserTransformer();

    this.commonHelper = new Commons();
  }

  me = async (req, res) => {
    return this.success(
      res,
      this.commonHelper.trans("auth.messages.user"),
      this.userTransformer.transform(req.user)
    );
  }

  signup = async (req, res) => {
    const validated = req.validated;

    const {
      email,
      username,
      password,
      passwordConfirmation
    } = validated;

    if(password !== passwordConfirmation) {
      return this.fail(
        res,
        this.commonHelper.trans(
          "auth.errors.signUp.password.confirmationMismatch"
        ),
        null,
        400
      );
    }

    const userExistsResponse = await this.userService.findOne({email});

    if(userExistsResponse.status) {
      return this.fail(
        res,
        this.commonHelper.trans(
          "auth.errors.signUp.email.duplicate"
        ),
        null,
        400
      );
    }

    const usernameTakenResponse = await this.userService.findOne({username});
    if(usernameTakenResponse.status) {
      return this.fail(
        res,
        this.commonHelper.trans(
          "auth.errors.signUp.username.duplicate"
        ),
        null,
        400
      );
    }

    const signupResponse = await this.authService.signup(validated, res);

    if (signupResponse.status !== true) {
      return this.fail(
        res,
        signupResponse.errors,
        signupResponse.trace
      );
    }

    return this.success(
      res,
      signupResponse.message,
    );
  }

  signIn = async (req, res) => {
    const validated = req.validated;

    const attemptLogin = await this.authService.attempt(validated);

    if (!attemptLogin.status) {
      return this.fail(
        res,
        attemptLogin.errors,
        attemptLogin.trace,
        422
      );
    }

    let user = attemptLogin.data;

    const generateOTP = await this.otpService.create(
      user,
      this.commonHelper.config(
        "auth.otp.types.LOGIN.title"
      )
    );

    if (!generateOTP?.status) {
      return this.fail(
        res,
        generateOTP.errors,
        generateOTP.trace,
        500
      );
    }

    return this.success(
      res,
      this.commonHelper.trans(
        "auth.messages.signIn.success"
      )
    );
  }

  verifyLogin = async (req, res) => {
    const {otp, email} = req.validated;

    const verifyOTP = await this.otpService.verify(
      otp,
      email,
      this.commonHelper.config(
        "auth.otp.types.LOGIN.title"
      )
    );

    if (!verifyOTP.status) {
      return this.fail(
        res,
        verifyOTP.errors,
        verifyOTP.trace
      );
    }

    let user = verifyOTP.data;
    const userAuthTokensData = await this.authService.getAuthTokens(user);

    if (!userAuthTokensData.status) {
      return this.fail(
        res,
        userAuthTokensData.errors,
        userAuthTokensData.trace,
        400
      );
    }

    const userAuthTokens = userAuthTokensData.data;

    const transformedAuthTokens = this.userAuthTokenTransformer.transform(
      userAuthTokens
    );

    user = (await this.userService.updateLastLogin(user)).data;

    const transformedUser = this.loginTransformer.transform(user);

    return this.success(
      res,
      this.commonHelper.trans(
        "auth.messages.signIn.success"
      ),
      {
        ...transformedUser,
        ...transformedAuthTokens
      }
    )
  }

  refreshToken = async(req, res) => {
    const {refreshToken: userRefreshToken} = req.validated;

    const refreshTokenResponse = await this.authService.refreshToken(
      userRefreshToken
    );

    if (!refreshTokenResponse.status) {
      return this.fail(
        res,
        refreshTokenResponse.errors,
        refreshTokenResponse.trace,
        400
      );
    }

    return this.success(
      res,
      this.commonHelper.trans(
        "auth.messages.refreshToken"
      ),
      this.userAuthTokenTransformer.transform(
        refreshTokenResponse.data
      )
    );
  }
}

module.exports = AuthController;