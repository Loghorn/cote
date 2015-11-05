var Connecter = require('./Connecter'),
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Responder = function (advertisement, discoveryOptions) {
    Connecter.call(this, advertisement, discoveryOptions, 'rep');
};
util.inherits(Responder, Connecter);


Responder.prototype.onadded = function (obj) {
    if (obj.advertisement.key !== this.advertisement.key) { return; }

    this.emit('added', obj);

    var adv = obj.advertisement;
    if (adv.axon_type !== 'req') { return; }

    if (this.advertisement.namespace !== adv.namespace) { return; }

    obj.sock = new axon.RepSocket();
    obj.sock.connect(adv.port, obj.address);
    obj.sock.set('retry timeout', 0);

    var that = this;

    obj.sock.on('socket close', function () {
        that.emit('removed', obj);
    });

    obj.sock.on('message', function (req, cb) {
        if (!req.type) { return; }

        that.emit(req.type, req, cb);
    });
};


module.exports = Responder;
