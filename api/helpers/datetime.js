const moment = require('moment');

class DateTimeHelper {
  /**
   * Convert an ISO time string to the format 'DD.MM.YY HH:mm
   * @param {String} datetime
   * @param {String} format
   * @return {String}
   */
  formatDateTime = (datetime, format = null) => {
    if(typeof datetime !== 'string') {
      return '';
    }

    return moment(datetime).format(format ?? 'DD.MM.YY HH:mm');
  };
}

module.exports = DateTimeHelper;