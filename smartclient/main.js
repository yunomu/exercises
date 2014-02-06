var button = isc.Button.create({
    top: 200,
    left: 20,
    title: "Click",
    width: 100,
    click: function() {
        isc.say('Hello World');
    }
});
var button2 = isc.Button.create({
    top: 250,
    left: 20,
    title: "Dobule click",
    width: 100,
    doubleClick: function() {
        isc.say('Hello World');
    }
});
