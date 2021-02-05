let assNodes, boxCount,
    gridDict,
    gridGroupWidth,
    unionColourDict,
    clickCount, clickCell;

function collectClickedNodes() {

    if (!nodeAss) {
        nodeAss = {};
    }

    minimapCircleDict = {};

    if (selectedNodes.length == 0) {
        selectedAssDict = JSON.parse(JSON.stringify(mouseoverAss));
        colourDict = JSON.parse(JSON.stringify(selectedAssDict));
        redrawByAss();
    } else {

        for (let node of selectedNodes) {
            if (selectedAssDict[node.url]) {
                getNodeAss(node);
            } else {

                showAllCircles(node.url);

                d3.selectAll('[url="' + node.url + '"]')
                    .style("fill", function (d) {
                        return getIdenticalCircleColour(d, this, node);
                    });

                d3.select("circle#" + node.id)
                    .style("stroke", "#4889F4")
                    .style("stroke-width", 3)
                    .transition()
                    .duration(1)
                    .attr("transform", "scale(1)")
                    .attr("grid", "true");
            }
        }

        if (Object.keys(nodeAss).length > 0) {
            showNodes();
        } else {

            d3.selectAll(".circle").style("fill", "#969696");

            d3.selectAll(".propertyLabelText").remove();
            d3.selectAll(".propertyLabelLine").remove();
            d3.selectAll(".propertyLabelBox").remove();

            d3.select("#label_button")
                .style("color", "#969696")
                .style("background-color", "white");
        }

        drawCircleShadow();

        showPathLabels();

        updateMinimap();

        updatePropertyList();
    }
}

function showNodes() {

    colouredCirclePositionDict = {};

    minimapCircleDict = {};

    for (let url of Object.keys(nodeAss)) {
        showAllCircles(url);
    }

    d3.selectAll(".circle")
        .style("fill", function (d) {
            return getCircleColour(d);
        });

    for (let node of selectedNodes) {

        d3.select("circle#" + node.id)
            .style("stroke", "#4889F4")
            .style("stroke-width", 3)
            .attr("grid", "true");

        d3.selectAll('[url="' + node.url + '"]')
            .style("fill", function (d) {
                return getIdenticalCircleColour(d, this, node);
            });
    }

    d3.selectAll(".propertyLabelText").remove();
    d3.selectAll(".propertyLabelLine").remove();
    d3.selectAll(".propertyLabelBox").remove();
    showAssLabels();
    // drawPartialLabels();

    d3.selectAll(".multiNodeLabel").remove();
    pinMultiNodeLabels();

    showNotificationBar();
}

