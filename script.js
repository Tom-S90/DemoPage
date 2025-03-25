// Cache key for storing API response
const CACHE_KEY = 'youtube_videos_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // Cache expires after 24 hours

// DOM Elements
const lightToDarkToggle = document.getElementById('light-to-dark-toggle');
const darkToLightToggle = document.getElementById('dark-to-light-toggle');
const body = document.body;
const container = document.getElementById('container');
const videoList = document.getElementById('video-list');
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
    
    // Fetch videos
    fetchVideos();
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
    const cachedData = getCachedData();
    if (cachedData) {
        renderVideoList(cachedData);
        return;
    }

    try {
        const apiKey = 'AIzaSyCradZiiUnprHyWDXh1Aw5R6Xul5w7MWnk';
        const playlistId = 'PLV0pICGsF8HKH5R6mLBvVdkX8o8GPmac6';
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=5`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            cacheData(data.items);
            renderVideoList(data.items);
        } else {
            console.error('No videos found');
            // Fallback to mock data if needed
            // fetchMockVideos();
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        // Fallback to mock data if needed
        // fetchMockVideos();
    }
}

function getCachedData() {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;

    const { timestamp, data } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
    }
    
    localStorage.removeItem(CACHE_KEY);
    return null;
}

function cacheData(data) {
    const cache = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function renderVideoList(videos) {
    videoList.innerHTML = '';

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

        videoText.append(title, description);
        videoItem.append(thumbnail, videoText);
        videoList.appendChild(videoItem);

        videoItem.addEventListener('click', () => openVideoPopup(video.snippet.resourceId.videoId));
    });
}

function openVideoPopup(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    videoFrameContainer.innerHTML = '';
    videoFrameContainer.appendChild(iframe);
    videoPopup.classList.add('active');

    videoPopup.addEventListener('click', (e) => {
        if (e.target === videoPopup) closePopup();
    });
}

function closePopup() {
    videoFrameContainer.innerHTML = '';
    videoPopup.classList.remove('active');
}

// Marquee functionality
function initializeMarquees() {
    const marquees = document.querySelectorAll('.marquee span');
    marquees.forEach(marquee => {
        // Duplicate content for seamless looping
        marquee.innerHTML += marquee.innerHTML;
        
        // Set animation duration based on content length
        const duration = marquee.textContent.length / 10;
        marquee.style.animationDuration = `${duration}s`;
    });
}

// Form handling
function handleSubscribe(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    if (email) {
        alert(`Thank you for subscribing with ${email}`);
        e.target.reset();
    }
}

// Mock data for testing. Please ignore. Will remove later if no longer needed. 

async function fetchMockVideos() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
        items: [
            {
                id: { videoId: 'dQw4w9WgXcQ' },
                snippet: {
                    title: 'Sample Video 1',
                    description: 'This is a sample video description.',
                    thumbnails: {
                        medium: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg' }
                    }
                }
            },
            {
                id: { videoId: 'yPYZpwSpKmA' },
                snippet: {
                    title: 'Sample Video 2',
                    description: 'This is another sample video description.',
                    thumbnails: {
                        medium: { url: 'https://img.youtube.com/vi/yPYZpwSpKmA/mqdefault.jpg' }
                    }
                }
            }
        ]
    };
    
    renderVideoList(mockResponse.items);
}
