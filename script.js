// Cache keys for storing API responses
const CACHE_KEY_VIDEOS = 'youtube_videos_cache';
const CACHE_KEY_PODCASTS = 'youtube_podcasts_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // Cache expires after 24 hours

// DOM Elements
const lightToDarkToggle = document.getElementById('light-to-dark-toggle');
const darkToLightToggle = document.getElementById('dark-to-light-toggle');
const body = document.body;
const container = document.getElementById('container');
const videoList = document.getElementById('video-list');
const podcastList = document.getElementById('podcast-list');
const videoPopup = document.getElementById('video-popup');
const videoFrameContainer = document.getElementById('video-frame-container');
const subscribeForm = document.querySelector('.subscribe-form');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set first nav button as active
    document.querySelector('.nav-button-container').classList.add('active');
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeToggle();
    
    // Initialize marquees
    initializeMarquees();
    
    // Set up event listeners
    setupEventListeners();
    
    // Fetch content
    fetchVideos();
    fetchPodcasts();
});

// Setup event listeners
function setupEventListeners() {
    // Theme toggles
    lightToDarkToggle.addEventListener('click', toggleTheme);
    darkToLightToggle.addEventListener('click', toggleTheme);
    
    // Navigation buttons
    const navButtons = document.querySelectorAll('.nav-button-container');
    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => goToPage(index + 1));
    });
    
    // Subscribe form
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', handleSubscribe);
    }
}

// Page navigation
function goToPage(pageNumber) {
    const buttons = document.querySelectorAll('.nav-button-container');
    
    // Update active button
    buttons.forEach(button => button.classList.remove('active'));
    buttons[pageNumber - 1].classList.add('active');
    
    // Scroll to page
    container.style.transform = `translateX(-${(pageNumber - 1) * 100}vw)`;
}

// Theme management
function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        darkToLightToggle.style.display = 'block';
        lightToDarkToggle.style.display = 'none';
    } else {
        darkToLightToggle.style.display = 'none';
        lightToDarkToggle.style.display = 'block';
    }
}

// Video functionality
async function fetchVideos() {
    // Check cache first
    const cachedData = getCachedData(CACHE_KEY_VIDEOS);
    if (cachedData) {
        renderVideoList(cachedData, videoList, 'video');
        return;
    }

    try {
        const apiKey = 'AIzaSyCradZiiUnprHyWDXh1Aw5R6Xul5w7MWnk';
        const playlistId = 'PLV0pICGsF8HKH5R6mLBvVdkX8o8GPmac6'; // Replace with your video playlist ID
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=5`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(CACHE_KEY_VIDEOS, data.items);
            renderVideoList(data.items, videoList, 'video');
        } else {
            console.error('No videos found');
            // Fallback to mock data if needed
            // fetchMockVideos('video');
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        // Fallback to mock data if needed
        // fetchMockVideos('video');
    }
}

// Podcast functionality
async function fetchPodcasts() {
    // Check cache first
    const cachedData = getCachedData(CACHE_KEY_PODCASTS);
    if (cachedData) {
        renderVideoList(cachedData, podcastList, 'podcast');
        return;
    }

    try {
        const apiKey = 'AIzaSyCradZiiUnprHyWDXh1Aw5R6Xul5w7MWnk';
        const playlistId = 'PLV0pICGsF8HKH83-i_Ch6hRRoCT3vZNS3&si=DMvi3qshowcH06j3';
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=5`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(CACHE_KEY_PODCASTS, data.items);
            renderVideoList(data.items, podcastList, 'podcast');
        } else {
            console.error('No podcasts found');
            // Fallback to mock data if needed
            // fetchMockVideos('podcast');
        }
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        // Fallback to mock data if needed
        // fetchMockVideos('podcast');
    }
}

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

