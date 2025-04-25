import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthModal from "../Modals/AuthModal";

const Header = () => {
  const navigate = useNavigate();
  const [isAuthModalOpened, setIsAuthModalOpened] = useState(false);

  return (
    <header className="header">
      <nav>
        <div className="nav__header">
          <div className="nav__logomain">
            <Link to="#">
              <img src="/assets/skillflow.svg" alt="logo" />
              
            </Link>
          </div>
          <div className="nav__menu__btn" id="menu-btn">
            <span>
              <i className="ri-menu-line"></i>
            </span>
          </div>
        </div>
        <ul className="nav__links" id="nav-links">
          <li className="link">
            <Link to="/">Contact Us</Link>
          </li>
          <li className="link">
            <Link to="#browse-skills">Discover Skills</Link>
          </li>
          <li className="link">
          <li className="link">
            <Link
              to="/community"
              onClick={() => {
                if (!localStorage.getItem("userId")) {
                  setIsAuthModalOpened(true); // Open the authentication modal if not logged in
                }
              }}
            >
              Share Your Expertise
            </Link>
          </li>

          </li>
          <li className="link">
            <button
              onClick={() => {
                if (localStorage.getItem("userId")) {
                  navigate("/community"); // Navigate to the community page
                } else {
                  setIsAuthModalOpened(true); // Open the authentication modal
                }
              }}
              className="btn"
            >
              Join SkillFlow
            </button>
          </li>
        </ul>
      </nav>
      <div className="section__container header__container" id="home">
        <div>
          <img src="/assets/skillflowhd.svg" alt="header" />
        </div>
        <div className="header__content">
        <h4>Learn New Skills &</h4>
        <h1 className="section__header">Unlock New Skills with SkillFlow!</h1>
          <p>
            Explore a diverse range of skills, from tech to creativity, business to wellness. Join SkillFlow and connect with a vibrant community of learners and experts.
          </p>
          <div className="header__btn">
            <button
              onClick={() => {
                if (localStorage.getItem("userId")) {
                  navigate("/community"); // Navigate to the community page
                } else {
                  setIsAuthModalOpened(true); // Open the authentication modal
                }
              }}
              className="btn"
            >
              Start Learning Today
            </button>
          </div>
        </div>
      </div>
      <AuthModal
        onClose={() => {
          setIsAuthModalOpened(false);
        }}
        isOpen={isAuthModalOpened}
      />
    </header>
  );
};

export default Header;
