const jwt = require('jsonwebtoken');
const BaseService = require('../../../BaseService');
const AuthRepository = require('../Repositories/AuthRepository');
const UserService = require('../../self/Services/UserService');
const Commons = require('../../../../helpers/commons');
const DateHelper = require('../../../../helpers/datetime');
const {Types} = require("mongoose");
const SignInAttemptRepository = require("../Repositories/SignInAttemptRepository");
const moment = require("moment");

class AuthService extends BaseService {
  #signInAttemptRepository;
  #authRepository;
  #userService;
  #commonHelper;
  #dateHelper;

  constructor() {
    super();
    this.#authRepository = new AuthRepository();
    this.#signInAttemptRepository = new SignInAttemptRepository();

    this.#userService = new UserService();
    this.#commonHelper = new Commons();
    this.#dateHelper = new DateHelper();
  }

  signup = async (userData) => {
    try {
      const signUpResponse = await this.#userService.create({...userData});

      if (!signUpResponse.status) {
        return signUpResponse;
      }

      return this.success(
        signUpResponse.message,
        signUpResponse.data
      );
    } catch (err) {
      return this.error(
        [
          this.#commonHelper.trans(
            "auth.errors.singUp.failed"
          ),
          err.message
        ],
        err
      );
    }
  }

  attempt = async (
    userData,
    req,
    suspensionTimeUnit = this.#commonHelper.config(
      "auth.account.suspension.timeUnits.MINUTES"
    )
  ) => {
    if (
      this.#commonHelper.empty(userData) ||
      this.#commonHelper.empty(userData.username) ||
      this.#commonHelper.empty(userData.password)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.signIn.requiredParameters"
        )
      );
    }

    if(
      req === null ||
      typeof req !== 'object' ||
      Array.isArray(req)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.signIn.invalidRequestObject"
        )
      )
    }

    if (
      typeof suspensionTimeUnit !== 'string' ||
      !this.#commonHelper.config(
        "auth.account.suspension.allowedTimeUnits"
      ).includes(suspensionTimeUnit)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.accountSuspension.invalidTimeUnit"
        )
      );
    }

    const userExists = await this.#userService.findOne({
      username: userData.username
    });

    if (!userExists.status) {
      return this.error(
        this.#commonHelper.trans(
          "user.errors.account.notFound"
        )
      );
    }

    let user = userExists.data;

    let totalFailedAttempts = 0;
    const passwordMatched = await user.comparePassword(userData.password);

    if (!passwordMatched) {
      this.#commonHelper.log(
        JSON.stringify({
          activity: 'Login Attempt',
          details: {...userData},
          status: 'failed'
        }),
        this.#commonHelper.config(
          "app.logging.logLevel.WARN"
        )
      );

      await this.#signInAttemptRepository.create({
        user: user._id,
        ...userData,
        ipAddress: this.#commonHelper.getIpAddress(req)
      });

      totalFailedAttempts = await this.#signInAttemptRepository
        .count({
          user: user._id
        });

      user = await this.#onFailedSignInAttempt(
        user,
        totalFailedAttempts,
        suspensionTimeUnit
      );

      if (
        user.status === this.#commonHelper.config(
          "auth.account.statuses.SUSPENDED"
        )
      ) {
        return this.error(
          this.#commonHelper.trans(
            "user.errors.account.disabledUntil"
          ).replace(
            ':until',
            this.#dateHelper.formatDateTime(
              moment(user.suspendedAt).add(user.suspensionDuration, 'minutes')
                .toISOString()
            )
          )
        );
      }

      return this.error(
        this.#commonHelper.trans(
          "auth.errors.signIn.invalidCredentials"
        )
      );
    }


    // if the account is suspended, and the number of failed attempts exceeds
    // the ALERT threshold, or the time of suspension has not elapsed,
    // then prevent signing in.
    if (
      user.status === this.#commonHelper.config(
        "auth.account.statuses.SUSPENDED"
      ) && (
        user.failedSignIns > this.#commonHelper.config(
          "auth.account.suspension.thresholdCounts.ALERT"
        ) ||
        moment().isBefore(
          moment(user.suspendedAt)
          .add(
            user.suspensionDuration,
            user.suspensionTimeUnit ?? suspensionTimeUnit
          )
        )
      )
    ) {
      // If the number of failed sign-ins did surpass the ALERT threshold
      // then the user must use forgot password.

      if(user.failedSignIns > this.#commonHelper.config(
        "auth.account.suspension.thresholdCounts.ALERT"
      )) {
        return this.error(
          this.#commonHelper.trans(
            "user.errors.account.disabledUseForgotPassword"
          )
        );
      }

      return this.error(
        this.#commonHelper.trans(
          "user.errors.account.disabledUntil"
        ).replace(
          ':until',
          this.#dateHelper.formatDateTime(
            moment(user.suspendedAt).add(
              user.suspensionDuration,
              user.suspensionTimeUnit ?? suspensionTimeUnit
            ).toISOString()
          )
        )
      );
    }

    if (
      !user.isActive ||
      user.status !== this.#commonHelper.config(
        "auth.account.statuses.ACTIVE"
      )
    ) {
      return this.error(
        this.#commonHelper.trans(
          "user.errors.account.disabled"
        )
      );
    }

    totalFailedAttempts = await this.#signInAttemptRepository
      .count({
        user: user._id
      });

    if (user.failedSignIns || totalFailedAttempts) {
      await this.#signInAttemptRepository.destroy(
        {
          user: new Types.ObjectId(user._id)
        },
        true
      );
    }

    // From failedSignIns <= ALERT threshold we can unblock
    // the account if the waiting time elapses
    if (
      user.status === this.#commonHelper.config(
        "auth.account.statuses.SUSPENDED"
      )
    ) {
      await this.#userService.activateAccount(user);
    }

    delete userData.password;

    this.#commonHelper.log(
      JSON.stringify({
        activity: 'Login Attempt',
        details: {...userData},
        status: 'success'
      })
    );

    return this.success(
      this.#commonHelper.trans(
        "auth.messages.signIn.attemptSuccess"
      ),
      user
    );
  }

  getAuthTokens = async (user) => {
    const userExists = await this.#userService.findOne({
      username: user.username
    });

    if (
      !userExists.status ||
      userExists.data?.isActive !== true
    ) {
      throw new Error(
        this.#commonHelper.trans(
          "user.errors.account.notFound"
        )
      );
    }

    const accessToken = jwt.sign(
      {
        sub: user._id
      },
      this.#commonHelper.env('JWT_SECRET'),
      {
        expiresIn: this.#commonHelper.env(
          'JWT_ACCESS_TOKEN_EXPIRY'
        )
      }
    );

    const refreshToken = jwt.sign(
      {
        sub: user._id
      },
      this.#commonHelper.env('JWT_SECRET'),
      {
        expiresIn: this.#commonHelper.env(
          'JWT_REFRESH_TOKEN_EXPIRY'
        )
      }
    );

    const userAuthTokens = await this.#authRepository.createAuthToken(
      {
        user: user._id,
        accessToken,
        refreshToken
      }
    );

    return this.success(
      this.#commonHelper.trans(
        "auth.messages.authTokens.generated"
      ),
      userAuthTokens
    );
  }

  refreshToken = async (refreshToken) => {
    if(
      typeof refreshToken !== 'string'
    ) {
      throw new Error(
        this.#commonHelper.trans(
          "auth.errors.authTokens.invalidRefreshToken"
        )
      );
    }

    let userId = null;

    jwt.verify(
      refreshToken,
      this.#commonHelper.env('JWT_SECRET'),
      async function (err, decoded) {
        if (!(new Commons()).empty(decoded)) {
          userId = decoded.sub;
        }
      }
    );

    if (this.#commonHelper.empty(userId)) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.authTokens.notFound"
        )
      );
    }

    const userExists = await this.#userService.findOne({
      _id: new Types.ObjectId(userId)
    });

    if (!userExists.status) {
      return this.error(
        this.#commonHelper.trans(
          "user.errors.account.notFound"
        )
      );
    }

    const tokenExists = await this.#authRepository.getUserAuthToken(
      {
        refreshToken,
        user: new Types.ObjectId(userId)
      }
    );

    if (
      this.#commonHelper.empty(tokenExists) ||
      this.#commonHelper.empty(tokenExists._id)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.authTokens.notFound"
        )
      );
    }

    const accessToken = jwt.sign(
      {
        sub: tokenExists.user
      },
      this.#commonHelper.env('JWT_SECRET'),
      {
        expiresIn: this.#commonHelper.env(
          'JWT_ACCESS_TOKEN_EXPIRY'
        )
      }
    );

    const newAuthTokens = await this.#authRepository.updateAuthToken(
      {
        userId: tokenExists.userId,
        refreshToken
      }, {
        accessToken
      }, {
        new: true
      }
    )

    return this.success(
      this.#commonHelper.trans(
        "auth.messages.authTokens.refreshed"
      ),
      newAuthTokens
    );
  }

  // Private functions begin here
  #onFailedSignInAttempt = async (
    user,
    failedAttempts,
    timeUnit = this.#commonHelper.config(
      "auth.account.suspension.timeUnits.MINUTES"
    )
  ) => {
    if (typeof failedAttempts !== 'number') {
      throw new Error(
        this.#commonHelper.trans(
          "commons.errors.value.mustBeNumber"
        ).replace(":parameter", 'failedAttempts')
      );
    }

    const suspension = this.#commonHelper.config(
      "auth.account.suspension"
    );

    /**
     * The expected configuration for suspension must have two properties
     * 1. The thresholdCounts to hold configs for the count for each suspension
     * 2. The duration to hold configs for duration of each threshold count
     *
     * The accepted levels for threshold counts include ALERT, WARN, MALICIOUS, ALARM and DEADLY.
     * If any of these are not available, kindly remove from all concerned places
     * otherwise an error will be thrown.
     */
    this.#validateSuspensionConfig(suspension);

    if (failedAttempts < suspension.thresholdCounts.ALERT) {
      // There are not enough failed attempts to warrant an action
      return user;
    }

    let suspensionConfig = {
      failedSignIns: failedAttempts
    };

    if (this.#commonHelper.empty(user.suspendedAt)) {
      suspensionConfig.suspendedAt = new Date();
    }

    const thresholds = suspension.thresholdCounts;
    const durations = suspension.duration;

    if (failedAttempts >= thresholds.DEADLY) {
      suspensionConfig.suspensionDuration = durations.DEADLY;
      suspensionConfig.isActive = false; // deactivate the account
    } else if (failedAttempts >= thresholds.ALARM) {
      suspensionConfig.suspensionDuration = durations.ALARM;
    } else if (failedAttempts >= thresholds.MALICIOUS) {
      suspensionConfig.suspensionDuration = durations.MALICIOUS;
    } else if (failedAttempts >= thresholds.WARN) {
      suspensionConfig.suspensionDuration = durations.WARN;
    } else {
      suspensionConfig.suspensionDuration = durations.ALERT;
    }

    suspensionConfig.suspensionTimeUnit = timeUnit;
    suspensionConfig.status = this.#commonHelper.config(
      "auth.account.statuses.SUSPENDED"
    );

    const updateUser = await this.#userService.update(user._id, suspensionConfig);

    if (updateUser.status !== true) {
      throw new Error(updateUser.errors.join('. '))
    }

    return updateUser.data;
  }

  #validateSuspensionConfig = (suspension) => {
    const empty = this.#commonHelper.empty;

    if (
      typeof suspension !== 'object' ||
      empty(suspension.thresholdCounts) ||
      empty(suspension.thresholdCounts.ALERT) ||
      empty(suspension.thresholdCounts.WARN) ||
      empty(suspension.thresholdCounts.MALICIOUS) ||
      empty(suspension.thresholdCounts.ALARM) ||
      empty(suspension.thresholdCounts.DEADLY) ||
      empty(suspension.duration) ||
      empty(suspension.duration.ALERT) ||
      empty(suspension.duration.WARN) ||
      empty(suspension.duration.MALICIOUS) ||
      empty(suspension.duration.ALARM) ||
      empty(suspension.duration.DEADLY)
    ) {
      throw new Error(
        this.#commonHelper.trans(
          "auth.errors.accountSuspension.configNotFound"
        )
      );
    }

    const thresholds = suspension.thresholdCounts;

    for (const threshold of Object.keys(thresholds)) {
      if (
        Number.isNaN(
          Number.parseInt(thresholds[threshold])
        )
      ) {
        throw new Error(
          this.#commonHelper.trans(
            "auth.errors.accountSuspension.invalidConfiguration"
          )
        );
      }
    }

    const durations = suspension.duration;

    for (const duration of Object.keys(durations)) {
      if (
        Number.isNaN(
          Number.parseInt(durations[duration])
        )
      ) {
        throw new Error(
          this.#commonHelper.trans(
            "auth.errors.accountSuspension.invalidConfiguration"
          )
        );
      }
    }
  }

}

module.exports = AuthService;