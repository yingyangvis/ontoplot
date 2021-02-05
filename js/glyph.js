function drawCircle(node) {

    let box = document.getElementById("box" + node.box);

    circle = svgGroup
        .append("circle").datum(node)
        .attr("cx", parseInt(box.getAttribute("x")) + node.dx * visScale + visScale / 2)
        .attr("cy", parseInt(box.getAttribute("y")) + node.dy * visScale + visScale / 2)
        .attr("r", visScale / 5)
        .attr("class", "circle")
        .attr("id", node.id)
        .attr("url", node.url)
        .attr("box", node.box)
        .attr("label", function (d) {
            if (d.label.indexOf("http://") == 0) {
                return d.label.substr(d.label.lastIndexOf('/') + 1);
            } else {
                return d.label;
            }
        })
        .style("fill", function (d) {
            return getCircleColour(d, this);
        })
        .style("stroke", function (d) {
            if (clickedNode) {
                if (d.id == clickedNode.id) {
                    d3.selectAll(".hiddenCircle").remove();
                    return "#4889F4";
                }
            }
        })
        .style("stroke-width", function (d) {
            if (clickedNode) {
                if (d.id == clickedNode.id) {
                    return 3;
                }
            }
        })
        .on("mouseover", function (d) {

            mouseoverClass(d);

            d3.selectAll('[assNode="' + d.url + '"]')
                .attr("stroke-width", 2.5);

            d3.selectAll('[type=dynamic]')
                .style("opacity", 0.2);
            if (classAssDict[d.url]) {
                // for (let property of Object.keys(classAssDict[d.url])) {
                    d3.selectAll('[name="' + activeProperty.getAttribute("value") + '"]')
                        .style("opacity", 1);
                // }
            }

            d3.select(this)
                .transition()
                .duration(300)
                .attr("transform", "translate(" + -1 * this.getAttribute("cx") + "," + -1 * this.getAttribute("cy") + ")" + " scale(2)");
        })
        .on("mouseout", function (d) {

            tooltip.style("display", "none");

            d3.selectAll('[assNode="' + d.url + '"]')
                .attr("stroke-width", 0.5);

            d3.selectAll('[type=dynamic]')
                .style("opacity", 1);

            d3.select(this)
                .transition()
                .duration(500)
                .attr("transform", "scale(1)");
        })
        .on("click", function (d) {

            d3.selectAll(".searchResult").style("color", "#969696");
            d3.select("#searchPointer").remove();

            if (d3.event.shiftKey) {

                document.getSelection().removeAllRanges();

                d3.select("#focus-mode_button")
                    .style("color", "black")
                    .style("background-color", "white");

                if (focused) {
                    selectedAssDict = JSON.parse(JSON.stringify(mouseoverAss));
                    colourDict = JSON.parse(JSON.stringify(selectedAssDict));
                }

                focused = false;

                collapseInfoPanel();
                d3.selectAll(".classInfo").remove();

                d3.selectAll(".assArrow").remove();
                clickedNode = null;
                d3.selectAll(".form-check").style("background-color", "#f1f1f1");

                let selected = false;
                for (let node of selectedNodes) {
                    if (node.id == d.id) {
                        selected = true;
                        let index = selectedNodes.indexOf(node);
                        selectedNodes.splice(index, 1);
                    }
                }

                let gridded = this.getAttribute("grid");

                if (selected && gridded == "true") {

                    d3.select("circle#" + d.id)
                        .style("fill", "#969696")
                        .style("stroke-width", 0);

                    if (colourDict[d.url]) {

                        delete nodeAss[d.url];

                        d3.select("text#appendedText" + d.id).remove();
                        d3.selectAll("rect#" + d.id).remove();
                        d3.select("line#appendedLine" + d.id).remove();

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
                            for (let node of colourDict[d.url]) {
                                d3.selectAll('[url="' + node + '"]')
                                    .style("fill", "#969696");
                                delete nodeAss[node];
                            }
                        } else {
                            for (let property of checkedProperties) {
                                if (colourDict[d.url][property.value]) {
                                    for (let node of colourDict[d.url][property.value]) {
                                        d3.selectAll('[url="' + node + '"]')
                                            .style("fill", "#969696");
                                        delete nodeAss[node];
                                    }
                                }
                            }
                        }
                    }

                } else {
                    selectedNodes.push(d);
                }

                collectClickedNodes();

            } else {

                diffClick(
                    this,
                    // single click
                    function () {

                        selectedNodes = [];
                        selectedNodes.push(d);

                        minimapCircleDict = {};

                        d3.selectAll(".multiNodeLabel").remove();

                        d3.selectAll(".assArrow").remove();

                        checkNodeStatus(d);

                        updateMinimap();
                    },
                    // double click
                    function () {
                        tooltip.style("display", "none");
                        let boxData = document.getElementById("box" + d.box).__data__;
                        if (boxData.children || boxData.data.elements.length > 1) {
                            beforeCollapse(boxData);
                            setTimeout(function() {
                                collapse(boxData);
                            }, 500);
                            afterCollapse(boxData);
                        }
                    }
                )
            }
        });
}

