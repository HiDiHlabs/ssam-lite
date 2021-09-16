//smooth scrolling function, compiled:
!function () { "use strict"; function o() { var o = window, t = document; if (!("scrollBehavior" in t.documentElement.style && !0 !== o.__forceSmoothScrollPolyfill__)) { var l, e = o.HTMLElement || o.Element, r = 468, i = { scroll: o.scroll || o.scrollTo, scrollBy: o.scrollBy, elementScroll: e.prototype.scroll || n, scrollIntoView: e.prototype.scrollIntoView }, s = o.performance && o.performance.now ? o.performance.now.bind(o.performance) : Date.now, c = (l = o.navigator.userAgent, new RegExp(["MSIE ", "Trident/", "Edge/"].join("|")).test(l) ? 1 : 0); o.scroll = o.scrollTo = function () { void 0 !== arguments[0] && (!0 !== f(arguments[0]) ? h.call(o, t.body, void 0 !== arguments[0].left ? ~~arguments[0].left : o.scrollX || o.pageXOffset, void 0 !== arguments[0].top ? ~~arguments[0].top : o.scrollY || o.pageYOffset) : i.scroll.call(o, void 0 !== arguments[0].left ? arguments[0].left : "object" != typeof arguments[0] ? arguments[0] : o.scrollX || o.pageXOffset, void 0 !== arguments[0].top ? arguments[0].top : void 0 !== arguments[1] ? arguments[1] : o.scrollY || o.pageYOffset)) }, o.scrollBy = function () { void 0 !== arguments[0] && (f(arguments[0]) ? i.scrollBy.call(o, void 0 !== arguments[0].left ? arguments[0].left : "object" != typeof arguments[0] ? arguments[0] : 0, void 0 !== arguments[0].top ? arguments[0].top : void 0 !== arguments[1] ? arguments[1] : 0) : h.call(o, t.body, ~~arguments[0].left + (o.scrollX || o.pageXOffset), ~~arguments[0].top + (o.scrollY || o.pageYOffset))) }, e.prototype.scroll = e.prototype.scrollTo = function () { if (void 0 !== arguments[0]) if (!0 !== f(arguments[0])) { var o = arguments[0].left, t = arguments[0].top; h.call(this, this, void 0 === o ? this.scrollLeft : ~~o, void 0 === t ? this.scrollTop : ~~t) } else { if ("number" == typeof arguments[0] && void 0 === arguments[1]) throw new SyntaxError("Value could not be converted"); i.elementScroll.call(this, void 0 !== arguments[0].left ? ~~arguments[0].left : "object" != typeof arguments[0] ? ~~arguments[0] : this.scrollLeft, void 0 !== arguments[0].top ? ~~arguments[0].top : void 0 !== arguments[1] ? ~~arguments[1] : this.scrollTop) } }, e.prototype.scrollBy = function () { void 0 !== arguments[0] && (!0 !== f(arguments[0]) ? this.scroll({ left: ~~arguments[0].left + this.scrollLeft, top: ~~arguments[0].top + this.scrollTop, behavior: arguments[0].behavior }) : i.elementScroll.call(this, void 0 !== arguments[0].left ? ~~arguments[0].left + this.scrollLeft : ~~arguments[0] + this.scrollLeft, void 0 !== arguments[0].top ? ~~arguments[0].top + this.scrollTop : ~~arguments[1] + this.scrollTop)) }, e.prototype.scrollIntoView = function () { if (!0 !== f(arguments[0])) { var l = function (o) { for (; o !== t.body && !1 === (e = p(l = o, "Y") && a(l, "Y"), r = p(l, "X") && a(l, "X"), e || r);)o = o.parentNode || o.host; var l, e, r; return o }(this), e = l.getBoundingClientRect(), r = this.getBoundingClientRect(); l !== t.body ? (h.call(this, l, l.scrollLeft + r.left - e.left, l.scrollTop + r.top - e.top), "fixed" !== o.getComputedStyle(l).position && o.scrollBy({ left: e.left, top: e.top, behavior: "smooth" })) : o.scrollBy({ left: r.left, top: r.top, behavior: "smooth" }) } else i.scrollIntoView.call(this, void 0 === arguments[0] || arguments[0]) } } function n(o, t) { this.scrollLeft = o, this.scrollTop = t } function f(o) { if (null === o || "object" != typeof o || void 0 === o.behavior || "auto" === o.behavior || "instant" === o.behavior) return !0; if ("object" == typeof o && "smooth" === o.behavior) return !1; throw new TypeError("behavior member of ScrollOptions " + o.behavior + " is not a valid value for enumeration ScrollBehavior.") } function p(o, t) { return "Y" === t ? o.clientHeight + c < o.scrollHeight : "X" === t ? o.clientWidth + c < o.scrollWidth : void 0 } function a(t, l) { var e = o.getComputedStyle(t, null)["overflow" + l]; return "auto" === e || "scroll" === e } function d(t) { var l, e, i, c, n = (s() - t.startTime) / r; c = n = n > 1 ? 1 : n, l = .5 * (1 - Math.cos(Math.PI * c)), e = t.startX + (t.x - t.startX) * l, i = t.startY + (t.y - t.startY) * l, t.method.call(t.scrollable, e, i), e === t.x && i === t.y || o.requestAnimationFrame(d.bind(o, t)) } function h(l, e, r) { var c, f, p, a, h = s(); l === t.body ? (c = o, f = o.scrollX || o.pageXOffset, p = o.scrollY || o.pageYOffset, a = i.scroll) : (c = l, f = l.scrollLeft, p = l.scrollTop, a = n), d({ scrollable: c, method: a, startTime: h, startX: f, startY: p, x: e, y: r }) } } "object" == typeof exports && "undefined" != typeof module ? module.exports = { polyfill: o } : o() }();


