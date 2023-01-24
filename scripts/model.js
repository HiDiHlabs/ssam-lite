// const umapJs = require("./browserize-content/umapJs");

function runKDE(X, Y, Zgenes, genes, xmax = null, ymax = null, sigma = 1, height = null, width = null, nStds = 2) {

    if (ymax == null) { ymax = Math.max(...Y); }
    if (xmax == null) { xmax = Math.max(...X); }
    if (height == null) { height = Math.ceil(xmax - Math.min(...X)); }
    if (width == null) { width = Math.ceil(ymax - Math.min(...Y)); }

    //  console.log(X);
    var vfBuffer = tf.buffer([height, width, genes.length], dtype = 'float32');

    var x = 0;
    var y = 0;
    var z = 0;
    var val = 0;
    var counter = 0;
    var n_steps = Math.ceil(sigma * nStds);


    //  console.log(sigma, n_steps);

    var normalization = 1 / (1 * Math.PI * sigma ** 2) ** 0.5

    for (var i = 0; i < X.length; i++) {

        x = Math.round(X[i] * (height - 1) / xmax);
        y = Math.round(Y[i] * (width - 1) / ymax);

        if (Zgenes == null) {
            z = 0;
        }
        else {
            z = genes.indexOf(Zgenes[i]);
        }

        if (z >= 0) {

            for (var m = -n_steps; m <= n_steps; m++) {

                for (var n = -n_steps; n <= n_steps; n++) {

                    if (((x + m) > 0) && ((y + n) > 0) && ((x + m) < height - 1) && ((y + n) < width - 1)) {
                        val = Math.exp(-(Math.pow(n, 2) + Math.pow(m, 2)) / Math.pow(sigma, 2)) * normalization;
                        vfBuffer.set(vfBuffer.get(x + m, y + n, z) + val, x + m, y + n, z);

                    }
                }
            }


            counter++;

        }


    }

    try {
        vf = vfBuffer.toTensor();
    }
    catch {
        throw ("Exceeded");
    }

    vfNorm = vf.sum(2);

    return [vf, vfNorm];

};

function argsort(arr){

    return ([...Array(arr.length).keys()]).map(x=>[arr[x],x]).sort((a,b)=>(a[0]-b[0])).map(x=>x[1]) 
}

function unique(arr) {
    let uniques = [];
    let counts = [];
    let indices = [];

    for (let i = 0; i < arr.length; i++) {

        if (!(uniques.includes(arr[i]))) {
            uniques.push(arr[i]);
            counts.push(0);
            // console.log(uniques);
        }

        counts[uniques.indexOf(arr[i])] += 1;
        indices.push(counts.indexOf[arr[i]]);
        // console.log(counts);

        

    }

    let sortIdcs = argsort(counts);
    counts = ([...Array(counts.length).keys()]).map(x=>counts[sortIdcs[x]])
    uniques = ([...Array(counts.length).keys()]).map(x=>uniques[sortIdcs[x]])
    indices = ([...Array(counts.length).keys()]).map(x=>sortIdcs[x])

    // console.log(sortIdcs,counts,uniques,indices,arr);

    return [counts, uniques,indices]
}


    
function applyLinearRotation(input, theta) {

    let x = theta[0];
    let y = theta[1];
    let z = theta[2];

    let translationMatrix = tf.tensor([
        [1, 0, 0],
        [0, Math.cos(x), -Math.sin(x)],
        [0, Math.sin(x), Math.cos(x)]
    ]);

    translationMatrix = translationMatrix.matMul(tf.tensor([
        [Math.cos(y), 0, Math.sin(y)],
        [0, 1, 0],
        [-Math.sin(y), 0, Math.cos(y)]
    ]));

    translationMatrix = translationMatrix.matMul(tf.tensor([
        [Math.cos(z), -Math.sin(z), 0],
        [Math.sin(z), Math.cos(z), 0],
        [0, 0, 1]
    ]));

    return input.matMul(translationMatrix);
}

function scaleTo01(input, axis=0) {

    let min = input.min(axis).arraySync();
    let max = input.max(axis).arraySync();

    let output = input.sub(min, axis).div(max-min, axis);
    return output;
}

function getAllIndexes(arr, val) {
    var indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}

// remove coordinates outside box for preview 
function spatialSubset(X, Y, ZGenes, x_, _x, y_, _y, reCenter = true) {
    let subsetX = []
    let subsetY = []
    let subsetZ = []

    let centraSubtractorX = reCenter ? (x_) : 0;
    let centraSubtractorY = reCenter ? (y_) : 0;

    //  console.log(subsetX);

    for (var i = 0; i < X.length; i++) {
        if (X[i] > (x_) &&
            Y[i] > (y_) &&
            X[i] < (_x) &&
            Y[i] < (_y)) {
            subsetX.push(X[i] - centraSubtractorX);
            subsetY.push(Y[i] - centraSubtractorY);
            subsetZ.push(ZGenes[i]);
        }
    }

    //  console.log(X,subsetX,x_,_x,y_,_y);

    return [subsetX, subsetY, subsetZ];
};


