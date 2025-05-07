import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Space,
  Typography,
  Divider,
  Tag,
  Radio,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import {
  UploadOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TagsOutlined,
  InfoCircleOutlined,
  PushpinOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import PostService from "../../Services/PostService";

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
};

const { Title, Text, Paragraph } = Typography;
const uploader = new UploadFileService();

const CreatePostModal = () => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileType, setFileType] = useState("image");
  const [image, setImage] = useState("");
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [filePreview, setFilePreview] = useState(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const body = {
        ...values,
        mediaLink: image,
        userId: snap.currentUser?.uid,
        mediaType: fileType,
        tags: tags,
        createdAt: new Date().toISOString(),
      };
      await PostService.createPost(body);
      state.posts = await PostService.getPosts();
      message.success({
        content: "Post created successfully",
        icon: <CheckCircleOutlined style={{ color: themeColors.success }} />,
      });
      state.createPostModalOpened = false;
      form.resetFields();
      setImage("");
      setTags([]);
      setFilePreview(null);
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error({
        content: "Failed to create post. Please try again.",
        icon: (
          <ExclamationCircleOutlined style={{ color: themeColors.danger }} />
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (info) => {
    if (info.file) {
      try {
        setImageUploading(true);
        const file = info.fileList[0].originFileObj;

        // Create a preview URL
        const previewURL = URL.createObjectURL(file);
        setFilePreview(previewURL);

        const type = file.type.split("/")[0];
        setFileType(type);

        const url = await uploader.uploadFile(file, "posts");
        setImage(url);
        form.setFieldsValue({ mediaLink: url });

        message.success({
          content: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } uploaded successfully`,
          icon: <CheckCircleOutlined style={{ color: themeColors.success }} />,
          duration: 2,
        });
      } catch (error) {
        message.error({
          content: "Upload failed. Please try again.",
          icon: (
            <ExclamationCircleOutlined style={{ color: themeColors.danger }} />
          ),
        });
        console.error("Upload error:", error);
      } finally {
        setImageUploading(false);
      }
    } else if (info.file.status === "removed") {
      setImage("");
      setFilePreview(null);
      form.setFieldsValue({ mediaLink: "" });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImage("");
    setTags([]);
    setFilePreview(null);
    state.createPostModalOpened = false;
  };

  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag) && tags.length < 5) {
      setTags([...tags, inputTag]);
      setInputTag("");
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const MediaPreview = () => {
    if (!filePreview && !image) return null;

    const previewUrl = filePreview || image;

    if (fileType === "image") {
      return (
        <div
          style={{
            marginBottom: 20,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(67, 97, 238, 0.1)",
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "350px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "4px 8px",
              borderBottomLeftRadius: 8,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <FileImageOutlined /> Image
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              color: "white",
              padding: "20px 16px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 14 }}>
              <EyeOutlined style={{ marginRight: 5 }} /> Preview
            </Text>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setImage("");
                setFilePreview(null);
                form.setFieldsValue({ mediaLink: "" });
              }}
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                borderColor: "transparent",
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      );
    }

    if (fileType === "video") {
      return (
        <div
          style={{
            marginBottom: 20,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            borderRadius: 12,
            boxShadow: "0 8px 16px rgba(67, 97, 238, 0.1)",
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <video
            controls
            src={previewUrl}
            style={{
              width: "100%",
              maxHeight: "350px",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "rgba(0,0,0,0.5)",
              color: "white",
              padding: "4px 8px",
              borderBottomLeftRadius: 8,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <VideoCameraOutlined /> Video
          </div>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              setImage("");
              setFilePreview(null);
              form.setFieldsValue({ mediaLink: "" });
            }}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(239, 68, 68, 0.2)",
              borderColor: "transparent",
            }}
          >
            Remove
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal
      title={
        <div
          style={{
            borderBottom: `1px solid ${themeColors.border}`,
            marginBottom: 20,
            paddingBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: themeColors.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PushpinOutlined
                style={{ color: themeColors.primary, fontSize: 20 }}
              />
            </div>
            <div>
              <Title
                level={4}
                style={{ margin: 0, color: themeColors.textPrimary }}
              >
                Create New Post
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Share your knowledge and skills with the community
              </Text>
            </div>
          </div>
        </div>
      }
      onCancel={handleCancel}
      footer={null}
      open={state.createPostModalOpened}
      width={700}
      centered
      destroyOnClose
      styles={{
        body: { padding: "0 24px 24px" },
        mask: { backdropFilter: "blur(4px)" },
      }}
      style={{ overflow: "hidden", borderRadius: 16 }}
      maskStyle={{ background: "rgba(15, 23, 42, 0.4)" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{ color: themeColors.textPrimary }}
      >
        {/* Media Upload Section */}
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <MediaPreview />

          {!image && !filePreview && (
            <div
              style={{
                border: `2px dashed ${themeColors.border}`,
                borderRadius: 12,
                padding: 30,
                textAlign: "center",
                backgroundColor: themeColors.primaryLight,
                marginBottom: 24,
                transition: "all 0.3s ease",
              }}
            >
              <Upload
                accept="image/*,video/*"
                onChange={handleFileChange}
                showUploadList={false}
                beforeUpload={() => false}
                maxCount={1}
                style={{ width: "100%" }}
              >
                <div style={{ cursor: "pointer" }}>
                  <CloudUploadOutlined
                    style={{
                      fontSize: 48,
                      color: themeColors.primary,
                      marginBottom: 12,
                    }}
                  />
                  <Title
                    level={5}
                    style={{ color: themeColors.textPrimary, marginTop: 0 }}
                  >
                    {imageUploading
                      ? "Uploading..."
                      : "Drop your media here, or click to browse"}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    Supports images and videos (max 50MB)
                  </Text>
                </div>
              </Upload>
            </div>
          )}

          {imageUploading && (
            <div
              style={{
                textAlign: "center",
                margin: "16px 0",
                padding: 12,
                borderRadius: 8,
                backgroundColor: themeColors.primaryLight,
              }}
            >
              <Text style={{ color: themeColors.primary }}>
                <InfoCircleOutlined style={{ marginRight: 8 }} />
                Your media is uploading, please wait...
              </Text>
            </div>
          )}
        </div>

        {/* Content Description */}
        <Form.Item
          name="contentDescription"
          label={
            <Text
              strong
              style={{ fontSize: 15, color: themeColors.textPrimary }}
            >
              What would you like to share?
            </Text>
          }
          rules={[
            { required: true, message: "Please enter content description" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Share your knowledge, experience or questions with the community..."
            style={{
              borderRadius: 8,
              border: `1px solid ${themeColors.border}`,
              padding: 12,
              fontSize: 15,
            }}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        {/* Tags Section */}
        <div style={{ marginBottom: 20 }}>
          <Text
            strong
            style={{
              fontSize: 15,
              color: themeColors.textPrimary,
              display: "block",
              marginBottom: 8,
            }}
          >
            <TagsOutlined style={{ marginRight: 8 }} />
            Add Tags (Optional)
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: 13, marginBottom: 12, display: "block" }}
          >
            Add up to 5 tags to help others find your post
          </Text>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {tags.map((tag) => (
              <Tag
                key={tag}
                closable
                onClose={() => handleRemoveTag(tag)}
                style={{
                  backgroundColor: themeColors.primaryLight,
                  color: themeColors.primary,
                  borderRadius: 16,
                  padding: "4px 10px",
                  fontSize: 14,
                  border: `1px solid ${themeColors.primaryGlow}`,
                  display: "flex",
                  alignItems: "center",
                  marginRight: 0,
                }}
              >
                #{tag}
              </Tag>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Input
              placeholder="Add a tag (e.g. javascript, design)"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onPressEnter={handleAddTag}
              style={{
                borderRadius: 8,
                flexGrow: 1,
              }}
              disabled={tags.length >= 5}
            />
            <Button
              onClick={handleAddTag}
              disabled={!inputTag || tags.length >= 5}
              style={{
                borderRadius: 8,
                background: themeColors.primary,
                borderColor: themeColors.primary,
                color: "white",
              }}
            >
              Add
            </Button>
          </div>

          {tags.length >= 5 && (
            <Text
              type="warning"
              style={{ display: "block", marginTop: 8, fontSize: 13 }}
            >
              Maximum 5 tags allowed
            </Text>
          )}
        </div>

        <Form.Item name="mediaLink" style={{ display: "none" }}>
          <Input />
        </Form.Item>

        <Divider style={{ margin: "24px 0 24px" }} />

        {/* Footer Actions */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleCancel}
              style={{
                borderRadius: 8,
                height: 40,
                fontSize: 14,
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={imageUploading || !image}
              style={{
                background: themeColors.primary,
                borderColor: themeColors.primary,
                borderRadius: 8,
                height: 40,
                fontSize: 14,
                paddingLeft: 20,
                paddingRight: 20,
                boxShadow: `0 4px 12px ${themeColors.primaryGlow}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = themeColors.primaryDark;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = themeColors.primary;
              }}
            >
              {loading ? "Creating..." : "Create Post"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
