const nodemailer = require('nodemailer');

// Create transporter
// These variables should be in your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'sendgrid' etc.
    auth: {
        user: process.env.MAIL_MAIN_SYSTEM,
        pass: process.env.MAIL_MAIN_PASSWORD,
    },
});

// Verify connection configuration on startup
const verifyEmailConfig = async () => {
    try {
        if (!process.env.MAIL_MAIN_SYSTEM || !process.env.MAIL_MAIN_PASSWORD) {
            console.warn('⚠️  CẢNH BÁO: Chưa cấu hình MAIL_MAIN_SYSTEM hoặc MAIL_MAIN_PASSWORD trong file .env.');
            console.warn('   -> Tính năng gửi OTP sẽ chạy ở chế độ GIẢ LẬP (chỉ in mã ra console).');
            return false;
        }

        await transporter.verify();
        console.log('✅ KẾT NỐI EMAIL THÀNH CÔNG: Hệ thống đã sẵn sàng gửi mã OTP thật.');
        return true;
    } catch (error) {
        console.error('❌ LỖI KẾT NỐI EMAIL: Vui lòng kiểm tra lại EMAIL_USER hoặc MAIL_MAIN_PASSWORD.');
        console.error('   Chi tiết lỗi:', error.message);
        return false;
    }
};

/**
 * Send an OTP email to the user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit code
 */
const sendOTPEmail = async (email, otp) => {
    // Check if real config exists
    const isConfigured = process.env.MAIL_MAIN_SYSTEM && process.env.MAIL_MAIN_PASSWORD;

    if (!isConfigured) {
        console.log('-------------------------------------------');
        console.log(`[SIMULATOR] Gửi OTP tới: ${email}`);
        console.log(`[SIMULATOR] Mã xác nhận của bạn là: ${otp}`);
        console.log('-------------------------------------------');
        return { success: true, mode: 'simulator' };
    }

    try {
        const mailOptions = {
            from: `"UEH University System" <${process.env.MAIL_MAIN_SYSTEM}>`,
            to: email,
            subject: '🔒 MÃ XÁC NHẬN KHÔI PHỤC MẬT KHẨU (OTP)',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="background-color: #005A51; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px;">UEH UNIVERSITY</h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 22px;">Xác thực yêu cầu khôi phục</h2>
                        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                            Chào bạn,<br>
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Hệ thống quản lý UEH.
                        </p>
                        <div style="margin: 35px 0; padding: 25px; background-color: #f4f7f6; border-radius: 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Mã OTP của bạn là:</p>
                            <span style="font-size: 48px; font-weight: 800; color: #005A51; letter-spacing: 10px; font-family: monospace;">${otp}</span>
                        </div>
                        <p style="color: #dc2626; font-size: 14px; font-weight: 500;">
                            ⚠️ Mã này sẽ hết hạn sau 60 phút. Tuyệt đối không chia sẻ mã này với bất kỳ ai.
                        </p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 13px; margin: 0;">
                            Nếu bạn không thực hiện yêu cầu này, hãy đổi mật khẩu ngay lập tức để bảo vệ tài khoản.<br>
                            Đây là email tự động, vui lòng không phản hồi.
                        </p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent successfully: ' + info.messageId);
        return { success: true, mode: 'real', messageId: info.messageId };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        // Fallback info in console so flow doesn't break for admin
        console.log(`[ERR-FALLBACK] OTP for ${email}: ${otp}`);
        return { success: false, error: error.message };
    }
};

module.exports = { sendOTPEmail, verifyEmailConfig };