function assignCelltypes(vf, vfNorm, signatureMatrix, threshold) {
    celltypeMap = tf.tidy(() => {

        intermediates = [];
        var inter;
        var signaturesMoments = tf.moments(signatureMatrix, axis = 1);
        var signaturesMean = signaturesMoments.mean;
        var signaturesStd = signaturesMoments.variance.pow(0.5);
        var signaturesCentered = signatureMatrix.sub(signaturesMean.expandDims(1))

        var interMoments;
        var interMean;
        var interStd;
        var correlations;

        for (var i = 0; i < vf.shape[0]; i++) {

            inter = vf.gather(i);
            interMoments = tf.moments(inter, axis = 1);
            interMean = interMoments.mean;
            interStd = interMoments.variance.pow(0.5)
            interCentered = inter.sub(interMean.expandDims(1))  // 0 mean
            correlations = signaturesCentered.mul(interCentered.expandDims(1)).mean(2).div(interStd.expandDims(1)).div(signaturesStd.expandDims(0));
            intermediates.push(correlations.argMax(1).expandDims(0));
        }

        intermediates = tf.concat(intermediates);
        var inters = intermediates.mul(vfNorm.greater(threshold));

        return inters.sub(vfNorm.less(threshold));

    });


    return celltypeMap;
};

// function assignCelltypes(vf, vfNorm, signatureMatrix, threshold) {
//     celltypeMap = tf.tidy(() => {

//         intermediates = [];
//         var inter;

//         for (var i = 0; i < vf.shape[0]; i++) {

//             inter = vf.gather(i);
//             inter = inter.add(1).log();
//             inter = inter.transpose().div(inter.sum(1)).transpose();
//             inter = inter.matMul(signatureMatrix.transpose());
//             intermediates.push(inter.argMax(1).expandDims(0));
//         }

//         intermediates = tf.concat(intermediates);
//         var inters = intermediates.mul(vfNorm.greater(threshold));

//         return inters.sub(vfNorm.less(threshold));

//     });

//     return celltypeMap;
// };



async function runLocalMaxFilter(vfNorm, height, width, radius = 3, localmaxThreshold = 10) {

    var buffer = await vfNorm.buffer();


    var localmaxX = Array();
    var localmaxY = Array();

    var filterX = Array();
    var filterY = Array();

    for (var x = -radius; x <= radius; x++) {
        for (var y = -radius; y <= radius; y++) {
            if (Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5) <= radius) {
                filterX.push(x);
                filterY.push(y);
            };
        }
    }

    let isMax;


    for (var x = 0; x < width; x++) {

        for (var y = 0; y < height; y++) {
            var centralValue = buffer.get(x, y);
            if (centralValue > localmaxThreshold) {
                isMax = true;
                for (var i = 0; i < filterX.length; i++) {

                    if (((x + filterX[i]) >= 0) & ((y + filterY[i]) >= 0) & ((x + filterX[i]) < width) & ((y + filterY[i]) < height)) {
                        currentValue = buffer.get((x + filterX[i]), (y + filterY[i]))
                        if ((centralValue < currentValue)) {

                            isMax = false;

                            break;
                        };
                    }
                    // else {
                    //     isMax = false;
                    //     break;
                    // }
                }
                if (isMax) {
                    //  console.log('Found max at', x, y, ":)", "norm is ", centralValue)
                    localmaxX.push(x);
                    localmaxY.push(y);
                }
            }
        }
    }

    return [localmaxX, localmaxY]

};

function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
}

function determineLocalExpression(queryX, queryY, X, Y, ZGenes, genes, sigma) {

    //  console.log("kewl", transpose([X, Y]), transpose([queryX, queryY]));
    knns = getKNearestNeighbors(transpose([X, Y]), transpose([queryX, queryY]), 50);

    let expressionSamples = tf.buffer([knns.length, genes.length], dtype = 'float32');
    // console.log("nLocalMaxs: ", queryX.length);
    let normalization = 1 / (1 * Math.PI * sigma ** 2) ** 0.5;
    let k, dist, signal, g;

    for (let i = 0; i < knns.length; i++) {

        x = queryX[i];
        y = queryY[i];

        for (let j = 0; j < knns[0].length; j++) {
            k = knns[i][j];
            g = genes.indexOf(ZGenes[k]);

            dist = Math.pow(Math.pow(X[k] - x, 2) + Math.pow(Y[k] - y, 2), 0.5);
            signal = Math.exp(-(dist / Math.pow(sigma, 2))) * normalization;
            //  console.log(dist,signal);

            expressionSamples.set(expressionSamples.get(i, g) + signal, i, g);
        }
    }

    try {
        expressionSamples = expressionSamples.toTensor();
    }
    catch {
        throw ("Exceeded");
    }
    return [knns, expressionSamples];
};

