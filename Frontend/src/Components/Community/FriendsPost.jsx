import React, { useState, useEffect } from "react";
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
  DislikeOutlined,
  CommentOutlined,
  HeartOutlined,
  HeartFilled,
  ClockCircleOutlined,
  GlobalOutlined,
  LockOutlined
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
  Tag
} from "antd";
import PostService from "../../Services/PostService";
import CommentCard from "./CommentCard";

const { Text, Title, Paragraph } = Typography;

// Enhanced theme colors for more visual depth
const themeColors = {
  primary: "#FF6B35", // Bright and inviting orange
  secondary: "#FF8F1C", // Softer tangerine for a modern touch
  accent: "#FF4500", // Fresh red-orange for highlights
  background: "#FFF5E6", // Light orangeish-white for a clean look
  surface: "#FFF0D9", // Soft light orange for surfaces
  cardBg: "#FFFFFF", // White background for cards
  textPrimary: "#1E3A5F", // Deep navy for readability
  textSecondary: "#5A7184", // Muted blue-gray for secondary text
  border: "rgba(0, 0, 0, 0.12)", // Subtle neutral border
  hover: "#FF5733", // Slightly darker orange for hover effects
  danger: "#FF4D4F", // Friendly red for warnings
  success: "#28A745", // Balanced green for success messages
  gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8F1C 100%)", // Light, engaging orange gradient
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
  const [showAllComments, setShowAllComments] = useState(false);
  
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
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
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
        border: `1px solid ${themeColors.border}`
      }}
    >
      <Menu.Item 
        onClick={updatePost} 
        key="edit"
        style={{ color: themeColors.textPrimary }}
      >
        <EditOutlined /> Edit Post
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          deletePost();
        }}
        key="delete"
        danger
        style={{ color: themeColors.danger }}
      >
        <DeleteOutlined /> Delete Post
      </Menu.Item>
    </Menu>
  );

  const deletePost = async () => {
    try {
      await PostService.deletePost(post.id);
      state.posts = await PostService.getPosts();
      message.success("Post deleted successfully");
    } catch {}
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
    } catch (error) {
    } finally {
      setCommentUploading(false);
    }
  };

  const deleteComment = async (id) => {
    try {
      setCommentDeleting(true);
      await CommentService.deleteComment(id);
      await getCommentsRelatedToPost();
    } catch (error) {
    } finally {
      setCommentDeleting(false);
    }
  };

  useEffect(() => {
    UserService.getProfileById(post.userId)
      .then((value) => {
        setUserData(value);
      })
      .catch((err) => {
        console.log(`error getting user data ${err}`);
      });
    getLikesRelatedToPost();
    getCommentsRelatedToPost();
  }, [post]);

  const getLikesRelatedToPost = async () => {
    try {
      const result = await LikeService.getLikesByPostId(post.id);
      setLikes(result);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const getCommentsRelatedToPost = async () => {
    try {
      const result = await CommentService.getCommentsByPostId(post.id);
      setComments(result);
    } catch (error) {}
  };
  
  const handleLike = async () => {
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
      } catch (error) {
      } finally {
        setCommentAdding(false);
      }
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

  const userHasLiked = likes.some((like) => like.userId === snap.currentUser?.uid);
  
  // Show only first two comments in preview
  const previewComments = comments.slice(0, 2);

  return (
    <Card 
      className=""
      style={{ 
        backgroundColor: themeColors.cardBg, 
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        border: `1px solid ${themeColors.border}`,
        position: 'relative',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
      }}
      bodyStyle={{ padding: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ padding: '20px 24px 16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12 
          }}>
            <div style={{ position: 'relative' }}>
              <Avatar 
                src={userData?.image} 
                size={48}
                style={{ 
                  cursor: 'pointer',
                  border: `2px solid ${themeColors.accent}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                }}
                onClick={() => {
                  if (userData?.profileVisibility) {
                    state.selectedUserProfile = userData;
                    state.friendProfileModalOpened = true;
                  } else {
                    message.info("Profile is locked");
                  }
                }}
              />
              {userData?.online && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 12,
                  height: 12,
                  backgroundColor: themeColors.success,
                  borderRadius: '50%',
                  border: `2px solid ${themeColors.cardBg}`
                }} />
              )}
            </div>
            
            <div>
              <Text 
                strong 
                style={{ 
                  color: themeColors.textPrimary, 
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'block'
                }}
              >
                {userData?.username}
              </Text>
              <Space size={4} style={{ marginTop: 2 }}>
                <Text style={{ 
                  color: themeColors.textSecondary, 
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <ClockCircleOutlined /> {formatTimeSince(post.createdAt)}
                </Text>
                <Tooltip title={userData?.profileVisibility ? "Public profile" : "Private profile"}>
                  <Text style={{ 
                    color: themeColors.textSecondary, 
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {userData?.profileVisibility ? <GlobalOutlined /> : <LockOutlined />}
                  </Text>
                </Tooltip>
              </Space>
            </div>
          </div>
          
          {isPostOwner() && (
            <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
              <Button 
                type="text" 
                icon={<MoreOutlined />} 
                style={{ 
                  color: themeColors.textPrimary,
                  fontSize: 20,
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </Dropdown>
          )}
        </div>

        {post.contentDescription && (
          <Paragraph style={{ 
            color: themeColors.textPrimary, 
            marginBottom: 16,
            fontSize: 15,
            lineHeight: '1.6',
            whiteSpace: 'pre-line'
          }}>
            {post.contentDescription}
          </Paragraph>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <Tag 
                color={themeColors.primary} 
                style={{ 
                  borderRadius: 16, 
                  padding: '2px 10px',
                  backgroundColor: 'rgba(31, 81, 255, 0.1)',
                  border: `1px solid ${themeColors.primary}`
                }}
                key={tag}
              >
                #{tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {post.mediaType === "image" && (
        <div style={{ 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <img
            style={{
              width: '100%',
              maxHeight: 600,
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            }}
            alt="post-media"
            src={post?.mediaLink}
          />
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <GlobalOutlined /> Public
          </div>
        </div>
      )}
      
      {post.mediaType === "video" && (
        <div style={{ position: 'relative' }}>
          <video
            style={{
              width: '100%',
              maxHeight: 600,
              objectFit: 'cover',
              borderRadius: '0'
            }}
            controls
            src={post?.mediaLink}
          />
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <GlobalOutlined /> Public
          </div>
        </div>
      )}

      <div style={{ padding: '16px 24px 20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          marginBottom: 16
        }}>
          <Button
            type={userHasLiked ? "primary" : "default"}
            icon={userHasLiked ? <HeartFilled /> : <HeartOutlined />}
            onClick={userHasLiked ? handleUnlike : handleLike}
            style={{ 
              color: userHasLiked ? 'white' : themeColors.textPrimary,
              backgroundColor: userHasLiked ? themeColors.primary : 'rgba(255, 255, 255, 0.08)',
              borderRadius: 20,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              paddingLeft: 16,
              paddingRight: 16,
              height: 36,
              transition: 'all 0.3s ease'
            }}
          >
            {userHasLiked ? 'Liked' : 'Like'}
          </Button>
          
          {/* Removed the redundant Comment button */}
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
            <Badge 
              count={likes.length} 
              style={{ 
                backgroundColor: themeColors.primary, 
                boxShadow: 'none',
                fontSize: 12
              }}
            >
              <div style={{
                backgroundColor: 'rgba(31, 81, 255, 0.1)',
                borderRadius: 16,
                padding: '2px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <HeartFilled style={{ color: themeColors.primary, fontSize: 14 }} />
                <Text style={{ color: themeColors.textPrimary, fontSize: 14 }}>Likes</Text>
              </div>
            </Badge>
            
            <Badge 
              count={comments.length} 
              style={{ 
                backgroundColor: themeColors.accent, 
                boxShadow: 'none',
                fontSize: 12
              }}
            >
              <div 
                style={{
                  backgroundColor: 'rgba(54, 215, 183, 0.1)',
                  borderRadius: 16,
                  padding: '2px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
                onClick={() => setShowCommentModal(true)}
              >
                <CommentOutlined style={{ color: themeColors.accent, fontSize: 14 }} />
                <Text style={{ color: themeColors.textPrimary, fontSize: 14 }}>Comments</Text>
              </div>
            </Badge>
          </div>
        </div>

        <Divider style={{ margin: '0 0 16px', borderColor: themeColors.border }} />
        
        {/* Preview of comments - show first two */}
        {/* {comments.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {previewComments.map(comment => (
              <div 
                key={comment.id} 
                style={{ 
                  marginBottom: 12,
                  display: 'flex',
                  gap: 12
                }}
              >
                <Avatar 
                  src={snap.currentUser?.image}
                  size={36}
                  style={{
                    border: `1px solid ${themeColors.border}`
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ backgroundColor: themeColors.surface, padding: '8px 12px', borderRadius: 12 }}>
                    <Text strong style={{ color: themeColors.textPrimary, fontSize: 14 }}>
                      {comment.user?.username || "User"}
                    </Text>
                    <Paragraph style={{ color: themeColors.textPrimary, fontSize: 14, margin: 0, marginTop: 2 }}>
                      {comment.commentText}
                    </Paragraph>
                  </div>
                  
                  <div style={{ marginTop: 4, display: 'flex', gap: 16 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 12 }}>
                      {formatTimeSince(comment.createdAt)}
                    </Text>
                    
                    {isCommentOwner(comment.userId) && (
                      <>
                        <Text 
                          style={{ 
                            color: themeColors.primary, 
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedCommentId(comment.id);
                            setEditFocused(true);
                            setShowCommentModal(true);
                          }}
                        >
                          Edit
                        </Text>
                        <Text 
                          style={{ 
                            color: themeColors.danger, 
                            fontSize: 12,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedCommentId(comment.id);
                            deleteComment(comment.id);
                          }}
                        >
                          Delete
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length > 2 && (
              <Button 
                type="link" 
                style={{ 
                  color: themeColors.primary,
                  padding: 0,
                  height: 'auto',
                  marginTop: 4
                }}
                onClick={() => setShowCommentModal(true)}
              >
                View all {comments.length} comments
              </Button>
            )}
          </div>
        )} */}
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12
        }}>
          <Avatar 
            src={snap.currentUser?.image} 
            size={36}
            style={{
              border: `1px solid ${themeColors.border}`
            }}
          />
          <Input
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onPressEnter={createComment}
            style={{ 
              backgroundColor: themeColors.surface,
              borderRadius: 20,
              color: themeColors.textPrimary,
              border: `1px solid ${themeColors.primary}`,
              height: 40,
              boxShadow: `0 0 8px rgba(31, 81, 255, 0.15)`,
              transition: 'all 0.3s ease'
            }}
            suffix={
              <Button
                type="text"
                icon={<SendOutlined />}
                disabled={!comment}
                loading={commentAdding}
                onClick={createComment}
                style={{ 
                  color: comment ? themeColors.primary : 'rgba(255, 255, 255, 0.3)'
                }}
              />
            }
          />
        </div>
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CommentOutlined style={{ color: themeColors.primary }} />
            <Title level={4} style={{ margin: 0 }}>Comments ({comments.length})</Title>
          </div>
        }
        open={showCommentModal}
        footer={null}
        onCancel={() => {
          setShowCommentModal(false);
          setEditFocused(false);
        }}
        width={600}
        bodyStyle={{ maxHeight: 500, overflow: 'auto' }}
        style={{ top: 50 }}
      >
        {comments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#8c8c8c'
          }}>
            <CommentOutlined style={{ fontSize: 32, marginBottom: 16 }} />
            <p>No comments yet. Be the first to comment!</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <Input
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ 
                  maxWidth: 300,
                  border: `1px solid ${themeColors.primary}`,
                  backgroundColor: themeColors.surface,
                  color: themeColors.textPrimary
                }}
              />
              <Button
                type="primary"
                onClick={createComment}
                loading={commentAdding}
                disabled={!comment}
              >
                Post
              </Button>
            </div>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={comment => {
              // If current user is the comment owner, show edit/delete options
              if (isCommentOwner(comment.userId)) {
                return (
                  <List.Item 
                    style={{ 
                      paddingLeft: 0,
                      paddingRight: 0,
                      borderBottom: `1px solid ${themeColors.border}`
                    }}
                    actions={editFocues && selectedCommentId === comment.id ? [] : [
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={() => {
                          setSelectedCommentId(comment.id);
                          setEditFocused(true);
                        }}
                      />
                    ]}
                  >
                    {editFocues && selectedCommentId === comment.id ? (
                      <div style={{ display: 'flex', width: '100%', gap: 12 }}>
                        <Avatar src={snap.currentUser?.image} />
                        <div style={{ flex: 1 }}>
                          <Input.TextArea
                            defaultValue={comment.commentText}
                            onChange={(e) => {
                              setUpdatingCommentId(comment.id);
                              setUpdatingCommentText(e.target.value);
                            }}
                            style={{ 
                              marginBottom: 12,
                              backgroundColor: themeColors.surface,
                              borderColor: themeColors.primary,
                              borderWidth: 1,
                              boxShadow: `0 0 8px rgba(31, 81, 255, 0.15)`,
                              color: themeColors.textPrimary
                            }}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                          />
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button
                              onClick={() => {
                                setEditFocused(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="primary"
                              icon={<EditOutlined />}
                              loading={commentUploading}
                              onClick={() => updateComment(comment.id)}
                            >
                              Update
                            </Button>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              loading={commentDeleting}
                              onClick={() => deleteComment(comment.id)}
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
                            style={{ border: `1px solid ${themeColors.border}` }}
                          />
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>{snap.currentUser?.username}</Text>
                            <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                              {formatTimeSince(comment.createdAt)}
                            </Text>
                          </div>
                        }
                        description={
                          <div>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.commentText}</Text>
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
                      borderBottom: `1px solid ${themeColors.border}`
                    }}
                    actions={[
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        loading={commentDeleting && selectedCommentId === comment.id}
                        onClick={() => {
                          setSelectedCommentId(comment.id);
                          deleteComment(comment.id);
                        }}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                        src={userData?.image}
                          style={{ border: `1px solid ${themeColors.border}` }}
                        />
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{userData?.username}</Text>
                          <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                            {formatTimeSince(comment.createdAt)}
                          </Text>
                        </div>
                      }
                      description={comment.commentText}
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
        
        <div style={{ 
          borderTop: `1px solid ${themeColors.border}`,
          padding: '16px 0 0',
          marginTop: 16,
          display: 'flex',
          gap: 12
        }}>
          <Avatar src={snap.currentUser?.image} />
          <Input.TextArea
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ 
              flex: 1,
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.textPrimary
            }}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={!comment}
            loading={commentAdding}
            onClick={createComment}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default FriendsPost;