function drawSquare(node) {

    let box = document.getElementById("box" + node.box);
    let boxX = parseInt(box.getAttribute("x")),
        boxY = parseInt(box.getAttribute("y"));

    square = svgGroup
        .append("rect").datum(node)
        .attr("x", boxX + visScale / 2 - visScale / 5)
        .attr("y", boxY + visScale / 2 - visScale / 5)
        .attr("height", visScale / 2.5)
        .attr("width", visScale / 2.5)
        .attr("class", "square")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("fill", "#969696")
        .attr("filter", function () {

            if (box.__data__.data.elements) {

                let assNodes = [];
                for (let ele of box.__data__.data.elements) {
                    if (colourDict[ele.url]) {
                        assNodes.push(ele);
                    }
                }

                let max = 0;
                for (let node of assNodes) {
                    if (document.getElementById(node.id)) {
                        let strength = document.getElementById(node.id).getAttribute("assStrength");
                        max = strength > max ? strength : max;
                    }
                }

                let filter;
                if (max == maxAssValue) {
                    filter = "#a50026";
                } else {
                    filter = colourScale(max);
                }

                if (assNodes.length > 0) {
                    return "url(" + filter + ")";
                } else {
                    return "null";
                }
            }

        })
        .on("mouseover", function (d) {

            tooltip.html("");

            // landscapeType = getSelectionByName("a_landscape");

            // if (landscapeType == "miniplot") {
            drawSquareLanscape(d);
            // } else {
            //     getTreemapData(d, "square");
            //     drawTreemap(d);
            // }

            tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 40) + "px")
                .style("display", "inline-block")
                .style("opacity", .9);

            let x = -0.5 * this.getAttribute("x") - 3;
            let y = -0.5 * this.getAttribute("y") - 3;
            d3.select(this)
                .transition()
                .duration(300)
                .attr("transform", "translate(" + x + "," + y + ")" + " scale(1.5)");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this)
                .transition()
                .duration(300)
                .attr("transform", "scale(1)")
        })
        .on("click", function (d) {

            diffClick(
                this,
                function () {
                },
                function () {
                    tooltip.style("display", "none");
                    let boxData = document.getElementById("box" + d.box).__data__;
                    beforeExpand(boxData);
                    setTimeout(function() {
                        expansion(boxData);
                        afterExpand(boxData);
                    }, 500);
                })
        })

    svgGroup
        .append("text").datum(node)
        .attr("x", boxX + visScale / 2)
        .attr("y", boxY + visScale + 4)
        .attr("class", "subtreeLabel")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .style("fill", "#969696")
        .attr("text-anchor", "middle")
        .text(box.__data__.data.elements.length);
}

