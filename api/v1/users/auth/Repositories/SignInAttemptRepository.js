const SignInAttempt = require("../Models/SignInAttempt");
const Commons = require("../../../../helpers/commons");

class SignInAttemptRepository {
  constructor() {
    this.model = SignInAttempt;

    this.commonHelper = new Commons();
  }

  create = async (attemptData) => {
    return this.model.create(attemptData);
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

    if(
      filter === null ||
      typeof filter !== 'object' ||
      Array.isArray(filter)
    ) {
      throw new Error(this.commonHelper.trans(
        'commons.errors.invalidOptions'
      ));
    }

    if(this.commonHelper.empty(update)) {
      throw new Error(
        this.commonHelper.trans(
          "commons.errors.updateParameterRequired"
        )
      );
    }

    if(
      update === null ||
      typeof update !== 'object' ||
      Array.isArray(update)
    ) {
      throw new Error(this.commonHelper.trans(
        'commons.errors.invalidOptions'
      ));
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
        'commons.errors.invalidFilter'
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
        'commons.errors.invalidFilter'
      ));
    }

    return this.model.findOne({...filter});
  }
}


module.exports = SignInAttemptRepository;