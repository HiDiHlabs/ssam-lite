//Import library
var createKDTree = require("static-kdtree")

module.exports = function getKNearestNeighbors(data, query, nNeighbors=20, maxDistance=null) {

    //Create the tree
    var tree = createKDTree(data);
    //Nearest neighbor queries
    nnIndices = query.map(x => tree.knn([x[0],x[1]],k=nNeighbors,maxDistance=maxDistance));

    //For performance, be sure to delete tree when you are done with it
    tree.dispose();

    return nnIndices;
}
