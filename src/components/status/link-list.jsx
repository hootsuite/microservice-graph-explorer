'use strict';

/* Styles Dependencies */
require('./link-list.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';


var LinkList = React.createClass({
  displayName: 'LinkList',

  render() {
    var links = [];
    this.props.links.forEach(function (link) {
      links.push(<li><a href={link} target="_blank">{link}</a></li>);
    }.bind(this));

    return (
      <ul className="text">
        {links}
      </ul>);
  }

});

module.exports = LinkList;