function pinMultiNodeLabels() {

    let assArray = [];

    let input = activeProperty.parentNode.firstChild;
    let propertyAttr = input.getAttribute("propertyArray");

    if (!propertyAttr) {
        assArray.push(input);
    } else {
        let properties = propertyAttr.split(",");
        for (let property of properties) {
            assArray.push(document.getElementById(property));
        }
    }

    selectedNodes.sort(sortByPosition);

    let viewHeight = parseInt(document.getElementById("vis").offsetHeight)
        - parseInt(document.getElementById("minimap").offsetHeight) - 50;

    let distance = calculateDistance();

    assNodes = [];

    for (let node of Object.keys(colourDict)) {
        d3.selectAll('[url="' + node + '"]')
            .each(function (d) {
                assNodes.push(d);
            });
    }

    assNodes.sort(sortByPosition)

    boxCount = Object.keys(colourDict).length;

    gridDict = {};

    clickCount = 0;
    clickCell = null;

    let gridCoordinate = {};
    let widthDict = {};

    let assCounter = 0;
    let xCounter = 0;
    let yCounter = 0;
    let rowCount = 0;

    for (let node of selectedNodes) {

        if (colourDict[node.url]) {
            if (!gridDict[node.url]) {

                let height = (1 + assArray.length) * barEdge;
                let yDistance = distance + (height + 2) * (assCounter - yCounter);
                let y = yDistance + height;

                let gridWidth = boxCount * barEdge;

                let totalWidth = gridWidth * selectedNodes.length;

                if (y > viewHeight && assCounter !== 0 && totalWidth < viewWidth) {

                    if (xCounter == 0) {
                        rowCount = assCounter;
                    }

                    xCounter += 1;

                    yCounter = assCounter;
                    yDistance = distance + (height + 2) * (assCounter - yCounter);
                    y = yDistance + height;

                } else {
                    if (xCounter == 0) {
                        rowCount = selectedNodes.length;
                    }
                }

                let maxWidth = 0;

                let counter = 0;
                let columnCounter = 0;

                for (let i = 0; i < selectedNodes.length; i++) {

                    if (counter < rowCount) {

                        let labelWidth = labelDict[selectedNodes[i].url].bbox.width;
                        maxWidth = Math.max(maxWidth, labelWidth, gridWidth);

                        widthDict[columnCounter] = maxWidth;

                        counter += 1;

                    } else {

                        columnCounter += 1;

                        maxWidth = 0;

                        let labelWidth = labelDict[selectedNodes[i].url].bbox.width;
                        maxWidth = Math.max(maxWidth, labelWidth, gridWidth);

                        widthDict[columnCounter] = maxWidth;

                        counter = 1;
                    }
                }

                gridCoordinate[node.url] = {
                    y: y,
                    yDistance: yDistance
                }

                assCounter += 1;
            }
        }
    }

    let counter = 0;
    let columnCounter = 0;

    let xMove;

    for (let node of selectedNodes) {

        xMove = 0;

        if (counter < rowCount) {

            for (let i = 0; i < columnCounter; i++) {
                xMove += widthDict[i] + 10;
            }
            let width = widthDict[columnCounter];
            let x = xMove + width / 2;
            gridCoordinate[node.url].x = x;

            counter += 1;

        } else {

            columnCounter += 1;

            for (let i = 0; i < columnCounter; i++) {
                xMove += widthDict[i] + 10;
            }
            let width = widthDict[columnCounter];
            let x = xMove + width / 2;
            gridCoordinate[node.url].x = x;

            counter = 1;
        }
    }

    gridGroupWidth = xMove + widthDict[columnCounter];

    for (let node of selectedNodes) {

        if (colourDict[node.url]) {

            d3.select("text#" + node.id).remove();
            d3.selectAll("rect#" + node.id).remove();
            d3.select("line#" + node.id).remove();
            d3.select("line#bar" + node.id).remove();

            let circleDom = document.getElementById(node.id);

            let cx = parseInt(circleDom.getAttribute("cx"));
            let cy = parseInt(circleDom.getAttribute("cy"));

            let visibility = circleDom.style.visibility;
            let display = circleDom.style.display;

            if (!gridDict[node.url]) {

                let str = circleDom.getAttribute("label");

                let x = gridCoordinate[node.url].x;
                let y = gridCoordinate[node.url].y;
                let yDistance = gridCoordinate[node.url].yDistance;

                svgGroup.append("text")
                    .attr("x", x)
                    .attr("y", y - 4)
                    .style("font-size", "12px")
                    .attr("font-weight", "bold")
                    .style("font-family", "sans-serif")
                    .attr("opacity", 0.6)
                    .attr("class", "multiNodeLabel")
                    .attr("type", "gridText")
                    .attr("cx", x)
                    .attr("yPosition", y - 4)
                    .attr("id", "appendedText" + node.id)
                    .attr("text-anchor", "middle")
                    .style("display", display)
                    .style("visibility", visibility)
                    .text(str)
                    .on("mouseover", function () {
                        d3.select("circle#" + node.id)
                            .transition()
                            .duration(300)
                            .attr("transform", "translate(" + -1 * cx + "," + -1 * cy + ")" + " scale(2)");
                        d3.selectAll("line#appendedLine" + node.id)
                            .attr("stroke-opacity", 1);

                        mouseoverClass(node);

                        d3.selectAll('[type=dynamic]')
                            .style("opacity", 0.2);
                        if (classAssDict[node.url]) {
                            d3.selectAll('[name="' + activeProperty.getAttribute("value") + '"]')
                                .style("opacity", 1);
                        }
                    })
                    .on("mouseout", function () {
                        d3.select("circle#" + node.id)
                            .transition()
                            .duration(500)
                            .attr("transform", "scale(1)");
                        d3.selectAll("line#appendedLine" + node.id)
                            .attr("stroke-opacity", 0.1);

                        tooltip.style("display", "none");

                        d3.selectAll('[type=dynamic]')
                            .style("opacity", 1);
                    });

                gridDict[node.url] = {
                    id: node.id,
                    yDistance: yDistance
                };

                drawNodeCell(node, x, cy, yDistance, assArray, display, visibility, cx);

            } else {

                let x2 = gridDict[node.url].x2;
                let y2 = gridDict[node.url].yDistance;

                svgGroup.append("line")
                    .attr("x1", cx)
                    .attr("y1", cy)
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .attr("dx", gridDict[node.url].dx)
                    .attr("dy", (assArray.length - 1) * barEdge)
                    .attr("class", "multiNodeLabel")
                    .attr("type", "line")
                    .attr("xPosition", x2)
                    .attr("yPosition", y2)
                    .attr("id", "appendedLine" + gridDict[node.url].id)
                    .style("stroke", "black")
                    .attr("stroke-width", 0.5)
                    .attr("stroke-opacity", 0.1)
                    .style("display", display)
                    .style("visibility", visibility);
            }
        }
    }

    svgGroup.selectAll(".multiNodeLabel")
        .call(dragNodeGrid)
        .attr("cursor", "move");

    scrollGrid();
}

