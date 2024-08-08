const SignInAttempt = require("../Models/SignInAttempt");
const Commons = require("../../../../helpers/commons");

class SignInAttemptRepository {
  constructor() {
    this.model = SignInAttempt;

    this.commonHelper = new Commons();
  }

  create = async (attemptData) => {
    return await this.model.create(attemptData)
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
          "auth.errors.filterParameterRequired"
        )
      );
    }

    if(this.commonHelper.empty(update)) {
      throw new Error(
        this.commonHelper.trans(
          "auth.errors.updateParameterRequired"
        )
      );
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

  async count(
    filter = {}
  ) {
    return this.model.find({...filter})
      .countDocuments();
  }

  async destroy(
    filter = {},
    isMany = false
  ) {
    if (this.commonHelper.empty(filter)) {
      throw new Error(
        this.commonHelper.trans(
          "auth.errors.filterParameterRequired"
        )
      );
    }

    if(!isMany) {
      return this.model.findOneAndDelete(
        {...filter}
      );
    }

    return this.model.deleteMany({...filter});
  }

  async find(filter = {}) {
    return this.model.find({...filter});
  }


  async findOne(filter = {}) {
    return this.model.findOne({...filter});
  }
}


module.exports = SignInAttemptRepository;