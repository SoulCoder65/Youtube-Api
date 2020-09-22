// Auth and Keys
// const api = //Enter api key;
// const client_id =//Enter your  client id
 
// const client_secret = //Enter your client_secret_key;

// Dom Elements
const card_div = document.getElementsByClassName("card-div")[0];
const signin = document.getElementById("sign-in");
const signout = document.getElementById("sign-out");
const playlist = document.getElementsByClassName("playlists")[0];
const playlist_videos = document.getElementsByClassName("videos")[0];
const channel_name = document.getElementById("channel_name");
const btn_back = document.getElementById("btn-back");

// Function for adding comma to stats of channel
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// BACK BTN FUN
const backBtnFun = () => {
  playlist_videos.innerHTML = "";
  execute();
};

btn_back.addEventListener("click", backBtnFun);
let isSignedIn = false;
function authenticate() {
  return gapi.auth2
    .getAuthInstance()
    .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
    .then(
      function () {
        isSignedIn = true;
        updateSignStatus(isSignedIn);
        console.log("Sign-in successful");
      },
      function (err) {
        console.error("Error signing in", err);
      }
    );
}
// Set APi key
function loadClient() {
  gapi.client.setApiKey(api);
  return gapi.client
    .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(
      function () {
        console.log("GAPI client loaded for API");
      },
      function (err) {
        console.error("Error loading GAPI client for API", err);
      }
    );
}
// Make sure the client is loaded and sign-in is complete before calling this method.
function execute() {
  btn_back.style.visibility = "hidden";
  let id = channel_name.value;
  return gapi.client.youtube.channels
    .list({
      part: ["snippet,contentDetails,statistics"],
      id: [id],
    })
    .then(
      function (response) {
        // Handle the results here (response.result has the parsed body).
        getData(response);
      },
      function (err) {
        console.error("Execute error", err);
      }
    );
}
gapi.load("client:auth2", function () {
  gapi.auth2.init({ client_id: client_id });
});
// Signin-End

// SignOut
signout.addEventListener("click", handlesSignOut);
function handlesSignOut() {
  isSignedIn = false;
  gapi.auth2.getAuthInstance().signOut();
  console.log("signout");
  card_div.innerHTML = "";
  playlist.innerHTML = "";
  updateSignStatus(isSignedIn);
}

// Check Signin Status
function updateSignStatus(isSigned) {
  if (isSigned) {
    signin.style.display = "none";
    signout.style.display = "inline-block";
  } else {
    signin.style.display = "inline-block";
    signout.style.display = "none";
  }
}

// CHANNEL INFO FUN
const getData = (data) => {
  console.log(data);
  const fullData = data.result.items[0];
  const id = data.result.items[0].id;
  const snippets = fullData.snippet;
  const stats = fullData.statistics;
  const country = snippets.country;
  const descr = snippets.description;
  const title = snippets.localized.title;
  const thumbnails = snippets.thumbnails.default.url;
  const subscribers = numberWithCommas(parseInt(stats.subscriberCount));
  const videos = numberWithCommas(parseInt(stats.videoCount));
  const views = numberWithCommas(parseInt(stats.viewCount));
  card_div.innerHTML = `<div class="card" >
  <img class="card-img-top img-thumbnail " style="width:25%;border:0px;margin-left:38%" src="${thumbnails}" alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${title}</h5>
    <p class="card-text">${descr}</p>
  </div>
  <ul class="list-group list-group-flush">
    <li class="list-group-item">Country:- ${country}</li>
    <li class="list-group-item">Subscribers:- ${subscribers}</li>
    <li class="list-group-item">Totals-Videos:- ${videos}</li>
    <li class="list-group-item">Totals-Views:- ${views}</li>
    <li class="list-group-item" > <a href="https://www.youtube.com/channel/${id}" target="_blank" type="button" class=" btn btn-primary mt-2 btn-block ">visit Channel</a></li>
  </ul>
</div>`;

  // Call Channel Playlists
  showChannelPlayLists();
};

// Channel Section
const showChannelPlayLists = () => {
  let id = channel_name.value;
  return gapi.client.youtube.playlists
    .list({
      part: ["snippet,contentDetails"],
      channelId: id,
      maxResults: 25,
    })
    .then(
      function (response) {
        // Handle the results here (response.result has the parsed body).
        PlayListShow(response);
      },
      function (err) {
        console.error("Execute error", err);
      }
    );
};

// Show Playlist fun
const PlayListShow = (response) => {
  playlist.innerHTML = "";
  let responseobj = JSON.parse(response.body);
  for (let i = 0; i < responseobj.items.length; i++) {
    let snippetsPlay = responseobj.items[i].snippet;
    let title = snippetsPlay.localized.title;
    let desc = snippetsPlay.localized.description;
    let published_date = snippetsPlay.publishedAt.slice(0, 10);
    let thumbnail = snippetsPlay.thumbnails.medium.url;
    let playlistId = responseobj.items[i].id;
    playlist.innerHTML += `<div class="card" style="width: 18rem;">
    <img class="card-img-top" src="${thumbnail}" alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title">${title}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${published_date}</h6>
      <p class="card-text">${desc}</p>
      <button class="btn btn-warning" onClick=playListItems('${playlistId}') >View Playlist</button>
    </div>
  </div>`;
  }
};
// Show Playlist items
const playListItems = (playID) => {
  playlist_videos.innerHTML = "";
  btn_back.style.visibility = "visible";
  playlist.innerHTML = "";
  const requestOptions = {
    playlistId: playID,
    part: "snippet",
    maxResults: 500,
  };
  const request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute((response) => {
    for (let i = 0; i < response.result.items.length; i++) {
      let data = response.result.items[i].snippet;
      let title = data.title;
      let resourceid = data.resourceId.videoId;
      let thumbnail = data.thumbnails.medium.url;
      playlist_videos.innerHTML += `<div class="card" style="width: 18rem;">
      <img class="card-img-top" src="${thumbnail}" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        
        <a target="_blank" href="https://www.youtube.com/embed/${resourceid}" class="btn btn-primary">Watch </a>
      </div>
    </div>
      `;
    }
  });
};
