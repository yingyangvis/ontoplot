function initShadow() {

    let definition = svgGroup.append("defs");

    let f1 = definition.append("filter")
        .attr("id", "fee08b")
        .attr("x", "-5000%")
        .attr("y", "-5000%")
        .attr("width", "10000%")
        .attr("height", "10000%");
    f1.append("feFlood")
        .attr("flood-color", "#fee08b")
        .attr("result", "color");
    f1.append("feComposite")
        .attr("in", "color")
        .attr("in2", "SourceGraphic")
        .attr("result", "mask")
        .attr("operator", "in");
    f1.append("feMorphology")
        .attr("in", "mask")
        .attr("result", "dilated")
        .attr("operator", "dilate")
        .attr("radius", "4")
    f1.append("feGaussianBlur")
        .attr("in", "dilated")
        .attr("result", "blur")
        .attr("stdDeviation", 6);
    f1.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("mode", "normal");

    let f2 = definition.append("filter")
        .attr("id", "fdae61")
        .attr("x", "-5000%")
        .attr("y", "-5000%")
        .attr("width", "10000%")
        .attr("height", "10000%");
    f2.append("feFlood")
        .attr("flood-color", "#fdae61")
        .attr("result", "color");
    f2.append("feComposite")
        .attr("in", "color")
        .attr("in2", "SourceGraphic")
        .attr("result", "mask")
        .attr("operator", "in");
    f2.append("feMorphology")
        .attr("in", "mask")
        .attr("result", "dilated")
        .attr("operator", "dilate")
        .attr("radius", "3")
    f2.append("feGaussianBlur")
        .attr("in", "dilated")
        .attr("result", "blur")
        .attr("stdDeviation", 6);
    f2.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("mode", "normal");

    let f3 = definition.append("filter")
        .attr("id", "f46d43")
        .attr("x", "-5000%")
        .attr("y", "-5000%")
        .attr("width", "10000%")
        .attr("height", "10000%");
    f3.append("feFlood")
        .attr("flood-color", "#f46d43")
        .attr("result", "color");
    f3.append("feComposite")
        .attr("in", "color")
        .attr("in2", "SourceGraphic")
        .attr("result", "mask")
        .attr("operator", "in");
    f3.append("feMorphology")
        .attr("in", "mask")
        .attr("result", "dilated")
        .attr("operator", "dilate")
        .attr("radius", "3")
    f3.append("feGaussianBlur")
        .attr("in", "dilated")
        .attr("result", "blur")
        .attr("stdDeviation", 6);
    f3.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("mode", "normal");

    let f4 = definition.append("filter")
        .attr("id", "d73027")
        .attr("x", "-5000%")
        .attr("y", "-5000%")
        .attr("width", "10000%")
        .attr("height", "10000%");
    f4.append("feFlood")
        .attr("flood-color", "#d73027")
        .attr("result", "color");
    f4.append("feComposite")
        .attr("in", "color")
        .attr("in2", "SourceGraphic")
        .attr("result", "mask")
        .attr("operator", "in");
    f4.append("feMorphology")
        .attr("in", "mask")
        .attr("result", "dilated")
        .attr("operator", "dilate")
        .attr("radius", "3")
    f4.append("feGaussianBlur")
        .attr("in", "dilated")
        .attr("result", "blur")
        .attr("stdDeviation", 6);
    f4.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("mode", "normal");

    let f5 = definition.append("filter")
        .attr("id", "a50026")
        .attr("x", "-5000%")
        .attr("y", "-5000%")
        .attr("width", "10000%")
        .attr("height", "10000%");
    f5.append("feFlood")
        .attr("flood-color", "#a50026")
        .attr("result", "color");
    f5.append("feComposite")
        .attr("in", "color")
        .attr("in2", "SourceGraphic")
        .attr("result", "mask")
        .attr("operator", "in");
    f5.append("feMorphology")
        .attr("in", "mask")
        .attr("result", "dilated")
        .attr("operator", "dilate")
        .attr("radius", "2")
    f5.append("feGaussianBlur")
        .attr("in", "dilated")
        .attr("result", "blur")
        .attr("stdDeviation", 6);
    f5.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "blur")
        .attr("mode", "normal");
}

function drawCircleShadow() {

    let activeAss;

    let operation = getSelectionByName("an_operation");
    if (operation == "intersection") {
        activeAss = intersectionAss;
    } else {
        activeAss = mouseoverAss;
    }

    for (let key of Object.keys(activeAss)) {
        d3.selectAll('[url="' + key + '"]')
            .attr("filter", function (d) {
                if (this.style.fill == "rgb(150, 150, 150)") {

                    let nodeAssStrength = 0;
                    if (activeAss[d.url].length) {
                        nodeAssStrength = activeAss[d.url].length;
                    } else {
                        for (let ass of Object.keys(activeAss[d.url])) {
                            nodeAssStrength += activeAss[d.url][ass].length;
                        }
                    }

                    let filter;
                    if (nodeAssStrength == maxAssValue) {
                        filter = "#a50026";
                    } else if (nodeAssStrength == 0) {
                        return "null";
                    } else {
                        filter = colourScale(nodeAssStrength);
                    }
                    return "url(" + filter + ")";
                } else {
                    return "null";
                }
            });
    }
}

function getAssChildren(node, array) {

    if (node.children) {

        for (let child of node.children) {

            if (child.data.elements) {
                for (let ele of child.data.elements) {
                    if (colourDict[ele.url]) {
                        array.push(ele)
                    }
                }
            }

            getAssChildren(child, array);
        }
    } else if (node._children) {

        for (let child of node._children) {

            if (child.data.elements) {
                for (let ele of child.data.elements) {
                    if (colourDict[ele.url]) {
                        array.push(ele)
                    }
                }
            }

            getAssChildren(child, array);
        }
    }
}