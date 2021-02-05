var constructedHierarchy,
    margin, visScale,
    svg, svgGroup,
    box, circle, square, bar, triangle, hill, pies,
    boxChildDict, minimapCircleDict,
    colouredCirclePositionDict, boxPositionDict;

function drawOntoplot(hierarchyData) {

    onReady(function () {
        show("ontoplot", true);
        show("loading", false);
    });

    margin = {top: 10, right: 20, bottom: 20, left: 0};

    visScale = 25;

    let width = hierarchyData._w * visScale + 100;
    let height = 0;
    for (let key in heightDict) {
        if (heightDict[key].length > 0) {
            height += Math.max(...heightDict[key]);
        }
    }
    height = height * visScale;

    svg = d3.select("#ontoplot").append("svg")
        .attr("id", "svgElement")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgGroup = svg.append("g")
        .attr("class", "elementsContainer")
        .attr("transform", "translate(10)");

    box = svgGroup.selectAll("rect");
    circle = svgGroup.selectAll("circle");

    pies = [];

    initShadow();

    constructedHierarchy = d3.hierarchy(hierarchyData, function (d) {
        return d.children;
    });

    boxChildDict = {};
    minimapCircleDict = {};

    box = box
        .data(constructedHierarchy.descendants())
        .enter().append("rect")
        .attr("x", function (d) {
            if (d.children) {
                boxChildDict[d.data.id] = d.children;
            }
            return d.data.x * visScale;
        })
        .attr("y", function (d) {
            return d.data.y * visScale;
        })
        .attr("width", function (d) {
            if (d.data.compressed) {
                d.data._ch = 1;
                d.data._cw = d.data._w;
                return visScale;
            } else if (d.data.changedWidth) {
                d.data._ch = d.data._h;
                d.data._cw = d.data._w - d.data.changedWidth;
                return (d.data._w - d.data.changedWidth) * visScale;
            } else {
                d.data._ch = d.data._h;
                d.data._cw = d.data._w;
                return d.data._w * visScale;
            }
        })
        .attr("height", function (d) {
            return Math.max(...heightDict[d.depth]) * visScale;
        })
        .attr("depth", function (d) {
            return d.depth;
        })
        .attr("parent", function (d) {
            return d.parent ? d.parent.data.id : null;
        })
        .attr("class", "box")
        .attr("id", function (d) {
            return "box" + d.data.id;
        })
        .attr("leaf", function (d) {
            let leaf = true;
            if (d.data.children || d.data._children) {
                leaf = false;
            }
            return leaf;
        })
        .attr("dummyLeaf", function (d) {
            return d.data.dummyLeafChildBox == true ? true : false;
        })
        .attr("dummyBox", function (d) {
            return d.data.dummyChildBox == true ? true : false;
        })
        .style("fill", "white")
        .on("mouseover", function (d) {
            if (this.getAttribute("leaf") == "false" && d.children) {
                mouseoverClass(d.data.elements[0], "box", true);
            }
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("click", function (d) {

                diffClick(
                    this,
                    // single click
                    function () {
                    },
                    // double click
                    function () {
                        tooltip.style("display", "none");

                        if (d.children || d.data.elements.length > 1 && !d.data.dummyChildBox) {
                            beforeCollapse(d);
                            setTimeout(function() {
                                collapse(d);
                            }, 500);
                            afterCollapse(d);
                        }
                    }
                )
        });

    colouredCirclePositionDict = {};

    boxPositionDict = {};

    // drawPartialHierarchy();

    // d3.select("rect#box0-0").style("stroke", "#969696");


    for (let node of circleData) {
        drawCircle(node);
    }

    for (let node of squareData) {
        drawSquare(node);
    }

    for (let node of barData) {
        drawBar(node);
    }

    for (let node of triangleData) {
        drawTriangle(node);
    }

    for (let node of hillData) {
        drawHill(node);
    }


    // // for pie glyph
    // if (pies.length > 0) {
    //     drawPies();
    // }


    drawBox(hierarchyData);

    resizeSVG();
}

function diffClick(ele, onsingle, ondouble) {
    if (ele.getAttribute("dblclick") == null) {
        ele.setAttribute("dblclick", 1);
        setTimeout(function () {
            if (ele.getAttribute("dblclick") == 1) {
                onsingle();
            }
            ele.removeAttribute("dblclick");
        }, 300);
    } else {
        ele.removeAttribute("dblclick");
        ondouble();
    }
}

function drawBox(node) {

    d3.select("rect#box0-0").style("stroke", "#969696");

    if (node.children) {

        let childBoxes = [];
        for (let child of node.children) {
            let box = document.getElementById("box" + child.id);
            if (box.getAttribute("width") > 0) {
                childBoxes.push(box);
            }
            if (child.children) {
                drawBox(child);
            }
        }

        childBoxes.sort(sortByX);

        let y = parseInt(childBoxes[0].getAttribute("y")),
            height = parseInt(childBoxes[0].getAttribute("height"));

        let box = document.getElementById("box" + node.id),
            x = box.getAttribute("x");

        svgGroup.append("rect")
            .attr("x", x)
            .attr("y", parseInt(box.getAttribute("y")) + parseInt(box.getAttribute("height")))
            .attr("width", box.getAttribute("width"))
            .attr("height", height)
            .style("stroke", "#969696")
            .style("fill", "none")
            .attr("class", "siblingBox")
            .attr("id", "siblingBox" + node.id)
            .attr("depth", node.depth + 1);

        if (boxPositionDict.hasOwnProperty(x)) {
            boxPositionDict[x].push(box);
        } else {
            boxPositionDict[x] = [box];
        }

        for (let i = 1; i < childBoxes.length; i++) {

            let x = parseInt(childBoxes[i].getAttribute("x"));

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
    }
}

function sortByX(a, b) {
    if (parseInt(a.getAttribute("x")) > parseInt(b.getAttribute("x"))) {
        return 1;
    } else {
        return -1;
    }
}

function resizeSVG() {

    let rootWidth = parseInt(document.getElementById("box0-0").getAttribute("width"));

    let width = rootWidth + $("#vis").width() - 100;

    let boxes = document.getElementsByClassName("box");
    let maxDepth = 0;
    for (let box of boxes) {
        if (box.getAttribute("width") != 0) {
            let depth = box.getAttribute("depth")
            maxDepth = depth > maxDepth ? depth : maxDepth;
        }
    }
    let height = 0;
    for (let key = 0; key <= maxDepth; key++) {
        height += Math.max(...heightDict[key]);
    }
    height = height * visScale + $("#vis").height() - 100;

    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}