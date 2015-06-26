/**
 * 二元操作符两边要有一个或多个空格或换行 转自eslint
 * @fileoverview Require spaces around infix operators
 * @author Michael Ficarra
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {
    var int32Hint = context.options[0] ? context.options[0].int32Hint === true : false;

    var OPERATORS = [
        "*", "/", "%", "+", "-", "<<", ">>", ">>>", "<", "<=", ">", ">=", "in",
        "instanceof", "==", "!=", "===", "!==", "&", "^", "|", "&&", "||", "=",
        "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|=",
        "?", ":", ","
    ];

    function isSpaced(left, right) {
        var op, tokens = context.getTokensBetween(left, right, 1);
        for (var i = 1, l = tokens.length - 1; i < l; ++i) {
            op = tokens[i];
            if (
                op.type === "Punctuator" &&
                OPERATORS.indexOf(op.value) >= 0 &&
                (tokens[i - 1].range[1] >= op.range[0] || op.range[1] >= tokens[i + 1].range[0])
            ) {
                return false;
            }
        }
        return true;
    }

    function report(node, errPos) {
        context.report(node, errPos, "操作符两侧必须要有且只能有一个空格。");
    }

    function checkBinary(node) {
        if (!isSpaced(node.left, node.right)) {
            if (!(int32Hint && context.getSource(node).substr(-2) === "|0")) {
                report(node, getErrPos(node, node.operator, context.getTokensBetween(node.left, node.right)));
            }
        }
    }

    function getErrPos(node, operator, tokens) {

        var res = null;

        tokens.forEach(function(token) {

            if (token.value === operator) {
                res = {
                    line: token.loc.start.line,
                    column: token.loc.start.column
                };
            }
        });

        return res || {
            line: node.loc.start.line,
            column: node.loc.start.column
        };
    }



    function checkConditional(node) {
        if (!isSpaced(node.test, node.consequent)) {
            report(node, getErrPos(node, '?', context.getTokensBetween(node.test, node.consequent)));
        }

        if (!isSpaced(node.consequent, node.alternate)) {
            report(node, getErrPos(node, ':', context.getTokensBetween(node.consequent, node.alternate)));
        }
    }

    function checkVar(node) {
        if (node.init && !isSpaced(node.id, node.init)) {
            report(node, getErrPos(node, '=', context.getTokensBetween(node.id, node.init)));
        }
    }

    return {
        "AssignmentExpression": checkBinary,
        "BinaryExpression": checkBinary,
        "LogicalExpression": checkBinary,
        "ConditionalExpression": checkConditional,
        "VariableDeclarator": checkVar
    };

};
