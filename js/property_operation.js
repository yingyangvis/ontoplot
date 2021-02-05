function constructOperation() {

    if (document.querySelectorAll('input[name="a_property"]:checked').length > 1) {
        d3.select("#operation_list")
            .transition()
            .duration(800)
            .style("opacity", 1);
    }
}

function saveOperation() {

    let form = document.createElement("form");
    form.setAttribute("id", "pseudo_property_buttons");

    let index = document.getElementsByName("a_pseudo_property").length;

    let div = document.createElement("div");
    div.setAttribute("class", "form-check");
    div.setAttribute("type", "dynamic");
    div.setAttribute("name", index);

    let input = document.createElement("input");
    input.setAttribute("class", "form-check-input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("name", "a_pseudo_property");
    input.setAttribute("id", index);
    input.setAttribute("value", index);

    let label = document.createElement("label");
    label.setAttribute("class", "form-check-label");
    label.setAttribute("for", index);
    label.setAttribute("value", index);

    let properties = document.querySelectorAll('input[name="a_property"]:checked');

    let pseudoProperties = document.querySelectorAll('input[name="a_pseudo_property"]:checked');

    let letterLabels = [];

    if (document.querySelectorAll('input[name="an_operation"]:checked').length == 0) {
        alert("Please select an operator.")
    } else {

        let operator;
        let union = document.getElementById("union").checked;
        if (union) {
            operator = " &xcup; ";
        } else {
            operator = " &xcap; ";
        }

        let totalLength = properties.length + pseudoProperties.length;

        if (totalLength > 1) {

            let object = constructMultiAssDict(index, operator, properties, pseudoProperties);

            let assObj = object.assObj;

            let propertyArray = object.propertyArray;

            letterLabels = object.letterLabels;

            if (!jQuery.isEmptyObject(assObj)) {

                input.setAttribute("propertyArray", propertyArray);

                for (let i = 0; i < pseudoProperties.length - 1; i++) {
                    let pseudoText = pseudoProperties[i].parentElement.childNodes[1].innerHTML;
                    label.innerHTML += "(" + pseudoText + ")" + operator;
                    pseudoProperties[i].checked = false;
                }

                if (letterLabels.length > 0) {

                    if (pseudoProperties.length > 0) {
                        label.innerHTML += "(" + pseudoProperties[pseudoProperties.length - 1].parentElement.childNodes[1].innerHTML + ")" + operator;
                        pseudoProperties[pseudoProperties.length - 1].checked = false;
                    }

                    for (let i = 0; i < letterLabels.length - 1; i++) {
                        label.innerHTML += letterLabels[i] + operator;
                    }
                    label.innerHTML += letterLabels[letterLabels.length - 1];

                } else {
                    label.innerHTML += "(" + pseudoProperties[pseudoProperties.length - 1].parentElement.childNodes[1].innerHTML + ")";
                    pseudoProperties[pseudoProperties.length - 1].checked = false;
                }
            }
        }
    }

    if (label.innerHTML) {
        div.appendChild(input);
        div.appendChild(label);
        form.appendChild(div);

        document.getElementById("pseudo_property_list").appendChild(form);

        reorderPropertyList();
        document.getElementById("property_div").scrollTop = 0;

        for (let input of properties) {
            input.checked = false;
        }

        document.getElementById("union").checked = false;
        document.getElementById("intersection").checked = false;

        if (index == 0) {
            d3.select("#pseudo_property_div")
                .style("opacity", 1)
                .style("padding-bottom", "4px");
        }

        return input;
    }
}

function performOperation() {

    let properties = document.querySelectorAll('input[name="a_property"]:checked');
    let pseudoProperties = document.querySelectorAll('input[name="a_pseudo_property"]:checked');

    if (properties.length + pseudoProperties.length == 0) {
        clickedNode = null;
        selectedNodes = [];
        selectedAssDict = {};
        colourDict = {};
        mouseoverAss = {};
        activeProperty.style.background = "";
        redrawByAss();
        updatePropertyList();
    } else {

        if (properties.length == 1 && pseudoProperties.length == 0) {

            document.getElementById("union").checked = false;
            document.getElementById("intersection").checked = false;

            constructOneAssDict(properties);
            redrawByAss();

            activeProperty.style.background = "";
            properties[0].checked = false;
            activeProperty = properties[0].parentNode.childNodes[1];
            activeProperty.style.background = "rgba(72, 137, 244, 0.3)";

            reorderPropertyList();
            document.getElementById("property_div").scrollTop = 0;

        } else if (pseudoProperties.length == 1 && properties.length == 0) {

            document.getElementById("union").checked = false;
            document.getElementById("intersection").checked = false;

            let input = pseudoProperties[0];

            selectedAssDict = JSON.parse(JSON.stringify(pseudoAssDict[input.value]));
            colourDict = JSON.parse(JSON.stringify(selectedAssDict));
            mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));

            maxAssValue = 0;
            for (let node of Object.keys(selectedAssDict)) {
                let nodeAssStrength = 0;
                for (let ass of Object.keys(selectedAssDict[node])) {
                    nodeAssStrength += selectedAssDict[node][ass].length;
                }
                maxAssValue = nodeAssStrength > maxAssValue ? nodeAssStrength : maxAssValue;
            }

            redrawByAss();

            activeProperty.style.background = "";
            input.checked = false;
            activeProperty = input.parentNode.childNodes[1];
            activeProperty.style.background = "rgba(72, 137, 244, 0.3)";

            reorderPropertyList();
            document.getElementById("property_div").scrollTop = 0;

        } else {

            let input = saveOperation();
            if (input) {

                activeProperty.style.background = "";

                activeProperty = input.parentNode.childNodes[1];
                activeProperty.style.background = "rgba(72, 137, 244, 0.3)";

                selectedAssDict = JSON.parse(JSON.stringify(pseudoAssDict[input.value]));
                colourDict = JSON.parse(JSON.stringify(selectedAssDict));
                mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));

                maxAssValue = 0;
                for (let node of Object.keys(selectedAssDict)) {
                    let nodeAssStrength = 0;
                    for (let ass of Object.keys(selectedAssDict[node])) {
                        nodeAssStrength += selectedAssDict[node][ass].length;
                    }
                    maxAssValue = nodeAssStrength > maxAssValue ? nodeAssStrength : maxAssValue;
                }

                redrawByAss();
            }
        }
    }
}

