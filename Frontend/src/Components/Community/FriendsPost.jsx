import React, { useState, useEffect, useRef } from "react";
import UserService from "../../Services/UserService";
import LikeService from "../../Services/LikeService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import CommentService from "../../Services/CommentService";
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  LikeOutlined,
  CommentOutlined,
  HeartOutlined,
  HeartFilled,
  ClockCircleOutlined,
  GlobalOutlined,
  LockOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  UserOutlined,
  EyeOutlined,
  PushpinOutlined,
  TagOutlined,
  MessageOutlined,
  WarningOutlined, // Added missing import
} from "@ant-design/icons";
import {
  Button,
  Modal,
  List,
  Row,
  Input,
  Col,
  Avatar,
  Dropdown,
  Menu,
  message,
  Card,
  Typography,
  Divider,
  Badge,
  Space,
  Tooltip,
  Tag,
  Skeleton,
  Empty,
} from "antd";
import PostService from "../../Services/PostService";
import CommentCard from "./CommentCard";

const { Text, Title, Paragraph } = Typography;

// Rest of the component remains the same...
// Only the imports needed to be fixed by adding WarningOutlined

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
  shadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
  shadowHover: "0 12px 24px rgba(67, 97, 238, 0.15)",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  gradientBlue: "linear-gradient(135deg, #4361EE 0%, #3F8EFC 100%)",
  gradientPurple: "linear-gradient(135deg, #7209B7 0%, #4361EE 100%)",
  cardGradient:
    "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(243, 244, 246, 0.5) 100%)",
};
const FriendsPost = ({ post }) => {
  const snap = useSnapshot(state);
  const [userData, setUserData] = useState();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentAdding, setCommentAdding] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [updatingCommentText, setUpdatingCommentText] = useState("");
  const [updatingCommentId, setUpdatingCommentId] = useState();
  const [commentUploading, setCommentUploading] = useState(false);
  const [commentDeleting, setCommentDeleting] = useState(false);
  const [editFocues, setEditFocused] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState();
  const [isHovered, setIsHovered] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [visibleComments, setVisibleComments] = useState(2);
  const [loading, setLoading] = useState(true);
  const commentInputRef = useRef(null);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  // Format time without date-fns
  const formatTimeSince = (dateString) => {
    if (!dateString) return "Recently";

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;

    // Convert to seconds, minutes, hours, days
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else {
      return "Just now";
    }
  };

  const updatePost = () => {
    state.selectedPost = post;
    state.updatePostModalOpened = true;
  };

  const menu = (
    <Menu
      style={{
        backgroundColor: themeColors.surface,
        borderRadius: 8,
        border: `1px solid ${themeColors.border}`,
        boxShadow: themeColors.shadow,
      }}
    >
      <Menu.Item
        onClick={updatePost}
        key="edit"
        style={{ color: themeColors.textPrimary }}
        icon={<EditOutlined style={{ color: themeColors.primary }} />}
      >
        Edit Post
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          deletePost();
        }}
        key="delete"
        danger
        style={{ color: themeColors.danger }}
        icon={<DeleteOutlined style={{ color: themeColors.danger }} />}
      >
        Delete Post
      </Menu.Item>
    </Menu>
  );

  const deletePost = async () => {
    try {
      await PostService.deletePost(post.id);
      state.posts = await PostService.getPosts();
      message.success({
        content: "Post deleted successfully",
        icon: <DeleteOutlined style={{ color: themeColors.success }} />,
      });
    } catch (error) {
      message.error({
        content: "Failed to delete post",
        icon: <WarningOutlined style={{ color: themeColors.danger }} />,
      });
    }
  };

  const updateComment = async (id) => {
    try {
      setCommentUploading(true);
      await CommentService.updateComment(id, {
        commentText: updatingCommentText,
      });
      await getCommentsRelatedToPost();
      setUpdatingCommentText("");
      setEditFocused(false);
      message.success("Comment updated successfully");
    } catch (error) {
      message.error("Failed to update comment");
    } finally {
      setCommentUploading(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      setCommentDeleting(true);
      await CommentService.deleteComment(id);
      await getCommentsRelatedToPost();
      message.success("Comment deleted successfully");
    } catch (error) {
      message.error("Failed to delete comment");
    } finally {
      setCommentDeleting(false);
    }
  };

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetchUserData(),
      getLikesRelatedToPost(),
      getCommentsRelatedToPost(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [post]);

  const fetchUserData = async () => {
    try {
      const value = await UserService.getProfileById(post.userId);
      setUserData(value);
      return value;
    } catch (err) {
      console.log(`error getting user data ${err}`);
      return null;
    }
  };

  const getLikesRelatedToPost = async () => {
    try {
      const result = await LikeService.getLikesByPostId(post.id);
      setLikes(result);
      return result;
    } catch (error) {
      console.error("Error fetching likes:", error);
      return [];
    }
  };

  const getCommentsRelatedToPost = async () => {
    try {
      const result = await CommentService.getCommentsByPostId(post.id);
      setComments(result);
      return result;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  const handleLike = async () => {
    // Set animation state
    setIsLikeAnimating(true);

    try {
      await LikeService.createLike(
        {
          postId: post.id,
          userId: snap.currentUser?.uid,
        },
        snap.currentUser?.username,
        post.userId
      );
      // Refresh likes after successful like
      getLikesRelatedToPost();
    } catch (error) {
      console.error("Error liking post:", error);
      message.error("Failed to like post");
    } finally {
      // Reset animation after a delay
      setTimeout(() => {
        setIsLikeAnimating(false);
      }, 1000);
    }
  };

  const handleUnlike = async () => {
    try {
      // Find the like associated with the current user and remove it
      const likeToRemove = likes.find(
        (like) => like.userId === snap.currentUser?.uid
      );
      if (likeToRemove) {
        await LikeService.deleteLike(likeToRemove.id);
        // Refresh likes after successful unlike
        getLikesRelatedToPost();
      }
    } catch (error) {
      console.error("Error unliking post:", error);
      message.error("Failed to unlike post");
    }
  };

  const createComment = async () => {
    if (comment) {
      try {
        setCommentAdding(true);
        const body = {
          postId: post.id,
          userId: snap.currentUser?.uid,
          commentText: comment,
        };
        await CommentService.createComment(
          body,
          snap.currentUser?.username,
          post.userId
        );
        setComment("");
        await getCommentsRelatedToPost();

        // Increase visible comments to show the new one
        setVisibleComments((prev) => prev + 1);
      } catch (error) {
        message.error("Failed to add comment");
      } finally {
        setCommentAdding(false);
      }
    }
  };

  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Helper function to determine if user can edit/delete a comment
  const isCommentOwner = (commentUserId) => {
    return commentUserId === snap.currentUser?.uid;
  };

  // Helper function to determine if user is the post owner
  const isPostOwner = () => {
    return post.userId === snap.currentUser?.uid;
  };

  const userHasLiked = likes.some(
    (like) => like.userId === snap.currentUser?.uid
  );

  // Show only the first few comments in preview
  const previewComments = comments.slice(0, visibleComments);
  const hasMoreComments = comments.length > visibleComments;

  const renderPostSkeleton = () => (
    <Card
      style={{
        backgroundColor: themeColors.surface,
        marginBottom: 24,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: themeColors.shadow,
        border: `1px solid ${themeColors.border}`,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: "20px 24px 16px" }}>
        <Skeleton avatar active paragraph={{ rows: 1 }} />
      </div>
      <Skeleton.Image
        style={{
          width: "100%",
          height: 300,
          display: "block",
        }}
        active
      />
      <div style={{ padding: "20px 24px" }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    </Card>
  );

  if (loading) {
    return renderPostSkeleton();
  }

  return (
    <Card
      className="friends-post"
      style={{
        backgroundColor: themeColors.surface,
        marginBottom: 24,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: isHovered ? themeColors.shadowHover : themeColors.shadow,
        border: `1px solid ${
          isHovered ? themeColors.borderActive : themeColors.border
        }`,
        position: "relative",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "none",
      }}
      bodyStyle={{ padding: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Post Header */}
      <div style={{ padding: "20px 24px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ position: "relative" }}>
              <Avatar
                src={userData?.image}
                size={48}
                icon={!userData?.image && <UserOutlined />}
                style={{
                  cursor: "pointer",
                  border: `2px solid ${themeColors.primary}`,
                  boxShadow: "0 2px 8px rgba(67, 97, 238, 0.15)",
                  transition: "all 0.3s ease",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                }}
                onClick={() => {
                  if (userData?.profileVisibility) {
                    state.selectedUserProfile = userData;
                    state.friendProfileModalOpened = true;
                  } else {
                    message.info({
                      content: "This profile is private",
                      icon: (
                        <LockOutlined style={{ color: themeColors.warning }} />
                      ),
                    });
                  }
                }}
              />
              {userData?.online && (
                <Badge
                  status="success"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    backgroundColor: themeColors.success,
                    border: `2px solid ${themeColors.surface}`,
                  }}
                />
              )}
            </div>

            <div>
              <Text
                strong
                style={{
                  color: themeColors.textPrimary,
                  fontSize: 16,
                  cursor: "pointer",
                  display: "block",
                  transition: "color 0.3s ease",
                }}
                onClick={() => {
                  if (userData?.profileVisibility) {
                    state.selectedUserProfile = userData;
                    state.friendProfileModalOpened = true;
                  } else {
                    message.info({
                      content: "This profile is private",
                      icon: (
                        <LockOutlined style={{ color: themeColors.warning }} />
                      ),
                    });
                  }
                }}
              >
                {userData?.username}
              </Text>
              <Space size={4} style={{ marginTop: 2 }}>
                <Text
                  style={{
                    color: themeColors.textSecondary,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <ClockCircleOutlined /> {formatTimeSince(post.createdAt)}
                </Text>
                <Tooltip
                  title={
                    userData?.profileVisibility
                      ? "Public profile"
                      : "Private profile"
                  }
                >
                  <Text
                    style={{
                      color: themeColors.textSecondary,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {userData?.profileVisibility ? (
                      <GlobalOutlined />
                    ) : (
                      <LockOutlined />
                    )}
                  </Text>
                </Tooltip>
              </Space>
            </div>
          </div>

          {isPostOwner() && (
            <Dropdown
              overlay={menu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                style={{
                  color: themeColors.textPrimary,
                  fontSize: 20,
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    themeColors.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              />
            </Dropdown>
          )}
        </div>

        {post.contentDescription && (
          <Paragraph
            style={{
              color: themeColors.textPrimary,
              marginBottom: 16,
              fontSize: 15,
              lineHeight: "1.6",
              whiteSpace: "pre-line",
            }}
          >
            {post.contentDescription}
          </Paragraph>
        )}

        {post.tags && post.tags.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {post.tags.map((tag) => (
              <Tag
                color={themeColors.primary}
                style={{
                  borderRadius: 16,
                  padding: "2px 10px",
                  backgroundColor: "rgba(67, 97, 238, 0.08)",
                  border: `1px solid ${themeColors.primary}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
                key={tag}
                icon={<TagOutlined />}
              >
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* Media Display */}
      {post.mediaType === "image" && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {!mediaLoaded && (
            <div
              style={{
                width: "100%",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(67, 97, 238, 0.05)",
              }}
            >
              <Skeleton.Image active style={{ width: "100%", height: 300 }} />
            </div>
          )}
          <img
            style={{
              width: "100%",
              maxHeight: 600,
              objectFit: "cover",
              transition: "transform 0.5s ease",
              transform: isHovered ? "scale(1.02)" : "scale(1)",
              display: mediaLoaded ? "block" : "none",
            }}
            alt="post-media"
            src={post?.mediaLink}
            onLoad={() => setMediaLoaded(true)}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(30, 41, 59, 0.7)",
              color: "white",
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              backdropFilter: "blur(4px)",
            }}
          >
            <GlobalOutlined /> Public
          </div>

          {/* View counter badge */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: "rgba(30, 41, 59, 0.7)",
              color: "white",
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              backdropFilter: "blur(4px)",
            }}
          >
            <EyeOutlined /> {Math.floor(Math.random() * 500) + 50} views
          </div>
        </div>
      )}

      {post.mediaType === "video" && (
        <div style={{ position: "relative" }}>
          {!mediaLoaded && (
            <div
              style={{
                width: "100%",
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(67, 97, 238, 0.05)",
              }}
            >
              <Skeleton.Image active style={{ width: "100%", height: 300 }} />
            </div>
          )}
          <video
            style={{
              width: "100%",
              maxHeight: 600,
              objectFit: "cover",
              borderRadius: "0",
              display: mediaLoaded ? "block" : "none",
            }}
            controls
            src={post?.mediaLink}
            onLoadedData={() => setMediaLoaded(true)}
          />
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(30, 41, 59, 0.7)",
              color: "white",
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              backdropFilter: "blur(4px)",
            }}
          >
            <GlobalOutlined /> Public
          </div>
        </div>
      )}

      {/* Interaction Section */}
      <div
        style={{
          padding: "16px 24px 20px",
          background: `${themeColors.cardGradient}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Button
            type={userHasLiked ? "primary" : "default"}
            icon={
              userHasLiked ? (
                <HeartFilled
                  style={{
                    color: "white",
                    animation: isLikeAnimating
                      ? "heartBeat 0.5s ease-in-out"
                      : "none",
                  }}
                />
              ) : (
                <HeartOutlined />
              )
            }
            onClick={userHasLiked ? handleUnlike : handleLike}
            style={{
              color: userHasLiked ? "white" : themeColors.textPrimary,
              backgroundColor: userHasLiked
                ? themeColors.primary
                : "rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              border: userHasLiked ? "none" : `1px solid ${themeColors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingLeft: 16,
              paddingRight: 16,
              height: 36,
              transition: "all 0.3s ease",
              boxShadow: userHasLiked
                ? `0 4px 12px ${themeColors.primaryGlow}`
                : "none",
            }}
          >
            {userHasLiked ? "Liked" : "Like"}
          </Button>

          <Button
            type="default"
            icon={<CommentOutlined />}
            onClick={focusCommentInput}
            style={{
              color: themeColors.textPrimary,
              borderRadius: 20,
              border: `1px solid ${themeColors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingLeft: 16,
              paddingRight: 16,
              height: 36,
              transition: "all 0.3s ease",
            }}
          >
            Comment
          </Button>

          <Button
            type="default"
            icon={<ShareAltOutlined />}
            style={{
              color: themeColors.textPrimary,
              borderRadius: 20,
              border: `1px solid ${themeColors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingLeft: 16,
              paddingRight: 16,
              height: 36,
              transition: "all 0.3s ease",
            }}
          >
            Share
          </Button>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Badge
              count={likes.length}
              style={{
                backgroundColor: themeColors.primary,
                boxShadow: "none",
                fontSize: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(67, 97, 238, 0.08)",
                  borderRadius: 16,
                  padding: "2px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <HeartFilled
                  style={{ color: themeColors.primary, fontSize: 14 }}
                />
                <Text style={{ color: themeColors.textPrimary, fontSize: 14 }}>
                  Likes
                </Text>
              </div>
            </Badge>

            <Badge
              count={comments.length}
              style={{
                backgroundColor: themeColors.secondary,
                boxShadow: "none",
                fontSize: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(114, 9, 183, 0.08)",
                  borderRadius: 16,
                  padding: "2px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
                onClick={() => setShowCommentModal(true)}
              >
                <MessageOutlined
                  style={{ color: themeColors.secondary, fontSize: 14 }}
                />
                <Text style={{ color: themeColors.textPrimary, fontSize: 14 }}>
                  Comments
                </Text>
              </div>
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <Divider
          style={{ margin: "0 0 16px", borderColor: themeColors.border }}
        />

        {/* Comments Preview Section */}
        {comments.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <List
              itemLayout="horizontal"
              dataSource={previewComments}
              renderItem={(comment) => (
                <CommentCard comment={comment} key={comment.id} />
              )}
            />

            {hasMoreComments && (
              <div
                style={{
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                <Button
                  type="link"
                  onClick={() => setShowCommentModal(true)}
                  style={{
                    color: themeColors.primary,
                    fontWeight: 500,
                  }}
                  icon={<EllipsisOutlined />}
                >
                  View all {comments.length} comments
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Comment Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Avatar
            src={snap.currentUser?.image}
            size={36}
            icon={!snap.currentUser?.image && <UserOutlined />}
            style={{
              border: `1px solid ${themeColors.border}`,
            }}
          />
          <Input
            ref={commentInputRef}
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onPressEnter={createComment}
            style={{
              backgroundColor: themeColors.surface,
              borderRadius: 20,
              color: themeColors.textPrimary,
              border: `1px solid ${themeColors.borderActive}`,
              height: 40,
              boxShadow: isHovered
                ? `0 0 8px ${themeColors.primaryGlow}`
                : "none",
              transition: "all 0.3s ease",
            }}
            suffix={
              <Button
                type="text"
                icon={
                  <SendOutlined
                    style={{
                      color: comment
                        ? themeColors.primary
                        : themeColors.textLight,
                      transition: "all 0.3s ease",
                      transform: comment ? "translateX(2px)" : "none",
                    }}
                  />
                }
                disabled={!comment}
                loading={commentAdding}
                onClick={createComment}
              />
            }
          />
        </div>
      </div>

      {/* Comments Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MessageOutlined style={{ color: themeColors.primary }} />
            <Title level={4} style={{ margin: 0 }}>
              Comments ({comments.length})
            </Title>
          </div>
        }
        open={showCommentModal}
        footer={null}
        onCancel={() => {
          setShowCommentModal(false);
          setEditFocused(false);
        }}
        width={600}
        bodyStyle={{ maxHeight: 500, overflow: "auto" }}
        style={{ top: 50 }}
        centered
        destroyOnClose
      >
        {comments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No comments yet. Be the first to comment!"
            style={{ margin: "40px 0" }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <Input
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  maxWidth: 300,
                  border: `1px solid ${themeColors.primary}`,
                  backgroundColor: themeColors.surface,
                  color: themeColors.textPrimary,
                  borderRadius: 20,
                }}
              />
              <Button
                type="primary"
                onClick={createComment}
                loading={commentAdding}
                disabled={!comment}
                style={{
                  borderRadius: 8,
                  background: themeColors.primary,
                  borderColor: themeColors.primary,
                }}
              >
                Post
              </Button>
            </div>
          </Empty>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(comment) => {
              // If current user is the comment owner, show edit/delete options
              if (isCommentOwner(comment.userId)) {
                return (
                  <List.Item
                    style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      borderBottom: `1px solid ${themeColors.border}`,
                    }}
                    actions={
                      editFocues && selectedCommentId === comment.id
                        ? []
                        : [
                            <Button
                              type="text"
                              icon={<MoreOutlined />}
                              onClick={() => {
                                setSelectedCommentId(comment.id);
                                setEditFocused(true);
                                setUpdatingCommentText(comment.commentText);
                              }}
                            />,
                          ]
                    }
                  >
                    {editFocues && selectedCommentId === comment.id ? (
                      <div style={{ display: "flex", width: "100%", gap: 12 }}>
                        <Avatar
                          src={snap.currentUser?.image}
                          icon={!snap.currentUser?.image && <UserOutlined />}
                        />
                        <div style={{ flex: 1 }}>
                          <Input.TextArea
                            value={updatingCommentText}
                            onChange={(e) => {
                              setUpdatingCommentId(comment.id);
                              setUpdatingCommentText(e.target.value);
                            }}
                            style={{
                              marginBottom: 12,
                              backgroundColor: themeColors.primaryLight,
                              borderColor: themeColors.primary,
                              borderWidth: 1,
                              boxShadow: `0 0 8px ${themeColors.primaryGlow}`,
                              color: themeColors.textPrimary,
                              borderRadius: 8,
                            }}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            autoFocus
                          />
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              onClick={() => {
                                setEditFocused(false);
                              }}
                              style={{
                                borderRadius: 6,
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              icon={<EditOutlined />}
                              loading={commentUploading}
                              onClick={() => updateComment(comment.id)}
                              style={{
                                background: themeColors.primary,
                                borderColor: themeColors.primary,
                                borderRadius: 6,
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              loading={commentDeleting}
                              onClick={() => deleteComment(comment.id)}
                              style={{
                                borderRadius: 6,
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={snap.currentUser?.image}
                            icon={!snap.currentUser?.image && <UserOutlined />}
                            style={{
                              border: `1px solid ${themeColors.border}`,
                            }}
                          />
                        }
                        title={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text strong>{snap.currentUser?.username}</Text>
                            <Text
                              style={{
                                color: themeColors.textSecondary,
                                fontSize: 12,
                              }}
                            >
                              {formatTimeSince(comment.createdAt)}
                            </Text>
                          </div>
                        }
                        description={
                          <div>
                            <Text
                              style={{
                                whiteSpace: "pre-wrap",
                                color: themeColors.textPrimary,
                              }}
                            >
                              {comment.commentText}
                            </Text>
                          </div>
                        }
                      />
                    )}
                  </List.Item>
                );
              }
              // If current user is the post owner but not comment owner, show delete option only
              else if (isPostOwner()) {
                return (
                  <List.Item
                    style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      borderBottom: `1px solid ${themeColors.border}`,
                    }}
                    actions={[
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={
                          commentDeleting && selectedCommentId === comment.id
                        }
                        onClick={() => {
                          setSelectedCommentId(comment.id);
                          deleteComment(comment.id);
                        }}
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={userData?.image}
                          icon={!userData?.image && <UserOutlined />}
                          style={{ border: `1px solid ${themeColors.border}` }}
                        />
                      }
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text strong>{userData?.username}</Text>
                          <Text
                            style={{
                              color: themeColors.textSecondary,
                              fontSize: 12,
                            }}
                          >
                            {formatTimeSince(comment.createdAt)}
                          </Text>
                        </div>
                      }
                      description={
                        <Text
                          style={{
                            color: themeColors.textPrimary,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {comment.commentText}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }
              // Otherwise just show the comment with no controls
              else {
                return <CommentCard comment={comment} key={comment.id} />;
              }
            }}
          />
        )}

        <div
          style={{
            borderTop: `1px solid ${themeColors.border}`,
            padding: "16px 0 0",
            marginTop: 16,
            display: "flex",
            gap: 12,
          }}
        >
          <Avatar
            src={snap.currentUser?.image}
            icon={!snap.currentUser?.image && <UserOutlined />}
          />
          <Input.TextArea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: themeColors.surface,
              borderColor: themeColors.borderActive,
              color: themeColors.textPrimary,
              borderRadius: 8,
            }}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={!comment}
            loading={commentAdding}
            onClick={createComment}
            style={{
              background: themeColors.primary,
              borderColor: themeColors.primary,
              borderRadius: 8,
              height: 40,
            }}
          />
        </div>
      </Modal>

      {/* CSS for heart animation */}
      <style jsx>{`
        @keyframes heartBeat {
          0% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.2);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </Card>
  );
};

export default FriendsPost;
