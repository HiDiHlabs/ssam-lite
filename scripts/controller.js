
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



function processSignatures(allText, geneList = null) {

    // process the csv string 'allText', return a tensor of signatures, a 'clusterLabels' (column labels) list and 'genes' (row labels) list.

    var nClusters, nGenes, genes, clusterLabels;

    let allTextLines = allText.trim().split(/\r\n|\n/);
    let header = allTextLines[0].split(',').slice(1);

    if (geneList == null) {
        geneList = allTextLines.map(x => x.split(',')[0]);
    }
    nGenes = geneList.length;

    nClusters = header.length

    clusterLabels = header;
    let signatureBuffer = tf.buffer([nClusters, nGenes]);

    for (var i = 1; i < allTextLines.length; i++) {
        let line = allTextLines[i].split(',');
        let gene = line[0];
        let geneIdx = geneList.indexOf(gene);
        if (!(geneIdx == -1)) {
            for (var j = 0; j < nClusters; j++) {
                signatureBuffer.set(parseFloat(line[j + 1]), j, geneIdx);
            }
        }
    }

    signatureBuffer = signatureBuffer.toTensor();

    genes = geneList;

    console.log(clusterLabels, geneList)

    return [signatureBuffer, clusterLabels, geneList];

    // // var genes;
    // var clusterLabels;
    // var signatureBuffer;
    // var n;
    // var allTextLines = allText.split(/\r\n|\n/);
    // var nClusters = allTextLines.length - 2;

    // console.log(geneList);

    // var header, nGenes;
    // if (geneList == null) {
    //     geneList = allTextLines[0].split(',').slice(1).sort();
    // }
    // header = allTextLines[0].split(',').slice(1);

    // nGenes = geneList.length;
    // signatureBuffer = tf.buffer([nClusters, nGenes]);

    // clusterLabels = [];

    // for (var i = 0; i < nClusters; i++) {
    //     line = allTextLines[i + 1].split(',');

    //     for (var j = 0; j < nGenes; j++) {
    //         n = header.indexOf(geneList[j])
    //         if (n > 0) {
    //             signatureBuffer.set(parseFloat(line[j + 1]), i, n);
    //         }
    //     }

    //     clusterLabels.push(line[0]);
    // }

    // signatureBuffer = signatureBuffer.toTensor();

    // genes = geneList;

    // return [signatureBuffer, clusterLabels, geneList];
};

