var Connecter = require('./Connecter'),
    util = require('util'),
    axon = require('axon');

var Subscriber = function (advertisement, discoveryOptions) {
    Connecter.call(this, advertisement, discoveryOptions, 'sub-emitter', axon.SubEmitterSocket, 'pub-emitter');
};
util.inherits(Subscriber, Connecter);


Subscriber.prototype.onadded = function (obj, createSocket, forced) {
    var sock = createSocket();

    var that = this;

    this.advertisement.subscribesTo = this.advertisement.subscribesTo || ['*'];

    var namespace = '';
    if (this.advertisement.namespace) {
        namespace = this.advertisement.namespace + '::';
    }

    this.advertisement.subscribesTo.forEach(function (topic) {
        topic = 'message::' + namespace + topic;

        (function (topic) {
            sock.on(topic, function () {
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
