
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsText(file, "UTF-8");
    })
};



function processSignatures(allText) {

    var genes;
    var clusterLabels;
    var signatureBuffer;

    var allTextLines = allText.split(/\r\n|\n/);
    var nClusters = allTextLines.length - 2;
    genes = allTextLines[0].split(',').slice(1);
    var nGenes = genes.length;

    signatureBuffer = tf.buffer([nClusters, nGenes]);

    clusterLabels = [];

    for (var i = 0; i < nClusters; i++) {
        line = allTextLines[i + 1].split(',');

        for (var j = 0; j < nGenes; j++) {
            signatureBuffer.set(parseFloat(line[j + 1]), i, j);
        }

        clusterLabels.push(line[0]);
    }

    signatureBuffer = signatureBuffer.toTensor();

    return [signatureBuffer, clusterLabels, genes];
};

function processCoordinates(allText) {
    var allTextLines = allText.trim().split(/\r\n|\n/);

    genes = [];
    ZGenes = [];
    X = [];
    Y = [];
    var x = 0;
    var y = 0;
    var line;
    xmax = 0;
    ymax = 0;

    for (var i = 1; i < allTextLines.length; i++) {
        line = allTextLines[i].split(',');

        x = parseFloat(line[1]) || 0;
        y = parseFloat(line[2]) || 0;

        xmax = Math.max(x, xmax);
        ymax = Math.max(y, ymax);

        X.push(x);
        Y.push(y);
        ZGenes.push(line[0]);
        if (!genes.includes(line[0])) genes.push(line[0]);
    }

    var edgeRatio = Math.ceil(xmax / ymax);
    var width = Math.ceil(500);
    var height = Math.ceil(width / edgeRatio);

    return [X, Y, ZGenes, genes, xmax, ymax, edgeRatio, width, height];
};

function processColorMap(allText, clusterLabels) {

    let allTextLines = allText.trim().split(/\r\n|\n/);

    let labelList = [];
    let colorList = [];
    let colors = ["#000000"];

    for (var i = 0; i < allTextLines.length; i++) {
        [ct, color] = allTextLines[i].split(/,|:/);

        labelList.push(ct)
        colorList.push(color);
    }


    for (var i = 0; i < clusterLabels.length; i++) {
        let idx = labelList.indexOf(clusterLabels[i]);
        if (idx < 0) {
            colors.push('#222222');
        }
        else {

            console.log(clusterLabels[i], idx, colorList[idx])
            colors.push(colorList[idx]);
        }
    }

    return colors;
};

function reloadPage() {
    window.scrollTo(0, 0);
    // document.getElementById('btn-coordinates-hidden').scrollIntoView();
    location.reload();
};

