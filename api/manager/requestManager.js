'use strict';
var https = require('https');
var http = require('http');
var mysql = require('mysql');

var HTTP = function (url, path, method, body) {
	return new Promise(function (resolve, reject) {
		if (body == undefined) {
			body = {};
		}
		var data = "";

		var options = {
			port: 3000,
			hostname: url,
			method: method,
			path: path,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(JSON.stringify(body))
			}
		};

		var request = http.request(options, (results) => {
			results.on('data', (d) => {
				data += d;
			});
			results.on('end', function () {
				var result;
				try {
					result = JSON.parse(data);
				} catch (exception) {
					result = data
				}
				resolve(result);
			});
		});

		request.write(JSON.stringify(body));
		request.on('error', (e) => {
			console.error(e);
			reject();
		});
		request.end();
	})
}

var HTTPS = function (url, path, method, body) {
	return new Promise(function (resolve, reject) {
		if (body == undefined) {
			body = {};
		}
		var data = "";

		var request = https.request(url + path, function (result) {
			result.on('data', (d) => {
				data += d;
			});
			result.on('end', function () {
				resolve(JSON.parse(data));
			});
		});
		request.on('error', (e) => {
			console.error(e);
			reject();
		});
		request.end();
	})
}

module.exports = {
	HTTPS: HTTPS,
	HTTP: HTTP
}