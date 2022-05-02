const Joi = require('joi');
const ml = require('./ml');
const image = require('./image');

module.exports = [

	{
		method: 'GET',
		path: '/',
		options: {
			description: 'Nunjucks templated homepage.',
		},
		handler: (request, h) => {
			return h.view('index', {
				title: 'Number Recognition',
				message: 'Hello World! How about the <a href="/about">about</a> page',
			});
		},
	},
	{
		method: ['GET', 'POST'],
		path: '/server',
		handler: async (request, h) => {

			const out = { title: 'Number Recognition' };
			if (request.query['test-number']) {
				out.testNumber = parseInt(request.query['test-number'])

				const item = ml.getMnistTestItems(out.testNumber - 1, out.testNumber);
				const predictions = await ml.predict(item.images.values);
				out.prediction = predictions[0];
				out.label = item.labels.values[0];

			};
			return h.view('form', out);
		},
	},
	
	{
		method: 'GET',
		path: '/v1/tests/{number}/image',
		config: {
			handler: async (request, h) => {

				try {
					const data = await image.get(parseInt(request.params.number), request.query.invert);

					return h.response(data).type('image/png');
				} catch (err) {
					return h.response(err.message).code(500);
				}
			},
			tags: ['api'],
			validate: {
				params: {
					number: Joi.string()
				},
				query: {
					invert: Joi.bool()
				}
			}

		}
	},
	{
		method: 'GET',
		path: '/v1/tests/{start}/{end}',
		config: {
			handler: async (request, h) => {
				try {

					const item = ml.getMnistTestItems(request.params.start, request.params.end);


					return h.response(item);
				} catch (err) {
					return h.response(err.message).code(500);
				}
			},
			description: 'Get',
			tags: ['api'],
			notes: ['Get previously trained model weights'],
			validate: {
				params: {
					start: Joi.number().min(0).max(19999),
					end: Joi.number().min(1).max(20000).greater(Joi.ref('start')),
				}
			}
		}
	},
	{
		method: 'POST',
		path: '/v1/predict',
		config: {
			handler: async (request, h) => {
				try {
					return ml.predict(request.payload.observation);

					//return h.response(predictions);
				} catch (err) {
					return h.response(err.message).code(500);
				}
			},
			description: 'Predict',
			tags: ['api'],
			notes: ['Predict the value of a handwritten single digit number'],
			validate: {
				payload: {
					observation: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number().max(255).min(0)).max(28).min(28)).max(28).min(28))
						.required()
						.description('Array of array containing a grid pixel values. The grid should be 28x28 items each having a value between 0-255'),
				}
			}

		}
	},
	{
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: {
				path: '.',
				listing: false,
				index: true
			}
		}
	}
];



/*
// adds the routes and validation for api
let routes = [{
		method: 'GET',
		path: '/',
		config: {
			handler: handlers.index
		}
	},{
	method: 'PUT',
	path: '/v1/sum/add/{a}/{b}',
	config: {
		handler: function(request, reply) {
			const equals = request.params.a + request.params.b
			reply({'equals': equals})
		},
		description: 'Add',
		tags: ['api'],
		notes: ['Adds together two numbers and return the result. As an option you can have the result return as a binary number.'],
		validate: {
			params: {
				a: Joi.number()
					.required()
					.description('the first number'),

				b: Joi.number()
					.required()
					.description('the second number')
			}
		}

	}
}, {
		method: 'GET',
		path: '/{path*}',
		handler: {
			directory: {
				path: './public',
				listing: false,
				index: true
			}
		}
	}];

	

exports.routes = routes;


*/