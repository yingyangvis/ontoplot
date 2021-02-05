let barEdge = 15,
    labelGrid;

function pinLabel(circleDom) {

    let cx = parseInt(circleDom.getAttribute("cx"));
    let cy = parseInt(circleDom.getAttribute("cy"));

    let str = circleDom.getAttribute("label");
    let id = circleDom.getAttribute("id");

    let colour = circleDom.style.fill;
    let visibility = circleDom.style.visibility;
    let display = circleDom.style.display;

    svgGroup.append("text")
        .attr("x", cx)
        .attr("y", cy - 10)
        .attr("dy", ".35em")
        .attr("class", "pinedLabel")
        .attr("id", id)
        .attr("assCount", 1)
        .style("font-size", "12px")
        .attr("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("visibility", visibility)
        .style("display", display)
        .text(str)
        .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")")
        .each(function() {
            let url = circleDom.getAttribute("url");
            let bbox;
            if (labelDict[url].bbox) {
                bbox = labelDict[url].bbox;
            } else {
                bbox = this.getBBox();
                labelDict[url].bbox = bbox;
            }
            svgGroup.append("rect")
                .attr("x", cx - 0.5)
                .attr("y", cy - 18)
                .attr("width", bbox.width + 1)
                .attr("height", bbox.height + 1)
                .attr("class", "pinedLabel")
                .attr("id", id)
                .attr("position", 0)
                .attr("assCount", 1)
                .attr("fill-opacity", 0.4)
                .attr("fill", colour)
                .style("visibility", visibility)
                .style("display", display)
                .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")");
        });

    svgGroup.append("line")
        .style("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", cx + 7)
        .attr("y2", cy + 7)
        .attr("class", "pinedLabel")
        .attr("id", id)
        .style("visibility", visibility)
        .style("display", display);

    svgGroup.selectAll(".pinedLabel")
        .call(dragPropertyBar)
        .attr('cursor', 'move');
}

function checkAssButton() {

    d3.selectAll(".propertyLabelText").remove();
    d3.selectAll(".propertyLabelLine").remove();
    d3.selectAll(".propertyLabelBox").remove();

    if (document.getElementById("label_button").style.backgroundColor == "white") {

        if (clickedNode) {
            showAssLabels();
            // drawPartialLabels();
            updateLabel();
            if (!selectedAssDict[clickedNode.url]) {
                alert("No Association Found!");
                d3.selectAll(".propertyLabelText").remove();
                d3.selectAll(".propertyLabelLine").remove();
                d3.selectAll(".propertyLabelBox").remove();
                d3.select("#label_button")
                    .style("color", "#969696")
                    .style("background-color", "white");
            }
        } else if (selectedNodes.length > 0) {

            if (Object.keys(nodeAss).length > 0) {
                showAssLabels();
                // drawPartialLabels();
                updateLabel();
                d3.selectAll(".multiNodeLabel").remove();
                pinMultiNodeLabels();
            } else {
                alert("No Association Found!");
            }

        } else {
            showAssLabels();
            // drawPartialLabels();
            updateLabel();
        }
    } else {

        d3.select("#label_button")
            .style("color", "#969696")
            .style("background-color", "white");
    }
}

