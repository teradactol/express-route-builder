/**
 * Created by Bishaka on 18/10/2016.
 */
var
    async = require('async'),
    mandatory_params_check = require('./params_check/mandatory_params_check').defn,
    strict_params_check = require('./params_check/strict_params_check').defn,
    _gut = {}
;

_gut.defn = function(_opts){
    var opts = _opts || {},
        req = opts["req"],
        res = opts["res"],
        method = opts["method"],
        config = opts["config"],
        eventEmitter = opts["eventEmitter"],
        func = method["action"].trim() + " " + config["route"].trim(),
        params_def = method["params"], // parameters defined in config
        params_sent = Object.assign({},req.body,req.query,req.params);

    async.parallel({
        mandatory:function(mandatory_params_check_cb){
            mandatory_params_check({"params_def":params_def,"params_sent":params_sent})
                .then(function(error_list){
                    if(error_list.length > 0){
                        return mandatory_params_check_cb(null,error_list);
                    }else{
                        return mandatory_params_check_cb(null,null);
                    }
                });
        },
        strict_params:function( strict_params_check_cb ){
            if(!method["strict_params"]){
                return strict_params_check_cb(null, null);
            }else{
                strict_params_check({"params_def":params_def,"params_sent":params_sent})
                    .then(function(error_list){
                        if(error_list.length > 0){
                            return strict_params_check_cb(null,error_list);
                        }else{
                            return strict_params_check_cb(null,null);
                        }
                    });
            }
        }
    },function(err,param_check_results){
        var error = {
            "status":"error",
            data:(param_check_results["mandatory"] || []).concat(param_check_results["strict_params"] || [])
        };

        if(error["data"].length > 0){
            return res[method["response"]](error);
        }else{
            return eventEmitter.emit(func,params_sent,res,method["response"]);
        }
    });
};

module.exports = _gut;