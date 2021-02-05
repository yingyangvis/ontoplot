var boxXDict,
    visibleX;

function drawBrush() {

    let boxes = document.getElementsByClassName("box");

    boxXDict = {};

    for (let box of boxes) {
        if (box.style.display != "none" && box.style.visibility != "hidden") {
            boxXDict[box.getAttribute("x")] = box.__data__;
        }
    }

    let boxX, endBox;

    visibleX = 0;

    for (let i in Object.keys(boxXDict)) {
        let x = parseInt(Object.keys(boxXDict)[i]);
        if (x >= viewWidth - 20) {
            boxX = Object.keys(boxXDict)[i - 1];
            endBox = boxXDict[boxX];
            break;
        }
    }

    if (!endBox) {
        boxX = parseInt(Object.keys(boxXDict)[Object.keys(boxXDict).length - 1]);
        endBox = boxXDict[boxX];
    } else {
        visibleX = boxX;
    }

    let miniEndBox;
    if (endBox.data.dummyChildBox == true) {
        miniEndBox = document.getElementById("minibox" + endBox.data.elements[0].id);
    } else {
        miniEndBox = document.getElementById("minibox" + endBox.data.id);
    }

    let miniEndBoxX = parseInt(miniEndBox.getAttribute("x"));

    let endBoxWidthGap = viewWidth - 27 - boxX;

    let endBoxDom = document.getElementById("box" + endBox.data.id);
    let endBoxWidth;
    if (endBoxDom) {
        endBoxWidth = parseInt(endBoxDom.getAttribute("width"));
    } else {
        endBoxWidth = visScale;
    }

    let brushWidth = miniEndBoxX + (endBoxWidthGap / endBoxWidth) * (endBox.data._w * xScale);

    let width = viewWidth,
        height = parseInt(document.getElementById("minimap").offsetHeight);

    d3.select("#brushSvg").remove();

    brushSvg = d3.select("#minimap").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + 0 + "," + -67 + ")")
        .attr("id", "brushSvg")
        .each(function() {
            moveBrush();
        });

    brushSvg.append("rect")
        .attr("x", 0)
        .attr("y", 0.5)
        .attr("width", brushWidth)
        .attr("height", 60)
        .style("opacity", 0.2)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("fill", "#4889F4")
        .attr("shape-rendering", "crispEdges")
        .attr("id", "brush");

    updateMinimap();
}

function scrollBrush() {

    let distance = parseInt(document.getElementById("ontoplot").scrollLeft) - 20;

    visibleX = parseInt(viewWidth) + 30 + parseInt(distance);

    let startBoxX, endBoxX,
        startBox, endBox;

    for (let i in Object.keys(boxXDict)) {
        let x = parseInt(Object.keys(boxXDict)[i]);
        if (x < distance) {
            startBoxX = Object.keys(boxXDict)[i];
            startBox = boxXDict[startBoxX];
        }
        if (x >= distance + viewWidth) {
            endBoxX = Object.keys(boxXDict)[i - 1];
            endBox = boxXDict[endBoxX];
            break;
        }
    }

    if (!startBox) {
        startBoxX = parseInt(Object.keys(boxXDict)[0]);
        startBox = boxXDict[startBoxX];
    }

    if (!endBox) {
        endBoxX = parseInt(Object.keys(boxXDict)[Object.keys(boxXDict).length - 1]);
        endBox = boxXDict[endBoxX];
    }

    let miniStartBox, miniEndBox;

    if (startBox.data.dummyChildBox == true) {
        miniStartBox = document.getElementById("minibox" + startBox.data.elements[0].id);
    } else {
        miniStartBox = document.getElementById("minibox" + startBox.data.id);
    }

    let miniStartBoxX = parseInt(miniStartBox.getAttribute("x"));

    let startBoxWidthGap = distance - startBoxX;

    let startBoxDom = document.getElementById("box" + startBox.data.id);
    let startBoxWidth;
    if (startBoxDom) {
        startBoxWidth = parseInt(startBoxDom.getAttribute("width"));
    } else {
        startBoxWidth = visScale;
    }

    let brushX = miniStartBoxX + (startBoxWidthGap / startBoxWidth) * (startBox.data._w * xScale);

    if (endBox.data.dummyChildBox == true) {
        miniEndBox = document.getElementById("minibox" + endBox.data.elements[0].id);
    } else {
        miniEndBox = document.getElementById("minibox" + endBox.data.id);
    }

    let miniEndBoxX = parseInt(miniEndBox.getAttribute("x"));

    let endBoxWidthGap = distance + viewWidth - endBoxX;
    
    let endBoxDom = document.getElementById("box" + endBox.data.id);
    let endBoxWidth;
    if (endBoxDom) {
        endBoxWidth = parseInt(endBoxDom.getAttribute("width"));
    } else {
        endBoxWidth = visScale;
    }

    let brushWidth = miniEndBoxX + (endBoxWidthGap / endBoxWidth) * (endBox.data._w * xScale) - brushX;

    d3.select("#brush")
        .attr("x", brushX)
        .attr("width", brushWidth);

    if (distance == -20 && brushWidth > viewWidth + 30) {
        d3.select("#brush").remove();
    }
}

function updateBrush() {
    drawBrush();
    scrollBrush();
    updateMinimap();
}

function moveBrush() {

    let miniboxes = document.getElementsByClassName("minibox");
    let miniboxXDict = {};
    for (let box of miniboxes) {
        miniboxXDict[box.getAttribute("x")] = box.__data__;
    }
    let keys = Object.keys(miniboxXDict)
    keys.sort(sortReverseByCoordinate)

    let svg = document.getElementById("brushSvg");
    let pt = svg.createSVGPoint();
    function cursorPoint(evt){
        pt.x = evt.clientX; pt.y = evt.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    svg.addEventListener("click",function(evt){

        let loc = cursorPoint(evt);
        let locX = parseInt(loc.x);

        let endMinibox;
        for (let key of keys) {
            if (parseInt(key) <= locX) {
                endMinibox = miniboxXDict[key];
                break;
            }
        }

        let id = endMinibox.data.id;
        let endBox = document.getElementById("box" + id);

        if (!endBox) {

            endBox = document.getElementById("box" + compressionDict[id].id);

            if (!endBox) {
                scrollToParentBox(endMinibox.parent);
            } else {
                scrollToBox(endBox);
            }
        } else {
            scrollToBox(endBox);
        }
    },false);
}

function scrollToParentBox(node) {
    let box = document.getElementById("box" + node.data.id);
    if (!box) {
        let compressedBox = document.getElementById("box" + compressionDict[node.data.id].id);
        if (!compressedBox) {
            scrollToParentBox(node.parent)
        } else {
            scrollToBox(compressedBox);
        }
    } else {
        scrollToBox(box);
    }
}