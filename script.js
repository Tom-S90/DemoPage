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
/* SHOPPING CART CLASS */
/* ==================== */
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadCart();
    }
    
    addItem(id, name, price, quantity = 1) {
        const existingItem = this.items.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ id, name, price: parseFloat(price), quantity });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddToCartFeedback(id);
    }
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartDisplay();
    }
    
    updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
    }
    
    loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        this.items = savedCart ? JSON.parse(savedCart) : [];
    }
    
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }
    
    showAddToCartFeedback(id) {
        const button = document.querySelector(`.add-to-cart[data-id="${id}"]`);
        if (!button) return;
        
        button.textContent = 'Added!';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.style.backgroundColor = '';
        }, 1000);
    }
}

/* ==================== */
/* INITIALIZATION */
/* ==================== */
const cart = new ShoppingCart();

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setActiveNavButton();
    initializeTheme();
    initializeMarquees();
    setupEventListeners();
    fetchContent();
    setupButtonHandlers();
    initializeCart();
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
    document.querySelectorAll('.popup-button').forEach(button => {
        button.removeEventListener('click', handlePopupButtonClick);
        button.addEventListener('click', handlePopupButtonClick);
    });
}

function handlePopupButtonClick(e) {
    e.preventDefault();
    const contentId = this.getAttribute('data-popup-content');
    
    if (contentId === 'subscribe-content') {
        openSubscribePopup();
    } else if (contentId === 'cart-popup-content') {
        updateCartDisplay();
        openContentPopup(contentId);
    } else {
        openContentPopup(contentId);
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
    switchElement.classList.add('clicked');
    
    setTimeout(() => {
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeToggle();
        
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
/* CART FUNCTIONALITY */
/* ==================== */
function initializeCart() {
    setupAddToCartButtons();
    setupViewCartButton();
    setupCheckoutButton();
    updateCartDisplay();
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            
            cart.addItem(id, name, price);
        });
    });
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItemsList) return;
    
    cartItemsList.innerHTML = '';
    
    if (cart.items.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        cartTotal.textContent = 'Total: $0.00';
        return;
    }
    
    cart.items.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <button class="decrease-quantity" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-quantity" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">×</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        
        cartItemsList.appendChild(cartItemElement);
    });
    
    cartTotal.textContent = `Total: $${cart.getTotal().toFixed(2)}`;
    
    setupCartItemControls();
}

function setupCartItemControls() {
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.items.find(item => item.id === id);
            if (item) {
                cart.updateQuantity(id, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const item = cart.items.find(item => item.id === id);
            if (item) {
                cart.updateQuantity(id, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            cart.removeItem(id);
        });
    });
}

function setupViewCartButton() {
    const viewCartButton = document.getElementById('view-cart-button');
    if (viewCartButton) {
        viewCartButton.addEventListener('click', function() {
            openContentPopup('cart-popup-content');
        });
    }
}

function setupCheckoutButton() {
    const checkoutButton = document.getElementById('checkout-button');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            alert(`Thank you for your purchase! Total: $${cart.getTotal().toFixed(2)}`);
            cart.clearCart();
            closeContentPopup();
        });
    }
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
    popupElement.addEventListener('click', (e) => {
        if (e.target === popupElement) {
            closeFunction();
        }
    });
    
    const closeBtn = popupElement.querySelector('.popup-close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeFunction();
        });
    }

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
        
        for (let i = 0; i < 2; i++) {
            const span = document.createElement('span');
            span.textContent = originalContent;
            container.appendChild(span);
        }
        
        marquee.appendChild(container);
        
        const contentWidth = container.firstChild.offsetWidth;
        const duration = (contentWidth / 100) * 1.5;
        
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
