var Base = require('./Base'),
    util = require('util'),
    Discovery = require('./Discovery'),
    portfinder = require('portfinder');

var Listner = function (advertisement, discoveryOptions, axon_type, AxonSocket) {
    Base.call(this);

    var that = this;
    this.advertisement = advertisement;
    var host = discoveryOptions && discoveryOptions.address || '0.0.0.0';

    var create = function (err, port) {
        that.advertisement.axon_type = axon_type;
        that.advertisement.port = +port;

        var d = that.discovery = (typeof discoveryOptions !== 'boolean' || discoveryOptions) ? Discovery(that.advertisement, discoveryOptions) : undefined;

        that.sock = new AxonSocket();
        that.sock.bind(port);

        var sock = that.sock.sock ? that.sock.sock : that.sock;
        sock.on('connect', function (sock) {
            that.emit('connect', sock.remoteAddress, sock.remotePort);
        });

        that.emit('ready');

        d && d.on('added', function (obj) {
            that.emit('added', obj);
        });

        d && d.on('removed', function (obj) {
            that.emit('removed', obj);
        });
    };

    if (advertisement.port) {
        process.nextTick(create.bind(null, null, advertisement.port));
    } else {
        portfinder.getPort({ host: host }, create);
    }
};
util.inherits(Listner, Base);


module.exports = Listner;