// smooth scrolling:
$('.smooth-scroll').click(function () {
    event.preventDefault();
    var sectionTo = $(this).attr('href');
    document.getElementById(sectionTo.substring(1, sectionTo.length)).scrollIntoView({ behavior: 'smooth' });
});

async function plotCoordinates(div, X, Y, ZGenes, layoutCoordinates = {}) {

    uniqueGenes = Array.from(new Set(ZGenes));

    var varcoords = Array(uniqueGenes.length).fill(0).map(() => new Array(2).fill(0).map(() => []));

    var layoutCoordinates = {
        ...{                     // all "layout" attributes: #layout
            paper_bgcolor: 'rgba(0,0,0,0.4)',
            plot_bgcolor: 'rgba(0,0,0,1)',
            'title': 'mRNA map',
            'showlegend': true,
            'margin': { 'l': 10, 'r': 0, 't': 0, 'b': 15 },
        }, ...layoutCoordinates
    };


    for (var i = 0; i < ZGenes.length; i++) {
        var idx = uniqueGenes.indexOf(ZGenes[i]);
        (varcoords[idx])[1].push(X[i]);
        (varcoords[idx])[0].push(Y[i]);
    }
    var data = [];
    for (var i = 0; i < uniqueGenes.length; i++) {
        data.push({
            x: varcoords[i][0],
            y: varcoords[i][1],
            name: uniqueGenes[i],
            mode: 'markers',
            opacity: 0.5,
            markers: { size: 0.1, symbol: 'triangle-left' },
            type: 'scattergl',
            hoverinfo: 'none',
        });
    }

    Plotly.plot(div, data, layoutCoordinates);
};

async function plotSignatures(div, genes, clusterLabels, signatureMatrix) {

    var data = [
        {
            x: genes,
            y: clusterLabels,
            z: signatureMatrix,
            type: 'heatmap',
        }
    ];

    var layout_signatures = {                     // all "layout" attributes: #layout
        paper_bgcolor: 'rgba(0,0,0,0.5)',
        plot_bgcolor: 'rgba(0,0,0,0.5)',
        'font': {
            color: 'white',
        },
        'title': 'expression signatures',
        'xaxis': {
            autotick: false,
            'showgrid': false,
        },
        'yaxis': {
            autotick: false,
            'showgrid': false,
        },
        'showlegend': false,
        // 'margin': { 'l': 10, 'r': 0, 't': 0, 'b': 15 },
    }


    Plotly.react(div, data, layout_signatures, { responsive: true });
};

function plotVfNorm(div, vfNorm, layout = {}) {

    var data = [
        {
            z: vfNorm,
            type: 'heatmapgl',
            colorscale: 'Viridis',
            'showgrid': false,
        }
    ];
    var layoutVfNorm = {                     // all "layout" attributes: #layout
        paper_bgcolor: 'rgba(0,0,0,0.7)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        showscale: false,
        'font': {
            color: 'white',
        },
        'title': 'generated vector field norm:',
        // 'margin': { 'l': 10, 'r': 0, 't': 0, 'b': 15 },
    };

    Plotly.react(div, data, layoutVfNorm);

};

