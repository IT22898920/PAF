import React, { useEffect } from "react";
import "../../Styles/center_section.css";
import StoryBox from "./StoryBox";
import MyPost from "./MyPostBox";
import FriendsPost from "./FriendsPost";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import PostService from "../../Services/PostService";
import LearningProgressBox from "./LearningProgressBox";
import LearningProgressCard from "./LearningProgressCard";
import CreaetSkillShareBox from "./SkillShareBox";
import SkillShareCard from "./SkillShareCard";
import FriendsSection from "./FriendsSection";
import NotificationsDropdown from "./NotificationsDropdown"
import { Tabs, Avatar, Row, Col } from "antd";

const { TabPane } = Tabs;

const CenterSection = () => {
  const snap = useSnapshot(state);
  
  useEffect(() => {
    PostService.getPosts()
      .then((result) => {
        state.posts = result;
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
      });
  }, []);
  
  return (
    <div className="center" style={{ 
      width: "100%", 
      maxWidth: "1200px", 
      margin: "0 auto",
      padding: "0 16px"
    }}>
      <nav
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.5rem",
            fontWeight: 600,
          }}
        >
          <img style={{ maxHeight: 60 }} src="/assets/skillflow.svg" alt="logo" />
          UltimateSkills
      
        </div>
        <Avatar
          style={{ 
            cursor: "pointer", 
            border: "5px solidrgb(223, 27, 86)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}
          onClick={() => {
            state.profileModalOpend = true;
          }}
          size={60}
          src={snap.currentUser?.image}
        />
      </nav>
      
      <StoryBox />
      
      <div style={{ 
        backgroundColor: "#fff", 
        borderRadius: "8px", 
        padding: "16px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "16px"
      }}>
        <NotificationsDropdown />
        <Tabs 
          defaultActiveKey="1"
          style={{ width: "100%" }}
          tabBarStyle={{ marginBottom: "16px", fontWeight: "600" }}
        >
          <TabPane tab=" Comment & Feedback" key="1">
            <MyPost />
            <div>
              {snap.posts.map((post) => {
                return <FriendsPost key={post?.id} post={post} />;
              })}
            </div>
          </TabPane>
          
          <TabPane tab="Learning Progress Updates" key="2">
            <LearningProgressBox />
            <div>
              {snap.LearningProgresss.map((plan) => (
                <LearningProgressCard key={plan.id} plan={plan} />
              ))}
            </div>
          </TabPane>
          
          <TabPane tab="SkillShare" key="3">
            <CreaetSkillShareBox />
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
              {snap.SkillShares.map((plan) => (
                <SkillShareCard key={plan.id} plan={plan} />
              ))}
            </Row>
          </TabPane>
          
          <TabPane tab="Friends" key="4">
            <FriendsSection />
          </TabPane>
          {/* <TabPane tab="notigy" key="5">
            <NotificationsDropdown />
          </TabPane> */}
        </Tabs>
      </div>
    </div>
  );
};

export default CenterSection;