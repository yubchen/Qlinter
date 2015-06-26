/**
 * 一元操作符空格规则  转自eslint
 *
 * @fileoverview This rule shoud require or disallow spaces before or after unary operations.
 * @author Marcin Kumorek
 * @copyright 2014 Marcin Kumorek. All rights reserved.
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {
    var options = context.options && Array.isArray(context.options) && context.options[0] || { words: true, nonwords: false };

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Check if the parent unary operator is "!" in order to know if it's "!!" convert to Boolean or just "!" negation
     * @param {ASTnode} node AST node
     * @returns {boolean} Whether or not the parent is unary "!" operator
     */
    function isParentUnaryBangExpression(node) {
        return node && node.parent && node.parent.type === "UnaryExpression" && node.parent.operator === "!";
    }

    /**
     * Checks if the type is a unary word expression
     * @param {string} type value of AST token
     * @returns {boolean} Whether the word is in the list of known words
     */
    function isWordExpression(type) {
        return ["delete", "new", "typeof", "void"].indexOf(type) !== -1;
    }

    /**
     * Check if the node's child argument is an "ObjectExpression"
     * @param {ASTnode} node AST node
     * @returns {boolean} Whether or not the argument's type is "ObjectExpression"
     */
    function isArgumentObjectExpression(node) {
        return node.argument && node.argument.type && node.argument.type === "ObjectExpression";
    }

    /**
     * Check Unary Word Operators for spaces after the word operator
     * @param {ASTnode} node AST node
     * @param {object} firstToken first token from the AST node
     * @param {object} secondToken second token from the AST node
     * @returns {void}
     */
    function checkUnaryWordOperatorForSpaces(node, firstToken, secondToken) {
        if (options.words) {
            //单词一元操作符 与 后边的操作数 没空格 报错
            if (secondToken.range[0] === firstToken.range[1]) {
                context.report(node, "单词一元操作符 " + firstToken.value + " 后必须有一个空格。");
            }
        }

        if (!options.words && isArgumentObjectExpression(node)) {
            /*
            如果是一元操作符后 跟的是一个ObjectExpression它俩之间有空格 报错
            eg:
            void {

            }
            */
            if (secondToken.range[0] > firstToken.range[1]) {
                context.report(node, "一元单词操作符 " + firstToken.value + " 后不能有空格。");
            }
        }
    }

    /**
     * Checks UnaryExpression, UpdateExpression and NewExpression for spaces before and after the operator
     * @param {ASTnode} node AST node
     * @returns {void}
     */
    function checkForSpaces(node) {

        var tokens = context.getFirstTokens(node, 2),
            firstToken = tokens[0],
            secondToken = tokens[1];

        if (isWordExpression(firstToken.value)) {
            checkUnaryWordOperatorForSpaces(node, firstToken, secondToken);
            return void 0;
        }

        if (options.nonwords) {
            //前缀一元操作符
            if (node.prefix) {
                if (isParentUnaryBangExpression(node)) {
                    return void 0;
                }
                if (firstToken.range[1] === secondToken.range[0]) {
                    context.report(node, {
                        line: firstToken.loc.start.line,
                        column: firstToken.loc.start.column
                    }, "一元操作符 " + firstToken.value + " 后必须有一个空格。");
                }
            } else {
                if (firstToken.range[1] === secondToken.range[0]) {
                    context.report(node, {
                        line: secondToken.loc.start.line,
                        column: secondToken.loc.start.column
                    }, "一元操作符 " + secondToken.value + " 前必须有一个空格。");
                }
            }
        } else {
            if (node.prefix) {
                if (secondToken.range[0] > firstToken.range[1]) {
                    context.report(node, {
                        line: firstToken.loc.start.line,
                        column: firstToken.loc.start.column
                    }, "一元操作符 " + firstToken.value + " 后不能有空格。");
                }
            } else {
                if (secondToken.range[0] > firstToken.range[1]) {
                    context.report(node, {
                        line: secondToken.loc.start.line,
                        column: secondToken.loc.start.column
                    }, "一元操作符 " + secondToken.value + " 前不能有空格。");
                }
            }
        }
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        "UnaryExpression": checkForSpaces,
        "UpdateExpression": checkForSpaces,
        "NewExpression": checkForSpaces
    };

};
