let listOfVideos = document.getElementById("listOfRequests");
const SUPER_USER_ID = "5991";

const state = {
  sortBy: "newFirst",
  searchTerm: "",
  filterBy: "all",
  userId: "",
  isSuperUser: false,
};

function getSingleVideo(videoInfo, isPrepend = false) {
  let videoContainerElm = document.createElement("div");
  videoContainerElm.innerHTML = `
    <div class="card mb-3">
  ${
    state.isSuperUser
      ? `<div class="card-header d-flex justify-content-between">
        <select name="" id="admin_change_status_${videoInfo._id}">
          <option value="new">new</option>
          <option value="planned">planned</option>
          <option value="done">done</option>
        </select>
        <div class="input-group ml-2 mr-5 ${
          videoInfo.status !== "done" ? "d-none" : ""
        }" id="admin_video_res_container_${videoInfo._id}">
          <input
            type="text"
            class="form-control"
            placeholder="paste here youtube video id"
            name=""
            id="admin_video_res_${videoInfo._id}"
          />
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="admin_save_video_res_${
              videoInfo._id
            }">
              Save
            </button>
          </div>
        </div>
        <button class="btn btn-danger" id="admin_delete_video_req_${
          videoInfo._id
        }">delete</button>
</div>`
      : ""
  }
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
   ${
     videoInfo.status === "done"
       ? `<div class="ml-auto mr-3">
      <iframe src="https://www.youtube.com/embed/${videoInfo.video_ref.link}" frameborder="0" allowfullscreen></iframe>
    </div>`
       : ""
   }
      <div class="d-flex flex-column text-center">
        <a id="votes_ups_${videoInfo._id}" class="btn btn-link">🔺</a>
        <h3 id="score_vote_${videoInfo._id}">${
    videoInfo.votes.ups.length - videoInfo.votes.downs.length
  }</h3>
        <a id="votes_downs_${videoInfo._id}" class="btn btn-link">🔻</a>
      </div>
    </div>
    <div class="card-footer d-flex flex-row justify-content-between">
      <div class="${
        videoInfo.status === "done"
          ? "text-success"
          : videoInfo.status === "planned"
          ? "text-primary"
          : ""
      }">
        <span>${videoInfo.status.toUpperCase()} ${
    videoInfo.status === "done"
      ? ` on ${new Date(videoInfo.video_ref.data).toLocaleDateString()}`
      : ""
  }</span>
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

  const adminChangeStatusElm = document.getElementById(
    `admin_change_status_${videoInfo._id}`
  );
  const adminVideoResElm = document.getElementById(
    `admin_video_res_${videoInfo._id}`
  );
  const adminVideoResContainer = document.getElementById(
    `admin_video_res_container_${videoInfo._id}`
  );
  const adminSaveVideoResElm = document.getElementById(
    `admin_save_video_res_${videoInfo._id}`
  );
  const adminDeleteVideoReqElm = document.getElementById(
    `admin_delete_video_req_${videoInfo._id}`
  );
  if (state.isSuperUser) {
    adminChangeStatusElm.value = videoInfo.status;
    adminVideoResElm.value = videoInfo.video_ref.link;

    adminChangeStatusElm.addEventListener("change", function (e) {
      if (e.target.value === "done") {
        adminVideoResContainer.classList.remove("d-none");
      } else {
        updateVideoStatus(videoInfo._id, e.target.value);
      }
    });

    adminSaveVideoResElm.addEventListener("click", (e) => {
      e.preventDefault();
      if (!adminVideoResElm.value) {
        adminVideoResElm.classList.add("is-invalid");
        adminVideoResElm.addEventListener("input", () => {
          adminVideoResElm.classList.remove("is-invalid");
        });
        return;
      }
      updateVideoStatus(videoInfo._id, "done", adminVideoResElm.value);
    });

    adminDeleteVideoReqElm.addEventListener("click", (e) => {
      e.preventDefault();

      const isSure = confirm(
        `Are you sure you want to delete ${videoInfo.topic_title}`
      );
      if (!isSure) return;

      fetch("http://localhost:7777/video-request", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: videoInfo._id }),
      })
        .then((bolb) => bolb.json())
        .then((data) => {
          window.location.reload();
        });
    });
  }
  applyVoteStyle(videoInfo._id, videoInfo.votes, videoInfo.status === "done");

  const scoreVoteElm = document.getElementById(`score_vote_${videoInfo._id}`);
  const votesElms = document.querySelectorAll(
    `[id^=votes_][id$=_${videoInfo._id}]`
  );

  votesElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      if (state.isSuperUser || videoInfo.status === "done") return;
      const [, vote_type, id] = e.target.getAttribute("id").split("_");

      fetch("http://localhost:7777/video-request/vote", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, vote_type, user_id: state.userId }),
      })
        .then((bolb) => bolb.json())
        .then((data) => {
          scoreVoteElm.innerText = data.ups.length - data.downs.length;
          applyVoteStyle(id, data, videoInfo.status === "done", vote_type);
        });
    });
  });
}

function updateVideoStatus(id, status, resVideo = "") {
  fetch("http://localhost:7777/video-request", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      status,
      resVideo,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      window.location.reload();
    });
}

function loadAllVidReqs(
  sortBy = "newFirst",
  searchTerm = "",
  filterBy = "all"
) {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}&filterBy=${filterBy}`
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
  const topic = formData.get("topic_title");
  const topicDetails = formData.get("topic_details");

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

