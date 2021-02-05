function getTreemapData(node, type) {

    if (type == "hill") {

        let vertex = {};
        vertex.id = node.box;
        vertex.children = [];
        let elements = JSON.parse(JSON.stringify(document.getElementById("box" + node.box).__data__.data.elements));
        for (let ele of elements) {
            if (ele._children) {
                ele.children = ele._children;
            }
            vertex.children.push(ele);
        }
        constructLeaves(vertex);
        vertex.invisible = true;

        drawTreemap(vertex);

    } else if (type == "square") {

        let vertex = {};
        vertex.id = node.box;
        vertex.children = document.getElementById("box" + node.box).__data__.data.elements;
        vertex.invisible = true;

        drawTreemap(vertex);

    } else {
        findVertex(minimapHierarchyData, node.box);
    }
}

function findVertex(node, id) {
    if (node.id == id) {
        let vertex = JSON.parse(JSON.stringify(node));
        constructLeaves(vertex);
        drawTreemap(vertex);
    } else {
        if (node.children) {
            for (let child of node.children) {
                findVertex(child, id)
            }
        }
    }
}

function constructLeaves(node) {
    if (node.children) {
        for (let child of node.children) {
            if (child.elements.length > 1) {
                let index = node.children.indexOf(child);
                node.children.splice(index, 1);
                node.children = node.children.concat(child.elements);
            } else {
                constructLeaves(child);
            }
        }
    }
}

function drawTreemap(data) {

    let root = d3.hierarchy(data)
        .eachBefore(function (d) {
            d.data.id = d.data.id;
        })
        .sum(sumByCount)
        .sort(function (a, b) {
            return b.height - a.height || b.value - a.value;
        });

    let size = (root.height + 30) * Math.sqrt(root.value);

    let width = size > 200 ? 200 : size,
        height = width;

    let treemap = d3.treemap()
        .tile(d3.treemapSquarify.ratio(1))
        // .tile(d3.treemapBinary)
        .size([width, height])
        .paddingOuter(3)
        // .paddingTop(3)
        // .paddingBottom(3)
        // .paddingLeft(3)
        // .paddingRight(3)
        // .paddingInner(3) // between sibling nodes
        .round(false);

    treemap(root);

    let treemapColour;

    // if (root.height < 11) {
    //     treemapColour = ["#0000ff", "#0000ff", "#0080ff", "#00bfff",
    //                     "#00ffff", "#00ffbf", "#00ff00", "#bfff00",
    //                     "#ffff00", "#ffbf00", "#ff8000", "#ff0000"];
    // } else {
    //     treemapColour = makeTemperatureColour(root);
    // }

    if (root.height < 5) {
        // treemapColour = ["#808080", "#868379", "#9f8f60", "#bf9f40", "#dfaf20", "#ffbf00"];
        treemapColour = ["#808080", "#798679","#609f60", "#40bf40", "#20df20", "#00ff00"]
    } else {
        treemapColour = makeSaturationColour(root);
    }

    // var treemapColourScale = d3.scaleQuantile()
    //     .domain([0, root.height])
    //     .range(treemapColour);

    let canvas = d3.select("#tooltip").append("svg");

    canvas
        .attr("width", width)
        .attr("height", height);
        // .style("padding", "5px");

    let cell = canvas
        .selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        })
        .each(function (d) {
            d.node = this;
        });

    cell.append("rect")
        .attr("width", function (d) { return d.x1 - d.x0; })
        .attr("height", function (d) { return d.y1 - d.y0; })
        .style("fill", function(d) {
            if (landscapeType == "treemap") {
                return d.data.invisible ? "white" : "#969696";
            } else {
                // return treemapColourScale(d.depth);
                return treemapColour[d.depth + 1];
            }
        })
        .style("stroke", function(d) {
            if (landscapeType == "treemap") {
                return "white";
            } else {
                // return treemapColourScale(d.depth - 1);
                return treemapColour[d.depth]
            }
        })
        // .style("stroke-width", 0.4)
        ;
}

function sumByCount(d) {
    return d.children ? 0 : 1;
}

function makeTemperatureColour(root) {

    var split = 255 / (root.height / 4);

    var treemapColour = ["#0000ff"];

    var hexBlue = [],
        hexGreen = [],
        hexYellow = [],
        hexRed = [];

    for (let i = 0; i < root.height / 4; i++) {

        var value = Math.floor(split * i);

        hexBlue.push(rgbToHex(0, value, 255));
        hexGreen.push(rgbToHex(0, 255, 255 - value));
        hexYellow.push(rgbToHex(value, 255, 0));
        hexRed.push(rgbToHex(255, 255 - value, 0));
    }

    treemapColour = treemapColour.concat(hexBlue)
    treemapColour = treemapColour.concat(hexGreen)
    treemapColour = treemapColour.concat(hexYellow)
    treemapColour = treemapColour.concat(hexRed)

    treemapColour.push("#ff0000")

    return treemapColour;
}

function makeSaturationColour(root) {

    var treemapColour = [];

    var split = root.height;

    // var r = Math.floor((255 - 128) / split),
    //     g = Math.floor((191 - 128) / split),
    //     b = Math.floor(128 / split);

    var r = Math.floor(128 / split),
        g = Math.floor((255 - 128) / split),
        b = Math.floor(128 / split);

    for (let i  = 0; i < split + 1; i++) {
        treemapColour.push(rgbToHex(128 - i * r, 128 + i * g, 128 - i *b));
    }

    // treemapColour.push("#ffbf00")

    treemapColour.push("#00ff00")

    return treemapColour;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}