function drawBar(node) {

    let box = document.getElementById("box" + node.box);
    let boxX = parseInt(box.getAttribute("x")),
        boxY = parseInt(box.getAttribute("y"));

    bar = svgGroup
        .append("rect").datum(node)
        .attr("x", boxX + visScale / 2 - visScale / 8)
        .attr("y", boxY + visScale / 2 - visScale / 5)
        .attr("height", visScale / 2.5)
        .attr("width", visScale / 4)
        .attr("class", "bar")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("fill", "#969696")
        .attr("filter", function () {

            let assNodes = [];
            getAssChildren(box.__data__, assNodes);
            if (colourDict[box.__data__.data.elements[0].url]) {
                assNodes.push(box.__data__.data.elements[0]);
            }

            let max = 0;
            for (let node of assNodes) {
                if (document.getElementById(node.id)) {
                    let strength = document.getElementById(node.id).getAttribute("assStrength");
                    max = strength > max ? strength : max;
                }
            }

            let filter;
            if (max == maxAssValue) {
                filter = "#a50026";
            } else {
                filter = colourScale(max);
            }

            if (assNodes.length > 0) {
                return "url(" + filter + ")";
            } else {
                return "null";
            }
        })
        .on("mouseover", function (d) {

            tooltip.html("");

            // landscapeType = getSelectionByName("a_landscape");
            // if (landscapeType == "miniplot") {
            drawBarLandscape(d);
            // } else {
            //     getTreemapData(d, "bar");
            //     drawTreemap(d);
            // }

            tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 40) + "px")
                .style("display", "inline-block")
                .style("opacity", .9);

            let x = -0.5 * this.getAttribute("x") - 2;
            let y = -0.5 * this.getAttribute("y") - 3;
            d3.select(this)
                .transition()
                .duration(300)
                .attr("transform", "translate(" + x + "," + y + ")" + " scale(1.5)");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this)
                .transition()
                .duration(300)
                .attr("transform", " scale(1)")
        })
        .on("click", function (d) {

            diffClick(
                this,
                function () {
                },
                function () {
                    tooltip.style("display", "none");
                    let boxData = document.getElementById("box" + d.box).__data__;
                    beforeExpand(boxData);
                    setTimeout(function() {
                        expansion(boxData);
                        afterExpand(boxData);
                    }, 500);
                })
        })

    svgGroup
        .append("text").datum(node)
        .attr("x", boxX + visScale / 2)
        .attr("y", boxY + visScale + 4)
        .attr("class", "subtreeLabel")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .style("fill", "#969696")
        .attr("text-anchor", "middle")
        .text(box.__data__.data.descendantCount + 1);
}

function createTriangleShape(size) {
    return d3.symbol().size(size).type(d3.symbolTriangle);
}

function drawTriangle(node) {

    let box = document.getElementById("box" + node.box);
    let boxX = parseInt(box.getAttribute("x")),
        boxY = parseInt(box.getAttribute("y"));

    let triangleSize = visScale * visScale / 10;
    let triangleShape = createTriangleShape(triangleSize);

    triangle = svgGroup
        .append("path").datum(node)
        .attr("transform", function () {
            let x = boxX + visScale / 2,
                y = boxY + visScale / 1.8;
            return "translate(" + x + ", " + y + ")";
        })
        .attr("d", triangleShape)
        .attr("class", "triangle")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("fill", "#969696")
        .attr("filter", function () {

            let assNodes = [];
            getAssChildren(box.__data__, assNodes);
            if (colourDict[box.__data__.data.elements[0].url]) {
                assNodes.push(box.__data__.data.elements[0]);
            }

            let max = 0;
            for (let node of assNodes) {
                if (document.getElementById(node.id)) {
                    let strength = document.getElementById(node.id).getAttribute("assStrength");
                    max = strength > max ? strength : max;
                }
            }

            let filter;
            if (max == maxAssValue) {
                filter = "#a50026";
            } else {
                filter = colourScale(max);
            }

            if (assNodes.length > 0) {
                return "url(" + filter + ")";
            } else {
                return "null";
            }
        })
        .on("mouseover", function (d) {

            tooltip.html("");

            // landscapeType = getSelectionByName("a_landscape");

            // if (landscapeType == "miniplot") {
            drawTriangleLandscape(d);
            // } else {
            //     getTreemapData(d, "triangle");
            //     drawTreemap(d);
            // }

            tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 40) + "px")
                .style("display", "inline-block")
                .style("opacity", .9);

            let biggerTriangle = visScale * visScale / 4;
            d3.select(this)
                .transition()
                .duration(300)
                .attr("d", createTriangleShape(biggerTriangle));
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this)
                .transition()
                .duration(300)
                .attr("d", triangleShape);
        })
        .on("click", function (d) {

            diffClick(
                this,
                function () {
                },
                function () {
                    tooltip.style("display", "none");
                    let boxData = document.getElementById("box" + d.box).__data__;
                    beforeExpand(boxData);
                    setTimeout(function() {
                        expansion(boxData);
                        afterExpand(boxData);
                    }, 500);
                })
        });

    svgGroup
        .append("text").datum(node)
        .attr("x", boxX + visScale / 2)
        .attr("y", boxY + visScale + 4)
        .attr("class", "subtreeLabel")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .style("fill", "#969696")
        .attr("text-anchor", "middle")
        .text(box.__data__.data.descendantCount + 1);
}

