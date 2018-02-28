'use strict';

/* Styles Dependencies */
require('./page.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var Page = React.createClass({
  displayName: 'Page',

  propTypes: {
    className: React.PropTypes.string.isRequired,
    key: React.PropTypes.string,
    isRootPage: React.PropTypes.bool
  },

  render() {

    var classes = classNames(this.props.className, {
      'page': true
    });

    var key = this.props.key;

    return (
      <div className={classes} key={key}>
          {this.props.children}
      </div>
    );
  },

});

module.exports = Page;
