const getSingleVideo = (videoInfo) => {
  let videoContainerElm = document.createElement("div");
  videoContainerElm.innerHTML = `
    <div class="card mb-3">
    <div class="card-body d-flex justify-content-between flex-row">
      <div class="d-flex flex-column">
        <h3>${videoInfo.topic_title}</h3>
        <p class="text-muted mb-2">${videoInfo.topic_details}</p>
        <p class="mb-0 text-muted">
          <strong>Expected results:</strong> ${videoInfo.expected_result}
        </p>
      </div>
      <div class="d-flex flex-column text-center">
        <a class="btn btn-link">🔺</a>
        <h3>0</h3>
        <a class="btn btn-link">🔻</a>
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
  return videoContainerElm;
};

document.addEventListener("DOMContentLoaded", () => {
  let formVideoReq = document.getElementById("formVideoReq");
  let listOfVideos = document.getElementById("listOfRequests");

  fetch("http://localhost:7777/video-request")
    .then((res) => res.json())
    .then((data) =>
      data.forEach((videoInfo) => {
        listOfVideos.appendChild(getSingleVideo(videoInfo));
      })
    );

  formVideoReq.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formVideoReq);

    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    }).then((data) => {
      listOfVideos.insertAdjacentElement("beforeend", getSingleVideo(data));
    });
  });
});
