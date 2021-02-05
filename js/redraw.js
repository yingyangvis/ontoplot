function redrawByOnto() {

    show('loading', true);
    show('uploading', false);
    show('ontoplot', false);

    d3.select("#minimapSvg").remove();
    d3.select("#brushSvg").remove();

    activeOnto.style.backgroundColor = "";

    tooltip.style("display", "none");

    d3.select("#notification_bar").style("opacity", 0);
    // d3.select("#focus-mode_button").remove();

    d3.select("#operation_list").style("opacity", 0);
    d3.select("#pseudo_property_div")
        .style("opacity", 0)
        .style("padding-bottom", "0px");
    // document.getElementById("union").checked = true;
    d3.select("#property_buttons").remove();
    d3.select("svg").remove();
    document.getElementById("inputLabel").value = null;
    d3.selectAll(".searchResult").remove();
    collapseInfoPanel();
    d3.selectAll(".classInfo").remove();
    d3.selectAll(".direction_arrow")
        .style("visibility", "hidden");

    nodeAss = {};

    clickedNode = null;

    labelCount = 0;
    d3.selectAll("#pseudo_property_buttons").remove();

    if (upload) {

        ontoName = uploadName;
        ontoPath = ontoName;

        let form = document.getElementById("onto_list");
        let ontoFile = ontoName.split("_")[1];
        let onto = ontoFile.split(".")[0];
        let div = document.createElement("div");
        div.setAttribute("class", "form-check");
        let input = document.createElement("input");
        input.setAttribute("class", "form-check-input");
        input.setAttribute("type", "radio");
        input.setAttribute("name", "an_onto");
        input.setAttribute("id", ontoName);
        input.setAttribute("value", ontoName);
        input.setAttribute("userOnto", "true");
        input.setAttribute("onclick", "redrawByOnto()");
        input.setAttribute("checked", "checked");
        let label = document.createElement("label");
        label.setAttribute("class", "form-check-label");
        label.setAttribute("id", "label" + ontoName)
        label.setAttribute("for", ontoName);
        label.innerHTML = onto;
        div.appendChild(input);
        div.appendChild(label);
        form.insertBefore(div, form.firstChild);

        input.checked = false;
        activeOnto = label;
        activeOnto.style.background = "rgba(72, 137, 244, 0.3)";

        upload = false;

    } else {
        ontoName = document.querySelector('input[name="an_onto"]:checked').value;
        let userOnto = document.querySelector('input[name="an_onto"]:checked').getAttribute("userOnto");
        if (userOnto == "true") {
            ontoPath = ontoName;
        } else {
            ontoPath = "onto/" + ontoName;
        }

        let input = document.getElementById(ontoName);
        input.checked = false;
        activeOnto = document.getElementById("label" + ontoName);
        activeOnto.style.background = "rgba(72, 137, 244, 0.3)";
    }

    document.getElementById("fileuploader").value = null;

    loadData(ontoPath);

    scrollToLeftTop();
}

function redrawByAss() {

    show("loading", true);
    show("ontoplot", false);

    d3.select("#minimapSvg").remove();
    d3.select("#brushSvg").remove();

    tooltip.style("display", "none");
    d3.select("#notification_bar").style("opacity", 0);
    d3.selectAll(".searchResult").style("color", "#969696");
    d3.selectAll(".direction_arrow")
        .style("visibility", "hidden");

    d3.select("#common-node_button")
        .style("color", "#000000")
        .style("background-color", "white");

    if (jQuery.isEmptyObject(selectedAssDict)) {
        maxAssValue = 0;
    }

    drawColourLegend();

    d3.select("svg").remove();
    preDraw();

    if (clickedNode) {

        nodeAss = {};
        setTimeout(function () {
            clickOneNode(clickedNode);
        }, 100);

    } else if (selectedNodes.length > 0) {

        nodeAss = {};
        setTimeout(function () {
            let temp = [];
            for (let node of selectedNodes) {
                if (document.getElementById(node.id)) {
                    temp.push(document.getElementById(node.id).__data__);
                }
            }
            selectedNodes = temp;
            collectClickedNodes();
        }, 100);

    } else {

        setTimeout(function () {
            showPathLabels();
            d3.selectAll(".propertyLabelText").remove();
            d3.selectAll(".propertyLabelLine").remove();
            d3.selectAll(".propertyLabelBox").remove();
            showAssLabels();
            // drawPartialLabels();
            updateMinimap();
        }, 200);
    }

    scrollToLeftTop();
}

function focusMode() {

    nodeAss = {};

    getNodeAss(clickedNode);

    if (Object.keys(colourDict).length <= 1) {
        clickOneNode(clickedNode);
        d3.select("#focus-mode_button")
            .style("color", "white")
            .style("background-color", "#800000");
    } else {

        mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));

        selectedAssDict = nodeAss;

        d3.select("#minimapSvg").remove();
        d3.select("#brushSvg").remove();

        let prePosition = $("#" + clickedNode.id).offset();

        setTimeout(function () {

            minimapCircleDict = {};

            d3.select("svg").remove();
            preDraw();

            d3.selectAll('[url="' + clickedNode.url + '"]')
                .style("fill", function (d) {
                    return getIdenticalCircleColour(d, this, clickedNode);
                });

            let circleDom = document.getElementById(clickedNode.id);
            // scrollToDom(prePosition.left, prePosition.top, circleDom);

            d3.select("circle#" + clickedNode.id)
                .style("stroke", "#4889F4")
                .style("stroke-width", 3);

            let input = activeProperty.parentNode.firstChild;
            let propertyAttr = input.getAttribute("propertyArray");
            if (!propertyAttr) {
                showAssArrow(clickedNode);
            }

            d3.select("#ontoplot").style("opacity", 1);

            updatePropertyList();

            setTimeout(function () {
                showPathLabels();
                showAssLabels();
                // drawPartialLabels();
            }, 100);

            d3.select("#label_button")
                .style("color", "white")
                .style("background-color", "#969696");

            showNotificationBar();

            scrollBrush();

            updateMinimap();

            d3.select("#focus-mode_button")
                .style("color", "white")
                .style("background-color", "#800000");

            focused = true;

            scrollToMiddle(circleDom);

        }, 10);
    }
}

function resetView() {

    clickedNode = null;
    selectedNodes = [];
    nodeAss = {};

    activeProperty.parentNode.firstChild.checked = true;
    performOperation();

    updatePropertyList();
}