'use strict';

/* Styles Dependencies */

/* Script Dependencies */
import React from 'react';
import { cloneElement } from 'react/addons';
import injectRouterProp from '../utils/inject-router-prop';

var TransitionToComponent = injectRouterProp(React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    router: React.PropTypes.object.isRequired
  },

  onTransition(path) {
    this.props.router.transitionTo(path);
  },

  render: function() {
    return (
      cloneElement(this.props.children, { onTransition: this.onTransition })
    );
  }
}));

module.exports = TransitionToComponent;
