const BaseService = require('../../../BaseService');
const UserRepository = require('../Repositories/UserRepository');
const Commons = require('../../../../helpers/commons');
const moment = require("moment");

class UserService extends BaseService {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.commonHelper = new Commons();
  }

  getUsers = async () => {
    const users = await this.userRepository.getUsers();

    return this.success(
      this.commonHelper.trans(
        "user.messages.getAllSuccess"
      ),
      users
    );
  };

  findById = async (id) => {
    const user = await this.userRepository.findById(id, {
      password: 0,
      __v: 0
    });

    if (!user) {
      return this.error(
        [this.commonHelper.trans(
          "user.errors.account.notFound"
        )]
      );
    }

    return this.success(
      this.commonHelper.trans(
        "user.messages.account.retrieved"
      ),
      user.toJSON()
    );
  }

  findOne = async (filter = {}) => {
    const user = await this.userRepository.findOne({...filter});

    if (!user) {
      return this.error(
        [this.commonHelper.trans(
          "user.errors.account.notFound"
        )]
      );
    }

    return this.success(
      this.commonHelper.trans(
        "user.messages.account.retrieved"
      ),
      user
    );
  }

  getTransformedUsers = async () => {
    const users = await this.userRepository.transformedUsers();

    return this.success(
      this.commonHelper.trans(
        "user.messages.getAllSuccess"
      ),
      users
    );
  };


  create = async (userData) => {
    try {
      const user = await this.userRepository.create({
        ...userData,
        role: 'USER',
        status: 'INACTIVE',
        clearanceLevel: 0,
      });

      return this.success(
        this.commonHelper.trans(
          "user.messages.account.created"
        ),
        user
      );
    } catch (err) {
      return this.error(
        [
          this.commonHelper.trans(
            "user.errors.account.create"
          ),
          err.message
        ],
        err
      );
    }
  }

  update = async (id, userData) => {
    try {
      const updatedUser = await this.userRepository.update(
        {_id: id},
        {...userData},
        {
          new: true
        }
      );

      return this.success(
        this.commonHelper.trans(
          "user.messages.account.updated"
        ),
        updatedUser
      );
    } catch (error) {
      return this.error(
        [error.message],
        error
      );
    }
  }

  updateManyUsers = async (filter, userData) => {
    return await this.userRepository.update(
      {...filter},
      {...userData}
    );
  }

  updateLastLogin = async (user) => {
    return await this.update(user._id, {
      lastLogin: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  }

  destroy = async (id) => {
    try {
      const destroyResponse = await this.userRepository.destroy(
        {_id: id}
      );

      if (this.commonHelper.empty(destroyResponse?._id)) {
        return this.error(
          [this.commonHelper.trans(
            "user.errors.account.notFound"
          )]
        );
      }

      return this.success(
        this.commonHelper.trans(
          "user.messages.account.destroyed"
        )
      );
    } catch (error) {
      return this.error(
        [
          this.commonHelper.trans(
            "user.errors.account.destroy"
          ),
          error.message
        ]
      );
    }
  }
}

module.exports = UserService;