function showAssLabels() {

    // let labelBoxes = [];
    labelGrid = {};

    let assArray, assCount;

    let input = activeProperty.parentNode.firstChild;
    let propertyAttr = input.getAttribute("propertyArray");

    if (!propertyAttr) {
        assArray = input;
        assCount = 1;
    } else {
        assArray = [];
        let properties = propertyAttr.split(",");
        for (let property of properties) {
            assArray.push(document.getElementById(property));
        }
        assCount = assArray.length;
    }

    for (let node of Object.keys(colourDict)) {

        let circleDoms = document.querySelectorAll('[url="' + node + '"]');

        for (let circleDom of circleDoms) {

            // let box = circleDom.__data__.box;

            // if (labelBoxes[box]) {
            //     labelBoxes[box].push(circleDom)
            // } else {
            //     labelBoxes[box] = [];
            //     labelBoxes[box].push(circleDom)
            // }

            let cx = parseInt(circleDom.getAttribute("cx"));
            let cy = parseInt(circleDom.getAttribute("cy"));
            let id = circleDom.getAttribute("id");
            let str = circleDom.getAttribute("label");

            let colour = circleDom.style.fill;
            let visibility = circleDom.style.visibility;
            let display = circleDom.style.display;

            d3.select("text#" + id).remove();
            d3.selectAll("rect#" + id).remove();
            d3.select("line#" + id).remove();
            d3.select("line#bar" + id).remove();

            if (!document.getElementById("pin" + id)) {

                svgGroup.append("text")
                    .attr("x", cx)
                    .attr("y", cy - 10)
                    .attr("dy", ".35em")
                    .attr("class", "propertyLabelText")
                    .attr("id", id)
                    .style("font-size", "12px")
                    .attr("font-weight", "bold")
                    .style("font-family", "sans-serif")
                    .attr("opacity", 0.6)
                    .style("visibility", visibility)
                    .style("display", display)
                    .text(str)
                    .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")")
                    .each(function() {

                        let bbox;
                        if (labelDict[node].bbox) {
                            bbox = labelDict[node].bbox;
                        } else {
                            bbox = this.getBBox();
                            labelDict[node].bbox = bbox;
                        }

                        this.setAttribute("assCount", assCount);

                        svgGroup.append("rect")
                            .attr("x", cx - 0.5)
                            .attr("y", cy - 18)
                            .attr("width", bbox.width + 1)
                            .attr("height", barEdge)
                            .attr("class", "propertyLabelBox")
                            .attr("id", id)
                            .attr("position", 0)
                            .attr("assCount", 1)
                            .attr("fill-opacity", 0.4)
                            .attr("fill", function() {

                                if (assCount == 1) {
                                    d3.select(this)
                                        .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")");
                                    labelGrid[cx + "," + cy] = {
                                        length: bbox.width / Math.sqrt(2) + 10,
                                        id: id
                                    };
                                    return colour;
                                } else {

                                    drawPropertyCell(circleDom, assArray);

                                    let distance = assCount * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);

                                    d3.select("text#" + id)
                                        .attr("transform", "translate(" + distance + "," + (distance + 15) + ") rotate(45, " + cx + "," + cy + ")");

                                    d3.select(this)
                                        .attr("assCount", assCount)
                                        .attr("transform", "translate(" + distance + "," + (distance + 15) + ") rotate(45, " + cx + "," + cy + ")");

                                    labelGrid[cx + "," + cy] = {
                                        length: distance + bbox.width / Math.sqrt(2) + 10,
                                        id: id
                                    };

                                    return "white";
                                }
                            })
                            .style("visibility", visibility)
                            .style("display", display);
                    })
                    .on("mouseover", function() {

                        let node = this.getAttribute("id");
                        let cx = document.getElementById(node).getAttribute("cx");
                        let cy = document.getElementById(node).getAttribute("cy");
                        d3.select("circle#" + node)
                            .transition()
                            .duration(300)
                            .attr("transform", "translate(" + -1 * cx + "," + -1 * cy + ")" + " scale(2)");

                        let circleData = document.getElementById(node).__data__;
                        mouseoverClass(circleData);

                        d3.selectAll('[type=dynamic]')
                            .style("opacity", 0.2);
                        if (classAssDict[circleData.url]) {
                            d3.selectAll('[name="' + activeProperty.getAttribute("value") + '"]')
                                .style("opacity", 1);
                        }
                    })
                    .on("mouseout", function() {
                        let node = this.getAttribute("id");
                        d3.select("circle#" + node)
                            .transition()
                            .duration(500)
                            .attr("transform", "scale(1)");

                        tooltip.style("display", "none");

                        d3.selectAll('[type=dynamic]')
                            .style("opacity", 1);
                    })
                    .moveToFront();

                svgGroup.append("line")
                    .style("stroke", "black")
                    .attr("stroke-width", 0.5)
                    .attr("x1", cx)
                    .attr("y1", cy)
                    .attr("x2", cx + 7)
                    .attr("y2", cy + 7)
                    .attr("class", "propertyLabelLine")
                    .attr("id", id)
                    .style("visibility", visibility)
                    .style("display", display)
                    .on("mouseover", function() {
                        mouseoverClass(circleDom.__data__);
                    })
                    .on("mouseout", function() {
                        tooltip.style("display", "none");
                    });
            }
        }
    }

    d3.select("#label_button")
        .style("color", "white")
        .style("background-color", "#969696");

    svgGroup.selectAll(".propertyLabelBox")
        .call(dragPropertyBar)
        .attr('cursor', 'move');

    svgGroup.selectAll(".propertyLabelText")
        .call(dragPropertyBar)
        .attr('cursor', 'move');

    checkAssLabelOverlap();
}

