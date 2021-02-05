function getCircleColour(d, circleDom) {

    if (colourDict[d.url]) {

        let dom = document.getElementById(d.id);
        let cx = dom.getAttribute("cx");
        if (colouredCirclePositionDict.hasOwnProperty(cx)) {
            colouredCirclePositionDict[cx].push(dom);
        } else {
            colouredCirclePositionDict[cx] = [dom];
        }

        if (colourDict[d.url].length) {

            let strength = colourDict[d.url].length;

            if (circleDom) {
                circleDom.setAttribute("assStrength", strength);
            }

            if (strength == 0) {
                return "#969696";
            }
            if (strength == maxAssValue) {
                if (minimapCircleDict["#a50026"]) {
                    minimapCircleDict["#a50026"].push(d);
                } else {
                    minimapCircleDict["#a50026"] = [];
                    minimapCircleDict["#a50026"].push(d);
                }
                return "#a50026";
            }
            if (minimapCircleDict[colourScale(strength)]) {
                minimapCircleDict[colourScale(strength)].push(d);
            } else {
                minimapCircleDict[colourScale(strength)] = [];
                minimapCircleDict[colourScale(strength)].push(d);
            }
            return colourScale(strength);
        } else {
            // for pie glyph
            pies.push(circleDom);

            let nodeAssStrength = 0;
            for (let ass of Object.keys(colourDict[d.url])) {
                nodeAssStrength += colourDict[d.url][ass].length;
            }

            if (circleDom) {
                circleDom.setAttribute("assStrength", nodeAssStrength);
            }

            if (nodeAssStrength == 0) {
                return "#969696";
            }
            if (nodeAssStrength == maxAssValue) {
                if (minimapCircleDict["#a50026"]) {
                    minimapCircleDict["#a50026"].push(d);
                } else {
                    minimapCircleDict["#a50026"] = [];
                    minimapCircleDict["#a50026"].push(d);
                }
                return "#a50026";
            }
            if (minimapCircleDict[colourScale(nodeAssStrength)]) {
                minimapCircleDict[colourScale(nodeAssStrength)].push(d);
            } else {
                minimapCircleDict[colourScale(nodeAssStrength)] = [];
                minimapCircleDict[colourScale(nodeAssStrength)].push(d);
            }
            return colourScale(nodeAssStrength);
        }
    } else {
        return "#969696";
    }
}

function getIdenticalCircleColour(d, self, focusNode) {

    if (d.id != focusNode.id) {
        let hex = rgbToHex(self.style.fill);
        if (minimapCircleDict[hex]) {
            let index = minimapCircleDict[hex].indexOf(d);
            minimapCircleDict[hex].splice(index, 1);
        }
        if (minimapCircleDict["#1a9850"]) {
            minimapCircleDict["#1a9850"].push(d);
        } else {
            minimapCircleDict["#1a9850"] = [];
            minimapCircleDict["#1a9850"].push(d);
        }
        return "#1a9850";
    } else {
        return self.style.fill;
    }
}

function rgbToHex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}