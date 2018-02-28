'use strict';

function SocketService() {
  var service = {};
  service.connected = false;

  var currentMessageId = 0;
  var ws;
  var preConnectionRequests = [];
  var messageHandler, connectedChangeHandler;

  function init() {
    currentMessageId = 0;
    preConnectionRequests = [];

    // console.log('Connecting to websocket');
    ws = new WebSocket('ws://' + window.location.hostname + (location.port ? ':' + location.port : '') + '/socket');

    ws.onopen = function () {
      service.connected = true;

      if (connectedChangeHandler) {
        connectedChangeHandler(ws.readyState);
      }

      if (preConnectionRequests.length === 0) return;

      // console.log('Sending (%d) requests', preConnectionRequests.length);
      for (var i = 0, c = preConnectionRequests.length; i < c; i++) {
        ws.send(JSON.stringify(preConnectionRequests[i]));
      }
      preConnectionRequests = [];
    };
    ws.onclose = function() {
      service.connected = false;
      if (connectedChangeHandler) {
        connectedChangeHandler(ws.readyState);
      }
    };
    ws.onmessage = function (message) {
      if (messageHandler) {
        messageHandler(JSON.parse(message.data));
      } else {
        console.log('No message handler configured in SocketService');
      }
    };

    window.onbeforeunload = function() {
      console.log("window.onbeforeunload");
      ws.onclose = function () {}; // disable onclose handler first
      ws.close();
    };
  }
  init();

  service.disconnect = function() {
    ws.close();
  };

  service.connect = function() {
    init();
  };

  service.sendRequest = function(request) {
    // websocket closing / closed, reconnect
    if(ws && ~[2,3].indexOf(ws.readyState)) {
      service.connected = false;
      init();
    }

    if (!service.connected) {
      // console.log('Not connected yet, saving request', request);
      preConnectionRequests.push(request);
    } else {
      // console.log('Sending request', request);
      ws.send(JSON.stringify(request));
    }
    return request.$id;
  };

  service.setMessageHandler = function(l) {
    messageHandler = l;
  };

  service.setConnectedChangeHandler = function(d) {
    connectedChangeHandler = d;
  };

  return service;
};

window.SocketService = new SocketService();