function createHillShape(points) {
    let lineGenerator = d3.line();
    return lineGenerator(points);
}

function drawHill(node) {

    let box = document.getElementById("box" + node.box);
    let boxX = parseInt(box.getAttribute("x")),
        boxY = parseInt(box.getAttribute("y"));

    let hillPoints = [
        [-3, -7],
        [-9, 3.5],
        [9, 3.5],
        [3, -7],
        [0, -2]
    ];
    let hillShape = createHillShape(hillPoints);

    hill = svgGroup
        .append("path").datum(node)
        .attr("transform", function () {
            let x = boxX + visScale / 2,
                y = boxY + visScale / 1.8;
            return "translate(" + x + ", " + y + ")";
        })
        .attr("d", hillShape)
        .attr("class", "hill")
        .attr("box", node.box)
        .style("fill", "#969696")
        .on("mouseover", function (d) {

            tooltip.html("");

            // landscapeType = getSelectionByName("a_landscape");

            // if (landscapeType == "miniplot") {
            drawHillLandscape(d);
            // } else {
            //     getTreemapData(d, "hill");
            //     drawTreemap(d);
            // }

            tooltip
                .style("left", (d3.event.pageX + 20) + "px")
                .style("top", (d3.event.pageY - 40) + "px")
                .style("display", "inline-block")
                .style("opacity", .9);

            let biggerHill = [
                [-3, -11],
                [-13, 6.5],
                [13, 6.5],
                [3, -11],
                [0, -6]
            ];
            d3.select(this)
                .transition()
                .duration(300)
                .attr("d", createHillShape(biggerHill));
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this)
                .transition()
                .duration(300)
                .attr("d", hillShape);
        })
        .on("click", function (d) {

            diffClick(
                this,
                function () {
                },
                function () {
                    tooltip.style("display", "none");
                    let boxData = document.getElementById("box" + d.box).__data__;
                    beforeExpandHill(boxData);
                    setTimeout(function() {
                        expandHill(boxData);
                        afterExpandHill(boxData);
                    }, 500);
                })
        });

    svgGroup
        .append("text").datum(node)
        .attr("x", boxX + visScale / 2)
        .attr("y", boxY + visScale + 4)
        .attr("class", "subtreeLabel")
        .attr("id", "glyph" + node.box)
        .attr("box", node.box)
        .style("font-family", "sans-serif")
        .style("font-size", "13px")
        .style("fill", "#969696")
        .attr("text-anchor", "middle")
        .text(function () {
            let count = 0;
            for (let ele of box.__data__.data.elements) {
                if (ele.descendantCount == 0) {
                    count += ele.elements.length;
                } else {
                    count += ele.descendantCount + 1;
                }
            }
            return count;
        });
}

// for pie glyph
function drawPies() {

    let arc = d3.arc()
        .outerRadius(visScale / 5)
        .innerRadius(0);

    let pie = d3.pie()
        .sort(null)
        .value(function() { return 1; });

    let points = svgGroup.selectAll("g")
        .data(pies)
        .enter()
        .append("g")
        .attr("class", "pies")
        .attr("transform", function(d) {
            return "translate(" + d.getAttribute("cx") + "," + d.getAttribute("cy") + ")";
        });

    let pieDoms = points.selectAll(".pies")
        .data(function(d) {
            let node = d.getAttribute("url");

            let assStrengthArray = [];
            for (let ass of document.querySelectorAll('input[name="a_property"]:checked')) {
                if (colourDict[node][ass.value]) {
                    assStrengthArray.push(colourDict[node][ass.value].length);
                } else {
                    assStrengthArray.push(0);
                }
            }
            return pie(assStrengthArray);
        })
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("id", function(d) {
            return d;
        });

    pieDoms.append("path")
        .attr("d", arc)
        .attr("fill", function(d) {
            if (d.data == 0) {
                return "white"
            } else {
                if (d.data == maxAssValue) {
                    return "#a50026";
                }
                return colourScale(d.data);
            }
        });
}