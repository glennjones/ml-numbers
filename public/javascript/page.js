/* eslint-disable no-undef */

function init() {

	/* Config */

	const canvasSize = 280;
	const trimmedImageSize = 190;
	const mnistImageSize = 28;
	const penMinWidth = 16;
	const penMaxWidth = 20;
	const penColor = 'rgb(0,0,0)';
	const penbBackgroundColor = 'rgb(255, 255, 255)';
	const blurAmount = 3;
	const msWaitForWritting = 1500;
	const debug = false;


	/* Globals */

	let storeDigit = [];
	let correctPredictions = 0;
	let wrongPredictions = 0;
	let timeoutID;


	/* DOM */

	var canvasElt = document.querySelector('#drawing-area');
	var resultElt = document.querySelector('#result');
	var buttonsElt = document.querySelector('#buttons');
	var totalsElt = document.querySelector('#totals');

	// setup drawing surface using SignaturePad
	var signaturePad = new SignaturePadReplay(canvasElt, {
		minWidth: penMinWidth,
		maxWidth: penMaxWidth,
		penColor: penColor,
		backgroundColor: penbBackgroundColor
	});


	signaturePad.addEventListener("endStroke", () => {
		storeDigit = signaturePad.toData();

		timeoutID = setTimeout(() => {
			getPrediction()
				.then(function (prediction) {
					resultElt.innerHTML = `I think its a: ${prediction}`;
					buttonsElt.style.display = 'block';
					if (debug === true) {
						console.log(JSON.stringify(storeDigit));
					}
				})
		}, msWaitForWritting)
	});

	
	signaturePad.addEventListener("beginStroke", () => {
		resultElt.innerHTML = `I am thinking`;

		if (timeoutID) {
			clearTimeout(timeoutID);
		}
	});


	var correctButton = document.querySelector('#correct-botton');
	correctButton.addEventListener("click", function () {
		signaturePad.clear();
		resultElt.innerHTML = 'Have another go...';
		totalsElt.innerHTML = updatePerformanceText(true);

	});

	var wrongButton = document.querySelector('#wrong-botton');
	wrongButton.addEventListener("click", function () {
		signaturePad.clear();
		resultElt.innerHTML = 'Have another go...';
		totalsElt.innerHTML = updatePerformanceText(false);

	});

	var clearButton = document.querySelector('#eraser-botton');
	clearButton.addEventListener("click", function () {
		signaturePad.clear();
		resultElt.innerHTML = 'Have another go...';

	});



	async function animateDigit(replayData) {
		await signaturePad.clear();
		await signaturePad.replay(replayData, signaturePad);
		await sleep(2000);
		resultElt.innerHTML = 'Have go, draw a number';
		await signaturePad.clear();
		signaturePad.penColor = penColor;
	}


	async function animate() {
		for (let i = 0; i < 1; i++) {
			const replayData = digits[getRandomInt(9)];
			await animateDigit(replayData);
		}
		signaturePad.penColor = penColor;

	}


	/* utilities */


	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}


	function percentage(partialValue, totalValue) {
		return (100 * partialValue) / totalValue;
	}


	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}


	// scales a width and height numbers while keeping aspect ratio
	function scaleByAspectRatio(width, height, maxWidth, maxHeight) {
		const ratio = Math.min(maxWidth / width, maxHeight / height);
		return { width: Math.floor(width * ratio), height: Math.floor(height * ratio) };
	}


	// return a the average from the RBG channels to create a grayscale value
	function getRGBAverage(imageData, pos) {
		return Math.round((imageData[pos] + imageData[pos + 1] + imageData[pos + 2]) / 3);
	}


	// find the edges of a grayscale image using a given the backgound value
	function findEdges(imageData, width, height, background) {
		let left = -1;
		let right = -1;
		let top = -1;
		let bottom = -1;


		for (let x = 0; x < width; x++) {//left edge
			if (left >= 0) {
				break;
			}
			for (let y = 0; y < height; y++) {
				if (getRGBAverage(imageData, (y * width + x) * 4) !== background) {
					left = x;
					break;
				}
			}
		}
		for (let x = width - 1; x >= left; x--) {//right edge
			if (right >= 0) {
				break;
			}
			for (let y = 0; y < height; y++) {
				if (getRGBAverage(imageData, (y * width + x) * 4) !== background) {
					right = x;
					break;
				}
			}
		}
		for (let y = 0; y < height; y++) {//top edge
			if (top >= 0) {
				break;
			}
			for (let x = left; x <= right; x++) {
				if (getRGBAverage(imageData, (y * width + x) * 4) !== background) {
					top = y;
					break;
				}
			}
		}
		for (let y = height - 1; y >= top; y--) {//bottom edge
			if (bottom >= 0) {
				break;
			}
			for (let x = left; x <= right; x++) {
				if (getRGBAverage(imageData, (y * width + x) * 4) !== background) {
					bottom = y;
					break;
				}
			}
		}
		right++;
		bottom++;

		width = right - left;
		height = bottom - top;

		return { left, top, right, bottom, width, height }
	}


	// create a virtual canvas
	async function createHeadlessCanvasCtx(width, height) {
		const canvas = document.createElement('canvas');
		if (debug === true) {
			document.body.appendChild(canvas);
		}
		canvas.width = width
		canvas.height = height
		return canvas.getContext('2d');
	}


	// resize canvas image data, using DOM image and canvas elements
	async function resizeImageData(imageData, resizeWidth, resizeHeight) {

		const virtualBitamp = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
			resizeWidth, resizeHeight
		})
		const ctx = await createHeadlessCanvasCtx(resizeWidth, resizeHeight)
		ctx.drawImage(virtualBitamp, 0, 0);
		const resizedImageData = ctx.getImageData(0, 0, resizeWidth, resizeHeight)
		return resizedImageData;
	}


	// reverse a number within a given range - used to invert pixel data
	function reverseNumber(num, min, max) {
		return (max + min) - num;
	}


	// take the single row Uint8ClampedArray created by DOM image data and creates a 2d matrix of grayscale values
	function matrixFromImage(imageData, width) {
		let out = [];
		const data = imageData.data;
		for (var i = 0; i < data.length; i += 4) {
			// average out RGB and invert image
			let average = Math.round((data[i + 0] + data[i + 1] + data[i + 2]) / 3);
			let value = reverseNumber(average, 0, 255);
			if (value === 2) {
				out.push(0);
			} else {
				out.push(value)
			}
		}

		let matrix = []
		while (out.length > 0) {

			let row = out.splice(0, width)
			matrix.push(row)
		}


		return matrix
	}



	/* processing pipeline */


	// collects data from canvas, preprocesses it and returns results from prediction function
	async function getPrediction() {

		const el = document.getElementById('drawing-area');
		const ctx = el.getContext('2d');
		const imageData = ctx.getImageData(0, 0, el.width, el.height);

		// create headless canvas to process image in
		const headlessCtx = await createHeadlessCanvasCtx(el.width, el.height)
		const virtualBitamp = await window.createImageBitmap(imageData, 0, 0, el.width, el.height)
		headlessCtx.drawImage(virtualBitamp, 0, 0);

		// find edges of number, and calulate the sizes for trimming and scaling in ratio
		const headlessImageData = headlessCtx.getImageData(0, 0, el.width, el.height);
		const edgeDate = findEdges(headlessImageData.data, el.width, el.height, 255);
		const clippedImage = headlessCtx.getImageData(edgeDate.left, edgeDate.top, edgeDate.width, edgeDate.height);
		const scaledData = scaleByAspectRatio(edgeDate.width, edgeDate.height, trimmedImageSize, trimmedImageSize);


		// rescale for centring
		const resized = await resizeImageData(clippedImage, scaledData.width, scaledData.height);


		// add the rescaled image back in the center of the canvas
		let centeredX = Math.round((canvasSize - resized.width) / 2);
		let centeredY = Math.round((canvasSize - resized.height) / 2);
		headlessCtx.fillStyle = "white";
		headlessCtx.fillRect(0, 0, canvasSize, canvasSize);
		headlessCtx.putImageData(resized, centeredX, centeredY, 0, 0, resized.width, resized.height);
		const updated = headlessCtx.getImageData(0, 0, el.width, el.height);
		module.exports(updated.data, canvasSize, canvasSize, blurAmount);
		headlessCtx.putImageData(updated, 0, 0);

		// resize the image to 28x28 the size used in nmist
		const resizedData = await resizeImageData(updated, mnistImageSize, mnistImageSize);


		// create a grayscale matrix for us with our tensorflow prediction function and debug
		const matrix = matrixFromImage(resizedData, mnistImageSize);

		if (debug === true) {
			visualDebug(headlessCtx, centeredX, centeredY, resized.width, resized.height);
			console.log(JSON.stringify(matrix))
		}

		const predictFeatures = [matrix].map(image => _.flatMap(image));
		return predict(predictFeatures).arraySync();


	}

	function updatePerformanceText(correct) {
		if (correct === true) {
			correctPredictions++;
		} else {
			wrongPredictions++;
		}
		const count = correctPredictions + wrongPredictions;
		const percent = percentage(wrongPredictions, count)


		return `${correctPredictions} out of ${count} predictions correct. <br>Thats an error rate of ${percent.toFixed(1)}%`
	}



	/* debug */

	// drawa out center lines and resized image containing box
	function visualDebug(ctx, centeredX, centeredY, width, height) {

		ctx.lineWidth = 1;
		// centerded
		ctx.strokeStyle = 'red';
		ctx.strokeRect(centeredX, centeredY, width, height);

		ctx.beginPath();
		ctx.moveTo(140, 0);
		ctx.lineTo(140, canvasSize);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, 140);
		ctx.lineTo(canvasSize, 140);
		ctx.stroke();

	}


	animate();

};
window.addEventListener('load', init, false);