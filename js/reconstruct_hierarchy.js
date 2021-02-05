var nonAssLeaves,
    compressedNodes,
    depthYDict;

function reconstructHierarchy(minimapHierarchyData, minimapHeightDict) {

    nonAssLeaves = [];
    compressedNodes = findAndGroupCompressedNodes(minimapHierarchyData, selectedAssDict);

    depthYDict = {};
    calculateYDict(minimapHeightDict);
    reorderSiblings(minimapHierarchyData);
}

function findAndGroupCompressedNodes(node, assDict) {

    let temp = [],
        hasAss = false,
        equal = true;

    for (let i in node.children) {

        temp = temp.concat(findAndGroupCompressedNodes(node.children[i], assDict));

        if (nonAssLeaves.length > 0) {
            let dummyLeafBox = node.dummyLeafChild;
            for (let leaf of nonAssLeaves) {
                let pre = {};
                pre[leaf.id] = leaf.box;
                let index = searchDict[leaf.label].indexOf(pre);
                searchDict[leaf.label].splice(index, 1);
                leaf.box = dummyLeafBox.id;
                dummyLeafBox.elements.push(leaf);
                let match = {};
                match[leaf.id] = dummyLeafBox.id;
                searchDict[leaf.label].push(match);
            }
            dummyLeafBox._w = Math.ceil(Math.sqrt(dummyLeafBox.elements.length));
            dummyLeafBox._h = Math.ceil(dummyLeafBox.elements.length / dummyLeafBox._w);
            node.children.push(dummyLeafBox);
            temp = temp.concat(dummyLeafBox);
            minimapHeightDict[dummyLeafBox.depth].push(dummyLeafBox._h);
            nonAssLeaves = [];
        }
    }

    if (node.children) {

        if (temp.length != node.children.length) {
            equal = false;
        } else {
            for (let i = 0; i < temp.length; i++) {
                if (temp[i].id !== node.children[i].id) {
                    equal = false;
                }
            }
        }

        node._w = 0;
        for (let child of node.children) {
            node._w += child._w;
            if (child.descendantCount == 0) {
                node.descendantCount += child.elements.length;
            } else {
                node.descendantCount += child.descendantCount + 1;
            }
        }
    } else {
        if (temp.length != 0) {
            equal = false;
        }
        node._w = Math.ceil(Math.sqrt(node.elements.length));
    }

    if (equal) {

        let removeIndex = [];
        for (let ele of node.elements) {
            if (assDict[ele.url]) {
                hasAss = true;
                let pre = {};
                pre[ele.id] = ele.box;
                let index = searchDict[ele.label].indexOf(pre);
                searchDict[ele.label].splice(index, 1);
                let match = {};
                match[ele.id] = node.id;
                searchDict[ele.label].push(match);
            } else {
                if (node.elements.length > 1) {
                    removeIndex.push(node.elements.indexOf(ele));
                    nonAssLeaves.push(ele);
                }
            }
        }

        if (node.elements.length > 1 && node.elements.length != removeIndex.length) {
            for (let i = removeIndex.length - 1; i >= 0; i--) {
                node.elements.splice(removeIndex[i], 1)
            }
            node._w = node.elements.length;
            let rowHeights = minimapHeightDict[node.depth];
            let index = rowHeights.indexOf(node._h);
            rowHeights.splice(index, 1);
            node._h = 1;
            rowHeights.push(1);
        } else {
            nonAssLeaves = [];
        }

        if (!hasAss) {
            return [node];
        } else {
            return temp;
        }
    } else {
        return temp;
    }
}

function calculateYDict(minimapHeightDict) {
    let sum = 0;
    for (let key of Object.keys(minimapHeightDict)) {
        depthYDict[key] = sum;
        sum += Math.max(...minimapHeightDict[key]);
    }
}

function reorderSiblings(node) {

    let initNodeX = node.x,
        width = 0;

    node.compressedChildren = [];

    for (let i in node.children) {
        if (!compressedNodes.includes(node.children[i])) {
            node.children[i].x = initNodeX + width;
            node.children[i].y = depthYDict[node.children[i].depth];
            width += node.children[i]._w;
        }
    }

    let dummyKey = null;
    for (let i in node.children) {
        if (compressedNodes.includes(node.children[i]) && node.children[i].dummyLeafChildBox) {
            node.children[i].x = initNodeX + width;
            node.children[i].y = depthYDict[node.children[i].depth];
            width += node.children[i]._w;
            dummyKey = i;
        }
    }

    for (let i in node.children) {
        if (compressedNodes.includes(node.children[i]) && !node.children[i].dummyLeafChildBox) {
            node.children[i].x = initNodeX + width;
            node.children[i].y = depthYDict[node.children[i].depth];
            width += node.children[i]._w;
            node.compressedChildren.push(i);
        }
    }

    if (dummyKey) {
        node.compressedChildren.push(dummyKey);
    }

    for (let i in node.children) {
        if (node.children[i].children) {
            reorderSiblings(node.children[i]);
        }
    }

    if (node.children) {
        node.changedWidth = 0;
        if (node.compressedChildren.length == 1) {
            node.changedWidth += node.children[node.compressedChildren[0]]._w - 1;
        } else if (node.compressedChildren.length > 1) {
            let sum = 0;
            for(let key of node.compressedChildren) {
                sum += node.children[key]._w;
            }
            node.changedWidth += sum - 1;
        }
        for (let child of node.children) {
            if (child.changedWidth) {
                node.changedWidth += child.changedWidth;
            }
        }
    }
}