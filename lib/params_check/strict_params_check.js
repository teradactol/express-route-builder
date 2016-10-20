/**
 * Created by Bishaka on 18/10/2016.
 */
var
    Promise = require('bluebird'),
    async = require('async'),
    _gut = {}
;

_gut.defn = function (_opts) {
    return new Promise(function (resolve, reject) {
        var opts = _opts || {},
            params_def = opts["params_def"],
            params_sent_keys = Object.keys(opts["params_sent"]),
            error_list = [];

        async.each(params_sent_keys,function(param_key,param_cb){
            var param_find = function(param){return param["name"] === param_key;};

            if(!params_def.find(param_find)){
                var error = {
                    "code":"400",
                    "title":"param_not_defined",
                    "detail":"received undefined param[ " + param_key +" ]"
                };
                error_list.push(error);
            }
            param_cb();
        },function(err){
            resolve(error_list);
        });
    });
};

module.exports = _gut;