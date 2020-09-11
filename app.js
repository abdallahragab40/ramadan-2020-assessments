import { debounce } from "./debounce.js";
import { renderSingleVideo } from "./renderSingleVideo.js";
import { checkValidity } from "./checkValidity.js";
import dataService from "./dataService.js";

const SUPER_USER_ID = "5991";

export const state = {
  sortBy: "newFirst",
  searchTerm: "",
  filterBy: "all",
  userId: "",
  isSuperUser: false,
};

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

  dataService.loadAllVidReqs();

  filterByElms.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      state.filterBy = e.target.getAttribute("id").split("_")[2];
      filterByElms.forEach((option) => option.classList.remove("active"));
      this.classList.add("active");
      dataService.loadAllVidReqs(
        state.sortBy,
        state.searchTerm,
        state.filterBy
      );
    });
  });

  sortByElms.forEach(function (element) {
    element.addEventListener("click", function (e) {
      e.preventDefault();

      state.sortBy = element.value;

      dataService.loadAllVidReqs(
        state.sortBy,
        state.searchTerm,
        state.filterBy
      );

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
      dataService.loadAllVidReqs(
        state.sortBy,
        state.searchTerm,
        state.filterBy
      );
    }, 300)
  );

  formVideoReq.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(formVideoReq);
    formData.append("author_id", state.userId);

    const isValid = checkValidity(formData);
    if (!isValid) return;

    dataService.addVideoReq(formData).then((data) => {
      renderSingleVideo(data, state, true);
    });
  });
});
