var tooltip,
    midColours, maxColour, noneColour,
    dragPropertyBar, dragNodeGrid,
    ontoName, ontoPath,
    assDict, selectedAssDict, classAssDict, colourDict, mouseoverAss,
    maxAssValue, colourScale,
    processedHierarchyData,
    classParentDict, boxParentDict, labelDict, searchDict,
    minimapHeightDict, minimapHierarchyData,
    clickedNode, selectedNodes, focused,
    heightDict, changedWidthDict, compressionDict, hillDict,
    circleData, squareData, barData, triangleData, hillData,
    labelCount, pseudoAssDict,
    activeOnto, activeProperty, labeledProperties;

window.onload = function() {

    if(!/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())){
        alert("Please use Google Chrome browser.");
    }

    tooltip = d3.select("body").append("div")
        .attr("id", "tooltip");

    midColours = ["#fee08b", "#fdae61", "#f46d43", "#d73027"];
    maxColour = "#a50026";
    noneColour = "#969696";

    dragPropertyBar = d3.drag()
        .on("start", dragBarStarted)
        .on("drag", dragBar)
        .on("end", dragBarEnded);
    dragNodeGrid = d3.drag()
        .on("start", dragGridStarted)
        .on("drag", dragGrid)
        .on("end", dragGridEnded);

    let collapsibleMenu = document.getElementsByClassName("collapsibleMenu");
    for (let i = 0; i < collapsibleMenu.length; i++) {
        collapsibleMenu[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            let firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    ontoName = getSelectionByName("an_onto");
    ontoPath = "onto/" + ontoName;
    loadData(ontoPath);
};

function getSelectionByName(name) {
    let list = document.getElementsByName(name);
    for (let ele of list) {
        if (ele.checked) {
            ele.checked = false;
            activeOnto = ele.parentNode.childNodes[3];
            activeOnto.style.background = "rgba(72, 137, 244, 0.3)";
            return ele.value;
        }
    }
}

function loadData(ontoPath) {

    d3.csv(ontoPath + "_ass.csv", function(error, assData) {

        if (error) throw error;

        if (assData.length != 0) {
            let processedAssData = processAss(assData);
            assDict = processedAssData.assDict;
            selectedAssDict = createPropertyList();
            colourDict = JSON.parse(JSON.stringify(selectedAssDict));
            mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));
            maxAssValue = selectedAssDict.maxValue;
            classAssDict = processedAssData.classAssDict;
        } else {
            assDict = { };
            selectedAssDict = { };
            colourDict = { };
            mouseoverAss = { };
            maxAssValue = 0;
            classAssDict = { };
        }

        drawColourLegend();

        d3.csv(ontoPath + ".csv", function(error, hierarchyData) {

            if (error) throw error;

            if (hierarchyData.length != 0) {
                processedHierarchyData = processHierarchy(hierarchyData);
                classParentDict = processedHierarchyData.classParentDict;
                boxParentDict = processedHierarchyData.parentDict;
                labelDict = processedHierarchyData.labelDict;
                searchDict = processedHierarchyData.searchDict;

                clickedNode = null;
                selectedNodes = [];
                labelCount = 0;
                pseudoAssDict = {};
                labeledProperties = [];
                preDraw();

                setTimeout(function () {
                    showPathLabels();
                    showAssLabels();
                    // drawPartialLabels();
                    colouredCirclePositionDict = {};
                }, 100);
            }
        });
    });
}

function preDraw() {

    minimapHierarchyData = JSON.parse(JSON.stringify(processedHierarchyData.hierarchyData));
    minimapHeightDict = JSON.parse(JSON.stringify(processedHierarchyData.heightDict));

    reconstructHierarchy(minimapHierarchyData, minimapHeightDict);

    let hierarchyDataCopy = JSON.parse(JSON.stringify(minimapHierarchyData));

    heightDict = JSON.parse(JSON.stringify(minimapHeightDict));
    changedWidthDict = {};
    compressionDict = {};
    hillDict = {};

    circleData = [],
    barData = [],
    squareData = [],
    triangleData = [],
    hillData = [];

    focused = false;

    initialCompression(hierarchyDataCopy);

    moveNodes(hierarchyDataCopy);

    drawOntoplot(hierarchyDataCopy);

    // drawBox(hierarchyDataCopy);

    drawMinimap(minimapHierarchyData, minimapHeightDict);

    // drawIdentialNodeButton();
}

/**
 * loading screen
 * */

function onReady(callback) {
    var intervalID = window.setInterval(checkReady, 100);

    function checkReady() {
        if (document.getElementsByTagName("body")[0] !== undefined) {
            window.clearInterval(intervalID);
            callback.call(this);
        }
    }
}

function show(id, value) {
    document.getElementById(id).style.display = value ? "block" : "none";
}

