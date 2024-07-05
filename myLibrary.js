class DesignerTool {
    constructor(containerId) {
        this.containerId = containerId;
        this.init();
    }

    loadDependencies() {
        const dependencies = [
            "https://unpkg.com/filepond/dist/filepond.min.css",
            "https://cdn.quilljs.com/1.3.6/quill.snow.css",
            "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css",
            "https://code.jquery.com/jquery-3.5.1.slim.min.js",
            "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js",
            "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js",
            "https://unpkg.com/filepond/dist/filepond.min.js",
            "https://cdn.quilljs.com/1.3.6/quill.js",
            "https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.4.0/fabric.min.js"
        ];

        dependencies.forEach(url => {
            const ext = url.split('.').pop();
            let tag;

            if (ext === 'css') {
                tag = document.createElement('link');
                tag.rel = 'stylesheet';
                tag.href = url;
            } else if (ext === 'js') {
                tag = document.createElement('script');
                tag.src = url;
            }

            document.head.appendChild(tag);
        });
    }

    init() {
        this.loadDependencies();

        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.error(`Container with id "${this.containerId}" not found`);
                return;
            }

            container.innerHTML = `
                <div class="container">
                    <h1 class="mb-4">Designer Tool</h1>
                    <div id="uploader" class="mb-4">
                        <div class="form-group">
                            <label for="imageUploader">Upload Image</label>
                            <input type="file" id="imageUploader" class="form-control-file">
                        </div>
                        <div id="textUploader" class="mb-4">
                            <label for="editor">Enter Text</label>
                            <div id="editor" style="height: 100px;"></div>
                            <button id="addText" class="btn btn-primary mt-2">Add Text</button>
                        </div>
                        <div class="form-group">
                            <label for="qrText">QR Code Text</label>
                            <input type="text" id="qrText" class="form-control" placeholder="Enter text for QR code">
                            <button id="generateQR" class="btn btn-primary mt-2">Generate QR Code</button>
                        </div>
                    </div>
                    <div id="canvas-container" class="d-flex justify-content-center">
                        <canvas id="canvas" width="800" height="600"></canvas>
                    </div>
                    <div id="output-container" class="text-center">
                        <button id="generateHTML" class="btn btn-success mt-4">Generate HTML</button>
                        <button id="downloadHTML" class="btn btn-info mt-4" style="display: none;">Download HTML</button>
                        <button id="removeSelected" class="btn btn-danger mt-4">Remove Selected</button>
                        <pre id="output" style="display: none;"></pre>
                    </div>
                </div>
            `;

            this.initializeTool();
        });
    }

    initializeTool() {
        const inputElement = document.querySelector('input[type="file"]');
        const pond = FilePond.create(inputElement, {
            acceptedFileTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
            allowFileTypeValidation: true
        });

        pond.on('addfile', (error, file) => {
            if (error) {
                console.error('File add error:', error);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const data = event.target.result;
                fabric.Image.fromURL(data, (img) => {
                    img.set({
                        left: 50,
                        top: 50,
                        selectable: true
                    });
                    canvas.add(img);
                    img.sendToBack(); // Ensure image is always at the back
                    canvas.renderAll();
                });
            };
            reader.readAsDataURL(file.file);
        });

        const quill = new Quill('#editor', {
            theme: 'snow'
        });

        const canvas = new fabric.Canvas('canvas');

        document.getElementById('addText').addEventListener('click', () => {
            const text = quill.getText();
            const textbox = new fabric.Textbox(text, {
                left: 50,
                top: 50,
                width: 200,
                fontSize: 20,
                selectable: true
            });
            canvas.add(textbox);
            textbox.bringToFront(); // Ensure text is always on top
        });

        document.getElementById('generateQR').addEventListener('click', () => {
            const qrText = document.getElementById('qrText').value;
            const qr = new QRCode(document.createElement('div'), {
                text: qrText,
                width: 128,
                height: 128,
            });
            const qrCanvas = qr._oDrawing._elCanvas;
            const qrDataUrl = qrCanvas.toDataURL('image/png');
            fabric.Image.fromURL(qrDataUrl, (img) => {
                img.set({
                    left: 50,
                    top: 50,
                    selectable: true
                });
                canvas.add(img);
                img.bringToFront(); // Ensure QR code is always on top
                canvas.renderAll();
            });
        });

        document.getElementById('generateHTML').addEventListener('click', () => {
            const canvasObjects = canvas.getObjects();
            let html = '';

            canvasObjects.forEach(obj => {
                if (obj.type === 'image') {
                    html += `<img src="${obj.toDataURL()}" style="position: absolute; left: ${obj.left}px; top: ${obj.top}px; width: ${obj.width * obj.scaleX}px; height: ${obj.height * obj.scaleY}px;">\n`;
                } else if (obj.type === 'textbox') {
                    html += `<div style="position: absolute; left: ${obj.left}px; top: ${obj.top}px; width: ${obj.width}px; font-size: ${obj.fontSize}px;">${obj.text}</div>\n`;
                }
            });

            const outputElement = document.getElementById('output');
            outputElement.innerText = html;

            const downloadButton = document.getElementById('downloadHTML');
            downloadButton.style.display = 'inline';

            downloadButton.addEventListener('click', () => {
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'design.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
        });

        document.getElementById('removeSelected').addEventListener('click', () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
            }
        });
    }
}

// Usage:
// <script src="path/to/designer-tool.js"></script>
// <script>
//   new DesignerTool('your-div-id');
// </script>



// npx uglify-js myLibrary.js -o myLibrary.min.js