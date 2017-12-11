'use strict';
var https = require('https');
var mysql = require('mysql');
var _ = require('lodash');

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'pokecard'
});

exports.userPokedex = function(req, res){
	var idUser = req.params.idUser;

	console.log('/user/'+idUser+'/pokedex');

	var options = "https://pokeapi.co/api/v2/pokemon/?limit=802&name";

	var data = "";

	var request = https.get(options, (result) => {

		result.on('data', (d) => {
			data += d;
		});

		result.on('end', function() {
			var tmpData = JSON.parse(data);

			var finalResult = [];

			connection.query("SELECT pokemon FROM User WHERE idUser="+idUser, function(error, results, fields){
				if(results.length > 0){
					var userPokemon = results[0].pokemon;

					if(userPokemon != "" && userPokemon != null){
						userPokemon = userPokemon.split(",");

						userPokemon = _.sortBy(userPokemon, function(o){ return parseInt(o);});

						userPokemon.forEach(function(pokemonId){
							if(pokemonId != ""){
								finalResult.push({
									"id": _.parseInt(pokemonId),
									"name": tmpData.results[pokemonId-1].name,
									"urlPicture": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + pokemonId + ".png"
								});
							}
						});
					}
					
					res.json(finalResult);
				}else{
					res.json({user: false});
				}
			});
			
		});

	});

	request.on('error', (e) => {
		console.error(e);
	});

	request.end();
}

exports.addCard = function(req, res){
	console.log('/user/addCard');

	var cards = req.body.cards;
	var idUser = req.body.idUser;

	connection.query("SELECT * FROM User WHERE idUser="+idUser, function(error, results, fields){
		if(results.length > 0){
			var userCards = results[0].cards;
			var userPokemon = results[0].pokemon;

			if(userPokemon != null){
				userCards = userCards.split(",");
				userPokemon = userPokemon.split(",");
			}else{
				userCards = [];
				userPokemon = [];
			}

			cards.forEach(function(card){
				if(userCards.find(compareCard, card) == undefined){
					userCards.push(card.id);
				}
				if(userPokemon.find(comparePokemon, card) == undefined){
					userPokemon.push(card.idPokemon);
				}
			});

			connection.query("UPDATE User SET pokemon='" + userPokemon.toString() + "', cards='" + userCards.toString() + "' WHERE idUser="+idUser, function(error, results, fields){
				connection.query("SELECT idUser, pokemon, cards FROM User WHERE idUser=" + idUser, function(error, results, fields){
					if(results.length > 0){
						res.json(results[0]);
					}else{
						res.json({"idUser": false});
					}
				});
			});
		}else{
			res.json({"idUser": false});
		}
	});
}

exports.getCardsPokemonUser = function(req, res){
	var idUser = req.params.idUser;
	console.log("/user/" + idUser + "/pokemon/cards");

	connection.query("SELECT pokemon, cards FROM User WHERE idUser="+idUser, function(error, results, fields){
		if(results.length > 0){
			var listPokemon = results[0].pokemon;
			var listCards = results[0].cards;
			listPokemon = listPokemon.split(",");
			listPokemon = _.sortBy(listPokemon, function(o){ return parseInt(o);});
			listCards = listCards.split(",");

			var finalResult = [];

			listPokemon.forEach(function(pokemon){
				finalResult.push({
					"idPokemon": pokemon,
					"cards": []
				})
			});

			var options = "https://api.pokemontcg.io/v1/cards?id=";

			listCards.forEach(function(card){
				options += card + "|";
			});

			var data = "";

			var request = https.get(options, (result) => {

				result.on('data', (d) => {
					data += d;
				});

				result.on('end', function() {
					var tmpData = JSON.parse(data);

					tmpData.cards.forEach(function(card){
						console.log(finalResult)
						finalResult[_.findIndex(finalResult, function(o) {return o.idPokemon == card.nationalPokedexNumber})].cards.push({
							"id": card.id,
							"urlPicture": card.imageUrl
						});
					});

					res.json(finalResult);
				});
			});

			request.on('error', (e) => {
				console.error(e);
			});

			request.end();

		}
	})
}



function compareCard(element){
	return element == this.id;
}

function comparePokemon(element){
	return element == this.idPokemon;
}