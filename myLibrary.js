
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

    myLibrary.uploadImage = function(inputElementId, outputElementId) {
        const input = document.getElementById(inputElementId);
        const output = document.getElementById(outputElementId);

        input.addEventListener('change', function() {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    output.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="max-width: 100%; height: auto;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    };

    global.myLibrary = myLibrary;
})(typeof window !== 'undefined' ? window : global);


// npx uglify-js myLibrary.js -o myLibrary.min.js