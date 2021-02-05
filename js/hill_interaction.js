function expandHill(node) {

    let box = document.getElementById("box" + node.data.id);
    let boxX = parseInt(box.getAttribute("x")),
        boxY = parseInt(box.getAttribute("y")),
        height =  parseInt(box.getAttribute("height"));

    changedWidth = (node.data.elements.length - 1) * visScale;

    moveRightSubtrees(node);

    let firstChild = null;

    d3.select("#box" + node.data.id)
        .style("visibility", "hidden");
    d3.selectAll('[box="' + node.data.id + '"]')
        .style("visibility", "hidden");
    d3.selectAll('[siblingLine="' + node.data.id + '"]')
        .each(function() {
            firstChild = this;
        })
        .style("visibility", "hidden");

    for (let i in node.data.elements) {

        delete hillDict[node.data.elements[i].id];

        let originalNode = null;
        reserveTree.each(function(d) {
            if (d.data.id == node.data.elements[i].id) {
                originalNode = d;
            }
        })

        originalNode.data._cw = originalNode.data._w;
        originalNode.data._ch = 1;

        boxParentDict[originalNode.data.id] = originalNode.parent.data;

        node.parent.children.push(originalNode);

        let x = boxX + i * visScale;

        svgGroup
            .append("rect").datum(originalNode)
            .attr("x", x)
            .attr("y", boxY)
            .attr("width", visScale)
            .attr("height", visScale)
            .attr("class", "box")
            .attr("id", function(d) {
                return "box" + d.data.id;
            })
            .style("fill", "#ffcccc")
            .attr("parent", function(d) { return d.parent ? d.parent.data.id : null; })
            .moveToBack();

        if (originalNode.children) {

            originalNode._children = originalNode.children;
            originalNode.children = null;

            originalNode.data.compressed = true;

            if (originalNode.data._w > 1) {
                drawTriangle(originalNode.data.elements[0]);
            } else {
                drawBar(originalNode.data.elements[0]);
            }
        } else {
            if (originalNode.data.elements.length > 1) {
                originalNode.data.compressed = true;
                drawSquare(originalNode.data.elements[0]);
            } else {
                let ele = originalNode.data.elements[0];
                ele.dx = 0;
                ele.dy = 0;
                drawCircle(ele);

                d3.select("#minibox" + ele.box)
                    .style("opacity", 1)
                    .style("stroke-opacity", 1);
            }
        }

        if (i > 0 || firstChild) {
            svgGroup.append("line")
                .style("stroke", "#969696")
                .attr("x1", x)
                .attr("y1", boxY + height - 8)
                .attr("x2", x)
                .attr("y2", boxY + height)
                .attr("class", "partialSiblingLine")
                .attr("siblingLine", node.data.elements[i].id)
                .attr("depth", node.data.elements[i].depth);
            svgGroup.append("line")
                .style("stroke", "#969696")
                .attr("x1", x)
                .attr("y1", boxY)
                .attr("x2", x)
                .attr("y2", boxY + height)
                .style("opacity", 0.15)
                .attr("class", "siblingLine")
                .attr("siblingLine", node.data.elements[i].id)
                .attr("depth", node.data.elements[i].depth);
        }
    }

    changeAncestor(node);

    drawCollapseHillButton(node);

    moveGlyphs();

    resizeSVG();

    // showPathLabels();

    updateLabel();

    if (!clickedNode && selectedNodes.length > 0) {
        d3.selectAll(".multiNodeLabel").remove();
        pinMultiNodeLabels();
    }

    updateBrush();

    updateMinimap();

    if (clickedNode) {
        updateAssArrow();
        drawHiddenCircle();
    }
}

