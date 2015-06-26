/**  必须紧贴function或函数名字
 *
 * 函数声明：
 *    获取node.id前的一个token 判断token与node.id之间的位置关系
 *  函数表达式：
 *     遍历token，获取关键字、函数名、左括号的位置
 *     判断位置之间的关系
 */

"use strict";

module.exports = function(context) {

    function report(node) {
        context.report(node, "'('必须紧贴function或函数名字");
    }

    return {
        "FunctionDeclaration": function( node) {

            var key = context.getTokensBefore(node.id, 1)[0];

            if (key.type == "Keyword" && key.loc.end.line == node.id.loc.start.line){
                if (node.id.loc.start.column != key.loc.end.column + 1){
                    reportSpace(node);
                }
            }

        },
        "FunctionExpression": function(node){
            var list = context.getTokens(node);
            var key;
            var leftBrace;
            var id;
            for (var i = 0; i < list.length; i++){
                if (list[i].type === "Keyword" && list[i].value === "function"){
                    var key = list[i];
                    if (list[i + 1].type === "Identifier"){
                        id = list[i + 1];
                        leftBrace = list[i + 2];
                    } else {
                        id = null;
                        leftBrace = list[i + 1];
                    }
                    break;
                }
            }
            if (id == null){
                if (key.loc.end.line === leftBrace.loc.start.line){
                    if (key.loc.end.column !== leftBrace.loc.start.column){
                        report(node);
                    }
                }
            } else {
                if (id.loc.end.line === leftBrace.loc.start.line){
                    if (id.loc.end.column !== leftBrace.loc.start.column){
                        report(node);
                    }
                }
            }

        }
    };

};
