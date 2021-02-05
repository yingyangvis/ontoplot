let movedLabels;

function checkAssLabelOverlap() {

    let keys = Object.keys(labelGrid);
    keys.sort(sortReverseByCoordinate);

    movedLabels = [];

    let tempCx = 0;
    let countCx = 0;

    for (let key of keys) {
        let length = parseInt(labelGrid[key].length);
        if (length > visScale) {
            let count = Math.floor(length / visScale);
            for (let i = 1; i <= count; i++) {
                let cx = parseInt(key.split(",")[0]);
                let cy = parseInt(key.split(",")[1]);
                let x = cx + i * visScale;
                let y = cy + i * visScale;
                if (labelGrid[x + "," + y]) {

                    if (tempCx == cx) {
                        countCx += 1;
                    } else {
                        countCx = 0;
                    }
                    tempCx = cx;

                    let node = labelGrid[key].id;
                    let newY = moveLabel(cx, cy, node, count, countCx);
                    labelGrid[cx + "," + newY] = JSON.parse(JSON.stringify(labelGrid[key]));
                    labelGrid[key].length = 0;

                    movedLabels.push({
                        oldKey: key,
                        newKey: cx + "," + newY,
                        id : node,
                        length: length
                    });

                    break;
                }
            }
        }
    }
}

function sortReverseByCoordinate(a, b) {
    let aCx = parseInt(a.split(",")[0]);
    let bCx = parseInt(b.split(",")[0]);
    if (aCx > bCx) {
        return -1;
    } else if (aCx == bCx) {
        let aCy = parseInt(a.split(",")[1]);
        let bCy = parseInt(b.split(",")[1]);
        if (aCy > bCy) {
            return 1;
        } else {
            return -1;
        }
    } else {
        return 1;
    }
}

function moveLabel(cx, cy, node, rightCount, offsetCount) {

    let y = cy;
    let stop = false;

    while(!stop) {

        let rightOverlap = false;
        let leftOverlap = false;

        y += visScale;

        for (let right = 0; right <= rightCount; right++) {
            let rightCx = cx + right * visScale;
            let rightCy = y + right * visScale;
            if (labelGrid[rightCx + "," + rightCy]) {
                rightOverlap = true;
                break;
            }
        }

        if (!rightOverlap) {
            let leftCount = (cx - 12) / visScale;
            for (let left = 1; left <= leftCount; left++) {
                let leftCx = cx - left * visScale;
                let leftCy = y - left * visScale;
                if (labelGrid[leftCx + "," + leftCy]) {
                    let length = labelGrid[leftCx + "," + leftCy].length;
                    if (Math.floor(length / visScale) >= left) {
                        leftOverlap = true;
                        break;
                    }
                }
            }
        }

        if (!rightOverlap && !leftOverlap) {
            stop = true;
        }
    }

    d3.selectAll("rect#" + node)
        .attr("x", cx)
        .attr("y", y - barEdge / 2)
        .attr("transform", function() {
            let assCount = parseInt(this.getAttribute("assCount"));
            let distance = parseInt(this.getAttribute("position")) * barEdge / Math.sqrt(2);
            if (assCount != 1) {
                distance += assCount * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
            }
            return "translate(" + distance + "," + distance + ") rotate(45, " + cx + "," + y + ")";
        });

    d3.select("text#" + node)
        .attr("x", cx)
        .attr("y", y)
        .attr("transform", function() {
            let assCount = parseInt(this.getAttribute("assCount"));
            let distance = 0;
            if (assCount != 1) {
                distance = assCount * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
            }
            return "translate(" + distance + "," + distance + ") rotate(45, " + cx + "," + y + ")";
        });

    d3.select("line#" + node)
        .attr("x1", cx + offsetCount * 1.5)
        .attr("x2", cx + offsetCount * 1.5)
        .attr("y2", y - offsetCount * 1.5);
    d3.select("line#bar" + node)
        .attr("x1", function() {
            return cx + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2);
        })
        .attr("y1", function() {
            return y + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2);
        })
        .attr("x2", function() {
            return cx + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
        })
        .attr("y2", function() {
            return y + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
        });

    return y;
}