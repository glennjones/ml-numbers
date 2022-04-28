require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs');
const { readFile, writeFile } = require('fs/promises');
const path = require('path');

// a simple memory/file storage for tensorflow tensor objects

module.exports = {

    memory: {},

    buildFilePath: function( key ){
        return path.resolve(__dirname, `../models/${key}.json` );
    },

    set: async function(key, tensor) {

        const filePath = this.buildFilePath( key );
        const tensorAsArray = tensor.arraySync()
        this.memory[key] = tensorAsArray;
        await writeFile(filePath, JSON.stringify(tensorAsArray), {encoding: 'utf-8'});

    },

    get: async function(key) {

        const filePath = this.buildFilePath( key );
        let tensor;
        let tensorAsArray = this.memory[key];

        if(tensorAsArray === undefined){
            try{
                const fileData = await readFile(filePath, {encoding: 'utf-8'});
                if(fileData){
                    tensorAsArray = JSON.parse(fileData);
                }
            }catch {}
        }

        if(tensorAsArray !== undefined){
            tensor = tf.tensor(tensorAsArray);
        }

        return tensor
    },

}