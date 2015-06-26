/**
 *  获取相邻两元素的位置，同行条件下，判断之间包括一个空格
 */
"use strict";


module.exports = function( context ) {

    /**
     * there must one space bewteen punctuator and right element;
     */
    var map = {
        "ArrayExpression": "elements",
        "CallExpression": "arguments",
        "FunctionDeclaration": "params",
        "FunctionExpression": "params",
        "NewExpression": "arguments"
    };
    function isSpageLegal( left, right ){
        var tokens = context.getTokensBetween( left, right );
        var token = tokens[ 0 ];

        // 两元素同行
        if ( left.loc.end.line === right.loc.start.line && right.loc.start.column - token.loc.end.column !== 1 ){
            return false;
        }

        return true;
    }
    function check( node ){
        var name = map[ node.type ];
        var list = node[ name ];
        for ( var i = 0; i < list.length - 1; i++ ){

            //元素间空格的规则
            if ( !isSpageLegal( list[ i ], list[ i + 1 ] ) ) {
                reportSpace( list[ i + 1 ] );
            }
        }
    }

    function reportSpace( node ) {
        //noinspection Eslint
        context.report(node, "相邻元素须有一个空格.");
    }

    return {
        "ArrayExpression": check,
        "CallExpression": check,
        "NewExpression": check,
        "FunctionDeclaration": check,
        "FunctionExpression": check
    };

};