function calculateDistance() {
    let maxY = 0;
    for (let key of Object.keys(labelGrid)) {
        let y = parseInt(key.split(",")[1]) + labelGrid[key].length;
        maxY = y > maxY ? y : maxY;
    }
    let root = document.getElementById("box0-0").__data__;
    let visHeight = (root.height + 1) * visScale;
    maxY = visHeight > maxY ? visHeight : maxY;
    return maxY;
}

function drawNodeCell(focusNode, cx, cy, yDistance, assArray, display, visibility, x1) {

    let lineX = 0;
    let lineDx = 0;

    for (let assIndex = 0; assIndex < assArray.length; assIndex++) {

        let xCounter = 0;
        let cellDict = {};

        for (let node of assNodes) {

            if (!cellDict[node.url]) {

                let assClass;

                if (assArray.length === 1) {
                    assClass = nodeAss[focusNode.url] ? nodeAss[focusNode.url] : [];
                } else {
                    assClass = nodeAss[focusNode.url][assArray[assIndex].value] ? nodeAss[focusNode.url][assArray[assIndex].value] : [];
                }

                let x = cx + barEdge * (xCounter - boxCount / 2);
                let y = yDistance + assIndex * barEdge;

                svgGroup.append("rect")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", barEdge)
                    .attr("height", barEdge)
                    .attr("dx", barEdge * (xCounter - boxCount / 2))
                    .attr("dy", (assArray.length - assIndex - 1) * barEdge)
                    .attr("position", xCounter)
                    .attr("length", boxCount)
                    .attr("class", "multiNodeLabel")
                    .attr("type", "rect")
                    .attr("cx", cx)
                    .attr("xDistance", x)
                    .attr("yDistance", y)
                    .attr("id", focusNode.id)
                    .attr("ass", assArray[assIndex].value)
                    .attr("assNode", node.url)
                    .style("display", display)
                    .style("visibility", visibility)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5)
                    .attr("fill-opacity", 0.6)
                    .attr("fill", function () {
                        if (node.id === focusNode.id) {
                            lineX = x + barEdge / 2;
                            lineDx = barEdge * (xCounter - boxCount / 2) + barEdge / 2;
                            return "#4889F4";
                        } else if (assClass.includes(node.url)) {
                            return "#fee08b";
                        } else {
                            return "white";
                        }
                    })
                    .on("mouseover", function () {

                        d3.selectAll("line#appendedLine" + focusNode.id)
                            .attr("stroke-opacity", 1);

                        d3.selectAll('[url="' + node.url + '"]')
                            .attr("stroke", "black")
                            .attr("stroke-width", 2)
                            .transition()
                            .duration(300)
                            .attr("transform", function () {
                                return "translate(" + -1 * this.getAttribute("cx") + "," + -1 * this.getAttribute("cy") + ")" + " scale(2)";
                            });
                        d3.selectAll('[miniUrl="' + node.url + '"]')
                            .attr("stroke", "black")
                            .attr("stroke-width", 1.5)
                            .transition()
                            .duration(300)
                            .attr("transform", function () {
                                return "translate(" + -2 * this.getAttribute("cx") + "," + -2 * this.getAttribute("cy") + ")" + " scale(3)";
                            });

                        d3.selectAll('[assNode="' + this.getAttribute("assNode") + '"]')
                            .attr("stroke-width", 2.5);

                        d3.selectAll('[type=dynamic]')
                            .style("opacity", 0.2);
                        d3.selectAll('[name="' + assArray[assIndex].value + '"]')
                            .style("opacity", 1)
                            .style("border-style", "solid");

                        let label;
                        if (node.label.indexOf("http://") == 0) {
                            label = node.label.substr(node.label.lastIndexOf('/') + 1);
                        } else {
                            label = node.label;
                        }

                        let scrollY = $('#ontoplot').scrollTop();
                        let tooltipY = document.getElementById("appendedLine" + focusNode.id).getAttribute("y2") - scrollY;
                        tooltip
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (tooltipY) + "px")
                            .style("display", "inline-block")
                            .style("opacity", .9)
                            .html(
                                label
                            );
                    })
                    .on("mouseout", function () {

                        d3.selectAll("line#appendedLine" + focusNode.id)
                            .attr("stroke-opacity", 0.1);

                        d3.selectAll('[url="' + node.url + '"]')
                            .attr("stroke-width", 0)
                            .transition()
                            .duration(500)
                            .attr("transform", "scale(1)");
                        d3.selectAll('[miniUrl="' + node.url + '"]')
                            .attr("stroke-width", 0)
                            .transition()
                            .duration(500)
                            .attr("transform", "scale(1)");

                        d3.selectAll('[assNode="' + this.getAttribute("assNode") + '"]')
                            .attr("stroke-width", 0.5);

                        d3.selectAll('[type=dynamic]')
                            .style("opacity", 1)
                            .style("border-style", "none");

                        tooltip.style("display", "none");
                    })
                    .on("click", function () {

                        let nodes = searchDict[node.label];
                        let n = clickCount % nodes.length;
                        let circleDom = document.getElementById(Object.keys(nodes[n])[0]);
                        scrollToCircleByGrid(circleDom, this);

                        if (clickCell != node.url) {
                            clickCount = 0;
                            clickCell = node.url;
                        } else {
                            clickCount += 1;
                        }
                    });

                xCounter += 1;
                cellDict[node.url] = [];
            }
        }
    }

    svgGroup.append("line")
        .attr("x1", x1)
        .attr("y1", cy)
        .attr("x2", lineX)
        .attr("y2", yDistance)
        .attr("dx", lineDx)
        .attr("dy", (assArray.length - 1) * barEdge)
        .attr("class", "multiNodeLabel")
        .attr("type", "line")
        .attr("xPosition", lineX)
        .attr("yPosition", yDistance)
        .attr("id", "appendedLine" + focusNode.id)
        .style("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.1)
        .style("display", display)
        .style("visibility", visibility);

    gridDict[focusNode.url].x2 = lineX;
    gridDict[focusNode.url].dx = lineDx;
}

