# PaiNaiDee Community API Backend

A FastAPI backend for the PaiNaiDee travel community platform, providing endpoints for post creation, media upload, and user authentication.

## Features

- 🔐 **Authentication**: JWT-based authentication system
- 📝 **Post Creation**: Create travel posts with text, images, and videos
- 📸 **Media Upload**: Upload and process images/videos with thumbnails
- 💾 **Draft Saving**: Save and restore post drafts
- 🏷️ **Location Tagging**: Add location and accommodation tags
- 🔒 **Privacy Controls**: Public, friends-only, and private posts
- ⚡ **Fast & Scalable**: Built with FastAPI for high performance

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server:**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc
- **Health check**: http://localhost:8000/api/health

## Authentication

### Test User Credentials

For development and testing, use these credentials:

- **Username**: `testuser`
- **Password**: `testpass123`

### Getting an Access Token

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=testuser&password=testpass123"
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get access token

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - Get posts feed (with pagination)
- `GET /api/posts/{post_id}` - Get specific post
- `DELETE /api/posts/{post_id}` - Delete a post

### Drafts
- `POST /api/posts/draft` - Save post draft
- `GET /api/posts/draft` - Get saved draft

### Media
- `POST /api/media/upload` - Upload images/videos

### Health
- `GET /api/health` - Health check

## Usage Examples

### 1. Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=testuser&password=testpass123"
```

### 2. Create a Post
```bash
curl -X POST "http://localhost:8000/api/posts" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "content": "Amazing trip to Doi Suthep! The view was breathtaking 🏔️",
       "location": {
         "id": "1",
         "name": "Doi Suthep",
         "province": "Chiang Mai"
       },
       "tags": ["chiang-mai", "temple", "mountain", "nature"],
       "privacy": "public"
     }'
```

### 3. Upload Media
```bash
curl -X POST "http://localhost:8000/api/media/upload" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -F "files=@image1.jpg" \
     -F "files=@image2.jpg"
```

### 4. Save Draft
```bash
curl -X POST "http://localhost:8000/api/posts/draft" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "content": "Draft content...",
       "privacy": "public"
     }'
```

## File Upload Limits

- **Images**: Maximum 10MB per file
- **Videos**: Maximum 50MB per file
- **Total files**: Maximum 10 files per post
- **Supported formats**:
  - Images: JPEG, PNG, WebP
  - Videos: MP4, WebM, MOV, AVI

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

## Development

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-change-in-production
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800  # 50MB
```

### Database

Currently using in-memory storage for development. In production, replace with:
- PostgreSQL
- MongoDB
- MySQL

### File Storage

Currently using local file storage. In production, consider:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

## Security Notes

- Change the `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Use proper database with connection pooling
- Implement proper user management
- Add CSRF protection
- Validate file types thoroughly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.