function drawPropertyCell(circleDom, assArray) {

    let cx = parseInt(circleDom.getAttribute("cx")),
        cy = parseInt(circleDom.getAttribute("cy")),
        node = circleDom.getAttribute("url"),
        id = circleDom.getAttribute("id"),
        visibility = circleDom.style.visibility,
        display = circleDom.style.display;

    for (let i = 0; i < assArray.length; i++) {
        let assName = assArray[i].value;

        svgGroup.append("rect")
            .attr("x", cx + barEdge * i - 0.5)
            .attr("y", cy - 18)
            .attr("width", barEdge)
            .attr("height", barEdge)
            .attr("class", "propertyLabelBox")
            .attr("id", id)
            .attr("position", i)
            .attr("assCount", 1)
            .attr("node", node)
            .attr("ass", assName)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill-opacity", 0.6)
            .attr("fill", function() {
                if (clickedNode) {
                    if (colourDict[node][assName]) {
                        let strength = colourDict[node][assName].length;
                        if (strength == 0) {
                            return "white";
                        }
                        if (strength == maxAssValue) {
                            return "#a50026";
                        }
                        return colourScale(strength);
                    } else {
                        return "white";
                    }
                } else {
                    if (colourDict[node][assName]) {
                        let strength = colourDict[node][assName].length;
                        if (strength == 0) {
                            return "white";
                        }
                        if (strength == maxAssValue) {
                            return "#a50026";
                        }
                        return colourScale(strength);
                    } else {
                        return "white";
                    }
                }
            })
            .style("visibility", visibility)
            .style("display", display)
            .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")")
            .on("mouseover", function() {
                let ass = this.getAttribute("ass");
                let node = this.getAttribute("node");
                highlightPropertyList(ass);
                highlightPropertyCellsAndMinimap(ass, node);
                showPropertyCellTooltip(node, ass);
            })
            .on("mouseout", function() {
                let ass = this.getAttribute("ass");
                d3.selectAll('[type=dynamic]')
                    .style("opacity", 1)
                    .style("border-style", "none");
                deHighlightPropertyCellsAndMinimap(ass);
                tooltip.style("display", "none");
            })
            .on("click", function() {

                d3.selectAll(".pinedLabel")
                    .remove();

                if (this.getAttribute("pined") != "true") {

                    let id = this.getAttribute("id");

                    d3.selectAll(".propertyLabelText")
                        .each(function() {
                            if (this.getAttribute("id") != id) {
                                this.remove();
                            }
                        });
                    d3.selectAll(".propertyLabelLine")
                        .each(function() {
                            if (this.getAttribute("id") != id && this.getAttribute("id") != "bar" + id) {
                                this.remove();
                            }
                        });
                    d3.selectAll(".propertyLabelBox")
                        .each(function() {
                            if (this.getAttribute("id") != id) {
                                this.remove();
                            }
                        });

                    let operation = getSelectionByName("an_operation");

                    let assClasses;
                    if (operation == "intersection" && this.getAttribute("fill") == "white") {
                        assClasses = selectedAssDict[this.getAttribute("node")][assName];
                    } else {
                        assClasses = colourDict[this.getAttribute("node")][assName];
                    }

                    if (assClasses) {
                        for (let aClass of assClasses) {
                            let circleDoms = document.querySelectorAll('[url="' + aClass + '"]');
                            for (let circleDom of circleDoms) {
                                pinLabel(circleDom);
                            }
                        }
                        this.setAttribute("pined", "true");
                    } else {
                        alert("No Association Found!");
                    }
                } else {
                    // drawPartialLabels();
                    showAssLabels();
                    if (!clickedNode && selectedNodes.length > 0) {
                        d3.selectAll(".multiNodeLabel").remove();
                        pinMultiNodeLabels();
                    }
                    this.setAttribute("pined", "false");
                }
            });
     }

    let distance = assArray.length * barEdge / Math.sqrt(2) + 7;
    svgGroup.append("line")
        .style("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("x1", cx + distance)
        .attr("y1", cy + distance)
        .attr("x2", cx + distance + 3 * Math.sqrt(2))
        .attr("y2", cy + distance + 3 * Math.sqrt(2))
        .attr("class", "propertyLabelLine")
        .attr("id", "bar" + id)
        .attr("assCount", assArray.length)
        .style("visibility", visibility)
        .style("display", display)
        .on("mouseover", function() {
            mouseoverClass(circleDom.__data__);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });
}

