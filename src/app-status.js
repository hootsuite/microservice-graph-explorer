'use strict';

/* Styles Dependencies */
require('../styles/base.less');
require('../styles/utils/animations.less');

/* Script Dependencies */
import React from 'react';
import { Router, Route } from 'react-router';
import { history } from 'react-router/lib/HashHistory';
import App from './components/app/app.jsx';
import StatusPage from './components/page/status-page.jsx';
import HomePage from './components/page/home-page.jsx';
import WidgetApplicationStatusIndicator from './components/widget/application-status-indicator.jsx';

/** Configure Fastclick Start **/
import attachFastClick from 'fastclick';
/** Configure Fastclick End **/

/** ROUTING **/
var routes = (
    <Router history={history}>
        <Route component={App} path="/">
          <Route name="home" component={HomePage} path="/home"/>
          <Route name="status-page-path" component={StatusPage} path="/status/:protocol/:host/traverse/:path"/>
          <Route name="status-page" component={StatusPage} path="/status/:protocol/:host"/>
        </Route>
    </Router>
);

if (document.location.hash === '' || document.location.hash === '#/') {
  document.location.hash = '#/home';
}

window.onload = function() {
  attachFastClick.attach(document.body);
  React.render(routes, document.body);
};
