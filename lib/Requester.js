var Listner = require('./Listner'),
    util = require('util'),
    axon = require('axon');

var Requester = function (advertisement, discoveryOptions) {
    Listner.call(this, advertisement, discoveryOptions,
        'req', axon.ReqSocket());
};
util.inherits(Requester, Listner);


Requester.prototype.send = function () {
    var args = Array.prototype.slice.call(arguments);

    this.sock && this.sock.send.apply(this.sock, args);
};


module.exports = Requester;
