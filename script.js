
// Cache key for storing API response
const CACHE_KEY = 'youtube_videos_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // Cache expires after 1 hour (in milliseconds)

// Function to fetch YouTube videos from a playlist (more efficient)
async function fetchVideos() {
    // Check if cached data exists and is still valid
    const cachedData = getCachedData();
    if (cachedData) {
        renderVideoList(cachedData);
        return;
    }

    const apiKey = 'AIzaSyCradZiiUnprHyWDXh1Aw5R6Xul5w7MWnk'; // API key when we apply
    const playlistId = 'PLV0pICGsF8HKH5R6mLBvVdkX8o8GPmac6&si=vUayArYZB672Ty7D'; // Playlist ID for uploads
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=5`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if data is received
        if (data.items) {
            // Cache the API response
            cacheData(data.items);
            renderVideoList(data.items);
        } else {
            console.error('No videos found or error fetching data');
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

// Function to get cached data
function getCachedData() {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;

    const { timestamp, data } = JSON.parse(cachedData);

    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
    }

    // Clear expired cache
    localStorage.removeItem(CACHE_KEY);
    return null;
}

// Function to cache data
function cacheData(data) {
    const cache = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// Function to render videos
function renderVideoList(videos) {
    const videoList = document.getElementById('video-list');
    videoList.innerHTML = ''; // Clear any existing content

    videos.forEach(video => {
        // Create a div for each video
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');

        // Create the thumbnail and link to the video
        const thumbnail = document.createElement('img');
        thumbnail.src = video.snippet.thumbnails.medium.url;
        thumbnail.alt = video.snippet.title;

        // Create a container for the text
        const videoText = document.createElement('div');
        videoText.classList.add('video-text');

        // Create a title for the video
        const title = document.createElement('h3');
        title.innerText = video.snippet.title;

        // Create a description for the video
        const description = document.createElement('p');
        description.innerText = video.snippet.description;

        // Add the title and description to the text container
        videoText.appendChild(title);
        videoText.appendChild(description);

        // Add the thumbnail and text container to the video item
        videoItem.appendChild(thumbnail);
        videoItem.appendChild(videoText);

        // Add the video item to the video list
        videoList.appendChild(videoItem);

        // Add event listener to open the video in the popup when clicked
        videoItem.addEventListener('click', () => openVideoPopup(video.snippet.resourceId.videoId));
    });
}

// Function to open the video popup with selected video
function openVideoPopup(videoId) {
    const popup = document.getElementById('video-popup');
    const videoFrameContainer = document.getElementById('video-frame-container');

    // Set up the iframe with the video
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    // Clear any existing iframe content and append the new iframe
    videoFrameContainer.innerHTML = '';
    videoFrameContainer.appendChild(iframe);

    // Show the popup
    popup.classList.add('active');

    // Add event listener to close the popup when clicking outside
    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            closePopup();
        }
    });
}

// Function to close the popup
function closePopup() {
    const popup = document.getElementById('video-popup');
    const videoFrameContainer = document.getElementById('video-frame-container');

    // Remove the iframe to stop the video
    videoFrameContainer.innerHTML = '';

    // Hide the popup
    popup.classList.remove('active');
}

// Fetch videos when the page loads
window.onload = fetchVideos;

// Page navigation function
function goToPage(pageNumber) {
    const container = document.getElementById('container');
    switch (pageNumber) {
        case 1:
            container.style.transform = 'translateX(0)';
            break;
        case 2:
            container.style.transform = 'translateX(-100vw)';
            break;
        case 3:
            container.style.transform = 'translateX(-200vw)';
            break;
        case 4:
            container.style.transform = 'translateX(-300vw)';
            break;
        case 5:
            container.style.transform = 'translateX(-400vw)';
            break;
        case 6:
            container.style.transform = 'translateX(-500vw)';
            break;
        case 7:
            container.style.transform = 'translateX(-600vw)';
            break;
        default:
            container.style.transform = 'translateX(0)';
    }
}




// Theme Toggle Functionality###################################################################################################################################################################\\
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme in localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    updateButtonText(savedTheme);
}

// Toggle Theme
themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateButtonText(newTheme);
});

// Update Button Text
function updateButtonText(theme) {
    themeToggle.innerText = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}


/*/ Testing purposes fake youtube api response
//##################################################################################################################################################################################//
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

// Function to fetch YouTube videos (mock version)
async function fetchVideos() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use mock response
    renderVideoList(mockResponse.items);
}*/


//Continuous scrolling text (ignore for now)
const word = "Lorem/ Ipsum/ ";
const repeatCount = 20;

const marqueeElement = document.getElementById("marquee");

// Fill the marquee with repeated words and duplicate it
const text = word.repeat(repeatCount);
marqueeElement.innerHTML = text + text; // Duplicate content for continuous flow
