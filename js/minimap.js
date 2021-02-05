var xScale, yScale,
    viewWidth,
    reserveTree,
    brushSvg,
    colourCircleUrlDict;

function drawMinimap(treeData, heightDict) {

    viewWidth = parseInt(document.getElementById("vis").offsetWidth);

    let width = viewWidth,
        height = parseInt(document.getElementById("minimap").offsetHeight);

    let minimap = d3.select("#minimap").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "minimapSvg");

    let miniTree =  d3.hierarchy(treeData, function(d) { return d.children; });

    reserveTree = d3.hierarchy(treeData, function(d) { return d.children; });

    let treeWidth =  miniTree.data._w;

    let miniHeightDict = heightDict;

    let treeHeight = 0;
    for (let key of Object.keys(miniHeightDict)) {
        treeHeight += parseInt(Math.max(...miniHeightDict[key]));
    }

    xScale = width / treeWidth;
    yScale = height / treeHeight;

    minimap.selectAll("rect")
        .data(miniTree.descendants())
        .enter().append("rect")
        .attr("id", function(d){ return "minibox" + d.data.id; })
        .attr("class", "minibox")
        .attr("x", function(d) { return d.data.x * xScale; })
        .attr("y", function(d) { return d.data.y * yScale; })
        .attr("width", function(d) { return d.data._w * xScale; })
        .attr("height", function(d) { return Math.max(...miniHeightDict[d.depth]) * yScale; })
        .style("fill", "#969696")
        .style("opacity", function(d) {
            return compressionDict[d.data.id] ? 0.5 : 1;
        })
        .style("stroke", "#969696")
        .style("stroke-opacity", function(d) {
            return compressionDict[d.data.id] ? 0.1 : 1;
        })
        .style("stroke-width", 0.5);

    d3.select("#brushSvg").remove();

    brushSvg = d3.select("#minimap").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + 0 + "," + -67 + ")")
        .attr("id", "brushSvg")
        .each(function() {
            moveBrush();
        });

    let rootWidth = parseInt(document.getElementById("box0-0").getAttribute("width"));
    if (rootWidth > viewWidth - 20) {
        drawBrush();
    }

    highlightMinimap();
}

function highlightMinimap() {
    colourCircleUrlDict = {};
    for (let colour of midColours.concat(["#a50026"])) {
        if (minimapCircleDict[colour]) {
            let nodes = minimapCircleDict[colour];
            for (let node of nodes) {
                let miniboxDom = document.getElementById("minibox" + node.box);
                let boxX = parseInt(miniboxDom.getAttribute("x"));
                let boxY = parseInt(miniboxDom.getAttribute("y"));
                let dx = parseInt(node.dx);
                let dy = parseInt(node.dy);
                let r = 3;
                brushSvg
                    .append("circle").datum(node)
                    .attr("cx", boxX + r + dx * xScale)
                    .attr("cy", boxY + r + dy * yScale)
                    .attr("r", r)
                    .attr("class", "minicircle")
                    .attr("id", "miniCircle" + node.id)
                    .attr("miniUrl", node.url)
                    .style("fill", colour)
                    .on("mouseover", function (d) {
                        let label;
                        if (d.label.indexOf("http://") == 0) {
                            label = d.label.substr(d.label.lastIndexOf('/') + 1);
                        } else {
                            label = d.label;
                        }
                        tooltip
                            .style("left", (d3.event.pageX + 20) + "px")
                            .style("top", (d3.event.pageY - 20) + "px")
                            .style("display", "inline-block")
                            .style("opacity", .9)
                            .html(
                                label
                            );
                    })
                    .on("mouseout", function() {
                        tooltip.style("display", "none");
                    });

                colourCircleUrlDict[node.url] = [];
            }
        }
    }
}

function outlineMinimap() {

    for (let url of Object.keys(colourDict)) {

        if (!colourCircleUrlDict[url]) {

            let circleDoms = document.querySelectorAll('[url="' + url + '"]');

            for (let circleDom of circleDoms) {
                let node = circleDom.__data__;

                let miniboxDom = document.getElementById("minibox" + node.box);
                let boxX = parseInt(miniboxDom.getAttribute("x"));
                let boxY = parseInt(miniboxDom.getAttribute("y"));
                let dx = parseInt(node.dx);
                let dy = parseInt(node.dy);
                let r = 2.5;
                brushSvg
                    .append("circle").datum(node)
                    .attr("cx", boxX + r + dx * xScale)
                    .attr("cy", boxY + r + dy * yScale)
                    .attr("r", r)
                    .attr("class", "minicircle")
                    .attr("id", "miniCircle" + node.id)
                    .attr("miniUrl", node.url)
                    .style("fill", "969696")
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                    .on("mouseover", function (d) {
                        let label;
                        if (d.label.indexOf("http://") == 0) {
                            label = d.label.substr(d.label.lastIndexOf('/') + 1);
                        } else {
                            label = d.label;
                        }
                        tooltip
                            .style("left", (d3.event.pageX + 20) + "px")
                            .style("top", (d3.event.pageY - 20) + "px")
                            .style("display", "inline-block")
                            .style("opacity", .9)
                            .html(
                                label
                            );
                    })
                    .on("mouseout", function() {
                        tooltip.style("display", "none");
                    });
            }
        }
    }
}

