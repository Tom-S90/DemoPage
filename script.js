/* ==================== */
/* CONSTANTS AND CONFIG */
/* ==================== */
const CACHE_KEY_VIDEOS = 'youtube_videos_cache';
const CACHE_KEY_PODCASTS = 'youtube_podcasts_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
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
    setupSubscribeButton();
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

function setupSubscribeButton() {
    if (subscribeButton) {
        subscribeButton.addEventListener('click', (e) => {
            e.preventDefault();
            openSubscribePopup();
        });
    }
}

function setupButtonHandlers() {
    // Setup all popup buttons
    document.querySelectorAll('.popup-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const contentId = this.getAttribute('data-popup-content');
            if (contentId) {
                openContentPopup(contentId);
            }
        });
    });

    // Setup buy buttons in store
    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Product added to cart!');
        });
    });
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
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
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
        renderVideoList(cachedData, videoList, 'video');
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${VIDEO_PLAYLIST_ID}&part=snippet&maxResults=5`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(CACHE_KEY_VIDEOS, data.items);
            renderVideoList(data.items, videoList, 'video');
        } else {
            console.error('No videos found');
            fetchMockVideos('video');
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        fetchMockVideos('video');
    }
}

async function fetchPodcasts() {
    const cachedData = getCachedData(CACHE_KEY_PODCASTS);
    if (cachedData) {
        renderVideoList(cachedData, podcastList, 'podcast');
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${PODCAST_PLAYLIST_ID}&part=snippet&maxResults=5`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(CACHE_KEY_PODCASTS, data.items);
            renderVideoList(data.items, podcastList, 'podcast');
        } else {
            console.error('No podcasts found');
            fetchMockVideos('podcast');
        }
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        fetchMockVideos('podcast');
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
function renderVideoList(videos, containerElement, type) {
    containerElement.innerHTML = '';

    // Add title
    const titleElement = document.createElement('h2');
    titleElement.textContent = type === 'podcast' ? 'Latest Podcast Episodes' : 'Featured Videos';
    titleElement.style.marginBottom = '20px';
    titleElement.style.color = 'var(--accent-color)';
    containerElement.appendChild(titleElement);

    // Render each video
    videos.forEach(video => {
        const videoItem = createVideoItem(video, type);
        containerElement.appendChild(videoItem);
    });
}

function createVideoItem(video, type) {
    const videoItem = document.createElement('div');
    videoItem.classList.add('video-item');

    const thumbnail = document.createElement('img');
    thumbnail.src = video.snippet.thumbnails.medium.url;
    thumbnail.alt = video.snippet.title;

    const videoText = document.createElement('div');
    videoText.classList.add('video-text');

    const typeBadge = createTypeBadge(type);
    const title = createVideoTitle(video.snippet.title);
    const description = createVideoDescription(video.snippet.description);

    videoText.append(typeBadge, title, description);
    videoItem.append(thumbnail, videoText);
    
    videoItem.addEventListener('click', () => openVideoPopup(video.snippet.resourceId.videoId));
    
    return videoItem;
}

function createTypeBadge(type) {
    const typeBadge = document.createElement('span');
    typeBadge.textContent = type === 'podcast' ? 'PODCAST' : 'VIDEO';
    typeBadge.style.display = 'inline-block';
    typeBadge.style.backgroundColor = 'var(--accent-color)';
    typeBadge.style.color = 'white';
    typeBadge.style.padding = '2px 8px';
    typeBadge.style.borderRadius = '4px';
    typeBadge.style.fontSize = '0.8rem';
    typeBadge.style.marginBottom = '8px';
    return typeBadge;
}

function createVideoTitle(titleText) {
    const title = document.createElement('h3');
    title.textContent = titleText;
    return title;
}

function createVideoDescription(descriptionText) {
    const description = document.createElement('p');
    description.textContent = descriptionText;
    return description;
}

/* ==================== */
/* POPUP FUNCTIONALITY */
/* ==================== */
// Video Popup
function openVideoPopup(videoId) {
    const iframe = createVideoIframe(videoId);
    videoFrameContainer.innerHTML = '';
    videoFrameContainer.appendChild(iframe);
    showPopup(videoPopup);
    setupPopupCloseHandlers(videoPopup, closePopup);
}

function createVideoIframe(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    return iframe;
}

function closePopup() {
    videoFrameContainer.innerHTML = '';
    hidePopup(videoPopup);
}

// Subscribe Popup
function openSubscribePopup() {
    const popupContent = document.getElementById('subscribe-content').innerHTML;
    document.getElementById('subscribe-popup-html').innerHTML = popupContent;
    showPopup(subscribePopup);
    
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

// Content Popup
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

// Generic Popup Functions
function showPopup(popupElement) {
    popupElement.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hidePopup(popupElement) {
    popupElement.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupPopupCloseHandlers(popupElement, closeFunction) {
    // Click outside
    popupElement.addEventListener('click', (e) => {
        if (e.target === popupElement) closeFunction();
    });

    // Escape key
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
        let span = marquee.querySelector('span') || createMarqueeSpan(marquee);
        setupMarqueeAnimation(span);
    });
}

function createMarqueeSpan(marquee) {
    const span = document.createElement('span');
    span.textContent = marquee.textContent;
    marquee.innerHTML = '';
    marquee.appendChild(span);
    return span;
}

function setupMarqueeAnimation(span) {
    span.innerHTML += span.innerHTML;
    const duration = span.textContent.length / 10;
    span.style.animationDuration = `${duration}s`;
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
async function fetchMockVideos(type) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
        items: [
            {
                snippet: {
                    title: `Sample ${type === 'podcast' ? 'Podcast' : 'Video'} 1`,
                    description: `This is a sample ${type} description.`,
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
                    title: `Sample ${type === 'podcast' ? 'Podcast' : 'Video'} 2`,
                    description: `This is another sample ${type} description.`,
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
    
    renderVideoList(mockResponse.items, type === 'podcast' ? podcastList : videoList, type);
}
