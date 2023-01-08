//Import library
var kmeans = require('node-kmeans');

module.exports = function kMeans(data, k = 50) {

    return kmeans.clusterize(data.arraySync(), { k: k }, (err, res) => {
        if (err) console.error(err);
        else console.log('%o', res);
    });

}
