
(function(global) {
    const myLibrary = {};

    myLibrary.sayHello = function(name) {
        return `Hello, ${name}!`;
    };

    global.myLibrary = myLibrary;
})(this);