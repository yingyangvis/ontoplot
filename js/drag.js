/**
 *  drag bar label
 */

function dragBarStarted() {
    d3.select(this).raise().classed("active", true);
}

function dragBar() {

    d3.selectAll("rect#" + this.id)
        .attr("x", d3.event.x)
        .attr("y", d3.event.y)
        .attr("transform", function() {
            let assCount = parseInt(this.getAttribute("assCount"));
            let distance = parseInt(this.getAttribute("position")) * barEdge / Math.sqrt(2);
            if (assCount != 1) {
                distance += assCount * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
            }
            return "translate(" + distance + "," + distance + ") rotate(45, " + d3.event.x + "," + d3.event.y + ")";
        });

    d3.select("text#" + this.id)
        .attr("x", d3.event.x + 1)
        .attr("y", d3.event.y + 7.5)
        .attr("transform", function() {
            let assCount = parseInt(this.getAttribute("assCount"));
            let distance = 0;
            if (assCount != 1) {
                distance = assCount * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
            }
            return "translate(" + distance + "," + distance + ") rotate(45, " + d3.event.x + "," + d3.event.y + ")";
        });

    d3.select("line#" + this.id)
        .attr("x2", d3.event.x - 5)
        .attr("y2",d3.event.y + 5);
    d3.select("line#bar" + this.id)
        .attr("x1", function() {
            return d3.event.x - 5 + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2);
        })
        .attr("y1", function() {
            return d3.event.y + 5 + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2);
        })
        .attr("x2", function() {
            return d3.event.x - 5 + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
        })
        .attr("y2", function() {
            return d3.event.y + 5 + parseInt(this.getAttribute("assCount")) * barEdge / Math.sqrt(2) + 3 * Math.sqrt(2);
        });
}

function dragBarEnded() {
    d3.select(this).classed("active", false);
}

/**
 *  drag grid label
 */

function dragGridStarted() {
    d3.select(this).raise().classed("active", true);
}

function dragGrid() {

    d3.selectAll("rect#" + this.id)
        .attr("x", function() {
            return d3.event.x + parseInt(this.getAttribute("dx"));
        })
        .attr("y", function() {
            return d3.event.y - parseInt(this.getAttribute("dy"));
        });

    d3.select("text#appendedText" + this.id)
        .attr("x", d3.event.x)
        .attr("y", d3.event.y + 5 + visScale);

    d3.selectAll("line#appendedLine" + this.id)
        .attr("x2", function() {
            let dx = parseInt(this.getAttribute("dx"));
            return d3.event.x + dx;
        })
        .attr("y2", function() {
            let dy = -parseInt(this.getAttribute("dy"));
            return d3.event.y + dy;
        });
}

function dragGridEnded() {
    d3.select(this).classed("active", false);
}