function showNotificationBar() {

    let commonNodeButtonColour;
    if (document.getElementById("common-node_button")) {
        commonNodeButtonColour = document.getElementById("common-node_button").style.backgroundColor;
    }

    // d3.select("#notification_text").remove();

    let message;
    if (selectedNodes.length == 1) {
        let node = selectedNodes[0];
        let label;
        if (node.label.indexOf("http://") == 0) {
            label = node.label.substr(node.label.lastIndexOf('/') + 1);
        } else {
            label = node.label;
        }
        message = "Class " + '<span style="font-weight:bold; font-style:italic;">' + label + '</span>' + " is selected. ";
    } else {
        message = '<span style="font-weight:bold; font-style:italic;">' + selectedNodes.length + '</span>' + " classes are selected. ";
    }

    if (focused) {
        message += "Use shift clicking to select more classes. " + ' <button id="focus-mode_button" onclick="checkClickedNodes()" style="color: white; background-color: #800000;">FOCUS MODE</button>';
    } else {
        message += "Use shift clicking to select more classes. " + ' <button id="focus-mode_button" onclick="checkClickedNodes()">FOCUS MODE</button>';
    }

    if (selectedNodes.length > 1) {
        if (commonNodeButtonColour == "rgb(128, 0, 0)") {
            message += ' <button id="common-node_button" onclick="checkCommonNodeButtonStatus()" style="color: white; background-color: #800000;">SHOW COMMON NODE</button>';
        } else {
            message += ' <button id="common-node_button" onclick="checkCommonNodeButtonStatus()">SHOW COMMON NODE</button>';
        }
    }

    // let notificationDom = document.getElementById("notification_bar");
    // let notificationText = document.createElement("div");
    // notificationText.setAttribute("id", "notification_text");

    let notificationText = document.getElementById("notification_text");
    notificationText.innerHTML = message;
    // notificationDom.appendChild(notificationText);

    d3.select("#notification_bar")
        .transition()
        .duration(300)
        .style("opacity", 0.5);
}