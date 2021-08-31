const handleSignIn = (db, bcrypt) => (req, res) => {
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
}

module.exports = {
	handleSignIn: handleSignIn
}