'use strict';
module.exports = function(app) {
	var pokemonController = require('../controllers/pokemonController');
	var authController = require('../controllers/authController');
	var optionController = require('../controllers/optionController');
	var userController = require('../controllers/userController');

	//AUTHENTIFICATION
	app.route('/login').post(authController.login);
	app.route('/signup').post(authController.signup);
	app.route('/verify').post(authController.verify);

	//USER
	app.route('/user/addCard').post(userController.addCard);

	//POKEMON
	app.route('/pokedex').get(pokemonController.pokedex);
	app.route('/pokemon/:idPokemon').get(pokemonController.pokemonDetails);

	//CARTES

	//QUIZZ

	//OPTION
	app.route('/option/editPseudo').post(optionController.editPseudo);
	app.route('/option/verifyPseudo').post(optionController.verifyPseudo);
};