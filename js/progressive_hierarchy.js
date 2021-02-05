var boxes;

function drawPartialHierarchy() {

    let viewWidth = $("#vis").width();

    let cutIndex = 0;

    // let dataX = viewWidth / visScale;

    // let box;

    // boxes = constructedHierarchy.descendants();
    //
    // for (let node of boxes) {
    //
    //     let nodeX = parseInt(node.data.x);
    //
    //     if (nodeX <= dataX) {
    //
    //         let x = node.data.x * visScale;
    //         let y = node.data.y * visScale;
    //         let width = 0;
    //         let height = 0;
    //
    //         box = svgGroup
    //             .append("rect").datum(node)
    //             .attr("x", function (d) {
    //                 if (d.children) {
    //                     boxChildDict[d.data.id] = d.children;
    //                 }
    //                 return x;
    //             })
    //             .attr("y", y)
    //             .attr("width", function (d) {
    //                 if (d.data.compressed) {
    //                     d.data._ch = 1;
    //                     d.data._cw = d.data._w;
    //                     width = visScale;
    //                     return width;
    //                 } else if (d.data.changedWidth) {
    //                     d.data._ch = d.data._h;
    //                     d.data._cw = d.data._w - d.data.changedWidth;
    //                     width = (d.data._w - d.data.changedWidth) * visScale
    //                     return width;
    //                 } else {
    //                     d.data._ch = d.data._h;
    //                     d.data._cw = d.data._w;
    //                     width = d.data._w * visScale;
    //                     return width;
    //                 }
    //             })
    //             .attr("height", function (d) {
    //                 height = Math.max(...heightDict[d.depth]) * visScale
    //                 return height;
    //             })
    //             .attr("depth", function (d) {
    //                 return d.depth;
    //             })
    //             .attr("parent", function (d) {
    //                 return d.parent ? d.parent.data.id : null;
    //             })
    //             .attr("class", "box")
    //             .attr("id", function (d) {
    //                 return "box" + d.data.id;
    //             })
    //             .attr("leaf", function (d) {
    //                 let leaf = true;
    //                 if (d.data.children || d.data._children) {
    //                     leaf = false;
    //                 }
    //                 return leaf;
    //             })
    //             .attr("dummyLeaf", function (d) {
    //                 return d.data.dummyLeafChildBox == true ? true : false;
    //             })
    //             .attr("dummyBox", function (d) {
    //                 return d.data.dummyChildBox == true ? true : false;
    //             })
    //             .style("fill", "white")
    //             .on("mouseover", function (d) {
    //                 if (this.getAttribute("leaf") == "false" && d.children) {
    //                     mouseoverClass(d.data.elements[0], "box", true);
    //                 }
    //             })
    //             .on("mouseout", function () {
    //                 tooltip.style("display", "none");
    //             })
    //             .on("click", function (d) {
    //
    //                 diffClick(
    //                     this,
    //                     // single click
    //                     function () {
    //                     },
    //                     // double click
    //                     function () {
    //                         tooltip.style("display", "none");
    //
    //                         if (d.children || d.data.elements.length > 1 && !d.data.dummyChildBox) {
    //                             beforeCollapse(d);
    //                             setTimeout(function() {
    //                                 collapse(d);
    //                             }, 500);
    //                             afterCollapse(d);
    //                         }
    //                     }
    //                 )
    //             })
    //             .moveToBack();
    //
    //         if (node.children) {
    //
    //             if (boxPositionDict.hasOwnProperty(x)) {
    //                 boxPositionDict[x].push(box._groups[0][0]);
    //             } else {
    //                 boxPositionDict[x] = [box._groups[0][0]];
    //             }
    //
    //             svgGroup.append("rect")
    //                 .attr("x", x)
    //                 .attr("y", y + height)
    //                 .attr("width", width)
    //                 .attr("height", height)
    //                 .style("stroke", "#969696")
    //                 .style("fill", "none")
    //                 .attr("class", "siblingBox")
    //                 .attr("id", "siblingBox" + node.data.id)
    //                 .attr("depth", node.depth + 1);
    //
    //             if (node.children.length > 1) {
    //
    //                 for (let child of node.children) {
    //                     let childX = parseInt(child.data.x) * visScale;
    //                     if (childX != x) {
    //                         svgGroup.append("line")
    //                             .style("stroke", "#969696")
    //                             .attr("x1", childX)
    //                             .attr("y1", y + 2 * height - 8)
    //                             .attr("x2", childX)
    //                             .attr("y2", y + 2 * height)
    //                             .attr("class", "partialSiblingLine")
    //                             .attr("siblingLine", child.data.id)
    //                             .attr("depth", node.depth + 1);
    //                         svgGroup.append("line")
    //                             .style("stroke", "#969696")
    //                             .attr("x1", childX)
    //                             .attr("y1", y + height)
    //                             .attr("x2", childX)
    //                             .attr("y2", y + 2 * height)
    //                             .style("opacity", 0.15)
    //                             .attr("class", "siblingLine")
    //                             .attr("siblingLine", child.data.id)
    //                             .attr("depth", node.depth + 1);
    //                     }
    //                 }
    //             }
    //         }
    //
    //         // cutIndex = boxes.indexOf(node);
    //     }
    // }

    // boxes.splice(0, cutIndex + 1);

    for (let node of circleData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(viewWidth) + 100) {
                drawCircle(node);
                cutIndex = circleData.indexOf(node);
            }
        }
    }
    circleData.splice(0, cutIndex);

    for (let node of squareData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(viewWidth) + 100) {
                drawSquare(node);
                cutIndex = squareData.indexOf(node);
            }
        }
    }
    squareData.splice(0, cutIndex);

    for (let node of barData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(viewWidth) + 100) {
                drawBar(node);
                cutIndex = barData.indexOf(node);
            }
        }
    }
    barData.splice(0, cutIndex);

    for (let node of triangleData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(viewWidth) + 100) {
                drawTriangle(node);
                cutIndex = triangleData.indexOf(node);
            }
        }
    }
    triangleData.splice(0, cutIndex);

    for (let node of hillData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(viewWidth) + 100) {
                drawHill(node);
                cutIndex = hillData.indexOf(node);
            }
        }
    }
    hillData.splice(0, cutIndex);
}

