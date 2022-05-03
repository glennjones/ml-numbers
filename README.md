# ml-numbers

A demo that uses Tensorflow.js to recognize handwritten numbers in the browser with just javascript. You draw the number a on the html canvas the rest is magic (if it works)!

Try the demo https://glennjones.github.io/ml-numbers/

![Demo interface](public/images/i-think.png)



## Installation

This node.js project can be installed locally by clone it.

```bash
> git clone https://
> npm i
> npm start
```


## About

I built this demo as a fun way to learn the basics of Machine Learning coding. The first steps 
to writing the Machine Learning code myself rather than asking others to do it for me. The demo 
is written in JavaScript and runs in the browser. It uses 
<a href="https://en.wikipedia.org/wiki/Logistic_regression">Logistic Regression</a></Logistic>, 
an adapted version of the code from udemy.com 
<a href="https://www.udemy.com/course/machine-learning-with-javascript/">Machine Learning 
with Javascript</a> course. The model was trained with the mnist dataset using 
<a href="https://www.tensorflow.org/js">Tensorflow.js</a>. 

When tested against the <a href="https://en.wikipedia.org/wiki/MNIST_database">mnist 
dataset</a> it has an error rate of 7.48%. The html canvas drawing surface does not provide images with 
the same characteristics as hand drawn digits on paper, so the browser demo's error rate is 
a lot higher. The lesson I learned here, is that inputs for training have to the be exactly the same 
as your observations for predictions. That the complexity is sometimes more in the preprocessing 
and standardisation of data.
  

## Rebuild dist directory and Github pages file

```bash
> npm run build
```
It will take a few seconds as it run the training before exporting the data.