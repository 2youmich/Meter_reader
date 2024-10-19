<template>
  <div class="container">
    <input type="file" @change="onImageUpload" accept="image/*" />

    <div
      v-if="imageSrc"
      class="image-wrapper"
      @mousedown="startCrop"
      @mousemove="drawCrop"
      @mouseup="endCrop"
      @mouseleave="endCrop"
      :style="{ cursor: isCropping ? 'crosshair' : 'default' }"
    >
      <img ref="image" :src="imageSrc" class="image" @load="onImageLoad" />
      <div
        v-if="isCropping"
        class="crop-box"
        :style="{
          top: cropArea.y + 'px',
          left: cropArea.x + 'px',
          width: cropArea.width + 'px',
          height: cropArea.height + 'px'
        }"
      ></div>
    </div>

    <button v-if="imageSrc" @click="cropImage">Crop Image</button>

    <div v-if="croppedImage" class="cropped-preview">
      <h3>Cropped Image:</h3>
      <img :src="croppedImage" alt="Cropped" />

      <button @click="extractText">Extract Text</button>
    </div>

    <div v-if="extractedText" class="text-output">
      <h3>Extracted Text:</h3>
      <pre>{{ extractedText }}</pre>
    </div>
  </div>
</template>

<script>
import Tesseract from 'tesseract.js';

export default {
  data() {
    return {
      imageSrc: null,
      isCropping: false,
      cropArea: { x: 0, y: 0, width: 0, height: 0 },
      startCoords: { x: 0, y: 0 },
      imageSize: { width: 0, height: 0 },
      croppedImage: null,
      extractedText: '',
    };
  },
  methods: {
    onImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageSrc = e.target.result;
          this.resetState();
        };
        reader.readAsDataURL(file);
      }
    },
    onImageLoad() {
      const image = this.$refs.image;
      this.imageSize.width = image.naturalWidth;
      this.imageSize.height = image.naturalHeight;
    },
    startCrop(event) {
      event.preventDefault();
      this.isCropping = true;
      this.startCoords = { x: event.offsetX, y: event.offsetY };
      this.cropArea = { x: this.startCoords.x, y: this.startCoords.y, width: 0, height: 0 };
    },
    drawCrop(event) {
      if (!this.isCropping) return;
      const width = event.offsetX - this.startCoords.x;
      const height = event.offsetY - this.startCoords.y;
      this.cropArea.width = Math.max(width, 0);
      this.cropArea.height = Math.max(height, 0);
    },
    endCrop() {
      this.isCropping = false;
    },
    cropImage() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = this.$refs.image;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const cropWidth = this.cropArea.width * scaleX;
      const cropHeight = this.cropArea.height * scaleY;

      if (cropWidth <= 0 || cropHeight <= 0) {
        console.error('Invalid crop dimensions');
        return;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        image,
        this.cropArea.x * scaleX,
        this.cropArea.y * scaleY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      this.croppedImage = canvas.toDataURL('image/png');
    },
    async extractText() {
      if (!this.croppedImage) return;

      try {
        const { data: { text } } = await Tesseract.recognize(
          this.croppedImage,
          'eng',
          { logger: (m) => console.log(m) } // Optional: Logs progress
        );
        this.extractedText = text;
      } catch (error) {
        console.error('Error extracting text:', error);
      }
    },
    resetState() {
      this.isCropping = false;
      this.cropArea = { x: 0, y: 0, width: 0, height: 0 };
      this.startCoords = { x: 0, y: 0 };
      this.extractedText = '';
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

input[type="file"] {
  margin-bottom: 10px;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  cursor: crosshair;
}

.image {
  max-width: 100%;
  display: block;
}

.crop-box {
  position: absolute;
  border: 2px dashed #00f;
  background-color: rgba(0, 0, 255, 0.3);
  pointer-events: none;
}

.cropped-preview {
  margin-top: 20px;
}

.text-output {
  margin-top: 20px;
  white-space: pre-wrap;
}
</style>
