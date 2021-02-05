var boxXes, lastBoxX,
    circleXes, lastCircleX,
    assArray, assCount;

function drawPartialLabels() {

    labelGrid = {};

    let properties = document.querySelectorAll('input[name="a_property"]:checked');
    let pseudoProperties = document.querySelectorAll('input[name="a_pseudo_property"]:checked');

    if (properties.length == 1) {
        assArray = properties[0];
        assCount = 1;
    } else {
        assArray = [];
        let properties = pseudoProperties[0].getAttribute("propertyArray").split(",");
        for (let property of properties) {
            assArray.push(document.getElementById(property));
        }
        assCount = assArray.length;
    }

    boxXes = Object.keys(boxPositionDict);
    circleXes = Object.keys(colouredCirclePositionDict);

    if (visibleX) {

        for (let boxX of boxXes) {
            if (parseInt(boxX) <= parseInt(visibleX) + 100) {
                for (let node of boxPositionDict[boxX]) {
                    drawPathLabel(node);
                }
                lastBoxX = parseInt(boxX);
            }
        }

        for (let circleX of circleXes) {
            if (parseInt(circleX) <= parseInt(visibleX) + 100) {
                for (let node of colouredCirclePositionDict[circleX]) {
                    drawAssLabel(node);
                }
                lastCircleX = parseInt(circleX);
            }
        }
    } else {

        for (let boxX of boxXes) {
            for (let node of boxPositionDict[boxX]) {
                drawPathLabel(node);
            }
        }

        for (let circleX of circleXes) {
            for (let node of colouredCirclePositionDict[circleX]) {
                drawAssLabel(node);
            }
        }
    }

    svgGroup.selectAll(".propertyLabelBox")
        .call(dragPropertyBar)
        .attr('cursor', 'move');

    svgGroup.selectAll(".propertyLabelText")
        .call(dragPropertyBar)
        .attr('cursor', 'move');

    checkAssLabelOverlap();

    d3.select("#path_button")
        .style("color", "white")
        .style("background-color", "#969696");

    d3.select("#label_button")
        .style("color", "white")
        .style("background-color", "#969696");
}

function drawNewLabels() {

    if (visibleX) {

        for (let boxX of boxXes) {
            let x = parseInt(boxX);
            if (x > parseInt(lastBoxX) && x <= parseInt(visibleX) + 100) {
                for (let node of boxPositionDict[boxX]) {
                    drawPathLabel(node);
                }
                lastBoxX = parseInt(boxX);
            }
        }

        circleXes = Object.keys(colouredCirclePositionDict);

        for (let circleX of circleXes) {
            let cx = parseInt(circleX);
            if (cx > parseInt(lastCircleX) && cx <= parseInt(visibleX) + 100) {
                lastCircleX = cx;
                for (let node of colouredCirclePositionDict[circleX]) {
                    drawAssLabel(node);
                }
            }
        }

        svgGroup.selectAll(".propertyLabelBox")
            .call(dragPropertyBar)
            .attr('cursor', 'move')
            .moveToFront();;

        svgGroup.selectAll(".propertyLabelText")
            .call(dragPropertyBar)
            .attr('cursor', 'move')
            .moveToFront();;

        checkAssLabelOverlap();
    }
}

function drawPathLabel(box) {

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

function drawAssLabel(circleDom) {

    let cx = parseInt(circleDom.getAttribute("cx"));
    let cy = parseInt(circleDom.getAttribute("cy"));
    let id = circleDom.getAttribute("id");
    let str = circleDom.getAttribute("label");
    let url = circleDom.getAttribute("url");

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
                if (labelDict[url].bbox) {
                    bbox = labelDict[url].bbox;
                } else {
                    bbox = this.getBBox();
                    labelDict[url].bbox = bbox;
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
                    for (let property of Object.keys(classAssDict[circleData.url])) {
                        d3.selectAll('[name="' + property + '"]')
                            .style("opacity", 1);
                    }
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