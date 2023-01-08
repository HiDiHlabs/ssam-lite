//Import library
var clustering = require('umap-js');

module.exports = function umapJs(data, spread = 1.0 ,nNeighbors = 30,minDist=0.1,) {

    const umap = new UMAP(spread=spread,nNeighbors=nNeighbors,minDist=minDist);
    const embedding = umap.fit(data);

    return embedding;
}


