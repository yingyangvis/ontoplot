function mouseoverClass(d, box, mouse) {

    let label;
    if (d.label.indexOf("http://") == 0) {
        label = d.label.substr(d.label.lastIndexOf('/') + 1);
    } else {
        label = d.label;
    }

    let message = d.url + "<br/>" + label;
    // let checkedAss = document.querySelectorAll('input[name="a_property"]:checked');


    let checkedAss = [];

    let input = activeProperty.parentNode.firstChild;
    let propertyAttr = input.getAttribute("propertyArray");

    if (!propertyAttr) {
        checkedAss.push(input);
    } else {
        let properties = propertyAttr.split(",");
        for (let property of properties) {
            checkedAss.push(document.getElementById(property));
        }
    }


    for (let item of checkedAss) {

        let ass;
        if (item.value.indexOf("http://") == 0) {
            ass = item.value.substr(item.value.lastIndexOf('/') + 1);
        } else {
            ass = item.value;
        }

        let activeAss;

        let operation = getSelectionByName("an_operation");
        if (operation == "intersection") {
            activeAss = intersectionAss;
        } else {
            activeAss = mouseoverAss;
        }

        let assStrength;
        if (activeAss[d.url]) {
            if (checkedAss.length == 1) {
                assStrength = activeAss[d.url].length;
            } else {
                if (activeAss[d.url][item.value]) {
                    assStrength = activeAss[d.url][item.value].length;
                } else {
                    assStrength = 0;
                }
            }
        } else {
            assStrength = 0;
        }

        message += "<br/> Number of " + '<span style="font-weight:bold; font-style:italic;">' + ass + '</span>' + " associations: " + assStrength;
    }

    let circleDom = document.getElementById(d.id).getBoundingClientRect();

    let x, y;
    if (mouse) {
        x = d3.event.pageX;
        y = d3.event.pageY;
    } else {
        x = circleDom.x;
        y = circleDom.y;
    }

    if (box == "box") {
        tooltip
            .style("left", (x + 30) + "px")
            .style("top", (y - 60) + "px")
            .style("display", "inline-block")
            .style("opacity", .9)
            .html(
                message
            );

    } else {

        if (clickedNode) {

            tooltip
                .style("left", (x + 30) + "px")
                .style("top", (y - 60) + "px")
                .style("display", "inline-block")
                .style("opacity", .9)
                .html(
                    message
                );

        } else {

            tooltip
                .style("left", (x + 30) + "px")
                .style("top", (y - 60) + "px")
                .style("display", "inline-block")
                .style("opacity", .9)
                .html(
                    message
                );
        }
    }
}