var Base = require('./Base'),
    util = require('util'),
    Discovery = require('./Discovery'),
    _ = require('lodash');

var Connecter = function (advertisement, discoveryOptions, axon_type, AxonSocket, other_axon_type) {
    Base.call(this);

    this.AxonSocket = AxonSocket;
    this.manualConnections = {};
    this.connections = {};

    advertisement.axon_type = axon_type;
    this.advertisement = advertisement;

    var that = this;

    if (typeof discoveryOptions !== 'boolean' || discoveryOptions) {
        this.discovery = Discovery(advertisement, discoveryOptions);

        this.discovery.on('added', function (obj) {
            if (obj.advertisement.key !== that.advertisement.key) { return; }

            var adv = obj.advertisement;
            if (adv.axon_type !== other_axon_type) { return; }

            var cb = createSocket.bind(that, obj, adv.port, obj.address, AxonSocket);
            that.onadded(obj, cb, false);
        });
    }

    this.on('removed', function (obj) {
        if (obj.type === 'manual connection' && obj.reconnect) {
            that.connectTo(obj.address, obj.port, true);
        }
    });
};
util.inherits(Connecter, Base);


Connecter.prototype.isConnected = function (address, port) {
    var ap = address + ":" + port;
    return this.connections[ap] === true;
};


Connecter.prototype.isConnecting = function (address, port) {
    var ap = address + ":" + port;
    return this.connections[ap] === false;
};


Connecter.prototype.connectTo = function (address, port, reconnect) {
    var ap = address + ":" + port;
    var obj = this.manualConnections[ap];
    if (!obj) {
        obj = {
            type: 'manual connection',
            address: address,
            port: port,
            ap: ap,
            reconnect: reconnect
        };
        var cb = createSocket.bind(this, obj, port, address, this.AxonSocket);
        this.onadded(obj, cb, true);
        this.manualConnections[ap] = obj;
    }
};


Connecter.prototype.disconnectFrom = function (address, port) {
    var ap = address + ":" + port;
    var obj = this.manualConnections[ap];
    if (obj) {
        obj.reconnect = false;
        obj.sock.close();
    }
};


Connecter.prototype.close = function () {
    this.manualConnections = {};
    Base.prototype.close.call(this);
}


function createSocket(obj, port, address, AxonSocket) {
    this.connections[obj.ap] = false;

    obj.sock = new AxonSocket();

    this.emit('added', obj);

    obj.sock.connect(port, address);

    var sock = obj.sock.sock ? obj.sock.sock : obj.sock;

    sock.set('retry timeout', 0);

    var that = this;

    sock.on('connect', function () {
        that.connections[obj.ap] = true;
    });

    sock.on('socket close', function () {
        if (obj.type === 'manual connection') {
            delete that.manualConnections[obj.ap];
        }
        delete that.connections[obj.ap];
        that.emit('removed', obj);
    });

    return obj.sock;
};


module.exports = Connecter;
