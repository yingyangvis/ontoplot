function createPropertyList() {

    let properties = Object.keys(assDict);
    properties.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });

    let form = document.createElement("form");
    form.setAttribute("id", "property_buttons");
    for (let i = 0; i < properties.length; i++) {
        let property = properties[i];
        let div = document.createElement("div");
        div.setAttribute("class", "form-check");
        div.setAttribute("type", "dynamic");
        div.setAttribute("name", property);
        let input = document.createElement("input");
        input.setAttribute("class", "form-check-input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("name", "a_property");
        input.setAttribute("id", property);
        input.setAttribute("value", property);
        input.setAttribute("onclick", "constructOperation();");
        let label = document.createElement("label");
        label.setAttribute("class", "form-check-label");
        label.setAttribute("for", property);
        label.setAttribute("value", property);
        if (property.lastIndexOf("http://") == 0) {
            label.innerHTML += property.substr(property.lastIndexOf('/') + 1);
        } else {
            label.innerHTML += property;
        }
        // if (i == 0) {
        //     input.setAttribute("checked", "checked");
        // }
        label.onmouseover = function (e) {
            tooltip
                .style("left", (e.pageX + 10) + "px")
                .style("top", (e.pageY - 20) + "px")
                .style("display", "inline-block")
                .style("opacity", .9)
                .html(
                    label.innerHTML
                );

            let item = document.getElementById(property);
            let backgroundColour = $(item).parent('div')[0].style.backgroundColor;

            d3.selectAll('[ass="' + property + '"]')
                .attr("stroke-width", function() {
                    return 2.5;
                });

            if (item.checked || backgroundColour) {
                for (let node of Object.keys(assDict[item.value])) {
                    d3.selectAll('[url="' + node + '"]')
                        .transition()
                        .duration(300)
                        // .attr("transform", function() {
                        //     let cx = this.getAttribute("cx");
                        //     let cy = this.getAttribute("cy");
                        //     return "translate(" + -1 * cx + "," + -1 * cy + ")" + " scale(2)";
                        // })
                        .each(function() {
                            d3.select("circle#miniCircle" + this.getAttribute("id"))
                                .transition()
                                .duration(300)
                                .attr("transform", function () {
                                    return "translate(" + -2 * this.getAttribute("cx") + "," + -2 * this.getAttribute("cy") + ")" + " scale(3)";
                                });
                        });;
                }
            }
        };
        label.onmouseout = function () {
            tooltip.style("display", "none");
            deHighlightPropertyCellsAndMinimap(property);
            // d3.selectAll(".circle")
            //     .transition()
            //     .duration(500)
            //     .attr("transform", "scale(1)");
            d3.selectAll(".minicircle")
                .transition()
                .duration(500)
                .attr("transform", "scale(1)");
        };
        div.appendChild(input);
        div.appendChild(label);
        form.appendChild(div);
    }
    document.getElementById("property_list").appendChild(form);

    let firstProperty = properties[0];
    activeProperty = document.getElementById(firstProperty).parentNode.childNodes[1];
    activeProperty.style.background = "rgba(72, 137, 244, 0.3)";

    return assDict[firstProperty];
}

function reorderPropertyList() {

    let properties = document.getElementsByName("a_property");

    let selectedProperties = document.querySelectorAll('input[name="a_property"]:checked');

    for (let ele of selectedProperties) {

        let labelIndex = ele.getAttribute("index");

        let inputIndex = $(properties).index(ele);

        if (labelIndex != inputIndex) {
            let parent = ele.parentElement.parentElement;
            parent.insertBefore(ele.parentElement, properties[labelIndex].parentElement, );
        }
    }

    reorderActiveProperty(properties);
}

function reorderActiveProperty(properties) {
    let activeInput = activeProperty.parentNode.firstChild;
    if (!activeInput.getAttribute("index") && !activeInput.getAttribute("propertyArray")) {
        let parent = activeInput.parentElement;
        parent.parentElement.insertBefore(parent, properties[labeledProperties.length].parentElement);

    }
}

function updatePropertyList() {

    let selectedClassProperties = {};

    if (selectedNodes.length > 0) {
        for (let node of selectedNodes) {
            if (classAssDict[node.url]) {
                for (let property of Object.keys(classAssDict[node.url])) {
                    if (selectedClassProperties[property]) {
                        selectedClassProperties[property] += 1;
                    } else {
                        selectedClassProperties[property] = 1;
                    }
                }
            }
        }
    }

    let properties = document.getElementsByName("a_property");
    for (let ele of properties) {
        ele.parentElement.style.backgroundColor = "";
    }

    for (let property of Object.keys(selectedClassProperties)) {

        let ele = document.getElementById(property);

        let parent = ele.parentElement;

        if (selectedClassProperties[property] == selectedNodes.length) {
            parent.style.backgroundColor = "rgba(0, 0, 0, 0.2)";
        } else {
            parent.style.backgroundColor = "rgba(29, 29, 29, 0.1)";
        }

        if (!ele.getAttribute("label")) {
            parent.parentElement.insertBefore(parent, properties[labeledProperties.length].parentElement, );
        }
    }

    reorderActiveProperty(properties);
}
