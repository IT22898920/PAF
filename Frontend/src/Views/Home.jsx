import React, { useEffect } from "react";
import "../Styles/Home.css";
import Header from "../Components/Home/Header";
import UserService from "../Services/UserService";
import state from "../Utils/Store";

const Home = () => {
  useEffect(() => {
    if (localStorage.getItem("userId")) {
      UserService.getProfile()
        .then((userDataMain) => {
          state.currentUser = userDataMain;
        })
        .catch((err) => {});
    }
  }, []);
  return (
    <div>
      <Header />
    </div>
  );
};

export default Home;
