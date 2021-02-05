var autoScroll = false;

function checkScrollDirection() {

    let lastScrollLeft = 0;

    $("#ontoplot").scroll(function() {
        var documentScrollLeft = $("#ontoplot").scrollLeft();
        if (lastScrollLeft != documentScrollLeft) {
            checkViewport();
            lastScrollLeft = documentScrollLeft;
        }
    });
}

function checkViewport() {

    // drawNewPartialHierarchy();

    scrollPathLabel();

    if (document.getElementsByClassName("multiNodeLabel").length > 0 && gridGroupWidth <= viewWidth) {
        scrollGrid();
        setTimeout(function() {
            scrollGrid();
        }, 200);
    }

    // if (!autoScroll) {
        scrollBrush();
        // setTimeout(function() {
        //     drawNewLabels();
        // }, 200);
    // }

    if (clickedNode) {

        let hiddenCircleDom = document.getElementById("hiddenCircleDom");

        let circleDom;

        if (hiddenCircleDom) {
            circleDom = hiddenCircleDom
        } else {
            circleDom = document.getElementById(clickedNode.id);
        }

        let bounding = circleDom.getBoundingClientRect();

        let visWidth = $("#ontoplot").width();
        let visHeight = $("#ontoplot").height();

        let offset = $("#ontoplot").offset();

        if (bounding.y < 0) {
            d3.select("#up_arrow")
                .style("visibility", "visible");
        } else {
            d3.select("#up_arrow")
                .style("visibility", "hidden");
        }

        if (bounding.y > visHeight) {
            d3.select("#down_arrow")
                .style("visibility", "visible");
        } else {
            d3.select("#down_arrow")
                .style("visibility", "hidden");
        }

        if (bounding.x - offset.left < 0) {
            d3.select("#left_arrow")
                .style("visibility", "visible");
        } else {
            d3.select("#left_arrow")
                .style("visibility", "hidden");
        }

        if (bounding.x - offset.left > visWidth) {
            d3.select("#right_arrow")
                .style("visibility", "visible");
        } else {
            d3.select("#right_arrow")
                .style("visibility", "hidden");
        }
    }
}

function scrollToDom(preLeft, preTop, circleDom) {

    var offset = $("#ontoplot").offset();

    var x = preLeft - offset.left;
    var y = preTop - offset.top;

    var cx = parseInt(circleDom.getAttribute("cx"));
    var cy = parseInt(circleDom.getAttribute("cy"));

    var scrollLeft = cx - x;
    var scrollTop = cy - y;

    $('#ontoplot').animate({'scrollLeft': scrollLeft, 'scrollTop': scrollTop}, 1);

    if (scrollLeft < 0 || scrollTop < 0) {
        return false;
    } else {
        return true;
    }
}

function scrollToMouse(circleDom) {

    var offset = $("#ontoplot").offset();

    var x = d3.event.clientX - offset.left - 20;
    var y = d3.event.clientY - offset.top - 20;

    var cx = parseInt(circleDom.getAttribute("cx"));
    var cy = parseInt(circleDom.getAttribute("cy"));

    $('#ontoplot').animate({'scrollLeft': cx - x, 'scrollTop': cy - y}, 1);
}

function scrollToLeftTop(){

    var visWidth = $("#ontoplot").width();
    var visHeight = $("#ontoplot").height();

    $('#ontoplot').animate({'scrollLeft': visWidth, 'scrollTop': visHeight}, 1);

    // autoScroll = true;
    //
    // setTimeout(function() {
    //     autoScroll = false;
    // }, 1000);
}

function scrollToMiddle(circle){

    var visWidth = $("#ontoplot").width();
    var visHeight = $("#ontoplot").height();

    var cx = parseInt(circle.getAttribute("cx"));
    var cy = parseInt(circle.getAttribute("cy"));

    $('#ontoplot').animate({'scrollLeft': cx - visWidth / 2, 'scrollTop': cy - visHeight / 2});

    // autoScroll = true;
    //
    // setTimeout(function() {
    //     autoScroll = false;
    // }, 1000);
}

function scrollPathLabel() {

    var distance = parseInt(document.getElementById("ontoplot").scrollLeft) - 1;

    var labels = document.getElementsByClassName("spaceLabel");

    for (let label of labels) {

        var startX = label.getAttribute("x");
        var box = document.getElementById("box" + label.getAttribute("box"));
        var boxX = parseInt(box.getAttribute("x"));
        var endX = boxX + parseInt(box.getAttribute("width") - parseInt(label.getAttribute("width")) - 5);

        if (distance >= startX && distance < endX) {
            label.setAttribute("x", distance);
        }

        if (distance > endX) {
            label.setAttribute("x", endX);
        }

        if (distance <= startX && distance > boxX + 20) {
            label.setAttribute("x", distance);
        }

        if (distance < boxX) {
            label.setAttribute("x", boxX + 20);
        }
    }
}

function getClicked() {

    if (clickedNode) {

        var hiddenCircleDom = document.getElementById("hiddenCircleDom");

        var circleDom;

        if (hiddenCircleDom) {
            circleDom = hiddenCircleDom
        } else {
            circleDom = document.getElementById(clickedNode.id);
        }

        scrollToMiddle(circleDom);
    }
}

function scrollToBox(box) {

    var visWidth = $("#ontoplot").width();
    var visHeight = $("#ontoplot").height();

    var x = parseInt(box.getAttribute("x"));
    var y = parseInt(box.getAttribute("y"));

    $('#ontoplot').animate({'scrollLeft': x - visWidth / 2, 'scrollTop': y - visHeight / 2});
}

function scrollToCircle(circle) {
    var visWidth = $("#ontoplot").width();
    var visHeight = $("#ontoplot").height();

    var x = parseInt(circle.getAttribute("cx"));
    var y = parseInt(circle.getAttribute("cy"));

    $('#ontoplot').animate({'scrollLeft': x - visWidth / 2, 'scrollTop': y - visHeight / 2});
}

function scrollToCircleByGrid(circle) {

    var visWidth = $("#ontoplot").width();
    var x = parseInt(circle.getAttribute("cx"));

    $('#ontoplot').animate({'scrollLeft': x - visWidth / 2});
}