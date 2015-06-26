/**
 * @fileoverview 关键词后需要一个空格规则
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    // unless the first option is `"never"`, then a space is required
    var requiresSpace = context.options[0] !== "never";

    /**
     * Check if the separation of two adjacent tokens meets the spacing rules, and report a problem if not.
     *
     * @param {ASTNode} node  The node to which the potential problem belongs.
     * @param {Token} left    The first token.
     * @param {Token} right   The second token
     * @returns {void}
     */
    function checkTokens(node, left, right) {

        var value = left.value;
        var leftLine = left.loc.end.line;
        var leftColumn = left.loc.end.column;
        var rightLine = right.loc.start.line;
        var rightColumn = right.loc.start.column;

        var gap = lines[leftLine - 1].charAt(leftColumn);

        if (leftLine !== rightLine || (rightColumn - leftColumn) !== 1 || gap !== ' ') {
            context.report(node, {
                line: left.loc.start.line,
                column: left.loc.start.column
            }, '关键字 {{value}} 后必须有且只能有一个空格。', {
                value: value
            });
        }
    }

    /**
     * Check if the given node (`if`, `for`, `while`, etc), has the correct spacing after it.
     * @param {ASTNode} node The node to check.
     * @returns {void}
     */
    function check(node) {
        var tokens = context.getFirstTokens(node, 2);
        checkTokens(node, tokens[0], tokens[1]);
    }

    function continueAndBreak(node) {

        var token  = context.getFirstToken(node);
        var nextToken = context.getTokenAfter(token);

        if (nextToken.type !== 'Identifier') {
            return;
        }

        checkTokens(node, token, nextToken);
    }

    var lines = null;

    return {
        "Program": function () {
            lines = context.getSourceLines();
        },
        "IfStatement": function (node) {
            check(node);
            // check the `else`
            if (node.alternate && node.alternate.type !== "IfStatement") {
                checkTokens(node.alternate, context.getTokenBefore(node.alternate), context.getFirstToken(node.alternate));
            }
        },
        "ForStatement": check,
        "ForOfStatement": check,
        "ForInStatement": check,
        "WhileStatement": check,
        "DoWhileStatement": function (node) {
            check(node);
            // check the `while`
            var whileTokens = context.getTokensBefore(node.test, 2);
            checkTokens(node, whileTokens[0], whileTokens[1]);
        },
        "SwitchStatement": check,
        "TryStatement": function (node) {
            check(node);
            // check the `finally`
            if (node.finalizer) {
                checkTokens(node.finalizer, context.getTokenBefore(node.finalizer), context.getFirstToken(node.finalizer));
            }
        },
        "CatchStatement": check,
        "WithStatement": check,
        "ReturnStatement": function(node) {

            var returnToken = context.getFirstToken(node);
            var nextToken = context.getTokenAfter(returnToken);

            if (nextToken.value === ';' || nextToken.value === '}') {
                return;
            }

            checkTokens(node, returnToken, nextToken);

        },
        "ContinueStatement": continueAndBreak,
        "BreakStatement": continueAndBreak
    };
};
