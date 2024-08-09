const BaseTransformer = require("../../../BaseTransformer");
const Commons = require("../../../../helpers/commons");
const DateTimeHelper = require("../../../../helpers/datetime");

class LoginTransformer extends BaseTransformer {
  constructor() {
    super();

    this.commonHelper = new Commons();
    this.datetimeHelper = new DateTimeHelper();
  }

  transform = (user) => {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      initials: user.initials,
      username: user.username ?? '',
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage ?? '-',
      role: user.role,
      clearanceLevel: user.clearanceLevel,
      status: user.status,
      isActive: user.isActive,
      lastLogin: this.datetimeHelper.formatDateTime(user.lastLogin?.toISOString()),
      lastLoginExpressive: user.lastLogin?.toString(),
    }
  }
}

module.exports = LoginTransformer;