/* ==================== */
/* CONSTANTS AND CONFIG */
/* ==================== */
const CACHE_KEY_VIDEOS = 'youtube_videos_cache';
const CACHE_KEY_PODCASTS = 'youtube_podcasts_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 24 hours
const YOUTUBE_API_KEY = 'AIzaSyCradZiiUnprHyWDXh1Aw5R6Xul5w7MWnk';
const VIDEO_PLAYLIST_ID = 'PLV0pICGsF8HKH5R6mLBvVdkX8o8GPmac6';
const PODCAST_PLAYLIST_ID = 'PLV0pICGsF8HKH83-i_Ch6hRRoCT3vZNS3&si=DMvi3qshowcH06j3';

/* ==================== */
/* DOM ELEMENTS */
/* ==================== */
const lightToDarkToggle = document.getElementById('light-to-dark-toggle');
const darkToLightToggle = document.getElementById('dark-to-light-toggle');
const body = document.body;
const container = document.getElementById('container');
const videoList = document.getElementById('video-list');
const podcastList = document.getElementById('podcast-list');
const videoPopup = document.getElementById('video-popup');
const videoFrameContainer = document.getElementById('video-frame-container');
const subscribeButton = document.getElementById('subscribe-button');
const subscribePopup = document.getElementById('subscribe-popup');
const contentPopup = document.getElementById('content-popup');

/* ==================== */
/* INITIALIZATION */
/* ==================== */
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setActiveNavButton();
    initializeTheme();
    initializeMarquees();
    setupEventListeners();
    fetchContent();
    setupButtonHandlers();
}

function setActiveNavButton() {
    const buttons = document.querySelectorAll('.nav-button-container');
    buttons[0].classList.add('active');
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeToggle();
}

function fetchContent() {
    fetchVideos();
    fetchPodcasts();
}

/* ==================== */
/* EVENT HANDLERS */
/* ==================== */
function setupEventListeners() {
    setupThemeToggles();
    setupNavButtons();
}

function setupThemeToggles() {
    lightToDarkToggle.addEventListener('click', toggleTheme);
    darkToLightToggle.addEventListener('click', toggleTheme);
}

function setupNavButtons() {
    const navButtons = document.querySelectorAll('.nav-button-container');
    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => goToPage(index + 1));
    });
}

function setupButtonHandlers() {
    // Setup all popup buttons
    document.querySelectorAll('.popup-button').forEach(button => {
        button.removeEventListener('click', handlePopupButtonClick);
        button.addEventListener('click', handlePopupButtonClick);
    });

    // Setup buy buttons in store
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Product added to cart!');
        });
    });
}

function handlePopupButtonClick(e) {
    e.preventDefault();
    const contentId = this.getAttribute('data-popup-content');
    if (contentId) {
        if (contentId === 'subscribe-content') {
            openSubscribePopup();
        } else {
            openContentPopup(contentId);
        }
    }
}

/* ==================== */
/* PAGE FUNCTIONALITY */
/* ==================== */
function goToPage(pageNumber) {
    updateActiveNavButton(pageNumber);
    scrollToPage(pageNumber);
}

function updateActiveNavButton(pageNumber) {
    const buttons = document.querySelectorAll('.nav-button-container');
    buttons.forEach(button => button.classList.remove('active'));
    buttons[pageNumber - 1].classList.add('active');
}

function scrollToPage(pageNumber) {
    container.style.transform = `translateX(-${(pageNumber - 1) * 100}vw)`;
}

/* ==================== */
/* THEME MANAGEMENT */
/* ==================== */
function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    const switchElement = document.querySelector('.light-switch');
    
    // Add pull animation
    switchElement.classList.add('clicked');
    
    setTimeout(() => {
        // Change theme after animation starts
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggle();
        
        // Reset animation after completion
        setTimeout(() => {
            switchElement.classList.remove('clicked');
        }, 300);
    }, 50);
}

function updateThemeToggle() {
    const currentTheme = body.getAttribute('data-theme');
    darkToLightToggle.style.display = currentTheme === 'dark' ? 'block' : 'none';
    lightToDarkToggle.style.display = currentTheme === 'dark' ? 'none' : 'block';
}

/* ==================== */
/* CONTENT FETCHING */
/* ==================== */
async function fetchVideos() {
    const cachedData = getCachedData(CACHE_KEY_VIDEOS);
    if (cachedData) {
        renderVideoList(cachedData, videoList);
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${VIDEO_PLAYLIST_ID}&part=snippet&maxResults=5`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(CACHE_KEY_VIDEOS, data.items);
            renderVideoList(data.items, videoList);
        } else {
            console.error('No videos found');
            fetchMockVideos();
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        fetchMockVideos();
    }
}

async function fetchPodcasts() {
    const cachedData = getCachedData(CACHE_KEY_PODCASTS);
    if (cachedData) {
        renderVideoList(cachedData, podcastList);
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${PODCAST_PLAYLIST_ID}&part=snippet&maxResults=5`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(CACHE_KEY_PODCASTS, data.items);
            renderVideoList(data.items, podcastList);
        } else {
            console.error('No podcasts found');
            fetchMockPodcasts();
        }
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        fetchMockPodcasts();
    }
}

/* ==================== */
/* CACHE MANAGEMENT */
/* ==================== */
function getCachedData(cacheKey) {
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) return null;

    const { timestamp, data } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
    }
    
    localStorage.removeItem(cacheKey);
    return null;
}

function cacheData(cacheKey, data) {
    const cache = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(cacheKey, JSON.stringify(cache));
}

/* ==================== */
/* CONTENT RENDERING */
/* ==================== */
function renderVideoList(items, containerElement) {
    containerElement.innerHTML = '';

    items.forEach(item => {
        const itemElement = createMediaItem(item);
        containerElement.appendChild(itemElement);
    });
}