function applyVoteStyle(video_id, votes_list, isDisabled, vote_type) {
  const voteUpsElm = document.getElementById(`votes_ups_${video_id}`);
  const voteDownsElm = document.getElementById(`votes_downs_${video_id}`);

  if (isDisabled) {
    voteUpsElm.style.opacity = 0.5;
    voteUpsElm.style.cursor = "not-allowed";
    voteDownsElm.style.opacity = 0.5;
    voteDownsElm.style.cursor = "not-allowed";

    return;
  }

  if (!vote_type) {
    if (votes_list.ups.includes(state.userId)) {
      vote_type = "ups";
    } else if (votes_list.downs.includes(state.userId)) {
      vote_type = "downs";
    } else {
      return;
    }
  }

  const voteDirElm = vote_type === "ups" ? voteUpsElm : voteDownsElm;
  const otherDirElm = vote_type === "ups" ? voteDownsElm : voteUpsElm;

  if (votes_list[vote_type].includes(state.userId)) {
    voteDirElm.style.opacity = 1;
    otherDirElm.style.opacity = 0.5;
  } else {
    otherDirElm.style.opacity = 1;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  let formVideoReq = document.getElementById("formVideoReq");
  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  const searchBoxElm = document.getElementById("search_box");
  const filterByElms = document.querySelectorAll("[id^=filter_by_]");

  const loginFormElm = document.querySelector(".login-form");
  const appContentElm = document.querySelector(".app-content");
  if (window.location.search) {
    state.userId = new URLSearchParams(window.location.search).get("id");

    if (state.userId === SUPER_USER_ID) {
      state.isSuperUser = true;
      document.querySelector(".normal-user-content").classList.add("d-none");
    }

    loginFormElm.classList.add("d-none");
    appContentElm.classList.remove("d-none");
  }

  loadAllVidReqs();

  filterByElms.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      state.filterBy = e.target.getAttribute("id").split("_")[2];
      filterByElms.forEach((option) => option.classList.remove("active"));
      this.classList.add("active");
      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
    });
  });

  sortByElms.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      state.sortBy = element.value;

      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);

      element.parentNode.classList.add("active");
      if (state.sortBy === "topVotedFirst") {
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
      state.searchTerm = e.target.value;
      loadAllVidReqs(state.sortBy, state.searchTerm, state.filterBy);
    }, 300)
  );

  formVideoReq.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(formVideoReq);
    formData.append("author_id", state.userId);

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
