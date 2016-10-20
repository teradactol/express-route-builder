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
            params_sent = opts["params_sent"],
            error_list = [];

        async.each(params_def,function(param,param_cb){
            if( param["required"]==="yes" && !params_sent[param["name"]] ){
                var error = {
                    "code":"400",
                    "title":"missing_param",
                    "detail":"missing required param[ " + param["name"] +" ]"
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