async function determineWeightedExpression(queryX, queryY, X, Y, localmaxExpressions, sigmaWE) {

    localmaxExpressions = await localmaxExpressions.buffer();
    //  console.log("kewl", transpose([X, Y]), transpose([queryX, queryY]));
    knns = getKNearestNeighbors(transpose([X, Y]), transpose([queryX, queryY]), 10);

    let expressionSamples = tf.buffer([knns.length, localmaxExpressions.shape[1]], dtype = 'float32');
    console.log("nLocalMaxs: ", localmaxExpressions);
    let normalization = 1 / (1 * Math.PI * sigmaWE ** 2) ** 0.5;
    let k, dist, signal, w;


    for (let i = 0; i < knns.length; i++) {

        x = queryX[i];
        y = queryY[i];
        w = 0;

        for (let j = 0; j < knns[0].length; j++) {
            k = knns[i][j];
            // g = genes.indexOf(ZGenes[k]);

            dist = Math.pow(Math.pow(X[k] - x, 2) + Math.pow(Y[k] - y, 2), 0.5);
            signal = Math.exp(-(dist / Math.pow(sigmaWE, 2)));
            //  console.log(dist,signal);

            w += signal;

            for (let g = 0; g < localmaxExpressions.shape[1]; g++) {
                expressionSamples.set(expressionSamples.get(i, g) + localmaxExpressions.get(k, g) * signal, i, g);
            }


        }

        for (let g = 0; g < localmaxExpressions.shape[1]; g++) {
            expressionSamples.set(expressionSamples.get(i, g) / w, i, g);
        }

    }

    try {
        expressionSamples = expressionSamples.toTensor();
    }
    catch {
        throw ("Exceeded");
    }
    return [knns, expressionSamples];
};

function std(tensor, axis = null) {
    return tf.moments(tensor, axis).variance.sqrt()
}

async function runPCA(data, nComponents = 40) {

    let mask = await tf.greater(std(data, axis = 1), 0);

    let cleanedData = await tf.booleanMaskAsync(data, mask, axis = 0)

    // return(cleanedData)
    let facs = await PCA(cleanedData.transpose().arraySync(), nComponents)

    facs = tf.tensor(facs)

    return facs.transpose()
}

async function runKMeans(data, nClusters = 30) {

    // let data_ = (data.slice(data.shape[0]-100));

    let kMeansOut = await kMeans(data, k = nClusters);

    //  console.log("kMeansOut:", kMeansOut);

    let signatures = tf.tensor(kMeansOut.groups.map(x => x.centroid))


    return [signatures, kMeansOut]
}

async function runDBSCAN(data, eps = 0.5, minSamples = 10) {

    let dbscanOut = new OPTICS();// DBSCAN()#.eps(eps).minSamples(minSamples).run(data.arraySync());

    let clusterLabels = await dbscanOut.run(data, eps, minSamples);

    console.log(data, clusterLabels);

    let centroids = [];
    for (let i = 0; i < clusterLabels.length; i++) {
        centroids.push(tf.mean(clusterLabels[i].map(x=>data[x]), axis = 0))
    }

    for (let i = 0; i < dbscanOut.length; i++) {
        centroids[i] = await centroids[i].arraySync();
    }

    centroids = tf.stack(centroids);

    return [clusterLabels, centroids, dbscanOut]
}

function runUMAP(data, nComponents = 2, spread = 1.0, nNeighbors = 30, minDist = 0.1, initData = false) {
    coordinates = umapJs(data, nComponents = nComponents, initData = initData);
    return coordinates;
}

function calculateStats(celltypeMap, nClasses) {


    celltypeCounts = tf.tidy(() => {

        // var intMat = tf.zerosLike(celltypeMap);
        intermediates = [];
        var inter;
        for (var i = 0; i < nClasses + 1; i++) {
            inter = celltypeMap.equal(tf.scalar(i, dtype = 'int32')).sum();
            intermediates.push(inter.arraySync());
            // intMat = intMat.add(tf.scalar(1, dtype='int32'));
        }

        var sum = intermediates.reduce((a, b) => a + b, 0);

        return intermediates.map(x => x / sum);


    });


    return celltypeCounts;
};