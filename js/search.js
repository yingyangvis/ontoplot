var keyCounter = 0,
    focusedLabel;

function search(eventCode) {

    let searchResults = [];
    focusedLabel = null;

    tooltip.style("display", "none");

    removeCustomAlert();

    if (eventCode == 13) {

        keyCounter += 1;

        let input = document.getElementById("inputLabel");
        let format = input.value.toUpperCase().trim();

        if (format.length > 0) {

            d3.selectAll(".searchResult").remove();

            let fullMatch = format.match(/"(.*?)"/);

            if (fullMatch) {
                format = fullMatch[1];
            }

            for (let key of Object.keys(searchDict)) {
                if (fullMatch) {
                    if (key.toUpperCase() == format) {
                        appendLabel(key, searchResults)
                    }
                } else {
                    if (key.toUpperCase().indexOf(format) > -1) {
                        appendLabel(key, searchResults)
                    }
                }
            }

            if (searchResults.length == 0) {
                alert("No Search Results Found!")
            }
        }
    } else {
        keyCounter = 0;
        d3.selectAll(".searchResult").remove();
    }

    if (searchResults.length > 0) {
        let n = (keyCounter - 1) % searchResults.length;
        focusedLabel = searchResults[n];

        d3.selectAll(".searchResult")
            .style("color", "#969696");
        focusedLabel.style.color = "black";

        let y = focusedLabel.offsetTop;
        let menuHeight = $("#searchResults").height();
        let ele = document.getElementById("searchResults");
        ele.scrollTop = y - menuHeight - 60;

        findCircle(focusedLabel);
    }
}

function appendLabel(key, searchResults) {

    let searchResultsDiv = document.getElementById("searchResults");

    for (let aMatch of searchDict[key]) {

        let label = document.createElement("div");
        label.setAttribute("class", "searchResult");
        label.setAttribute("id", Object.keys(aMatch)[0]);
        label.setAttribute("box", Object.values(aMatch)[0])
        label.innerHTML = key;
        label.style.color = "#969696";
        searchResultsDiv.appendChild(label);

        searchResults.push(label);

        label.onmouseover = function(e) {
            e.target.style.color = "black";
            tooltip
                .style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 40) + "px")
                .style("display", "inline-block")
                .style("opacity", .9)
                .html(
                    e.target.innerHTML
                );
        };

        label.onmouseout = function() {
            tooltip.style("display", "none");
            d3.selectAll(".searchResult")
                .style("color", "#969696");
            if (focusedLabel) {
                focusedLabel.style.color = "black";
            }
        };

        label.onclick = function(e) {
            d3.selectAll(".searchResult")
                .style("color", "#969696");
            focusedLabel = e.target;
            focusedLabel.style.color = "black";
            findCircle(focusedLabel);
        }
    }

}

function findCircle(labelDom) {

    let boxId = labelDom.getAttribute("box");

    let circleId = labelDom.getAttribute("id");
    
    let expandStack = [];
    expandAncestor(boxId, expandStack);

    while (expandStack.length > 0) {

        let node = expandStack.pop();

        if (hillDict[node]) {
            let boxData = document.getElementById("box" + hillDict[node]).__data__;
            expandHill(boxData);
        }

        constructedHierarchy.each(function (d) {
            if (d.data.id == node) {
                expansion(d);
            }
        })
    }

    resizeSVG();

    setTimeout(function() {

        let circleDom = document.getElementById(circleId);

        scrollToMiddle(circleDom);
        scrollBrush();

        drawPointer(circleDom);

        d3.selectAll(".box")
            .transition()
            .style("fill", function() {
                var colour = this.getAttribute("back-colour");
                if (colour) {
                    return colour;
                } else {
                    return "white";
                }
            })
            .duration(1000);

        setTimeout(function() {
            mouseoverClass(circleDom.__data__);
        }, 500)

    }, 100);
}

function drawPointer(circleDom) {

    d3.select("#searchPointer").remove();

    svgGroup.append("path")
        .attr("transform", function () {
            let x = parseInt(circleDom.getAttribute("cx")),
                y = parseInt(circleDom.getAttribute("cy")) - 18;
            return "translate(" + x + "," + y + ")";
        })
        .attr("d", "M -10 0 L 0 8 L 10 0")
        .attr("id", "searchPointer")
        .attr("circle", circleDom.__data__.id)
        .attr("stroke", "#4889F4")
        .attr("stroke-width", 5)
        .attr("fill", "none");

    goUpDown();
}

function goUpDown() {
    let pointer = d3.select("#searchPointer");
    pointer
        .transition()
        .attr("transform", function() {
            let circleDom = document.getElementById(this.getAttribute("circle"));
            let x = parseInt(circleDom.getAttribute("cx")),
                y = parseInt(circleDom.getAttribute("cy")) - 15;
            return "translate(" + x + "," + y + ")";
        })
        .duration(400)
        .transition()
        .attr("transform", function() {
            let circleDom = document.getElementById(this.getAttribute("circle"));
            let x = parseInt(circleDom.getAttribute("cx")),
                y = parseInt(circleDom.getAttribute("cy")) - 21;
            return "translate(" + x + "," + y + ")";
        })
        .duration(400)
        .on("end", goUpDown);
}