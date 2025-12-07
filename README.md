# Virtuoso Ads

A web application that generates AI-powered product images and videos using the Freepik API.

## Features

- Upload logo and prototype design images
- Select custom color schemes
- Generate product images with AI
- Create promotional videos (6 or 10 seconds)
- Real-time generation status updates

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your Freepik API key to the `.env` file:
```
FREEPIK_API_KEY=your_actual_api_key_here
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. Open the application in your browser
2. Upload a logo image
3. Upload a prototype design image
4. Select your desired color scheme using the color picker
5. Click "Generate Product Image"
6. Wait for the image to generate (up to 5 minutes)
7. Review the generated image
8. Click "Generate Video" to create a promotional video
9. Download your generated assets

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: Freepik AI Image Generation & Video Generation
- **Logging**: Winston
- **File Upload**: Multer

## License

ISC

