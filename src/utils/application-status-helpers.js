'use strict';

import classNames from 'classnames';

module.exports = {
  /**
   * Evaluate the overall status of an application from it's status data
   */
  evaluateOverallStatus: function (item) {

    var isCrit = false, isOk = false, isWarn = false;

    var isError = (item.errorMessage || (Array.isArray(item) && item[0] == "CRIT"));
    if (isError) {
      isCrit = true;
    }

    if (item.dependencies) {
      if (item.dependencies.length > 0) {
        item.dependencies.forEach(function (dependency) {
          var status = dependency.status;
          var firstStatusItem;
          if (Array.isArray(status)) {
            firstStatusItem = status[0];
            switch (firstStatusItem) {
              case "OK":
                isOk = true;
                break;
              case "WARN":
                isWarn = true;
                break;
              case "CRIT":
                isCrit = true;
                break;
            }
          } else {
            isCrit = true;
          }
        });
      } else {
        isOk = true;
      }
    }

    return {
      'isCrit': isCrit,
      'isOK': isOk,
      'isWarn': isWarn
    }
  },

  isError: function(status) {
    return (status.errorMessage || (Array.isArray(status) && status[0] == "CRIT"));
  },

  getErrorMessage: function(status) {
    var errorMessage = ""
    if (status.errorMessage) {
      errorMessage = status.errorMessage;
    } else if (Array.isArray(status) && status.length >= 2) {
      errorMessage = status[1].result + ": " + status[1].details;
    } else {
      errorMessage = "Unknown error format. Check console for more info.";
      console.log("UNKNOWN ERROR");
      console.log(status);
    }

    return errorMessage;
  },

  getClassNames: function(isCrit, isOk, isWarn) {
    return classNames({
      "ok": isOk && !isWarn && !isCrit,
      "warn": isWarn && !isCrit,
      "crit": isCrit
    });
  },

  isStatusOK: function(status) {
    return status[0] === 'OK';
  },

  isStatusCRIT: function(status) {
    return status[0] === 'CRIT';
  },

  isStatusWARN: function(status) {
    return status[0] === 'WARN';
  }

};
