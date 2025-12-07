/**
 * UI Helper Module
 * Manages DOM manipulation and UI state changes
 * Provides reusable functions for showing/hiding elements and updating content
 */

const UI = {
  /**
   * Shows an element by removing the 'hidden' class
   * @param {string|HTMLElement} element - Element ID or HTMLElement
   */
  show(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
      el.classList.remove('hidden');
    }
  },

  /**
   * Hides an element by adding the 'hidden' class
   * @param {string|HTMLElement} element - Element ID or HTMLElement
   */
  hide(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
      el.classList.add('hidden');
    }
  },

  /**
   * Toggles element visibility
   * @param {string|HTMLElement} element - Element ID or HTMLElement
   */
  toggle(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
      el.classList.toggle('hidden');
    }
  },

  /**
   * Checks if an element is currently hidden
   * @param {string|HTMLElement} element - Element ID or HTMLElement
   * @returns {boolean} True if element is hidden
   */
  isHidden(element) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    return el ? el.classList.contains('hidden') : true;
  },

  /**
   * Sets text content of an element
   * @param {string|HTMLElement} element - Element ID or HTMLElement
   * @param {string} text - Text content to set
   */
  setText(element, text) {
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    if (el) {
      el.textContent = text;
    }
  },

  /**
   * Enables a button element
   * @param {string|HTMLElement} button - Button ID or HTMLElement
   */
  enableButton(button) {
    const btn = typeof button === 'string' ? document.getElementById(button) : button;
    if (btn) {
      btn.disabled = false;
    }
  },

  /**
   * Disables a button element
   * @param {string|HTMLElement} button - Button ID or HTMLElement
   */
  disableButton(button) {
    const btn = typeof button === 'string' ? document.getElementById(button) : button;
    if (btn) {
      btn.disabled = true;
    }
  },

  /**
   * Shows image section with loading state
   */
  showImageLoading() {
    console.log('UI: Showing image loading state');
    this.show('imageSection');
    this.show('imageLoading');
    this.hide('imageResult');
    this.hide('imageError');
  },

  /**
   * Updates image loading status text
   * @param {string} status - Status message to display
   */
  updateImageLoadingStatus(status) {
    console.log('UI: Updating image loading status', { status });
    this.setText('imageLoadingText', `Status: ${status}`);
  },

  /**
   * Shows image generation result
   * @param {string} imageUrl - URL of the generated image
   */
  showImageResult(imageUrl) {
    console.log('UI: Showing image result', { imageUrl });
    
    this.hide('imageLoading');
    this.hide('imageError');
    this.show('imageResult');
    
    // Set image source
    const img = document.getElementById('generatedImage');
    img.src = imageUrl;
    
    // Set download link
    const downloadBtn = document.getElementById('downloadImageBtn');
    downloadBtn.href = imageUrl;
  },

  /**
   * Shows image generation error
   * @param {string} errorMessage - Error message to display
   */
  showImageError(errorMessage) {
    console.log('UI: Showing image error', { errorMessage });
    
    this.hide('imageLoading');
    this.hide('imageResult');
    this.show('imageError');
    
    this.setText('imageErrorMessage', errorMessage);
  },

  /**
   * Shows video section with configuration form
   */
  showVideoConfig() {
    console.log('UI: Showing video configuration');
    this.show('videoSection');
    this.show('videoConfig');
    this.hide('videoLoading');
    this.hide('videoResult');
    this.hide('videoError');
  },

  /**
   * Shows video section with loading state
   */
  showVideoLoading() {
    console.log('UI: Showing video loading state');
    this.hide('videoConfig');
    this.show('videoLoading');
    this.hide('videoResult');
    this.hide('videoError');
  },

  /**
   * Updates video loading status text
   * @param {string} status - Status message to display
   */
  updateVideoLoadingStatus(status) {
    console.log('UI: Updating video loading status', { status });
    this.setText('videoLoadingText', `Status: ${status}`);
  },

  /**
   * Shows video generation result
   * @param {string} videoUrl - URL of the generated video
   */
  showVideoResult(videoUrl) {
    console.log('UI: Showing video result', { videoUrl });
    
    this.hide('videoConfig');
    this.hide('videoLoading');
    this.hide('videoError');
    this.show('videoResult');
    
    // Set video source
    const video = document.getElementById('generatedVideo');
    video.src = videoUrl;
    video.load(); // Reload video element
    
    // Set download link
    const downloadBtn = document.getElementById('downloadVideoBtn');
    downloadBtn.href = videoUrl;
  },

  /**
   * Shows video generation error
   * @param {string} errorMessage - Error message to display
   */
  showVideoError(errorMessage) {
    console.log('UI: Showing video error', { errorMessage });
    
    this.hide('videoConfig');
    this.hide('videoLoading');
    this.hide('videoResult');
    this.show('videoError');
    
    this.setText('videoErrorMessage', errorMessage);
  },

  /**
   * Resets the entire application to initial state
   */
  resetApp() {
    console.log('UI: Resetting application');
    
    // Hide all sections except upload
    this.hide('imageSection');
    this.hide('videoSection');
    
    // Reset image section
    this.hide('imageResult');
    this.hide('imageLoading');
    this.hide('imageError');
    
    // Reset video section
    this.hide('videoResult');
    this.hide('videoLoading');
    this.hide('videoError');
    this.show('videoConfig');
    
    // Clear file inputs and previews
    document.getElementById('logoInput').value = '';
    document.getElementById('prototypeInput').value = '';
    this.hide('logoPreview');
    this.hide('prototypePreview');
    
    // Reset color scheme (new default is cyan)
    document.getElementById('colorScheme').value = '#00D4FF';
    document.getElementById('colorValue').textContent = '#00D4FF';
    
    // Reset style selection (chips)
    document.querySelectorAll('.style-chip').forEach(chip => {
      chip.classList.remove('selected');
    });
    const realisticChip = document.querySelector('.style-chip[data-style="realistic"]');
    if (realisticChip) {
      realisticChip.classList.add('selected');
    }
    
    // Reset orientation selection
    document.querySelectorAll('.orientation-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    const landscapeBtn = document.querySelector('.orientation-btn[data-orientation="landscape"]');
    if (landscapeBtn) {
      landscapeBtn.classList.add('selected');
    }
    
    // Reset video configuration
    document.getElementById('videoDuration').value = '6';
    document.getElementById('videoPrompt').value = '';
    
    // Disable generate button
    this.disableButton('generateImageBtn');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Shows image preview thumbnail
   * @param {string} previewId - ID of preview container
   * @param {string} imgId - ID of image element
   * @param {string} imageDataUrl - Data URL of the image
   */
  showImagePreview(previewId, imgId, imageDataUrl) {
    const preview = document.getElementById(previewId);
    const img = document.getElementById(imgId);
    
    if (preview && img) {
      img.src = imageDataUrl;
      this.show(preview);
      
      // Hide the upload label
      const uploadBox = preview.closest('.upload-box');
      if (uploadBox) {
        const label = uploadBox.querySelector('.upload-label');
        if (label) {
          label.style.display = 'none';
        }
      }
    }
  },

  /**
   * Hides image preview thumbnail and shows upload label
   * @param {string} previewId - ID of preview container
   */
  hideImagePreview(previewId) {
    const preview = document.getElementById(previewId);
    
    if (preview) {
      this.hide(preview);
      
      // Show the upload label
      const uploadBox = preview.closest('.upload-box');
      if (uploadBox) {
        const label = uploadBox.querySelector('.upload-label');
        if (label) {
          label.style.display = 'flex';
        }
      }
    }
  },

  /**
   * Shows a toast notification (simple implementation)
   * @param {string} message - Message to display
   * @param {string} type - Type of notification (success, error, info)
   */
  showToast(message, type = 'info') {
    console.log(`UI Toast [${type}]:`, message);
    // Simple alert for now - can be enhanced with custom toast UI
    alert(message);
  },

  /**
   * Smoothly scrolls to a section
   * @param {string} sectionId - ID of section to scroll to
   */
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

