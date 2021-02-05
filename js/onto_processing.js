// var secondaryChildDict;
// var loopDict;

function processHierarchy(data) {

    /**
     * construct data dictionaries
     * */

    let classLabelDict = {},
        classParentDict = {},
        classChildDict = {};

    // secondaryChildDict = {};

    // loopDict = {};

    let hasThing = false,
        thingId;

    for (let item of data) {

        if (item["Preferred Label"] == "owl:Thing") {
            hasThing = true;
            thingId = item["Class ID"];
        }

        let classID = item["Class ID"];

        classLabelDict[classID] = {};
        classLabelDict[classID].label = item["Preferred Label"];

        let parents = item["Parents"].split("|");

        classParentDict[classID] = parents;

        // remove self loop
        let removeIndex = -1;
        for (let parent of parents) {
            if (parent != classID) {
                if (classChildDict.hasOwnProperty(parent)) {
                    classChildDict[parent].push(item["Class ID"])
                } else {
                    classChildDict[parent] = [item["Class ID"]]
                }
            } else {
                // loopDict[classID] = [parent];
                removeIndex = classParentDict[classID].indexOf(parent);
            }
        }
        if (removeIndex >= 0) {
            classParentDict[classID].splice(removeIndex, 1);
        }

        // // get secondary children //
        // let parentNum = parents.length;
        // if (parentNum> 1) {
        //
        //     for (let i = 1; i < parentNum; i++) {
        //
        //         let parent = parents[i];
        //
        //         if (secondaryChildDict.hasOwnProperty(parent)) {
        //             secondaryChildDict[parent].push(item["Class ID"])
        //         } else {
        //             secondaryChildDict[parent] = [item["Class ID"]]
        //         }
        //     }
        // }
        //
        // let parent = parents[0];
        //
        // if (classChildDict.hasOwnProperty(parent)) {
        //     classChildDict[parent].push(item["Class ID"])
        // } else {
        //     classChildDict[parent] = [item["Class ID"]]
        // }
        // // //
    }

    if (!hasThing) {
        classLabelDict["http://www.w3.org/2002/07/owl#Thing"] = {};
        classLabelDict["http://www.w3.org/2002/07/owl#Thing"].label = "owl:Thing";
    }

    // sort children alphabetically by label
    for (let key of Object.keys(classChildDict)) {
        classChildDict[key].sort(sortByLabel);
    }

    function sortByLabel(a, b) {
        if (classLabelDict[a].label > classLabelDict[b].label) {
            return 1;
        } else {
            return -1;
        }
    }

    /**
     * check loop
     * */

    let parentRemoveIndex = {};
    let childRemoveIndex = {};

    for (let node of Object.keys(classChildDict)) {
        for (let child of classChildDict[node]) {

            let ancestor = checkPath(child, node);
            if (ancestor) {

                let childIndex = classChildDict[node].indexOf(child);
                delete classChildDict[node][childIndex];
                if (childRemoveIndex[node]) {
                    childRemoveIndex[node].push(childIndex);
                } else {
                    childRemoveIndex[node] = [];
                    childRemoveIndex[node].push(childIndex);
                }

                let ancestorIndex = classParentDict[ancestor].indexOf(node);
                delete classParentDict[ancestor][ancestorIndex];
                if (parentRemoveIndex[ancestor]) {
                    parentRemoveIndex[ancestor].push(ancestorIndex);
                } else {
                    parentRemoveIndex[ancestor] = [];
                    parentRemoveIndex[ancestor].push(ancestorIndex);
                }
            }
        }
    }

    function checkPath(child, parent) {
        if (classParentDict[parent]) {
            for (let ancestor of classParentDict[parent]) {
                if (child == ancestor) {
                    return ancestor;
                } else {
                    return checkPath(child, ancestor);
                }
            }
        }
    }

    for (let node of Object.keys(parentRemoveIndex)) {
        parentRemoveIndex[node].sort();
        for (let i = parentRemoveIndex[node].length - 1; i >= 0; i--) {
            classParentDict[node].splice(parentRemoveIndex[node][i], 1);
        }
    }

    for (let node of Object.keys(childRemoveIndex)) {
        childRemoveIndex[node].sort();
        for (let i = childRemoveIndex[node].length - 1; i >= 0; i--) {
            classChildDict[node].splice(childRemoveIndex[node][i], 1);
        }
    }

    /**
     * organise data
     * */

    let boxElementDict = {},
        boxChildDict = {},
        rowDict = {},
        columnDict = {};

    let column = 0;

    let rootId;
    if (!hasThing) {
        rootId = "http://www.w3.org/2002/07/owl#Thing";
    } else{
        rootId = thingId;
    }

    getChild(rootId, 0);

    function getChild(data, row) {

        let boxId = column + " " + row;

        boxElementDict[column + " " + row] = [data + " " + column + " " + row];

        rowDict[row] = {
            height: 0
        };

        row += 1;

        let childIds = new Set();

        let leavesBoxId = column + " " + row,
            leafCount = 0;

        if (data == "wl:Thin" && !classChildDict[data]) {
            data = "http://www.w3.org/2002/07/owl#Thing";
        }

        // process the leaf children first
        for (let child of classChildDict[data]) {
            if (!classChildDict.hasOwnProperty(child)) {
                leafCount += 1;
                if (boxElementDict.hasOwnProperty(leavesBoxId)) {
                    boxElementDict[leavesBoxId].push(child + " " + leavesBoxId);
                } else {
                    boxElementDict[leavesBoxId] = [child + " " + leavesBoxId];
                }
            }
        }

        columnDict[column] = {
            width: Math.ceil(Math.sqrt(leafCount))
        };

        rowDict[row] = {
            height: 0
        };

        if (leafCount > 0) {
            childIds.add(leavesBoxId);
            column += 1;
        }

        // process the children that are not leaves
        for (let child of classChildDict[data]) {
            if (classChildDict.hasOwnProperty(child)) {
                let childId = getChild(child, row);
                childIds.add(childId);
            }
        }

        if (childIds.size > 0) {
            boxChildDict[boxId] = Array.from(childIds);
        }

        return boxId;
    }

    let countX = 0;
    for (let key in columnDict) {
        columnDict[key].x = countX;
        countX += columnDict[key].width;
    }

    for (let key in boxElementDict) {
        let height = Math.ceil(boxElementDict[key].length / columnDict[key.split(" ")[0]].width),
            row = key.split(" ")[1];
        rowDict[row].height = height > rowDict[row].height ? height : rowDict[row].height;
    }

    let countY = 0;
    for (let key in rowDict) {
        rowDict[key].y = countY;
        countY += rowDict[key].height;
    }

    /**
     * construct hierarchy
     * */

    let idCounter = 0;

    let hierarchy = {
        id: "0-0",
        elements: [
            {
                id: "id" + idCounter,
                url: boxElementDict["0 0"][0].split(" ")[0],
                label: classLabelDict[boxElementDict["0 0"][0].split(" ")[0]].label,
                box: "0-0"
            }
        ],
        depth: 0,
        _h: 1,
        x: 0,
        y: 0,
        descendantCount: 0
    };

    idCounter += 1;

    let rowHeightDict = {
        0: [1]
    };

    let boxParentDict = {},
        searchLabelDict = {};

    constructHierarchy(hierarchy);

    function constructHierarchy(node) {

        node.children = [];

        for (let childId of boxChildDict[node.id.replace("-"," ")]) {

            let elements = [];

            for (let ele of boxElementDict[childId]) {

                let id = "id" + idCounter,
                    url = ele.split(" ")[0],
                    label = classLabelDict[url].label,
                    box = childId.replace(/ /g,"-");

                let node = {
                    id: id,
                    url: url,
                    label: label,
                    box: box
                }
                elements.push(node);

                let match = {};
                match[id] = box;

                if (searchLabelDict.hasOwnProperty(label)) {
                    searchLabelDict[label].push(match);
                } else {
                    searchLabelDict[label] = [match];
                }

                idCounter += 1;
            }

            let depth = parseInt(childId.split(" ")[1]),
                height = Math.ceil(boxElementDict[childId].length / columnDict[childId.split(" ")[0]].width)

            let box = {
                id: childId.replace(/ /g,"-"),
                elements: elements,
                depth: depth,
                _h: height,
                descendantCount: 0
            }

            node.children.push(box);

            boxParentDict[box.id] = node;

            if (rowHeightDict.hasOwnProperty(depth)) {
                rowHeightDict[depth].push(height)
            } else {
                rowHeightDict[depth] = [height]
            }

            // add dummy leaf child box for non-ass leaf children
            if (box.elements.length > 1) {
                let dummyLeafChildBox = {
                    id: "dummyLeafChild_" + node.id,
                    elements: [],
                    dummyLeafChildBox: true,
                    depth: depth,
                    descendantCount: 0
                }
                node.dummyLeafChild = dummyLeafChildBox;
                boxParentDict[dummyLeafChildBox.id] = node;
            }
        }

        // add dummy child box for all non-ass children
        if (node.children.length > 1) {
            let dummyChildBox = {
                id: "dummyChild_" + node.id,
                elements: [],
                dummyChildBox: true,
                depth: parseInt(node.id.split("-")[1]) + 1,
            }
            node.dummyChild = dummyChildBox;
            boxParentDict[dummyChildBox.id] = node;
        }

        for (let child of node.children)
        if (boxChildDict[child.id.replace("-"," ")]) {
            constructHierarchy(child);
        }
    }

    // console.log(hierarchy)

    /**
     * return data for visualisation
     * */

    return {
        classParentDict: classParentDict,
        parentDict: boxParentDict,
        labelDict: classLabelDict,
        searchDict: searchLabelDict,
        heightDict: rowHeightDict,
        hierarchyData: hierarchy
    }
}