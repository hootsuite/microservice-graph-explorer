'use strict';

/* Styles Dependencies */
require('./dependency.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

import applicationStatusHelpers from '../../utils/application-status-helpers';

var Dependency = React.createClass({
  displayName: 'Dependency',

  propTypes: {
    key: React.PropTypes.string,
  },

  getInitialState: function() {
    return {  };
  },

  handleClick: function() {
    if (this.props.isTraversable) {
      var protocol = this.props.router.state.params.protocol;
      var host = this.props.router.state.params.host;
      var path = this.props.router.state.params.path ? this.props.router.state.params.path + "," + this.props.statusPath : this.props.statusPath;

      this.props.router.transitionTo("/status/" + protocol + "/" + host + "/traverse/" + path);
    }
  },

  render() {

    var classes = classNames(this.props.className, {
      'dependency': true,
      'ok': this.props.status[0] === "OK",
      'warn': this.props.status[0] === "WARN",
      'crit': this.props.status[0] === "CRIT",
      'traversable': this.props.isTraversable
    });
    var key = this.props.key;
    var error = "";
    var name = this.props.name;
    var statusDuration = this.props.statusDuration;

    if (applicationStatusHelpers.isError(this.props.status) || this.props.status[0] === "WARN"){
      error = applicationStatusHelpers.getErrorMessage(this.props.status)
    }

    var traversableIcon = "";
    if (this.props.isTraversable) {
      traversableIcon = <i className="fa fa-sitemap fa-2x"></i>
    }

    return (
      <li key={key} className={classes} onClick={this.handleClick}>
        <h3 className="name">{name}</h3> {traversableIcon}
        <div className="duration">{statusDuration}s</div>
        <div>{error}</div>
        {this.props.children}
      </li>
    );
  }

});

module.exports = Dependency;
