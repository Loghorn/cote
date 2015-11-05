var Discover = require('node-discover'),
    colors = require('colors'),
    _ = require('lodash');

var Discovery = function(advertisement, discoveryOptions) {
    this.options = discoveryOptions || {};

    _.defaults(this.options, {
        helloInterval: 2000,
        checkInterval: 4000,
        nodeTimeout: 5000,
        masterTimeout: 6000,
        monitor: false,
        log: true
    });

    _.defaults(advertisement, {
        type: 'service'
    });

    var that = this,
        d = new Discover(this.options);

    d.advertise(advertisement);

    this.options.log && log(helloLogger(d));

    d.on('added', function(obj) {
        if (!that.options.monitor && obj.advertisement.key !== advertisement.key) { return; }

        that.options.log && log(statusLogger(obj, 'online'));
    });

    d.on('removed', function(obj) {
        if (!that.options.monitor && obj.advertisement.key !== advertisement.key) { return; }

        that.options.log && log(statusLogger(obj, 'offline'));
    });

    return d;
};

var helloLogger = function(d) {
    var adv = d.me,
        log = [];

    d.me.id = d.broadcast.instanceUuid;

    log.push('\nHello! I\'m'.white);
    log = log.concat(statusLogger(adv, null));
    log.push('\n========================\n'.white);

    return log;
};

var statusLogger = function(obj, config) {
    var adv = obj.advertisement,
        log = [],
        status;

    switch (config) {
        case 'online':
            status = '.online'.green;
            break;
        case 'offline':
            status = '.offline'.red;
            break;
    }

    if (status) {
        log.push(adv.type.magenta + status)
    }

    log.push(adv.name.white + '#'.grey + obj.id.grey);

    if (adv.port) {
        log.push('on', adv.port.toString().blue);
    }

    return log;
};

var log = function(log) {
    console.log.apply(console.log, log);
};

module.exports = Discovery;