function sortByPosition(a, b) {
    let aCx = parseInt(a.cx);
    let bCx = parseInt(b.cx);
    if (aCx < bCx) {
        return -1;
    } else if (aCx == bCx) {
        let aCy = parseInt(a.cy);
        let bCy = parseInt(b.cy);
        if (aCy < bCy) {
            return -1;
        } else {
            return 1;
        }
    } else {
        return 1;
    }
}

function checkClickedNodes() {

    let commonNodeButtonColour;
    if (document.getElementById("common-node_button")) {
        commonNodeButtonColour = document.getElementById("common-node_button").style.backgroundColor;
    }

    if (document.getElementById("focus-mode_button").style.backgroundColor != "rgb(128, 0, 0)") {
        // go into focus mode

        if (clickedNode) {
            if (selectedAssDict[clickedNode.url]) {
                focusMode();
            } else {
                alert("No Associations Found!")
            }
        } else {

            if (commonNodeButtonColour == "rgb(128, 0, 0)") {
                // show common nodes

                d3.select("#focus-mode_button")
                    .style("color", "white")
                    .style("background-color", "#800000");

                focused = true;

                showCommonNodes();

            } else {
                // show all nodes
                multiFocusMode();
            }
        }

    } else {
        // leave focus mode

        d3.select("#focus-mode_button")
            .style("color", "black")
            .style("background-color", "white");

        focused = false;

        // redrawByAss();

        activeProperty.parentNode.firstChild.checked = true;
        performOperation();

        if (clickedNode) {
            clickOneNode(clickedNode);
        } else {
            collectClickedNodes();
        }

        if (commonNodeButtonColour == "rgb(128, 0, 0)") {

            setTimeout(function () {

                unionColourDict = JSON.parse(JSON.stringify(colourDict));

                showCommonNodes();

                d3.select("#common-node_button")
                    .style("color", "white")
                    .style("background-color", "#800000");

            }, 100);
        }
    }
}

