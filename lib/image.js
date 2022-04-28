const Jimp = require('jimp');
const Sharp = require('sharp');
const ml = require('./ml');


module.exports = {

    reverseNumber: function( num,  min, max) {
        return (max + min) - num;
    },

    get: async function( number, invert = false ){

        const self = this;
        const item = await ml.getMnistTestItems(number-1, number);
        const pixelData = item.images.values[0];

        // use jimp to do pixel level changes
        const image = await new Jimp(28, 28, 'white');
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            let pixelValue = pixelData[y][x]
            if(invert === true) {
                pixelValue = self.reverseNumber(pixelValue, 0, 255);
            }
            this.bitmap.data[idx + 0] = pixelValue 
            this.bitmap.data[idx + 1] = pixelValue 
            this.bitmap.data[idx + 2] = pixelValue 
        });
   
        // use sharp for data formating to create output buffer
        const { data, width, height } = image.bitmap;
        return Sharp(data, { raw: { width, height, channels: 4 }})
            .png()
            .greyscale()
            .toBuffer()
        
  
    }


}