'use strict';

/* Styles Dependencies */
require('./toast.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var Toast = React.createClass({
  displayName: 'Toast',

  propTypes: {
    handleClick: React.PropTypes.func.isRequired
  },

  render: function() {
    var classes = classNames(this.props.className, {
      'toast': true
    });

    return (
      <div className={classes} onClick={this.props.handleClick}>
        <div className="text">
          {this.props.children}
        </div>
      </div>
    );
  }

});

module.exports = Toast;
