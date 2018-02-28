'use strict';

/* Styles Dependencies */
require('./application-status-indicator.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import $ from 'jquery';
import SS from '../../services/socket-service.js';

import applicationStatusHelpers from '../../utils/application-status-helpers';

var WidgetApplicationStatusIndicator = React.createClass({
  displayName: 'WidgetApplicationStatusIndicator',

  propTypes: {
    key: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      isSocketConnected: SocketService.connected,
      isSocketAttemptingToConnect: false,
      socketReconnectInterval: null
    };
  },

  componentDidMount: function () {
    this.initializeWebsocket(false);
  },

  initializeWebsocket: function() {
    SocketService.setMessageHandler(this.onWebsocketMessage);
    SocketService.setConnectedChangeHandler(this.onWebsocketConnectedChange)
    this.sendState(false);
  },

  sendState: function(forceRefresh) {
    SocketService.sendRequest({
      protocol: this.props.params.protocol,
      host: this.props.params.host,
      forceRefresh: forceRefresh
    });
  },

  reconnectWebsocket: function() {
    SocketService.connect();
    // make sure it set the state of the websocket again
    // so that we start getting messages again for the new
    // socket
    this.initializeWebsocket(false);
  },

  onWebsocketConnectedChange: function(connected) {
    this.setState({
      isSocketConnected: connected === WebSocket.OPEN
    });

    if (connected === WebSocket.CLOSED && !this.state.isSocketAttemptingToConnect) {

      var interval = window.setInterval(function() {
        this.reconnectWebsocket();
      }.bind(this), 10000);

      this.setState({
        isSocketAttemptingToConnect: true,
        socketReconnectInterval: interval
      });

    } else if (this.state.isSocketConnected) {
      if (this.state.socketReconnectInterval != null) {
        window.clearInterval(this.state.socketReconnectInterval);
      }

      this.setState({
        isSocketAttemptingToConnect: false,
        socketReconnectInterval: null
      });
    }
  },

  onWebsocketMessage: function(message) {
    // console.log("message received");
    // console.log(message);

    // Make sure the message we received is for this page
    var messageState = message.state;
    if (messageState.protocol == this.props.params.protocol &&
        messageState.host == this.props.params.host) {

      switch (message.responseType) {
        case "status":
          var status = message.payload;
          this.setState({
            status: status,
            isLoading: false,
            error: applicationStatusHelpers.isError(status)
          });
          break;
      }
    }
  },

  handleClick: function() {
    window.open("/#/status/" + this.props.params.protocol + "/" + this.props.params.host);
  },

  render() {
    var key = this.props.key;
    var isCrit = this.state.error, isOk = false, isWarn = false;

    if (!this.state.status || !this.state.isSocketConnected) {
      return (<span onClick={this.handleClick}>...</span>);
    }

    if (this.state.status.dependencies) {
      this.state.status.dependencies.forEach(function (dependency) {
        var s = dependency.status[0];
        switch (s) {
          case "OK":
            isOk = true;
            break;
          case "WARN":
            isWarn = true;
            break;
          case "CRIT":
            isCrit = true;
            break;
        }
      }.bind(this));
    }

    var classes = classNames(this.props.className, {
      "applicationStatus": true,
      "widget": true,
      "ok": isOk && !isWarn && !isCrit,
      "warn": isWarn && !isCrit,
      "crit": isCrit
    });

    return (
      <div key={key} className={classes} onClick={this.handleClick}></div>
    );
  },

});

module.exports = WidgetApplicationStatusIndicator;
