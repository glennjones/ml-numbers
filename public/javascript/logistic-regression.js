
    
    // this data from training needs to be load from other files
    let tfMean = tf.tensor(mean);
    let tfVariance = tf.tensor(variance);
    let tfWeights = tf.tensor(weights);


    function predict(observations){
        return processFeatures(observations)
         .matMul(tfWeights)
         .softmax()
         .argMax(1)
 
    }

    function processFeatures(features){
        features = tf.tensor(features);
        features = standardize(features)
        features = tf.ones([features.shape[0], 1]).concat(features, 1);
        return features;
    }

    function standardize(features){
        return features.sub(tfMean).div(tfVariance.pow(0.5));
    }