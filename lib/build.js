const LogisticRegression = require('./logistic-regression/logistic-regression');
const _ = require('lodash');
const mnist = require('mnist-data');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');


// runs training and build client dist files - weights.js, mean.js and variance.js
async function build(learningRate = 1, iterations = 40, batchSize = 500) {

    const options = { learningRate, iterations, batchSize };
    const mnistData = mnist.training(0, 60000);
    const features = mnistData.images.values.map(image => _.flatMap(image))

    const encodedLabels = mnistData.labels.values.map(label => {
        const row = new Array(10).fill(0);
        row[label] = 1;
        return row;
    });

    const regression = new LogisticRegression(features, encodedLabels, options);
    regression.train();

    const weightsFilePath = path.resolve(__dirname, '../public/dist/weights.js');
    const meanFilePath = path.resolve(__dirname, '../public/dist/mean.js');
    const varianceFilePath = path.resolve(__dirname, '../public/dist/variance.js');

    await createFile(weightsFilePath, 'weights', regression.weights);
    await createFile(meanFilePath, 'mean', regression.mean);
    await createFile(varianceFilePath, 'variance', regression.variance);

}


// write dist files for client side use
async function createFile(filePath, name, tensor) {
    console.log(filePath)
    const tensorAsArray = tensor.arraySync();
    await writeFile(filePath, `const ${name} = ${JSON.stringify(tensorAsArray)};`, { encoding: 'utf-8' });
}


async function createGitHubPages() {

    const readFilePath = path.resolve(__dirname, '../public/index.html');
    const writeFilePath = path.resolve(__dirname, '../index.html');
    let data = await readFile(readFilePath, { encoding: 'utf-8' });
    let html = data.toString();

    // repath files
    html = html.replace(/.\/css\//g,'./public/css/');
    html = html.replace(/.\/javascript\//g,'./public/javascript/');
    html = html.replace(/.\/images\//g,'./public/images/');
    html = html.replace(/.\/dist\/weights.js/g,'./public/dist/weights.js');
    html = html.replace(/.\/dist\/mean.js/g,'./public/dist/mean.js');
    html = html.replace(/.\/dist\/variance.js/g,'./public/dist/variance.js');

    await writeFile(writeFilePath, html, { encoding: 'utf-8' });

}



build();
createGitHubPages();


