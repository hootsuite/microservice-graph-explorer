'use strict';

module.exports = function(context) {

  return {
    VariableDeclaration: function (node) {
      if (node.kind === 'let') {
        context.report(node, 'Unexpected let, use var instead.');
      }
    }
  };

};
