import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';

import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './index.css'

/*
  // 1. Tìm thẻ HTML có id là 'root' để làm nơi chứa ứng dụng
  const rootElement = document.getElementById('root');

  // 2. Tạo một React Root
  const root = ReactDOM.createRoot(rootElement);

  // 3. Render (vẽ) component <App /> vào trong Root đó
  root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          // customize theme colors here
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);

- Theme: Là nơi bạn khai báo rằng mình muốn ghi đè lên thiết kế mặc định của thư viện bằng thiết kế của riêng mình
- token: là một đối tượng chứa các biến chủ đề cụ thể như colorPrimary, borderRadius, v.v. Bạn có thể tùy chỉnh các biến này để thay đổi giao diện của ứng dụng Ant Design theo ý muốn.
- colorPrimary: Đây là biến chủ đề chính, nó xác định màu sắc chủ đạo của ứng dụng. Mọi thành phần sử dụng màu chính sẽ được thay đổi theo giá trị bạn đặt ở đây.
- borderRadius: Biến này xác định độ bo tròn của các thành phần trong ứng dụng. Giá trị càng lớn thì các góc sẽ càng bo tròn hơn.

Với đoạn code trên, bạn đã tạo ra một ứng dụng React cơ bản với Ant Design và có thể tùy chỉnh giao diện của nó thông qua theme và token.
*/

const ClientID = (import.meta && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) || '123';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Bọc GoogleOAuthProvider ở ngoài cùng (hoặc ngoài Router) */}
    <GoogleOAuthProvider clientId={ClientID}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1e9',
            borderRadius: 8,
            // customize theme colors here
          },
        }}
      >
        <App />
      </ConfigProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
