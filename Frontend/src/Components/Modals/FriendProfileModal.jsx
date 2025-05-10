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
    Card,
    Skeleton,
    Badge,
    Empty,
    Tooltip,
    Progress,
  } from "antd";
  import { useSnapshot } from "valtio";
  import state from "../../Utils/Store";
  import axios from "axios";
  import { BASE_URL } from "../../constants";
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
    FileTextOutlined,
    StarOutlined,
    EyeOutlined,
    LinkOutlined,
    FireOutlined,
  } from "@ant-design/icons";

  const { Title, Text, Paragraph } = Typography;

  // Enhanced color palette
  const themeColors = {
    primary: "#4361EE",
    primaryDark: "#3A56D4",
    primaryLight: "#EEF2FF",
    primaryGlow: "rgba(67, 97, 238, 0.15)",
    secondary: "#7209B7",
    secondaryLight: "#F4EBFF",
    accent: "#4CC9F0",
    accentLight: "#E6F7FE",
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
    successLight: "#ECFDF5",
    danger: "#EF4444",
    dangerLight: "#FEF2F2",
    warning: "#F59E0B",
    warningLight: "#FFFBEB",
    info: "#3B82F6",
    infoLight: "#EFF6FF",
    gradientPrimary: "linear-gradient(135deg, #4361EE, #3A56D4)",
    gradientSecondary: "linear-gradient(135deg, #7209B7, #5B0E94)",
    gradientAccent: "linear-gradient(135deg, #4CC9F0, #3DB1D5)",
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
            backgroundColor: themeColors.dangerLight,
            border: `1px solid ${themeColors.danger}`,
            borderRadius: 12,
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

    // Generate random stats for visual demo purposes
    const generateRandomStats = () => {
      const languages = ["JavaScript", "Python", "React", "Node.js", "CSS"];
      const interests = ["Web Development", "Machine Learning", "UI/UX Design", "Data Science", "Mobile Apps"];
      
      return {
        languages: languages.map(lang => ({
          name: lang,
          proficiency: Math.floor(Math.random() * 50) + 50,
        })),
        interests: interests.map(interest => ({
          name: interest,
          level: Math.floor(Math.random() * 50) + 50,
        })),
        achievements: Math.floor(Math.random() * 10) + 5,
        completedCourses: Math.floor(Math.random() * 8) + 3,
        currentStreak: Math.floor(Math.random() * 10) + 1,
        contributionPoints: (Math.floor(Math.random() * 500) + 100),
      };
    };
    
    const userStats = generateRandomStats();

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
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.12)",
            marginBottom: 24,
          }}
        >
          {/* Header Background */}
          <div
            style={{
              background: `linear-gradient(135deg, ${themeColors.primaryLight}, ${themeColors.accentLight})`,
              height: 120,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background decorative elements */}
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(67, 97, 238, 0.1) 0%, rgba(67, 97, 238, 0) 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(114, 9, 183, 0.1) 0%, rgba(114, 9, 183, 0) 70%)",
              }}
            />
          </div>

          {/* Profile Content */}
          <div style={{ padding: "0 32px 32px", backgroundColor: themeColors.surface }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: -40 }}>
              {/* Avatar and User Info */}
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ position: "relative" }}>
                  <Avatar
                    size={96}
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
                        bottom: 6,
                        right: 6,
                        width: 16,
                        height: 16,
                        border: `2px solid ${themeColors.surface}`,
                      }}
                    />
                  )}
                </div>
                
                <div style={{ paddingTop: 48 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: themeColors.textPrimary,
                      }}
                    >
                      {userData?.username || "User"}
                    </Title>
                    {!userData?.profileVisibility && (
                      <Tooltip title="Private Profile">
                        <LockOutlined
                          style={{
                            fontSize: 16,
                            color: themeColors.textSecondary,
                          }}
                        />
                      </Tooltip>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <Text
                      style={{
                        color: themeColors.textSecondary,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
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
                        fontSize: 13,
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
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: 48 }}>
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
                          height: 38,
                          fontWeight: 500,
                          boxShadow: "0 2px 6px rgba(239, 68, 68, 0.15)",
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
                          background: themeColors.gradientPrimary,
                          borderColor: themeColors.primaryDark,
                          borderRadius: 8,
                          height: 38,
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
                        height: 38,
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
                      background: themeColors.gradientSecondary,
                      borderColor: themeColors.secondary,
                      borderRadius: 8,
                      height: 38,
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
            </div>

            {/* Bio and Stats Cards */}
            <div style={{ marginTop: 24 }}>
              <Row gutter={[24, 24]}>
                {/* Bio Section */}
                <Col xs={24} md={16}>
                  <Card
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                      height: "100%",
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <Title level={5} style={{ marginTop: 0 }}>About</Title>
                    <Paragraph
                      style={{
                        color: themeColors.textPrimary,
                        fontSize: 15,
                        lineHeight: 1.6,
                      }}
                    >
                      {userData?.biography || "No biography available"}
                    </Paragraph>
                  </Card>
                </Col>

                {/* Stats Card */}
                <Col xs={24} md={8}>
                  <Card
                    style={{
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                      height: "100%",
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <Title level={5} style={{ marginTop: 0 }}>Activity Stats</Title>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>Current Streak</Text>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <FireOutlined style={{ color: themeColors.warning }} />
                          <Text strong style={{ fontSize: 15 }}>{userStats.currentStreak} days</Text>
                        </div>
                      </div>
                      <div>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>Contribution Points</Text>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <StarOutlined style={{ color: themeColors.primary }} />
                          <Text strong style={{ fontSize: 15 }}>{userStats.contributionPoints}</Text>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>Achievements</Text>
                        <Text strong style={{ fontSize: 14 }}>{userStats.achievements}</Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>Completed Courses</Text>
                        <Text strong style={{ fontSize: 14 }}>{userStats.completedCourses}</Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>Posts</Text>
                        <Text strong style={{ fontSize: 14 }}>{stats.posts}</Text>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>Friends</Text>
                        <Text strong style={{ fontSize: 14 }}>{stats.friends}</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>

            {connectionError && <ConnectionErrorHelp />}

            {/* Skills and Interests Section */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} md={12}>
                <Card
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Title level={5} style={{ marginTop: 0 }}>Top Skills</Title>
                  
                  <div style={{ marginTop: 16 }}>
                    {userStats.languages.map((lang, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <Text style={{ fontSize: 14 }}>{lang.name}</Text>
                          <Text style={{ fontSize: 14, color: themeColors.textSecondary }}>{lang.proficiency}%</Text>
                        </div>
                        <Progress 
                          percent={lang.proficiency} 
                          showInfo={false} 
                          strokeColor={themeColors.primary}
                          size="small"
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    height: "100%",
                  }}
                  bodyStyle={{ padding: 24 }}
                >
                  <Title level={5} style={{ marginTop: 0 }}>Interests</Title>
                  
                  <div style={{ marginTop: 16 }}>
                    {userStats.interests.map((interest, index) => (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <Text style={{ fontSize: 14 }}>{interest.name}</Text>
                          <Text style={{ fontSize: 14, color: themeColors.textSecondary }}>{interest.level}%</Text>
                        </div>
                        <Progress 
                          percent={interest.level} 
                          showInfo={false} 
                          strokeColor={themeColors.secondary}
                          size="small"
                          style={{ marginBottom: 0 }}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      );
    };

    // Enhanced content items for tabs
    const renderPostItem = (post) => (
      <Card
        hoverable
        style={{
          borderRadius: 12,
          overflow: "hidden",
          height: "100%",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        bodyStyle={{ padding: 16 }}
        cover={
          <div style={{ position: "relative", height: 180 }}>
            <img
              alt="post"
              src={post.mediaLink}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
                {post.title || post.contentDescription?.substring(0, 30) || "Untitled Post"}
              </Text>
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <EyeOutlined style={{ color: themeColors.textSecondary, fontSize: 14 }} />
            <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>
              {Math.floor(Math.random() * 200) + 10} views
            </Text>
          </div>
          <Button
            type="link"
            icon={<LinkOutlined />}
            style={{ padding: 0, color: themeColors.primary }}
          >
            View
          </Button>
        </div>
      </Card>
    );

    const renderLearningItem = (plan) => (
      <Card
        hoverable
        style={{
          borderRadius: 12,
          overflow: "hidden",
          height: "100%",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text strong style={{ fontSize: 16 }}>
            {plan.title || "Learning Plan"}
          </Text>
          
          <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>
            {plan.description?.substring(0, 60) || "No description available"}
            {plan.description?.length > 60 ? "..." : ""}
          </Text>
          
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: themeColors.textSecondary }}>Progress</Text>
              <Text style={{ fontSize: 13, fontWeight: 500 }}>{plan.progress || Math.floor(Math.random() * 100)}%</Text>
            </div>
            <Progress 
              percent={plan.progress || Math.floor(Math.random() * 100)} 
              showInfo={false} 
              strokeColor={themeColors.success}
              size="small"
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 13, color: themeColors.textSecondary }}>
              {plan.category || "Learning"}
            </Text>
            <Button
              type="link"
              style={{ padding: 0, color: themeColors.primary, fontSize: 14 }}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );

    const renderSkillItem = (skill) => (
      <Card
        hoverable
        style={{
          borderRadius: 12,
          overflow: "hidden",
          height: "100%",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
          borderTop: `3px solid ${themeColors.accent}`,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text strong style={{ fontSize: 16 }}>
            {skill.title || "Skill Share"}
          </Text>
          
          <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>
            {skill.description?.substring(0, 60) || "No description available"}
            {skill.description?.length > 60 ? "..." : ""}
          </Text>
          
          <div style={{ marginTop: 8 }}>
            <Badge 
              color={themeColors.info} 
              text={skill.skillLevel || "Intermediate"} 
              style={{ fontSize: 13 }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontSize: 13, color: themeColors.textSecondary }}>
              {skill.category || "Development"}
            </Text>
            <Button
              type="link"
              style={{ padding: 0, color: themeColors.primary, fontSize: 14 }}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );

    // Content for tabs
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
                  <Col key={post.id} xs={24} sm={12} md={8} lg={8}>
                    {renderPostItem(post)}
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
                <Col key={plan.id} xs={24} sm={12} md={8} lg={8}>
                  {renderLearningItem(plan)}
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
                (skill) => skill.userId === snap.selectedUserProfile?.id
              ).map((skill) => (
                <Col key={skill.id} xs={24} sm={12} md={8} lg={8}>
                  {renderSkillItem(skill)}
                </Col>
              ))}
              {snap.SkillShares.filter(
                (skill) => skill.userId === snap.selectedUserProfile?.id
              ).length === 0 && (
                <Col span={24}>
                  <Empty description="No skill shares to display" />
                </Col>
              )}
            </Row>
          </div>
        ),
      },
      {
        key: "4",
        label: (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TeamOutlined />
            Friends
          </span>
        ),
        children: (
          <div style={{ minHeight: 300, padding: "16px 0" }}>
            <Row gutter={[24, 24]}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Col key={index} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
                    }}
                    bodyStyle={{ padding: "16px 12px" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <Avatar
                        size={72}
                        src={`https://randomuser.me/api/portraits/${index % 2 === 0 ? 'women' : 'men'}/${index + 1}.jpg`}
                        style={{ border: `2px solid ${themeColors.primaryLight}` }}
                      />
                      <div style={{ textAlign: "center" }}>
                        <Text strong style={{ fontSize: 16, display: "block" }}>
                          {["Sarah Johnson", "Michael Chen", "Emma Wilson", "James Taylor", 
                            "Olivia Brown", "Noah Martinez", "Sophia Lee", "Lucas Garcia"][index]}
                        </Text>
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>
                          {["Web Designer", "Data Scientist", "UX Designer", "Frontend Developer", 
                            "Product Manager", "Backend Engineer", "Graphic Designer", "Full Stack Developer"][index]}
                        </Text>
                      </div>
                      <Button
                        type="default"
                        size="small"
                        style={{ 
                          borderRadius: 8, 
                          fontSize: 13,
                          marginTop: 4,
                          borderColor: themeColors.primary,
                          color: themeColors.primary
                        }}
                      >
                        View Profile
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
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
            padding: "16px 16px 8px",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
          }}
          items={tabItems}
        />
      </Modal>
    );
  };

  export default FriendProfileModal;