function drawNewPartialHierarchy() {

    let visWidth = parseInt($("#vis").width()) + parseInt($("#ontoplot").scrollLeft());

    let cutIndex = 0;

    // let dataX = visWidth / visScale;
    //
    // let box;
    //
    // for (let node of boxes) {
    //
    //     let nodeX = parseInt(node.data.x);
    //
    //     if (nodeX <= dataX) {
    //
    //         let x = node.data.x * visScale;
    //         let y = node.data.y * visScale;
    //         let width = 0;
    //         let height = 0;
    //
    //         box = svgGroup
    //             .append("rect").datum(node)
    //             .attr("x", function (d) {
    //                 if (d.children) {
    //                     boxChildDict[d.data.id] = d.children;
    //                 }
    //                 return x;
    //             })
    //             .attr("y", y)
    //             .attr("width", function (d) {
    //                 if (d.data.compressed) {
    //                     d.data._ch = 1;
    //                     d.data._cw = d.data._w;
    //                     width = visScale;
    //                     return width;
    //                 } else if (d.data.changedWidth) {
    //                     d.data._ch = d.data._h;
    //                     d.data._cw = d.data._w - d.data.changedWidth;
    //                     width = (d.data._w - d.data.changedWidth) * visScale
    //                     return width;
    //                 } else {
    //                     d.data._ch = d.data._h;
    //                     d.data._cw = d.data._w;
    //                     width = d.data._w * visScale;
    //                     return width;
    //                 }
    //             })
    //             .attr("height", function (d) {
    //                 height = Math.max(...heightDict[d.depth]) * visScale
    //                 return height;
    //             })
    //             .attr("depth", function (d) {
    //                 return d.depth;
    //             })
    //             .attr("parent", function (d) {
    //                 return d.parent ? d.parent.data.id : null;
    //             })
    //             .attr("class", "box")
    //             .attr("id", function (d) {
    //                 return "box" + d.data.id;
    //             })
    //             .attr("leaf", function (d) {
    //                 let leaf = true;
    //                 if (d.data.children || d.data._children) {
    //                     leaf = false;
    //                 }
    //                 return leaf;
    //             })
    //             .attr("dummyLeaf", function (d) {
    //                 return d.data.dummyLeafChildBox == true ? true : false;
    //             })
    //             .attr("dummyBox", function (d) {
    //                 return d.data.dummyChildBox == true ? true : false;
    //             })
    //             .style("fill", "white")
    //             .on("mouseover", function (d) {
    //                 if (this.getAttribute("leaf") == "false" && d.children) {
    //                     mouseoverClass(d.data.elements[0], "box", true);
    //                 }
    //             })
    //             .on("mouseout", function () {
    //                 tooltip.style("display", "none");
    //             })
    //             .on("click", function (d) {
    //
    //                 diffClick(
    //                     this,
    //                     // single click
    //                     function () {
    //                     },
    //                     // double click
    //                     function () {
    //                         tooltip.style("display", "none");
    //
    //                         if (d.children || d.data.elements.length > 1 && !d.data.dummyChildBox) {
    //                             beforeCollapse(d);
    //                             setTimeout(function() {
    //                                 collapse(d);
    //                             }, 500);
    //                             afterCollapse(d);
    //                         }
    //                     }
    //                 )
    //             })
    //             .moveToBack();
    //
    //         if (node.children) {
    //
    //             if (boxPositionDict.hasOwnProperty(x)) {
    //                 boxPositionDict[x].push(box._groups[0][0]);
    //             } else {
    //                 boxPositionDict[x] = [box._groups[0][0]];
    //             }
    //
    //             svgGroup.append("rect")
    //                 .attr("x", x)
    //                 .attr("y", y + height)
    //                 .attr("width", width)
    //                 .attr("height", height)
    //                 .style("stroke", "#969696")
    //                 .style("fill", "none")
    //                 .attr("class", "siblingBox")
    //                 .attr("id", "siblingBox" + node.data.id)
    //                 .attr("depth", node.depth + 1);

                // if (node.children.length > 1) {
                //
                //     for (let child of node.children) {
                //         let childX = parseInt(child.data.x);
                //         if (childX != x) {
                //             let childBoxX = childX * visScale;
                //             svgGroup.append("line")
                //                 .style("stroke", "#969696")
                //                 .attr("x1", childBoxX)
                //                 .attr("y1", y + 2 * height - 8)
                //                 .attr("x2", childBoxX)
                //                 .attr("y2", y + 2 * height)
                //                 .attr("class", "partialSiblingLine")
                //                 .attr("siblingLine", child.data.id)
                //                 .attr("depth", node.depth + 1);
                //             svgGroup.append("line")
                //                 .style("stroke", "#969696")
                //                 .attr("x1", childBoxX)
                //                 .attr("y1", y + height)
                //                 .attr("x2", childBoxX)
                //                 .attr("y2", y + 2 * height)
                //                 .style("opacity", 0.15)
                //                 .attr("class", "siblingLine")
                //                 .attr("siblingLine", child.data.id)
                //                 .attr("depth", node.depth + 1);
                //         }
                //     }
                // }
            // }

            // cutIndex = boxes.indexOf(node);
        // }
    // }

    // boxes.splice(0, cutIndex);

    for (let node of circleData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(visWidth) + 100) {
                drawCircle(node);
                cutIndex = circleData.indexOf(node);
            }
        }
    }
    // circleData.splice(0, cutIndex);

    for (let node of squareData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(visWidth) + 100) {
                drawSquare(node);
                cutIndex = squareData.indexOf(node);
            }
        }
    }
    // squareData.splice(0, cutIndex);

    for (let node of barData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(visWidth) + 100) {
                drawBar(node);
                cutIndex = barData.indexOf(node);
            }
        }
    }
    // barData.splice(0, cutIndex);

    for (let node of triangleData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(visWidth) + 100) {
                drawTriangle(node);
                cutIndex = triangleData.indexOf(node);
            }
        }
    }
    // triangleData.splice(0, cutIndex);

    for (let node of hillData) {
        let box = document.getElementById("box" + node.box);
        if (box) {
            if (parseInt(box.getAttribute("x")) <= parseInt(visWidth) + 100) {
                drawHill(node);
                cutIndex = hillData.indexOf(node);
            }
        }
    }
    // hillData.splice(0, cutIndex);
}