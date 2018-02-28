'use strict';

/* Styles Dependencies */
require('../styles/base.less');

/* Script Dependencies */
import React from 'react';
import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/HashHistory';
import WidgetApplicationStatusIndicator from './components/widget/application-status-indicator.jsx';

/** Configure Fastclick Start **/
import attachFastClick from 'fastclick';
/** Configure Fastclick End **/

/** ROUTING **/
var routes = (
  <Router history={history}>
      <Route name="widget-status" component={WidgetApplicationStatusIndicator} path="/status-indicator/:protocol/:host"/>
  </Router>
);

window.onload = function() {
  attachFastClick.attach(document.body);
  React.render(routes, document.body);
};
