function expansion(node) {

    let compressed = node.data.compressed;

    if (compressed == true) {

        let box = document.getElementById("box" + node.data.id);

        if (!node._children) {

            let originalNode = null;
            reserveTree.each(function(d) {
                if (d.data.id == node.data.id) {
                    originalNode = d;
                }
            })

            if (originalNode.children) {
                node.children = originalNode.children;
            }

            var changedX = originalNode.data.x - parseInt(box.getAttribute("x")) / visScale;
            var changedY = originalNode.data.y - parseInt(box.getAttribute("y")) / visScale;

        } else {

            node.children = node._children;
            node._children = null;

            var changedX = node.data.x - parseInt(box.getAttribute("x")) / visScale;
            var changedY = node.data.y - parseInt(box.getAttribute("y")) / visScale;
        }

    } else {

        node.children = node._children;
        node._children = null;

        node.data.collapsed = false;
    }

    if (node.children) {

        d3.select("#box" + node.data.id)
            .attr("width", function () {
                changedWidth = node.data._cw * visScale - parseInt(this.getAttribute("width"));
                return node.data._cw * visScale;
            });

        d3.selectAll('[box="' + node.data.id + '"]')
            .style("display", "block");

        d3.selectAll('[button="' + node.data.id + '"]')
            .style("display", "block");

        d3.select("#siblingBox" + node.data.id)
            .style("display", "block");

        boxChildDict[node.data.id] = node.children;

        if (compressed == true) {

            let ele = node.data.elements[0];
            ele.dx = 0;
            ele.dy = 0;

            drawCircle(ele);

            drawSubtree(node, changedX, changedY);

            node.data.compressed = false;

        } else {
            expandSubtree(node);
        }

    } else {

        heightDict[node.depth].push(node.data._h);
        node.data._ch = node.data._h;

        d3.select("#box" + node.data.id)
            .attr("width", function () {
                changedWidth = node.data._w * visScale - parseInt(this.getAttribute("width"));
                return node.data._w * visScale;
            })
            .attr("height", function(d) {
                return Math.max(...heightDict[d.depth]) * visScale;
            });

        d3.selectAll('[box="' + node.data.id + '"]')
            .style("display", "block");

        if (compressed == true) {

            let elements = node.data.elements;

            for (let i in elements) {

                elements[i].dx = i % node.data._w;
                elements[i].dy = Math.floor(i / node.data._w);
                drawCircle(elements[i]);

                node.data.compressed = false;
            }
        }
    }

    for (let d of compressedNodes) {
        if (d.id == node.data.id) {
            let index = compressedNodes.indexOf(d);
            compressedNodes.splice(index, 1);
        }
    }

    if (clickedNode) {
        d3.selectAll('[url="' + clickedNode.url + '"]')
            .style("fill", function(d) {
                if (d.id != clickedNode.id) {
                    return "#1a9850";
                } else {
                    return this.style.fill;
                }
            });
    }

    d3.select("#minibox" + node.data.id)
        .style("opacity", 1)
        .style("stroke-opacity", 1);

    d3.selectAll("#glyph" + node.data.id).remove();

    if (node.parent) {
        changeAncestor(node);
    }

    moveRightSubtrees(node);

    changeLowerSubtrees();

    moveGlyphs();

    resizeSVG();

    showPathLabels();

    updateLabel();

    if (!clickedNode && selectedNodes.length > 0) {
        d3.selectAll(".multiNodeLabel").remove();
        pinMultiNodeLabels();
    }

    scrollBrush();

    updateMinimap();

    if (clickedNode) {
        updateAssArrow();
        drawHiddenCircle();
    }
}

function expandSubtree(node) {

    for (let child of node.children) {

        heightDict[child.depth].push(child.data._ch);

        d3.select("#box" + child.data.id)
            .style("display", "block")
            .style("fill", "#ffcccc");

        d3.selectAll('[box="' + child.data.id + '"]')
            .each(function() {
                if (child.data.collapsed == true || child.data.compressed == true) {
                    if (this.tagName != "circle") {
                        this.style.display = "block";
                        d3.select("#siblingBox" + child.data.id)
                            .style("display", "none");
                    }
                } else {
                    if (this.tagName == "circle") {
                        this.style.display = "block";
                        d3.select("#siblingBox" + child.data.id)
                            .style("display", "block");
                        d3.selectAll('[button="' + child.data.id + '"]')
                            .style("display", "block");
                    }
                }
            });

        d3.selectAll('[siblingLine="' + child.data.id + '"]')
            .style("display", "block");

        d3.select("#minibox" + child.data.id)
            .style("opacity", 1)
            .style("stroke-opacity", 1);
        if (child.data.compressed || child.data.collapsed) {
            d3.select("#minibox" + child.data.id)
                .style("opacity", 0.5)
                .style("stroke-opacity", 0.1);
        }

        if (child.children) {
            expandSubtree(child);
        }
    }
}

