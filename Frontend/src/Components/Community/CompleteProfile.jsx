import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Steps, Spin } from 'antd';
import { InboxOutlined, UserOutlined, AimOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OAuthService from '../Services/OAuthService';
import UserService from '../Services/UserService';
import UploadFileService from '../Services/UploadFileService';

const { Step } = Steps;
const uploader = new UploadFileService();

const CompleteProfile = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [provider, setProvider] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have OAuth data in session storage
    const storedData = sessionStorage.getItem('oauth_user_data');
    const storedProvider = sessionStorage.getItem('oauth_provider');
    
    if (!storedData || !storedProvider) {
      message.error('OAuth data not found. Please try logging in again.');
      navigate('/login');
      return;
    }
    
    try {
      const parsedData = JSON.parse(storedData);
      setOauthData(parsedData);
      setProvider(storedProvider);
      
      // Pre-fill form with available data
      form.setFieldsValue({
        username: parsedData.username || parsedData.name,
        email: parsedData.email,
      });
    } catch (error) {
      console.error('Error parsing OAuth data:', error);
      message.error('Invalid OAuth data. Please try logging in again.');
      navigate('/login');
    }
  }, [form, navigate]);
  
  const handleFormSubmit = async (values) => {
    try {
      setIsLoading(true);
      
      // First, register OAuth user in your system
      const registerResponse = await UserService.registerOAuthUser({
        provider: provider,
        providerId: oauthData.id,
        username: values.username,
        email: values.email,
      });
      
      if (!registerResponse.success) {
        throw new Error(registerResponse.error || 'Failed to register user');
      }
      
      // Set user ID from registration response
      localStorage.setItem('userId', registerResponse.userId);
      localStorage.setItem('accessToken', OAuthService.getUserData().access_token);
      
      // Upload profile image if provided
      let imageUrl = oauthData.picture || ''; // Use OAuth profile picture as default
      
      if (values.file && values.file.length > 0) {
        // User uploaded a custom image, use that instead
        imageUrl = await uploader.uploadFile(
          values.file[0].originFileObj,
          'userImages'
        );
      }
      
      // Create user profile with additional data
      const profileData = {
        userId: registerResponse.userId,
        biography: values.biography,
        fitnessGoals: values.fitnessGoals,
        image: imageUrl,
        email: values.email,
      };
      
      await UserService.createProfile(profileData);
      
      // Clear session storage OAuth data
      sessionStorage.removeItem('oauth_user_data');
      sessionStorage.removeItem('oauth_provider');
      
      message.success(`Welcome ${values.username}! Your profile is complete.`);
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error completing profile:', error);
      message.error('Error creating your profile. Please try again.');
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
  
  if (!oauthData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          <p className="text-gray-500">
            We need a little more information to set up your account
          </p>
        </div>
        
        <Steps size="small" current={1} className="mb-8">
          <Step title="Connect" description={`${provider.charAt(0).toUpperCase() + provider.slice(1)} Account`} />
          <Step title="Profile" description="Complete Profile" />
          <Step title="Done" description="Start Using" />
        </Steps>
        
        <Form
          name="completeProfileForm"
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Username" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input disabled size="large" />
          </Form.Item>
          
          <Form.Item
            name="biography"
            label="Biography"
            rules={[{ required: true, message: 'Please input your biography!' }]}
          >
            <Input.TextArea 
              placeholder="Tell us about yourself" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item
            name="fitnessGoals"
            label="Skill Goals"
            rules={[{ required: true, message: 'Please input your skill goals!' }]}
          >
            <Input 
              prefix={<AimOutlined className="text-gray-400" />} 
              placeholder="Skill Goals" 
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            name="file"
            label="Profile Picture"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload.Dragger 
              beforeUpload={() => false} 
              multiple={false}
              maxCount={1}
              listType="picture"
              className="profile-upload"
            >
              {oauthData.picture ? (
                <div className="text-center">
                  <div className="mb-4">
                    <img 
                      src={oauthData.picture} 
                      alt="Profile from OAuth" 
                      className="w-16 h-16 rounded-full mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    We'll use your {provider} profile picture by default.
                    <br />
                    Drag a new image here to change it.
                  </p>
                </div>
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag a profile picture here</p>
                </>
              )}
            </Upload.Dragger>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
              size="large"
              className="mt-4"
            >
              Complete Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CompleteProfile;