var highlightBoxes;

function beforeCollapse(node) {

    highlightBoxes = [];

    if (node.children) {
        findChildren(node, highlightBoxes);
    } else if (node._children) {
        for (let child of node._children) {
            highlightBoxes.push(child);
            findChildren(child, highlightBoxes);
        }
    }

    d3.select("rect#box" + node.data.id).transition()
        .style("fill", "#ffcccc")
        .duration(100);

    for (let box of highlightBoxes) {
        d3.select("rect#box" + box.data.id).transition()
            .style("fill", "#ffcccc")
            .duration(100);
    }
}

function afterCollapse(node) {

    var delayTime;

    if (node.children) {
        delayTime = 1;
    } else {
        delayTime = Math.log2(highlightBoxes.length + 1) / 2 + 1;
    }

    setTimeout(function() {

        d3.select("rect#box" + node.data.id).transition()
            .style("fill", function(d) {
                var colour = document.getElementById("box" + d.data.id).getAttribute("back-colour");
                if (colour) {
                    return colour;
                } else {
                    return "white";
                }
            })
            .duration(1000);

        for (let box of highlightBoxes) {
            d3.select("rect#box" + box.data.id).transition()
                .style("fill", function(d) {
                    var colour = document.getElementById("box" + d.data.id).getAttribute("back-colour");
                    if (colour) {
                        return colour;
                    } else {
                        return "white";
                    }
                })
                .duration(1000);
        }

    }, delayTime * 800);
}

function beforeExpand(node) {
    d3.select("rect#box" + node.data.id).transition()
        .style("fill", "#ffcccc")
        .duration(100);
}

function afterExpand(node) {

    highlightBoxes = [];

    if (node.children) {
        findChildren(node, highlightBoxes);
    } else if (node._children) {
        for (let child of node._children) {
            highlightBoxes.push(child);
            findChildren(child, highlightBoxes);
        }
    }

    var delayTime;

    if (node.children) {
        delayTime = 1;
    } else {
        delayTime = Math.log2(highlightBoxes.length + 1) / 2 + 1;
    }

    setTimeout(function() {

        d3.select("rect#box" + node.data.id).transition()
            .style("fill", function(d) {
                var colour = document.getElementById("box" + d.data.id).getAttribute("back-colour");
                if (colour) {
                    return colour;
                } else {
                    return "white";
                }
            })
            .duration(1000);

        for (let box of highlightBoxes) {
            d3.select("rect#box" + box.data.id).transition()
                .style("fill", function(d) {
                    var colour = document.getElementById("box" + d.data.id).getAttribute("back-colour");
                    if (colour) {
                        return colour;
                    } else {
                        return "white";
                    }
                })
                .duration(1000);
        }

    }, delayTime * 500);
}

function beforeCollapseHill(node) {

    highlightBoxes = [];

    for (let ele of node.data.elements) {
        highlightBoxes.push(ele);

        if (ele.children) {
            findChildren(ele, highlightBoxes);
        } else if (ele._children) {
            for (let child of ele._children) {
                highlightBoxes.push(child);
                findChildren(child, highlightBoxes);
            }
        }
    }

    d3.select("rect#box" + node.data.id).transition()
        .style("fill", "#ffcccc")
        .duration(100);

    for (let box of highlightBoxes) {
        d3.select("rect#box" + box.id).transition()
            .style("fill", "#ffcccc")
            .duration(100);
    }
}

function afterCollapseHill(node) {
    setTimeout(function() {
        d3.select("rect#box" + node.data.id).transition()
            .style("fill", "white")
            .duration(1000);
    },800);
}

function beforeExpandHill(node) {
    d3.select("rect#box" + node.data.id).transition()
        .style("fill", "#ffcccc")
        .duration(100);
}

function afterExpandHill(node) {

    highlightBoxes = [];

    for (let ele of node.data.elements) {
        highlightBoxes.push(ele);
    }

    var delayTime;

    if (node.children) {
        delayTime = 1;
    } else {
        delayTime = Math.log2(highlightBoxes.length + 1) / 2 + 1;
    }

    setTimeout(function() {

        d3.select("rect#box" + node.data.id).transition()
            .style("fill", function(d) {
                var colour = document.getElementById("box" + d.data.id).getAttribute("back-colour");
                if (colour) {
                    return colour;
                } else {
                    return "white";
                }
            })
            .duration(1000);

        for (let box of highlightBoxes) {
            d3.select("rect#box" + box.id).transition()
                .style("fill", "white")
                .duration(1000);
        }

    },delayTime * 500);
}

function findChildren(node, array) {
    if (node.children) {
        for (let child of node.children) {
            array.push(child)
            findChildren(child, array)
        }
    }
}