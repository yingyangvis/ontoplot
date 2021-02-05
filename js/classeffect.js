// function switchPCR() {
//
//     if (document.getElementById("pcr-button").style.backgroundColor == "rgb(128, 0, 0)") {
//
//         d3.selectAll(".pcr").remove();
//         d3.select("#pcr-button")
//             .style("color", "black")
//             .style("background-color", "white")
//             .attr("back-colour", "white");
//         d3.selectAll(".box")
//             .style("fill", "white")
//             .attr("back-colour", "white");
//
//     } else {
//         calculatePCR()
//     }
// }

// function calculatePCR() {
//
//         var assBoxes = [];
//
//         var pcrAss = JSON.parse(JSON.stringify(nodeAss));
//
//         delete pcrAss[clickedNode.url];
//
//         for (let node of Object.keys(pcrAss)) {
//             var circles = $("[url='" + node + "']");
//             for (let circle of circles) {
//                 var box = document.getElementById("box" + circle.getAttribute("box"));
//                 if (assBoxes.findIndex(x => x.id == box.id) === -1) {
//                     assBoxes.push(box);
//                 }
//             }
//         }
//
//         var parentBoxes = [];
//
//         for (let box of assBoxes) {
//             var parentBox = parentDict[box.__data__.data.id];
//             if (parentBoxes.findIndex(x => x.id == parentBox.id) === -1) {
//                 parentBoxes.push(parentBox);
//             }
//         }
//
//         for (let box of parentBoxes) {
//
//             var assCircles = [],
//                 nonAssCircles = [];
//
//             for (let childBox of box.children) {
//                 var childBoxDom = document.getElementById("box" + childBox.id);
//
//                 if (childBoxDom.__data__.data.elements) {
//                     for (let circle of childBoxDom.__data__.data.elements) {
//                         if (pcrAss[circle.url]) {
//                             assCircles.push(circle);
//                         } else {
//                             nonAssCircles.push(circle);
//                         }
//                     }
//                 } else {
//                     for (let circle of childBoxDom.__data__.data._elements) {
//                         nonAssCircles.push(circle);
//                     }
//                 }
//             }
//
//             var pcr = assCircles.length / (assCircles.length + nonAssCircles.length);
//             // var pcr = Math.round(assCircles.length / (assCircles.length + nonAssCircles.length));
//
//             var parentBoxDom = document.getElementById("box" + box.id);
//
//             svgGroup.append("text")
//                 .attr("x", parseInt(parentBoxDom.getAttribute("x")) + 20)
//                 .attr("y", parseInt(parentBoxDom.getAttribute("y")) + 15)
//                 .attr("font-size", "8pt")
//                 .attr("class", "pcr")
//                 .attr("box", parentBoxDom.getAttribute("id"))
//                 .text(pcr);
//
//             if (pcr == 1) {
//                 parentBoxDom.setAttribute("style", "fill: #8FBC8F; stroke: rgb(150, 150, 150);")
//                 parentBoxDom.setAttribute("back-colour", "#8FBC8F");
//
//                 var label = parentBoxDom.__data__.data.elements[0].label;
//                 if (label.indexOf("http://") == 0) {
//                     label = label.substr(label.lastIndexOf('/') + 1);
//                 }
//
//                 var circleDom = document.getElementById(parentBoxDom.__data__.data.elements[0].id);
//
//                 svgGroup.append("text")
//                     .attr("x", circleDom.getAttribute("cx"))
//                     .attr("y", circleDom.getAttribute("cy") - 12)
//                     .attr("dy", ".35em")
//                     .attr("fill", "#a50026")
//                     .attr("font-weight", 900)
//                     .attr("class", "propertyLabelText")
//                     .attr("id", parentBoxDom.__data__.data.elements[0].id)
//                     .text(label);
//             }
//         }
//
//         d3.select("#pcr-button")
//             .style("color", "white")
//             .style("background-color", "#800000")
//             .attr("back-colour", "#800000");
// }

// function updatePCRText() {
//
//     var pcrs = document.getElementsByClassName("pcr");
//
//     for (let text of pcrs) {
//
//         var box = document.getElementById(text.getAttribute("box"))
//
//         text.setAttribute("x", parseInt(box.getAttribute("x")) + 20);
//         text.setAttribute("y", parseInt(box.getAttribute("y")) + 15);
//
//         if (box.getAttribute("width") == 0) {
//             text.style.display = "none";
//         } else {
//             text.style.display = "block";
//         }
//     }
// }