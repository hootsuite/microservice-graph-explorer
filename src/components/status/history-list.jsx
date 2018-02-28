'use strict';

/* Styles Dependencies */
require('./history-list.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import HistoryItemBar from './history-item-bar.jsx'

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var HistoryList = React.createClass({
  displayName: 'HistoryList',

  propTypes: {
    key: React.PropTypes.string,
  },

  getInitialState: function() {
    return { minimized: true };
  },

  render() {

    var key = this.props.key;
    var transitionKey = key + "-trans";

    var items = "";
    if (this.props.history.length > 0) {
      var barItems = this.props.history;
      var length = barItems.length;
      var computedWidth = Math.floor(100 / length);
      var remainder = 100 % length;
      items = [];
      barItems.forEach(function (historyItem) {
        var width = computedWidth;
        if (remainder > 0) {
          width = width + 1;
          remainder --;
        }
        items.push(<HistoryItemBar key={historyItem.timestamp} item={historyItem} width={width} router={this.props.router}/>);
      }.bind(this));
    }

    return (
      <ul className="historyList" key={key}>
        <ReactCSSTransitionGroup key={transitionKey} transitionName="fade-in">
          {items}
        </ReactCSSTransitionGroup>
        {this.props.children}
      </ul>
    );
  }

});

module.exports = HistoryList;
