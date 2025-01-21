# 走心拜年小程序 - 技术设计文档

## 1. 技术架构

### 1.1 整体架构
```
前端（微信小程序）
    ↕
微信服务器
    ↕
后端服务器 ←→ MongoDB
    ↕
豆包API / 图片处理服务
```

### 1.2 技术栈选择
- **前端**：原生微信小程序（WXML + WXSS + JS）
- **后端**：Node.js + Express
- **数据库**：MongoDB
- **AI服务**：豆包 API（智谱AI）
- **图片处理**：
  - Sharp.js（基础图片处理）
  - GIFEncoder（动态GIF生成）
  - Canvas（文字渲染）
- **对象存储**：腾讯云 COS（存储图片和生成的GIF）

## 2. 目录结构设计

```
happy_new_year/
├── miniprogram/          # 小程序前端代码
│   ├── pages/           # 页面文件
│   ├── components/      # 公共组件
│   ├── utils/          # 工具函数
│   ├── services/       # API 服务
│   ├── styles/         # 公共样式
│   └── app.js          # 小程序入口文件
│
├── server/              # 后端服务
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务逻辑
│   │   ├── utils/         # 工具函数
│   │   └── routes/        # 路由配置
│   └── app.js          # 服务器入口文件
│
└── docs/               # 文档目录
    ├── api.md         # API文档
    └── deployment.md  # 部署文档
```

## 3. 核心功能设计

### 3.1 用户系统
- 使用微信开放能力实现一键登录
- 用户信息存储在 MongoDB 中
- 使用 JWT 进行身份验证

```javascript
// 用户数据模型
{
  openid: String,        // 微信openid
  session_key: String,   // 会话密钥
  created_at: Date,      // 创建时间
  updated_at: Date,      // 更新时间
  vip_status: Boolean,   // 是否是VIP用户
}
```

### 3.2 信息采集
- 表单组件采用微信原生组件
- 图片上传使用微信上传API
- 数据实时校验

```javascript
// 拜年信息数据模型
{
  user_id: ObjectId,     // 用户ID
  receiver_name: String, // 收礼人姓名
  relationship: String,  // 与收礼人关系
  photo: String,        // 照片URL（可选）
  story: String,        // 共同经历（可选）
  created_at: Date,     // 创建时间
}
```

### 3.3 AI文案生成
- 使用豆包 API 生成祝福文案
- 实现文案缓存机制
- 支持用户编辑和重新生成
- 使用 prompt 模板优化生成效果

```javascript
// 文案数据模型
{
  greeting_id: ObjectId,  // 文案ID
  user_id: ObjectId,      // 用户ID
  content: String,        // 生成的文案内容
  original_content: String, // 原始生成内容
  edited: Boolean,        // 是否被编辑过
  prompt_template: String, // 使用的提示词模板
  created_at: Date,       // 创建时间
}
```

### 3.4 GIF生成
- 使用 GIFEncoder 生成动态GIF
- 使用 Canvas 处理文字渲染
- 使用 Sharp.js 处理基础图片处理（裁剪、压缩等）
- 提供多个动画模板选项
- 支持预览功能

```javascript
// 模板数据模型
{
  template_id: ObjectId,    // 模板ID
  name: String,             // 模板名称
  preview_url: String,      // 预览图URL
  is_premium: Boolean,      // 是否是付费模板
  price: Number,            // 价格（如果是付费模板）
  animation_config: {       // 动画配置
    duration: Number,       // 动画持续时间
    frames: Number,         // 帧数
    text_position: {        // 文字位置
      x: Number,
      y: Number
    },
    image_position: {       // 图片位置
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    effects: [String],      // 特效列表
  }
}
```

### 3.5 分享功能
- 使用微信原生分享能力
- 支持分享到好友和朋友圈
- 生成分享图片和文案

## 4. API 接口设计

### 4.1 用户相关
- POST /api/user/login
- GET /api/user/info
- PUT /api/user/update

### 4.2 拜年信息
- POST /api/greeting/create
- GET /api/greeting/list
- PUT /api/greeting/update
- DELETE /api/greeting/delete

### 4.3 AI文案
- POST /api/ai/generate
- PUT /api/ai/regenerate
- PUT /api/ai/edit

### 4.4 GIF生成
- GET /api/template/list
- POST /api/gif/generate
- GET /api/gif/preview

## 5. 数据库设计

### 5.1 集合设计
- users: 用户信息
- greetings: 拜年信息
- templates: 模板信息
- generated_content: 生成的内容

### 5.2 索引设计
- users: openid 唯一索引
- greetings: user_id 索引
- templates: is_premium 索引

## 6. 安全设计

### 6.1 数据安全
- 使用 HTTPS 进行数据传输
- 敏感信息加密存储
- 定期数据备份

### 6.2 接口安全
- 请求签名验证
- 接口访问频率限制
- 数据验证和过滤

## 7. 性能优化

### 7.1 前端优化
- 图片懒加载
- 数据缓存
- 分包加载

### 7.2 后端优化
- 数据库索引优化
- 接口缓存
- 图片压缩处理

## 8. 部署方案

### 8.1 云服务选型（推荐腾讯云 Serverless）

#### 基础设施
- **计算资源**：腾讯云 SCF（Serverless Cloud Function）
  - 按量计费，有免费额度
  - 自动扩缩容
  - 支持 Node.js 运行环境

- **数据库**：腾讯云 MongoDB
  - 自动备份
  - 按需扩容
  - 高可用架构

- **存储服务**
  - 腾讯云 COS（对象存储）
  - CDN 加速
  - 支持防盗链

#### 服务配置
- **SCF 配置**
  - 内存：256MB（可按需调整）
  - 超时时间：30s
  - 并发数：128（可调整）

- **MongoDB 配置**
  - 规格：1核2G（初始）
  - 存储空间：10GB（可扩展）
  - 副本集：1主2从

- **COS 配置**
  - 存储类型：标准存储
  - 访问权限：私有读写
  - CDN 加速：开启

### 8.2 部署流程

1. **准备工作**
   - 注册腾讯云账号
   - 开通相关服务
   - 配置密钥和权限

2. **数据库部署**
   - 创建 MongoDB 实例
   - 配置网络和安全组
   - 初始化数据库结构

3. **后端服务部署**
   - 配置云函数
   - 设置环境变量
   - 部署 API 网关

4. **存储服务配置**
   - 创建 COS 存储桶
   - 配置 CDN 加速
   - 设置防盗链和访问策略

5. **监控告警配置**
   - 配置云监控
   - 设置告警规则
   - 配置通知渠道

### 8.3 成本估算（月度）

#### 基础套餐（支持约 1000 日活）
- SCF：免费额度内
- MongoDB：约 200元/月
- COS + CDN：约 50元/月
- 总计：约 250元/月

#### 扩展套餐（支持约 5000 日活）
- SCF：约 100元/月
- MongoDB：约 500元/月
- COS + CDN：约 200元/月
- 总计：约 800元/月

### 8.4 扩展方案

- **性能扩展**
  - MongoDB 升配
  - SCF 并发调整
  - CDN 带宽提升

- **可用性提升**
  - 多可用区部署
  - 数据库主从分离
  - 跨地域备份

## 9. 测试计划

### 9.1 单元测试
- 前端组件测试
- 后端接口测试
- 数据模型测试

### 9.2 集成测试
- 功能流程测试
- 性能测试
- 安全测试 