function processCoordinates(allText) {
    var allTextLines = allText.trim().split(/\r\n|\n/);

    let genes = [];
    let ZGenes = [];
    let X = [];
    let Y = [];
    let x = 0;
    let y = 0;
    let line, yIdx;
    let xmin = 0;
    let ymin = 0;
    let xmax = 0;
    let ymax = 0;

    let geneCol = 0
    let xCol = 1
    let yCol = 2
    geneColFound = false;
    xColFound = false;

    let header = allTextLines[0].split(',');

    for (var i = 0; i < header.length; i++) {
        if (["target", "gene", "Gene", "feature_name"].some(x => header[i].includes(x))) {
            console.log("Found geneCol: ", i);
            geneCol = i;
            geneColFound = true;
            if (xColFound) break;
            continue;
        }

        if ((header[i].includes("x"))) {
            yIdx = header.map(x => x.replace("y", "$")).indexOf((header[i].replace("x", "$")));

            if (yIdx != (-1)) {
                console.log("Found xCol: ", i, yIdx);

                xCol = i;
                yCol = yIdx;

                xColFound = true;
                if (geneColFound) break;
                continue;
            }
        }

        else if ((header[i].includes("X"))) {
            yIdx = header.map(x => x.replace("Y", "$")).indexOf((header[i].replace("X", "$")));
            if (yIdx != (-1)) {
                console.log("Found xCol: ", i, yIdx);

                xCol = i;
                yCol = yIdx;

                xColFound = true;
                if (geneColFound) break;
                continue;
            }
        }
    }

    if (!geneColFound) {
        for (var i = 0; i < 3; i++) {
            if ((xCol != i) & (yCol != i)) {
                geneCol = i
                break
            }
        };
    }

    console.log(header, "genes: ", geneCol, "X:", xCol, "Y:", yCol);

    for (var i = 1; i < allTextLines.length; i++) {
        line = allTextLines[i].split(',');

        x = parseFloat(line[xCol]) || 0;
        y = parseFloat(line[yCol]) || 0;

        xmin = Math.min(x, xmin);
        ymin = Math.min(y, ymin);
        xmax = Math.max(x, xmax);
        ymax = Math.max(y, ymax);

        X.push(x);
        Y.push(y);
        ZGenes.push(line[geneCol]);
        if (!genes.includes(line[geneCol])) genes.push(line[geneCol]);
    }

    X.map(x => x - xmin);
    Y.map(x => x - ymin);
    xmax -= xmin;
    ymax -= ymin;

    var edgeRatio = Math.ceil(xmax / ymax);
    var width = Math.ceil(parseInt(document.getElementById('vf-width').value));
    // width = Math.ceil(height * edgeRatio);
    var height = Math.ceil(width / edgeRatio);
    // var height = Math.ceil(width / edgeRatio);

    genes = genes.sort()

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

            // console.log(clusterLabels[i], idx, colorList[idx])
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
        var genes;
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

        var height = 1400;         // vf height (pixels)
        var width = 0;      // vf width (pixels)
        var edgeRatio = 1;// radion height/width
        var threshold = 2;     // cell/ecm cutoff
        var vf;         // tensor vectorfield
        var vfNorm;     // tensor vfNorm
        var scale = 1;
        var localMaxX;
        var localMaxY;

        var parameterWindow = [250, 250];
        var parameterWidth = 50;
        var parameterX = [];
        var parameterY = [];
        var parameterZ = [];
        var vfParameter;
        var vfNormParameter;
        var cGen = getColorValue;

        var modularizedKDEWindowWidth = 300;

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

        [signatureMatrix, clusterLabels, geneList] = processSignatures(await readFileAsync(fileToLoad), genes);

        genes = geneList;

        console.log(genes, geneList);
        setVfSizeIndicator(width, height, genes);

        plotSignatures('signatures-preview', genes, clusterLabels, signatureMatrix.arraySync()).then(function () {
            document.getElementById("signature-loader").style.display = "none";
        });

        $("#button-download-signatures").show();

        signaturesLoaded = true;
        $('#errSign').remove();

        cGen = getColorValue;

    };

    // markerLists is a list of lists of marker genes. Each list corresponds to a cluster and contains the marker genes of that cluster.
    //  markerLists = [[marker1, marker2, ...], [marker1, marker2, ...], ...]
    // panglaoFrame is a dataframe implemented as a js object. It contains the PanglaoDB marker genes and their cell type and tissue annotations.
    // panglaoFrame = {cluster:[celltype1, celltype2, ...], label:[tissue1, tissue2, ...], p0:[occurrence_probability0, occurrence_probability1, ...], 
    // sample_tissue:[tissue1, tissue2, ...], gene:[marker1, marker2, ...]}
    // panglaoFrame stores its data in categorical form. The cell type and tissue annotations are stored as integers. 
    // The mapping between the integers and the actual annotations is stored in panglaoDicts.

    function panglaoCategoricalToText(panglaoFrame, panglaoDicts, rows, categories) {

        let panglaoFrameText = {};

        for (let i = 0; i < categories.length; i++) {
            panglaoFrameText[categories[i]] = [];
        }

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            for (let j = 0; j < categories.length; j++) {
                let category = categories[j];
                panglaoFrameText[category].push(panglaoDicts[category][panglaoFrame[category][row]]);
            }
        }

        return panglaoFrameText;
    }

    async function assignCelltype(markerLists) {

        let [header, panglaoFrame, panglaoDicts] = await loadPanglao();

        let celltypeMAPs = [];
        let celltypeProbs = [];

        for (let i = 0; i < markerLists.length; i++) {

            let markerList = markerLists[i];

            let celltypeMAP = [];
            let celltypeProb = [];

            for (let j = 0; j < panglaoFrame['gene'].length; j++) {

                let panglaoGene = panglaoFrame['gene'][j];

                if (markerList.includes(panglaoGene)) {

                    celltypeMAP.push(panglaoFrame['cluster'][j]);
                    celltypeProb.push(panglaoFrame['p0'][j]);
                }
            }

            celltypeMAPs.push(celltypeMAP);
            celltypeProbs.push(celltypeProb);
        }

        return [celltypeMAPs, celltypeProbs];
    }

    function translateMakerListsIndices(markerLists, panglaoDicts) {
        // translate marker lists from gene names to indices
        let markerListsIndices = [];
        for (let i = 0; i < markerLists.length; i++) {
            let markerList = markerLists[i];
            for (let j = 0; j < markerList.length; j++) {
                markerList[j] = (panglaoDicts['gene'].indexOf(markerList[j]));

            }
            markerListsIndices.push(markerList);

        }
        return markerListsIndices;
    }

    function findUniqueRows(celltypeMAPs, tissueMAPs, tissueProbs) {
        // remove duplicates, integrate probabilities
        let uniqueRows = [];
        let uniqueProbs = [];

        for (let i = 0; i < celltypeMAPs.length; i++) {

            let uniqueRow = [];
            let uniqueProb = [];

            for (let j = 0; j < celltypeMAPs[i].length; j++) {

                let celltypeMAP = celltypeMAPs[i][j];
                let tissueMAP = tissueMAPs[i][j];
                let tissueProb = tissueProbs[i][j];

                let row = [celltypeMAP, tissueMAP];

                if (!uniqueRow.includes(row)) {
                    uniqueRow.push(row);
                    uniqueProb.push(tissueProb);
                }

                else {
                    let index = uniqueRow.indexOf(row);
                    uniqueProb[index] = uniqueProb[index] + tissueProb;
                }
            }

            uniqueRows.push(uniqueRow);
            uniqueProbs.push(uniqueProb);
        }

        return [uniqueRows, uniqueProbs];
    }

    function filterPanglaoRows(markerListsIndices, panglaoFrame) {
        // filter PanglaoDB rows to only include marker genes
        // markerListsIndices is a list of lists of marker genes. Each list corresponds to a cluster and contains the marker genes of that cluster.
        //  markerListsIndices = [[marker1, marker2, ...], [marker1, marker2, ...], ...]
        // panglaoFrame is a dataframe implemented as a js object. It contains the PanglaoDB marker genes and their cell type and tissue annotations.

        let celltypeMAPs = [];
        let tissueMAPs = [];
        let tissueProbs = [];
        let markerList;

        for (let i = 0; i < markerListsIndices.length; i++) {

            markerList = markerListsIndices[i];

            let celltypeMAP = [];
            let tissueMAP = [];
            let tissueProb = [];

            for (let j = 0; j < panglaoFrame['gene'].length; j++) {

                let panglaoGene = panglaoFrame['gene'][j];

                if ((panglaoGene >= 0) & (markerList.length > 0) & markerList.includes(panglaoGene)) {

                    celltypeMAP.push(panglaoFrame['label'][j]);
                    tissueMAP.push(panglaoFrame['sample_tissue'][j]);
                    tissueProb.push(panglaoFrame['p0'][j]);

                }
            }

            celltypeMAPs.push(celltypeMAP);
            tissueMAPs.push(tissueMAP);
            tissueProbs.push(tissueProb);
        }

        return [celltypeMAPs, tissueMAPs, tissueProbs];
    }

    function createDistributionVectors(uniqueRows, uniqueProbs, panglaoDicts) {

        let tissueDistributions = [];
        let celltypeDistributions = [];
        let globalTissueDistribution = panglaoDicts['sample_tissue'].map(x => 0);

        for (let i = 0; i < uniqueRows.length; i++) {

            let celltypeDistribution = panglaoDicts['label'].map(x => 0);
            let tissueDistribution = panglaoDicts['sample_tissue'].map(x => 0);

            for (let j = 0; j < uniqueRows[i].length; j++) {

                let celltype = uniqueRows[i][j][0];
                let tissue = uniqueRows[i][j][1];
                let prob = uniqueProbs[i][j];

                celltypeDistribution[celltype] = celltypeDistribution[celltype] + prob;
                tissueDistribution[tissue] = tissueDistribution[tissue] + prob;
                globalTissueDistribution[tissue] = globalTissueDistribution[tissue] + prob;
            }

            let celltypeDistributionsSum = celltypeDistribution.reduce((a, b) => a + b, 0);
            let tissueDistributionsSum = tissueDistribution.reduce((a, b) => a + b, 0);

            if (celltypeDistributionsSum == 0) celltypeDistributionsSum = 1;
            if (tissueDistributionsSum == 0) tissueDistributionsSum = 1;

            celltypeDistributions.push(celltypeDistribution.map(x => x / celltypeDistributionsSum));
            tissueDistributions.push(tissueDistribution.map(x => x / tissueDistributionsSum));
        }

        let globalTissueDistributionSum = globalTissueDistribution.reduce((a, b) => a + b, 0);

        globalTissueDistribution = globalTissueDistribution.map(x => x / globalTissueDistributionSum);

        return [tissueDistributions, celltypeDistributions, globalTissueDistribution];
    }

    async function bayesianCelltypeTissueAssignment(markerLists) {
        // markerLists is a list of lists of marker genes. Each list corresponds to a cluster and contains the marker genes of that cluster.


        [header, panglaoFrame, panglaoDicts] = await loadPanglao();

        panglaoFrame.p0 = panglaoFrame.p0.map(x => 1);

        markerListsIndices = translateMakerListsIndices(markerLists, panglaoDicts);

        [celltypeMAPs, tissueMAPs, tissueProbs] = filterPanglaoRows(markerListsIndices, panglaoFrame);
        [uniqueRows, uniqueProbs] = findUniqueRows(celltypeMAPs, tissueMAPs, tissueProbs);

        [tissueDistributions, celltypeDistributions, globalTissueDistribution] = createDistributionVectors(uniqueRows, uniqueProbs, panglaoDicts);

        console.log("uniqueRows:", uniqueRows, "uniqueProbs:", uniqueProbs, "tissueDistributions:", tissueDistributions, "celltypeDistributions:", celltypeDistributions, "globalTissueDistribution:", globalTissueDistribution);


        // Update uniqueprobs usig globalTissueDistribution
        for (let i = 0; i < uniqueProbs.length; i++) {
            for (let j = 0; j < uniqueProbs[i].length; j++) {
                let tissue = uniqueRows[i][j][1];
                uniqueProbs[i][j] = uniqueProbs[i][j] * globalTissueDistribution[tissue];
            }
        }

        [tissueDistributions, celltypeDistributions, globalTissueDistribution] = createDistributionVectors(uniqueRows, uniqueProbs, panglaoDicts);
        console.log("tissueDistributions:", tissueDistributions, "celltypeDistributions:", celltypeDistributions, "globalTissueDistribution:", globalTissueDistribution)

        // find the most likely cell type and tissue for each cluster
        let celltypeAssignments = [];
        let tissueAssignments = [];
        for (let i = 0; i < uniqueRows.length; i++) {
            let maxCelltype = celltypeDistributions[i].indexOf(Math.max(...celltypeDistributions[i]));
            let maxTissue = tissueDistributions[i].indexOf(Math.max(...tissueDistributions[i]));
            celltypeAssignments.push(maxCelltype);
            tissueAssignments.push(maxTissue);
        }

        // find the most likely global tissue
        let globalTissueAssignment = globalTissueDistribution.indexOf(Math.max(...globalTissueDistribution));
        let globalTissueAssignmentName = panglaoDicts['sample_tissue'][globalTissueAssignment];

        // translate the indices to the actual cell types and tissues
        let celltypeAssignmentsNames = [];
        let tissueAssignmentsNames = [];
        for (let i = 0; i < celltypeAssignments.length; i++) {
            celltypeAssignmentsNames.push(panglaoDicts['label'][celltypeAssignments[i]]);
            tissueAssignmentsNames.push(panglaoDicts['sample_tissue'][tissueAssignments[i]]);
        }

        console.log("celltypeAssignmentsNames:", celltypeAssignmentsNames, "tissueAssignmentsNames:", tissueAssignmentsNames, "globalTissueAssignmentName:", globalTissueAssignmentName);


        return [celltypeAssignmentsNames, tissueAssignmentsNames, globalTissueAssignmentName];

    }




    async function importCoordinates(fileToLoad) {

        $('#errCoords').remove();

        vf = null;
        X = [];          // mRNA x coordinates
        Y = [];          // mRNA y coordinates
        ZGenes = [];     // gene information
        xmax = [];       // highest coordinate
        ymax = [];       // lowest coordinate

        // console.log(ZGenes);
        // console.log('loading coordinates');
        document.getElementById("coordinate-loader").style.display = "block";   //display waiting symbol

        if (fileToLoad.constructor.name != "File") {
            fileToLoad = document.getElementById("btn-coordinates-hidden").files[0];
        }

        [X, Y, ZGenes, coordGenes, xmax, ymax, edgeRatio, width, height] = processCoordinates(await readFileAsync(fileToLoad));
        if (genes == null) genes = coordGenes; //use genes from the coordinate file for now, e.g. kde

        edgeRatio = xmax / ymax;
        width = Math.ceil(height * edgeRatio);
        setVfSizeIndicator(width, height, genes);


        coordinatesLoaded = true;
        plotCoordinates('coordinates-preview', X, Y, ZGenes, { 'showlegend': true, }).then(function () {
            document.getElementById("coordinate-loader").style.display = "none";
        });



    };


    function getColorMap() {
        return cGen;
    }



    async function importColorMap(fileToLoad) {

        $('#errCoords').remove();

        // console.log('loading cMap');

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
        // // console.log('kewl', x_, _x, y_, _y);
        // var celltypeCounts = calculateStats(celltypeMap.slice([x_, y_], [_x - x_ + 1, _y - y_ + 1]), clusterLabels.length - 1);
        // // console.log(celltypeCounts);
        // plotCelltypeStats('celltypes-stats', celltypeCounts, clusterLabels, layout = {}, highlight = null, cValGenGetter = getColorMap);

    }

    async function runModularizedCTAssignment() {

        let celltypeMap = tf.buffer([width, height], dtype = 'float32',);
        let umPerPx = xmax / width;

        for (let x_ = 0; x_ < width; x_ += modularizedKDEWindowWidth) {
            for (let y_ = 0; y_ < height; y_ += modularizedKDEWindowWidth) {

                [subsetX, subsetY, subsetGenes] = spatialSubset(X, Y, ZGenes,
                    x_ * umPerPx, (x_ + modularizedKDEWindowWidth) * umPerPx,
                    y_ * umPerPx, (y_ + modularizedKDEWindowWidth) * umPerPx, true);

                // console.log(x_, y_, subsetX.length);

                if (subsetX.length > 0) {
                    console.log("Coords: ", x_, y_, width, height);

                    [vfPatch, vfNormPatch] = runKDE(subsetX.map(x => x / umPerPx), subsetY.map(x => x / umPerPx), subsetGenes, genes,
                        modularizedKDEWindowWidth, modularizedKDEWindowWidth, sigma / umPerPx,
                        modularizedKDEWindowWidth, modularizedKDEWindowWidth, 3);

                    // console.log("Patch-max: ", vfNormPatch.max().arraySync());

                    let celltypeMapPatch = await assignCelltypes(vfPatch, vfNormPatch, signatureMatrix, threshold).buffer();

                    // console.log("celltypeMapPatch: ", celltypeMapPatch);
                    // console.log("celltypeMapPatchMax: ", celltypeMapPatch.toTensor().max().arraySync());

                    for (let i = 0; (i < modularizedKDEWindowWidth) & ((i + x_) < width); i++) {
                        for (let j = 0; (j < modularizedKDEWindowWidth) & ((j + y_) < height); j++) {
                            celltypeMap.set(celltypeMapPatch.get(i, j), i + x_, j + y_)
                        }
                    }
                }

                else {

                    for (let i = 0; (i < modularizedKDEWindowWidth) & ((i + x_) < width); i++) {
                        for (let j = 0; (j < modularizedKDEWindowWidth) & ((j + y_) < height); j++) {
                            celltypeMap.set(-1, i + x_, j + y_)
                        }
                    }

                }
                // if (y_ > 0) break;
            }
            // break
        }

        // modularizedKDEWindowWidth

        // console.log(celltypeMap);
        return celltypeMap.toTensor();
    }



    async function localMaxFilter() {

        localmaxThreshold = parseFloat(document.getElementById('threshold').value);
        [localMaxX, localMaxY] = await runLocalMaxFilter(vfNorm, height, width, radius = Math.max(sigma * 3,9) / xmax * width, localmaxThreshold = localmaxThreshold);
        // console.log('localmax filter completed', localMaxX, localMaxY);
    }

    function runGlobalKDE() {

        $('#errCoords').remove();
        $('#errVF').remove();

        if (coordinatesLoaded) {
            umPerPx = xmax / width;
            try {
                $('#errMemory').remove();
                // let time = Date.now();

                [vf, vfNorm] = runKDE(X, Y, null, ['global'], xmax, ymax, sigma / umPerPx, width, height);



                // plotVfNorm('vf-norm-preview', vfNorm.arraySync(), generateScalebar(width / 10, width / 3, umPerPx));
                // document.getElementById('vf-norm-preview').on('plotly_relayout', updateVfNormScalebar);
                // window.onresize = function (event) {
                //     updateVfNormScalebar;
                // }
            }
            catch (ex) {
                printErr('#vf-norm-preview', 'errMemory', "Memory exceeded. Please use a smaller vector field size.")
                // console.log(ex);
            }


        }
        else {
            printErr('#vf-norm-preview', 'errCoords', "Please load a coordinate file first.")
        }


    };

    async function createUmapColors(localmaxExpressions, umapCoords, localMaxXumap, localMaxYumap,) {
        // perform 3d/color embedding:
        let umapColorCoords = runUMAP(localmaxExpressions.arraySync(), nComponents = 3, minDist = 0.0, nNeighbors = 20);// initData = umapCoords.map(x=>x.push(0)));

        umapColorCoords = await PCA(umapColorCoords, 3)

        // console.log('facs:',facs);// #= tf.tensor(facs)

        uCCmins = [0, 1, 2].map(x => Math.min(...umapColorCoords.map(y => y[x])));
        umapColorCoords = umapColorCoords.map(x => [x[0] - uCCmins[0], x[1] - uCCmins[1], x[2] - uCCmins[2]]);
        uCCmaxs = [0, 1, 2].map(x => Math.max(...umapColorCoords.map(y => y[x])));
        umapColorCoords = umapColorCoords.map(x => [x[0] / uCCmaxs[0], x[1] / uCCmaxs[1], x[2] / uCCmaxs[2]]);
        umapColorCoordsRgb = umapColorCoords.map(x => `rgb(${Math.floor(x[0] * 256)},${Math.floor(x[1] * 256)},${Math.floor(x[2] * 256)})`);

        // console.log('umap exps:',signatureMatrix);      

        [_, umapLocalMaxColors] = await determineWeightedExpression(localMaxXumap, localMaxYumap,
            umapCoords.map(x => x[0] - uCmins[0]), umapCoords.map(x => x[1] - uCmins[1]), tf.tensor(umapColorCoords), sigmaWE = 1)

        umapLocalMaxColors = umapLocalMaxColors.arraySync().map(x => `rgb(${Math.floor(x[0] * 256)},${Math.floor(x[1] * 256)},${Math.floor(x[2] * 256)})`);

        // console.log([umapLocalMaxColors, umapColorCoordsRgb]);

        return [umapLocalMaxColors, umapColorCoordsRgb];
    }

    async function identifyMarkerGenes(signatures) {
        let celltypeWiseMeans = signatures.mean(1).arraySync();

        signatures = signatures.arraySync();

        markerLists = []

        for (let i = 0; i < celltypeWiseMeans.length; i++) {
            let markerList = []

            for (let j = 0; j < genes.length; j++) {
                if (signatures[i][j] > celltypeWiseMeans[i]) {
                    markerList.push(genes[j])
                }
            }
            markerLists.push(markerList);
        }
        return markerLists;

    }

    function signaturesToCsv(signatureMatrix, genes, clusterLabels) {
        // Create a .csv format string from the values of the signature matrix, with genes as row annotations and clusterLabels as column annotations
        let csvString = 'celltype,' + clusterLabels.join(',') + '\n';

        for (let i = 0; i < signatureMatrix.shape[1]; i++) {

            csvString += genes[i] + ',' + signatureMatrix.slice([0, i], [-1, 1]).arraySync().join(',') + '\n';

        }
        return csvString;

    }

    function downloadSignatures() {
        let csvString = signaturesToCsv(signatureMatrix, genes, clusterLabels);
        let dataString = "data:text/csv;charset=utf-8," + csvString;
        download(csvString, 'signatures.csv', 'text/csv;encoding:utf-8');
    }


    // The download function takes a CSV string, the filename and mimeType as parameters
    // Scroll/look down at the bottom of this snippet to see how download is called
    var download = function (content, fileName, mimeType) {
        var a = document.createElement('a');
        mimeType = mimeType || 'application/octet-stream';

        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([content], {
                type: mimeType
            }), fileName);
        } else if (URL && 'download' in a) { //html5 A[download]
            a.href = URL.createObjectURL(new Blob([content], {
                type: mimeType
            }));
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
        }
    }

    function determineClusteringParameters() {

        let clusterLocalmaxRadius, clusterBandwidth, DBRadius, DBMinSamples;

        let selectedSensitivity = document.getElementById("clustering-sensitivity").selectedIndex;

        clusterLocalmaxRadius = [8, 5, 3][selectedSensitivity];
        clusterBandwidth = [8, 4, 1][selectedSensitivity];
        DBRadius = [0.4, 0.3, 0.2][selectedSensitivity];
        DBMinSamples = [2, 2, 2][selectedSensitivity];

        return [clusterLocalmaxRadius, clusterBandwidth, DBRadius, DBMinSamples,];
    }

    async function createLocalmaxSignatures() {

        [clusterLocalmaxRadius, clusterBandwidth, DBRadius, DBMinSamples,] = determineClusteringParameters();

        // Determine local expression patterns at localmaxs through KNN graph:
        let [knns, localmaxExpressions] = determineLocalExpression(localMaxX.map(x => x * umPerPx), localMaxY.map(x => x * umPerPx), X, Y, ZGenes, genes, 3 * sigma / (xmax / width),);

        // Embed localmax expressions:
        let umapCoords = runUMAP(localmaxExpressions.arraySync(), nComponents = 2, minDist = 0.0,);
        umapCoords = umapCoords.map(x => x.map(y => y * 8));

        // KDE on 2d embedding:
        uCmins = [0, 1,].map(x => Math.min(...umapCoords.map(y => y[x])));
        uCmaxs = [0, 1,].map(x => Math.max(...umapCoords.map(y => y[x])));
        [_, umapHeatmap] = runKDE(umapCoords.map(x => x[0] - uCmins[0]), umapCoords.map(x => x[1] - uCmins[1]), null, ['global'], null, null, clusterBandwidth);

        // localmax detection in 2d embedding:
        [localMaxXumap, localMaxYumap] = await runLocalMaxFilter(umapHeatmap, umapHeatmap.shape[1], umapHeatmap.shape[0], radius = clusterLocalmaxRadius, localmaxThreshold = 0.000001,);

        // Inverse localmax embedding(->retrieves signatures from umap coords...)
        [_, umapExpression] = await determineWeightedExpression(localMaxXumap, localMaxYumap,
            umapCoords.map(x => x[0] - uCmins[0]), umapCoords.map(x => x[1] - uCmins[1]), localmaxExpressions, sigmaWE = 1)

        signatureMatrix = umapExpression;
        console.log("signatures:", signatureMatrix);

        // markerLists = identifyMarkerGenes(signatureMatrix);
        // panglaoInfo = markerLists.then(bayesianCelltypeTissueAssignment);
        // // panglaoMAPs = markerLists.then(assignPanglaoMAP);

        // return ;

        [umapLocalMaxColors, umapColorCoordsRgb] = await createUmapColors(localmaxExpressions, umapCoords, localMaxXumap, localMaxYumap,);

        let [clusters, centroids, dbscanOut] = await runDBSCAN(signatureMatrix.arraySync(), DBRadius, DBMinSamples,);


        function colorGenerator(val) {
            // console.log("generated: ", val)
            if (val == 0) {
                return "rgb(0,0,0)";
            }
            else {
                return umapLocalMaxColors[Math.floor(val * (umapLocalMaxColors.length - 1))];
            }
        }

        console.log("signatures:", dbscanOut);
        signatureMatrix = centroids;
        clusterLabels = [...Array(signatureMatrix.shape[0]).keys()];

        cGen = colorGenerator;

        // console.log(umapLocalMaxColors);


        plotSignatures('signatures-preview', genes, Array.from({ length: signatureMatrix.shape[0] }, (x, i) => i), signatureMatrix.arraySync()).then(function () {
            document.getElementById("signature-loader").style.display = "none";
        });
        signaturesLoaded = true;

        $("#button-download-signatures").show();


        // console.log("umapCoords:", umapCoords);
        // plotVfNorm('localmax-preview', umapHeatmap.arraySync());
        // plotUmap('umap-preview', localMaxYumap, localMaxXumap, colors = umapLocalMaxColors);
        plotUmap('umap-preview', umapCoords.map(x => x[0]), umapCoords.map(x => x[1]), colors = umapColorCoordsRgb);
        plotUmap('localmax-preview', localMaxY, localMaxX, colors = umapColorCoordsRgb);

    }

    async function runDeNovo() {
        runGlobalKDE();

        await localMaxFilter();

        await createLocalmaxSignatures();

    }

    async function runCelltypeAssignments() {

        $('#errSign').remove();
        $('#errVF').remove();
        if (!signatureMatrix) {
            await runDeNovo();
            // printErr('#celltypes-preview', 'errSign', 'Please load a signature matrix first.');
        }
        // else if (!vf) {
        //     printErr('#celltypes-preview', 'errVF', 'Please run a KDE first.');
        // }
        else {
            // const celltypeMap = assignCelltypes(vf, vfNorm, signatureMatrix, threshold);

            umPerPx = xmax / width;

            const celltypeMap = await runModularizedCTAssignment()

            // console.log("ct_map: ", celltypeMap);
            var celltypeCounts = calculateStats(celltypeMap, clusterLabels.length - 1);



            plotCelltypeMap('celltypes-preview', celltypeMap.arraySync(), clusterLabels, getClusterLabel, layout = generateScalebar(width / 10, width / 3, umPerPx), highlight = null, cValGenGetter = getColorMap);
            plotCelltypeStats('celltypes-stats', celltypeCounts, clusterLabels, layout = {}, highlight = null, cValGenGetter = getColorMap);
            umPerPx = xmax / width;
            document.getElementById('celltypes-preview').on('plotly_relayout', updateCtMapScalebar);
            document.getElementById('celltypes-preview').on('plotly_relayout', updateStats);
            window.onresize = function (event) {
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
        // parameterX = []
        // parameterY = []

        var rectCenter = [parameterWindow[0] / width * xmax, parameterWindow[1] / height * ymax];
        var rectEdge = parameterWidth / width * xmax;

        // console.log(rectCenter, rectEdge);
        [subsetX, subsetY, subsetZ] = spatialSubset(X, Y, ZGenes, rectCenter[0] - rectEdge,
            rectCenter[0] + rectEdge,
            rectCenter[1] - rectEdge,
            rectCenter[1] + rectEdge, true);
        parameterX = subsetX;
        parameterY = subsetY;
        parameterZ = subsetZ;
    };


    function updateValues() {
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

        // document.getElementById('btn-KDE')
        //     .addEventListener('click', runFullKDE);
        document.getElementById('btn-types')
            .addEventListener('click', runCelltypeAssignments);
        document.getElementById('btn-denovo')
            .addEventListener('click', runDeNovo);
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

        document.getElementById("button-download-signatures")
            .addEventListener("click", downloadSignatures);
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
        document.getElementById('vf-width').value = 1400;
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
