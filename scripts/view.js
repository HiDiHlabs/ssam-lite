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

    uniqueGenes.sort();

    var varcoords = Array(uniqueGenes.length).fill(0).map(() => new Array(2).fill(0).map(() => []));

    var layoutCoordinates = {
        ...{                     // all "layout" attributes: #layout
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            title: { text: 'mRNA map', yref: "paper", y: 1, yanchor: "bottom", pad: { b: 10 }, },
            margin: { t: 35, b: 10, l: 15, r: 15 },
            font: { color: 'white' },
            xaxis: { automargin: true, title: 'μm', },
            yaxis: { automargin: true, scaleanchor: "x", title: 'μm', },
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

    var custom_filename = "ssamlite_mRNA_map_" + new Date().toJSON().slice(0, 19);

    var dl_config = {
        toImageButtonOptions: {
            format: 'svg',
            filename: custom_filename,
            height: 768,
            width: 1024,
            scale: 1
        },
        responsive: true,
        modeBarButtonsToRemove: ['lasso2d', 'autoScale2d', 'select2d'],
        displaylogo: false
    };

    Plotly.react(div, data, layoutCoordinates, dl_config);

    document.getElementById('divScale').style.display = 'block';

};

async function plotSignatures(div, genes, clusterLabels, signatureMatrix) {

    var data = [
        {
            x: genes,
            y: clusterLabels,
            z: signatureMatrix,
            type: 'heatmap',
            hovertemplate: 'Gene: %{x}<br>' +
                'Cell type: %{y}<br>' +
                'Gene expression: %{z:.3f}<extra></extra>',
            colorbar: { title: 'Gene expression (a.u.)', titleside: 'right' },
        },
    ];

    var layout_signatures = {                     // all "layout" attributes: #layout
        paper_bgcolor: 'black',
        plot_bgcolor: 'black',
        'font': {
            color: 'white',
        },
        title: { text: 'Cell-type-specific gene expression signatures', yref: "paper", y: 1, yanchor: "bottom", pad: { b: 10 }, },
        margin: { t: 35, b: 10, },
        'xaxis': {
            autotick: false,
            'showgrid': false,
        },
        'yaxis': {
            autotick: false,
            'showgrid': false,
        },
        'showlegend': false,
        xaxis: { automargin: true, title: 'Genes', },
        yaxis: { automargin: true, title: 'Cell types', },
    }

    var custom_filename = "ssamlite_signatures_" + new Date().toJSON().slice(0, 19);

    var dl_config = {
        toImageButtonOptions: {
            format: 'svg',
            filename: custom_filename,
            height: 768,
            width: 1024,
            scale: 1
        },
        responsive: true,
        modeBarButtonsToRemove: ['autoScale2d'],
        displaylogo: false
    };

    Plotly.react(div, data, layout_signatures, dl_config);
};

function generateScalebar(start = 30, end = 120, umPerPx = 1) {

    linestyle = {
        color: 'rgba(255, 255, 255, 1)',
        width: 2
    };


    var length = (end - start) * umPerPx;
    var decimals = Math.ceil(Math.log10(length)) - 1;
    var inter = length / (Math.pow(10, decimals));

    var lengthRound = Math.ceil(inter) * Math.pow(10, decimals);

    // console.log(length, decimals, inte   r, lengthRound);

    end = start + lengthRound / umPerPx

    text = lengthRound + " μm";

    layout = {
        // text
        annotations: [{
            showarrow: false,
            text: '<b>' + text + '</b>',
            align: "center",
            yref: 'paper',
            x: (start + end) / 2,
            xanchor: "center",
            y: 0.019,
            yanchor: "bottom",
            font: {
                size: 13,
            }
        },],
        shapes: [
            //Surrounding box Rectangle
            {
                type: 'rect',
                yref: 'paper',
                x0: start - 10,
                y0: 0.012,
                x1: end + 10,
                y1: 0.06,
                fillcolor: 'rgba(0,0,0,0.7)',
                line: {
                    color: 'rgba(0,0,0,0.8)',
                    width: 1.2
                },
            },
            //horizontal line
            {
                type: 'line',
                yref: 'paper',
                x0: start,
                y0: 0.03,
                x1: end,
                y1: 0.03,
                // fillcolor: 'rgba(255,255,255,1)',
                line: linestyle,
            },
            {
                //caps
                type: 'line',
                yref: 'paper',
                x0: start,
                y0: 0.02,
                x1: start,
                y1: 0.04,
                // fillcolor: 'rgba(0,0,0,0.6)',
                line: linestyle
            },
            {
                type: 'line',
                yref: 'paper',
                x0: end,
                y0: 0.02,
                x1: end,
                y1: 0.04,
                fillcolor: 'rgba(0,0,0,0.6)',
                line: linestyle
            },

        ]

    }

    return layout;
}

function plotVfNorm(div, vfNorm, layoutVfNorm = {}) {

    var data = [
        {
            z: vfNorm,
            type: 'heatmap',
            colorscale: 'Viridis',
            showgrid: false,
            hovertemplate: 'x: %{x}<br>' +
                'y: %{y}<br>' +
                'KDE: %{z:.3f}<extra></extra>',
            colorbar: { title: 'Total gene expression (a.u.)', titleside: 'right' },
        },

    ];

    var layoutVfNorm = {
        ...{                  // all "layout" attributes: #layout
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            showlegend: false,
            showscale: true,
            font: { color: 'white', },
            title: { text: 'Gene expression estimate', yref: "paper", y: 1, yanchor: "bottom", pad: { b: 10 }, },
            margin: { t: 35, b: 15, l: 15, r: 15 },
            xaxis: { automargin: true, title: 'px', },
            yaxis: { automargin: true, scaleanchor: "x", title: 'px', },
        },
        ...layoutVfNorm
    }

    var custom_filename = "ssamlite_gene_expression_field_" + new Date().toJSON().slice(0, 19);

    var dl_config = {
        toImageButtonOptions: {
            format: 'svg',
            filename: custom_filename,
            height: 768,
            width: 1024,
            scale: 1
        },
        responsive: true,
        modeBarButtonsToRemove: ['autoScale2d'],
        displaylogo: false
    };

    Plotly.react(div, data, layoutVfNorm, dl_config);

};

function createColorArray(nColors, highlight = null, colorGenerator = getColorValue) {
    var colors = [];

    for (var i = 0; i < nColors + 1; i++) {
        transparency = ((highlight == null) ? 'ff' : (i == highlight ? 'ff' : '55'));
        colors.push(colorGenerator(i / nColors) + transparency);
    }
    return colors;
}

function createColorMap(nColors, highlights = null, colorGenerator = null) {

    var colors = [];

    for (var i = 0; i < nColors + 1; i++) {
        colors.push(colorGenerator(i / nColors));
    }


    var tickvals = [-0.5];

    var colorMap = [[0, '#000000'], [(1) / (nColors + 1), '#000000']];

    for (var i = 1; i < nColors + 1; i++) {

        transparency = ((highlights == null) ? 'ff' : (highlights[i - 1] ? 'ff' : '22'));

        colorMap.push([(i) / (nColors + 1), colors[i] + transparency]);
        colorMap.push([(1 + i) / (nColors + 1), colors[i] + transparency]);
        tickvals.push(i - 0.5);
    }

    return [colorMap, tickvals]
};

function checkForExistingPlot(div) {
    return (document.getElementById(div).getElementsByClassName('plot-container').length > 0);
}

function printErr(div, id, msg) {
    err = document.createElement('div', { role: "alert" })
    err.id = id;
    err.className = "alert alert-warning";
    err.innerHTML = (msg);
    $(div).append(err)
}

function repaintTicks(yticks, highlight = null) {
    yticks.forEach(function (ytick, index, array) {
        if ((highlight == ytick.__data__['x']) | (highlight == null)) {
            ytick.getElementsByTagName('text')[0].style.fill = 'white';
        }
        else {
            ytick.getElementsByTagName('text')[0].style.fill = 'grey';
        }
    })
}

function repaintCelltypeCanvas(highlights = null, colorGenerator) {

    [colorMap, tickVals] = createColorMap($('#celltypes-preview')[0].data[0].zmax, highlights, colorGenerator);

    var update = { colorscale: [colorMap], };
    Plotly.restyle('celltypes-preview', update);
}


function plotCelltypeStats(div, counts, clusterLabels, layout = {}, highlight = null, cValGenGetter = null) {
    colorGenerator = cValGenGetter();
    // console.log(colorGenerator(0));

    colorArray = createColorArray(clusterLabels.length, highlight, colorGenerator).slice(1).reverse();

    // console.log(colorArray);

    // console.log(counts, clusterLabels, colorArray);
    counts = [...counts].reverse();
    clusterLabels = clusterLabels.slice().reverse();
    // console.log(counts);
    // console.log(clusterLabels);
    var data = [
        {
            type: 'bar',
            x: counts,
            y: clusterLabels,
            colorscale: colorMap,
            orientation: 'h',
            marker: {
                color: colorArray
            },
        },

    ];

    var layout = {
        ...{
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            // showlegend: false,
            // showscale: false,
            'font': {
                color: 'white',
            },
            title: { text: 'Cell-type abundance', yref: "paper", y: 1, yanchor: "bottom", pad: { b: 10 }, },
            margin: { t: 35, b: 10, },
            'xaxis': { automargin: true, title: 'relative area', 'showgrid': false, },
            'yaxis': { automargin: true, scaleanchor: "x", 'showgrid': false, },
        }, ...layout
    }
    var downloadIcon = {
        'width': 1000,
        'height': 1000,
        'path': "M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM272 80v80H144V80h128zm122 352H54a6 6 0 0 1-6-6V86a6 6 0 0 1 6-6h42v104c0 13.255 10.745 24 24 24h176c13.255 0 24-10.745 24-24V83.882l78.243 78.243a6 6 0 0 1 1.757 4.243V426a6 6 0 0 1-6 6zM224 232c-48.523 0-88 39.477-88 88s39.477 88 88 88 88-39.477 88-88-39.477-88-88-88zm0 128c-22.056 0-40-17.944-40-40s17.944-40 40-40 40 17.944 40 40-17.944 40-40 40z",
        //'transform': 'matrix(0.75 0 0 -0.75 0 1000)'
        'transform': 'scale(2)'
    }


    var modeBarButtons = [[
        "toImage",
        {
            name: 'Download data',
            icon: downloadIcon,
            click: function (gd) { //alert('clicked custom button!');
                var result = gd.data[0].x.reduce(function (result, field, index) {
                    result[gd.data[0].y[index]] = field;
                    return result;
                }, {})

                result = JSON.stringify(result);
                var tsv = convertToTSV(result);
                var exportedFilename = 'ssamlite_cellType_abundance' + new Date().toJSON().slice(0, 19) + ".tsv";

                var blob = new Blob([tsv], { type: 'text/csv;charset=utf-8;' });
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, exportedFilename);
                } else {
                    var link = document.createElement("a");
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", exportedFilename);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                }
            }
        }, "zoom2d", "pan2d", "zoomIn2d", "zoomOut2d", "resetViewMapbox"
    ]]
    function lala() {

    }
    // counts.reverse();

    var custom_filename = "ssamlite_cellType_abundance_" + new Date().toJSON().slice(0, 19);

    var dl_config = {
        toImageButtonOptions: {
            format: 'svg',
            filename: custom_filename,
            height: 768,
            width: 1024,
            scale: 1
        },
        modeBarButtons: modeBarButtons,
        responsive: true,
        displaylogo: false
    };

    Plotly.react(div, data, layout, dl_config);

    var statsDiv = document.querySelector('#celltypes-stats');
    var yticks = statsDiv.querySelectorAll('.ytick');

    // function ytickUnhoverCallback(event) {
    //     var statsDiv = document.querySelector('#celltypes-stats');
    //     var yticks = statsDiv.querySelectorAll('.ytick');
    //     repaintTicks(yticks);
    //     repaintCelltypeCanvas(null, colorGenerator);

    // }

    // function ytickHoverCallback(event) {
    //     var x = event.target.__data__['x'];
    //     var statsDiv = document.querySelector('#celltypes-stats');
    //     var yticks = statsDiv.querySelectorAll('.ytick');

    //     repaintTicks(yticks, x);
    //     repaintCelltypeCanvas(x,colorGenerator);
    // }

    function ytickClickCallback(event) {
        console.log('clicked!')
        var x = event.target.__data__['x'];
        var statsDiv = document.querySelector('#celltypes-stats');
        var yticks = statsDiv.querySelectorAll('.ytick');

        highlights = []

        yticks.forEach(function (ytick, index, array) {

            if ((x == ytick.__data__['x'])) {
                ytick.getElementsByTagName('text')[0].style.fill = (ytick.getElementsByTagName('text')[0].style.fill == 'white') ? 'grey' : 'white';
            }
            highlights.unshift(ytick.getElementsByTagName('text')[0].style.fill == 'white');


        })
        // repaintTicks(yticks, x);
        // highlights.reverse
        repaintCelltypeCanvas(highlights, colorGenerator);
    }



    function convertToTSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = 'Cell_Type\tAbundance\r\n';
        for (const i in array) {
            str += i + '\t' + array[i] + '\r\n';
        }
        return str;
    }


    function ytickDblClickCallback(event) {
        console.log('doubleclicked!')
        var x = event.target.__data__['x'];
        var statsDiv = document.querySelector('#celltypes-stats');
        var yticks = statsDiv.querySelectorAll('.ytick');

        let highlights = [];
        var isHighlighted;

        yticks.forEach(function (ytick, index, array) {

            if ((x == ytick.__data__['x'])) {
                isHighlighted = (ytick.getElementsByTagName('text')[0].style.fill == 'white');
            }
        });

        yticks.forEach(function (ytick, index, array) {

            if ((x == ytick.__data__['x'])) {
                ytick.getElementsByTagName('text')[0].style.fill = 'white';
            }
            else {
                ytick.getElementsByTagName('text')[0].style.fill = isHighlighted ? 'grey' : 'white'
            }
            highlights.unshift(ytick.getElementsByTagName('text')[0].style.fill == 'white');

        });
        // highlights.reverse

        repaintCelltypeCanvas(highlights, colorGenerator);
    }

    [...yticks].map(function (obj) { obj.onclick = ytickClickCallback; obj.ondblclick = ytickDblClickCallback; obj.getElementsByTagName('text')[0].style.fill = 'white'; });//onpointerover = ytickHoverCallback; obj.onpointerleave = ytickUnhoverCallback });

    // document.getElementById(div).on('plotly_hover', function (event) {
    //     console.log(event['yvals']);
    // })

}


