let listOfVideos = document.getElementById("listOfRequests");
let sortBy = "newFirst";
let searchTerm = "";

function getSingleVideo(videoInfo, isPrepend = false) {
  let videoContainerElm = document.createElement("div");
  videoContainerElm.innerHTML = `
    <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-row">
      <div class="d-flex flex-column">
        <h3>${videoInfo.topic_title}</h3>
        <p class="text-muted mb-2">${videoInfo.topic_details}</p>
        <p class="mb-0 text-muted">
         ${
           videoInfo.expected_result &&
           `<strong>Expected results:</strong> ${videoInfo.expected_result}`
         }
        </p>
      </div>
      <div class="d-flex flex-column text-center">
        <a id="votes_ups_${videoInfo._id}" class="btn btn-link">🔺</a>
        <h3 id="score_vote_${videoInfo._id}">${
    videoInfo.votes.ups - videoInfo.votes.downs
  }</h3>
        <a id="votes_downs_${videoInfo._id}" class="btn btn-link">🔻</a>
      </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
      <div>
        <span class="text-info">${videoInfo.status.toUpperCase()}</span>
        &bullet; added by <strong>${videoInfo.author_name}</strong> on
        <strong>${new Date(videoInfo.submit_date).toLocaleDateString()}</strong>
      </div>
      <div
        class="d-flex justify-content-center flex-column 408ml-auto mr-2"
      >
        <div class="badge badge-success">${videoInfo.target_level}</div>
      </div>
    </div>
    </div>
    `;

  isPrepend
    ? listOfVideos.prepend(videoContainerElm)
    : listOfVideos.appendChild(videoContainerElm);

  const voteUpsElm = document.getElementById(`votes_ups_${videoInfo._id}`);
  const voteDownsElm = document.getElementById(`votes_downs_${videoInfo._id}`);
  const scoreVoteElm = document.getElementById(`score_vote_${videoInfo._id}`);

  voteUpsElm.addEventListener("click", (e) => {
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: videoInfo._id, vote_type: "ups" }),
    })
      .then((bolb) => bolb.json())
      .then((data) => (scoreVoteElm.innerText = data.ups - data.downs));
  });

  voteDownsElm.addEventListener("click", (e) => {
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: videoInfo._id, vote_type: "downs" }),
    })
      .then((bolb) => bolb.json())
      .then((data) => (scoreVoteElm.innerText = data.ups - data.downs));
  });
}

function loadAllVidReqs(sortBy = "newFirst", searchTerm = "") {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((res) => res.json())
    .then((data) => {
      listOfVideos.innerHTML = "";
      data.forEach((videoInfo) => {
        getSingleVideo(videoInfo);
      });
    });
}

function checkValidity(formData) {
  const name = formData.get("author_name");
  const email = formData.get("author_email");
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");

  if (!name) {
    document.querySelector("[name=author_name]").classList.add("is-invalid");
  }

  const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!email || !emailPattern.test(email)) {
    document.querySelector("[name=author_email]").classList.add("is-invalid");
  }

  if (!topic || topic.length > 30) {
    document.querySelector("[name=topic_title]").classList.add("is-invalid");
  }

  if (!topicDetails) {
    document.querySelector("[name=topic_details]").classList.add("is-invalid");
  }

  const allInvalidElms = document
    .querySelector("#formVideoReq")
    .querySelectorAll(".is-invalid");

  if (allInvalidElms.length) {
    allInvalidElms.forEach((elm) => {
      elm.addEventListener("input", function () {
        this.classList.remove("is-invalid");
      });
    });
    return false;
  }

  return true;
}

function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}

document.addEventListener("DOMContentLoaded", function () {
  let formVideoReq = document.getElementById("formVideoReq");
  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  const searchBoxElm = document.getElementById("search_box");

  loadAllVidReqs();

  sortByElms.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      sortBy = element.value;

      loadAllVidReqs(sortBy, searchTerm);

      element.parentNode.classList.add("active");
      if (sortBy === "topVotedFirst") {
        document
          .getElementById("sort_by_new")
          .parentNode.classList.remove("active");
      } else {
        document
          .getElementById("sort_by_top")
          .parentNode.classList.remove("active");
      }
    });
  });

  searchBoxElm.addEventListener(
    "input",
    debounce((e) => {
      searchTerm = e.target.value;
      loadAllVidReqs(sortBy, searchTerm);
    }, 300)
  );

  formVideoReq.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(formVideoReq);

    const isValid = checkValidity(formData);
    if (!isValid) return;

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((bolb) => bolb.json())
      .then((data) => {
        getSingleVideo(data, true);
      });
  });
});
