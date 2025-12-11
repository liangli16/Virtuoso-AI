/**
 * Main Application Logic
 * Orchestrates the entire application workflow
 * Handles user interactions and coordinates API calls with UI updates
 */

// Application State
const AppState = {
  logoFile: null,
  prototypeFile: null,
  colorScheme: '#00D4FF',
  imageStyle: 'realistic',
  orientation: 'landscape',
  videoContentStyle: 'showcase',
  generatedImageUrl: null,
  imageTaskId: null,
  videoTaskId: null
};

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('App: Initializing Virtuoso Ads');
  
  // Perform health check
  API.healthCheck()
    .then(data => console.log('App: Backend API is healthy', data))
    .catch(err => console.warn('App: Backend API health check failed', err));
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('App: Initialization complete');
});

/**
 * Sets up all event listeners for the application
 */
function setupEventListeners() {
  console.log('App: Setting up event listeners');
  
  // File input listeners
  document.getElementById('logoInput').addEventListener('change', handleLogoUpload);
  document.getElementById('prototypeInput').addEventListener('change', handlePrototypeUpload);
  
  // Remove button listeners
  document.getElementById('removeLogoBtn').addEventListener('click', handleRemoveLogo);
  document.getElementById('removePrototypeBtn').addEventListener('click', handleRemovePrototype);
  
  // Color scheme listener
  document.getElementById('colorScheme').addEventListener('input', handleColorSchemeChange);
  
  // Style selector listeners (chip buttons)
  document.querySelectorAll('.style-chip').forEach(chip => {
    chip.addEventListener('click', handleStyleChange);
  });
  
  // Orientation toggle listeners
  document.querySelectorAll('.orientation-btn').forEach(btn => {
    btn.addEventListener('click', handleOrientationChange);
  });
  
  // Generate image button
  document.getElementById('generateImageBtn').addEventListener('click', handleGenerateImage);
  
  // Image retry button
  document.getElementById('retryImageBtn').addEventListener('click', handleGenerateImage);
  
  // Generate video button
  document.getElementById('generateVideoBtn').addEventListener('click', handleShowVideoConfig);
  
  // Video content style listeners
  document.querySelectorAll('.video-style-card').forEach(card => {
    card.addEventListener('click', handleVideoStyleChange);
  });
  
  // Start video generation button
  document.getElementById('startVideoBtn').addEventListener('click', handleGenerateVideo);
  
  // Video retry button
  document.getElementById('retryVideoBtn').addEventListener('click', handleShowVideoConfig);
  
  // Create new project button
  document.getElementById('createNewBtn').addEventListener('click', handleCreateNew);
}

/**
 * Handles logo file upload
 * @param {Event} event - File input change event
 */
function handleLogoUpload(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  console.log('App: Logo file selected', { name: file.name, size: file.size, type: file.type });
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('Logo file is too large. Maximum size is 10MB.');
    event.target.value = '';
    return;
  }
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Invalid file type. Please upload an image file (JPG, PNG, GIF, or WEBP).');
    event.target.value = '';
    return;
  }
  
  // Store file in state
  AppState.logoFile = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    UI.showImagePreview('logoPreview', 'logoPreviewImg', e.target.result);
  };
  reader.readAsDataURL(file);
  
  // Check if both files are ready
  checkGenerateButtonState();
}

/**
 * Handles prototype file upload
 * @param {Event} event - File input change event
 */
function handlePrototypeUpload(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  console.log('App: Prototype file selected', { name: file.name, size: file.size, type: file.type });
  
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    alert('Prototype file is too large. Maximum size is 10MB.');
    event.target.value = '';
    return;
  }
  
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Invalid file type. Please upload an image file (JPG, PNG, GIF, or WEBP).');
    event.target.value = '';
    return;
  }
  
  // Store file in state
  AppState.prototypeFile = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    UI.showImagePreview('prototypePreview', 'prototypePreviewImg', e.target.result);
  };
  reader.readAsDataURL(file);
  
  // Check if both files are ready
  checkGenerateButtonState();
}

/**
 * Handles logo removal
 */
function handleRemoveLogo() {
  console.log('App: Removing logo');
  AppState.logoFile = null;
  document.getElementById('logoInput').value = '';
  UI.hideImagePreview('logoPreview');
  checkGenerateButtonState();
}

/**
 * Handles prototype removal
 */
function handleRemovePrototype() {
  console.log('App: Removing prototype');
  AppState.prototypeFile = null;
  document.getElementById('prototypeInput').value = '';
  UI.hideImagePreview('prototypePreview');
  checkGenerateButtonState();
}

/**
 * Handles color scheme changes
 * @param {Event} event - Color input change event
 */
function handleColorSchemeChange(event) {
  const color = event.target.value;
  AppState.colorScheme = color;
  document.getElementById('colorValue').textContent = color.toUpperCase();
  console.log('App: Color scheme changed', { color });
}

/**
 * Handles image style selection
 * @param {Event} event - Click event on style chip
 */
function handleStyleChange(event) {
  const chip = event.currentTarget;
  const style = chip.dataset.style;
  
  // Update state
  AppState.imageStyle = style;
  
  // Update UI - remove selected class from all, add to clicked
  document.querySelectorAll('.style-chip').forEach(c => {
    c.classList.remove('selected');
  });
  chip.classList.add('selected');
  
  console.log('App: Image style changed', { style });
}

/**
 * Handles orientation selection
 * @param {Event} event - Click event on orientation button
 */
