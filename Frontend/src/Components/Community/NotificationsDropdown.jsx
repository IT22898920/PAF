import React, { useEffect, useState } from 'react';
import { Dropdown, Menu, Badge, Empty } from 'antd';
import { BellFilled, CheckOutlined } from '@ant-design/icons';
import NotificationService from '../../Services/NotificationService';
import { useSnapshot } from 'valtio';
import state from '../../Utils/Store';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const snap = useSnapshot(state);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await NotificationService.getAllNotifications();
      const userNotifications = res.filter(
        (notification) => snap.currentUser?.uid === notification.userId
      );
      
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [snap.currentUser?.uid]);

  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await NotificationService.markAllNotificationsAsRead(snap.currentUser?.uid);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Notification menu items
  const notificationMenu = (
    <Menu
      style={{ 
        width: 300, 
        maxHeight: 400, 
        overflowY: 'auto' 
      }}
    >
      <Menu.ItemGroup 
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <a 
                onClick={markAllNotificationsAsRead} 
                style={{ marginRight: 10 }}
              >
                <CheckOutlined /> Mark all read
              </a>
            )}
          </div>
        }
      >
        {notifications.length === 0 ? (
          <Menu.Item disabled>
            <Empty description="No notifications" />
          </Menu.Item>
        ) : (
          notifications.map((notification) => (
            <Menu.Item key={notification.id}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  backgroundColor: !notification.read ? '#f0f5ff' : 'transparent'
                }}
              >
                <div style={{ flexGrow: 1, marginRight: 10 }}>
                  <strong>{notification.title}</strong>
                  <p style={{ margin: 0, color: 'rgba(0,0,0,0.45)' }}>
                    {notification.description}
                  </p>
                </div>
                {!notification.read && (
                  <a 
                    onClick={(e) => {
                      e.domEvent.stopPropagation();
                      markNotificationAsRead(notification.id);
                    }}
                  >
                    <CheckOutlined />
                  </a>
                )}
              </div>
            </Menu.Item>
          ))
        )}
      </Menu.ItemGroup>
    </Menu>
  );

  return (
    <Dropdown 
      overlay={notificationMenu} 
      trigger={['click']}
    >
      <a 
        className="ant-dropdown-link" 
        onClick={(e) => e.preventDefault()}
      >
        <Badge count={unreadCount} offset={[-5, 5]}>
          <BellFilled style={{ fontSize: '18px' }} />
        </Badge>
      </a>
    </Dropdown>
  );
};

export default NotificationsDropdown;