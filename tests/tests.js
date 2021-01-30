//load test data:
function readFileAsync(path) {
    return new Promise((resolve, reject) => {

        var allTextLines;

        $.ajax({
            type: "GET",
            url: path,
            async: false,
            dataType: "text",
            success: function (data) { resolve(data); }

        });

    })
};

async function loadTestSignatures(path) {
    var genes;
    var clusterLabels;
    var signatureBuffer;

    allText = await readFileAsync(path);

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
    return [signatureBuffer.toTensor(), genes, clusterLabels];
};

async function loadTestCoordinates(path) {

    var Zgenes = [];
    var X = [];
    var Y = [];

    xmax = 0;
    ymax = 0;

    allText = await readFileAsync(path);

    var allTextLines = allText.split(/\r\n|\n/);

    var x = 0;
    var y = 0;
    var line;

    for (var i = 1; i < allTextLines.length; i++) {
        line = allTextLines[i].split(',');

        x = parseFloat(line[1]) || 0;
        y = parseFloat(line[2]) || 0;

        xmax = Math.max(x, xmax);
        ymax = Math.max(y, ymax);

        X.push(x);
        Y.push(y);
        Zgenes.push(line[0]);
    }
    return [X, Y, Zgenes, xmax, ymax];
};

function testKDE(X, Y, Zgenes, genes, xmax, ymax) {

    // Compute vf shape:
    var edgeTarget = 150;
    var edgeTotal = xmax + ymax;
    height = Math.ceil(xmax / edgeTotal * edgeTarget);
    width = Math.ceil(ymax / edgeTotal * edgeTarget);

    const sigma = 1;

    output = runKDE(X, Y, Zgenes, genes, xmax, ymax, sigma, height, width);

    return output;
}

async function runTests() {

    // Loading and plotting signatures & coordinates
    [signatureMatrix, genes, clusterLabels] = await loadTestSignatures('../resources/test_data/hca_pancreas' + '/signatures.csv');
    [X, Y, Zgenes, xmax, ymax] = await loadTestCoordinates('../resources/test_data/hca_pancreas' + '/sample.csv');


    // plotCoordinates("plot-coordinates", X, Y, Zgenes);
    // plotSignatures("plot-signatures", genes, clusterLabels, signatureMatrix.arraySync());

    [vf,vfNorm] = await testKDE(X, Y, Zgenes, genes, xmax, ymax);
    plotVfNorm('plot-vf-norm',vfNorm.arraySync());

    celltypeMap = assignCelltypes(vf,vfNorm,signatureMatrix,1);
    plotCelltypeMap('plot-celltype-map',celltypeMap.arraySync(),clusterLabels);

    vf.dispose();
    vfNorm.dispose();

};

runTests();