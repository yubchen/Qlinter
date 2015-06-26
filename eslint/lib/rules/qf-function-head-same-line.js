/**
 * function关键字与()、参数、方法名同行校验
 *   使用getFirstToken获取第一个token，再用getTokensBetween 获取第一个token到body直接的所有token，之后遍历校验
 * */

"use strict";

module.exports = function( context ) {

    function report( node ) {
        context.report( node, "function关键字与(、方法名必须同行" );
    }

    function checkSameLine( node ){

        var first = context.getFirstToken( node );
        var second = context.getTokenAfter( first, 1 );
        var third = context.getTokenAfter( second, 1 );
        var keyword, id, leftBrace;

        if ( second.type === "Punctuator" && second.value === "(" ){
            keyword = first;
            leftBrace = second;
            id = null;
        } else {
            keyword = first;
            id = second;
            leftBrace = third;
        }

        if ( id == null ){
            if ( keyword.loc.start.line !== leftBrace.loc.start.line ){
                report( node );
            }
        } else {
            if ( keyword.loc.start.line !== id.loc.start.line || keyword.loc.start.line !== leftBrace.loc.start.line ){
                report( node );
            }
        }
    }

    return {
        "FunctionDeclaration": checkSameLine,
        "FunctionExpression": checkSameLine
    };

};