function multiFocusMode() {

    nodeAss = {};
    for (let node of selectedNodes) {
        if (selectedAssDict[node.url]) {
            getNodeAss(node);
        }
    }

    if (Object.keys(selectedAssDict).length > 0) {
        selectedAssDict = nodeAss;

        setTimeout(function () {

            d3.select("#minimapSvg").remove();
            d3.select("#brushSvg").remove();

            d3.select("svg").remove();
            preDraw();

            d3.select("#ontoplot").style("opacity", 1);

            d3.select("#focus-mode_button")
                .style("color", "white")
                .style("background-color", "#800000");

            focused = true;

            let circleDom = document.getElementById(selectedNodes[0].id);
            
            setTimeout(function () {
                showNodes();
                showPathLabels();
                updateMinimap();
                scrollToMiddle(circleDom);
            }, 100);

        }, 10);
    }
}

function scrollGrid() {

    let distance = parseInt(document.getElementById("ontoplot").scrollLeft);

    if (distance >= 0) {

        let gridBoxes = document.querySelectorAll('[type="rect"]');
        for (let box of gridBoxes) {
            let xPosition = parseInt(box.getAttribute("xDistance"));
            box.setAttribute("x", distance + xPosition);
            box.setAttribute("y", box.getAttribute("yDistance"));
        }

        let gridTexts = document.querySelectorAll('[type="gridText"]');
        for (let text of gridTexts) {
            let x = parseInt(text.getAttribute("cx"));
            text.setAttribute("x", distance + x);
            text.setAttribute("y", text.getAttribute("yPosition"));
        }

        let gridLines = document.querySelectorAll('[type="line"]');
        for (let line of gridLines) {
            let x2 = parseInt(line.getAttribute("xPosition"));
            line.setAttribute("x2", distance + x2);
            line.setAttribute("y2", line.getAttribute("yPosition"));
        }
    }
}

function checkCommonNodeButtonStatus() {

    let commonNodeButtonColour;
    if (document.getElementById("common-node_button")) {
        commonNodeButtonColour = document.getElementById("common-node_button").style.backgroundColor;
    }

    if (commonNodeButtonColour == "rgb(128, 0, 0)") {

        showAllNodes();

        d3.select("#common-node_button")
            .style("color", "#000000")
            .style("background-color", "white");

    } else {

        unionColourDict = JSON.parse(JSON.stringify(colourDict));

        showCommonNodes();

        d3.select("#common-node_button")
            .style("color", "white")
            .style("background-color", "#800000");
    }
}

