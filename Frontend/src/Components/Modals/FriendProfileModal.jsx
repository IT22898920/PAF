import React, { useEffect, useState } from "react";
import {
  Modal,
  Tabs,
  Avatar,
  Row,
  Col,
  Button,
  message,
  Typography,
  Divider,
  Card,
  Skeleton,
  Badge,
  Empty,
  Spin,
  Tooltip,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import axios from "axios";
import { BASE_URL } from "../../constants";
import FriendsPost from "../Community/FriendsPost";
import LearningProgressCard from "../Community/LearningProgressCard";
import SkillShareCard from "../Community/SkillShareCard";
import UserConnectionService from "../../Services/UserConnectionService";
import {
  UserAddOutlined,
  UserDeleteOutlined,
  MailOutlined,
  GlobalOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  CloseOutlined,
  WarningOutlined,
  LockOutlined,
  HeartOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

// Premium color palette
const themeColors = {
  primary: "#4361EE",
  primaryDark: "#3A56D4",
  primaryLight: "#EEF2FF",
  primaryGlow: "rgba(67, 97, 238, 0.15)",
  secondary: "#7209B7",
  secondaryLight: "#F4EBFF",
  accent: "#4CC9F0",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceHover: "#F1F5F9",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textLight: "#94A3B8",
  border: "rgba(226, 232, 240, 0.8)",
  borderActive: "rgba(67, 97, 238, 0.5)",
  shadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
  shadowHover: "0 12px 24px rgba(67, 97, 238, 0.15)",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

const FriendProfileModal = () => {
  const snap = useSnapshot(state);
  const [userData, setUserData] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [stats, setStats] = useState({
    posts: 0,
    learningProgress: 0,
    skillShares: 0,
    friends: Math.floor(Math.random() * 150) + 10,
  });
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    fetchUserData();
    checkFriendshipStatus();
  }, [snap.selectedUserProfile]);

  useEffect(() => {
    // Update statistics whenever the related data changes
    if (snap.posts && snap.LearningProgresss && snap.SkillShares) {
      setStats({
        posts: snap.posts.filter(
          (post) => post.userId === snap.selectedUserProfile?.id
        ).length,
        learningProgress: snap.LearningProgresss.filter(
          (plan) => plan.userId === snap.selectedUserProfile?.id
        ).length,
        skillShares: snap.SkillShares.filter(
          (plan) => plan.userId === snap.selectedUserProfile?.id
        ).length,
        friends: stats.friends, // Keep the random value
      });
    }
  }, [snap.posts, snap.LearningProgresss, snap.SkillShares]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const res = await axios.get(
        `${BASE_URL}/users/${snap.selectedUserProfile?.userId}`,
        config
      );
      setUserData({ ...res.data, ...snap.selectedUserProfile });
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!snap.currentUser?.uid || !snap.selectedUserProfile?.id) return;

    try {
      const connections = await UserConnectionService.getUserConnections(
        snap.currentUser?.uid
      );
      if (
        connections &&
        connections.friendIds &&
        connections.friendIds.includes(snap.selectedUserProfile.id)
      ) {
        setIsFriend(true);
      } else {
        setIsFriend(false);
      }
    } catch (error) {
      console.error("Error checking friendship status:", error);
    }
  };

  const addFriend = async () => {
    if (isFriend) {
      message.warning("You are already friends with this user.");
      return;
    }

    setAddFriendLoading(true);
    setConnectionError(false);

    try {
      const body = {
        userId: snap.currentUser?.uid,
        friendIds: [snap.selectedUserProfile?.id],
      };
      await UserConnectionService.createUserConnection(body);
      message.success({
        content: "Friend added successfully!",
        icon: <HeartOutlined style={{ color: themeColors.accent }} />,
      });
      setIsFriend(true);
    } catch (error) {
      console.error("Error adding friend:", error);
      setConnectionError(true);
      message.error({
        content: "Failed to add friend. Please try again later.",
        icon: <WarningOutlined style={{ color: themeColors.danger }} />,
      });
    } finally {
      setAddFriendLoading(false);
    }
  };

  const unfriendFriend = async () => {
    setAddFriendLoading(true);
    setConnectionError(false);

    try {
      await UserConnectionService.deleteUserConnection(
        snap.currentUser?.uid,
        snap.selectedUserProfile?.id
      );
      setIsFriend(false);
      message.success({
        content: "Friend removed successfully",
        icon: <TeamOutlined style={{ color: themeColors.info }} />,
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      setConnectionError(true);
      message.error({
        content: "Failed to remove friend. Please try again later.",
        icon: <WarningOutlined style={{ color: themeColors.danger }} />,
      });
    } finally {
      setAddFriendLoading(false);
    }
  };

  const ConnectionErrorHelp = () =>
    connectionError && (
      <Card
        style={{
          marginTop: 16,
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          border: `1px solid ${themeColors.danger}`,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <WarningOutlined
            style={{ color: themeColors.danger, fontSize: 20, marginTop: 3 }}
          />
          <div>
            <Text
              strong
              style={{
                color: themeColors.danger,
                display: "block",
                marginBottom: 4,
              }}
            >
              Connection Issue Detected
            </Text>
            <Text style={{ color: themeColors.textSecondary }}>
              There seems to be a problem with our friend connection service.
              Our team has been notified and is working to resolve this issue.
              Please try again later.
            </Text>
          </div>
        </div>
      </Card>
    );

  const renderProfileHeader = () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: 32 }}>
          <Skeleton avatar={{ size: 100 }} active paragraph={{ rows: 3 }} />
        </div>
      );
    }

    if (error) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="danger">{error}</Text>}
        >
          <Button type="primary" onClick={fetchUserData}>
            Retry
          </Button>
        </Empty>
      );
    }

    return (
      <div
        style={{
          background: `linear-gradient(to bottom, ${themeColors.primaryLight}, ${themeColors.surface})`,
          borderRadius: 12,
          padding: "40px 32px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative elements */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(67, 97, 238, 0.08) 0%, rgba(67, 97, 238, 0) 70%)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(114, 9, 183, 0.08) 0%, rgba(114, 9, 183, 0) 70%)",
            zIndex: 0,
          }}
        />

        <Row gutter={[32, 24]} align="middle">
          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Avatar
                size={120}
                src={userData?.image}
                style={{
                  border: `4px solid ${themeColors.surface}`,
                  boxShadow: "0 8px 24px rgba(67, 97, 238, 0.15)",
                }}
              />
              {userData?.online && (
                <Badge
                  status="success"
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    width: 16,
                    height: 16,
                    border: `2px solid ${themeColors.surface}`,
                  }}
                />
              )}
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Title
              level={2}
              style={{
                margin: 0,
                color: themeColors.textPrimary,
                position: "relative",
                zIndex: 1,
              }}
            >
              {userData?.username || "User"}
              {!userData?.profileVisibility && (
                <LockOutlined
                  style={{
                    marginLeft: 8,
                    fontSize: 18,
                    color: themeColors.textSecondary,
                    verticalAlign: "middle",
                  }}
                />
              )}
            </Title>

            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <Text
                style={{
                  color: themeColors.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CalendarOutlined /> Joined {new Date().getFullYear()}
              </Text>

              <Text
                style={{
                  color: themeColors.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {userData?.profileVisibility ? (
                  <>
                    <GlobalOutlined /> Public Profile
                  </>
                ) : (
                  <>
                    <LockOutlined /> Private Profile
                  </>
                )}
              </Text>
            </div>

            <Paragraph
              style={{
                margin: "16px 0",
                color: themeColors.textPrimary,
                fontSize: 16,
                lineHeight: 1.6,
                position: "relative",
                zIndex: 1,
              }}
            >
              {userData?.biography || "No biography available"}
            </Paragraph>

            <div style={{ marginTop: 20 }}>
              {snap.selectedUserProfile?.id !== snap.currentUser?.uid ? (
                <div style={{ display: "flex", gap: 12 }}>
                  {isFriend ? (
                    <Button
                      danger
                      icon={<UserDeleteOutlined />}
                      onClick={unfriendFriend}
                      loading={addFriendLoading}
                      style={{
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 500,
                        boxShadow: "0 2px 6px rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      Remove Friend
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      loading={addFriendLoading}
                      onClick={addFriend}
                      style={{
                        background: themeColors.primary,
                        borderColor: themeColors.primary,
                        borderRadius: 8,
                        height: 40,
                        fontWeight: 500,
                        boxShadow: "0 4px 12px rgba(67, 97, 238, 0.2)",
                      }}
                    >
                      Add Friend
                    </Button>
                  )}

                  <Button
                    icon={<MailOutlined />}
                    style={{
                      borderRadius: 8,
                      height: 40,
                      fontWeight: 500,
                    }}
                  >
                    Message
                  </Button>
                </div>
              ) : (
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  style={{
                    background: themeColors.secondary,
                    borderColor: themeColors.secondary,
                    borderRadius: 8,
                    height: 40,
                    fontWeight: 500,
                  }}
                  onClick={() => {
                    state.friendProfileModalOpened = false;
                    // Add logic to navigate to profile edit page
                  }}
                >
                  Edit My Profile
                </Button>
              )}
            </div>
          </Col>
        </Row>

        <ConnectionErrorHelp />

        <Row gutter={24} style={{ marginTop: 32 }}>
          <Col span={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(67, 97, 238, 0.08)",
                border: `1px solid ${themeColors.borderActive}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  activeTab === "1"
                    ? themeColors.primaryLight
                    : themeColors.surface,
              }}
              bodyStyle={{ padding: "16px 12px" }}
              onClick={() => setActiveTab("1")}
              hoverable
            >
              <div
                style={{
                  fontSize: 24,
                  color: themeColors.primary,
                  fontWeight: 700,
                }}
              >
                {stats.posts}
              </div>
              <div style={{ fontSize: 14, color: themeColors.textSecondary }}>
                Posts
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(67, 97, 238, 0.08)",
                border: `1px solid ${themeColors.borderActive}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  activeTab === "2"
                    ? themeColors.primaryLight
                    : themeColors.surface,
              }}
              bodyStyle={{ padding: "16px 12px" }}
              onClick={() => setActiveTab("2")}
              hoverable
            >
              <div
                style={{
                  fontSize: 24,
                  color: themeColors.primary,
                  fontWeight: 700,
                }}
              >
                {stats.learningProgress}
              </div>
              <div style={{ fontSize: 14, color: themeColors.textSecondary }}>
                Learning Progress
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(67, 97, 238, 0.08)",
                border: `1px solid ${themeColors.borderActive}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  activeTab === "3"
                    ? themeColors.primaryLight
                    : themeColors.surface,
              }}
              bodyStyle={{ padding: "16px 12px" }}
              onClick={() => setActiveTab("3")}
              hoverable
            >
              <div
                style={{
                  fontSize: 24,
                  color: themeColors.primary,
                  fontWeight: 700,
                }}
              >
                {stats.skillShares}
              </div>
              <div style={{ fontSize: 14, color: themeColors.textSecondary }}>
                Skill Shares
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{
                textAlign: "center",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(67, 97, 238, 0.08)",
                border: `1px solid ${themeColors.borderActive}`,
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: themeColors.surface,
              }}
              bodyStyle={{ padding: "16px 12px" }}
              hoverable
            >
              <div
                style={{
                  fontSize: 24,
                  color: themeColors.primary,
                  fontWeight: 700,
                }}
              >
                {stats.friends}
              </div>
              <div style={{ fontSize: 14, color: themeColors.textSecondary }}>
                Friends
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  const tabItems = [
    {
      key: "1",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarOutlined />
          Posts
        </span>
      ),
      children: (
        <div style={{ minHeight: 300 }}>
          <Row gutter={[24, 24]}>
            {snap.posts
              .filter((post) => post.userId === snap.selectedUserProfile?.id)
              .map((post) => (
                <Col key={post.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    style={{
                      overflow: "hidden",
                      borderRadius: 12,
                      height: 240,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    }}
                    cover={
                      <div style={{ height: 180, overflow: "hidden" }}>
                        <img
                          alt="post"
                          src={post.mediaLink}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      </div>
                    }
                    bodyStyle={{ padding: "12px 16px" }}
                  >
                    <Tooltip title="View post details">
                      <Text ellipsis style={{ fontWeight: 500 }}>
                        {post.title ||
                          post.contentDescription?.substring(0, 30) ||
                          "Untitled Post"}
                      </Text>
                    </Tooltip>
                  </Card>
                </Col>
              ))}
            {snap.posts.filter(
              (post) => post.userId === snap.selectedUserProfile?.id
            ).length === 0 && (
              <Col span={24}>
                <Empty description="No posts to display" />
              </Col>
            )}
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BookOutlined />
          Learning Progress
        </span>
      ),
      children: (
        <div style={{ minHeight: 300 }}>
          <Row gutter={[24, 24]}>
            {snap.LearningProgresss.filter(
              (plan) => plan.userId === snap.selectedUserProfile?.id
            ).map((plan) => (
              <Col key={plan.id} xs={24} sm={12} md={8} lg={6}>
                <LearningProgressCard plan={plan} />
              </Col>
            ))}
            {snap.LearningProgresss.filter(
              (plan) => plan.userId === snap.selectedUserProfile?.id
            ).length === 0 && (
              <Col span={24}>
                <Empty description="No learning progress to display" />
              </Col>
            )}
          </Row>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrophyOutlined />
          Skill Shares
        </span>
      ),
      children: (
        <div style={{ minHeight: 300 }}>
          <Row gutter={[24, 24]}>
            {snap.SkillShares.filter(
              (plan) => plan.userId === snap.selectedUserProfile?.id
            ).map((plan) => (
              <Col key={plan.id} xs={24} sm={12} md={8} lg={6}>
                <SkillShareCard plan={plan} />
              </Col>
            ))}
            {snap.SkillShares.filter(
              (plan) => plan.userId === snap.selectedUserProfile?.id
            ).length === 0 && (
              <Col span={24}>
                <Empty description="No skill shares to display" />
              </Col>
            )}
          </Row>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={snap.friendProfileModalOpened}
      onCancel={() => {
        state.friendProfileModalOpened = false;
      }}
      width={1200}
      footer={null}
      centered
      closeIcon={
        <Button
          type="text"
          icon={<CloseOutlined />}
          style={{ color: themeColors.textSecondary }}
        />
      }
      bodyStyle={{ padding: 24 }}
      style={{ borderRadius: 16 }}
    >
      {renderProfileHeader()}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          marginTop: 16,
          backgroundColor: themeColors.surface,
          padding: 16,
          borderRadius: 12,
          boxShadow: themeColors.shadow,
        }}
        items={tabItems}
      />
    </Modal>
  );
};

export default FriendProfileModal;
