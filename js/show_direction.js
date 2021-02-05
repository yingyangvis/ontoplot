function showAssArrow(node) {

    let assDirection;
    let propertyName = activeProperty.getAttribute("value");
    if (classAssDict[node.url]) {
        assDirection = classAssDict[node.url][propertyName]
    }

    if (assDirection) {
        let circleDom = document.getElementById(node.id);
        let x = parseInt(circleDom.getAttribute("cx")) + 10;
        let y = parseInt(circleDom.getAttribute("cy"));

        for (let key of Object.keys(assDirection)) {

            if (key == "source") {

                svg.append("path")
                    .attr("transform", function () {
                        return "translate(" + x + ", " + y + ")";
                    })
                    .attr("d", "M -10.5 -7 L -7 -10.5 L -3 -3 Z")
                    .style("fill", "black")
                    .attr("class", "assArrow")
                    .attr("id", node.id)
                    .attr("directionArrow", "source")
                    .on("mouseover", function () {
                        mouseoverAssArrow(circleDom, assDirection[key]);
                    })
                    .on("mouseout", function () {
                        mouseoutAssArrow();
                    });

                for (let item of assDirection[key]) {
                    d3.selectAll('[url="' + item + '"]')
                        .attr("direction", "target");
                }

            } else {

                svg.append("path")
                    .attr("transform", function () {
                        return "translate(" + x + ", " + y + ")";
                    })
                    .attr("d", "M 1.5 -5 L 10 -10 L 5 -1.5 Z")
                    .style("fill", "black")
                    .attr("class", "assArrow")
                    .attr("id", node.id)
                    .attr("directionArrow", "target")
                    .on("mouseover", function () {
                        mouseoverAssArrow(circleDom, assDirection[key]);
                    })
                    .on("mouseout", function () {
                        mouseoutAssArrow();
                    });

                for (let item of assDirection[key]) {
                    d3.selectAll('[url="' + item + '"]')
                        .attr("direction", "source");
                }
            }
        }
    }
}

function updateAssArrow() {

    let circleDom = document.getElementById(clickedNode.id);

    if (circleDom) {
        d3.selectAll(".assArrow")
            .style("visibility", circleDom.style.visibility)
            .style("display", circleDom.style.display)
            .attr("transform", function () {
                return "translate(" + (parseInt(circleDom.getAttribute("cx")) + 10) + ", " + circleDom.getAttribute("cy") + ")";
            });
    }
}

function mouseoverAssArrow(circleDom, assNodes) {

    d3.selectAll(".box").style("opacity", .2);
    d3.selectAll(".siblingBox").style("opacity", .2);
    d3.selectAll(".partialSiblingLine").style("opacity", .2);
    d3.selectAll(".circle").style("opacity", .2);
    d3.selectAll(".square").style("opacity", .2);
    d3.selectAll(".triangle").style("opacity", .2);
    d3.selectAll(".bar").style("opacity", .2);
    d3.selectAll(".hill").style("opacity", .2);
    d3.selectAll(".subtreeLabel").style("opacity", .2);
    d3.selectAll(".spaceLabel").style("opacity", .2);

    circleDom.style.opacity = "1";

    if (document.getElementById("label_button").style.backgroundColor == "white") {

        showMouseoverLabel(circleDom);

        for (let item of assNodes) {
            d3.selectAll('[url="' + item + '"]')
                .style("opacity", 1)
                .transition()
                .duration(300)
                .attr("transform", function () {
                    let cx = this.getAttribute("cx")
                    let cy = this.getAttribute("cy")
                    return "transform", "translate(" + -1 * cx + "," + -1 * cy + ")" + " scale(2)";
                })
                .each(function () {
                    if (this.style.visibility != "hidden") {
                        showMouseoverLabel(this);
                    }
                });
        }
    } else {

        d3.selectAll(".propertyLabelBox").style("display", "none");
        d3.selectAll(".propertyLabelText").style("display", "none");
        d3.selectAll(".propertyLabelLine").style("display", "none");

        let clickedId = circleDom.getAttribute("id");
        d3.select("rect#" + clickedId).style("display", "block");
        d3.select("text#" + clickedId).style("display", "block");
        d3.select("line#" + clickedId).style("display", "block");

        for (let item of assNodes) {
            d3.selectAll('[url="' + item + '"]')
                .style("opacity", 1)
                .transition()
                .duration(300)
                .attr("transform", function () {
                    let cx = this.getAttribute("cx")
                    let cy = this.getAttribute("cy")
                    return "transform", "translate(" + -1 * cx + "," + -1 * cy + ")" + " scale(2)";
                })
                .each(function () {
                    let id = this.getAttribute("id");
                    d3.select("rect#" + id).style("display", "block");
                    d3.select("text#" + id).style("display", "block");
                    d3.select("line#" + id).style("display", "block");
                });
        }

    }
}

function mouseoutAssArrow() {

    d3.selectAll(".box").style("opacity", 1);
    d3.selectAll(".siblingBox").style("opacity", 1);
    d3.selectAll(".partialSiblingLine").style("opacity", 1);
    d3.selectAll(".circle")
        .style("opacity", 1)
        .transition()
        .duration(500)
        .attr("transform", "scale(1)");
    d3.selectAll(".square").style("opacity", 1);
    d3.selectAll(".triangle").style("opacity", 1);
    d3.selectAll(".bar").style("opacity", 1);
    d3.selectAll(".hill").style("opacity", 1);
    d3.selectAll(".subtreeLabel").style("opacity", 1);
    d3.selectAll(".spaceLabel").style("opacity", 1);

    d3.selectAll(".propertyLabelBox").style("display", "block");
    d3.selectAll(".propertyLabelText").style("display", "block");
    d3.selectAll(".propertyLabelLine").style("display", "block");

    d3.selectAll(".mouseoverLabel")
        .transition()
        .duration(300)
        .remove();
}

function showMouseoverLabel(circle) {

    let cx = parseInt(circle.getAttribute("cx"));
    let cy = parseInt(circle.getAttribute("cy"));

    let str = circle.getAttribute("label");
    let id = circle.getAttribute("id");
    let url = circle.getAttribute("url");

    let colour = circle.style.fill;

    svgGroup.append("text")
        .attr("x", cx)
        .attr("y", cy - 10)
        .attr("dy", ".35em")
        .attr("class", "mouseoverLabel")
        .attr("id", id)
        .style("font-size", "12px")
        .attr("font-weight", "bold")
        .style("font-family", "sans-serif")
        .text(str)
        .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")")
        .each(function () {
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
                .attr("class", "mouseoverLabel")
                .attr("id", id)
                .attr("fill-opacity", 0.4)
                .attr("fill", colour)
                .attr("transform", "translate(0, 15) rotate(45, " + cx + "," + cy + ")");
        });

    svgGroup.append("line")
        .style("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", cx + 7)
        .attr("y2", cy + 7)
        .attr("class", "mouseoverLabel")
        .attr("id", id);
}