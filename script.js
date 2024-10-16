document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('collage-canvas');
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    const leftImageUpload = document.getElementById('left-image-upload');
    const rightImageUpload = document.getElementById('right-image-upload');
    const downloadLink = document.getElementById('download-link');
    const resetButton = document.getElementById('reset-button');
    const errorMessage = document.getElementById('error-message');

    let leftImage = { file: null, image: null, position: { x: 0, y: 0 }, zoom: 1 };
    let rightImage = { file: null, image: null, position: { x: 0, y: 0 }, zoom: 1 };
    let isDragging = false;
    let currentSide = null;

    function handleFileChange(file, side) {
        if (file && file.type.startsWith('image/')) {
            const image = side === 'left' ? leftImage : rightImage;
            image.file = file;
            image.position = { x: 0, y: 0 };
            image.zoom = 1;
            
            const img = new Image();
            img.onload = () => {
                image.image = img;
                errorMessage.textContent = '';
                drawCollage();
            };
            img.onerror = () => {
                errorMessage.textContent = 'Error loading image';
            };
            img.src = URL.createObjectURL(file);
        } else {
            errorMessage.textContent = 'Please upload a valid image file';
        }
    }

    function drawImage(image, ctx, x, width) {
        if (!image.image) return;

        const aspectRatio = image.image.height / image.image.width;
        const height = width * aspectRatio;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, 0, width, 500);
        ctx.clip();
        ctx.drawImage(
            image.image,
            x + image.position.x - (width * image.zoom - width) / 2,
            image.position.y - (height * image.zoom - 500) / 2,
            width * image.zoom,
            height * image.zoom
        );
        ctx.restore();
    }

    function drawCollage() {
        ctx.clearRect(0, 0, 900, 500);
        
        if (!leftImage.image) {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 440, 500);
        }
        if (!rightImage.image) {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(460, 0, 440, 500);
        }

        drawImage(leftImage, ctx, 0, 440);
        drawImage(rightImage, ctx, 460, 440);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.0)';
        ctx.fillRect(440, 0, 20, 500);

        updateDownloadLink();
    }

    function updateDownloadLink() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 900;
        tempCanvas.height = 500;
        const tempCtx = tempCanvas.getContext('2d');

        if (leftImage.image) drawImage(leftImage, tempCtx, 0, 440);
        if (rightImage.image) drawImage(rightImage, tempCtx, 460, 440);

        downloadLink.href = tempCanvas.toDataURL('image/png');
    }

    function handleMove(event) {
        if (!isDragging || !currentSide) return;
        const image = currentSide === 'left' ? leftImage : rightImage;
        image.position.x += event.movementX;
        image.position.y += event.movementY;
        drawCollage();
    }

    function handleZoom(event) {
        event.preventDefault();
        if (!currentSide) return;
        const image = currentSide === 'left' ? leftImage : rightImage;
        const zoomFactor = 1 - event.deltaY * 0.001;
        image.zoom *= zoomFactor;
        image.zoom = Math.max(0.1, Math.min(3, image.zoom));
        drawCollage();
    }

    function reset() {
        leftImage = { file: null, image: null, position: { x: 0, y: 0 }, zoom: 1 };
        rightImage = { file: null, image: null, position: { x: 0, y: 0 }, zoom: 1 };
        errorMessage.textContent = '';
        drawCollage();
    }

    canvas.addEventListener('click', (e) => {
        const clickedSide = e.offsetX < 450 ? 'left' : 'right';
        const image = clickedSide === 'left' ? leftImage : rightImage;
        if (!image.file) {
            (clickedSide === 'left' ? leftImageUpload : rightImageUpload).click();
        }
        currentSide = clickedSide;
    });

    leftImageUpload.addEventListener('change', (e) => handleFileChange(e.target.files[0], 'left'));
    rightImageUpload.addEventListener('change', (e) => handleFileChange(e.target.files[0], 'right'));

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        currentSide = e.offsetX < 450 ? 'left' : 'right';
    });

    document.addEventListener('mousemove', handleMove);

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', handleZoom, { passive: false });

    resetButton.addEventListener('click', reset);

    drawCollage();
});