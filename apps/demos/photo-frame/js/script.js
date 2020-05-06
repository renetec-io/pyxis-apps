const refreshRate = 30000; // 30 seconds
const baseUrl = `https://source.unsplash.com/collection/3330448/${screen.width}x${screen.height}/`;
const frames = [$('#picture1'), $('#picture2')];
let activeFrame = 0;

function scheduleNextPicture() {
    setTimeout(()=>{
        let url = baseUrl + '?=' + new Date().getTime();
        activeFrame = (activeFrame === 0) ? 1 : 0;
        frames[activeFrame].css({
            'background-image' : `url(${url})`
        });
    }, 1500);
}

function updatePicture() {
    frames[1].toggleClass('transparent');
}

frames[0].css({
    'background-image' : `url(${baseUrl})`
});
scheduleNextPicture();
setInterval(function() {
    updatePicture();
    scheduleNextPicture();
}, refreshRate);
