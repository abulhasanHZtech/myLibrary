
(function(global) {
    const myLibrary = {};
    myLibrary.sayHello = function(name) {
        return `Hello, ${name}!`;
    };

    myLibrary.generateTable = function(number) {
        let table = '';
        for (let i = 1; i <= 10; i++) {
            table += `${number} × ${i} = ${number * i}\n`;
        }
        return table;
    };

    global.myLibrary = myLibrary;
})(typeof window !== 'undefined' ? window : global);


// npx uglify-js myLibrary.js -o myLibrary.min.js