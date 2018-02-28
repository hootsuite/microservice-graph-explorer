'use strict';

/* Styles Dependencies */
require('./dependency-list.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import Dependency from './dependency.jsx'

var DependencyList = React.createClass({
  displayName: 'DependencyList',

  propTypes: {
    key: React.PropTypes.string,
  },

  getInitialState: function() {
    return {  };
  },

  render() {

    var key = this.props.key;
    var titleKey = key + "-title";
    var noneKey = key + "-none";
    var name = this.props.name;

    var items = [];
    if (this.props.dependencies.length > 0) {
      this.props.dependencies.forEach(function (dependency) {
        items.push(<Dependency name={dependency.name} isTraversable={dependency.isTraversable}
                               statusDuration={dependency.statusDuration} statusPath={dependency.statusPath}
                               status={dependency.status} key={dependency.name} router={this.props.router}/>);
      }.bind(this));
    } else {
      items.push(<li key={noneKey} className="none">None</li>)
    }

    return (
      <ul className="dependencyList" key={key}>
        <h2 className="title" key={titleKey}>
          {name}
        </h2>
        {items}
        {this.props.children}
      </ul>
    );
  }

});

module.exports = DependencyList;