function createMediaItem(media) {
    const item = document.createElement('div');
    item.classList.add('video-item');

    const thumbnail = document.createElement('img');
    thumbnail.src = media.snippet.thumbnails.medium.url;
    thumbnail.alt = media.snippet.title;

    const textContainer = document.createElement('div');
    textContainer.classList.add('video-text');

    const title = document.createElement('h3');
    title.textContent = media.snippet.title;

    const description = document.createElement('p');
    description.textContent = media.snippet.description;

    textContainer.append(title, description);
    item.append(thumbnail, textContainer);
    
    item.addEventListener('click', () => openVideoPopup(media.snippet.resourceId.videoId));
    
    return item;
}

/* ==================== */
/* POPUP FUNCTIONALITY */
/* ==================== */
function openVideoPopup(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    videoFrameContainer.innerHTML = '';
    videoFrameContainer.appendChild(iframe);
    showPopup(videoPopup);
    setupPopupCloseHandlers(videoPopup, closePopup);
}

function closePopup() {
    videoFrameContainer.innerHTML = '';
    hidePopup(videoPopup);
}

function openSubscribePopup() {
    const popupContent = document.getElementById('subscribe-content').innerHTML;
    document.getElementById('subscribe-popup-html').innerHTML = popupContent;
    showPopup(subscribePopup);
    setupPopupCloseHandlers(subscribePopup, closeSubscribePopup);
    
    const form = document.querySelector('#subscribe-popup .subscribe-form-popup');
    if (form) {
        form.addEventListener('submit', handleSubscribeFormSubmit);
    }
}

function closeSubscribePopup() {
    hidePopup(subscribePopup);
}

function handleSubscribeFormSubmit(e) {
    e.preventDefault();
    const name = this.querySelector('input[type="text"]').value;
    const email = this.querySelector('input[type="email"]').value;
    
    if (name && validateEmail(email)) {
        alert(`Gracias por suscribirte, ${name}! Te hemos enviado un correo a ${email}`);
        this.reset();
        closeSubscribePopup();
    } else {
        alert('Por favor ingresa un nombre y correo electrónico válidos');
    }
}

function openContentPopup(contentId) {
    const contentElement = document.getElementById(contentId);
    if (!contentElement) {
        console.error('Content element not found:', contentId);
        return;
    }
    
    const content = contentElement.innerHTML;
    document.getElementById('content-popup-html').innerHTML = content;
    showPopup(contentPopup);
    setupPopupCloseHandlers(contentPopup, closeContentPopup);
}

function closeContentPopup() {
    hidePopup(contentPopup);
}

function showPopup(popupElement) {
    popupElement.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hidePopup(popupElement) {
    popupElement.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupPopupCloseHandlers(popupElement, closeFunction) {
    // Close when clicking outside content
    popupElement.addEventListener('click', (e) => {
        if (e.target === popupElement) {
            closeFunction();
        }
    });
    
    // Close when clicking the close button
    const closeBtn = popupElement.querySelector('.popup-close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeFunction();
        });
    }

    // Close with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFunction();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/* ==================== */
/* MARQUEE FUNCTIONALITY */
/* ==================== */
function initializeMarquees() {
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach(marquee => {
        const originalContent = marquee.textContent.trim();
        marquee.innerHTML = '';
        
        const container = document.createElement('div');
        container.className = 'marquee-content';
        
        // Create two spans with the content
        for (let i = 0; i < 2; i++) {
            const span = document.createElement('span');
            span.textContent = originalContent;
            container.appendChild(span);
        }
        
        marquee.appendChild(container);
        
        // Calculate duration based on content width
        const contentWidth = container.firstChild.offsetWidth;
        const duration = (contentWidth / 100) * 1.5; // Adjust multiplier for speed
        
        container.style.animationDuration = `${duration}s`;
    });
}

/* ==================== */
/* FORM HANDLING */
/* ==================== */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/* ==================== */
/* MOCK DATA (DEV ONLY) */
/* ==================== */
async function fetchMockVideos() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
        items: [
            {
                snippet: {
                    title: "Understanding Light Pollution",
                    description: "An introduction to the effects of artificial light at night.",
                    thumbnails: {
                        medium: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' }
                    },
                    resourceId: {
                        videoId: 'dQw4w9WgXcQ'
                    }
                }
            },
            {
                snippet: {
                    title: "Solutions for Dark Skies",
                    description: "How we can reduce light pollution in our communities.",
                    thumbnails: {
                        medium: { url: 'https://img.youtube.com/vi/yPYZpwSpKmA/mqdefault.jpg' }
                    },
                    resourceId: {
                        videoId: 'yPYZpwSpKmA'
                    }
                }
            }
        ]
    };
    
    renderVideoList(mockResponse.items, videoList);
}

async function fetchMockPodcasts() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
        items: [
            {
                snippet: {
                    title: "Light Pollution Podcast Ep. 1",
                    description: "Interview with a light pollution researcher.",
                    thumbnails: {
                        medium: { url: 'https://img.youtube.com/vi/tgbNymZ7vqY/mqdefault.jpg' }
                    },
                    resourceId: {
                        videoId: 'tgbNymZ7vqY'
                    }
                }
            },
            {
                snippet: {
                    title: "Urban Lighting Solutions",
                    description: "How cities can implement better lighting policies.",
                    thumbnails: {
                        medium: { url: 'https://img.youtube.com/vi/zpOULjyy-n8/mqdefault.jpg' }
                    },
                    resourceId: {
                        videoId: 'zpOULjyy-n8'
                    }
                }
            }
        ]
    };
    
    renderVideoList(mockResponse.items, podcastList);
}
