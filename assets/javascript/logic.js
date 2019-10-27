var firebaseConfig = {
    apiKey: "AIzaSyDPwgpuAossbwxBOly-YkBB7uuaXZUmApU",
    authDomain: "youtify-dbb11.firebaseapp.com",
    databaseURL: "https://youtify-dbb11.firebaseio.com",
    projectId: "youtify-dbb11",
    storageBucket: "youtify-dbb11.appspot.com",
    messagingSenderId: "539335094587",
    appId: "1:539335094587:web:ed047eaccd5da6d9e0c71e"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var connectionsRef = database.ref("/api_keys");
var videos = [];
var tempVideo = {trackId: 0,
                 videoId: " ",
                 artist: " ",
                 songName: " ",
                 youtubeName: " "};
var player, iframe, tag, firstScriptTag, trackId, apiKeys;
var actualVideo = 0, myIndex = 0;
var userImage;
var userName;

database.ref("/api_keys").on("value", function(snapshot) {
    apiKeys = JSON.parse(snapshot.val());
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

function carousel() {
    var i;
    var x = document.getElementsByClassName("mySlides");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    myIndex++;
    if (myIndex > x.length) {
        myIndex = 1
    }
    x[myIndex - 1].style.display = "block";
    setTimeout(carousel, 1000);
}

(function () {

    //Parte del API para especificar cuál información se necesita exactamente
    var stateKey = 'spotify_auth_state';
    //para leer el querystring del callback
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    var params = getHashParams();

    // pasa cuando se carga la página
    var access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    // con este if se sabe si hubo algún problema de autenticación
    if (access_token && (state == null || state !== storedState)) {
        alert('There was an error during the authentication');
    } 
    else {
        localStorage.removeItem(stateKey);
        // con este if se sabe si se está autenticado correctamente
        if (access_token) {
            // si sí está autenticado entonces trae información del usuario
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    userName = response.display_name
                    $('#sideBarUserName1').text(userName);
                    $('#sideBarUserName2').text(userName);
                    userImage = response.images[0].url
                    $('#navBarUserImage').attr('src', userImage);
                    $('#sideBarUserImage1').attr('src', userImage);
                    $('#sideBarUserImage2').attr('src', userImage);
                    $('#loggedIn').show();
                    $('#login-section').hide();
                    $('#navBar').show();
                    $('#playlistSection').show();
                    $('#videosSection').show();
                    $('#videosSection2').show();
                }
            });
        } 
        else {
            $('#login-section').show();
            $('#navBar').hide();
            $('#logout-button').hide();
            $('#loggedIn').hide();
            $('#playlistSection').hide();
            $('#videosSection').hide();
            $('#videosSection2').hide();
        }
        // click del botón de login, cambiar sólo client_id
        $('#login-button').on('click', function () {

            var client_id = "40645a5068f3446cbf5c45fc1fbe1f14";//'e0e1b780bf694080b812b1b79f541a0a'; // Your client id
            // var redirect_uri = 'http://127.0.0.1:5500/index.html'; // Your redirect uri
            var redirect_uri = window.location.href; //'http://127.0.0.1:5500/index.html'; // Your redirect uri
            var state = generateRandomString(16);
            localStorage.setItem(stateKey, state);
            var scope = 'user-read-private user-read-email';

            var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(client_id);
            url += '&scope=' + encodeURIComponent(scope);
            url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
            url += '&state=' + encodeURIComponent(state);

            window.location = url;
        });

        // click del botón de get playlist, aquí se puede cambiar el API endpoint
        // y los headers para obtener diferentes resultados
        $('#get-playlists').on('click', function () {
            $.ajax({
                url: 'https://api.spotify.com/v1/me/playlists',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    $('#playlists').empty();
                    $('#tracks').empty();
                    response.items.forEach(function (item, index) {
                        var li = $("<li>");
                        var pl = $("<span>");
                        // pl.attr("href","");
                        pl.addClass("playlist-btn");
                        pl.attr("tracks_api_url", response.items[index].tracks.href)
                        pl.text(item.name);
                        li.append(pl);
                        $("#playlists").append(li);
                    })
                },
                error: function (err) {
                    console.log(err);
                }
            });

        });

        function diplayTracks() {
            $('#tracks').empty();
            var tracks = $(this).attr("tracks_api_url");
            $.ajax({
                url: tracks,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    videos = [];
                    trackId = 1;
                    
                    response.items.forEach(function (item, index) {
                        tempVideo = {};
                        var li = $("<li>");
                        var pl = $("<span>");
                        // pl.attr("href","");
                        pl.addClass("track-btn");
                        pl.attr("data-name", trackId);
                        pl.text(response.items[index].track.artists[0].name+" - "+response.items[index].track.name);
                        $("#tracks").append(pl);
                        tempVideo.trackId = trackId;
                        tempVideo.artist = response.items[index].track.artists[0].name;
                        tempVideo.songName = response.items[index].track.name;
                        tempVideo.videoId = "";
                        tempVideo.youtubeName ="";
                        videos.push(tempVideo);
                        trackId++;
                        li.append(pl);
                        $('#tracks').append(li);
                    })
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
        $(document).on("click", ".playlist-btn", diplayTracks);
    }
})();

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: 590,
        width: 840,
        //videoId: videos[actualVideo].videoId,
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    player = event.target;
    iframe = $("#player");
    //player.playVideo();
}

function playInFullscreen() {
    player.playVideo();
    var requestFullScreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen;
    if (requestFullScreen) {
        requestFullScreen.bind(iframe)();
    }
}

function onPlayerStateChange(event) {
    if (event.data === 0) {
        actualVideo++;
        if (actualVideo >= videos.length) {
            actualVideo = 0;
        }
        $("#trackName").text(videos[actualVideo].youtubeName);
        player.loadVideoById(videos[actualVideo].videoId);
        playFullscreen();
    }
};

function searchSongYT(trackId_par,artist,songName,actualKey){
    artist = artist.replace(/ /g, "+");
    songName = songName.replace(/ /g, "+");
    var queryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&fields=items(id/videoId,snippet/title)&q="+artist+songName+"&maxResults=1&type=video&videoEmbeddable=true&order=relevance&key="+apiKeys[actualKey];
    $.ajax({
        url: queryURL,
        method: "GET",
        success: function (response) {
            if (response.items.length > 0) {
                videos[trackId_par].youtubeName = response.items[0].snippet.title;
                videos[trackId_par].videoId = response.items[0].id.videoId;
                if (trackId_par === 0) {
                    player.loadVideoById(videos[0].videoId);
                }
            }
        },
        error: function (err) {
            console.log(err);
            if (err.responseJSON.error.code === 403){
                actualKey++;
                console.log(apiKeys[actualKey]);
                if (actualKey < apiKeys.length){
                    searchSongYT(trackId_par,artist,songName,actualKey);
                }
                else{
                    console.log("The "+trackId_par+" could not be retrived because of quota exceeded")
                }
            }
        }
    });
}

$(document).on("click", "#setYTPlaylist", function(event){
    player.stopVideo();
    $("#player").show();
    for(var i=0; i<videos.length; i++){
        searchSongYT(i,videos[i].artist,videos[i].songName,0);
    }
});

$(document).on("click", ".track-btn", function(event){
    player.stopVideo();
    actualVideo = parseInt($(this).attr("data-name"))-1;
    player.loadVideoById(videos[actualVideo].videoId);
    $("#trackName").text(videos[actualVideo].youtubeName);
    player.playVideo();
});

$(document).on("click", "#backTrack", function(event){
    player.stopVideo();
    actualVideo--;
    if(actualVideo < 0){
        actualVideo=videos.length-1;
    }
    player.loadVideoById(videos[actualVideo].videoId);
    $("#trackName").text(videos[actualVideo].youtubeName);
    player.playVideo();
});

$(document).on("click", "#nextTrack", function(event){
    player.stopVideo();
    actualVideo++;
    if(actualVideo > videos.length){
        actualVideo=0;
    }
    player.loadVideoById(videos[actualVideo].videoId);
    $("#trackName").text(videos[actualVideo].youtubeName);
    player.playVideo();
});

$(document).on("click", "#logout-button", function(event){
    const url = 'https://www.spotify.com/logout/'                                                                                                                                                                                                                                                                               
    const spotifyLogoutWindow = window.open(url, 'Spotify Logout', 'width=700,height=500,top=40,left=40')                                                                                                
    setTimeout(function(){ spotifyLogoutWindow.close();window.location.href = 'index.html';}, 2000);
});

$(document).ready(function () {
    $(window).scroll(function () {
        var sbar = $(window).scrollTop();
        var position = sbar * 0.7;
        $(".parallax").css({
            "background-position": "0 -" + position + "px"
        });
    });
    tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    $("#player").hide();
    $('.sidenav').sidenav();
    $('#slide_out_1').sidenav({ edge: 'left' });
    $('#slide_out_2').sidenav({ edge: 'right' });
    carousel();
});