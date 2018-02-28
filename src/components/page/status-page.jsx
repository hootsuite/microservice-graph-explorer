'use strict';

/* Styles Dependencies */
require('./status-page.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import ApplicationStatus from '../status/application-status.jsx'
import Page from './page';
import Breadcrumbs from './breadcrumbs';
import HistoryList from '../status/history-list.jsx';
import Toast from '../text/toast.jsx';
import SS from '../../services/socket-service.js';

import applicationStatusHelpers from '../../utils/application-status-helpers';

var StatusPage = React.createClass({
  displayName: 'StatusPage',

  maxHistoryToShow: 100,

  propTypes: {
    isRootPage: React.PropTypes.bool,
    key: React.PropTypes.string,
    router: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      windowWidth: window.innerWidth,
      isLoading: true,
      isError: false,
      isSocketConnected: SocketService.connected,
      isSocketAttemptingToConnect: false,
      errorMessage: '',
      history: []
    };
  },

  handleResize: function(e) {
    this.setState({
      windowWidth: window.innerWidth
    });
  },

  componentDidMount: function () {
    window.addEventListener('resize', this.handleResize);
    this.initializeWebsocket(false);
  },

  initializeWebsocket: function(forceRefresh) {
    SocketService.setMessageHandler(this.onWebsocketMessage);
    SocketService.setConnectedChangeHandler(this.onWebsocketConnectedChange)
    this.sendState(forceRefresh);
  },

  onWebsocketConnectedChange: function(connected) {
    this.setState({
      isSocketConnected: connected === WebSocket.OPEN,
      isSocketAttemptingToConnect: false
    });
  },

  onWebsocketMessage: function(message) {
    // console.log("message received");
    // console.log(message);

    // Make sure the message we received is for this page
    var messageState = message.state;
    if (messageState.protocol == this.props.params.protocol &&
        messageState.host == this.props.params.host &&
        messageState.dependencies == this.props.params.path) {

      switch (message.responseType) {
        case "loading":
          this.setState({
            isLoading: true
          });
          break;
        case "status":
          var status = message.payload;
          var newHistory = this.state.history;
          var itemFound = false;
          var errorMessage = '';

          var isError = applicationStatusHelpers.isError(status);
          if (isError) {
             errorMessage = applicationStatusHelpers.getErrorMessage(status);
          }

          this.state.history.map(function (item) {
            if (item.timestamp == status.timestamp) {
              itemFound = true;
              // console.log("duplicate found");
            }
          });

          if (!itemFound) {
            newHistory.push(status);

            if (newHistory.length > this.maxHistoryToShow) {
              newHistory = newHistory.slice(newHistory.length - this.maxHistoryToShow);
            }
          }

          // let the UI show loading...
          setTimeout(function() {
            this.setState({
              status: status,
              history: newHistory,
              isLoading: false,
              isError: isError,
              errorMessage: errorMessage
            });
          }.bind(this), 1000);

          break;
        case "history":
          if (this.state.history.length > 0 && message.payload.length > 0) {
            // reset history when we have some so
            // we get a clean slate on the front end.
            this.setState({
              history: []
            });
          }

          this.setState({
            history: message.payload
          });
          break;
      }
    }
  },

  connectWebsocketClick: function() {
    if ('onLine' in navigator && navigator.onLine === false) {
      alert('It looks like you aren\'t connected to the internet, double check your connection and try again.');
      return;
    }

    this.setState({
      isSocketAttemptingToConnect: true
    });

    // Add the call to actually connect to the server in a timeout
    // so that the UI has time to render the "connecting" message...
    setTimeout(function() {
      SocketService.connect();
      // make sure it set the state of the websocket again
      // so that we start getting messages again for the new
      // socket
      this.initializeWebsocket(false);
    }.bind(this), 1000);
  },

  sendState: function(forceRefresh) {
    SocketService.sendRequest({
      protocol: this.props.params.protocol,
      host: this.props.params.host,
      dependencies: this.props.params.path,
      forceRefresh: forceRefresh
    });
  },

  forceRefresh: function() {
    this.setState({
      isLoading: true
    });
    this.sendState(true);
  },

  sliceHistory: function(historyItemCount) {
   return this.state.history.slice(Math.max(this.state.history.length - historyItemCount, 1));
  },

  render() {

    var key = this.props.params.protocol + "-" + this.props.params.host + "-" + this.props.params.path;
    var pageKey = key + "-page";
    var appStatusKey = key + "-app-status";
    var protocol = this.props.params.protocol;
    var host = this.props.params.host;
    var url = protocol + "://" + host;
    var warningText = "Server disconnected - click to reconnect...";
    var warningClass = "crit";

    var refresh = "";
    if (!this.state.isLoading) {
      refresh = (<i className="fa fa-refresh" onClick={this.forceRefresh}></i>);
    }

    var historytoRender = this.state.history;
    if (this.state.windowWidth <= 320) {
      historytoRender = this.sliceHistory(16);
    } if (this.state.windowWidth <= 640) {
      historytoRender = this.sliceHistory(32);
    }

    var websocketConnectionWarning = "";
    if (!this.state.isSocketConnected) {
      if(this.state.isSocketAttemptingToConnect) {
        warningText = "Connecting...";
        warningClass = "warn";
      }
      websocketConnectionWarning = (
        <Toast className={warningClass} handleClick={this.connectWebsocketClick}>
          {warningText}
        </Toast>
      );
    }

    return (
      <Page className="statusPage" key={pageKey}>
        {websocketConnectionWarning}
        <HistoryList key="historyList" history={historytoRender} router={this.props.router} />
        <Breadcrumbs router={this.props.router} host={host} protocol={protocol} path={this.props.params.path} /> {refresh}
        {this.props.children}
        <ApplicationStatus key={appStatusKey} router={this.props.router} url={url} isLoading={this.state.isLoading} isError={this.state.isError} errorMessage={this.state.errorMessage} status={this.state.status} children={this.props.children} />
      </Page>
    );
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  }

});

module.exports = StatusPage;
