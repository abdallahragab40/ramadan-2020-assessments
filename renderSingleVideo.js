import { applyVoteStyle } from "./applyVoteStyles.js";
import dataService from "./dataService.js";

let listOfVideos = document.getElementById("listOfRequests");

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function adminDOM(id, status) {
  return `<div class="card-header d-flex justify-content-between">
  <select name="" id="admin_change_status_${id}">
    <option value="new">new</option>
    <option value="planned">planned</option>
    <option value="done">done</option>
  </select>
  <div class="input-group ml-2 mr-5 ${
    status !== "done" ? "d-none" : ""
  }" id="admin_video_res_container_${id}">
    <input
      type="text"
      class="form-control"
      placeholder="paste here youtube video id"
      name=""
      id="admin_video_res_${id}"
    />
    <div class="input-group-append">
      <button class="btn btn-outline-secondary" type="button" id="admin_save_video_res_${id}">
        Save
      </button>
    </div>
  </div>
  <button class="btn btn-danger" id="admin_delete_video_req_${id}">delete</button>
</div>`;
}

function bindAdminActions(id, title, state, videoRef, status) {
  const adminChangeStatusElm = document.getElementById(
    `admin_change_status_${id}`
  );
  const adminVideoResElm = document.getElementById(`admin_video_res_${id}`);
  const adminVideoResContainer = document.getElementById(
    `admin_video_res_container_${id}`
  );
  const adminSaveVideoResElm = document.getElementById(
    `admin_save_video_res_${id}`
  );
  const adminDeleteVideoReqElm = document.getElementById(
    `admin_delete_video_req_${id}`
  );
  if (state.isSuperUser) {
    adminChangeStatusElm.value = status;
    adminVideoResElm.value = videoRef.link;

    adminChangeStatusElm.addEventListener("change", function (e) {
      if (e.target.value === "done") {
        adminVideoResContainer.classList.remove("d-none");
      } else {
        dataService.updateVideoStatus(id, e.target.value);
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
      dataService.updateVideoStatus(id, "done", adminVideoResElm.value);
    });

    adminDeleteVideoReqElm.addEventListener("click", (e) => {
      e.preventDefault();

      const isSure = confirm(`Are you sure you want to delete ${title}`);
      if (!isSure) return;
      dataService.deleteVidReq(id).then((_) => {
        window.location.reload();
      });
    });
  }
}

function bindVotesActions(id, status, state) {
  const scoreVoteElm = document.getElementById(`score_vote_${id}`);
  const votesElms = document.querySelectorAll(`[id^=votes_][id$=_${id}]`);

  votesElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();
      if (state.isSuperUser || status === "done") return;
      const [, vote_type, id] = e.target.getAttribute("id").split("_");
      dataService.updataVotes(id, vote_type, state.userId).then((data) => {
        scoreVoteElm.innerText = data.ups.length - data.downs.length;
        applyVoteStyle(id, data, status === "done", state, vote_type);
      });
    });
  });
}

export function renderSingleVideo(
  {
    _id: id,
    status,
    topic_title: title,
    topic_details: details,
    expected_result: expected,
    video_ref: videoRef,
    video_date: date,
    votes,
    target_level: level,
    submit_date: submitDate,
    author_name: author,
  },
  state,
  isPrepend = false
) {
  const statusClass =
    status === "done"
      ? "text-success"
      : status === "planned"
      ? "text-primary"
      : "";
  const voteScore = votes.ups.length - votes.downs.length;
  let videoContainerElm = document.createElement("div");
  videoContainerElm.innerHTML = `
      <div class="card mb-3">
    ${state.isSuperUser ? adminDOM(id, status) : ""}
      <div class="card-body d-flex justify-content-between flex-row">
        <div class="d-flex flex-column">
          <h3>${title}</h3>
          <p class="text-muted mb-2">${details}</p>
          <p class="mb-0 text-muted">
           ${expected && `<strong>Expected results:</strong> ${expected}`}
          </p>
        </div>
     ${
       status === "done"
         ? `<div class="ml-auto mr-3">
        <iframe src="https://www.youtube.com/embed/${videoRef.link}" frameborder="0" allowfullscreen></iframe>
      </div>`
         : ""
     }
        <div class="d-flex flex-column text-center">
          <a id="votes_ups_${id}" class="btn btn-link">🔺</a>
          <h3 id="score_vote_${id}">${voteScore}</h3>
          <a id="votes_downs_${id}" class="btn btn-link">🔻</a>
        </div>
      </div>
      <div class="card-footer d-flex flex-row justify-content-between">
        <div class="${statusClass}">
          <span>${status.toUpperCase()} ${
    status === "done" ? ` on ${formatDate(date)}` : ""
  }</span>
          &bullet; added by <strong>${author}</strong> on
          <strong>${formatDate(submitDate)}</strong>
        </div>
        <div
          class="d-flex justify-content-center flex-column 408ml-auto mr-2"
        >
          <div class="badge badge-success">${level}</div>
        </div>
      </div>
      </div>
      `;

  isPrepend
    ? listOfVideos.prepend(videoContainerElm)
    : listOfVideos.appendChild(videoContainerElm);

  bindAdminActions(id, title, state, videoRef, status);

  applyVoteStyle(id, votes, state, status === "done");

  bindVotesActions(id, status, state);
}
