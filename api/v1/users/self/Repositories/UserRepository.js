const User = require('../Models/User');
const UserTransformer = require('../Transformers/UserTransformer');
const Commons = require('../../../../helpers/commons');

class UserRepository {
  constructor() {
    this.model = User;

    this.commonHelper = new Commons();
  }

  async create(userData) {
    return await this.model.create(userData);
  }

  async findById(
    id,
    projection = {}
  ){
    return this.model.findById(id, {...projection});
  }


  async findOne(
    filter = {}
  ) {
    return this.model.findOne({...filter}).exec();
  }

  async getUsers(
    filter = {},
    populate = null
  ) {
    const users = await this.model.find({...filter});

    if(populate) {
      await users.populate(populate);
    }

    return users;
  }

  async transformedUsers(filter = {}) {
    let pipeline = [
      {
        $sort: {
          firstName: 1
        }
      }
    ];

    if (!this.commonHelper.empty(filter)) {
      pipeline.push({
        $match: [
          {...filter}
        ]
      });
    }

    return await this.model.aggregate(pipeline)
      .then((data) => {
        return data.map(user => (new UserTransformer).transform(user));
      });
  }

  async update(
    filter = {},
    update = {},
    options = {},
    isMany = false
  ) {
    if (this.commonHelper.empty(filter)) {
      throw new Error("The filter parameter is required.");
    }

    if(this.commonHelper.empty(update)) {
      throw new Error("The update parameter is required.");
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
      throw new Error("The filter parameter is required.");
    }

    if(!isMany) {
      return this.model.findOneAndDelete(
        {...filter}
      );
    }

    return this.model.deleteMany({...filter});
  }
}

module.exports = UserRepository;