'use strict';

/* Styles Dependencies */
require('./history-item.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

import applicationStatusHelpers from '../../utils/application-status-helpers';

var HistoryItem = React.createClass({
  displayName: 'HistoryItem',

  propTypes: {
    key: React.PropTypes.string.isRequired,
    clickHandler: React.PropTypes.func.isRequired,
    leftPosition: React.PropTypes.number.isRequired,
    rightPosition: React.PropTypes.number.isRequired,
    parentWidth: React.PropTypes.number.isRequired
  },

  render() {

    var overallStatus = applicationStatusHelpers.evaluateOverallStatus(this.props.item)
    var key = this.props.key;
    var width = 300;
    var fullWidthWidthPadding = 311;
    var leftPosition = 0;

    if ((window.innerWidth - this.props.rightPosition) < fullWidthWidthPadding) {
      leftPosition = "-" + (fullWidthWidthPadding - this.props.parentWidth) + "px";
    }

    var itemStyle = {
      width: width + "px",
      left: leftPosition
    };

    var classes = classNames({
      "historyItem": true
    }, applicationStatusHelpers.getClassNames(overallStatus.isCrit, overallStatus.isOK, overallStatus.isWarn));

    var items = [];
    if (overallStatus.isCrit)
    {
      if (this.props.item.dependencies) {
        this.props.item.dependencies.map(function (item) {
            if (applicationStatusHelpers.isStatusCRIT(item.status)) {
              items.push(<li>{item.name} - {applicationStatusHelpers.getErrorMessage(item.status)}</li>);
            }
          }
        );
      } else {
        items.push(<li>{applicationStatusHelpers.getErrorMessage(this.props.item)}</li>);
      }
    }

    if (overallStatus.isWarn)
    {
      this.props.item.dependencies.map(function(item) {
          if (applicationStatusHelpers.isStatusWARN(item.status)) {
            items.push(<li>{item.name} - {applicationStatusHelpers.getErrorMessage(item.status)}</li>);
          }
        }
      );
    }

    if (overallStatus.isOK && !overallStatus.isWarn && !overallStatus.isCrit)
    {
      items.push(<li>ALL GOOD</li>);
    }

    var statusDate = new Date(this.props.item.timestamp * 1000);

    return (
      <div key={key} className={classes} style={itemStyle}>
        <i className="fa fa-times" onClick={this.props.clickHandler}></i>
        <div>{statusDate.toString()}</div>
        <ul>{items}</ul>
      </div>
    );
  }

});

module.exports = HistoryItem;
