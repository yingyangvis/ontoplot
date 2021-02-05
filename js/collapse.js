let changedWidth;

function collapse(node) {

    d3.select("#box" + node.data.id)
        .attr("width", function() {
            changedWidth = visScale - parseInt(this.getAttribute("width"));
            return visScale;
        });

    d3.selectAll('[box="' + node.data.id + '"]')
        .style("display", "none");

    d3.selectAll('[button="' + node.data.id + '"]')
        .style("display", "none");

    d3.select("#siblingBox" + node.data.id)
        .style("display", "none");

    d3.select("#minibox" + node.data.id)
        .style("opacity", 0.5)
        .style("stroke-opacity", 0.1);

    if (node.children) {

        collapseSubtree(node);

        node._children = node.children;
        node.children = null;

        if (node.data._w > 1) {
            drawTriangle(node.data.elements[0]);
        } else {
            drawBar(node.data.elements[0]);
        }

    }  else if (node.data.elements.length > 1) {

        if (heightDict[node.depth].length > 1) {
            let index = heightDict[node.depth].indexOf(node.data._h);
            heightDict[node.depth].splice(index, 1);
            node.data._ch = 1;
        }

        drawSquare(node.data.elements[0]);
    }

    node.data.collapsed = true;

    compressedNodes.push(node.data);

    if (node.parent) {
        changeAncestor(node);
    }

    moveRightSubtrees(node);

    changeLowerSubtrees();

    moveGlyphs();

    resizeSVG();

    showPathLabels();

    updateLabel();

    if (!clickedNode && selectedNodes.length > 0) {
        d3.selectAll(".multiNodeLabel").remove();
        pinMultiNodeLabels();
    }

    updateBrush();

    updateMinimap();

    if (clickedNode) {
        updateAssArrow();
        drawHiddenCircle();
    }
}

function collapseSubtree(node) {

    for (let child of node.children) {

        if (heightDict[child.depth].length > 1) {
            let index = heightDict[child.depth].indexOf(child.data._ch);
            heightDict[child.depth].splice(index, 1);
        }

        d3.select("#box" + child.data.id)
            .style("display", "none");

        d3.selectAll('[box="' + child.data.id + '"]')
            .style("display", "none");

        d3.selectAll('[button="' + child.data.id + '"]')
            .style("display", "none");

        d3.select("#siblingBox" + child.data.id)
            .style("display", "none");

        d3.selectAll('[siblingLine="' + child.data.id + '"]')
            .style("display", "none");

        d3.select("#minibox" + child.data.id)
            .style("opacity", 0.5)
            .style("stroke-opacity", 0.1);

        if (child.children) {
            collapseSubtree(child);
        }
    }
}

function drawHiddenCircle() {
    
    d3.selectAll(".hiddenCircle").remove();

    let circleDom = document.getElementById(clickedNode.id);

    if (circleDom) {

        let expandStack = [];

        expandAncestor(circleDom.getAttribute("box"), expandStack);

        if (expandStack.length > 0) {

            let node = expandStack.pop();

            let box = document.getElementById("box" + clickedNode.box);
            let leaf = box.getAttribute("leaf");

            if (node != clickedNode.box || leaf == "false" || !leaf) {
                let vertex = document.getElementById("box" + node);
                svgGroup.append("circle")
                    .attr("cx", parseInt(vertex.getAttribute("x")) + 12.5)
                    .attr("cy", parseInt(vertex.getAttribute("y")) + 12.5)
                    .attr("class", "hiddenCircle")
                    .attr("id", "hiddenCircleDom")
                    .attr("inside", clickedNode.id)
                    .attr("fill", "none")
                    .attr("stroke", "#4889F4")
                    .attr("stroke-width", 3);
                pulse();
            }
        }

    } else {
        findVertexHill(clickedNode.box);
    }
}


function findVertexHill(node) {

    if (compressionDict[node]) {

        findVertexHill(compressionDict[node].id);

    } else {

        let hillDom = document.getElementById("box" + node);
        let display = hillDom.style.display;
        let visibility = hillDom.style.visibility;

        if (display == "none") {

            let expandStack = [];
            expandAncestor(node, expandStack);

            if (expandStack.length > 0) {
                let box = expandStack.pop();
                let vertex = document.getElementById("box" + box);
                svgGroup.append("circle")
                    .attr("cx", parseInt(vertex.getAttribute("x")) + 12.5)
                    .attr("cy", parseInt(vertex.getAttribute("y")) + 12.5)
                    .attr("class", "hiddenCircle")
                    .attr("id", "hiddenCircleDom")
                    .attr("inside", clickedNode.id)
                    .attr("fill", "none")
                    .attr("stroke", "#4889F4")
                    .attr("stroke-width", 3);
                pulse();
            }
        } else if (visibility == "visible") {
            svgGroup.append("circle")
                .attr("cx", parseInt(hillDom.getAttribute("x")) + 12.5)
                .attr("cy", parseInt(hillDom.getAttribute("y")) + 12.5)
                .attr("class", "hiddenCircle")
                .attr("id", "hiddenCircleDom")
                .attr("inside", clickedNode.id)
                .attr("fill", "none")
                .attr("stroke", "#4889F4")
                .attr("stroke-width", 3);
            pulse();
        } else {
            findHillElement(clickedNode.box);
        }
    }
}

function findHillElement(node) {
    if (compressionDict[node]) {
        if (!compressionDict[node].dummyChildBox) {
            findHillElement(compressionDict[node].id);
        } else {
            let boxDom = document.getElementById("box" + node);
            svgGroup.append("circle")
                .attr("cx", parseInt(boxDom.getAttribute("x")) + 12.5)
                .attr("cy", parseInt(boxDom.getAttribute("y")) + 12.5)
                .attr("class", "hiddenCircle")
                .attr("id", "hiddenCircleDom")
                .attr("inside", clickedNode.id)
                .attr("fill", "none")
                .attr("stroke", "#4889F4")
                .attr("stroke-width", 3);
            pulse();
        }
    }
}

function pulse() {
    let animatedCircle = d3.select("circle#hiddenCircleDom");
    animatedCircle
        .transition()
        .attr("r", visScale / 1.5)
        .duration(200)
        .transition()
        .attr("r", visScale / 2.5)
        .duration(800)
        .on("end", pulse);
}