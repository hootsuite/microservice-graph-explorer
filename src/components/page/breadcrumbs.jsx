'use strict';

/* Styles Dependencies */
require('./breadcrumbs.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import Breadcrumb from './breadcrumb';

var Breadcrumbs = React.createClass({
  displayName: 'Breadcrumbs',

  propTypes: {
    path: React.PropTypes.string,
    protocol: React.PropTypes.string.isRequired,
    host: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {  };
  },

  render() {

    var protocol = this.props.protocol;
    var host = this.props.host;
    var traversePath = this.props.path ? this.props.path.split(",") : [];
    var url = "/status/" + protocol + "/" + host;

    var breadCrumbsItems = [];
    breadCrumbsItems.push(<Breadcrumb key="home" text="home" showSeparator={false} clickLocation="/home" router={this.props.router} isClickable={true} />);

    var isHomeClickable = traversePath.length > 0;
    breadCrumbsItems.push(<Breadcrumb key="app-home" text={host} showSeparator={true} clickLocation={url} router={this.props.router} isClickable={isHomeClickable} />);

    var isClickable = true
    url = url + "/traverse/";
    var itemCount = 1;
    traversePath.forEach(function (path) {

      if (itemCount == 1) {
        url = url + path;
      } else {
        url = url + "," + path;
      }

      if (traversePath.length == itemCount){
        isClickable = false;
      }

      breadCrumbsItems.push(<Breadcrumb key={path} text={path} showSeparator={true} clickLocation={url} router={this.props.router} isClickable={isClickable} />);

      itemCount++;
    }.bind(this));

    return (<div className="breadcrumbs">{breadCrumbsItems}</div>)
  }
});

module.exports = Breadcrumbs;
