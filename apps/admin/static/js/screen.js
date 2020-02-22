let initialRotation = pyxis.screen.getRotation();
let currentRotation = initialRotation;
let currentRotationDeg = '0deg';

function rotateScreen() {
    switch (currentRotation) {
        case 'normal':
            currentRotation = 'right';
            break;
        case 'right':
            currentRotation = 'inverted';
            break;
        case 'inverted':
            currentRotation = 'left';
            break;
        case 'left':
            currentRotation = 'normal';
            break;
        default:
            console.warn("unknown screen orientation");
            currentRotation = 'right'; // assume normal
    }

    switch (currentRotationDeg) {
        case '0deg':
            currentRotationDeg = '90deg';
            break;
        case '90deg':
            currentRotationDeg = '180deg';
            break;
        case '180deg':
            currentRotationDeg = '270deg';
            break;
        case '270deg':
            currentRotationDeg = '0deg';
            break;
    }

    document.body.setAttribute("style", `-webkit-transform: rotate(${currentRotationDeg});`);
}

function applyScreenRotation() {
    if (currentRotation !== initialRotation)
        pyxis.screen.setRotation(currentRotation);
    else
        window.location.href='index.html';
}
