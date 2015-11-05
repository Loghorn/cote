var Base = require('./Base'),
    util = require('util'),
    Discovery = require('./Discovery');

var Connecter = function (advertisement, discoveryOptions, axon_type) {
    Base.call(this);

    advertisement.axon_type = axon_type;
    this.advertisement = advertisement;
    this.discovery = Discovery(advertisement, discoveryOptions);

    this.discovery.on('added', this.onadded.bind(this));
};
util.inherits(Connecter, Base);


module.exports = Connecter;
