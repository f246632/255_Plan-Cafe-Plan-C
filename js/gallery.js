// ===================================
// Gallery & Lightbox JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', function() {

    // ===================================
    // Lightbox Gallery
    // ===================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const galleryItems = document.querySelectorAll('.gallery-item');

    let currentImageIndex = 0;
    let images = [];

    // Collect all gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            images.push({
                src: item.dataset.image || img.src,
                alt: img.alt
            });

            // Add click event to open lightbox
            item.addEventListener('click', function() {
                currentImageIndex = index;
                openLightbox();
            });

            // Add keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View ${img.alt}`);

            item.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    currentImageIndex = index;
                    openLightbox();
                }
            });
        }
    });

    // Open lightbox
    function openLightbox() {
        lightbox.classList.add('active');
        showImage(currentImageIndex);
        document.body.style.overflow = 'hidden';

        // Focus on close button for accessibility
        lightboxClose.focus();
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Show specific image
    function showImage(index) {
        if (index < 0) {
            currentImageIndex = images.length - 1;
        } else if (index >= images.length) {
            currentImageIndex = 0;
        } else {
            currentImageIndex = index;
        }

        const image = images[currentImageIndex];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;

        // Add loading animation
        lightboxImage.style.opacity = '0';
        setTimeout(() => {
            lightboxImage.style.opacity = '1';
        }, 50);
    }

    // Previous image
    function showPrevImage() {
        showImage(currentImageIndex - 1);
    }

    // Next image
    function showNextImage() {
        showImage(currentImageIndex + 1);
    }

    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function(e) {
        e.stopPropagation();
        showPrevImage();
    });
    lightboxNext.addEventListener('click', function(e) {
        e.stopPropagation();
        showNextImage();
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                showNextImage();
            } else {
                // Swipe right - previous image
                showPrevImage();
            }
        }
    }

    // ===================================
    // Gallery Loading Animation
    // ===================================
    const galleryGrid = document.querySelector('.gallery-grid');

    if (galleryGrid) {
        const galleryObserver = new IntersectionObserver(function(entries) {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    galleryObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        galleryItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            galleryObserver.observe(item);
        });
    }

    // ===================================
    // Image Lazy Loading with Blur Effect
    // ===================================
    const lazyImages = document.querySelectorAll('.gallery-item img');

    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;

                // Add blur effect while loading
                img.style.filter = 'blur(10px)';

                // Load the image
                const tempImage = new Image();
                tempImage.src = img.src;

                tempImage.onload = function() {
                    img.style.filter = 'blur(0)';
                    img.style.transition = 'filter 0.3s ease';
                };

                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // ===================================
    // Preload Next/Previous Images
    // ===================================
    function preloadAdjacentImages(index) {
        const prevIndex = index === 0 ? images.length - 1 : index - 1;
        const nextIndex = index === images.length - 1 ? 0 : index + 1;

        const preloadPrev = new Image();
        const preloadNext = new Image();

        preloadPrev.src = images[prevIndex].src;
        preloadNext.src = images[nextIndex].src;
    }

    // Preload images when lightbox is opened
    lightbox.addEventListener('transitionend', function() {
        if (lightbox.classList.contains('active')) {
            preloadAdjacentImages(currentImageIndex);
        }
    });

    // ===================================
    // Accessibility: Announce image changes
    // ===================================
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0,0,0,0);
        white-space: nowrap;
        border: 0;
    `;
    document.body.appendChild(announcement);

    // Update announcement when image changes
    lightboxImage.addEventListener('load', function() {
        announcement.textContent = `Showing image ${currentImageIndex + 1} of ${images.length}: ${lightboxImage.alt}`;
    });
});
