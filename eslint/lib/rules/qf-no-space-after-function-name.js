/**
 * function 的 （ 前没有空格
 */

"use strict";



module.exports = function(context) {

    function reportSpace(node) {
        context.report(node, "function的'('前应没有空格");
    }

    return {
        "FunctionDeclaration": function(node) {
            var key = context.getTokensAfter(node.id, 1)[0];
            if (key.value === "(" && key.loc.end.line === node.id.loc.start.line){
                if (node.id.loc.end.column !== key.loc.start.column){
                    reportSpace(node);
                }
            }
        }
    };

};
