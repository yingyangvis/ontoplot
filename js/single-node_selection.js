var nodeAss;

function checkNodeStatus(d) {

    if (clickedNode) {

        // getPropertyAss();

        if (d.id != clickedNode.id) {

            // select a different node

            selectedAssDict = JSON.parse(JSON.stringify(mouseoverAss));

            colourDict = JSON.parse(JSON.stringify(selectedAssDict));

            clickOneNode(d);

            d3.select("#focus-mode_button")
                .style("color", "black")
                .style("background-color", "white");

        } else {

            // deselect node

            if (focused) {

                selectedAssDict = JSON.parse(JSON.stringify(mouseoverAss));

                colourDict = JSON.parse(JSON.stringify(selectedAssDict));

                // deselect ass node with focus mode

                show("loading", true);
                d3.select("#ontoplot").style("opacity", .3);

                d3.select("#minimapSvg").remove();

                let nodeId = clickedNode.id;
                let prePosition = $("#" + clickedNode.id).offset();

                d3.select("#notification_bar").style("opacity", 0);
                collapseInfoPanel();
                d3.selectAll(".classInfo").remove();
                d3.selectAll(".searchResult").style("color", "#969696");

                setTimeout(function () {

                    d3.select("svg").remove();
                    preDraw(selectedAssDict);

                    let circleDom = document.getElementById(nodeId);
                    scrollToDom(prePosition.left - 16, prePosition.top - 16, circleDom);

                    d3.select("#ontoplot").style("opacity", 1);

                    d3.select("#focus-mode_button")
                        .style("color", "black")
                        .style("background-color", "white");

                    d3.select("#label_button")
                        .style("color", "#969696")
                        .style("background-color", "white");

                    setTimeout(function () {
                        showPathLabels();
                        d3.selectAll(".propertyLabelText").remove();
                        d3.selectAll(".propertyLabelLine").remove();
                        d3.selectAll(".propertyLabelBox").remove();
                        showAssLabels();
                        // drawPartialLabels();
                    }, 200);

                }, 10);

            } else {

                // deselect ass node without focus mode & none ass node

                colourDict = JSON.parse(JSON.stringify(selectedAssDict));

                d3.selectAll(".circle")
                    .style("fill", function (d) {
                        return getCircleColour(d);
                    })
                    .attr("filter", "null");

                d3.select("circle#" + clickedNode.id)
                    .style("stroke-width", 0);

                d3.selectAll(".box")
                    .style("fill", "white")
                    .attr("back-colour", "white");

                collapseInfoPanel();
                d3.selectAll(".classInfo").remove();

                d3.select("#notification_bar")
                    .style("opacity", 0);

                d3.select("#label_button")
                    .style("color", "#969696")
                    .style("background-color", "white");

                d3.selectAll(".propertyLabelText").remove();
                d3.selectAll(".propertyLabelLine").remove();
                d3.selectAll(".propertyLabelBox").remove();
                showAssLabels();
                // drawPartialLabels();
                updateLabel();
            }

            selectedNodes = [];
            clickedNode = null;

            updatePropertyList();
        }
    } else {

        // select a node

        clickOneNode(d);

        d3.select("#focus-mode_button")
            .style("color", "black")
            .style("background-color", "white");
    }
}

function clickOneNode(node) {

    colouredCirclePositionDict = {};

    d3.selectAll(".circle").style("stroke-width", 0);
    d3.select("circle#" + node.id)
        .style("stroke", "#4889F4")
        .style("stroke-width", 3)
        .transition()
        .duration(1)
        .attr("transform", "scale(1)");

    getClassInfo(node);
    expandInfoPanel();

    showNotificationBar();

    updatePropertyList();

    d3.selectAll(".hiddenCircle").remove();
    d3.selectAll(".direction_arrow").style("visibility", "hidden");

    clickedNode = node;
    minimapCircleDict = {};

    if (selectedAssDict[node.url]) {

        nodeAss = {};

        getNodeAss(node);

        let input = activeProperty.parentNode.firstChild;
        let propertyAttr = input.getAttribute("propertyArray");
        if (!propertyAttr) {
            showAssArrow(node);
        }

        d3.selectAll(".circle")
            .style("fill", function (d) {
                return getCircleColour(d);
            });

        for (let url of Object.keys(nodeAss)) {
            showAllCircles(url);
        }

        d3.selectAll(".propertyLabelText").remove();
        d3.selectAll(".propertyLabelLine").remove();
        d3.selectAll(".propertyLabelBox").remove();

        showAssLabels();
        // drawPartialLabels();

        d3.select("#label_button")
            .style("color", "white")
            .style("background-color", "#969696");

    } else {

        d3.selectAll(".circle").style("fill", "#969696");

        showAllCircles(node.url);

        d3.selectAll(".propertyLabelText").remove();
        d3.selectAll(".propertyLabelLine").remove();
        d3.selectAll(".propertyLabelBox").remove();

        d3.select("#label_button")
            .style("color", "#969696")
            .style("background-color", "white");
    }

    showPathLabels();

    d3.selectAll('[url="' + node.url + '"]')
        .style("fill", function (d) {
            return getIdenticalCircleColour(d, this, clickedNode);
        });

    drawCircleShadow();

    updateMinimap();

    // setTimeout(function() {
    //     let prePosition = $("#" + node.id).offset();
    //     let circleDom = document.getElementById(node.id);
    //     scrollToDom(prePosition.left - 13, prePosition.top - 10, circleDom);
    // }, 100);
}