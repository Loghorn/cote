var Base = require('./Base'),
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Responder = function(advertisement, discoveryOptions) {
    Base.call(this);

    advertisement.axon_type = 'rep';
    this.advertisement = advertisement;

    var that = this,
        d = that.discovery = Discovery(advertisement, discoveryOptions);

    d.on('added', function(obj) {
        if (obj.advertisement.key != advertisement.key) { return; }

        that.emit('added', obj);

        var adv = obj.advertisement;
        if (adv.axon_type !== 'req') { return; }

        if (advertisement.namespace !== adv.namespace) { return; }

        obj.sock = new axon.RepSocket();
        obj.sock.connect(adv.port, obj.address);
        obj.sock.set('retry timeout', 0);

        obj.sock.on('socket close', function() {
            that.emit('removed', obj);
        });

        obj.sock.on('message', function(req, cb) {
            if (!req.type) { return; }

            that.emit(req.type, req, cb);
        });
    });
};
util.inherits(Responder, Base);


module.exports = Responder;
