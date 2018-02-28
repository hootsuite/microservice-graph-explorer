'use strict';

/* Styles Dependencies */
require('./history-item-bar.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import HistoryItem from './history-item.jsx'

import applicationStatusHelpers from '../../utils/application-status-helpers';

var HistoryItemBar = React.createClass({
  displayName: 'HistoryItemBar',

  propTypes: {
    key: React.PropTypes.string,
    width: React.PropTypes.number.isRequired,
    item: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return { showHistoryItem: false };
  },

  toggleShowHistory: function () {
    this.setState({ showHistoryItem: !this.state.showHistoryItem });
  },

  clickCloseHandler: function () {
    this.setState({ showHistoryItem: false });
  },

  render() {

    var overallStatus = applicationStatusHelpers.evaluateOverallStatus(this.props.item)
    var key = this.props.key;

    var c = {
      "bar": true,
      "open": this.state.showHistoryItem
    };
    var classes = classNames(c, applicationStatusHelpers.getClassNames(overallStatus.isCrit, overallStatus.isOK, overallStatus.isWarn));

    var itemStyle = {
      width: this.props.width + '%'
    };

    var historyItem = "";
    if (this.state.showHistoryItem) {
      var historyItemKey = key + "hi";
      var position = this.getDOMNode().getBoundingClientRect();
      historyItem = <HistoryItem key={historyItemKey} item={this.props.item} parentWidth={position.width} leftPosition={position.left} rightPosition={position.right} clickHandler={this.clickCloseHandler} />
    }

    return (
      <li key={key} className="historyItemBar" style={itemStyle}>
        <div className={classes} onClick={this.toggleShowHistory}></div>
        {historyItem}
      </li>
    );
  }

});

module.exports = HistoryItemBar;
