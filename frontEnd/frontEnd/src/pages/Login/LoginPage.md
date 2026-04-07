# TÀI LIỆU PHÂN TÍCH KỸ THUẬT: COMPONENT LOGIN PAGE

Component `LoginPage` là một trang xác thực hai trong một (2-in-1) kết hợp cả chức năng Đăng nhập (Sign In) và Đăng ký (Sign Up) với khả năng chuyển đổi mượt mà ngay trên cùng một giao diện. Nó ứng dụng các công nghệ hiện đại nhất của hệ sinh thái React.

## 1. Phân tích các Thư viện và Hooks (Imports)

Phần đầu file là nơi bạn "chuẩn bị đồ nghề" trước khi bắt tay vào xây dựng hệ thống.

* **Thư viện lõi React:** Dùng `useState` để lưu trữ dữ liệu thay đổi trên màn hình (ví dụ: trạng thái loading, đang ở form nào).
* **Ant Design (`antd` & `@ant-design/icons`):** Bộ UI kit cung cấp các thành phần giao diện đã được thiết kế sẵn cực đẹp (`Input`, `Button`, `Typography`, `Alert`, `message`) và các biểu tượng (`UserOutlined`, `LockOutlined`, v.v.).
* **React Hook Form (`react-hook-form`):** Công cụ quản lý Form hiệu suất cao. Nó giúp thu thập dữ liệu người dùng gõ vào mà không làm trang web bị giật lag (re-render) liên tục. Trái tim của nó ở đây là hàm `useForm` và thẻ bọc `<Controller>`.
* **Yup (`yup` & `@hookform/resolvers/yup`):** Thư viện tạo "bộ luật" kiểm tra lỗi (Validation). Bộ giải mã `yupResolver` đóng vai trò làm thông dịch viên để nối thư viện `Yup` vào `React Hook Form`.
* **React Router DOM:** Dùng `useNavigate` để bế người dùng sang trang khác và `useLocation` để biết người dùng từ trang nào bị đá văng tới đây.
* **AuthContext:** Hook tự viết `useAuth` để lấy hàm `login`, giúp cập nhật trạng thái đăng nhập cho toàn bộ hệ thống web.

---

## 2. Trái tim của Form: Bộ luật Yup (Schema)

Đây là điểm tinh tế và phức tạp nhất của file này: **Một bộ luật động có thể thay đổi tùy theo hoàn cảnh.**

* **Cú pháp cơ bản:** `yup.string().required(...)` hoặc `yup.string().min(...)` là những luật tĩnh, luôn luôn bắt buộc.
* **Luật thông minh `.when()`:** Ô `email` và `confirmPassword` sử dụng hàm `.when('$isLoginMode', ...)`. Dấu `$` ở đây đại diện cho một biến bối cảnh (context variable) được truyền từ bên ngoài vào.
* **Logic rẽ nhánh:** * `is: false`: Tức là khi người dùng ĐANG Ở chế độ Đăng ký.
* `then`: Áp dụng luật khắt khe (bắt buộc nhập, phải đúng định dạng email, mật khẩu phải khớp `yup.ref('password')`).
* `otherwise`: Bỏ qua hoàn toàn (`schema.notRequired()`) nếu đang ở chế độ Đăng nhập.



---

## 3. Khởi tạo Component và Quản lý trạng thái (State Setup)

Ngay khi bước vào hàm `LoginPage()`, hệ thống khởi tạo các biến nội bộ:

* **Công tắc trạng thái:**
* `loading` (boolean): Bật/tắt hiệu ứng xoay xoay ở nút bấm.
* `errorMsg` (string): Lưu dòng chữ báo lỗi đỏ lòm (ví dụ: "Sai mật khẩu").
* `isLoginMode` (boolean): Quyết định giao diện hiện tại là Đăng nhập (`true`) hay Đăng ký (`false`).


* **Định vị điểm đến (`from`):** Biến `from = location.state?.from?.pathname || '/';` cực kỳ quan trọng. Nó lấy thông tin từ URL xem trước đó người dùng định vào trang nào mà bị chặn lại. Nếu đăng nhập thành công, nó sẽ trả người dùng về đúng trang đó, thay vì luôn luôn đẩy về trang chủ `/`.

---

## 4. Kết nối React Hook Form

Hàm `useForm` là bộ não điều hành mọi thao tác gõ phím của người dùng.

