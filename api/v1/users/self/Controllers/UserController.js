const BaseController = require('../../../BaseController');
const UserService = require('../Services/UserService');
const UserTransformer = require('../Transformers/UserTransformer');
const Commons = require('../../../../helpers/commons');

class UserController extends BaseController{
  constructor() {
    super();

    this.userService = new UserService();
    this.userTransformer = new UserTransformer();
    this.commonHelper = new Commons();
  }

  index = async (req, res) => {};
}

module.exports = UserController;