/**
 *  draw colour legend
 */

function drawColourLegend() {

    d3.select("#legendSVG").remove();

    if (maxAssValue != 0) {

        let legendColours = midColours.slice(0, maxAssValue - 1);

        colourScale = d3.scaleQuantile()
            .domain([1, maxAssValue - 1])
            .range(legendColours);

        if (maxAssValue <= 5) {

            legendColours = ["#969696"].concat(legendColours);
            legendColours = legendColours.concat(["#a50026"]);

            let legendLabels = [0, 1, 2, 3, 4, 5];

            let quantile = d3.scaleQuantile()
                .domain([ 0, maxAssValue ])
                .range(legendColours);
            let legendSVG = d3.select("#colourLegend").append("svg")
                .attr("id", "legendSVG")
                .attr("width", legendColours.length * 35)
                .attr("height", 50);
            legendSVG.append("g")
                .attr("class", "legendQuant")
                .attr("transform", "translate(0,10)");

            let legend = d3.legendColor()
                .shapeWidth(30)
                .orient("horizontal")
                .labels(legendLabels)
                .scale(quantile);
            legendSVG.select(".legendQuant")
                .call(legend);

        } else {

            let legendSVG = d3.select("#colourLegend").append("svg")
                .attr("id", "legendSVG")
                .attr("width", 6 * 35)
                .attr("height", 50);

            let legend = legendSVG.append("defs")
                .append("svg:linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "100%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");

            legend.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", midColours[0])
                .attr("stop-opacity", 1);

            legend.append("stop")
                .attr("offset", "33%")
                .attr("stop-color", midColours[1])
                .attr("stop-opacity", 1);

            legend.append("stop")
                .attr("offset", "66%")
                .attr("stop-color", midColours[2])
                .attr("stop-opacity", 1);

            legend.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", midColours[3])
                .attr("stop-opacity", 1);

            legendSVG.append("rect")
                .attr("width", 30)
                .attr("height", 15)
                .attr("class", "swatch")
                .style("fill", "#969696")
                .attr("transform", "translate(0,10)");

            legendSVG.append("text")
                .attr("transform", "translate(10,43)")
                .attr("class", "label")
                .text("0");

            legendSVG.append("rect")
                .attr("width", 126)
                .attr("height", 15)
                .attr("class", "swatch")
                .style("fill", "url(#gradient)")
                .attr("transform", "translate(32,10)");

            legendSVG.append("text")
                .attr("transform", "translate(35,43)")
                .attr("class", "label")
                .text("1");

            legendSVG.append("text")
                .attr("class", "label")
                .text(maxAssValue - 1)
                .each(function() {
                    var bbox = this.getBBox();
                    var x = 155 - bbox.width;
                    d3.select(this)
                        .attr("transform", "translate(" + x + ",43)");
                });

            legendSVG.append("rect")
                .attr("width", 30)
                .attr("height", 15)
                .attr("class", "swatch")
                .style("fill", "#a50026")
                .attr("transform", "translate(160,10)");

            legendSVG.append("text")
                .attr("transform", "translate(170,43)")
                .attr("class", "label")
                .text(maxAssValue);
        }
    } else {

        let legendSVG = d3.select("#colourLegend").append("svg")
            .attr("id", "legendSVG")
            .attr("width", 6 * 35)
            .attr("height", 50);

        legendSVG.append("rect")
            .attr("width", 30)
            .attr("height", 15)
            .attr("class", "swatch")
            .style("fill", "#969696")
            .attr("transform", "translate(0,10)");

        legendSVG.append("text")
            .attr("transform", "translate(10,43)")
            .attr("class", "label")
            .text("0");
    }
}

/**
 *  export visualisation
 */

function exportSVG() {

    let svg = document.getElementById("svgElement");
    let serializer = new XMLSerializer();
    let content = serializer.serializeToString(svg);

    let a = document.createElement("a");
    let blob = new Blob([ content ], {type : "text/plain;charset=UTF-8"});
    a.href = window.URL.createObjectURL(blob);
    a.download = "ontoplot-" + ontoName + ".svg";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    delete a;
}

/**
 *  resizable pane
 */

$(function() {
    $(".left.pane").resizable({
        handles: "e",
        stop: function(event, ui) {
            setWidthInPercent(ui.element);
        }
    });
    $(".right.pane").resizable({
        handles: "w",
        resize: function(event, ui) {
            ui.position.left = 0;
        },
        stop: function(event, ui) {
            setWidthInPercent(ui.element);
        }
    });

    function setWidthInPercent(element) {
        var percentageWidth = (element.width() / element.parent().width()) * 100;
        element.width(percentageWidth + '%');

        d3.select("#minimapSvg").remove();
        d3.select("#brushSvg").remove();
        drawMinimap(minimapHierarchyData, minimapHeightDict);
    }
});