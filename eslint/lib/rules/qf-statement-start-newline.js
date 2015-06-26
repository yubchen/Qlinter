/**
 * @fileoverview 每条语句必须新起一行
 */
module.exports = function (context) {

    var childrenProperty = {
        BlockStatement: "body",
        Program: "body",
        SwitchCase: "consequent"
    };

    function getChildren(node) {

        return node[childrenProperty[node.type]];
    }

    var lines = null;

    function checkStatement(node) {

        if (node.type === 'Program') {
            lines = context.getSourceLines();
        }
        var children = getChildren(node);

        children.forEach(function(currentNode, index) {

            var line = currentNode.loc.start.line;
            var column = currentNode.loc.start.column;

            //用正则验证子节点第一行 第一个不是空格或tab的字符的index
            //应该等于currentNode.loc.start.column
            var index = lines[line - 1].search(/[^\t| ]/);


            if (index !== column) {
           
                context.report(currentNode, {
                    line: line,
                    column: column
                }, "每条语句必须新起一行。");
            }
        });
    }

    return {
        "Program": checkStatement,
        "BlockStatement": checkStatement,
        "SwitchCase": checkStatement
    };
};