'use strict';

/* Styles Dependencies */
require('./home-page.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';
import $ from 'jquery';
import TransitionToComponent from '../../utils/transition-to-component';
import TransitionToInputTextBox from '../text/transition-to-input-text-box';
import TraverseEntryForm from '../text/traverse-entry-form';
import Page from './page';

var HomePage = React.createClass({
  displayName: 'HomePage',

  propTypes: {
    className: React.PropTypes.string.isRequired,
    isRootPage: React.PropTypes.bool.isRequired,
    router: React.PropTypes.object.isRequired,
    key: React.PropTypes.string,
  },

  getInitialState: function() {
    return {
      homeLinks: []
    };
  },

  componentDidMount: function() {
    $.get('/home-links', function (results) {
      this.setState({
        homeLinks: results
      });
    }.bind(this));
  },

  handleClick: function(protocol, domain) {
    this.props.router.transitionTo('/status/' + protocol + '/' + domain);
  },

  render() {
    var quickLinks = [];
    if (this.state.homeLinks.length > 0) {
      var links = [];
      quickLinks.push(<h3>Quick Links:</h3>);
      this.state.homeLinks.forEach(function (link) {
        links.push(<li className="link" onClick={this.handleClick.bind(this, link.protocol, link.url)}>{link.text}</li>);
      }.bind(this));
      quickLinks.push(<ul>{links}</ul>);
    }

    return (
      <Page className="homePage" isRootPage key="homePage">
        <div className="formContainer">
        <div className="logo"></div>
          <TransitionToComponent>
            <TraverseEntryForm id="entryForm" />
          </TransitionToComponent>
          {quickLinks}
        </div>
      </Page>
    );
  }

});

module.exports = HomePage;
