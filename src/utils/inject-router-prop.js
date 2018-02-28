'use strict';

/* Styles Dependencies */

/* Script Dependencies */
import React from 'react';

var injectRouterProp = function (Component) {
  var ComponentWithRouter = React.createClass({
    displayName: 'ComponentWithRouter',

    contextTypes: {
      router: React.PropTypes.object.isRequired
    },

    render() {
      return <Component {...this.props} router={this.context.router} {...this.state} />;
    }
  });
  return ComponentWithRouter;
};

module.exports = injectRouterProp;