function drawSubtree(node, changedX, changedY) {

    let box = document.getElementById("box" + node.data.id);

    let descendants = node.descendants();
    descendants.shift();

    for (let child of descendants) {

        // if (child.parent) {
        //     boxParentDict[child.data.id] = child.parent;
        // }

        for (let d of compressedNodes) {
            if (d.id == child.data.id) {
                let index = compressedNodes.indexOf(d);
                compressedNodes.splice(index, 1);
            }
        }

        if (child.children) {
            boxChildDict[child.data.id] = child.children;
        }

        svgGroup
            .append("rect").datum(child)
            .attr("x", function (d) {
                return (d.data.x - changedX) * visScale;
            })
            .attr("y", function(d) {
                return (d.data.y - changedY) * visScale;
            })
            .attr("width", function(d) {
                d.data._cw = d.data._w;
                return d.data._w * visScale;
            })
            .attr("height", function(d) {
                d.data._ch = d.data._h;
                if (heightDict[d.depth]) {
                    heightDict[d.depth].push(d.data._h);
                } else {
                    heightDict[d.depth] = [d.data._h];
                }
                return 0;
            })
            .attr("class", "box")
            .attr("id", function(d) {
                return "box" + d.data.id;
            })
            .style("fill", "#ffcccc")
            .attr("parent", function(d) { return d.parent ? d.parent.data.id : null; });

        d3.select("#minibox" + child.data.id)
            .style("opacity", 1)
            .style("stroke-opacity", 1);
    }

    calculateYDict(heightDict);

    d3.selectAll(".box")
        .attr("y", function(d) {
            return depthYDict[d.depth] * visScale;
        })
        .attr("height", function(d) {
            return Math.max(...heightDict[d.depth]) * visScale;
        });

    svgGroup.append("rect")
        .attr("x", box.getAttribute("x"))
        .attr("y", parseInt(box.getAttribute("y")) + parseInt(box.getAttribute("height")))
        .attr("width", box.getAttribute("width"))
        .attr("height", 0)
        .style("stroke", "#969696")
        .style("fill", "none")
        .attr("class", "siblingBox")
        .attr("id", "siblingBox" + node.data.id)
        .attr("box", node.data.id)
        .attr("depth", node.depth + 1);

    let childBoxes = document.querySelectorAll('[parent="' + node.data.id + '"]');

    for (let i = 1; i < childBoxes.length; i++) {

        let x = parseInt(childBoxes[i].getAttribute("x")),
            y = parseInt(childBoxes[i].getAttribute("y")),
            height = parseInt(childBoxes[i].getAttribute("height"));

        svgGroup.append("line")
            .style("stroke", "#969696")
            .attr("x1", x)
            .attr("y1", y + height - 8)
            .attr("x2", x)
            .attr("y2", y + height)
            .attr("class", "partialSiblingLine")
            .attr("siblingLine", childBoxes[i].__data__.data.id)
            .attr("depth", node.depth + 1);
        svgGroup.append("line")
            .style("stroke", "#969696")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", y + height)
            .style("opacity", 0.15)
            .attr("class", "siblingLine")
            .attr("siblingLine", childBoxes[i].__data__.data.id)
            .attr("depth", node.depth + 1);
    }

    for (let child of descendants) {

        let elements = child.data.elements;
        for (let i in elements) {
            elements[i].dx = i % child.data._w;
            elements[i].dy = Math.floor(i / child.data._w);
            drawCircle(elements[i]);
        }

        if (child.children) {

            let box = document.getElementById("box" + child.data.id);

            svgGroup.append("rect")
                .attr("x", box.getAttribute("x"))
                .attr("y", parseInt(box.getAttribute("y")) + parseInt(box.getAttribute("height")))
                .attr("width", box.getAttribute("width"))
                .attr("height", 0)
                .style("stroke", "#969696")
                .style("fill", "none")
                .attr("class", "siblingBox")
                .attr("id", "siblingBox" + child.data.id)
                .attr("box", child.data.id)
                .attr("depth", child.depth + 1);

            let childBoxes = document.querySelectorAll('[parent="' + child.data.id + '"]');

            for (let i = 1; i < childBoxes.length; i++) {

                let x = parseInt(childBoxes[i].getAttribute("x")),
                    y = parseInt(childBoxes[i].getAttribute("y")),
                    height = parseInt(childBoxes[i].getAttribute("height"));

                svgGroup.append("line")
                    .style("stroke", "#969696")
                    .attr("x1", x)
                    .attr("y1", y + height - 8)
                    .attr("x2", x)
                    .attr("y2", y + height)
                    .attr("class", "partialSiblingLine")
                    .attr("siblingLine", childBoxes[i].__data__.data.id)
                    .attr("depth", child.depth + 1);
                svgGroup.append("line")
                    .style("stroke", "#969696")
                    .attr("x1", x)
                    .attr("y1", y)
                    .attr("x2", x)
                    .attr("y2", y + height)
                    .style("opacity", 0.15)
                    .attr("class", "siblingLine")
                    .attr("siblingLine", childBoxes[i].__data__.data.id)
                    .attr("depth", child.depth + 1);
            }
        }
    }

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
}

function expandAncestor(id, expandStack) {

    for (let node of compressedNodes) {
        if (node.id == id) {
            expandStack.push(node.id)
        }
    }

    if (boxParentDict[id]) {
        expandAncestor(boxParentDict[id].id, expandStack)
    }
}

function showAllCircles(node) {

    let label = labelDict[node].label;

    let circles = searchDict[label];

    for (let circle of circles) {

        let boxId = circle[Object.keys(circle)[0]];

        let expandStack = [];

        expandAncestor(boxId, expandStack);

        while (expandStack.length > 0) {
            let node = expandStack.pop();

            if (hillDict[node]) {
                let boxData = document.getElementById("box" + hillDict[node]).__data__;
                expandHill(boxData);
                for (let ele of compressionDict[node].elements) {
                    delete hillDict[ele.id];
                }
            }

            constructedHierarchy.each(function (d) {
                if (d.data.id == node) {
                    expansion(d);
                }
            })
        }

        d3.selectAll(".box")
            .style("fill", function() {
                var colour = this.getAttribute("back-colour");
                if (colour) {
                    return colour;
                } else {
                    return "white";
                }
            });
    }
}