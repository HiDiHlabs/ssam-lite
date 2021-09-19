
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
    var allTextLines = allText.split(/\r\n|\n/);

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
        var sigma = 1;   // KDE kernel width

        var height = 500;         // vf height (pixels)
        var width = 0;      // vf width (pixels)
        var edgeRatio = 1;// radion height/width
        var threshold = 2;     // cell/ecm cutoff
        var vf;         // tensor vectorfield
        var vfNorm;     // tensor vfNorm

        var parameterWindow = [250, 250];
        var parameterWidth = 50;
        var parameterX = [];
        var parameterY = [];
        var parameterZ = [];
        var vfParameter;
        var vfNormParameter;

        var pointerCoordinates = parameterWindow;

        function getClusterLabel(i) {
            return clusterLabels[i];
        }

    }


    async function importSignatures(path) {

        console.log('loading signatures');
        document.getElementById("signature-loader").style.display = "block";   //display waiting symbol


        var fileToLoad = document.getElementById("btn-signatures-hidden").files[0];

        [signatureMatrix, clusterLabels, genes] = (processSignatures(await readFileAsync(fileToLoad)));

        setVfSizeIndicator(width, height, genes);

        plotSignatures('signatures-preview', genes, clusterLabels, signatureMatrix.arraySync()).then(function () {
            document.getElementById("signature-loader").style.display = "none";
        });

        signaturesLoaded = true;
        $('#errSign').remove();

    };

    async function importCoordinates(path) {
        $('#errCoords').remove();

        vf = null;
        X = [];        // mRNA x coordinates
        Y = [];          // mRNA y coordinates
        ZGenes = [];     // gene information
        xmax = [];       // highest coordinate
        ymax = [];       // lowest coordinate

        console.log(ZGenes);
        console.log('loading coordinates');
        document.getElementById("coordinate-loader").style.display = "block";   //display waiting symbol

        var fileToLoad = document.getElementById("btn-coordinates-hidden").files[0];


        [X, Y, ZGenes, coordGenes, xmax, ymax, edgeRatio, width, height] = processCoordinates(await readFileAsync(fileToLoad));
        if (!genes.length) genes = coordGenes; //use genes from the coordinate file for now, e.g. kde

        edgeRatio = xmax / ymax;
        width = Math.ceil(height * edgeRatio);
        setVfSizeIndicator(width, height, genes);

        plotCoordinates('coordinates-preview', X, Y, ZGenes, {'showlegend': true,}).then(function () {
            document.getElementById("coordinate-loader").style.display = "none";
        });

        coordinatesLoaded = true;
    };

    function runFullKDE() {
        $('#errCoords').remove();
        $('#errVF').remove();
        if (coordinatesLoaded) {

            try {
                $('#errMemory').remove();
                [vf, vfNorm] = runKDE(X, Y, ZGenes, genes, xmax, ymax, sigma, width, height);

                plotVfNorm('vf-norm-preview', vfNorm.arraySync());
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
        else if (!vf ) {
            printErr('#celltypes-preview', 'errVF', 'Please run a KDE first.');
        }
        else {
            celltypeMap = assignCelltypes(vf, vfNorm, signatureMatrix, threshold);
            plotCelltypeMap('celltypes-preview', celltypeMap.arraySync(), clusterLabels, getClusterLabel);
        }
    };

    function updateVfShape() {
        $('#errMemory').remove();
        height = parseInt(document.getElementById('vf-width').value);
        width = Math.ceil(height * edgeRatio);
        setVfSizeIndicator(width, height, genes);
        if (document.getElementById('preview-generator').style.display == 'block') {
            updateParameterVf();
            updateParameterRectangle(pointerCoordinates, parameterWidth * xmax / width);
        }
    };

    function updateSigma() {
        sigma = parseFloat(document.getElementById('KDE-bandwidth').value);
        console.log(document.getElementById('preview-generator').style.display);

        if (document.getElementById('preview-generator').style.display == 'block') {
            updateParameterVf();
        }
    };

    function updateThreshold() {
        threshold = parseFloat(document.getElementById('threshold').value);
        if (document.getElementById('preview-generator').style.display == 'block') {
            updateParameterCelltypes();
        }
    };

    function toggleParameterGenerator() {
        var previewGenerator = document.getElementById('preview-generator');

        if (previewGenerator.style.display === "none") {
            displayParameterGenerator();
            createParameterCoodinatesPlot();
        } else if (document.getElementById("bar-parameters").innerHTML.includes("Refresh")){
            displayParameterGenerator();
            createParameterCoodinatesPlot();
        } else {
            console.log(document.getElementById("bar-parameters").innerHTML);
            hideParameterGenerator();
        }

    };

    function updateParameterCelltypes() {
        parameterCelltypeMap = assignCelltypes(vfParameter, vfNormParameter, signatureMatrix, threshold);
        labelsShort = clusterLabels.map(function (e) {
            return e.substring(0, 5) + '.';
        });
        console.log(labelsShort);
        plotCelltypeMap('parameter-celltypes', parameterCelltypeMap.arraySync(), labelsShort);
    }

    function updateParameterVf() {
        [vfParameter, vfNormParameter] = runKDE(parameterX, parameterY, parameterZ,
            genes, parameterWidth * xmax / width * 2, parameterWidth * ymax / height * 2,
            sigma, parameterWidth * 2, parameterWidth * 2);
        plotVfNorm('parameter-vf', vfNormParameter.arraySync());
        updateParameterCelltypes();
    };

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

    function updatePointerCoordinates(eventData) {
        pointerCoordinates = [eventData.xvals[0], eventData.yvals[0]];
    };

    function updateRectangle(eventData) {
        updateParameterRectangle(pointerCoordinates, parameterWidth * xmax / width);
        parameterWindow = [Math.ceil(pointerCoordinates[1] / xmax * width),
        Math.ceil(pointerCoordinates[0] / xmax * width)];
        updateParameterCoordinates();
        updateParameterVf();
        // console.log(pointerCoordinates);
    };
    function togglePreviewGenerator() {
        // console.log('Hellow')
        refreshParameterGenerator()
    }

    function initiateButtons() {


        document.getElementById('btn-signatures-hidden')
            .addEventListener('change', importSignatures);
        document.getElementById('btn-coordinates-hidden')
            .addEventListener('change', importCoordinates);
        document.getElementById('btn-KDE')
            .addEventListener('click', runFullKDE);
        document.getElementById('btn-types')
            .addEventListener('click', runCelltypeAssignments);

        document.getElementById('btn-parameters')
            .addEventListener('click', toggleParameterGenerator);
        // document.getElementById('vf-width')
        //     .addEventListener('change', updateVfShape);
        // document.getElementById('KDE-bandwidth')
        //     .addEventListener('change', updateSigma);
        // document.getElementById('threshold')
        //     .addEventListener('change', updateThreshold);
        document.getElementById('button-tutorial')
            .addEventListener('click', runTutorial);
        document.getElementById('vf-width')
            .addEventListener("change", togglePreviewGenerator);
        document.getElementById('KDE-bandwidth')
            .addEventListener("change", togglePreviewGenerator);
        document.getElementById('threshold')
            .addEventListener("change", togglePreviewGenerator);

        // Reset values @ page reload
        document.getElementById('vf-width').value = 500;
        document.getElementById('KDE-bandwidth').value = 1;
        document.getElementById('threshold').value = 2;

    };

    function initiateDataToggle(){
        $('[data-toggle="KDE-bandwidth"]').tooltip();
        $('[data-toggle="vf-width"]').tooltip();
        $('[data-toggle="threshold"]').tooltip();
    };
    initiateDataToggle();
    initiateButtons();

}
main();