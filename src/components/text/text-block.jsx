'use strict';

/* Styles Dependencies */
require('./text-block.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var Dependency = React.createClass({
  displayName: 'TextBlock',

  getInitialState() {
    return { expanded: false, }
  },

  handleClick: function() {
    this.setState({expanded: !this.state.expanded});
  },

  render: function() {

    var classes = classNames(this.props.className, {
      'expanded': this.state.expanded,
      'textBlock': true
    });

    var text = this.props.text.trim();
    var trimLength = 100;
    var ellipsis = "";

    if (text.length > trimLength) {
      if (!this.state.expanded) {
        text = text.substring(0, trimLength);
        ellipsis = (<span className="ellipsis">more ...</span>);
      } else {
        ellipsis = (<span className="ellipsis">less ...</span>);
      }
    }

    return (
      <div className={classes} onClick={this.handleClick}>
        {text} {ellipsis}
      </div>
    );
  }

});

module.exports = Dependency;
