var videos = ["KvYZVEzaPno","FbcLcSY2au4","0ewH5r8KZ6s","vyzihcRNy0Q","tAGnKpE4NCI"];
var actualVideo = 0;
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videos[actualVideo],
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    }
    );
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    console.log("player state change: "+event.data);
    if (event.data === 0){
        actualVideo++;
        if (actualVideo < videos.length){
            player.loadVideoById(videos[actualVideo]);
            player.playVideo();
        }
        else{
            actualVideo = 0;
            player.loadVideoById(videos[actualVideo]);
            player.playVideo();
        }
    }
}

function stopVideo() {
    player.stopVideo();
}

/* 
-1 (unstarted, sin empezar)
0 (ended, finalizado)
1 (playing, en reproducción)
2 (paused, en pausa)
3 (almacenando en búfer)
5 (video cued, video en cola)
*/
