function drawIdentialNodeButton() {

    for (let key of Object.keys(secondaryChildDict)) {

        // only show when it is circle
        d3.selectAll('[url="' + key + '"]')
            .each(function(d) {

                let box  = document.getElementById("box" + d.box);
                let boxX = parseInt(box.getAttribute("x"));
                let boxY = parseInt(box.getAttribute("y"));
                let boxWidth = parseInt(box.getAttribute("width"));
                let boxHeight = parseInt(box.getAttribute("height"));

                let x = boxX + boxWidth - 6,
                    y = boxY + boxHeight - 5;

                svgGroup
                    .append("path").datum(d)
                    .attr("transform", function() {
                        return "translate(" + x + ", " + y + ") rotate(90)";
                    })
                    .attr("d", createTriangleShape(40))
                    .attr("fill", "black")
                    .attr("expand", false)
                    .on("click", function() {

                        let expand = this.getAttribute("expand");

                        if (expand == "false") {
                            this.setAttribute("transform", "translate(" + x + ", " + y + ") rotate(180)");
                            this.setAttribute("expand", true);
                        } else {
                            this.setAttribute("transform", "translate(" + x + ", " + y + ") rotate(90)");
                            this.setAttribute("expand", false);
                        }
                    })
            });
    }
}