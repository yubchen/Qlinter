/**
 * @fileoverview 属性访问中的.两边不能有空格
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {


    return {
        "MemberExpression": function (node) {

            var token = context.getTokenAfter(node.object);

            if (token.value !== '.') {
                return;
            }

            var after = context.getTokenAfter(token);
            var before = context.getTokenBefore(token);

            if (before.loc.start.line === token.loc.start.line && before.range[1] !== token.range[0]) {
                context.report(node, {
                    line: token.loc.start.line,
                    column: token.loc.start.column
                }, ".左侧不能有空格。");
            }

            if (token.loc.start.line === after.loc.start.line && token.range[1] !== after.range[0]) {
                context.report(node, {
                    line: token.loc.start.line,
                    column: token.loc.start.column
                }, ".右侧不能有空格。");
            }
        }
    };

};