* **`resolver: yupResolver(schema)`:** Áp dụng bộ luật Yup vừa viết ở trên.
* **`context: { isLoginMode }`:** Đây là chìa khóa kết nối. Nó bơm biến `isLoginMode` của React vào bên trong bộ luật của Yup (chính là cái biến `$isLoginMode` có dấu `$` ở trên).
* **`defaultValues`:** Khởi tạo form trống trơn ban đầu.
* **Hàm được trích xuất:** * `control`: Sợi dây để cắm vào thẻ `<Controller>`.
* `handleSubmit`: Người gác cổng. Nó tự động chạy kiểm tra lỗi trước, nếu mọi thứ xanh lè thì nó mới gọi hàm `onSubmit` của bạn.
* `reset`: Cục tẩy. Dùng để xóa trắng mọi ô nhập liệu sau khi đăng ký thành công.
* `errors`: Chiếc túi chứa các câu báo lỗi nếu người dùng vi phạm luật Yup.



---

## 5. Kịch bản Xử lý Dữ liệu (Hàm `onSubmit`)

Hàm này nhận vào tham số `data` chứa tất cả chữ mà người dùng đã gõ, cấu trúc gồm 3 pha:

1. **Pha Chuẩn bị (Start):** Bật `loading` lên `true`, xóa sạch `errorMsg` cũ. Giả lập một lệnh gọi API tốn 800 mili-giây bằng lệnh `setTimeout` để tạo cảm giác chân thực.
2. **Pha Xử lý chính (Try):** Kiểm tra biến `isLoginMode`.
* *Kịch bản Đăng nhập:* Kiểm tra cứng tài khoản (`admin` / `12345678`). Nếu đúng, tạo Token giả, gọi hàm `login()` của hệ thống và dùng `Maps` với tùy chọn `{ replace: true }` (để xóa lịch sử, không cho người dùng ấn nút Back quay lại trang login). Nếu sai, ném ra một lỗi (Throw Error).
* *Kịch bản Đăng ký:* Hiển thị thông báo `message.success` cực mượt, dùng cục tẩy `reset()` xóa trắng form, và chuyển `isLoginMode` về `true` để hiển thị form Login.


3. **Pha Dọn dẹp (Catch & Finally):** Bắt lỗi ném ra màn hình nếu có, và luôn luôn tắt `loading` khi mọi chuyện kết thúc dù thành công hay thất bại.

---

## 6. Cấu trúc Giao diện (Render / UI)

Bố cục được chia làm 2 cột bằng Flexbox.

* **Cột trái (Branding):** Chứa hình ảnh, Slogan và nền background sử dụng các class CSS custom (`animated-gradient-bg`, `animate-fade-in-up`) để tạo hiệu ứng chuyển động. Thẻ `<img>` chèn ảnh logo UEH vào giao diện.
* **Cột phải (Form):**
* Dùng toán tử ba ngôi `{isLoginMode ? 'Welcome back' : 'Create account'}` để thay đổi tiêu đề động.
* Các thẻ `<Input>` của Ant Design không thể dùng độc lập, nó phải được bọc trong một `<Controller>` của React Hook Form. Thuộc tính `render={({ field }) => ...}` đóng vai trò truyền các hàm theo dõi sự kiện (`onChange`, `onBlur`, `value`) vào thẳng ô Input một cách tự động.
* Toán tử logic `{!isLoginMode && (...)}`: Kỹ thuật Rendering có điều kiện. Nếu không phải Đăng nhập thì đoạn HTML chứa ô Email và Confirm Password mới được vẽ ra trình duyệt.



---

## 7. Trình tự Vận hành Hệ thống (System Flow)

1. Người dùng mở trang web, giao diện mặc định render ở trạng thái Đăng nhập (`isLoginMode = true`).
2. Ô Email và Confirm Password bị ẩn đi. Yup chỉ kiểm tra Username và Password.
3. Người dùng bấm chữ **"Sign up for free"** ở dưới cùng. Hàm `setIsLoginMode(false)` chạy.
4. Giao diện thay đổi (Re-render): Form co giãn mọc thêm 2 ô Email và Xác nhận mật khẩu. Chữ trên nút đổi thành "Create Account". Bộ luật Yup tự động chuyển sang chế độ nghiêm ngặt.
5. Người dùng điền đủ thông tin và bấm **"Create Account"**.
6. `handleSubmit` của Hook Form kích hoạt. Nó gọi Yup để kiểm tra. Nếu thiếu @ trong email hoặc 2 pass không khớp, hệ thống chặn lại và in chữ đỏ.
7. Nếu pass qua vòng kiểm duyệt, hàm `onSubmit` chạy. Màn hình xoay xoay trong 800ms.
8. Báo thành công, xóa trắng form, tự nhảy về lại giao diện Đăng nhập.
9. Người dùng nhập lại tài khoản `admin`, bấm **"Sign In"**.
10. Hệ thống xác thực đúng, gọi hàm cập nhật toàn cục `login()`, và đẩy người dùng bay thẳng vào Trang chủ (hoặc trang bị chặn trước đó).