function updateLabel() {

    if (document.getElementById("label_button").style.backgroundColor != "white") {
        d3.selectAll(".propertyLabelText").remove();
        d3.selectAll(".propertyLabelLine").remove();
        d3.selectAll(".propertyLabelBox").remove();
        showAssLabels();
        // drawPartialLabels();
    }

    let labels = document.getElementsByClassName("pinLabel");

    for (let label of labels) {

        let circleDom = document.getElementById(label.getAttribute("id").substring(3));

        let cx = parseInt(circleDom.getAttribute("cx"));
        let cy = parseInt(circleDom.getAttribute("cy"));

        let id = circleDom.getAttribute("id");

        let colour = circleDom.style.fill;
        let visibility = circleDom.style.visibility;
        let display = circleDom.style.display;

        label.setAttribute("x", cx);
        label.setAttribute("y", cy - 10);
        label.setAttribute("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")");
        label.style.display = display;
        label.style.visibility = visibility;

        d3.select("line#pin" + id)
            .style("display", display)
            .style("visibility", visibility)
            .attr("x1", cx)
            .attr("y1", cy)
            .attr("x2", cx + 7)
            .attr("y2", cy + 7);

        d3.select("rect#pin" + id)
            .style("display", display)
            .style("visibility", visibility)
            .attr("x", cx - 0.5)
            .attr("y", cy - 18)
            .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")")
            .style("fill", colour)
    }

    d3.selectAll(".pinedLabel")
        .attr("fill", function() {
            return document.getElementById(this.id.substr(3)).style.fill;
        })

    d3.selectAll(".spaceLabel")
        .attr("x", function() {
            return parseInt(document.getElementById(this.id).getAttribute("cx")) + 9;
        })
        .attr("y", function() {
            return parseInt(document.getElementById(this.id).getAttribute("cy"));
        })
        .style("display", function() {
            return document.getElementById(this.id).style.display;
        })
        .style("visibility", function() {
            return document.getElementById(this.id).style.visibility;
        })

    scrollPathLabel();
}