function createColorMap(nColors) {

    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    };

    var colors = [];

    for (var i = 0; i < nColors + 1; i++) {
        colors.push(getColorValue(i / nColors));
    }


    var tickvals = [-0.5];

    var colorMap = [[0, '#000000'], [(1) / (nColors + 1), '#000000']];

    for (var i = 1; i < nColors + 1; i++) {
        colorMap.push([(i) / (nColors + 1), colors[i]]);
        colorMap.push([(1 + i) / (nColors + 1), colors[i]]);
        tickvals.push(i - 0.5);
    }
    return [colorMap, tickvals]
};

function checkForExistingPlot(div){
    return (document.getElementById(div).getElementsByClassName('plot-container').length>0);
}

function printErr(div,id,msg){
    err = document.createElement('div', {role:"alert"})
    err.id = id;
    err.className = "alert alert-warning"; 
    err.innerHTML = (msg);
    $(div).append(err)
}

function plotCelltypeMap(div, celltypeMap, clusterLabels, getClusterLabel = null) {

    [colorMap, tickVals] = createColorMap(clusterLabels.length);

    var tickText = ['ECM'].concat(clusterLabels)

    var layout = {
        paper_bgcolor: 'rgba(0,0,0,0.7)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        showlegend: false,
        showscale: false,
        'font': {
            color: 'white',
        },
        'title': 'generated tissue map:'
    }

    var data = [
        {
            z: celltypeMap,
            // text: celltypePlotText,
            zmin: -1,
            zmax: clusterLabels.length,
            type: 'heatmap',
            colorscale: colorMap,
            'showgrid': false,
            hoverinfo: 'none',
            colorbar: {
                tickmode: 'array',
                tickvals: tickVals,
                ticktext: tickText,

            }
        }
    ];
    // console.log(document.getElementById(div),checkForExistingPlot(div));
    // if (!checkForExistingPlot(div)) {
        Plotly.react(div, data, layout, { responsive: true });
    // }else{
    //     console.log('updating...');
    //     Plotly.update(div, data, layout, { responsive: true });
    // }

    if (getClusterLabel != null) {
        var hoverInfo = document.getElementById('hoverinfo');

        var x; var y; var z; var clusterLabel;

        document.getElementById(div).on('plotly_hover', function (eventData) {

            hoverinfo.style.display = 'block'

            x = eventData.points[0].x;
            y = eventData.points[0].y;
            z = eventData.points[0].z;

            if (z < 0) {
                clusterLabel = '-'
            } else {
                clusterLabel = getClusterLabel(z)
            }

            hoverInfo.innerHTML = "x: " + x + "<br> y: " + y + "<br> " + clusterLabel;

            var points = eventData.points[0];

            var x = points.xaxis.l2p(points.pointNumber[1]) + points.xaxis._offset;
            var y = points.yaxis.l2p(points.pointNumber[0]) + points.yaxis._offset;



        }).on(
            'plotly_unhover', function (evendData) {
                hoverinfo.style.display = 'none'
            }
        )
    }
};

function displayParameterGenerator() {
    var previewGenerator = document.getElementById('preview-generator');
    var buttonParameters = document.getElementById('bar-parameters');

    previewGenerator.style.display = "block";
    buttonParameters.innerHTML = 'Close preview generator';
}

function hideParameterGenerator() {
    var previewGenerator = document.getElementById('preview-generator');
    var buttonParameters = document.getElementById('bar-parameters');

    previewGenerator.style.display = "none";
    buttonParameters.innerHTML = 'Use preview generator for parameter search';
}

function updateParameterRectangle(clickCoords, rectWidth) {
    // update_layout_parameters(rect_center = clickCoords);

    update = {
        shapes: [

            {
                type: 'rect',
                x0: clickCoords[0] - rectWidth,
                y0: clickCoords[1] - rectWidth,
                x1: clickCoords[0] + rectWidth,
                y1: clickCoords[1] + rectWidth,
                line: {
                    color: 'rgba(255, 255, 255, 1)'
                },
            },],
    };

    Plotly.relayout('parameter-coordinates', update)
};

function setVfSizeIndicator(width, height, genes) {

    var sizeIndicator;

    if (width == 0 || height == 0 || genes.length == 0) {
        size = ' - ';
    } else {
        size = (width * height * genes.length * 32 / 2 ** 30).toFixed(1) + " gB";
    }

    document.getElementById("vf-size-information").innerHTML =
        "total size: (" + width + "," + height + "," + genes.length + "); " + size;
};