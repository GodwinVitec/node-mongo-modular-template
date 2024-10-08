const BaseService = require("../../../BaseService");
const Commons = require("../../../../helpers/commons");
const OTPRepository = require("../Repositories/OTPRepository");
const UserService = require("../../self/Services/UserService");
const {Types} = require("mongoose");
const moment = require("moment");

class OTPService extends BaseService {
  #repository;
  #userService;
  #commonHelper;

  constructor() {
    super();

    this.#repository = new OTPRepository();

    this.#userService = new UserService();
    this.#commonHelper = new Commons();
  }

  generate = () => {
    const otp = String(Math.floor(
      Math.random() * 99999999999999 + Date.now()
    ));

    return otp.substring(otp.length - 6);
  }

  create = async(
    user,
    purpose,
    duration = null,
    timeUnit = this.#commonHelper.config('auth.otp.timeUnits.MINUTES')
  ) => {
    if (
      this.#commonHelper.empty(user?.email) ||
      this.#commonHelper.empty(user?._id)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.incompleteParameters"
        )
      );
    }

    if (
      !this.#commonHelper.config("auth.otp.allowedTypes")
        .includes(purpose)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.invalidPurpose"
        )
      );
    }

    if (
      !this.#commonHelper.config("auth.otp.allowedTimeUnits")
        .includes(timeUnit)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.invalidPurpose"
        )
      );
    }

    // Verify that the user exists and was actually assigned this OTP
    // To guard against manipulations at db level
    const userResponse = await this.#userService.findOne({
      _id: new Types.ObjectId(user._id)
    });

    if (!userResponse.status) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.unauthorizedUser"
        )
      )
    }

    const otp = this.generate();

    const otpData = {
      otp,
      user: user._id,
      email: user.email,
      purpose,
      duration: duration ?? this.#commonHelper.config(
        `auth.otp.types.${purpose.toUpperCase()}.defaultDurationInMinutes`
      ),
      timeUnit
    };

    try {
      // Destroy other existing OTPs for the same
      // purpose for the same user
      await this.#repository.destroy({
        email: user.email,
        purpose
      }, true);

      // Create a new OTP
      await this.#repository.create(otpData);

      return this.success(
        this.#commonHelper.trans(
          "auth.messages.otp.generated"
        ),
        { otp }
      );
    } catch (err) {
      return this.error(
        err.message,
        err
      );
    }
  }

  verify = async(otp, email, purpose) => {
    // Validate the purpose of the OTP
    if (
      !this.#commonHelper.config("auth.otp.allowedTypes")
        .includes(purpose)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.invalidPurpose"
        )
      );
    }

    // Verify that the OTP exists
    const otpData = await this.#repository.findOne({
      email,
      purpose
    });

    if (
      this.#commonHelper.empty(otpData) ||
      this.#commonHelper.empty(otpData._id)
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.notFound"
        )
      );
    }

    // Verify that the user exists and was actually assigned this OTP
    // To guard against manipulations at db level
    const userResponse = await this.#userService.findOne({
      _id: new Types.ObjectId(otpData.user)
    });

    if (
      !userResponse.status ||
      userResponse.data.email !== email
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.unauthorizedUser"
        )
      )
    }

    // Check OTP expiry
    const createdAt = moment(otpData.createdAt).add(
      otpData.duration,
      otpData.timeUnit
    );

    if(
      moment().isAfter(createdAt)
    ) {
      await this.#repository.destroy({
        _id: new Types.ObjectId(otpData._id)
      });

      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.expired"
        )
      );
    }

    // Validate OTP
    if (
      !(await otpData.compare(otp))
    ) {
      return this.error(
        this.#commonHelper.trans(
          "auth.errors.otp.invalid"
        )
      )
    }

    // Destroy the OTP and return success
    await this.#repository.destroy({
      _id: new Types.ObjectId(otpData._id)
    });

    return this.success(
      this.#commonHelper.trans(
        "auth.messages.otp.verified"
      ),
      userResponse.data
    );
  }
}


module.exports = OTPService;