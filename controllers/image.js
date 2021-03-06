const Clafifai = require('clarifai');

const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY
})

const handleApiCall = (req, res) => {
 	app.models
		.predict('f76196b43bbd45c99b4f3cd8e8b40a8a', req.body.input)
		.then(data => {
			return res.json(data);
		})
		.catch(err => res.status(400).json("Error occured with API."))
}

const handleImage = (db) => (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
		.increment('entries', 1)
		.returning('entries')
		.then(entries => res.json(entries[0]))
		.catch(err => res.status(400).json('Could not get entries'));	
}

module.exports = {
	handleImage: handleImage,
	handleApiCall: handleApiCall
}