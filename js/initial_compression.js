function initialCompression(node) {

    if (node.compressedChildren.length > 0) {
        compressSiblings(node);
    }

    for (let child of node.children) {
        if (child.children) {
            initialCompression(child);
        }
    }
}

function compressSiblings(node) {

    if (node.compressedChildren.length == 1) {

        let child = node.children[node.compressedChildren[0]];

        // square
        if (child.elements.length > 1) {
            changedWidthDict[child.x] = child._w - 1;
            if (child._h > 1) {
                let index = heightDict[child.depth].indexOf(child._h)
                heightDict[child.depth].splice(index, 1);
            }
            child.compressed = true;
            compressionDict[child.id] = {};
        }

        // triangle & bar
        if (child.children) {

            // triangle
            if (child._w > 1) {
                changedWidthDict[child.x] = child._w - 1;
            }

            compressDescendants(child);
            child._children = child.children;
            child.children = null;
            child.compressed = true;
            compressionDict[child.id] = {};
        }

        // hill
    } else {

        let dummyChild = node.dummyChild;
        dummyChild._w = 0;
        let minX = node.x + node._w;
        let dummyLeafChildBox = null;

        for (let i = node.compressedChildren.length - 1; i >= 0; i --) {

            let key = node.compressedChildren[i],
                child = node.children[key];

            hillDict[child.id] = dummyChild.id;

            // triangle & bar
            if (child.children) {
                compressDescendants(child);
                child._children = child.children;
                child.children = null;

            // square
            } else {
                if (child._h > 1) {
                    let index = heightDict[child.depth].indexOf(child._h);
                    heightDict[child.depth].splice(index, 1);
                }
            }

            if (child.dummyLeafChildBox) {
                dummyLeafChildBox = child;
            } else {
                dummyChild.elements.unshift(child);
            }
            dummyChild._w += child._w;
            minX = minX < child.x ? minX : child.x;
            node.children.splice(key, 1);
            compressionDict[child.id] = dummyChild;
        }

        if (dummyLeafChildBox) {
            dummyChild.elements.unshift(dummyLeafChildBox);
        }
        dummyChild.x = minX;
        dummyChild._h = 1;
        dummyChild.compressed = true;
        node.children.push(dummyChild);
        changedWidthDict[dummyChild.x] = dummyChild._w - 1;
    }
}

function compressDescendants(node) {
    for (let child of node.children) {
        compressionDict[child.id] = node;
        if (child._w > 1) {
            let index = heightDict[child.depth].indexOf(child._h);
            heightDict[child.depth].splice(index, 1);
        }
        if (child.children) {
            compressDescendants(child);
        }
    }
}

function moveNodes(node) {

    var sum = 0;
    for (let key of Object.keys(changedWidthDict)) {
        if (node.x > key) {
            sum += changedWidthDict[key];
        }
    }
    node.x -= sum;

    node.y = 0;
    for (let key of Object.keys(heightDict)) {
        if (key < node.depth) {
            node.y += parseInt(Math.max(...heightDict[key]));
        }
    }

    collectGlyphData(node);

    for (let i in node.children) {
        moveNodes(node.children[i]);
    }
}

function collectGlyphData(node) {

    if (!node.compressed) {

        if (node.elements.length > 1) {

            node.elements.sort(sortByAss);

            for (let i in node.elements) {
                node.elements[i].cx = parseInt(node.x) + parseInt(i);
                node.elements[i].cy = node.y;
                node.elements[i].dx = i % node._w;
                node.elements[i].dy = Math.floor(i / node._w);
                circleData.push(node.elements[i]);
            }

        } else {
            node.elements[0].cx = node.x;
            node.elements[0].cy = node.y;
            node.elements[0].dx  = 0;
            node.elements[0].dy = 0;
            circleData.push(node.elements[0]);
        }

    } else {

        if (node.elements.length > 1) {

            if (node.dummyChildBox) {

                let hill = {
                    x: node.x,
                    y: node.y,
                    box: node.id
                };

                hillData.push(hill)

            } else {

                let square = {
                    cx: node.x,
                    cy: node.y,
                    box: node.id
                };

                squareData.push(square);
            }


        } else {

            if (node._w > 1) {

                let triangle = {
                    cx: node.x,
                    cy: node.y,
                    box: node.id
                };

                triangleData.push(triangle);

            } else {

                let bar = {
                    cx: node.x,
                    cy: node.y,
                    box: node.id
                };

                barData.push(bar)
            }
        }
    }
}

function sortByAss(a, b) {
    if (document.querySelectorAll('input[name="a_property"]:checked').length == 1) {
        if (selectedAssDict[a.url] && selectedAssDict[b.url]) {
            if (selectedAssDict[a.url].length > selectedAssDict[b.url].length) {
                return -1;
            }
            if (selectedAssDict[a.url].length < selectedAssDict[b.url].length) {
                return 1;
            }
            return 0;
        } else if (!selectedAssDict[a.url]) {
            return 1;
        } else if (!selectedAssDict[b.url]) {
            return -1;
        }
        return 0;
    } else {
        if (selectedAssDict[a.url] && selectedAssDict[b.url]) {
            let aAssStrength = 0;
            for (let ass of Object.keys(selectedAssDict[a.url])) {
                aAssStrength += selectedAssDict[a.url][ass].length;
            }

            let bAssStrength = 0;
            for (let ass of Object.keys(selectedAssDict[b.url])) {
                bAssStrength += selectedAssDict[b.url][ass].length;
            }

            if (aAssStrength > bAssStrength) {
                return -1;
            }
            if (aAssStrength < bAssStrength) {
                return 1;
            }
            return 0;
        } else if (!selectedAssDict[a.url]) {
            return 1;
        } else if (!selectedAssDict[b.url]) {
            return -1;
        }
        return 0;
    }
}