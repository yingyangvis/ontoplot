function expandInfoPanel() {
    let classInfoButton = document.getElementById('classInfoButton');
    let content = classInfoButton.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        classInfoButton.click();
    }
}

function collapseInfoPanel() {
    let classInfoButton = document.getElementById('classInfoButton');
    let content = classInfoButton.nextElementSibling;
    if (content.style.maxHeight) {
        classInfoButton.click();
    }
}

function getClassInfo(node) {

    d3.selectAll(".classInfo").remove();

    let idDom = document.getElementById("class_id");
    let idText = document.createElement("div");
    idText.setAttribute("class", "classInfo");
    idText.innerHTML = node.url;
    idDom.appendChild(idText);

    let labelDom = document.getElementById("class_label");
    let labelText = document.createElement("div");
    labelText.setAttribute("class", "classInfo");
    labelText.innerHTML = node.label;
    labelDom.appendChild(labelText);

    let parentsDom = document.getElementById("class_parents");
    let parentsText = document.createElement("div");
    parentsText.setAttribute("class", "classInfo");
    let parents = classParentDict[node.url];
    for (let parent of parents) {
        let parentText = document.createElement("div");
        parentText.setAttribute("id", parent);
        parentText.innerHTML += labelDict[parent].label;
        parentsText.appendChild(parentText);
    }
    parentsDom.appendChild(parentsText);

    let relationsDom = document.getElementById("class_relations");
    let relationText = document.createElement("div");
    relationText.setAttribute("class", "classInfo");

    for (let relation in classAssDict[node.url]) {

        for (let direction in classAssDict[node.url][relation]) {

            for (let item of classAssDict[node.url][relation][direction]) {

                if (direction == "target") {
                    relationText.innerHTML += ' <span class="classText">' + node.label + '</span>'
                        + ' <span class="relationText" style="color:darkred">' + relation + '</span> '
                        + '<span class="classText">' + labelDict[item].label + '</span><br>';
                } else {
                    relationText.innerHTML += ' <span class="classText">' + labelDict[item].label + '</span>'
                        + ' <span class="relationText" style="color:darkred">' + relation + '</span> '
                        + '<span class="classText">' + node.label + '</span><br>'
                }
            }
        }
    }
    relationsDom.appendChild(relationText);
}