function main() {

    {
        var genes = [];
        var clusterLabels;
        var signatureMatrix;

        var coordinatesLoaded = false;
        var signaturesLoaded = false;

        var X;          // mRNA x coordinates
        var Y;          // mRNA y coordinates
        var ZGenes;     // gene information
        var xmax;       // highest coordinate
        var ymax;       // lowest coordinate
        var sigma = 3;   // KDE kernel width

        var height = 500;         // vf height (pixels)
        var width = 0;      // vf width (pixels)
        var edgeRatio = 1;// radion height/width
        var threshold = 2;     // cell/ecm cutoff
        var vf;         // tensor vectorfield
        var vfNorm;     // tensor vfNorm
        var scale = 1;

        var parameterWindow = [250, 250];
        var parameterWidth = 50;
        var parameterX = [];
        var parameterY = [];
        var parameterZ = [];
        var vfParameter;
        var vfNormParameter;
        var cGen = getColorValue;


        var pointerCoordinates = parameterWindow;

        function getClusterLabel(i) {
            return clusterLabels[i];
        }

    }


    async function importSignatures(fileToLoad) {

        document.getElementById("signature-loader").style.display = "block";   //display waiting symbol

        if (fileToLoad.constructor.name != "File") {
            fileToLoad = document.getElementById("btn-signatures-hidden").files[0];
        }

        [signatureMatrix, clusterLabels, genes] = (processSignatures(await readFileAsync(fileToLoad)));

        setVfSizeIndicator(width, height, genes);

        plotSignatures('signatures-preview', genes, clusterLabels, signatureMatrix.arraySync()).then(function () {
            document.getElementById("signature-loader").style.display = "none";
        });

        signaturesLoaded = true;
        $('#errSign').remove();

    };

    async function importCoordinates(fileToLoad) {

        $('#errCoords').remove();

        vf = null;
        X = [];          // mRNA x coordinates
        Y = [];          // mRNA y coordinates
        ZGenes = [];     // gene information
        xmax = [];       // highest coordinate
        ymax = [];       // lowest coordinate

        console.log(ZGenes);
        console.log('loading coordinates');
        document.getElementById("coordinate-loader").style.display = "block";   //display waiting symbol

        if (fileToLoad.constructor.name != "File") {
            fileToLoad = document.getElementById("btn-coordinates-hidden").files[0];
        }

        [X, Y, ZGenes, coordGenes, xmax, ymax, edgeRatio, width, height] = processCoordinates(await readFileAsync(fileToLoad));
        if (!genes.length) genes = coordGenes; //use genes from the coordinate file for now, e.g. kde

        edgeRatio = xmax / ymax;
        width = Math.ceil(height * edgeRatio);
        setVfSizeIndicator(width, height, genes);

        plotCoordinates('coordinates-preview', X, Y, ZGenes, { 'showlegend': true, }).then(function () {
            document.getElementById("coordinate-loader").style.display = "none";
        });

        coordinatesLoaded = true;
    };


    function getColorMap() {
        return cGen;
    }



    async function importColorMap(fileToLoad) {

        $('#errCoords').remove();

        console.log('loading cMap');

        if (fileToLoad.constructor.name != "File") {
            fileToLoad = document.getElementById("btn-cmap-hidden").files[0];
        }

        colors = processColorMap(await readFileAsync(fileToLoad), clusterLabels);

        function colorGenerator(val) {
            // console.log("generated: ", val)
            if (val == 0) {
                return "#000000ff"
            }
            else {
                return colors[Math.min(Math.ceil(val * clusterLabels.length), colors.length - 1)];
            }
        }

        cGen = colorGenerator;

        //redraw map/stats with new colors

        plotCelltypeMap('celltypes-preview', celltypeMap.arraySync(), clusterLabels, getClusterLabel, layout = generateScalebar(width / 10, width / 3, umPerPx), highlight = null, cValGenGetter = getColorMap);
        plotCelltypeStats('celltypes-stats', celltypeCounts, clusterLabels, layout = {}, highlight = null, cValGenGetter = getColorMap);

    };


    function allowDrop(ev) {
        ev.preventDefault();
    }

    function dropCoords(ev) {
        ev.preventDefault();
        let path = ev.dataTransfer.items[0].getAsFile()
        importCoordinates(path)
    }

    function dropSignatures(ev) {
        ev.preventDefault();
        let path = ev.dataTransfer.items[0].getAsFile()
        importSignatures(path)
    }


    function updateScale(event) {
        let valOld = scale;
        let val = event.srcElement.valueAsNumber;
        if (val <= 0) {
            val = 1;
            event.srcElement.value = '1'
        }
        else {
            scale = val;
        }

        rescale = valOld / val;
        scale = val;

        xmax = xmax * rescale;
        ymax = ymax * rescale;

        // xmax = xmax*rescale;
        X = X.map(function (x) { return x * rescale; })
        Y = Y.map(function (x) { return x * rescale; })

        plotCoordinates('coordinates-preview', X, Y, ZGenes, { 'showlegend': true, });

        // console.log(rescale);

    }

    function updateVfNormScalebar(event) {


        div = $('#vf-norm-preview')[0];

        // console.log(event);

        if (event.autosize) {
            // var plot_div = document.getElementById('vf-norm-preview');
            var xrange = [div.layout.xaxis.range[0], div.layout.xaxis.range[1]]
            var yrange = [div.layout.yaxis.range[0], div.layout.yaxis.range[1]]
        }
        else if (!event["xaxis.range[0]"]) {
            var xrange = [0, width];
            var yrange = [0, height];
        }
        else {
            var xrange = [event["xaxis.range[0]"], event["xaxis.range[1]"]]
            var yrange = [event["yaxis.range[0]"], event["yaxis.range[1]"]]
        }

        starty = yrange[0] + (yrange[1] - yrange[0]) / 8
        endy = yrange[0] + (yrange[1] - yrange[0]) / 7

        umPerPx = xmax / width;

        start = xrange[0] + (xrange[1] - xrange[0]) / 8
        end = xrange[0] + (xrange[1] - xrange[0]) / 3
        center = start + (end - start) / 2;

        var length = (end - start) * umPerPx;
        var decimals = Math.ceil(Math.log10(length)) - 1;
        var inter = length / (Math.pow(10, decimals));

        var lengthRound = Math.ceil(inter) * Math.pow(10, decimals);


        end = start + lengthRound / umPerPx

        text = lengthRound + " μm";

        // console.log(center, div.layout.shapes[0])

        length = Math.ceil(Math.random() * 40);

        var rect = div.layout.shapes[0];
        rect.x0 = center - lengthRound / 2 / umPerPx * 1.1;
        rect.x1 = center + lengthRound / 2 / umPerPx * 1.1;

        var horizontal = div.layout.shapes[1];
        horizontal.x0 = center - lengthRound / 2 / umPerPx;
        horizontal.x1 = center + lengthRound / 2 / umPerPx;

        var capLeft = div.layout.shapes[2];
        capLeft.x0 = center - lengthRound / 2 / umPerPx;
        capLeft.x1 = center - lengthRound / 2 / umPerPx;

        var capRight = div.layout.shapes[3];
        capRight.x0 = center + lengthRound / 2 / umPerPx;
        capRight.x1 = center + lengthRound / 2 / umPerPx;

        var textAnnot = div.layout.annotations[0];
        textAnnot.x = center;
        textAnnot.text = text;

        layout = {
            'shapes': [rect, horizontal, capLeft, capRight],
            'annotations': [textAnnot]
        }
        Plotly.update('vf-norm-preview', {}, layout);
    }

    function updateCtMapScalebar(event) {

        div = $('#celltypes-preview')[0];

        // console.log(event);

        if (event.autosize) {
            // var plot_div = document.getElementById('celltypes-preview');
            var xrange = [div.layout.xaxis.range[0], div.layout.xaxis.range[1]]
            var yrange = [div.layout.yaxis.range[0], div.layout.yaxis.range[1]]
        }
        else if (!event["xaxis.range[0]"]) {
            var xrange = [0, width];
            var yrange = [0, height];
        }
        else {
            var xrange = [event["xaxis.range[0]"], event["xaxis.range[1]"]]
            var yrange = [event["yaxis.range[0]"], event["yaxis.range[1]"]]
        }


        starty = yrange[0] + (yrange[1] - yrange[0]) / 8
        endy = yrange[0] + (yrange[1] - yrange[0]) / 7

        umPerPx = xmax / width;

        start = xrange[0] + (xrange[1] - xrange[0]) / 8
        end = xrange[0] + (xrange[1] - xrange[0]) / 3
        center = start + (end - start) / 2;

        var length = (end - start) * umPerPx;
        var decimals = Math.ceil(Math.log10(length)) - 1;
        var inter = length / (Math.pow(10, decimals));

        var lengthRound = Math.ceil(inter) * Math.pow(10, decimals);


        end = start + lengthRound / umPerPx

        text = lengthRound + " μm";

        // console.log(div.layout)

        length = Math.ceil(Math.random() * 40);

        var rect = div.layout.shapes[0];
        rect.x0 = center - lengthRound / 2 / umPerPx * 1.1;
        rect.x1 = center + lengthRound / 2 / umPerPx * 1.1;

        var horizontal = div.layout.shapes[1];
        horizontal.x0 = center - lengthRound / 2 / umPerPx;
        horizontal.x1 = center + lengthRound / 2 / umPerPx;

        var capLeft = div.layout.shapes[2];
        capLeft.x0 = center - lengthRound / 2 / umPerPx;
        capLeft.x1 = center - lengthRound / 2 / umPerPx;

        var capRight = div.layout.shapes[3];
        capRight.x0 = center + lengthRound / 2 / umPerPx;
        capRight.x1 = center + lengthRound / 2 / umPerPx;

        var textAnnot = div.layout.annotations[0];
        textAnnot.x = center;
        textAnnot.text = text;

        layout = {
            'shapes': [rect, horizontal, capLeft, capRight],
            'annotations': [textAnnot]
        }
        Plotly.update('celltypes-preview', {}, layout);
    }
    
    function updateStats(event) {

        if (isNaN(event['xaxis.range[0]'])) {
            x_ = 0;
            y_ = 0;
            _x = width - 1;
            _y = height - 1;
        }
        else {
            var y_ = Math.max(0, Math.round(event['xaxis.range[0]']));
            var _y = Math.min(height - 1, Math.round(event['xaxis.range[1]']));
            var x_ = Math.max(0, Math.round(event['yaxis.range[0]']));
            var _x = Math.min(width - 1, Math.round(event['yaxis.range[1]']));
        }
        // console.log('kewl', x_, _x, y_, _y);
        var celltypeCounts = calculateStats(celltypeMap.slice([x_, y_], [_x - x_ + 1, _y - y_ + 1]), clusterLabels.length - 1);
        // console.log(celltypeCounts);
        plotCelltypeStats('celltypes-stats', celltypeCounts, clusterLabels, layout = {}, highlight = null, cValGenGetter = getColorMap);

    }

    function runFullKDE() {

        $('#errCoords').remove();
        $('#errVF').remove();
        if (coordinatesLoaded) {

            try {
                $('#errMemory').remove();
                // let time = Date.now();
                [vf, vfNorm] = runKDE(X, Y, ZGenes, genes, xmax, ymax, sigma / xmax * height, width, height);
                // console.log(Date.now() - time);
                umPerPx = xmax / width;

                plotVfNorm('vf-norm-preview', vfNorm.arraySync(), generateScalebar(width / 10, width / 3, umPerPx));
                document.getElementById('vf-norm-preview').on('plotly_relayout', updateVfNormScalebar);
                window.onresize = function(event) {
                    updateVfNormScalebar;
                }
            }
            catch (ex) {
                printErr('#vf-norm-preview', 'errMemory', "Memory exceeded. Please use a smaller vector field size.")
                console.log(ex);
            }
        }
        else {
            printErr('#vf-norm-preview', 'errCoords', "Please load a coordinate file first.")
        }
    };

    function runCelltypeAssignments() {

        $('#errSign').remove();
        $('#errVF').remove();
        if (!signatureMatrix) {
            printErr('#celltypes-preview', 'errSign', 'Please load a signature matrix first.');
        }
        else if (!vf) {
            printErr('#celltypes-preview', 'errVF', 'Please run a KDE first.');
        }
        else {
            const celltypeMap = assignCelltypes(vf, vfNorm, signatureMatrix, threshold);
            var celltypeCounts = calculateStats(celltypeMap, clusterLabels.length - 1);

            plotCelltypeMap('celltypes-preview', celltypeMap.arraySync(), clusterLabels, getClusterLabel, layout = generateScalebar(width / 10, width / 3, umPerPx), highlight = null, cValGenGetter = getColorMap);
            plotCelltypeStats('celltypes-stats', celltypeCounts, clusterLabels, layout = {}, highlight = null, cValGenGetter = getColorMap);
            umPerPx = xmax / width;
            document.getElementById('celltypes-preview').on('plotly_relayout', updateCtMapScalebar);
            document.getElementById('celltypes-preview').on('plotly_relayout', updateStats);
            window.onresize = function(event) {
                updateCtMapScalebar;
            }
        }
    };


    function updateVfShape() {
        // togglePreviewGenerator();
        $('#errMemory').remove();
        height = parseInt(document.getElementById('vf-width').value);
        width = Math.ceil(height * edgeRatio);
        setVfSizeIndicator(width, height, genes);
        if (document.getElementById('preview-generator').style.display == 'block') {
            if (document.getElementById('liveParameterUpdateCheckbox').checked) {
                updateParameterVf();
            }
            else {
                refreshParameterGenerator()
            }
        }

        updateParameterRectangle(pointerCoordinates, parameterWidth * xmax / width);

    };

    function updateSigma() {
        // togglePreviewGenerator();
        sigma = parseFloat(document.getElementById('KDE-bandwidth').value);
        // console.log(document.getElementById('preview-generator').style.display);

        if (document.getElementById('preview-generator').style.display == 'block') {
            if (document.getElementById('liveParameterUpdateCheckbox').checked)
                updateParameterVf();
            else {
                refreshParameterGenerator()
            }
        }

    };

    function updateThreshold() {
        // togglePreviewGenerator();
        threshold = parseFloat(document.getElementById('threshold').value);
        if (document.getElementById('preview-generator').style.display == 'block') {
            {
                if (document.getElementById('liveParameterUpdateCheckbox').checked) {

                    updateParameterCelltypes();
                }
                else {
                    refreshParameterGenerator()
                }
            }
        }
    }

    // Open/close parameter optimization section
    function toggleParameterGenerator() {
        var previewGenerator = document.getElementById('preview-generator');

        if (previewGenerator.style.display === "none") {
            displayParameterGenerator();
            createParameterCoodinatesPlot();
        } else if (document.getElementById("bar-parameters").style.color == 'red') {
            // displayParameterGenerator();
            createParameterCoodinatesPlot();
            document.getElementById("bar-parameters").style.color = 'black';
            document.getElementById("bar-parameters").innerHTML = 'Close preview generator';

        } else {
            // console.log(document.getElementById("bar-parameters").innerHTML);
            hideParameterGenerator();
        }

    };

    // create small parameter celltype map
    function updateParameterCelltypes() {
        const parameterCelltypeMap = assignCelltypes(vfParameter, vfNormParameter, signatureMatrix, threshold);
        labelsShort = clusterLabels.map(function (e) {
            return e.substring(0, 5) + '.';
        });
        // console.log(labelsShort);
        plotCelltypeMap('parameter-celltypes', parameterCelltypeMap.arraySync(), labelsShort, getClusterLabel, layout = {}, highlight = null, cValGenGetter = getColorMap);
        // plotCelltypeMap('celltypes-preview', celltypeMap.arraySync(), clusterLabels, getClusterLabel, layout = generateScalebar(width / 10, width / 3, umPerPx), highlight = null, cValGenGetter = getColorMap);

    }

    // update small vector field
    function updateParameterVf() {
        [vfParameter, vfNormParameter] = runKDE(parameterX, parameterY, parameterZ,
            genes, parameterWidth * xmax / width * 2, parameterWidth * ymax / height * 2,
            sigma / xmax * height, parameterWidth * 2, parameterWidth * 2);
        plotVfNorm('parameter-vf', vfNormParameter.arraySync());
        updateParameterCelltypes();
    };

    // remove coordinates outside box for preview 
    function updateParameterCoordinates() {
        parameterX = []
        parameterY = []

        var rectCenter = [parameterWindow[0] / width * xmax, parameterWindow[1] / height * ymax];
        var rectEdge = parameterWidth / width * xmax;

        for (var i = 0; i < X.length; i++) {
            if (X[i] > rectCenter[0] - rectEdge &&
                Y[i] > rectCenter[1] - rectEdge &&
                X[i] < rectCenter[0] + rectEdge &&
                Y[i] < rectCenter[1] + rectEdge) {
                parameterX.push(X[i] - rectCenter[0] + rectEdge);
                parameterY.push(Y[i] - rectCenter[1] + rectEdge);
                parameterZ.push(ZGenes[i]);
            }
        }
    };


    function updateValues(){
        threshold = parseFloat(document.getElementById('threshold').value);
        sigma = parseFloat(document.getElementById('KDE-bandwidth').value);
        height = parseInt(document.getElementById('vf-width').value);
        width = Math.ceil(height * edgeRatio);
        // updateScale();
        console.log(threshold)
    }

    // create the small parameter optimization mrna coordinates panel
    function createParameterCoodinatesPlot() {
        updateParameterCoordinates();
        var rectCenter = [parameterWindow[0] / width * xmax, parameterWindow[1] / height * ymax];
        var rectEdge = parameterWidth / width * xmax;
        var layoutRect = {
            shapes: [
                //Unfilled Rectangle
                {
                    type: 'rect',
                    x0: rectCenter[0] - rectEdge,
                    y0: rectCenter[1] - rectEdge,
                    x1: rectCenter[0] + rectEdge,
                    y1: rectCenter[1] + rectEdge,
                    line: {
                        color: 'rgba(255, 255, 255, 1)'
                    },
                },],
            'showlegend': false,

        }

        plotCoordinates('parameter-coordinates', X, Y, ZGenes, layoutRect);
        document.getElementById('parameter-coordinates')
            .on('plotly_hover', updatePointerCoordinates);
        document.getElementById('parameter-coordinates')
            .on('plotly_click', updateRectangle);
        updateParameterVf();
    };

    // store pointer coordinates to draw rectangle on preview map
    function updatePointerCoordinates(eventData) {
        pointerCoordinates = [eventData.xvals[0], eventData.yvals[0]];
    };

    // draw rectangle on preview map
    function updateRectangle(eventData) {
        updateParameterRectangle(pointerCoordinates, parameterWidth * xmax / width);
        parameterWindow = [Math.ceil(pointerCoordinates[1] / xmax * width),
        Math.ceil(pointerCoordinates[0] / xmax * width)];

        if (document.getElementById('liveParameterUpdateCheckbox').checked) {
            updateParameterCoordinates();
            updateParameterVf();
        }
        else {

            refreshParameterGenerator()
        }

    };

    function togglePreviewGenerator() {
        refreshParameterGenerator()
    }

    function initiateButtons() {

        document.getElementById('btn-signatures-hidden')
            .addEventListener('change', importSignatures);
        document.getElementById('btn-coordinates-hidden')
            .addEventListener('change', importCoordinates);
        document.getElementById('btn-cmap-hidden')
            .addEventListener('change', importColorMap);
        // document.getElementById('liveParameterUpdateCheckbox')
        //     .addEventListener('change', liveChecked);
        // document.getElementById('liveParameterUpdateCheckbox')
        //     .addEventListener('uncheck', liveUnChecked);

        document.getElementById('coordinates-dragzone')
            .addEventListener("dragover", allowDrop);
        document.getElementById('coordinates-dragzone')
            .addEventListener("drop", dropCoords);
        document.getElementById('signatures-dragzone')
            .addEventListener("dragover", allowDrop);
        document.getElementById('signatures-dragzone')
            .addEventListener("drop", dropSignatures);

        document.getElementById('btn-KDE')
            .addEventListener('click', runFullKDE);
        document.getElementById('btn-types')
            .addEventListener('click', runCelltypeAssignments);
        document.getElementById('btn-reload')
            .addEventListener('click', reloadPage);

        document.getElementById('btn-parameters')
            .addEventListener('click', toggleParameterGenerator);
        document.getElementById('vf-width')
            .addEventListener('change', updateVfShape);
        document.getElementById('KDE-bandwidth')
            .addEventListener('change', updateSigma);
        document.getElementById('threshold')
            .addEventListener('change', updateThreshold);
        //     .addEventListener("change", togglePreviewGenerator);
        document.getElementById('exampleScale')
            .addEventListener("change", updateScale);
        document.getElementById('button-tutorial')
            .addEventListener('click', runTutorial);
        // document.getElementById('vf-width')
        //     .addEventListener("change", togglePreviewGenerator);
        // document.getElementById('KDE-bandwidth')
        //     .addEventListener("change", togglePreviewGenerator);
        // document.getElementById('threshold')
        //     .addEventListener("change", togglePreviewGenerator);

        // Reset values @ page reload
        // document.getElementById('vf-width').value = 500;
        // document.getElementById('KDE-bandwidth').value = 1;
        // document.getElementById('threshold').value = 2;

    };

    function initiateDataToggle() {
        $('[data-toggle="KDE-bandwidth"]').tooltip();
        $('[data-toggle="vf-width"]').tooltip();
        $('[data-toggle="threshold"]').tooltip();
    };

    function getcurrrentVersion() {
        $.ajax({
            type: "GET",
            url: "https://api.github.com/repos/HiDiHlabs/ssam-lite/tags",
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                response.shift();
                const versions = response.sort((v1, v2) => semver.compare(v2.name, v1.name));
                $('#result').html('v' + versions[0].name);
            },
            error: function (err) {
                console.log(err);
            }
        });

    };
    getcurrrentVersion();
    initiateDataToggle();
    initiateButtons();
    updateValues();


}
main();
