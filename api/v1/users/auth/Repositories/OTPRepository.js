const OTP = require("../Models/OTP");
const Commons = require("../../../../helpers/commons");

class OTPRepository {
  constructor() {
    this.model = OTP;

    this.commonHelper = new Commons();
  }

  create = async (otpData) => {
    return this.model.create(otpData);
  }

  async update(
    filter = {},
    update = {},
    options = {},
    isMany = false
  ) {
    if (this.commonHelper.empty(filter)) {
      throw new Error(
        this.commonHelper.trans(
          "commons.errors.filterParameterRequired"
        )
      );
    }

    if(this.commonHelper.empty(update)) {
      throw new Error(
        this.commonHelper.trans(
          "commons.errors.updateParameterRequired"
        )
      );
    }

    if(
      options === null ||
      typeof options !== 'object' ||
      Array.isArray(options)
    ) {
      throw new Error(this.commonHelper.trans(
        'commons.errors.invalidOptions'
      ));
    }

    if (!isMany) {
      return this.model.findOneAndUpdate(
        {...filter},
        {...update},
        {...options}
      );
    }

    return this.model.updateMany(
      {...filter},
      {...update},
      {...options}
    );
  }

  async destroy(
    filter = {},
    isMany = false
  ) {
    if (this.commonHelper.empty(filter)) {
      throw new Error(
        this.commonHelper.trans(
          "commons.errors.filterParameterRequired"
        )
      );
    }

    if(
      filter === null ||
      typeof filter !== 'object' ||
      Array.isArray(filter)
    ) {
      throw new Error(this.commonHelper.trans(
        'commons.errors.invalidFilter'
      ));
    }

    if(!isMany) {
      return this.model.findOneAndDelete(
        {...filter}
      );
    }

    return this.model.deleteMany({...filter});
  }

  async find(filter = {}) {
    if(
      filter === null ||
      typeof filter !== 'object' ||
      Array.isArray(filter)
    ) {
      throw new Error(this.commonHelper.trans(
        "commons.errors.invalidFilter"
      ));
    }

    return this.model.find({...filter});
  }

  async findOne(filter = {}) {
    if(
      filter === null ||
      typeof filter !== 'object' ||
      Array.isArray(filter)
    ) {
      throw new Error(this.commonHelper.trans(
        "commons.errors.invalidFilter"
      ));
    }

    return this.model.findOne({...filter});
  }
}


module.exports = OTPRepository;