'use strict';

/* Styles Dependencies */
require('./app.less');

/* Script Dependencies */
import React from 'react';
import { cloneElement } from 'react/addons';
import classNames from 'classnames';
import injectRouterProp from '../../utils/inject-router-prop';

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var App = injectRouterProp(React.createClass({
  displayName: 'App',

  propTypes: {
    children: React.PropTypes.element.isRequired,
    location: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    this.nextTransitionName = 'zoom';
    return null;
  },

  // Determine if we should be going backwards or not
  routerWillLeave(nextState) {
    if (nextState.location.navigationType === 'POP') {
      this.nextTransitionName = 'zoom-out';
    } else {
      this.nextTransitionName = 'zoom';
    }
  },

  componentDidMount() {
    if (this.routerWillLeave) {
      this.props.router.addTransitionHook(this.routerWillLeave);
    }
  },

  componentWillUnmount() {
    if (this.routerWillLeave) {
      this.props.router.removeTransitionHook(this.routerWillLeave);
    }
  },

  render() {
    var key = this.props.location.pathname;
    var transitionName = this.nextTransitionName;
    var appClass = this.props.location.pathname.split("/")[1];
    var classes = classNames("app", appClass);
    var router = this.props.router;

    return (
      <div className={classes}>
        <ReactCSSTransitionGroup className="pages" transitionName={transitionName}>
                    {cloneElement(this.props.children || <div />, { key: key, router: router })}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}));

module.exports = App;
