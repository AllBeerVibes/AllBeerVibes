require('dotenv').config();
const express = require('express');
const http = require('http');

const router = express.Router();
router.use(express.static('public'));

/*
@route    GET /
@desc     home page
@access   public
*/
router.get('/', (req, res) => {
	res.render('index');
});

/*
@route    GET /register
@desc     register user
@access   public
*/
router.get('/register', (req, res) => {
	let errors = [];
	res.render('register', { errors });
});

/*
@route    POST /register
@desc     register user
@access   public
*/
router.post('/register', (req, res) => {
	const { name, email, password, password2 } = req.body;
	const data = JSON.stringify({ name, email, password, password2 });
	const options = {
		hostname : 'localhost',
		port     : 80,
		path     : '/api/users',
		method   : 'POST',
		headers  : {
			'Content-Type' : 'application/json'
		}
	};
	const request = http.request(options, (response) => {
		const errors = [];
		response.on('data', (chunk) => {
			const json = JSON.parse(chunk);
			if (json.errors != undefined) {
				errors.push(json.errors[0].msg);
				res.render('register', { errors });
			}
			console.log(json.token);
		});
	});
	request.write(data);
	request.end();
});

module.exports = router;