function constructOneAssDict(properties) {

    let propertyName = properties[0].value;

    selectedAssDict = assDict[propertyName];

    maxAssValue = selectedAssDict.maxValue;

    colourDict = JSON.parse(JSON.stringify(selectedAssDict));

    mouseoverAss = JSON.parse(JSON.stringify(selectedAssDict));
}

function constructMultiAssDict(index, operator, properties, pseudoProperties) {

    let assDictCopy = JSON.parse(JSON.stringify(assDict));

    let assObj = {};

    let propertyArray = {};

    let letterLabels = [];

    // union on properties
    for (let property of properties) {
        let propertyName = property.value;
        propertyArray[propertyName] = {};
        for (let key of Object.keys(assDictCopy[propertyName])) {
            if (key != "maxValue") {
                let obj = {};
                obj[propertyName] = assDictCopy[propertyName][key];
                if (assObj[key]) {
                    $.extend(assObj[key], obj);
                } else {
                    assObj[key] = obj;
                }
            }
        }
    }
    // intersection on properties
    if (operator == " &xcap; ") {
        for (let property of properties) {
            for (let key of Object.keys(assObj)) {
                if (!assObj[key][property.value]) {
                    delete assObj[key];
                }
            }
        }

        for (let key of Object.keys(assObj)) {
            for (let ass of Object.keys(assObj[key])) {
                let removeIndex = [];
                for (let node of assObj[key][ass]) {
                    for (let otherAss of Object.keys(assObj[key])) {
                        if (!assObj[key][otherAss].includes(node)) {
                            removeIndex.push(assObj[key][ass].indexOf(node));
                        }
                    }
                }
                for (let i = removeIndex.length - 1; i >= 0; i--) {
                    assObj[key][ass].splice(removeIndex[i], 1);
                }
                if (assObj[key][ass].length == 0) {
                    delete assObj[key];
                    break;
                }
            }
        }
    }

    // union with pseudo properties
    if (operator == " &xcup; ") {
        for (let pseudoProperty of pseudoProperties) {

            let temp = pseudoProperty.getAttribute("propertyArray").split(",");
            for (let ele of temp) {
                propertyArray[ele] = {};
            }

            let pseudoAss = JSON.parse(JSON.stringify(pseudoAssDict[pseudoProperty.value]));
            for (let key of Object.keys(pseudoAss)) {
                if (assObj[key]) {
                    for (let ass of Object.keys(pseudoAss[key])) {
                        assObj[key][ass] = pseudoAss[key][ass];
                    }
                } else {
                    assObj[key] = pseudoAss[key];
                }
            }
        }
    } else {
        // intersection with pseudo properties

        if (pseudoProperties.length > 0) {

            let start = 0;

            if (properties.length == 0) {
                assObj = JSON.parse(JSON.stringify(pseudoAssDict[pseudoProperties[0].value]));
                start = 1;

                let temp = pseudoProperties[0].getAttribute("propertyArray").split(",");
                for (let ele of temp) {
                    propertyArray[ele] = {};
                }
            }

            for (let i = start; i < pseudoProperties.length; i++) {

                let temp = pseudoProperties[i].getAttribute("propertyArray").split(",");
                for (let ele of temp) {
                    propertyArray[ele] = {};
                }

                let pseudoAss = JSON.parse(JSON.stringify(pseudoAssDict[pseudoProperties[i].value]));

                for (let key of Object.keys(assObj)) {
                    if (pseudoAss[key]) {
                        for (let ass of Object.keys(pseudoAss[key])) {
                            assObj[key][ass] = pseudoAss[key][ass];
                        }
                    } else {
                        delete assObj[key];
                    }
                }

                for (let key of Object.keys(assObj)) {
                    for (let ass of Object.keys(assObj[key])) {
                        let removeIndex = [];
                        for (let node of assObj[key][ass]) {
                            if (!assObj[node]) {
                                removeIndex.push(assObj[key][ass].indexOf(node));
                            }
                        }
                        for (let i = removeIndex.length - 1; i >= 0; i--) {
                            assObj[key][ass].splice(removeIndex[i], 1);
                        }
                        if (assObj[key][ass].length == 0) {
                            delete assObj[key][ass];
                        }
                    }
                }

                for (let key of Object.keys(assObj)) {
                    if (jQuery.isEmptyObject(assObj[key])) {
                        delete assObj[key];
                    }
                }
            }
        }
    }

    if (jQuery.isEmptyObject(assObj)) {
        alert("No intersection class found.")
    } else {
        pseudoAssDict[index] = assObj;
        letterLabels = labelProperty();
    }

    let keys = Object.keys(propertyArray);
    keys.sort(function (a, b) {
        if (document.getElementById(a).getAttribute("index") > document.getElementById(b).getAttribute("index")) {
            return 1;
        } else {
            return -1;
        }
    })

    return {
        assObj: assObj,
        propertyArray: keys,
        letterLabels: letterLabels
    };
}

function labelProperty() {

    let labels = [];

    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let properties = document.querySelectorAll('input[name="a_property"]:checked');

    let pseudoProperties = document.querySelectorAll('input[name="a_pseudo_property"]:checked');

    if (properties.length + pseudoProperties.length > 1) {

        for (let i = 0; i < properties.length; i++) {

            if (!properties[i].getAttribute("label")) {

                let letter = letters.charAt(labelCount);
                let label = '<span class="letterCircle">' + letter + '</span> ';
                properties[i].parentElement.childNodes[1].innerHTML = label + properties[i].parentElement.childNodes[1].innerHTML;
                properties[i].setAttribute("label", label);
                labels.push(label);

                properties[i].setAttribute("index", labelCount);

                labelCount += 1;

                labeledProperties.push(properties[i]);

            } else {
                labels.push(properties[i].getAttribute("label"));
            }
        }
    } else {
        alert("Please select more than one property to save the operation.")
    }

    return labels;
}
