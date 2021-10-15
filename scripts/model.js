function runKDE(X, Y, Zgenes, genes, xmax, ymax, sigma, height, width, nStds=2) {   

    console.log([height, width, genes.length]);
    var vfBuffer = tf.buffer([height, width, genes.length], dtype='float32');

    var x = 0;
    var y = 0;
    var z = 0;
    var val = 0;
    var counter = 0;
    var n_steps = Math.ceil(sigma*nStds);

    console.log(sigma,n_steps);

    var normalization = 1/(1*Math.PI*sigma**2)**0.5

    for (var i = 0; i < Zgenes.length; i++) {

        x = Math.round(X[i] * (height - 1) / xmax);
        y = Math.round(Y[i] * (width - 1) / ymax);

        z = genes.indexOf(Zgenes[i]);

        if (z >= 0) {

            for (var m = -n_steps; m <= n_steps; m++) {

                for (var n = -n_steps; n <= n_steps; n++) {

                    if (((x + m) > 0) && ((y + n) > 0) && ((x + m) < height - 1) && ((y + n) < width - 1)) {
                        val = Math.exp(-(Math.pow(n, 2) + Math.pow(m, 2)) / Math.pow(sigma, 2))*normalization;
                        vfBuffer.set(vfBuffer.get(x + m, y + n, z) + val, x + m, y + n, z);

                    }
                }
            }


            counter++;

        }

        // else {
        //     // console.log(Zgenes[i], i, z);
        // }


    }

    try{
        vf = vfBuffer.toTensor();
    }
    catch{
        throw ("Exceeded");
    }
   
    vfNorm = vf.sum(2);

    return [vf, vfNorm];

};

function assignCelltypes(vf, vfNorm, signatureMatrix, threshold) {
    celltypeMap = tf.tidy(() => {

        intermediates = [];
        var inter;

        for (var i = 0; i < vf.shape[0]; i++) {

            inter = vf.gather(i);
            inter = inter.add(1).log();
            inter = inter.transpose().div(inter.sum(1)).transpose();
            inter = inter.matMul(signatureMatrix.transpose());
            intermediates.push(inter.argMax(1).expandDims(0));
        }

        intermediates = tf.concat(intermediates);
        var inters = intermediates.mul(vfNorm.greater(threshold));

        return inters.sub(vfNorm.less(threshold));

    });
    return celltypeMap;
};