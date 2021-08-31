const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex')

const db = knex({
	client: 'pg',
	connection: {
		host: '127.0.0.1',
		user: 'jbeck',
		password: '',
		database:'facial-reko'
	}
});

const saltRounds = 10;
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send('success');
});

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
		.where('email', '=', req.body.email)
		.then(data => {
			bcrypt.compare(req.body.password, data[0].hash)
				.then(result => {
					if (result) {
						return db.select('*').from('users')
							.where('email', '=', req.body.email)
							.then(user => {
								res.json(user[0])
							})
							.catch(err => res.json('Unable to get user data'));
					} else {
						res.status(400).json('Login Failed')
					}
				})
				.catch(err =>	res.status(400).json('Login Failed'));
		})
		.catch(err => res.json('Wrong Credentials'));
});

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	bcrypt.hash(password, saltRounds, function(err, hash) {
		if (err) {
			console.log(err);
			res.send("An error occured: ", err);
		} else {
			db.transaction(trx => {
				trx.insert({
					hash: hash,
					email: email
				})
				.into('login')
				.returning('*')
				.then(loginEmail => {
					return trx('users')
						.returning('*')
						.insert({
								email: loginEmail[0].email,
								name: name,
								joined: new Date()
						})
						.then(user => {
							res.json(user[[0]]);
						})
				})
				.then(trx.commit)
				.catch(trx.rollback);
			})
			.catch(err => res.status('400').json("Unable to register"));
		}
	});
});

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select().from('users').where({id})
		.then(user => {
			if (user.length) {
				res.json(user[0]);
			} else {
				res.status(400).json('Not Found')
			}
		})
		.catch(err => res.status(400).json('Error getting user profile'));
});

app.put('/image', (req, res) => {
	const { id } = req.body;
	let found = false;
	db('users').where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(entries => res.json(entries[0]))
		.catch(err => res.status(400).json('Could not get entries'));	
});

app.listen(3000, () => {
	console.log("Server running");
});