function handleOrientationChange(event) {
  const btn = event.currentTarget;
  const orientation = btn.dataset.orientation;
  
  // Update state
  AppState.orientation = orientation;
  
  // Update UI - remove selected class from all, add to clicked
  document.querySelectorAll('.orientation-btn').forEach(b => {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
  
  console.log('App: Orientation changed', { orientation });
}

/**
 * Checks if generate button should be enabled
 * Enables button only when both files are selected
 */
function checkGenerateButtonState() {
  const canGenerate = AppState.logoFile && AppState.prototypeFile;
  
  if (canGenerate) {
    UI.enableButton('generateImageBtn');
    console.log('App: Generate button enabled');
  } else {
    UI.disableButton('generateImageBtn');
    console.log('App: Generate button disabled - waiting for both files');
  }
}

/**
 * Handles image generation workflow
 */
async function handleGenerateImage() {
  console.log('App: Starting image generation workflow');
  
  // Validate state
  if (!AppState.logoFile || !AppState.prototypeFile) {
    alert('Please upload both logo and prototype images');
    return;
  }
  
  try {
    // Disable generate button during processing
    UI.disableButton('generateImageBtn');
    
    // Show loading state
    UI.showImageLoading();
    UI.scrollToSection('imageSection');
    
    // Initiate image generation
    console.log('App: Calling API to generate image');
    const initResult = await API.generateImage(
      AppState.logoFile,
      AppState.prototypeFile,
      AppState.colorScheme,
      AppState.imageStyle,
      AppState.orientation
    );
    
    // Store task ID
    AppState.imageTaskId = initResult.task_id;
    console.log('App: Image generation task started', { taskId: AppState.imageTaskId });
    
    // Poll for completion
    console.log('App: Polling for image completion');
    const result = await API.pollImageStatus(
      AppState.imageTaskId,
      300000, // 5 minutes timeout
      (status) => {
        // Update UI with progress
        UI.updateImageLoadingStatus(status);
      }
    );
    
    // Store generated image URL
    AppState.generatedImageUrl = result.imageUrl;
    
    // Show result
    UI.showImageResult(result.imageUrl);
    console.log('App: Image generation completed successfully');
    
  } catch (error) {
    console.error('App: Image generation failed', error);
    UI.showImageError(error.message || 'Failed to generate image. Please try again.');
  } finally {
    // Re-enable generate button
    UI.enableButton('generateImageBtn');
  }
}

/**
 * Handles video content style selection
 * @param {Event} event - Click event on video style card
 */
function handleVideoStyleChange(event) {
  const card = event.currentTarget;
  const style = card.dataset.videoStyle;
  
  // Update state
  AppState.videoContentStyle = style;
  
  // Update UI - remove selected class from all, add to clicked
  document.querySelectorAll('.video-style-card').forEach(c => {
    c.classList.remove('selected');
  });
  card.classList.add('selected');
  
  console.log('App: Video content style changed', { style });
}

/**
 * Shows video configuration section
 */
function handleShowVideoConfig() {
  console.log('App: Showing video configuration');
  UI.showVideoConfig();
  UI.scrollToSection('videoSection');
}

/**
 * Handles video generation workflow
 */
async function handleGenerateVideo() {
  console.log('App: Starting video generation workflow');
  
  // Validate that we have a generated image
  if (!AppState.generatedImageUrl) {
    alert('No generated image available. Please generate an image first.');
    return;
  }
  
  try {
    // Get user inputs
    const duration = parseInt(document.getElementById('videoDuration').value);
    const videoContentStyle = AppState.videoContentStyle;
    const imageStyle = AppState.imageStyle; // Pass image style to align video with it
    
    console.log('App: Video generation parameters', { duration, videoContentStyle, imageStyle });
    
    // Disable start button during processing
    UI.disableButton('startVideoBtn');
    
    // Show loading state
    UI.showVideoLoading();
    
    // Initiate video generation
    console.log('App: Calling API to generate video');
    const initResult = await API.generateVideo(
      AppState.generatedImageUrl,
      duration,
      videoContentStyle,
      imageStyle
    );
    
    // Store task ID
    AppState.videoTaskId = initResult.task_id;
    console.log('App: Video generation task started', { taskId: AppState.videoTaskId });
    
    // Poll for completion
    console.log('App: Polling for video completion');
    const result = await API.pollVideoStatus(
      AppState.videoTaskId,
      600000, // 10 minutes timeout
      (status) => {
        // Update UI with progress
        UI.updateVideoLoadingStatus(status);
      }
    );
    
    // Show result
    UI.showVideoResult(result.videoUrl);
    console.log('App: Video generation completed successfully');
    
  } catch (error) {
    console.error('App: Video generation failed', error);
    UI.showVideoError(error.message || 'Failed to generate video. Please try again.');
  } finally {
    // Re-enable start button
    UI.enableButton('startVideoBtn');
  }
}

/**
 * Handles creating a new project (reset application)
 */
function handleCreateNew() {
  console.log('App: Creating new project');
  
  // Confirm with user
  const confirmed = confirm('Are you sure you want to start a new project? Current progress will be lost.');
  
  if (confirmed) {
    // Reset application state
    AppState.logoFile = null;
    AppState.prototypeFile = null;
    AppState.colorScheme = '#00D4FF';
    AppState.imageStyle = 'realistic';
    AppState.orientation = 'landscape';
    AppState.videoContentStyle = 'showcase';
    AppState.generatedImageUrl = null;
    AppState.imageTaskId = null;
    AppState.videoTaskId = null;
    
    // Reset UI
    UI.resetApp();
    
    console.log('App: Application reset complete');
  }
}

// Export state for debugging (optional)
window.AppState = AppState;
console.log('App: Application loaded and ready');