function updateMinimap() {

    d3.selectAll(".minicircle").remove();

    if (Object.keys(minimapCircleDict).length != 0) {
        for (let colour of midColours.concat(["#1a9850", "#a50026"])) {
            if (minimapCircleDict[colour]) {
                let nodes = minimapCircleDict[colour];
                for (let node of nodes) {
                    let miniboxDom = document.getElementById("minibox" + node.box);
                    let boxX = parseInt(miniboxDom.getAttribute("x"));
                    let boxY = parseInt(miniboxDom.getAttribute("y"));
                    let dx = parseInt(node.dx);
                    let dy = parseInt(node.dy);
                    let r = 3;
                    brushSvg
                        .append("circle").datum(node)
                        .attr("cx", boxX + r + dx * xScale)
                        .attr("cy", boxY + r + dy * yScale)
                        .attr("r", r)
                        .attr("class", "minicircle")
                        .attr("id", "miniCircle" + node.id)
                        .attr("miniUrl", node.url)
                        .style("fill", colour)
                        .style("stroke", function(d) {
                            let circle = document.getElementById(d.id);
                            if (circle) {
                                return circle.style.stroke;
                            } else {
                                if (d.id == clickedNode.id) {
                                    return "#4889F4";
                                }
                            }
                        })
                        .style("stroke-width", function(d) {
                            let circle = document.getElementById(d.id);
                            if (circle) {
                                return circle.style.strokeWidth;
                            } else {
                                if (d.id == clickedNode.id) {
                                    return 3;
                                }
                            }
                        })
                        .on("mouseover", function (d) {
                            let label;
                            if (d.label.indexOf("http://") == 0) {
                                label = d.label.substr(d.label.lastIndexOf('/') + 1);
                            } else {
                                label = d.label;
                            }
                            tooltip
                                .style("left", (d3.event.pageX + 20) + "px")
                                .style("top", (d3.event.pageY - 20) + "px")
                                .style("display", "inline-block")
                                .style("opacity", .9)
                                .html(
                                    label
                                );
                        })
                        .on("mouseout", function() {
                            tooltip.style("display", "none");
                        });
                }
            }
        }
    }

    for (let node of selectedNodes) {

        if (!document.getElementById("miniCircle" + node.id)) {

            let miniboxDom = document.getElementById("minibox" + node.box);
            let boxX = parseInt(miniboxDom.getAttribute("x"));
            let boxY = parseInt(miniboxDom.getAttribute("y"));
            let dx = parseInt(node.dx);
            let dy = parseInt(node.dy);
            let r = 3;

            brushSvg
                .append("circle").datum(node)
                .attr("cx", boxX + r + dx * xScale)
                .attr("cy", boxY + r + dy * yScale)
                .attr("r", r)
                .attr("class", "minicircle")
                .attr("id", "miniCircle" + node.id)
                .attr("miniUrl", node.url)
                .style("fill", "#969696")
                .style("stroke", function (d) {
                    let circle = document.getElementById(d.id);
                    if (circle) {
                        return circle.style.stroke;
                    } else {
                        return "#4889F4";
                    }
                })
                .style("stroke-width", function (d) {
                    let circle = document.getElementById(d.id);
                    if (circle) {
                        return circle.style.strokeWidth;
                    } else {
                        return 3;
                    }
                })
                .on("mouseover", function (d) {
                    let label;
                    if (d.label.indexOf("http://") == 0) {
                        label = d.label.substr(d.label.lastIndexOf('/') + 1);
                    } else {
                        label = d.label;
                    }
                    tooltip
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px")
                        .style("display", "inline-block")
                        .style("opacity", .9)
                        .html(
                            label
                        );
                })
                .on("mouseout", function () {
                    tooltip.style("display", "none");
                });
        }
    }
}
