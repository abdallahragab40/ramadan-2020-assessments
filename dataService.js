import { renderSingleVideo } from "./renderSingleVideo.js";
import { state } from "./app.js";
import api from "./api.js";

let listOfVideos = document.getElementById("listOfRequests");

export default {
  addVideoReq: (formData) => {
    return api.videoReq.post(formData);
  },
  updateVideoStatus: (id, status, resVideo = "") => {
    api.videoReq.update(id, status, (resVideo = "")).then((_) => {
      window.location.reload();
    });
  },
  loadAllVidReqs: (
    sortBy = "newFirst",
    searchTerm = "",
    filterBy = "all",
    localState = state
  ) => {
    api.videoReq
      .get(sortBy, searchTerm, filterBy, (localState = state))
      .then((data) => {
        listOfVideos.innerHTML = "";
        data.forEach((videoInfo) => {
          renderSingleVideo(videoInfo, localState);
        });
      });
  },
  deleteVidReq: (id) => {
    return api.videoReq.delete(id);
  },
  updataVotes: (id, vote_type, user_id) => {
    return api.votes.update({ id, vote_type, user_id });
  },
};
