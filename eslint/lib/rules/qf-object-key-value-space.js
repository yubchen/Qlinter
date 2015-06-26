/**
 * key value 验证空格：
 * 	  取出key和value的位置 key的末尾位置和value的起始位置差1
 * key-value独立行验证
 *    上一行的末尾位置!=下一行的起始位置
 * 冒号必须紧贴元素后面
 *    使用token获取冒号位置，判断冒号起始位置==key的末尾位置
 * 逗号紧跟在value之后
 *     获取上一行的value和下一行的key， 通过token获取逗号，判断逗号的位置紧跟在key之后
 */

"use strict";

module.exports = function(context) {

    /**
     * there must one space bewteen punctuator and right element;
     */
    function isSpageLegal(left, right){
        var tokens = context.getTokensBetween(left, right);
        var token = tokens[0]; //token是冒号
        // 两元素同行
        if (left.loc.end.line === right.loc.start.line && right.loc.start.column - token.loc.end.column !== 1){
            return false;
        }
        return true;
    }

    //冒号必须紧贴元素后面
    function isColonLegal(left, right){
        var tokens = context.getTokensBetween(left, right);
        var token = tokens[0];

        if (left.loc.end.column !== token.loc.start.column){
            return false;
        }
        return true;
    }

    function isLineLegal(up, down){
        return up.value.loc.end.line !== down.key.loc.start.line;
    }

    function isSameLineLegal(key, value) {
        return key.loc.end.line === value.loc.start.line;
    }

    function isCommaLegal(up, down){

        var tokens = context.getTokensBetween(up, down);
        var comma = tokens[0];
        return up.loc.end.line === comma.loc.start.line && up.loc.end.column === comma.loc.start.column;

    }
    /**
     * Reports an AST node as a rule violation.
     * @param {ASTNode} node The node to report.
     * @returns {void}
     * @private
     */
    function reportColon(node) {
        context.report(node, "冒号必须在紧跟key之后");
    }

    function reportSpace(node) {
        context.report(node, "key 和 value直接必须一个空格");
    }
    
    function reportLine(node){
        context.report(node, "每对key value独立一行");
    }

    function reportSameLine(node){
        context.report(node, "每对key value需要始于同一行");
    }

    function reportComma(node){
        context.report(node, "逗号必须紧跟value之后");
    }

    function reportEmpty(node){
        context.report(node, "空对象的花括号需要紧贴");
    }

    return {
        "ObjectExpression": function(node) {

            if (node.properties.length === 0){
                if (node.loc.start.line !== node.loc.end.line || node.loc.start.column !== node.loc.end.column - 2){
                    reportEmpty(node);
                }
            }

            for (var i = 0; i < node.properties.length; i++){
                //key-value之间必须有一空格
                if (!isSpageLegal( node.properties[i].key, node.properties[i].value)){
                    reportSpace(node.properties[i].value);
                }

                //key-value之间冒号位置
                if (!isColonLegal(node.properties[i].key, node.properties[i].value)){
                    reportColon(node.properties[i]);
                }

                //不同key-value必须不同行
                if (i > 0 && !isLineLegal(node.properties[i - 1], node.properties[i])) {
                    reportLine(node.properties[i]);
                }

                //key-value末尾逗号位置
                if (i > 0 && !isCommaLegal(node.properties[i - 1], node.properties[i])) {
                    reportComma(node.properties[i - 1]);
                }

                //key的末行，value的起始行需要在同一行
                if (!isSameLineLegal(node.properties[i].key, node.properties[i].value)) {
                    reportSameLine(node.properties[i].value);
                }
            }
        }
    };

};
