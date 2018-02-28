'use strict';

/* Styles Dependencies */
require('./more-block.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var MoreBlock = React.createClass({
  displayName: 'MoreBlock',

  getInitialState() {
    return { expanded: false, }
  },

  handleClick: function() {
    this.setState({expanded: !this.state.expanded});
  },

  render: function() {

    var classes = classNames(this.props.className, {
      'expanded': this.state.expanded,
      'moreBlock': true
    });

    var content = "";
    if (this.state.expanded) {
      content = (<div><div>{this.props.children}</div><div className="more" onClick={this.handleClick}><i className="fa fa-chevron-up fa-2x"></i></div></div>);
    } else {
      content = (<div className="more" onClick={this.handleClick}><i className="fa fa-chevron-down fa-2x"></i></div>);
    }

    return (
      <div className={classes}>
        {content}
      </div>
    );
  }

});

module.exports = MoreBlock;
