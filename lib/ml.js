const LogisticRegression = require('./logistic-regression/logistic-regression');
const _ = require('lodash');
const mnist = require('mnist-data');
const tensorStore = require('./tensor-store');


module.exports = {


    regression: null,

    
    load: async function(learningRate = 1, iterations = 40, batchSize = 500) {

        const options = {learningRate, iterations, batchSize};
        const key = `model-${ options.learningRate}-${ options.iterations}-${ options.batchSize}`;
        let weights = await tensorStore.get(key);

        const mnistData = mnist.training(0,60000);
        const features = mnistData.images.values.map(image => _.flatMap(image))

        const encodedLabels = mnistData.labels.values.map(label => {
            const row = new Array(10).fill(0);
            row[label] = 1;
            return row;
        });

       this.regression = new LogisticRegression(features, encodedLabels, options);

        if(!weights){
            this.regression.train()
            await tensorStore.set(key, this.regression.weights);
        }else{
            // turn js array into a tensor
            this.regression.weights = weights
        }

        return weights

    },


    predict: async function(pixelData) {

        if(this.regression === null){
            await this.load();
        }

        const predictFeatures = pixelData.map(image => _.flatMap(image));  
        return this.regression.predict(predictFeatures).arraySync()
    },


    getMnistTrainingItems: function(start,end) {
        return this.cleanDataObj(mnist.training(start,end));
    },


    getMnistTestItems: function(start,end) {
        return this.cleanDataObj(mnist.testing(start,end));
    },


    cleanDataObj: function ( items ){
        delete items.images.magic_number;
        delete items.images.total_num_items;
        delete items.images.rows;
        delete items.images.cols;
        delete items.labels.magic_number;
        delete items.labels.total_num_items;
        return items
    }

}
