var EventEmitter = require('eventemitter2').EventEmitter2,
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon'),
    portfinder = require('portfinder');

var Publisher = function(advertisement, discoveryOptions) {
    EventEmitter.call(this, {
        wildcard: true, // should the event emitter use wildcards.
        delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
        newListener: false, // if you want to emit the newListener event set to true.
        maxListeners: 2000 // the max number of listeners that can be assigned to an event, defaults to 10.
    });

    var that = this;
    this.advertisement = advertisement;
    var host = discoveryOptions && discoveryOptions.address || '0.0.0.0';

    portfinder.getPort({ host: host }, function(err, port) {
        advertisement.axon_type = 'pub-emitter';
        advertisement.port = +port;

        var d = that.discovery = Discovery(advertisement, discoveryOptions);

        that.sock = new axon.PubEmitterSocket();
        that.sock.bind(port);

        that.emit('ready');

        d.on('added', function(obj) {
            that.emit('added', obj);
        });

        d.on('removed', function(obj) {
            that.emit('removed', obj);
        });
    });
};
util.inherits(Publisher, EventEmitter);


Publisher.prototype.publish = function(topic, data) {
    var namespace = '';
    if (this.advertisement.namespace) {
        namespace = this.advertisement.namespace + '::';
    }

    topic = 'message::' + namespace + topic;

    this.sock && this.sock.emit(topic, data);
};


Publisher.prototype.close = function() {
    if (this.discovery) {
        this.discovery.stop();

        this.discovery.broadcast &&
            this.discovery.broadcast.socket &&
            this.discovery.broadcast.socket.close();
    }
};


module.exports = Publisher;
