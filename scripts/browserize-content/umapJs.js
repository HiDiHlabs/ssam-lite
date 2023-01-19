//Import library
var clustering = require('umap-js');

module.exports = function umapJs(data, nComponents = 2, spread = 1.0, nNeighbors = 30, minDist = 0.1, initData=null) {

    const umap = new UMAP(nComponents = nComponents, spread = spread, nNeighbors = nNeighbors, minDist = minDist);
    // if (initData){
    //     umap.initializeFit(initData);
    // }
    const embedding = umap.fit(data);

    return [embedding,umap];
}




