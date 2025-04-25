import React, { useState } from "react";
import { Modal, Form, Input, Button, Upload, message, Space, Typography } from "antd";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import UploadFileService from "../../Services/UploadFileService";
import { UploadOutlined, FileImageOutlined, VideoCameraOutlined } from "@ant-design/icons";
import PostService from "../../Services/PostService";

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

const { Title, Text } = Typography;
const uploader = new UploadFileService();

const CreatePostModal = () => {
  const snap = useSnapshot(state);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileType, setFileType] = useState("image");
  const [image, setImage] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const body = {
        ...values,
        mediaLink: image,
        userId: snap.currentUser?.uid,
        mediaType: fileType,
      };
      await PostService.createPost(body);
      state.posts = await PostService.getPosts();
      message.success("Post created successfully");
      state.createPostModalOpened = false;
      form.resetFields();
      setImage("");
    } catch (error) {
      console.error("Form validation failed:", error);
      message.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = async (info) => {
    if (info.file) {
      try {
        setImageUploading(true);
        const fileType = info.file.type.split("/")[0];
        setFileType(fileType);
        const url = await uploader.uploadFile(
          info.fileList[0].originFileObj,
          "posts"
        );
        setImage(url);
        form.setFieldsValue({ mediaLink: url });
        message.success(`${fileType} uploaded successfully`);
      } catch (error) {
        message.error("Upload failed. Please try again.");
        console.error("Upload error:", error);
      } finally {
        setImageUploading(false);
      }
    } else if (info.file.status === "removed") {
      setImage("");
      form.setFieldsValue({ mediaLink: "" });
    }
  };
  
  const handleCancel = () => {
    form.resetFields();
    setImage("");
    state.createPostModalOpened = false;
  };

  const MediaPreview = () => {
    if (!image) return null;
    
    if (fileType === "image") {
      return (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <img
            src={image}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
          />
        </div>
      );
    }
    
    if (fileType === "video") {
      return (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <video
            controls
            src={image}
            style={{
              maxWidth: "100%",
              maxHeight: "300px",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <Modal
      title={<Title level={4}>Create New Post</Title>}
      onCancel={handleCancel}
      footer={null}
      visible={state.createPostModalOpened}
      width={600}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="contentDescription"
          label="Content Description"
          rules={[
            { required: true, message: "Please enter content description" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="What would you like to share?"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>
        
        <Form.Item
          name="mediaLink"
          label="Media"
          rules={[{ required: true, message: "Please upload an image or video" }]}
        >
          <Upload
            accept="image/*,video/*"
            onChange={handleFileChange}
            showUploadList={false}
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button 
              icon={<UploadOutlined />}
              disabled={imageUploading}
              style={{
                borderRadius: 8,
                background: themeColors.primary,
                borderColor: themeColors.primary,
                color: "white"
              }}
            >
              {imageUploading ? "Uploading..." : "Upload Media"}
            </Button>
          </Upload>
        </Form.Item>
        
        {imageUploading && (
          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <Text type="secondary">Media is uploading, please wait...</Text>
          </div>
        )}
        
        <MediaPreview />
        
        <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
          <Space style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>
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
                borderRadius: 8
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