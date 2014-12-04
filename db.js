var MongoClient = require('mongodb').MongoClient;
var url = require('./property').property['db_url'];

var documentName = "msg";

function save(data, callback) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		} else {
			var collection = db.collection(documentName);

			collection.insert(data, function(err, result) {
				if (err) {
					console.log(err);
				} else {
					console.log("insert success!!");
					callback && callback(result);
					db.close();
				}
			});
		}
	})
}

function list(page, callback) {
	var pageNum = 15;

	MongoClient.connect(url, function(err, db) {
		if (err) {
			console.log(err);
		} else {
			var collection = db.collection(documentName);

			collection.find({},{limit: pageNum, skip: (page - 1) * pageNum}).sort({dtime:-1}).toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					callback && callback(result);
					db.close();
				}
			})
		}
	})
}

exports.save = save;
exports.list = list;

// MongoClient.connect(url, function(err, db) {
//   console.log("Connected correctly to server");

//   insertDoc(db, function(result) {
//   	console.log(result);
//   	updateDoc(db, function(result) {
// 	  	console.log(result);
// 	  	removeDoc(db, function(result) {
// 	  		console.log(result);
// 	  		findDoc(db, function(result) {
// 	  			console.log(result);
// 	  			db.close();
// 	  		})
// 	  	})
//   	})
//   })
// });

// var insertDoc = function(db, callback) {
// 	var collection = db.collection('doc2');

// 	collection.insert([{a:1},{a:2},{a:3}], function(err, result) {
// 		if (err) {
// 			console.log(err)
// 		} else {
// 			console.log('inserted 3 doc');
// 			callback(result);
// 		}
// 	})
// };

// var updateDoc = function(db, callback) {
// 	var collection = db.collection('doc2');

// 	collection.update({a:2}, {$set:{b:1}}, function(err, result) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			console.log("update the doc");
// 			callback(result);
// 		}
// 	})
// };

// var removeDoc = function(db, callback) {
// 	var collection = db.collection('doc2');

// 	collection.remove({a:3}, function(err, result) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			console.log("remove");
// 			callback(result);
// 		}
// 	})
// };

// var findDoc = function(db, callback) {
// 	var collection = db.collection('doc2');

// 	collection.find({}).toArray(function(err, docs) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			console.log("find");
// 			callback(docs);
// 		}
// 	})
// }