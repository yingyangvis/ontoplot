function changeAncestor(node) {

    d3.select("#box" + node.parent.data.id)
        .attr("width", function() {
            this.__data__.data._cw += changedWidth / visScale;
            return parseInt(this.getAttribute("width")) + changedWidth;
        });

    d3.select("#siblingBox" + node.parent.data.id)
        .attr("width", function() {
            return parseInt(this.getAttribute("width")) + changedWidth;
        });

    d3.selectAll("#hillButton" + node.parent.data.id)
        .attr("width", function() {
            if (parseInt(this.getAttribute("x")) <= parseInt(document.getElementById("box" + node.data.id).getAttribute("x"))) {
                d3.select("#hillButtonLine" + node.parent.data.id + "up")
                    .attr("width", function() {
                        return parseInt(this.getAttribute("width")) + changedWidth;
                    })
                d3.select("#hillButtonLine" + node.parent.data.id + "down")
                    .attr("width", function() {
                        return parseInt(this.getAttribute("width")) + changedWidth;
                    })
                return parseInt(this.getAttribute("width")) + changedWidth;
            } else {
                this.setAttribute("x", parseInt(this.getAttribute("x")) + changedWidth);
                d3.select("#hillButtonLine" + node.parent.data.id + "up")
                    .attr("x", function() {
                        return parseInt(this.getAttribute("x")) + changedWidth;
                    })
                d3.select("#hillButtonLine" + node.parent.data.id + "down")
                    .attr("x", function() {
                        return parseInt(this.getAttribute("x")) + changedWidth;
                    })
                return this.getAttribute("width");
            }
        });

    if (node.parent.parent) {
        changeAncestor(node.parent);
    }
}

function moveRightSubtrees(node) {

    let clickedX = parseInt(document.getElementById("box" + node.data.id).getAttribute("x"));

    let rightAncestors = [];
    findRightAncestors(node.data, rightAncestors, clickedX);

    for (let ele of rightAncestors) {

        moveNode(ele);

        if (ele.children || ele._children) {
            moveSubtree(ele);
        }
    }
}

function findRightAncestors(node, array, clickedX) {
    let parent = boxParentDict[node.id];

    if (parent) {
        for (let sibling of boxChildDict[parent.id]) {
            if (parseInt(document.getElementById("box" + sibling.data.id).getAttribute("x")) > clickedX) {
                array.push(sibling);
            }
        }
        findRightAncestors(parent, array, clickedX);
    }
}

function moveSubtree(node) {

    let children = node.children ? node.children : node._children;

    for (let child of children) {

        moveNode(child);

        if (child.children || child._children) {
            moveSubtree(child);
        }
    }
}

function moveNode(node) {

    d3.select("#box" + node.data.id)
        .attr("x", function() {
            return parseInt(this.getAttribute("x")) + changedWidth;
        });

    d3.select("#siblingBox" + node.data.id)
        .attr("x", function() {
            return parseInt(this.getAttribute("x")) + changedWidth;
        });

    d3.selectAll('[siblingLine="' + node.data.id  + '"]')
        .each(function() {
            let x1 = parseInt(this.getAttribute("x1")),
                x2 = parseInt(this.getAttribute("x2"));
            this.setAttribute("x1", x1 + changedWidth);
            this.setAttribute("x2", x2 + changedWidth);
        });

    d3.selectAll('[button="' + node.data.id  + '"]')
        .each(function() {
            this.setAttribute("x", parseInt(this.getAttribute("x")) + changedWidth);
        });
}

function changeLowerSubtrees() {

    calculateYDict(heightDict);

    d3.selectAll(".box")
        .attr("y", function(d) {
            return depthYDict[d.depth] * visScale;
        })
        .attr("height", function(d) {
            return Math.max(...heightDict[d.depth]) * visScale;
        });

    d3.selectAll(".siblingBox")
        .attr("y", function() {
            let depth = parseInt(this.getAttribute("depth"));
            return depthYDict[depth] * visScale;
        })
        .attr("height", function() {
            let depth = parseInt(this.getAttribute("depth"));
            return Math.max(...heightDict[depth]) * visScale;
        });

    d3.selectAll(".partialSiblingLine")
        .attr("y1", function() {
            let depth = parseInt(this.getAttribute("depth"));
            return (depthYDict[depth] + Math.max(...heightDict[depth])) * visScale - 8;
        })
        .attr("y2", function() {
            let depth = parseInt(this.getAttribute("depth"));
            return (depthYDict[depth] + Math.max(...heightDict[depth])) * visScale;
        });

    d3.selectAll(".siblingLine")
        .attr("y1", function() {
            let depth = parseInt(this.getAttribute("depth"));
            return depthYDict[depth] * visScale;
        })
        .attr("y2", function() {
            let depth = parseInt(this.getAttribute("depth"));
            return (depthYDict[depth] + Math.max(...heightDict[depth])) * visScale;
        });

    d3.selectAll(".hillButton")
        .attr("y", function(d) {
            let boxY = parseInt(document.getElementById("box" + d.parent.data.id).getAttribute("y"));
            return boxY + 2;
        })
        .attr("height", function(d) {
            let boxHeight = parseInt(document.getElementById("box" + d.parent.data.id).getAttribute("height"));
            d3.select("#hillButtonLine" + d.parent.data.id + "up")
                .attr("y", parseInt(this.getAttribute("y")) + boxHeight - 7);
            d3.select("#hillButtonLine" + d.parent.data.id + "down")
                .attr("y", parseInt(this.getAttribute("y")) + boxHeight - 5);
            return boxHeight - 4;
        })
}

function moveGlyphs() {

    d3.selectAll(".circle")
        .attr("cx", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("x")) + visScale / 2 + d.dx * visScale;
        })
        .attr("cy", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("y")) + visScale / 2 + d.dy * visScale;
        });

    d3.selectAll(".bar")
        .attr("x", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("x")) + visScale / 2 - visScale / 8;
        })
        .attr("y", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("y")) + visScale / 2 - visScale / 5;
        });

    d3.selectAll(".square")
        .attr("x", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("x")) + visScale / 2 - visScale / 5;
        })
        .attr("y", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("y")) + visScale / 2 - visScale / 5;
        });

    d3.selectAll(".triangle")
        .attr("transform", function (d) {
            var x = parseInt(document.getElementById("box" + d.box).getAttribute("x")) + visScale / 2;
            var y = parseInt(document.getElementById("box" + d.box).getAttribute("y")) + visScale / 1.8;
            return "translate(" + x + ", " + y + ")";
        });

    d3.selectAll(".hill")
        .attr("transform", function (d) {
            var x = parseInt(document.getElementById("box" + d.box).getAttribute("x")) + visScale / 2;
            var y = parseInt(document.getElementById("box" + d.box).getAttribute("y")) + visScale / 1.8;
            return "translate(" + x + ", " + y + ")";
        });

    d3.selectAll(".subtreeLabel")
        .attr("x", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("x")) + visScale / 2;
        })
        .attr("y", function(d) {
            return parseInt(document.getElementById("box" + d.box).getAttribute("y")) + visScale + 4;
        });
}