function moveParametersToPreview() {
    $('#parameter-coordinates-input-default').children().appendTo('#parameter-coordinates-input');
    $('#parameter-vf-input-default').children().appendTo('#parameter-vf-input');
    $('#parameter-celltypes-input-default').children().appendTo('#parameter-celltypes-input');
}

function moveParametersToDefault() {
    $('#parameter-coordinates-input').children().appendTo('#parameter-coordinates-input-default');
    $('#parameter-vf-input').children().appendTo('#parameter-vf-input-default');
    $('#parameter-celltypes-input').children().appendTo('#parameter-celltypes-input-default');
}

function plotCelltypeMap(div, celltypeMap, clusterLabels, getClusterLabel = null, layout = {}, highlight = null, cValGenGetter = null) {

    colorValueGenerator = cValGenGetter();
    // console.log(colorValueGenerator(0),'kewler');

    [colorMap, tickVals] = createColorMap(clusterLabels.length, highlight, colorValueGenerator);

    // console.log(colorMap, 'kewl');

    var layout = {
        ...{
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            showlegend: true,
            showscale: false,
            'font': {
                color: 'white',
            },
            title: { text: 'Cell-type map', yref: "paper", y: 1, yanchor: "bottom", pad: { b: 10 }, },
            margin: { t: 35, b: 10, l: 15, r: 15 },
            'xaxis': { automargin: true, title: 'px', 'showgrid': false },
            'yaxis': { automargin: true, scaleanchor: "x", title: 'px', 'showgrid': false },
            'uirevision': false,
            'showgrid': false,

        }, ...layout
    }

    var data = [
        {
            z: celltypeMap,
            zmin: -1,
            zmax: clusterLabels.length,
            type: 'heatmap',
            colorscale: colorMap,
            'showgrid': false,
            hoverinfo: 'none',
            showscale: false,

        },

    ];

    var custom_filename = "ssamlite_cellType_map_" + new Date().toJSON().slice(0, 19);

    var dl_config = {
        toImageButtonOptions: {
            format: 'svg',
            filename: custom_filename,
            height: 768,
            width: 1024,
            scale: 1
        },
        responsive: true,
        modeBarButtonsToRemove: ['autoScale2d'],
        displaylogo: false
    };

    Plotly.react(div, data, layout, dl_config);

    $('#section-cmap')[0].style.display = "block";

};

function displayParameterGenerator() {
    var buttonParameters = document.getElementById('bar-parameters');
    var previewGenerator = document.getElementById('preview-generator');
    previewGenerator.style.display = "block";
    buttonParameters.innerHTML = 'Close preview generator';
    moveParametersToPreview();
}

function hideParameterGenerator() {
    var previewGenerator = document.getElementById('preview-generator');
    var buttonParameters = document.getElementById('bar-parameters');

    previewGenerator.style.display = "none";
    buttonParameters.innerHTML = 'Use preview generator for parameter search';
    moveParametersToDefault();
}

function refreshParameterGenerator() {
    var previewGenerator = document.getElementById('preview-generator');
    if (previewGenerator.style.display == "block") {
        var buttonParameters = document.getElementById('bar-parameters');
        previewGenerator.style.display = "block";
        buttonParameters.innerHTML = 'Refresh preview generator';
        buttonParameters.style.color = 'red';
    }

}

function liveChecked() {
    if (this.checked) {
        document.getElementById('bar-parameters').innerHTML = 'Close preview generator';
        document.getElementById('bar-parameters').style.color = 'black';
    }
    createParameterCoodinatesPlot();
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
        "total size: (" + width + "," + height + "," + genes.length + "); " + size
};