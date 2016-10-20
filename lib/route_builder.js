/**
 * Created by Bishaka on 17/10/2016.
 */

var
    express = require('express'),
    async = require('async'),
    Promise = require('bluebird'),
    events = require('events'),
    on_request_recieved = require('./on_req_recieved').defn,
    _gut = {}
;

_gut.buildRoutes = function(opts){
    return new Promise(function(resolve,reject){
        var
            engine = express.Router(),
            configs = opts["config"],
            funcs = opts["funcs"],
            eventEmitter = new events.EventEmitter();

        async.parallel({
            funcs: function (fs_cb) {
                async.each(funcs,function(func,f_cb){
                    eventEmitter.on(func["name"],function(params,res_obj,res_method){
                        func["exec"](params)
                            .then(function(out){
                                res_obj[res_method](out);
                            })
                            .catch(function(out){
                                res_obj[res_method](out);
                            })
                    });
                    f_cb();
                },function(err){
                    fs_cb(null,'ok')
                })
            },
            routes: function(rts_cb){
                async.each(configs,function(config,rt_cb){
                    var methods = config["methods"];
                    async.each(methods,function(method,md_cb){

                        if(method["middleware"]){
                            var middleware = opts["middleware"][method["middleware"]];
                            engine["route"](config["route"])[method["action"]](middleware,function(req,res){
                                on_request_recieved({
                                    req:req,
                                    res:res,
                                    method:method,
                                    config:config,
                                    eventEmitter:eventEmitter
                                })
                            });
                        }else{
                            engine["route"](config["route"])[method["action"]](function(req,res){
                                on_request_recieved({
                                    req:req,
                                    res:res,
                                    method:method,
                                    config:config,
                                    eventEmitter:eventEmitter
                                })
                            });
                        }


                        md_cb();
                    },function(err){
                        rt_cb();
                    })
                },function(err){
                    rts_cb(null,'ok')
                })
            }
        },function(err){
            resolve(engine)
        })
    });
};

module.exports = _gut;