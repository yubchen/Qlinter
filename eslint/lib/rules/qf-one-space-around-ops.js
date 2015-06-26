/**
 * @fileoverview 操作符两边都需要一个空格规则
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

    function isSpaced(left, right, from) {

        var op, tokens = context.getTokensBetween(left, right, 1);

        for (var i = 1, l = tokens.length - 1; i < l; ++i) {
            op = tokens[i];
            if (op.type !== "Punctuator" || OPERATORS.indexOf(op.value) < 0) {
                continue;
            }
            var left = tokens[i - 1];
            var right = tokens[i + 1];

            var leftLine = left.loc.end.line;
            var leftColumn = left.loc.end.column;
            var rightLine = right.loc.start.line;
            var rightColumn = right.loc.start.column;
            var opStartLine = op.loc.start.line;
            var opStartColumn = op.loc.start.column;
            var opEndLine = op.loc.end.line;
            var opEndColumn = op.loc.end.column;

            var leftGap = lines[leftLine - 1].charAt(leftColumn);
            var rightGap = lines[rightLine - 1].charAt(opEndColumn);

            if (leftLine !== opStartLine || (opStartColumn - leftColumn) !== 1 || leftGap !== ' ' ||
                opEndLine !== rightLine || (rightColumn - opEndColumn) !== 1 || rightGap !== ' ') {
                return false;
            }
        }
        return true;
    }

    function report(node) {
        context.report(node, "操作符左右必须有一空格");
    }

    function checkBinary(node) {
       // console.log(node.left);
       // console.log(node.right);
        if (!isSpaced(node.left, node.right, 'Binary')) {
            if (!(int32Hint && context.getSource(node).substr(-2) === "|0")) {
                report(node);
            }
        }
    }

    function checkConditional(node) {
        if (!isSpaced(node.test, node.consequent) || !isSpaced(node.consequent, node.alternate)) {
            report(node);
        }
    }

    function checkVar(node) {
        if (node.init && !isSpaced(node.id, node.init)) {
            report(node);
        }
    }

    function checkAssignment(node) {
        // console.log(node.left);
        // console.log(node.right);
        if (!isSpaced(node.left, node.right, 'Assignment')) {
            if (!(int32Hint && context.getSource(node).substr(-2) === "|0")) {
                report(node);
            }
        }
    }

    function checkLogical(node) {
        // console.log(node.left);
        // console.log(node.right);
        if (!isSpaced(node.left, node.right, 'Logical')) {
            if (!(int32Hint && context.getSource(node).substr(-2) === "|0")) {
                report(node);
            }
        }
    }

    var lines = null;
    return {
        "Program": function () {
            lines = context.getSourceLines();
        },
        "AssignmentExpression": checkAssignment,
        "BinaryExpression": checkBinary,
        "LogicalExpression": checkLogical,
        "ConditionalExpression": checkConditional,
        "VariableDeclarator": checkVar
    };

};
