//Import library
var WCluster = require('w-cluster');


module.exports = function densityClustering(data, nDims = 50) {

return WCluster.PCA(data, { nCompNIPALS: nDims })
}