function drawCollapseHillButton(node) {

    let box = document.getElementById("box" + node.data.id);
    let x = parseInt(box.getAttribute("x"));

    let parentBox = document.getElementById("box" + node.parent.data.id);
    let y = parseInt(parentBox.getAttribute("y"));
    let width = node.data.elements.length * visScale;
    let height = parseInt(parentBox.getAttribute("height"));

    svgGroup.append("rect").datum(node)
        .attr("x", x)
        .attr("y", y + 2)
        .attr("width", width - 2)
        .attr("height", height - 4)
        .attr("fill", "white")
        .attr("class", "hillButton")
        .attr("id", "hillButton" + node.parent.data.id)
        .attr("button", node.parent.data.id)
        .on("click", function(d) {

            diffClick(
                this,
                function(){

                },
                function(){

                    beforeCollapseHill(d);

                    setTimeout(function() {

                        d3.selectAll('[button="' + d.parent.data.id + '"]')
                        .remove();

                    let widthSum = 0;

                    d3.select("#box" + d.data.id)
                        .style("visibility", "visible");
                    d3.selectAll('[box="' + d.data.id  + '"]')
                        .style("visibility", "visible");
                    d3.selectAll('[siblingLine="' + d.data.id  + '"]')
                        .style("visibility", "visible");

                    for (let ele of d.data.elements) {

                        hillDict[ele.id] = d.data.id;

                        let box = document.getElementById("box" + ele.id);

                        let data = box.__data__;

                        widthSum += parseInt(box.getAttribute("width"));

                        // if (data.children) {
                            removeSubtree(data);
                        // }

                        // if (data._children) {
                        //     reserveTree.each(function(treeNode) {
                        //         if (treeNode.data.id == data.data.id) {
                        //             treeNode.children = treeNode._children;
                        //             treeNode._children = null;
                        //         }
                        //     })
                        // }

                        if (ele.elements.length > 1) {
                            let index = heightDict[ele.depth].indexOf(ele._h);
                            heightDict[ele.depth].splice(index, 1);
                        }

                        d3.select("#box" + ele.id)
                            .remove();

                        d3.selectAll('[box="' + ele.id  + '"]')
                            .remove();

                        d3.selectAll('[siblingLine="' + ele.id + '"]')
                            .remove();

                        d3.select("#minibox" + ele.id)
                            .style("opacity", 0.5)
                            .style("stroke-opacity", 0.1);

                        let dictIndex = boxChildDict[d.parent.data.id].indexOf(ele);
                        boxChildDict[d.parent.data.id].splice(dictIndex, 1);

                        compressedNodes.push(ele);
                    }

                    changedWidth = visScale - widthSum;

                    changeAncestor(d);

                    moveRightSubtrees(d);

                    changeLowerSubtrees();

                    moveGlyphs();

                    resizeSVG();

                    // showPathLabels();

                    updateLabel();

                    if (!clickedNode && selectedNodes.length > 0) {
                        d3.selectAll(".multiNodeLabel").remove();
                        pinMultiNodeLabels();
                    }

                    updateBrush();

                    updateMinimap();

                    if (clickedNode) {
                        updateAssArrow();
                        drawHiddenCircle();
                    }

                    },500);

                    afterCollapseHill(d);
                })
        });

    svgGroup.append("rect").datum(node)
        .attr("x", x + 4)
        .attr("y", y + height - 5)
        .attr("width", width - 8)
        .attr("height", 1)
        .style("fill", "#969696")
        .attr("class", "hillButtonLine")
        .attr("id", "hillButtonLine" + node.parent.data.id + "up")
        .attr("button", node.parent.data.id);
    svgGroup.append("rect").datum(node)
        .attr("x", x + 1)
        .attr("y", y + height - 3)
        .attr("width", width - 2)
        .attr("height", 1)
        .style("fill", "#969696")
        .attr("class", "hillButtonLine")
        .attr("id", "hillButtonLine" + node.parent.data.id + "down")
        .attr("button", node.parent.data.id);

    d3.select("text#" + node.parent.data.elements[0].id)
        .moveToFront();

    if (parseInt(document.getElementById("box" + node.parent.data.id).getAttribute("width")) == width) {
        d3.select("circle#" + node.parent.data.elements[0].id)
            .moveToFront();
    }
}

function removeSubtree(node) {

    if (node._children) {

        for (let child of node._children) {

            if (heightDict[child.depth].length > 1) {
                let index = heightDict[child.depth].indexOf(child.data._ch);
                heightDict[child.depth].splice(index, 1);
            }

            d3.select("#box" + child.data.id)
                .remove();

            d3.selectAll('[box="' + child.data.id + '"]')
                .remove();

            d3.select("#siblingBox" + child.data.id)
                .remove();

            d3.selectAll('[siblingLine="' + child.data.id + '"]')
                .remove();

            d3.select("#minibox" + child.data.id)
                .style("opacity", 0.5)
                .style("stroke-opacity", 0.1);

            removeSubtree(child);
        }

        reserveTree.each(function(treeNode) {
            if (treeNode.data.id == node.data.id) {
                treeNode.children = treeNode._children;
                treeNode._children = null;
            }
        })
    }

    if (node.children) {

        for (let child of node.children) {

            if (heightDict[child.depth].length > 1) {
                let index = heightDict[child.depth].indexOf(child.data._ch);
                heightDict[child.depth].splice(index, 1);
            }

            d3.select("#box" + child.data.id)
                .remove();

            d3.selectAll('[box="' + child.data.id + '"]')
                .remove();

            d3.select("#siblingBox" + child.data.id)
                .remove();

            d3.selectAll('[siblingLine="' + child.data.id + '"]')
                .remove();

            d3.select("#minibox" + child.data.id)
                .style("opacity", 0.5)
                .style("stroke-opacity", 0.1);

            removeSubtree(child);
        }
    }
}