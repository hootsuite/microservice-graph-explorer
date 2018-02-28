'use strict';

/* Styles Dependencies */
require('./breadcrumb.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var Breadcrumb = React.createClass({
  displayName: 'Breadcrumb',

  propTypes: {
    showSeparator: React.PropTypes.bool.isRequired,
    isClickable: React.PropTypes.bool.isRequired,
    clickLocation: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {  };
  },

  handleClick: function() {
    if (this.props.isClickable) {
      this.props.router.transitionTo(this.props.clickLocation);
    }
  },

  render() {
    var displayText = this.props.text;
    var separator = "";
    if (this.props.showSeparator) {
      separator = (<span> &gt; </span>);
    }

    var classes = classNames(this.props.className, {
      'breadcrum': true,
      'clickable': this.props.isClickable
    });

    return (
      <span>
        {separator}
        <span className={classes} onClick={this.handleClick}>{displayText}</span>
      </span>
    );
  }
});

module.exports = Breadcrumb;
