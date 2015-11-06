var Subscriber = require('../').Subscriber;

var randomSubscriber = new Subscriber({
    name: 'randomSub',
    // namespace:'rnd',
    subscribesTo: ['randomUpdate']
}, false);

randomSubscriber.on('randomUpdate', function(req) {
    console.log('notified of ', req);
});

randomSubscriber.connectTo('127.0.0.1', 16275, true);

setTimeout(function() {
    randomSubscriber.disconnectFrom('127.0.0.1', 16275);
}, 10000);
