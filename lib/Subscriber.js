var Base = require('./Base'),
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Subscriber = function(advertisement, discoveryOptions) {
    Base.call(this);

    advertisement.axon_type = 'sub-emitter';
    this.advertisement = advertisement;

    var that = this,
        d = that.discovery = Discovery(advertisement, discoveryOptions);

    d.on('added', function(obj) {
        if (obj.advertisement.key !== advertisement.key) { return; }

        that.emit('added', obj);

        var adv = obj.advertisement;
        if (adv.axon_type !== 'pub-emitter') { return; }

        obj.sock = new axon.SubEmitterSocket();
        obj.sock.connect(adv.port, obj.address);
        obj.sock.sock.set('retry timeout', 0);

        obj.sock.sock.on('socket close', function() {
            that.emit('removed', obj);
        });

        advertisement.subscribesTo = advertisement.subscribesTo || ['*'];

        advertisement.subscribesTo.forEach(function(topic) {
            var namespace = '';
            if (advertisement.namespace) { namespace = advertisement.namespace + '::'; }

            topic = 'message::' + namespace + topic;

            (function(topic) {
                obj.sock.on(topic, function() {
                    var args = Array.prototype.slice.call(arguments);

                    if (args.length === 1) {
                        args.unshift(topic.substr(9));
                    } else {
                        args[0] = namespace + args[0];
                    }

                    that.emit.apply(that, args);
                });
            })(topic);
        });
    });
};
util.inherits(Subscriber, Base);


Subscriber.prototype.on = function(type, listener) {
    var namespace = '';
    if (this.advertisement.namespace) {
        namespace = this.advertisement.namespace + '::';
    }

    return Base.prototype.on.call(this, namespace + type, listener);
};


module.exports = Subscriber;
