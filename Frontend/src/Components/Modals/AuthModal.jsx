import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Divider,
  Tabs,
  Typography,
} from "antd";
import {
  InboxOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  ProfileOutlined,
  AimOutlined,
} from "@ant-design/icons";
import UploadFileService from "../../Services/UploadFileService";
import AuthService from "../../Services/AuthService";
import UserService from "../../Services/UserService";

const { TabPane } = Tabs;
const { Text } = Typography;
const uploader = new UploadFileService();

// Modal styling
const modalStyle = {
  borderRadius: "12px",
  overflow: "hidden",
};

const tabsStyle = {
  marginBottom: 0,
  paddingTop: "16px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "16px",
  marginTop: "16px",
};

const socialButtonStyle = {
  width: "120px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const footerTextStyle = {
  marginTop: "24px",
  textAlign: "center",
};

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("signin");
  const [signInForm] = Form.useForm();
  const [signUpForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  // Check for OAuth2 callback parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userId = params.get("user_id");

    if (accessToken && refreshToken && userId) {
      // Store tokens in localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Show success message
      message.success("Successfully signed in!");

      // Refresh the page
      window.location.reload();
    }
  }, []);

  const handleSignIn = async (values) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(values.email, values.password);
      localStorage.setItem("userId", response.userId);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      message.success("Welcome back!");
      onClose();
      signInForm.resetFields();
      window.location.reload();
    } catch (err) {
      message.error("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values) => {
    try {
      setIsLoading(true);

      // Check if user exists
      const exists = await UserService.checkIfUserExists(values.username);
      if (exists) {
        message.error("User already exists with this username");
        return;
      }

      // Register user
      const response = await AuthService.register(
        values.username,
        values.password
      );

      localStorage.setItem("userId", response.userId);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      // Upload image if provided
      let imageUrl = "";
      if (values.file && values.file.length > 0) {
        imageUrl = await uploader.uploadFile(
          values.file[0].originFileObj,
          "userImages"
        );
      }

      // Create profile
      const body = {
        userId: localStorage.getItem("userId"),
        biography: values.biography,
        fitnessGoals: values.fitnessGoals,
        image: imageUrl,
        email: values.email,
      };

      await UserService.createProfile(body);
      message.success(
        `Welcome ${values.username}! Your account has been created.`
      );
      onClose();
      signUpForm.resetFields();
      window.location.reload();
    } catch (err) {
      message.error("Error creating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Handle OAuth login redirects
  const handleOAuthLogin = (provider) => {
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8081";
    const redirectUrl = `${baseUrl}/oauth2/authorization/${provider.toLowerCase()}`;
    window.location.href = redirectUrl;
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      footer={null}
      onCancel={onClose}
      width={450}
      centered
      bodyStyle={{ padding: 0 }}
      style={modalStyle}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        style={tabsStyle}
      >
        <TabPane tab="Sign In" key="signin">
          <div style={{ padding: "20px" }}>
            <Form
              name="signInForm"
              form={signInForm}
              layout="vertical"
              onFinish={handleSignIn}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your username or email!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Username or Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  size="large"
                  style={{ marginTop: "8px" }}
                >
                  Sign In
                </Button>
              </Form.Item>

              <Divider plain>or continue with</Divider>

              <div style={buttonContainerStyle}>
                <Button
                  icon={<GoogleOutlined />}
                  size="large"
                  onClick={() => handleOAuthLogin("Google")}
                  style={socialButtonStyle}
                >
                  Google
                </Button>
                <Button
                  icon={<GithubOutlined />}
                  size="large"
                  onClick={() => handleOAuthLogin("GitHub")}
                  style={socialButtonStyle}
                >
                  GitHub
                </Button>
              </div>

              <div style={footerTextStyle}>
                <Text type="secondary">
                  Don't have an account?{" "}
                  <Button
                    type="link"
                    onClick={() => setActiveTab("signup")}
                    style={{ padding: 0 }}
                  >
                    Sign up now
                  </Button>
                </Text>
              </div>
            </Form>
          </div>
        </TabPane>

        <TabPane tab="Sign Up" key="signup">
          <div style={{ padding: "20px" }}>
            <Form
              name="signUpForm"
              form={signUpForm}
              layout="vertical"
              onFinish={handleSignUp}
              autoComplete="off"
              requiredMark={false}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The passwords don't match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Confirm Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="biography"
                rules={[
                  { required: true, message: "Please input your biography!" },
                ]}
              >
                <Input
                  prefix={<ProfileOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Biography"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="fitnessGoals"
                rules={[
                  { required: true, message: "Please input your skill goals!" },
                ]}
              >
                <Input
                  prefix={<AimOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Skill Goals"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="file"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload.Dragger
                  beforeUpload={() => false}
                  multiple={false}
                  maxCount={1}
                  listType="picture"
                  style={{ borderRadius: "8px", padding: "16px 0" }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Profile picture (optional)</p>
                  <p className="ant-upload-hint">
                    Click or drag an image to this area
                  </p>
                </Upload.Dragger>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  size="large"
                  style={{ marginTop: "8px" }}
                >
                  Create Account
                </Button>
              </Form.Item>

              <Divider plain>or sign up with</Divider>

              <div style={buttonContainerStyle}>
                <Button
                  icon={<GoogleOutlined />}
                  size="large"
                  onClick={() => handleOAuthLogin("Google")}
                  style={socialButtonStyle}
                >
                  Google
                </Button>
                <Button
                  icon={<GithubOutlined />}
                  size="large"
                  onClick={() => handleOAuthLogin("GitHub")}
                  style={socialButtonStyle}
                >
                  GitHub
                </Button>
              </div>

              <div style={footerTextStyle}>
                <Text type="secondary">
                  Already have an account?{" "}
                  <Button
                    type="link"
                    onClick={() => setActiveTab("signin")}
                    style={{ padding: 0 }}
                  >
                    Sign in
                  </Button>
                </Text>
              </div>
            </Form>
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default AuthModal;
