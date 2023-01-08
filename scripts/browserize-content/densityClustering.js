//Import library
var clustering = require('density-clustering');

module.exports = function densityClustering(data, method = 'DBSCAN', dbRadius = 5, dbN = 2, nClusters = 50) {

    if (method == 'DBSCAN') {
        var dbscan = new clustering.DBSCAN();
        // parameters: 5 - neighborhood radius, 2 - number of points in neighborhood to form a cluster
        var clusters = dbscan.run(data, dbRadius, dbN);

        console.log(clusters, dbscan.noise);
    }

    if (method == 'kMeans') {
        var kMeans = new clustering.KMEANS();

        var clusters = kMeans.run(data,nClusters);


    }
    return clusters;
}


