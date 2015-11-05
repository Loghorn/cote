var Connecter = require('./Connecter'),
    util = require('util'),
    Discovery = require('./Discovery'),
    axon = require('axon');

var Subscriber = function (advertisement, discoveryOptions) {
    Connecter.call(this, advertisement, discoveryOptions, 'sub-emitter');
};
util.inherits(Subscriber, Connecter);


Subscriber.prototype.onadded = function (obj) {
    if (obj.advertisement.key !== this.advertisement.key) { return; }

    this.emit('added', obj);

    var adv = obj.advertisement;
    if (adv.axon_type !== 'pub-emitter') { return; }

    obj.sock = new axon.SubEmitterSocket();
    obj.sock.connect(adv.port, obj.address);
    obj.sock.sock.set('retry timeout', 0);

    obj.sock.sock.on('socket close', function () {
        this.emit('removed', obj);
    });

    this.advertisement.subscribesTo = this.advertisement.subscribesTo || ['*'];

    var namespace = '';
    if (this.advertisement.namespace) {
        namespace = this.advertisement.namespace + '::';
    }

    var that = this;

    this.advertisement.subscribesTo.forEach(function (topic) {
        topic = 'message::' + namespace + topic;

        (function (topic) {
            obj.sock.on(topic, function () {
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
};


Subscriber.prototype.on = function (type, listener) {
    var namespace = '';
    if (this.advertisement.namespace) {
        namespace = this.advertisement.namespace + '::';
    }

    return Connecter.prototype.on.call(this, namespace + type, listener);
};


module.exports = Subscriber;
