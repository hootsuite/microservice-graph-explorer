'use strict';

/* Styles Dependencies */
require('./application-status.less');

/* Script Dependencies */
import React from 'react';
import _ from 'underscore';
import classNames from 'classnames';
import DependencyList from './dependency-list.jsx'
import LinkList from './link-list.jsx'
import TextBlock from '../text/text-block.jsx'
import MoreBlock from '../text/more-block.jsx'

var ApplicationStatus = React.createClass({
  displayName: 'ApplicationStatus',

  propTypes: {
    className: React.PropTypes.string,
    key: React.PropTypes.string,
    router: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {  };
  },

  getFriendlyErrorMessage: function(message) {
    var friendlyMessage = message;
    switch (message) {
      case "Bad Vip response. HTTP Code: 404, Response: ''":
        friendlyMessage = "Service is not traversable. Please update this service to the use most recent version of VIP Server";
        break;
    }

    return friendlyMessage;
  },

  render() {

    var loadingComp = (<div className="loading">
                        <div className="loader"></div>
                      </div>);

    if (!this.props.status && this.props.isLoading) {
      return (<div key={key} className="applicationContainer">
                {loadingComp}
            </div>);
    }

    if (this.props.isError) {
      var firendlyError = this.getFriendlyErrorMessage(this.props.errorMessage);
      return (<div key={key} className="applicationContainer error">
              {firendlyError}
            </div>);
    }

    var isCrit = false, isOk = false, isWarn = false;
    var internalDependencies = [], internalDependenciesWARN = [], internalDependenciesCRIT = [];
    var serviceDependencies = [], serviceDependenciesWARN = [], serviceDependenciesCRIT = [];
    var sortedDependencies = _.sortBy(this.props.status.dependencies, function (i) { return i.name.toLowerCase(); });
    if (this.props.status.dependencies.length > 0) {
      sortedDependencies.forEach(function (dependency) {
        var status = dependency.status;
        var firstStatusItem;
        if (Array.isArray(status)) {
          firstStatusItem = status[0];
          switch (firstStatusItem) {
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
        } else {
          isCrit = true;
          firstStatusItem = "CRIT";
          dependency.status = [firstStatusItem, {
            "description": "Aggregate check '/status/aggregate' not returning a the correct response type",
            "result": firstStatusItem,
            "details": "No array response found. Check to make sure the service is working."
          }];
        }

        switch (dependency.type) {
          case "internal":
            switch (firstStatusItem) {
              case "CRIT":
                internalDependenciesCRIT.push(dependency);
                break;
              case "WARN":
                internalDependenciesWARN.push(dependency);
                break;
              default:
                internalDependencies.push(dependency);
                break;
            }
            break;
          default:
            switch (firstStatusItem) {
              case "CRIT":
                serviceDependenciesCRIT.push(dependency);
                break;
              case "WARN":
                serviceDependenciesWARN.push(dependency);
                break;
              default:
                serviceDependencies.push(dependency);
                break;
            }
            break;
        }
      }.bind(this));
    } else {
      isOk = true;
    }

    internalDependencies = internalDependenciesCRIT.concat(internalDependenciesWARN, internalDependencies)
    serviceDependencies = serviceDependenciesCRIT.concat(serviceDependenciesWARN, serviceDependencies)

    var classes = classNames({
      "application": true,
      "ok": isOk && !isWarn && !isCrit,
      "warn": isWarn && !isCrit,
      "crit": isCrit
    });

    var containerClasses = classNames(this.props.className, {
      "applicationContainer": true,
      "pure-g": true,
      "loadingBlink": this.props.isLoading
    });

    var key = this.props.key;

    var serviceId = ""
    if (this.props.status.id) {
      serviceId = (<div className="section">
                    <b>Id:</b><span className="text"> {this.props.status.id}</span>
                  </div>)
    }


    var httpUrl = "";
    if (this.props.status.httpUrl) {
      httpUrl = (<div className="section">
                  <b>URL:</b><span className="text"> {this.props.status.httpUrl}</span>
                </div>);
    }

    var brokers = "";
    if (this.props.status.brokers || (this.props.status.customData && this.props.status.customData.brokers)) {
      var brokerList = ""
      if (this.props.status.brokers) {
        brokerList = this.props.status.brokers.join(", ");
      } else if (this.props.status.customData && this.props.status.customData.brokers) {
        brokerList = this.props.status.customData.brokers.join(", ");
      }

      brokers = (<div className="section">
                  <b>Brokers:</b><span className="text"> {brokerList}</span>
                </div>);
    }

    var shouldShowMore = false;
    var docs = "";
    if (this.props.status.projectHome) {
      shouldShowMore = true;
      var docsArray = [];
      docsArray.push(this.props.status.projectHome);
      docs = (<div className="section">
                <b>Documentation</b><br />
                <LinkList links={docsArray} />
              </div>);
    }

    var code = "";
    if (this.props.status.projectRepo) {
      shouldShowMore = true;
      var codeArray = [];
      codeArray.push(this.props.status.projectRepo);
      code = (<div className="section">
                <b>Code</b><br />
                <LinkList links={codeArray} />
              </div>);
    }

    var logsLinks = "";
    if (this.props.status.logsLinks) {
      shouldShowMore = true;
      logsLinks = (<div className="section">
                    <b>Logs</b><br />
                    <LinkList links={this.props.status.logsLinks} />
                  </div>);
    }

    var statsLinks = "";
    if (this.props.status.statsLinks) {
      shouldShowMore = true;
      statsLinks = (<div className="section">
                      <b>Stats</b><br />
                      <LinkList links={this.props.status.statsLinks} />
                    </div>);
    }

    var statusDate = new Date(this.props.status.timestamp * 1000);

    var ownersText = "";
    if (Array.isArray(this.props.status.owners)) {
      ownersText = this.props.status.owners.join(", ");
    } else {
      ownersText = this.props.status.owners;
    }

    var more = "";
    if (shouldShowMore) {
      more = (<div className="section">
        <MoreBlock text={ownersText}>
          {docs}
          {code}
          {logsLinks}
          {statsLinks}
        </MoreBlock>
      </div>);
    }

    return (
      <div key={key} className={containerClasses}>
        <div className="pure-u-md-24-24 pure-u-1">
          <div className={classes}>
            <h1>{this.props.status.name}</h1>
            {serviceId}
            <div className="section">
              <b>Timestamp:</b><span className="text"> {statusDate.toString()}</span>
            </div>
            {httpUrl}
            <div className="section">
              <b>Host:</b><span className="text"> {this.props.status.host}</span>
            </div>
            {brokers}
            <div className="section">
              <b>Version:</b><span className="text"> {this.props.status.version}</span>
            </div>
            <div className="section">
              <b>Description</b><br />
              <span className="text">{this.props.status.description}</span>
            </div>
            <div className="section">
              <b>Owners</b><br />
              <span className="text"><TextBlock text={ownersText} /></span>
            </div>
            {more}
          </div>
        </div>
        <div className="pure-u-1 pure-u-md-1-24"></div>
        <div className="pure-u-1 pure-u-md-10-24">
          <DependencyList key={key} name="Internal Dependencies" dependencies={internalDependencies} router={this.props.router} />
        </div>
        <div className="pure-u-1 pure-u-md-2-24"></div>
        <div className="pure-u-1 pure-u-md-10-24">
          <DependencyList key={key} name="Service Dependencies" dependencies={serviceDependencies} router={this.props.router} />
        </div>
        <div className="pure-u-1 pure-u-md-1-24"></div>
        {this.props.children}
      </div>
    );
  }

});

module.exports = ApplicationStatus;
