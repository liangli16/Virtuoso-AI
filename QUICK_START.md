# Quick Start Guide

## Prerequisites

You need a Freepik API key to use this application. Get one from [Freepik API](https://www.freepik.com/api).

## Setup Steps

### 1. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your Freepik API key:

```
FREEPIK_API_KEY=your_actual_api_key_here
PORT=3000
IMAGE_GENERATION_TIMEOUT=300000
VIDEO_GENERATION_TIMEOUT=600000
```

### 2. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 3. Start the Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Testing the Application

### Manual Testing Steps

1. **Upload Images**
   - Click "Upload Logo" and select a logo image
   - Click "Upload Prototype Design" and select a design mockup
   - Both images should show previews

2. **Select Color Scheme**
   - Use the color picker to choose your brand color
   - The hex value should update automatically

3. **Generate Product Image**
   - Click "Generate Product Image"
   - Wait for the generation (up to 5 minutes)
   - Status updates will show progress
   - Generated image will display when complete

4. **Generate Video**
   - Click "Generate Video" button after image is ready
   - Select video duration (6 or 10 seconds)
   - Optionally enter a custom prompt
   - Click "Generate Video"
   - Wait for video generation (up to 10 minutes)
   - Video will play when complete

5. **Download Assets**
   - Use "Download Image" button to save the product image
   - Use "Download Video" button to save the promotional video

6. **Start New Project**
   - Click "Create New Project" to reset and start over

## Troubleshooting

### API Key Issues
- Error: "FREEPIK_API_KEY is not configured"
  - Solution: Make sure `.env` file exists with valid API key

### File Upload Issues
- Error: "File size exceeds the 10MB limit"
  - Solution: Compress or resize your images before uploading

### Generation Timeout
- If image/video generation times out:
  - Try again (sometimes API is slow)
  - Check Freepik API status
  - Verify your API key has sufficient credits

### Server Won't Start
- Port already in use:
  - Change PORT in `.env` file
  - Or stop other process using port 3000

## API Endpoints

The backend exposes these endpoints:

- `GET /api/health` - Health check
- `POST /api/generate-image` - Start image generation
- `GET /api/image-status/:taskId` - Check image status
- `POST /api/generate-video` - Start video generation
- `GET /api/video-status/:taskId` - Check video status

## Project Structure

```
video-hack/
├── backend/
│   ├── middleware/
│   │   └── upload.js          # File upload handling
│   ├── routes/
│   │   ├── image.js           # Image generation routes
│   │   └── video.js           # Video generation routes
│   ├── services/
│   │   └── freepik.js         # Freepik API integration
│   ├── utils/
│   │   └── logger.js          # Winston logger
│   └── server.js              # Express server
├── frontend/
│   ├── css/
│   │   └── styles.css         # Application styles
│   ├── js/
│   │   ├── api.js             # API client
│   │   ├── ui.js              # UI helpers
│   │   └── app.js             # Main logic
│   └── index.html             # Main page
├── logs/                       # Log files
├── package.json               # Dependencies
├── .env                       # Environment variables
└── README.md                  # Documentation
```

## Development Notes

- All code is heavily commented with JSDoc-style documentation
- Winston logging is used throughout for debugging
- Check `logs/combined.log` for full logs
- Check `logs/error.log` for errors only
- Console logs are available in both browser and server

## Support

For issues with:
- Freepik API: https://www.freepik.com/api/docs
- This application: Check the logs in `logs/` directory

