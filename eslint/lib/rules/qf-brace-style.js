/**
 * {}写法规则  转自eslint
 * @fileoverview Rule to flag block statements that do not use the one true brace style
 * @author Ian Christian Myers
 */

"use strict";

module.exports = function(context) {
    var style = context.options[0] || "1tbs";
    var params = context.options[1] || {};

    var OPEN_MESSAGE = " { 必须与所属语句在同一行。",
        BODY_MESSAGE = " { } 中的语句不能与 { 和 } 同一行。",
        CLOSE_MESSAGE = " } 必须与随后的语句在同一行。",
        CLOSE_MESSAGE_SINGLE = "Closing curly brace should be on the same line as opening curly brace or on the line after the previous block.",
        CLOSE_MESSAGE_STROUSTRUP = "Closing curly brace appears on the same line as the subsequent block.";

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Determines if a given node is a block statement.
     * @param {ASTNode} node The node to check.
     * @returns {boolean} True if the node is a block statement, false if not.
     * @private
     */
    function isBlock(node) {
        return node && node.type === "BlockStatement";
    }


    /**
     * Binds a list of properties to a function that verifies that the opening
     * curly brace is on the same line as its controlling statement of a given
     * node.
     * @param {...string} The properties to check on the node.
     * @returns {Function} A function that will perform the check on a node
     * @private
     */
    function checkBlock() {
        var blockProperties = arguments;

        return function(node) {
            [].forEach.call(blockProperties, function(blockProp) {
                var block = node[blockProp], previousToken, curlyToken, curlyTokenEnd, curlyTokensOnSameLine;
                block = node[blockProp];

                if (isBlock(block)) {

                    previousToken = context.getTokenBefore(block);
                    curlyToken = context.getFirstToken(block);
                    curlyTokenEnd = context.getLastToken(block);
                    curlyTokensOnSameLine = curlyToken.loc.start.line === curlyTokenEnd.loc.start.line;

                    if (previousToken.loc.start.line !== curlyToken.loc.start.line) {
                        //{的前一个token 与 { 不在一行 报错
                        context.report(node, {
                            line: curlyToken.loc.start.line,
                            column: curlyToken.loc.start.column
                        }, OPEN_MESSAGE);
                    } else if (block.body.length && params.allowSingleLine) {

                        if (curlyToken.loc.start.line === block.body[0].loc.start.line && !curlyTokensOnSameLine) {
                            context.report(block.body[0], BODY_MESSAGE);
                        } else if (curlyTokenEnd.loc.start.line === block.body[block.body.length - 1].loc.start.line && !curlyTokensOnSameLine) {
                            context.report(block.body[block.body.length - 1], CLOSE_MESSAGE_SINGLE);
                        }

                    } else if (block.body.length && curlyToken.loc.start.line === block.body[0].loc.start.line) {
                        //{ 与 block中第一个语句不能在一行
                        context.report(block.body[0], {
                            line: curlyToken.loc.start.line,
                            column: curlyToken.loc.start.column
                        }, BODY_MESSAGE);
                    } else if (block.body.length &&
                        curlyTokenEnd.loc.start.line === block.body[block.body.length - 1].loc.start.line) {
                        //} 与 block中最后一个语句不能在一行
                        context.report(block.body[0], {
                            line: curlyTokenEnd.loc.start.line,
                            column: curlyTokenEnd.loc.start.column
                        }, BODY_MESSAGE);
                    }
                }
            });
        };
    }

    /**
     * Enforces the configured brace style on IfStatements
     * @param {ASTNode} node An IfStatement node.
     * @returns {void}
     * @private
     */
    function checkIfStatement(node) {
        var tokens,
            alternateIsBlock = false,
            alternateIsIfBlock = false;

        checkBlock("consequent", "alternate")(node);

        if (node.alternate) {

            alternateIsBlock = isBlock(node.alternate);
            alternateIsIfBlock = node.alternate.type === "IfStatement" && isBlock(node.alternate.consequent);

            if (alternateIsBlock || alternateIsIfBlock) {
                tokens = context.getTokensBefore(node.alternate, 2);

                if (style === "1tbs") {
                    if (tokens[0].loc.start.line !== tokens[1].loc.start.line) {
                        context.report(node.alternate, {
                            line: tokens[0].loc.start.line,
                            column: tokens[0].loc.start.column
                        }, CLOSE_MESSAGE);
                    }
                } else if (style === "stroustrup") {
                    if (tokens[0].loc.start.line === tokens[1].loc.start.line) {
                        context.report(node.alternate, CLOSE_MESSAGE_STROUSTRUP);
                    }
                }
            }

        }
    }

    /**
     * Enforces the configured brace style on TryStatements
     * @param {ASTNode} node A TryStatement node.
     * @returns {void}
     * @private
     */
    function checkTryStatement(node) {
        var tokens;

        checkBlock("block", "finalizer")(node);

        if (isBlock(node.finalizer)) {
            tokens = context.getTokensBefore(node.finalizer, 2);
            if (style === "1tbs") {
                if (tokens[0].loc.start.line !== tokens[1].loc.start.line) {
                    context.report(node.finalizer, {
                        line: tokens[0].loc.start.line,
                        column: tokens[0].loc.start.column
                    }, CLOSE_MESSAGE);
                }
            } else if (style === "stroustrup") {
                if (tokens[0].loc.start.line === tokens[1].loc.start.line) {
                    context.report(node.finalizer, CLOSE_MESSAGE_STROUSTRUP);
                }
            }
        }
    }

    /**
     * Enforces the configured brace style on CatchClauses
     * @param {ASTNode} node A CatchClause node.
     * @returns {void}
     * @private
     */
    function checkCatchClause(node) {
        var previousToken = context.getTokenBefore(node),
            firstToken = context.getFirstToken(node);

        checkBlock("body")(node);

        if (isBlock(node.body)) {
            if (style === "1tbs") {
                if (previousToken.loc.start.line !== firstToken.loc.start.line) {
                    context.report(node, {
                        line: previousToken.loc.start.line,
                        column: previousToken.loc.start.column
                    }, CLOSE_MESSAGE);
                }
            } else if (style === "stroustrup") {
                if (previousToken.loc.start.line === firstToken.loc.start.line) {
                    context.report(node, CLOSE_MESSAGE_STROUSTRUP);
                }
            }
        }
    }

    /**
     * Enforces the configured brace style on SwitchStatements
     * @param {ASTNode} node A SwitchStatement node.
     * @returns {void}
     * @private
     */
    function checkSwitchStatement(node) {
        var tokens;
        if (node.cases && node.cases.length) {
            tokens = context.getTokensBefore(node.cases[0], 2);
            if (tokens[0].loc.start.line !== tokens[1].loc.start.line) {
                context.report(node, OPEN_MESSAGE);
            }
        } else {
            tokens = context.getLastTokens(node, 3);
            if (tokens[0].loc.start.line !== tokens[1].loc.start.line) {
                context.report(node, OPEN_MESSAGE);
            }
        }
    }

    //--------------------------------------------------------------------------
    // Public API
    //--------------------------------------------------------------------------

    return {
        "FunctionDeclaration": checkBlock("body"),
        "FunctionExpression": checkBlock("body"),
        "ArrowFunctionExpression": checkBlock("body"),
        "IfStatement": checkIfStatement,
        "TryStatement": checkTryStatement,
        "DoWhileStatement": checkBlock("body"),
        "WhileStatement": checkBlock("body"),
        "WithStatement": checkBlock("body"),
        "ForStatement": checkBlock("body"),
        "ForInStatement": checkBlock("body"),
        "ForOfStatement": checkBlock("body"),
        "SwitchStatement": checkSwitchStatement
    };

};
