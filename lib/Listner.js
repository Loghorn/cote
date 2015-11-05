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
        advertisement.axon_type = axon_type;
        advertisement.port = +port;

        var d = that.discovery = Discovery(advertisement, discoveryOptions);

        that.sock = new AxonSocket();
        that.sock.bind(port);

        that.emit('ready');

        d.on('added', function (obj) {
            that.emit('added', obj);
        });

        d.on('removed', function (obj) {
            that.emit('removed', obj);
        });
    };

    if (advertisement.port) {
        process.nextTick(create.bind(null, advertisement.port));
    } else {
        portfinder.getPort({ host: host }, create);
    }
};
util.inherits(Listner, Base);


module.exports = Listner;
