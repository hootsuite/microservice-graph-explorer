'use strict';

module.exports = function(context) {

  return {
    VariableDeclaration: function (node) {
      if (node.kind === 'const') {
        context.report(node, 'Unexpected const, use var instead.');
      }
    }
  };

};
