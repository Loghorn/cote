var Listner = require('./Listner'),
    util = require('util'),
    axon = require('axon');

var Publisher = function (advertisement, discoveryOptions) {
    Listner.call(this, advertisement, discoveryOptions,
        'pub-emitter', axon.PubEmitterSocket());
};
util.inherits(Publisher, Listner);


Publisher.prototype.publish = function (topic, data) {
    var namespace = '';
    if (this.advertisement.namespace) {
        namespace = this.advertisement.namespace + '::';
    }

    topic = 'message::' + namespace + topic;

    this.sock && this.sock.emit(topic, data);
};


module.exports = Publisher;
