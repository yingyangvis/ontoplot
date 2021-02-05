let intersectionAss;

function getNodeAss(node) {

    let checkedProperties = [];

    let input = activeProperty.parentNode.firstChild;
    let propertyAttr = input.getAttribute("propertyArray");

    if (!propertyAttr) {
        checkedProperties.push(input);
    } else {
        let properties = propertyAttr.split(",");
        for (let property of properties) {
            checkedProperties.push(document.getElementById(property));
        }
    }

    if (checkedProperties.length == 1) {

        for (let assNode of selectedAssDict[node.url]) {
            if (nodeAss[assNode]) {
                if (!nodeAss[node.url]) {
                    nodeAss[assNode].push(node.url);
                }
            } else {
                nodeAss[assNode] = [];
                nodeAss[assNode].push(node.url);
            }
        }

        nodeAss[node.url] = selectedAssDict[node.url];

        colourDict = JSON.parse(JSON.stringify(nodeAss));

    } else {

        for (let key of Object.keys(selectedAssDict[node.url])) {
            for (let item of selectedAssDict[node.url][key]) {

                if (nodeAss[item]) {

                    if (nodeAss[item].length) {
                        nodeAss[item] = {};
                        nodeAss[item][key] = [node.url];
                    } else {
                        if (nodeAss[item][key]) {
                            if (!nodeAss[item][key].includes(node.url)) {
                                nodeAss[item][key].push(node.url);
                            }
                        } else {
                            nodeAss[item][key] = [node.url];
                        }
                    }
                } else {
                    nodeAss[item] = {};
                    nodeAss[item][key] = [node.url];
                }
            }
        }

        nodeAss[node.url] = selectedAssDict[node.url];

        colourDict = JSON.parse(JSON.stringify(nodeAss));
    }
}