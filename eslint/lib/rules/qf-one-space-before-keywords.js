/**
 * @fileoverview 关键词前需要一个空格规则
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    // unless the first option is `"never"`, then a space is required
    var requiresSpace = context.options[0] !== "never";

    function checkTokens(node, left, right) {

        var value = right.value;
        var leftLine = left.loc.end.line;
        var leftColumn = left.loc.end.column;
        var rightLine = right.loc.start.line;
        var rightColumn = right.loc.start.column;

        var gap = lines[leftLine - 1].charAt(leftColumn);

        if (leftLine !== rightLine || (rightColumn - leftColumn) !== 1 || gap !== ' ') {
            context.report(node, {
                line: right.loc.start.line,
                column: right.loc.start.column
            }, "关键字 {{value}} 前{{des}}。", {
                value: value,
                des: requiresSpace ? "必须有且只能有一个空格" : "不能有空格"
            });
        }
    }

    var lines = null;

    return {
        "Program": function () {
            lines = context.getSourceLines();
        },
        "IfStatement": function (node) {
            if (node.alternate && node.alternate.type !== "IfStatement") {
                var tokens = context.getTokensBefore(node.alternate, 2);
                checkTokens(node.alternate, tokens[0], tokens[1]);
            }
        },
        "DoWhileStatement": function (node) {
            var tokens = context.getTokensBefore(node.test, 3);
            checkTokens(node, tokens[0], tokens[1]);
        },
        "TryStatement": function (node) {
            if (node.finalizer) {
                var tokens = context.getTokensBefore(node.finalizer, 2);
                checkTokens(node.finalizer, tokens[0], tokens[1]);
            }
        },
        "CatchClause": function (node) {
            var token = context.getTokenBefore(node);
            var catchToken = context.getFirstToken(node);
            checkTokens(node, token, catchToken);
        }
    };
};
