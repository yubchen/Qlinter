/**
 * @紧贴规则
 * 1. 数组元素前后与[1, 2, ... ,3]紧贴，为空时紧贴[]
 *     表达式的起始位置和第一个元素只差一个位置
 *     为空判断 起始位置和结束位置相差两位
 * 2. 对象为空是紧贴 {}
 *
 * 3. 函数调用参数前后紧贴
 * 4. 数组下标紧贴 var a = [1, 2, 3]; a[0];
 * 5. 函数声明参数紧贴
 * 6. If,while,do-while,for语句()内容紧贴
 * @author Yubin.chen
 */


/**
 * 数组紧贴：
 *   获取第一个和最后一个元素，分别判断与表达式头部和尾部的位置关系，相差1位为紧贴
 * 函数调用实参紧贴：
 *   获取（ 和 )的位置，判断node.arguments是否为空，
 *   若空则（ 和 ）位置差1为紧贴，
 *   若不为空，获取第一个实参和最后一个实参，分别判断为（ 和 ） 之间的位差，位差为1则紧贴
 *  NEW表达式：
 *    同上
 *  函数声明，函数表达式：
 *    同上
 *  成员表达式：
 *    左【： getTokensBetween(node.object, node.property)；
 *    右】： context.getTokensAfter(node.property, 1)
 *    获取 属性的第一个token的位置和最后一个token位置，判断与【 和 】的位置关系
 *  If while do……while catch switch:
 *     获取左（ leftBrace = context.getTokensBefore(condition, 1)
 *          右） rightBrace = context.getTokensAfter(condition, 1)
 *     判断条件 node.test
 *     判断条件与（）之间的位置关系，位置差1为紧贴
 *  For语句；
 *     （ leftBrace = context.getTokensBefore(node.init, 1)[0];
 *     ） rightBrace = context.getTokensAfter(node.update, 1)[0];
 *     【与node.init   node.update与】的位差
 *  cactch语句：
 *     只有一个形参
 *  Switch语句：
 *      左右（）与node.discriminant的位差关系
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------



module.exports = function(context) {

    function checkCallAndNewExpression(node){

        var tokens = context.getTokens(node);
        var leftBrace = context.getTokensAfter(node.callee, 1)[0];
        var rightBrace = tokens[tokens.length - 1];

        if (leftBrace.value !== "(" || rightBrace.value !== ")"){
            return;
        }

        if (node.arguments.length === 0){ //函数参数为空，括号紧贴
            //不同行或者圆括号不紧贴
            if (leftBrace.loc.start.line !== rightBrace.loc.start.line ||
                leftBrace.loc.end.column !== rightBrace.loc.start.column){
                report(rightBrace);
            }

        } else {//函数参数不为空，首尾元素紧贴
            var first = node.arguments[0];
            var last = node.arguments[node.arguments.length - 1];

            //首元素与左括号首行同行，则需紧贴
            if (leftBrace.loc.start.line === first.loc.start.line &&
                leftBrace.loc.end.column !== first.loc.start.column){
                report(first);
            }

            //末元素与右括号同行，则需紧贴
            if (rightBrace.loc.start.line === last.loc.start.line &&
                rightBrace.loc.start.column !== last.loc.end.column){
                report(last);
            }
        }
    }
    function checkForStatement(node){
    	var tokens = context.getTokens(node);
        var leftBrace = tokens[1];
        var leftBraceAfterOne = tokens[2];
        var rightBrace = context.getTokensBefore(node.body, 1)[0];
		var rightBraceBeforeOne = context.getTokensBefore(rightBrace, 1)[0];
		
        if (leftBrace.value !== "(" || rightBrace.value !== ")"){
            return;
        }

        if (leftBrace.loc.end.line === leftBraceAfterOne.loc.start.line &&
            leftBrace.loc.end.column !== leftBraceAfterOne.loc.start.column){
            report(leftBrace);
        }

        if (rightBrace.loc.start.line === rightBraceBeforeOne.loc.end.line &&
            rightBrace.loc.start.column !== rightBraceBeforeOne.loc.end.column){
            report(rightBrace);
        }
    }
    function checkStatement(node){
        var condition = node.test;
        var leftBrace = context.getTokensBefore(condition, 1)[0];
        var rightBrace = context.getTokensAfter(condition, 1)[0];

        if (leftBrace.value !== "(" || rightBrace.value !== ")"){
            return;
        }
        if (leftBrace.loc.end.line === condition.loc.start.line &&
            leftBrace.loc.end.column !== condition.loc.start.column){
            report(leftBrace);
        }

        if (rightBrace.loc.start.line === condition.loc.end.line &&
            rightBrace.loc.start.column !== condition.loc.end.column){
            report(rightBrace);
        }
    }
    function isClosely(left, right){
        if (left.loc.end.line === right.loc.start.line){
            return left.loc.end.column === right.loc.start.column;
        }
        return true;
    }
    /**
     * Reports an AST node as a rule violation.
     * @param {ASTNode} node The node to report.
     * @returns {void}
     * @private
     */
    function report(node) {
        context.report(node, "首尾元素必须紧贴");
    }


    return {
        "ArrayExpression": function(node) {
            if (node.elements.length === 0){ //数组为空，中括号则紧贴
                if (node.loc.start.line !== node.loc.end.line || node.loc.start.column !== node.loc.end.column - 2){
                    report(node);
                }
            } else { //数组不为空，首尾元素则紧贴

                var first = node.elements[0];
                var last = node.elements[node.elements.length - 1];

                //首元素与节点首行同行，则需紧贴
                if (node.loc.start.line === first.loc.start.line
                    && node.loc.start.column !== first.loc.start.column - 1){
                    report(first);
                }

                //末元素与节点末行同行，则需紧贴
                if (node.loc.end.line === last.loc.end.line && node.loc.end.column !== last.loc.end.column + 1){
                    report(last);
                }
            }

        },
        "CallExpression": checkCallAndNewExpression,
        "NewExpression": checkCallAndNewExpression,
        "FunctionDeclaration": function(node){
            //获取左右括号的位置
            var tokens = context.getTokensBetween(node.id, node.body);
            var leftBrace = tokens[0], rightBrace = tokens[tokens.length - 1];
            if (leftBrace.value !== "(" || rightBrace.value !== ")"){
                return;
            }

            //无参数则括号必须紧贴
            if (node.params.length === 0){
                if (!isClosely(leftBrace, rightBrace)){
                    report(rightBrace);
                }
            } else {//带参数则首尾形参紧贴

                var first = node.params[0], last = node.params[node.params.length - 1];

                //首元素判断
                if (!isClosely(leftBrace, first)){
                    report(first);
                }

                //尾元素判断
                if (!isClosely(last, rightBrace)){
                    report(last);
                }

            }

        },
        "FunctionExpression": function(node){

            var leftBrace, rightBrace;
            if (node.id){
                var tokens = context.getTokensBetween(node.id, node.body);
                leftBrace = tokens[0];
                rightBrace = tokens[tokens.length - 1];
            } else {
                leftBrace = context.getTokens(node)[1];
                rightBrace = context.getTokensBefore(node.body, 1)[0];
            }
            if (leftBrace.value !== "(" || rightBrace.value !== ")"){
                return;
            }
            //无参数则括号必须紧贴
            if (node.params.length === 0){
                if (!isClosely(leftBrace, rightBrace)){
                    report(rightBrace);
                }
            } else {//带参数则首尾形参紧贴

                var first = node.params[0], last = node.params[node.params.length - 1];

                //首元素判断
                if (!isClosely(leftBrace, first)){
                    report(first);
                }
                //尾元素判断
                if (!isClosely(last, rightBrace)){
                    report(last);
                }
            }

        },
        "MemberExpression": function(node){
            if (node.computed === false){
                return;
            }

            var leftBrace = context.getTokensBetween(node.object, node.property)[0];
            var rightBrace = context.getTokensAfter(node.property, 1)[0];
            var propertyTokens = context.getTokens(node.property);
            var propertyFirst = propertyTokens[0];
            var propertyLast = propertyTokens[propertyTokens.length - 1];

            if (!isClosely(leftBrace, propertyFirst)){
                report(leftBrace);
            }
            if (!isClosely(propertyLast, rightBrace)){
                report(rightBrace);
            }
        },
        "IfStatement": checkStatement,
        "WhileStatement": checkStatement,
        "DoWhileStatement": checkStatement,
        "ForStatement": checkForStatement,
        "CatchClause": function(node){
            var leftBrace = context.getTokensBefore(node.param, 1)[0];
            var rightBrace = context.getTokensAfter(node.param, 1)[0];
            if (!isClosely(leftBrace, node.param)){
                report(leftBrace);
            }
            if (!isClosely(node.param, rightBrace)){
                report(rightBrace);
            }
        },
        "SwitchStatement": function(node){
            var leftBrace = context.getTokensBefore(node.discriminant, 1)[0];
            var rightBrace = context.getTokensAfter(node.discriminant, 1)[0];
            if (!isClosely(leftBrace, node.discriminant)){
                report(leftBrace);
            }
            if (!isClosely(node.discriminant, rightBrace)){
                report(rightBrace);
            }
        }
    };

};
