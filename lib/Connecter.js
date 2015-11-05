var Base = require('./Base'),
    util = require('util'),
    Discovery = require('./Discovery');

var Connecter = function (advertisement, discoveryOptions, axon_type, AxonSocket, other_axon_type) {
    Base.call(this);

    this.AxonSocket = AxonSocket;

    advertisement.axon_type = axon_type;
    this.advertisement = advertisement;

    if (typeof discoveryOptions !== 'boolean' || discoveryOptions) {
        this.discovery = Discovery(advertisement, discoveryOptions);

        var that = this;

        this.discovery.on('added', function (obj) {
            if (obj.advertisement.key !== that.advertisement.key) { return; }

            var adv = obj.advertisement;
            if (adv.axon_type !== other_axon_type) { return; }

            var cb = createSocket.bind(that, obj, adv.port, obj.address, AxonSocket);

            that.onadded(obj, cb, false);
        });
    }
};
util.inherits(Connecter, Base);


Connecter.prototype.connectTo = function (address, port) {
    var obj = {
        type: 'manual connection',
        address: address,
        port: port
    };
    var cb = createSocket.bind(this, obj, port, address, this.AxonSocket);
    this.onadded(obj, cb, true);
};


function createSocket(obj, port, address, AxonSocket) {
    this.emit('added', obj);

    obj.sock = new AxonSocket();
    obj.sock.connect(port, address);

    var sock = obj.sock.sock ? obj.sock.sock : obj.sock;

    sock.set('retry timeout', 0);

    sock.on('socket close', function () {
        this.emit('removed', obj);
    });

    return obj.sock;
};


module.exports = Connecter;
