'use strict';

/* Styles Dependencies */
require('./transition-to-input-text-box.less');

/* Script Dependencies */
import React from 'react';
import classNames from 'classnames';

var TransitionToInputTextBox = React.createClass({
  displayName: 'TransitionToInputTextBox',

  propTypes: {
    id: React.PropTypes.string.isRequired,
    onTransition: React.PropTypes.func.isRequired,
    placeholder: React.PropTypes.string.isRequired
  },

  handleKeyPress: function(e) {
    if (e.which == 13) {
      this.props.onTransition('/status/https/' + e.currentTarget.value);
    }
  },

  render: function() {

    var classes = classNames(this.props.className, {
      'textBlock': true
    });

    var placeholder = this.props.placeholder;

    return (
      <input type="text" key={this.props.id} placeholder={placeholder} onKeyPress={this.handleKeyPress} />
    );
  }

});

module.exports = TransitionToInputTextBox;
