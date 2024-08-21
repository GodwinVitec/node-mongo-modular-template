const jwt = require('jsonwebtoken');
const UserService = require('../../api/v1/users/self/Services/UserService');
const Commons = require('../helpers/commons');
const rateLimit = require('express-rate-limit');


class Auth {
  constructor() {
    this.userService = new UserService();

    this.commons = new Commons();
  }

  /**
   * Validate the authentication token
   *
   * @param req
   * @param res
   * @param next
   */
  authenticate = async (req, res, next) => {
    let accessToken = req.headers['x-access-token'] || req.headers.authorization;

    if (this.commons.empty(accessToken)) {
      return res.status(401)
        .send({
          status: false,
          error: [this.commons.trans("auth.errors.unauthorized")]
        });
    }

    accessToken = accessToken.replace(/^Bearer\s+/, "");

    jwt.verify(
      accessToken,
      this.commons.env('JWT_SECRET'),
      async function (err, decoded) {
      const trans = new Commons().trans;

      if ((new Commons()).empty(decoded)) {
        return res.status(401)
          .send({
            status: false,
            error: [trans("auth.errors.unauthenticated")]
          });
      }

      (new UserService()).findById(decoded.sub)
        .then(async (response) => {
          if (!response.status) {
            return res.status(401)
              .send({
                status: false,
                message: response.message
              });
          }

          const user = response.data;

          if (!user.isActive) {
            return res.status(403)
              .send({
                status: false,
                error: [trans("user.errors.account.disabled")]
              });
          }

          req.user = user;
          next();
        });
    });
  }


  /**
   * Check that the current user has a clearance level of 1 or greater
   * @param req
   * @param res
   * @param next
   * @return {*}
   */
  clearanceLevel1 = (req, res, next) => {
    if (!req.user) {
      return res.status(401)
        .send({
          status: false,
          message: this.commons.trans("auth.errors.unauthenticated")
        })
    }

    let userClearanceLevel = Number.parseInt(req.user.clearanceLevel);
    userClearanceLevel = Number.isNaN(userClearanceLevel) ?
      0 : userClearanceLevel;

    if (userClearanceLevel < 1) {
      return res.status(401)
        .send({
          status: false,
          message: this.commons.trans(
            "auth.errors.clearanceLevel.required"
          )
            .replace(":level", "1")
        });
    }

    return next();
  }

  rateLimiter = () => {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 10 requests per windowMs
      message: this.commons.trans("auth.errors.rateLimiting.exceeded")
    })
  }
}

module.exports = Auth;