function renderVideoList(videos, containerElement, type) {
    containerElement.innerHTML = '';

    // Add a title specific to the content type
    const titleElement = document.createElement('h2');
    titleElement.textContent = type === 'podcast' ? 'Latest Podcast Episodes' : 'Featured Videos';
    titleElement.style.marginBottom = '20px';
    titleElement.style.color = 'var(--accent-color)';
    containerElement.appendChild(titleElement);

    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');

        const thumbnail = document.createElement('img');
        thumbnail.src = video.snippet.thumbnails.medium.url;
        thumbnail.alt = video.snippet.title;

        const videoText = document.createElement('div');
        videoText.classList.add('video-text');

        const title = document.createElement('h3');
        title.textContent = video.snippet.title;

        const description = document.createElement('p');
        description.textContent = video.snippet.description;

        // Add type indicator
        const typeBadge = document.createElement('span');
        typeBadge.textContent = type === 'podcast' ? 'PODCAST' : 'VIDEO';
        typeBadge.style.display = 'inline-block';
        typeBadge.style.backgroundColor = 'var(--accent-color)';
        typeBadge.style.color = 'white';
        typeBadge.style.padding = '2px 8px';
        typeBadge.style.borderRadius = '4px';
        typeBadge.style.fontSize = '0.8rem';
        typeBadge.style.marginBottom = '8px';

        videoText.append(typeBadge, title, description);
        videoItem.append(thumbnail, videoText);
        containerElement.appendChild(videoItem);

        videoItem.addEventListener('click', () => openVideoPopup(video.snippet.resourceId.videoId));
    });
}

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
    videoPopup.classList.add('active');

    // Close when clicking outside the popup content
    videoPopup.addEventListener('click', (e) => {
        if (e.target === videoPopup) closePopup();
    });

    // Close with Escape key
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', handleEscape);
        }
    });
}

function closePopup() {
    videoFrameContainer.innerHTML = '';
    videoPopup.classList.remove('active');
}

// Marquee functionality
function initializeMarquees() {
    const marquees = document.querySelectorAll('.marquee');
    marquees.forEach(marquee => {
        // Create span element if not already present
        let span = marquee.querySelector('span');
        if (!span) {
            span = document.createElement('span');
            span.textContent = marquee.textContent;
            marquee.innerHTML = '';
            marquee.appendChild(span);
        }
        
        // Duplicate content for seamless looping
        span.innerHTML += span.innerHTML;
        
        // Set animation duration based on content length
        const duration = span.textContent.length / 10;
        span.style.animationDuration = `${duration}s`;
    });
}

// Form handling
function handleSubscribe(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    
    if (email && validateEmail(email)) {
        alert(`Thank you for subscribing with ${email}`);
        e.target.reset();
    } else {
        alert('Please enter a valid email address');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mock data for testing
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

// Subscribe Popup Functions
function openSubscribePopup() {
    document.getElementById('subscribe-popup').classList.add('active');
}

function closeSubscribePopup() {
    document.getElementById('subscribe-popup').classList.remove('active');
}

// Content Popup Functions
function openContentPopup(content) {
    const popupBody = document.getElementById('content-popup-body');
    popupBody.innerHTML = content;
    document.getElementById('content-popup').classList.add('active');
}

function closeContentPopup() {
    document.getElementById('content-popup').classList.remove('active');
}

// Handle form submission
document.querySelector('.subscribe-form-popup').addEventListener('submit', function(e) {
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
});

// Set up click handlers for the image buttons
document.addEventListener('DOMContentLoaded', () => {
    // Right image button
    document.querySelectorAll('.right-image-button').forEach(button => {
        button.addEventListener('click', () => {
            openContentPopup('<h2>Mapa de contaminación lumínica</h2><p>Contenido detallado sobre el mapa de contaminación lumínica...</p>');
        });
    });

    // Orb buttons
    document.querySelectorAll('.orb-button').forEach((button, index) => {
        button.addEventListener('click', () => {
            const titles = ['Resplandor del cielo', 'Sobreconsumo', 'Deslumbramiento'];
            openContentPopup(`<h2>${titles[index]}</h2><p>Contenido detallado sobre ${titles[index]}...</p>`);
        });
    });
});
