import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Divider,
  Progress,
  Tag,
  Space,
  Tooltip,
} from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import SkillShareService from "../../Services/SkillShareService";
import UploadFileService from "../../Services/UploadFileService";
import {
  UploadOutlined,
  DeleteOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  CloudUploadOutlined,
  PictureFilled,
  TrophyOutlined,
  BulbOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const uploader = new UploadFileService();

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

const CreateSkillShareModal = () => {
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [categories] = useState([
    "Programming",
    "Design",
    "Marketing",
    "Writing",
    "Language",
    "Music",
    "Photography",
    "Cooking",
    "Fitness",
    "Finance",
    "Business",
    "Education",
  ]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Call the service to create the Skill Share
      await SkillShareService.createSkillShare({
        ...values,
        userId: snap.currentUser?.uid,
        mediaUrls: mediaFiles.map((file) => file.url),
        mediaTypes: mediaFiles.map((file) => file.type),
        createdAt: new Date().toISOString(),
      });

      // Refresh the skill shares list
      state.SkillShares = await SkillShareService.getAllSkillShares();

      // Show success message (simulate with a console.log)
      console.log("Skill Share created successfully!");

      // Reset the form and close the modal on success
      form.resetFields();
      setMediaFiles([]);
      state.createSkillShareOpened = false;
    } catch (error) {
      console.error("Error creating Skill Share:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use a custom file input instead of Ant's Upload component to avoid duplication issues
  const handleFileInputChange = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (mediaFiles.length + files.length > 3) {
      alert(
        `You can only upload up to 3 files in total. You've selected ${
          files.length
        } files but can only add ${3 - mediaFiles.length} more.`
      );
      // Reset the file input
      e.target.value = null;
      return;
    }

    setUploadingMedia(true);

    try {
      // Process files one by one with progress updates
      const newFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type.split("/")[0];

        // Update progress for each file
        setUploadProgress(Math.round((i / files.length) * 100));

        // Validate video duration if it's a video
        if (fileType === "video") {
          const isValid = await validateVideoDuration(file);
          if (!isValid) {
            alert(`Video "${file.name}" must be 30 seconds or less`);
            continue;
          }
        }

        const url = await uploader.uploadFile(file, "posts");

        newFiles.push({
          uid: Date.now() + Math.random().toString(36).substring(2, 9),
          url: url,
          type: fileType,
          name: file.name,
          preview: URL.createObjectURL(file),
        });
      }

      setUploadProgress(100);

      setMediaFiles((prev) => [...prev, ...newFiles]);

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploadingMedia(false);
      // Reset the file input
      e.target.value = null;
    }
  };

  const validateVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration <= 30);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const removeMediaFile = (uid) => {
    setMediaFiles((prev) => prev.filter((file) => file.uid !== uid));
  };

  const renderMediaPreview = () => {
    return (
      <div className="media-preview-container" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text strong style={{ color: themeColors.textPrimary, fontSize: 15 }}>
            Media Files ({mediaFiles.length}/3)
          </Text>
          <Tag
            color={
              mediaFiles.length >= 3 ? themeColors.success : themeColors.info
            }
          >
            {mediaFiles.length >= 3
              ? "Maximum reached"
              : `${3 - mediaFiles.length} more allowed`}
          </Tag>
        </div>

        <Row gutter={[16, 16]}>
          {mediaFiles.map((file) => (
            <Col key={file.uid} xs={24} sm={12} md={8}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: themeColors.shadow,
                  border: `1px solid ${themeColors.border}`,
                  height: 160,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: themeColors.shadowHover,
                  },
                }}
              >
                {file.type === "image" ? (
                  <img
                    src={file.url || file.preview}
                    alt={file.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <video
                    src={file.url || file.preview}
                    controls
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "rgba(15, 23, 42, 0.6)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: 8,
                    fontSize: 12,
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {file.type === "image" ? (
                    <>
                      <FileImageOutlined /> Image
                    </>
                  ) : (
                    <>
                      <VideoCameraOutlined /> Video
                    </>
                  )}
                </div>

                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeMediaFile(file.uid)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(239, 68, 68, 0.2)",
                    borderColor: "transparent",
                    color: "white",
                    borderRadius: 8,
                    backdropFilter: "blur(4px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 12px 8px",
                    background:
                      "linear-gradient(transparent, rgba(15, 23, 42, 0.8))",
                    color: "white",
                  }}
                >
                  <Text ellipsis style={{ color: "white", fontSize: 12 }}>
                    {file.name}
                  </Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // Custom drop zone instead of using Ant's Dragger
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (uploadingMedia || mediaFiles.length >= 3) return;

    const files = Array.from(e.dataTransfer.files);

    // Check if adding these files would exceed the limit
    if (mediaFiles.length + files.length > 3) {
      alert(
        `You can only upload up to 3 files in total. You've dropped ${
          files.length
        } files but can only add ${3 - mediaFiles.length} more.`
      );
      return;
    }

    setUploadingMedia(true);

    try {
      // Process files one by one with progress updates
      const newFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check if file is image or video
        if (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/")
        ) {
          alert(`File "${file.name}" is not an image or video.`);
          continue;
        }

        const fileType = file.type.split("/")[0];

        // Update progress for each file
        setUploadProgress(Math.round((i / files.length) * 100));

        // Validate video duration if it's a video
        if (fileType === "video") {
          const isValid = await validateVideoDuration(file);
          if (!isValid) {
            alert(`Video "${file.name}" must be 30 seconds or less`);
            continue;
          }
        }

        const url = await uploader.uploadFile(file, "posts");

        newFiles.push({
          uid: Date.now() + Math.random().toString(36).substring(2, 9),
          url: url,
          type: fileType,
          name: file.name,
          preview: URL.createObjectURL(file),
        });
      }

      setUploadProgress(100);

      setMediaFiles((prev) => [...prev, ...newFiles]);

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploadingMedia(false);
    }
  };

  return (
    <Modal
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: themeColors.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrophyOutlined
              style={{
                fontSize: 22,
                color: themeColors.primary,
              }}
            />
          </div>
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                color: themeColors.textPrimary,
                fontSize: 20,
              }}
            >
              Share Your Skills
            </Title>
            <Text
              style={{
                color: themeColors.textSecondary,
                fontSize: 14,
              }}
            >
              Showcase your expertise with the community
            </Text>
          </div>
        </div>
      }
      open={snap.createSkillShareOpened}
      footer={null}
      onCancel={() => {
        state.createSkillShareOpened = false;
        form.resetFields();
        setMediaFiles([]);
      }}
      width={700}
      centered
      destroyOnClose
      styles={{
        body: { padding: "0 24px 24px" },
        mask: { backdropFilter: "blur(4px)" },
      }}
      style={{ borderRadius: 16 }}
      maskStyle={{ background: "rgba(15, 23, 42, 0.4)" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        {/* Skill Category */}
        <Form.Item
          name="skillCategory"
          label={
            <Text
              strong
              style={{ fontSize: 15, color: themeColors.textPrimary }}
            >
              <BulbOutlined style={{ marginRight: 8 }} /> Skill Category
            </Text>
          }
          rules={[
            { required: true, message: "Please select a skill category" },
          ]}
        >
          <Select
            placeholder="Select the category that best describes your skill"
            style={{ borderRadius: 8 }}
            dropdownStyle={{ borderRadius: 8 }}
          >
            {categories.map((category) => (
              <Option
                key={category.toLowerCase()}
                value={category.toLowerCase()}
              >
                {category}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Skill Description */}
        <Form.Item
          name="mealDetails"
          label={
            <Text
              strong
              style={{ fontSize: 15, color: themeColors.textPrimary }}
            >
              <InfoCircleOutlined style={{ marginRight: 8 }} /> Skill
              Description
            </Text>
          }
          rules={[
            {
              required: true,
              message: "Please enter a description of your skill",
            },
          ]}
        >
          <Input.TextArea
            style={{
              borderRadius: 8,
              borderColor: themeColors.border,
              padding: 12,
            }}
            placeholder="Describe your skill, how you learned it, and tips for others who want to learn it..."
            rows={5}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        {/* Media Display */}
        {mediaFiles.length > 0 && renderMediaPreview()}

        {/* Upload Progress */}
        {uploadingMedia && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <CloudUploadOutlined
                style={{
                  color: themeColors.primary,
                  fontSize: 18,
                }}
              />
              <Text
                style={{
                  color: themeColors.primary,
                  fontWeight: 500,
                }}
              >
                Uploading media...
              </Text>
            </div>
            <Progress
              percent={uploadProgress}
              status={uploadProgress < 100 ? "active" : "success"}
              strokeColor={{
                "0%": themeColors.primary,
                "100%": themeColors.secondary,
              }}
            />
          </div>
        )}

        {/* Upload Area */}
        <Form.Item
          required
          label={
            <div style={{ marginBottom: 8 }}>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: themeColors.textPrimary,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                <PictureFilled style={{ marginRight: 8 }} />
                Upload Media
              </Text>
              <Text
                style={{
                  color: themeColors.textSecondary,
                  fontSize: 13,
                }}
              >
                Add photos or videos to showcase your skill (max 3 files, videos
                max 30 sec)
              </Text>
            </div>
          }
          rules={[
            {
              required: mediaFiles.length === 0,
              message: "Please upload at least one media file",
            },
          ]}
        >
          <div
            style={{
              border: `2px dashed ${
                dragActive ? themeColors.primary : themeColors.border
              }`,
              borderRadius: 12,
              padding: "28px 20px",
              textAlign: "center",
              background: dragActive
                ? themeColors.primaryLight
                : themeColors.background,
              cursor: mediaFiles.length >= 3 ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div style={{ marginBottom: 12 }}>
              <InboxOutlined
                style={{
                  fontSize: 52,
                  color: dragActive
                    ? themeColors.primary
                    : themeColors.textSecondary,
                  transition: "all 0.3s ease",
                }}
              />
            </div>

            <Title
              level={5}
              style={{
                margin: "12px 0",
                color: themeColors.textPrimary,
                fontWeight: 600,
              }}
            >
              {mediaFiles.length >= 3
                ? "Maximum number of files reached"
                : `Drag & drop or click to upload (${
                    3 - mediaFiles.length
                  } more allowed)`}
            </Title>

            <Text
              style={{
                color: themeColors.textSecondary,
                display: "block",
                marginBottom: 12,
              }}
            >
              Supports JPG, PNG, and MP4 files
            </Text>

            <Space size={8}>
              <Tag color="blue" icon={<FileImageOutlined />}>
                Images
              </Tag>
              <Tag color="purple" icon={<VideoCameraOutlined />}>
                Videos (max 30s)
              </Tag>
            </Space>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              disabled={mediaFiles.length >= 3 || uploadingMedia}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: mediaFiles.length >= 3 ? "not-allowed" : "pointer",
              }}
            />
          </div>
        </Form.Item>

        <Divider style={{ margin: "28px 0 24px" }} />

        {/* Form Actions */}
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              onClick={() => {
                state.createSkillShareOpened = false;
                form.resetFields();
                setMediaFiles([]);
              }}
              style={{
                borderRadius: 8,
                height: 40,
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={mediaFiles.length === 0 || uploadingMedia}
              style={{
                background: themeColors.primary,
                borderColor: themeColors.primary,
                borderRadius: 8,
                height: 40,
                fontWeight: 500,
                paddingLeft: 20,
                paddingRight: 20,
                boxShadow: "0 4px 12px rgba(67, 97, 238, 0.2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = themeColors.primaryDark;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(67, 97, 238, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = themeColors.primary;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(67, 97, 238, 0.2)";
              }}
            >
              {loading ? "Sharing..." : "Share Your Skill"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSkillShareModal;
