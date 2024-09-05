const firebird = require("node-firebird");
const options = require("./client");

module.exports ={
executeQuery:(sql, params, callback)=>{

    firebird.attach(options, function(err, db) {
            
        if (err) {
            console.log(err);
            return callback(err, []); 
        } 

        db.query(sql, params, function(err, result) {
            
            db.detach();

            if (err) {
                return callback(err, []);
            } else {
                return callback(undefined, result);
            }
        });

    });
},
executeQueryTrx : async (transaction, sql, parameters)=>{

return new Promise((resolve, reject)=>{
    transaction.query(sql, parameters, (err, result)=>{
        if (err) {
            return reject(err);
        } else {
            return resolve(result);
        }
    });
});
},}
 