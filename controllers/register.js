const saltRounds = 10;

const handleRegister = (db, bcrypt) => (req, res) => {
	const { email, name, password } = req.body;
	if (!email || !name || !password) {
		return res.status(400).json('Incorrect form submission')
	}
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
}

module.exports ={
	handleRegister: handleRegister
}