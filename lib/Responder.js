var Connecter = require('./Connecter'),
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Responder = function (advertisement, discoveryOptions) {
    Connecter.call(this, advertisement, discoveryOptions, 'rep', axon.RepSocket, 'req');
};
util.inherits(Responder, Connecter);


Responder.prototype.onadded = function (obj, createSocket, forced) {
    if (!forced && this.advertisement.namespace !== obj.advertisement.namespace) { return; }

    var sock = createSocket();

    var that = this;

    sock.on('message', function (req, cb) {
        if (!req.type) { return; }

        that.emit(req.type, req, cb);
    });
};


module.exports = Responder;
