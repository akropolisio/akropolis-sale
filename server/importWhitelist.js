var mysql = require('mysql2');
var express = require('express');
var cors = require('cors');
var bodyParser = require("body-parser"); // Body parser for fetch posted data
var credentials = require('./credentials');

var app = module.exports= express();
//Setup a config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var connection = mysql.createConnection({
	host: credentials.host,
	user: credentials.user,
	password: credentials.password,
	database: credentials.database
});

var corsOptions = {
  origin: 'http://localhost:8080',
  optionsSuccessStatus: 200 
}

connection.query('USE akropoli_db1', function (err) {
	if (err) throw err;
});

app.get('/kycReadyUsers', cors(corsOptions), function (req, res) {
	var data = {
		"Data":""
	};
	connection.query('select * from whitelist WHERE AddedToSmartContract IS NULL and CommflagWhitelistResult = 1', function (err, rows, fields) {
		if (err) throw err;
		if(rows.length != 0) {
			console.log(data["Data"]);
			res.json(rows);
		}else {
			data["Data"] = 'No data found';
			res.json(data);
		}
	});
});

//Update individual tiers of users when they are updated from the admin panel
//Example input, Tier: 1 and EthAddress : 0x00...

app.post('/updateEthAddressTier', cors(corsOptions), function (req, res) {
	var sqlQuery = 'UPDATE whitelist set Tier = ? WHERE EthAddress = ?';
	console.log(sqlQuery);
	connection.query(sqlQuery, [req.body.Tier, req.body.EthAddress],
		function (err, result) {
			if (err) throw err;
			res.send('User tier of EthAddress '+ req.params + ' Updated to tier' + req.query);
		});
});

//Set added to smart contract to 1 for true, where eth address is equal to any number of passed in comma delimited eth addresses
//Example input EthAddresses: '0x00...', '0x11...', '0x22..'
app.post('/updateAddedToSmartContractEntries', cors(corsOptions), function (req, res) {
	connection.query('UPDATE whitelist set AddedToSmartContract = \'1\' WHERE EthAddress in (?)',req.body.EthAddresses, 
		function (err, result) {
		if (err) throw err;
		res.send('User added to smart contract with EthAddress in: ' + req.body.EthAddresses + ' has been reflected in DB');
	});
});

app.listen(3000);