function showCommonNodes() {

    let intersectionNodeAss = {};

    let firstNode = selectedNodes[0].url;

    let selectedNodeArray = selectedNodes.map(a => a.url);

    let input = activeProperty.parentNode.firstChild;
    let propertyAttr = input.getAttribute("propertyArray");
    if (!propertyAttr) {

        for (let i = 1; i < selectedNodes.length; i++) {
            colourDict[firstNode] = colourDict[firstNode].filter(value => -1 !== colourDict[selectedNodes[i].url].indexOf(value));
        }

        intersectionNodeAss[firstNode] = colourDict[firstNode];

        for (let node of selectedNodes) {
            intersectionNodeAss[node.url] = intersectionNodeAss[firstNode];
        }

        for (let node of intersectionNodeAss[firstNode]) {
            if (!selectedNodeArray.includes(node)) {
                intersectionNodeAss[node] = selectedNodes.map(a => a.url);
            }
        }

    } else {

        for (let key of Object.keys(colourDict[firstNode])) {
            for (let i = 1; i < selectedNodes.length; i++) {
                if (colourDict[selectedNodes[i].url][key]) {
                    colourDict[firstNode][key] = colourDict[firstNode][key].filter(value => -1 !== colourDict[selectedNodes[i].url][key].indexOf(value));
                }
            }
        }

        intersectionNodeAss[firstNode] = colourDict[firstNode];

        for (let node of selectedNodes) {
            intersectionNodeAss[node.url] = intersectionNodeAss[firstNode]
        }

        for (let key of Object.keys(intersectionNodeAss[firstNode])) {
            for (let node of intersectionNodeAss[firstNode][key]) {
                if (!selectedNodeArray.includes(node)) {
                    if (intersectionNodeAss[node]) {
                        intersectionNodeAss[node][key] = selectedNodes.map(a => a.url);
                    } else {
                        intersectionNodeAss[node] = {};
                        intersectionNodeAss[node][key] = selectedNodes.map(a => a.url);
                    }
                }
            }
        }
    }

    minimapCircleDict = {};

    if (focused) {

        selectedAssDict = JSON.parse(JSON.stringify(intersectionNodeAss));
        colourDict = JSON.parse(JSON.stringify(selectedAssDict));
        mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));

        multiFocusMode();

    } else {

        colourDict = JSON.parse(JSON.stringify(intersectionNodeAss));
        mouseoverAss = JSON.parse(JSON.stringify(intersectionNodeAss));

        d3.selectAll(".circle")
            .style("fill", function (d) {
                return getCircleColour(d);
            });

        for (let node of selectedNodes) {
            d3.selectAll('[url="' + node.url + '"]')
                .style("fill", function (d) {
                    return getIdenticalCircleColour(d, this, node);
                });
        }

        d3.selectAll(".propertyLabelText").remove();
        d3.selectAll(".propertyLabelLine").remove();
        d3.selectAll(".propertyLabelBox").remove();
        showAssLabels();
        // drawPartialLabels();

        d3.selectAll(".multiNodeLabel").remove();
        pinMultiNodeLabels();
    }

    updateMinimap();
}

function showAllNodes() {

    minimapCircleDict = {};

    if (focused) {

        selectedAssDict = JSON.parse(JSON.stringify(unionColourDict));
        colourDict = JSON.parse(JSON.stringify(selectedAssDict));
        mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));

        multiFocusMode();

    } else {

        colourDict = JSON.parse(JSON.stringify(unionColourDict));
        mouseoverAss = JSON.parse(JSON.stringify(unionColourDict));

        d3.selectAll(".circle")
            .style("fill", function (d) {
                return getCircleColour(d);
            });

        for (let node of selectedNodes) {
            d3.selectAll('[url="' + node.url + '"]')
                .style("fill", function (d) {
                    return getIdenticalCircleColour(d, this, node);
                });
        }

        d3.selectAll(".propertyLabelText").remove();
        d3.selectAll(".propertyLabelLine").remove();
        d3.selectAll(".propertyLabelBox").remove();
        showAssLabels();
        // drawPartialLabels();

        d3.selectAll(".multiNodeLabel").remove();
        pinMultiNodeLabels();
    }

    updateMinimap();
}