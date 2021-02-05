var landscapeScale = 10,
    landscapeType;

function drawSquareLanscape(d) {

    let landscape = d3.select("#tooltip").append("svg")
        .attr("id", "landscape");

    let root = document.getElementById("minibox" + d.box).__data__;

    landscape.append("rect").datum(root)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", function(d) { return d.data._w * landscapeScale; })
        .attr("height", function(d) { return d.data._h * landscapeScale; })
        .attr("fill", "#969696")
        .attr("stroke", "white");

    landscape
        .attr("width", root.data._w * landscapeScale)
        .attr("height", root.data._h * landscapeScale);
}

function drawBarLandscape(d) {

    let root = document.getElementById("minibox" + d.box).__data__;

    d3.select("#tooltip").append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "vertex")
        .text("Subtree root: " + root.data.elements[0].label)
        .append("br");

    let textWidth = 0;
    let dummy = svgGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "vertex")
        .text("Subtree root: " + root.data.elements[0].label)
        .each(function() {
            textWidth = this.getBBox().width;
        })
        .remove();

    let landscape = d3.select("#tooltip").append("svg")
        .attr("id", "landscape");

    let i = 0;
    while (i < root.height + 1) {
        landscape.append("rect")
            .attr("x", 0)
            .attr("y", i * landscapeScale)
            .attr("width", landscapeScale)
            .attr("height", landscapeScale)
            .attr("fill", "#969696")
            .attr("stroke", "white");
        i++;
    }

    landscape
        .attr("width", landscapeScale)
        .attr("height", i *landscapeScale)
        .attr("transform", "translate(" + (textWidth - landscapeScale) / 2 + ", 0)");
}

function drawTriangleLandscape(d) {

    let root = document.getElementById("minibox" + d.box).__data__;

    d3.select("#tooltip").append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "vertex")
        .text("Subtree root: " + root.data.elements[0].label)
        .append("br");

    let textWidth = 0;
    let dummy = svgGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("class", "vertex")
        .text("Subtree root: " + root.data.elements[0].label)
        .each(function() {
            textWidth = this.getBBox().width;
        })
        .remove();

    let landscape = d3.select("#tooltip").append("svg")
        .attr("id", "landscape");

    let changedX = root.data.x,
        changedY = root.data.y;

    let tooltipHeightDict = {},
        tooltipYDict = {};

    landscape.selectAll("rect")
        .data(root.descendants())
        .enter().append("rect")
        .attr("x", function(d) { return (d.data.x - changedX) * landscapeScale; })
        .attr("y", function(d) { return (d.data.y - changedY) * landscapeScale; })
        .attr("width", function(d) { return d.data._w * landscapeScale; })
        .attr("height", function (d) {
            if (!tooltipYDict[d.data.depth]) {
                let y = 0;
                for (let key of Object.keys(tooltipHeightDict)) {
                    y += parseInt(tooltipHeightDict[key]);
                }
                tooltipYDict[d.data.depth] = y;
            }
            if (tooltipHeightDict[d.data.depth]) {
                tooltipHeightDict[d.data.depth] = d.data._h > tooltipHeightDict[d.data.depth] ? d.data._h : tooltipHeightDict[d.data.depth];
            } else {
                tooltipHeightDict[d.data.depth] = d.data._h;
            }
            return d.data._h * landscapeScale;
        })
        .attr("fill", "#969696")
        .attr("stroke", "white")
        .attr("depth", function (d) { return d.data.depth; })
        .attr("class", "tooltipRect");

    let treeDepth = 0;
    d3.selectAll(".tooltipRect")
        .attr("y", function (d) {
            treeDepth = d.data.depth;
            return tooltipYDict[d.data.depth] * landscapeScale;
        })
        .attr("height", function(d) {
            return tooltipHeightDict[d.data.depth] * landscapeScale;
        });

    let landscapeWidth = root.data._w * landscapeScale
    landscape
        .attr("width", landscapeWidth)
        .attr("height", (tooltipYDict[treeDepth] + tooltipHeightDict[treeDepth]) * landscapeScale)
        .attr("transform", function() {
            if (textWidth >= landscapeWidth) {
                return "translate(" + (textWidth - landscapeWidth) / 2 + ", 0)";
            } else {
                return "translate(0, 0)";
            }
        });
}

function drawHillLandscape(d) {

    let landscape = d3.select("#tooltip").append("svg")
        .attr("id", "landscape");

    let hillData = document.getElementById("box" + d.box).__data__.data;
    let elements =  hillData.elements;

    let boxData = [];
    for (let ele of elements) {
        let root = document.getElementById("minibox" + ele.id).__data__;
        boxData = boxData.concat(root.descendants());
    }

    let firstEle = elements[0];

    let changedX = document.getElementById("minibox" + firstEle.id).__data__.data.x,
        changedY = document.getElementById("minibox" + firstEle.id).__data__.data.y;

    let tooltipHeightDict = {},
        tooltipYDict = {};

    landscape.selectAll("rect")
        .data(boxData)
        .enter().append("rect")
        .attr("x", function(d) { return (d.data.x - changedX) * landscapeScale; })
        .attr("y", function (d) { return (d.data.y - changedY) * landscapeScale; })
        .attr("width", function(d) { return d.data._w * landscapeScale; })
        .attr("height", function(d) {
            if (tooltipHeightDict[d.data.depth]) {
                tooltipHeightDict[d.data.depth] = d.data._h > tooltipHeightDict[d.data.depth] ? d.data._h : tooltipHeightDict[d.data.depth];
            } else {
                tooltipHeightDict[d.data.depth] = d.data._h;
            }
            return d.data._h * landscapeScale;
        })
        .attr("fill", "#969696")
        .attr("stroke", "white")
        .attr("depth", function (d) { return d.data.depth; })
        .attr("class", "tooltipRect");

    let y = 0;
    for (let key of Object.keys(tooltipHeightDict)) {
        tooltipYDict[key] = y;
        y += tooltipHeightDict[key];
    }

    let treeDepth = 0;
    d3.selectAll(".tooltipRect")
        .attr("y", function (d) {
            treeDepth = d.data.depth > treeDepth ? d.data.depth : treeDepth;
            return tooltipYDict[d.data.depth] * landscapeScale;
        })
        .attr("height", function(d) {
            return tooltipHeightDict[d.data.depth] * landscapeScale;
        });

    landscape
        .attr("width", hillData._w * landscapeScale)
        .attr("height", (tooltipYDict[treeDepth] + tooltipHeightDict[treeDepth]) * landscapeScale);
}
