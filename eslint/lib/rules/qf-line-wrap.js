/**
 * @fileoverview 折行位置检测
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    var MESSAGE = {
        "BinaryExpression": '在二元操作符处折行时操作符必须留在行尾。',
        "ConditionalExpression": '在三元操作符处折行时操作符?或:必须留在行尾。',
        "MemberExpression": '在属性访问处折行时.需要写在行首。',
        "FunctionDeclaration": '在函数形参处折行时, ,必须留在行尾。',
        "FunctionExpression": '在函数形参处折行时, ,必须留在行尾。',
        "CallExpression": '在函数参数处折行时, ,必须留在行尾。',
        "ArrayExpression": '在数组元素处折行时， ,必须留在行尾。'
    };

    var lines = null;

    function checkLineWrap (node, tokens, operator) {

        var regStr = node.type === 'MemberExpression' ?
            '\\' + operator + '(\\t| )*$' : '[^\\' + operator + '](\\t| )*$';

        var reg = new RegExp(regStr);

        var firstLine = tokens[0].loc.start.line;
        var lastLine = tokens[tokens.length - 1].loc.start.line;

        var record = {};

        tokens.forEach(function(token, index) {

            var currentLine = token.loc.start.line;

            if (!record[currentLine] && currentLine !== lastLine) {

                record[currentLine] = 1;

                if (reg.test(lines[currentLine - 1])) {
                    context.report(node, {
                        line: token.loc.start.line,
                        column: 0
                    }, MESSAGE[node.type]);
                }
            }
        });
    }

    function checkFunctionLineWrap(node) {

        var params = node.params;
        if (params.length <= 1) {
            return;
        }

        var tokens = context.getTokensBetween(params[0], params[params.length - 1], 1);

        checkLineWrap(node, tokens, ',');
    }

    function checkEachTowElements(node, arr) {

        if (arr.length <= 1) {
            return;
        }

        arr.forEach(function(item, index) {

            if (index === 0) {
                return;
            }

            var tokens = context.getTokensBetween(arr[index - 1], item, 1);

            checkLineWrap(node, tokens, ',');
        });

    }

    return {
        "Program": function(node) {
            lines = context.getSourceLines();
        },
        "BinaryExpression": function(node) {

            var tokens = context.getTokensBetween(node.left, node.right, 1);

            checkLineWrap(node, tokens, node.operator);
        },
        "ConditionalExpression": function(node) {

            var test = node.test;
            var consequent = node.consequent;
            var alternate = node.alternate;

            var tokens = context.getTokensBetween(test, consequent, 1);

            checkLineWrap(node, tokens, '?');

            tokens = context.getTokensBetween(consequent, alternate, 1);

            checkLineWrap(node, tokens, ':');
        },
        "MemberExpression": function(node) {

            if (node.property.type !== 'Identifier') {
                return;
            }

            var tokens = context.getTokensBetween(node.object, node.property, 1);

            checkLineWrap(node, tokens, '.');
        },
        "FunctionDeclaration": checkFunctionLineWrap,
        "FunctionExpression": checkFunctionLineWrap,
        "CallExpression": function(node) {
            checkEachTowElements(node, node.arguments);
        },
        "ArrayExpression": function(node) {
            checkEachTowElements(node, node.elements);
        }
    };
};