function showPathLabels() {

    d3.selectAll(".spaceLabel").remove();

    d3.select("#path_button")
        .style("color", "white")
        .style("background-color", "#969696");

    for (let box of document.getElementsByClassName("box")) {

        if (box.__data__.children && box.getAttribute("width") > visScale) {

            let circleDom = document.getElementById(box.__data__.data.elements[0].id);

            let cx = parseInt(circleDom.getAttribute("cx"));
            let cy = parseInt(circleDom.getAttribute("cy"));
            let id = circleDom.getAttribute("id");
            let str = circleDom.getAttribute("label");

            if (!d3.select("text#" + id)._groups[0][0]) {
                svgGroup.append("text")
                    .attr("x", cx + 9)
                    .attr("y", cy)
                    .attr("dy", ".35em")
                    .attr("class", "spaceLabel")
                    .attr("id", id)
                    .attr("box", circleDom.getAttribute("box"))
                    .style("font-size", "12px")
                    .style("font-family", "sans-serif")
                    .text(str)
                    .style("visibility", circleDom.style.visibility)
                    .style("display", circleDom.style.display)
                    .each(function() {

                        let id = this.getAttribute("box");
                        let hillButton = document.getElementById("hillButton" + id);

                        let url = circleDom.getAttribute("url");

                        let bbox;
                        if (labelDict[url].bbox) {
                            bbox = labelDict[url].bbox;
                        } else {
                            bbox = this.getBBox();
                            labelDict[url].bbox = bbox;
                        }

                        let boxWidth = parseInt(box.getAttribute("width"));

                        if (!hillButton) {
                            if (bbox.width > boxWidth - 20) {
                                d3.select("text#" + this.id)
                                    .text(str.substring(0, 3 + (boxWidth - 60) / 5) + "...");
                                let newbbox = this.getBBox();
                                d3.select("text#" + this.id)
                                    .attr("width", newbbox.width);
                            } else {
                                d3.select("text#" + this.id)
                                    .attr("width", bbox.width);
                            }
                        } else {
                            let hillButtonWidth = parseInt(hillButton.getAttribute("width"));
                            if (bbox.width > boxWidth - 20 - hillButtonWidth) {
                                d3.select("text#" + this.id)
                                    .text(str.substring(0, 3 + (boxWidth - 40 - hillButtonWidth) / 5) + "...");
                                let newbbox = this.getBBox();
                                d3.select("text#" + this.id)
                                    .attr("width", newbbox.width);
                            } else {
                                d3.select("text#" + this.id)
                                    .attr("width", bbox.width);
                            }
                        }
                    });
            }
        }
    }
}

function checkPathButton() {

    if (document.getElementById("path_button").style.backgroundColor == "white") {

        showPathLabels();
        // drawPartialLabels();

    } else {

        d3.selectAll(".spaceLabel").remove();

        d3.select("#path_button")
            .style("color", "#969696")
            .style("background-color", "white")
    }
}

function highlightPropertyList(ass) {
    d3.selectAll('[type=dynamic]')
        .style("opacity", 0.2);
    d3.selectAll('[name="' + ass + '"]')
        .style("opacity", 1)
        .style("border-style", "solid");
}

function highlightPropertyCellsAndMinimap(ass, label) {

    if (classAssDict[label][ass]) {
        if (classAssDict[label][ass]["target"]) {
            for (let ele of classAssDict[label][ass]["target"]) {
                d3.selectAll('[node="' + ele + '"]')
                    .attr("stroke-width", function() {
                        if (this.getAttribute("ass") == ass) {
                            return 2.5;
                        } else {
                            return 0.5;
                        }
                    });

                d3.selectAll('[miniUrl="' + ele + '"]')
                    .attr("stroke", "black")
                    .attr("stroke-width", 4)
                    .transition()
                    .duration(300)
                    .attr("r", 8);
            }
        }

        if (classAssDict[label][ass]["source"]) {
            for (let ele of classAssDict[label][ass]["source"]) {
                d3.selectAll('[node="' + ele + '"]')
                    .attr("stroke-width", function() {
                        if (this.getAttribute("ass") == ass) {
                            return 2.5;
                        } else {
                            return 0.5;
                        }
                    });
                d3.selectAll('[miniUrl="' + ele + '"]')
                    .attr("stroke", "black")
                    .attr("stroke-width", 4)
                    .transition()
                    .duration(300)
                    .attr("r", 8);
            }
        }
    }
}

function deHighlightPropertyCellsAndMinimap(ass) {
    d3.selectAll('[ass="' + ass + '"]')
        .attr("stroke-width", 0.5);
    d3.selectAll(".minicircle")
        .transition()
        .duration(500)
        .attr("stroke-width", 0)
        .attr("r", 3);
}

function showPropertyCellTooltip(node, ass) {

    let assStrength = 0;
    if (colourDict[node][ass]) {
        assStrength = colourDict[node][ass].length;
    }

    if (ass.indexOf("http://") == 0) {
        ass = ass.substr(ass.lastIndexOf('/') + 1);
    }

    let message = "Number of " + '<span style="font-weight:bold; font-style:italic;">' + ass + '</span>' + " associations: " + assStrength;

    tooltip
        .style("left", (d3.event.pageX + 30) + "px")
        .style("top", (d3.event.pageY - 40) + "px")
        .style("display", "inline-block")
        .style("opacity", .9)
        .html(
            message
        );
}