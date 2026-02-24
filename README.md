# 🪷 Khóa's Arya Bot Ver 3

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-green" alt="Node Version">
  <img src="https://img.shields.io/badge/Discord.js-v14-blue" alt="Discord.js Version">
  <img src="https://img.shields.io/badge/MongoDB-Database-brightgreen" alt="MongoDB">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</div>

<br/>

**Arya Bot Ver 3** là một Discord Bot đa năng được xây dựng nhằm mang lại nhiều tiện ích giải trí, quản lý và tra cứu thông tin cho server Discord của bạn, đặc biệt hỗ trợ mạnh mẽ cho tựa game Where Winds Meet (WWM).

## ✨ Tính Năng Nổi Bật

### 🎮 Gaming & Where Winds Meet (WWM)
- `Tra cứu người chơi`: Xem thông tin chi tiết về người chơi trong game.
- `Tra cứu bang hội`: Tra cứu thông tin chi tiết về bang (club) trong game.
- `WWM Stats`: Tra cứu các chỉ số trong game.
- `Chuyển đổi preset khuôn mặt`: Hỗ trợ người chơi tải và chuyển đổi preset khuôn mặt nhân vật qua Discord Context Menu và Slash Command.

### 🤖 AI & Tiện ích
- `Hỏi đáp AI`: Tích hợp AI (Gemini/Locket API) trả lời thông minh mọi câu hỏi của người dùng.
- `Tìm kiếm Anime`: Tra cứu và lấy thông tin chi tiết của bất kỳ bộ Anime nào.
- `Locket API & Memory Manager`: Quản lý tiện ích nâng cao trong bộ Utils.

### 🛠️ Hệ Thống & Quản Trị
- `Thiết lập Bot & Kênh`: Tùy chỉnh các tính năng riêng cho từng Server/Guild.
- `Quản lý Lệnh / Reload`: Hỗ trợ nạp lại lệnh nhanh chóng không cần khởi động lại toàn bộ hệ thống.
- `Console Logger`: Ghi log các hoạt động và sự kiện với màu sắc, dễ dàng theo dõi.

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu Cầu Hệ Thống
- [Node.js](https://nodejs.org/) (Phiên bản v18.x trở lên)
- [MongoDB](https://www.mongodb.com/) (Dùng cho database)
- [Git](https://git-scm.com/)

### 2. Cài Đặt Chi Tiết

**Bước 1: Clone repository về máy**
```bash
git clone https://github.com/KhoaDayy/Arya-Bot-Ver-3.git
cd Arya-Bot-Ver-3
```

**Bước 2: Cài đặt các modules cần thiết**
```bash
npm install
```

**Bước 3: Thiết lập biến môi trường**
- Đổi tên file `.env.example` thành `.env`
- Mở file `.env` và điền đầy đủ các thông tin:
```env
TOKEN=your-discord-bot-token
CLIENT_ID=your-bot-client-id
CLIENT_SECRET=your-client-secret
GUILD_ID=your-guild-id-for-testing # (Dành cho việc dev và test lệnh nhanh trên server riêng)
MONGO_URI=your-mongodb-connection-string
```

**Bước 4: Thiết lập Bot trên Discord Developer Portal**
1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Bật **Privileged Gateway Intents** cho Bot:
   - `PRESENCE INTENT`
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
3. Lấy `Token`, `Client ID` điền vào `.env`

**Bước 5: Khởi động Bot**
```bash
npm start
```

## 📂 Cấu Trúc Dự Án

```
Arya-Bot-Ver-3/
├── db/                 # Cấu hình Mongoose, Database schemas (connect.js, schemas.js...)
├── modules/            
│   ├── commands/       # Chứa toàn bộ các lệnh Slash Commands (ask.js, wwm-stats.js...)
│   ├── contexts/       # Xử lý tương tác ứng dụng dạng Context Menu (User/Message)
│   └── events/         # Xử lý các sự kiện Discord (ready.js, messageCreate.js...)
├── utils/              # Các file hỗ trợ và quản lý (consoleLogger.js, locket-api.js...)
├── .env.example        # File mẫu cho biến môi trường
├── index.js            # File khởi chạy Bot chính
└── package.json        # Chứa thông tin project và dependencies
```

## 📝 Ghi Chú

- Bot sử dụng MongoDB để lưu trữ dữ liệu người dùng, config server.
- Các lệnh slash/context menu được tự động nạp (deploy) khi khởi động.
- Phiên bản đang chạy: nhánh **dev-v3**.

## 🤝 Đóng Góp

Đóng góp luôn được chào đón! Vui lòng làm theo các bước sau nếu bạn muốn đóng góp code:
1. `Fork` project.
2. Tạo nhánh tính năng mới (`git checkout -b feature/NewFeature`).
3. Commit các thay đổi (`git commit -m 'Thêm tính năng NewFeature'`).
4. Push nhánh của bạn (`git push origin feature/NewFeature`).
5. Tạo một **Pull Request**.

## 📄 Giấy Phép (License)

Dự án này sử dụng giấy phép **MIT**. Vui lòng xem thông tin chi tiết hoặc tự do sử dụng/sửa đổi.