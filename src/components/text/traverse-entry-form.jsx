'use strict';

/* Styles Dependencies */
require('./traverse-entry-form.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var TraverseEntryForm = React.createClass({
  displayName: 'TraverseEntryForm',

  getInitialState: function() {
    return {
      port: localStorage.getItem("port") ? localStorage.getItem("port") : "443",
      protocol: localStorage.getItem("protocol") ? localStorage.getItem("protocol") : "https",
      domain: localStorage.getItem("domain") ? localStorage.getItem("domain") : ""
    };
  },

  propTypes: {
    id: React.PropTypes.string.isRequired,
    onTransition: React.PropTypes.func.isRequired
  },

  handleDomainChange:function(e) {
    this.setState({
      "domain": e.currentTarget.value.trim()
    });
  },

  handlePortChange:function(e) {
    this.setState({
      "port": e.currentTarget.value.trim()
    });
  },

  handleProtocolChange:function(e) {
    var protocol = e.currentTarget.value;
    var port = this.state.port;

    switch(protocol) {
      case "http":
        port = "80";
        break;
      case "https":
        port = "443";
        break;
    }

    this.setState({
      "protocol": protocol,
      "port": port
    });
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var port = this.state.port;
    var domain = this.state.domain;
    var protocol = this.state.protocol;
    if (!port || !domain) {
      return;
    }

    var domainPort = domain + ':' + port;

    if ((protocol === "http" && port === "80") ||
         (protocol === "https" && port === "443")) {
      domainPort = domain;
    }

    localStorage.setItem("port", port);
    localStorage.setItem("protocol", protocol);
    localStorage.setItem("domain", domain);

    this.props.onTransition('/status/' + protocol +'/' + domainPort);
  },

  render: function() {
    return (
    <form className="entryForm" onSubmit={this.handleSubmit}>
      <select className="protocol" onChange={this.handleProtocolChange} value={this.state.protocol}>
        <option value="http">http</option>
        <option value="https">https</option>
      </select>
      <input className="domain" onChange={this.handleDomainChange} placeholder="domain or hostname..." type="text" value={this.state.domain} />
      <input className="port" onChange={this.handlePortChange} placeholder="port" type="text" value={this.state.port} />
      <input className="submit" type="submit" value="Go" />
    </form>
    );
  }

});

module.exports = TraverseEntryForm;
