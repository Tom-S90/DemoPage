/* ==================== */
/* CONSTANTS AND CONFIG */
/* ==================== */
const CACHE_KEY_VIDEOS = 'youtube_videos_cache';
const CACHE_KEY_PODCASTS = 'youtube_podcasts_cache';
const CACHE_EXPIRY = 60 * 60 * 1000;
const YOUTUBE_API_KEY = 'AIzaSyCradZiiUnprHyWDXh1Aw5R6Xul5w7MWnk';
const VIDEO_PLAYLIST_ID = 'PLV0pICGsF8HKH5R6mLBvVdkX8o8GPmac6';
const PODCAST_PLAYLIST_ID = 'PLV0pICGsF8HKH83-i_Ch6hRRoCT3vZNS3&si=DMvi3qshowcH06j3';

// debug mode flag
const debug_MODE = false;

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
/* debugGING TOOLS DON'T ACTIVATE UNLESS NECESSARY, SLOWS DOWN PAGE. */
/* ==================== */

function debugLog(message, data = null) {
    if (debug_MODE) {
        console.log(`[debug] ${message}`, data || '');
    }
}

function showdebugPanel() {
    if (!debug_MODE) return;
    
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    
    debugPanel.innerHTML = `
        <h3 style="margin:0 0 5px 0;">debug Panel</h3>
        <button id="debug-clear-cart" style="margin:2px;">Clear Cart</button>
        <button id="debug-add-test-item" style="margin:2px;">Add Test Item</button>
        <button id="debug-log-cart" style="margin:2px;">Log Cart</button>
        <button id="debug-toggle-theme" style="margin:2px;">Toggle Theme</button>
        <div id="debug-status" style="margin-top:5px;"></div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // debug button handlers
    document.getElementById('debug-clear-cart').addEventListener('click', () => {
        cart.clearCart();
        updatedebugStatus('Cart cleared');
    });
    
    document.getElementById('debug-add-test-item').addEventListener('click', () => {
        cart.addItem('debug-1', 'debug Item', '9.99');
        updatedebugStatus('Test item added');
    });
    
    document.getElementById('debug-log-cart').addEventListener('click', () => {
        debugLog('Current Cart:', cart.items);
        updatedebugStatus('Cart logged to console');
    });
    
    document.getElementById('debug-toggle-theme').addEventListener('click', toggleTheme);
}

function updatedebugStatus(message) {
    if (!debug_MODE) return;
    const statusElement = document.getElementById('debug-status');
    if (statusElement) {
        statusElement.textContent = message;
        setTimeout(() => statusElement.textContent = '', 2000);
    }
}
/* ==================== */
/* SHOPPING CART CLASS */
/* ==================== */
class ShoppingCart {
    constructor() {
        this.items = [];
        this.loadCart();
        this.setupCartEventListeners();
        debugLog('Cart initialized', this.items);
    }
    
    addItem(id, name, price, quantity = 1) {
        debugLog(`Adding item: ${name} (ID: ${id})`, {price, quantity});
        
        const existingItem = this.items.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            debugLog(`Item exists, updated quantity to ${existingItem.quantity}`);
        } else {
            this.items.push({ 
                id, 
                name, 
                price: parseFloat(price), 
                quantity 
            });
            debugLog('New item added to cart');
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showAddToCartFeedback(id);
        this.dispatchCartUpdateEvent();
    }
    
    removeItem(id) {
        debugLog(`Removing item with ID: ${id}`);
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartDisplay();
        this.dispatchCartUpdateEvent();
    }
    
    updateQuantity(id, newQuantity) {
        debugLog(`Updating quantity for item ${id} to ${newQuantity}`);
        const item = this.items.find(item => item.id === id);
        
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(id);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.dispatchCartUpdateEvent();
            }
        }
    }
    
    getTotal() {
        const total = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        debugLog('Calculating cart total', {total});
        return total;
    }
    
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        debugLog('Cart saved to localStorage', this.items);
    }
    
    loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        this.items = savedCart ? JSON.parse(savedCart) : [];
        debugLog('Cart loaded from localStorage', this.items);
    }
    
    clearCart() {
        debugLog('Clearing cart');
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.dispatchCartUpdateEvent();
    }
    
    showAddToCartFeedback(id) {
        const button = document.querySelector(`.add-to-cart[data-id="${id}"]`);
        if (!button) {
            debugLog(`Add to cart button not found for ID: ${id}`);
            return;
        }
        
        const originalContent = button.innerHTML;
        button.innerHTML = 'Added!';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.backgroundColor = '';
        }, 1000);
    }
    
    updateCartDisplay() {
        debugLog('Updating cart display');
        const cartItemsList = document.getElementById('cart-items-list');
        const cartTotal = document.getElementById('cart-total');
        const cartFinalTotal = document.getElementById('cart-final-total');
        
        if (!cartItemsList) {
            debugLog('Cart items list element not found');
            return;
        }
        
        cartItemsList.innerHTML = '';
        
        if (this.items.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = 'Total: $0.00';
            if (cartFinalTotal) cartFinalTotal.textContent = 'Total: $0.00';
            debugLog('Cart is empty, showing empty message');
            return;
        }
        
        this.items.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <img src="assets/both/${item.name.replace(/\s+/g, '')}.webp" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
                    <div class="cart-item-controls">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                        <button class="remove-item" data-id="${item.id}">×</button>
                    </div>
                </div>
            `;
            
            cartItemsList.appendChild(cartItemElement);
        });
        
        const total = this.getTotal().toFixed(2);
        if (cartTotal) cartTotal.textContent = `Total: $${total}`;
        if (cartFinalTotal) cartFinalTotal.textContent = `Total: $${total}`;
        
        this.setupCartItemControls();
    }
    
    setupCartItemControls() {
        debugLog('Setting up cart item controls');
        
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = button.getAttribute('data-id');
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = button.getAttribute('data-id');
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = button.getAttribute('data-id');
                this.removeItem(id);
            });
        });
    }
    
    setupCartEventListeners() {
        debugLog('Setting up cart event listeners');
        
        // Handle page changes to ensure cart updates
        document.addEventListener('pageChanged', () => {
            debugLog('Page changed, updating cart display');
            this.updateCartDisplay();
        });
        
        // Handle popup opens to ensure cart updates
        document.addEventListener('popupOpened', (e) => {
            if (e.detail.popupId === 'cart-popup-content') {
                debugLog('Cart popup opened, updating display');
                this.updateCartDisplay();
            }
        });
    }
    
    dispatchCartUpdateEvent() {
        const event = new CustomEvent('cartUpdated', {
            detail: { items: this.items, total: this.getTotal() }
        });
        document.dispatchEvent(event);
        debugLog('Dispatched cartUpdated event', event.detail);
    }
}

/* ==================== */
/* INITIALIZATION */
/* ==================== */
const cart = new ShoppingCart();

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    debugLog('Initializing application');
    setActiveNavButton();
    initializeTheme();
    initializeMarquees();
    setupEventListeners();
    fetchContent();
    setupButtonHandlers();
    initializeCart();
    setupAddToCartButtons();
    setupViewCartButton();
    setupCheckoutButton();
    
    if (debug_MODE) {
        showdebugPanel();
    }
}

function setActiveNavButton() {
    const buttons = document.querySelectorAll('.nav-button-container');
    buttons[0].classList.add('active');
    debugLog('Set active nav button');
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeToggle();
    debugLog('Theme initialized', savedTheme);
}

function fetchContent() {
    debugLog('Fetching content');
    fetchVideos();
    fetchPodcasts();
}

function setupAddToCartButtons() {
    debugLog('Setting up add to cart buttons');
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.removeEventListener('click', handleAddToCartClick);
    });
    
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCartClick);
    });
}

function handleAddToCartClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const id = this.getAttribute('data-id');
    const name = this.getAttribute('data-name');
    const price = this.getAttribute('data-price');
    
    debugLog('Add to cart button clicked', {id, name, price});
    cart.addItem(id, name, price);
}

function setupViewCartButton() {
    const viewCartButton = document.getElementById('view-cart-button');
    if (viewCartButton) {
        viewCartButton.addEventListener('click', function(e) {
            e.preventDefault();
            debugLog('View cart button clicked');
            openContentPopup('cart-popup-content');
        });
    } else {
        debugLog('View cart button not found');
    }
}

function setupCheckoutButton() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('#checkout-button')) {
            e.preventDefault();
            debugLog('Checkout button clicked');
            
            if (cart.items.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Clear the cart
            cart.clearCart();
            
            // Show confirmation message
            alert(`Thank you for your purchase! Your order has been processed.`);
            
            // Close the popup
            closeContentPopup();
            
            // Reload the page to reset to main page
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    });
}

/* ==================== */
/* EVENT HANDLERS */
/* ==================== */
function setupEventListeners() {
    debugLog('Setting up event listeners');
    setupThemeToggles();
    setupNavButtons();
}

function setupThemeToggles() {
    debugLog('Setting up theme toggles');
    lightToDarkToggle.addEventListener('click', toggleTheme);
    darkToLightToggle.addEventListener('click', toggleTheme);
}

function setupNavButtons() {
    debugLog('Setting up nav buttons');
    const navButtons = document.querySelectorAll('.nav-button-container');
    navButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            debugLog(`Nav button ${index + 1} clicked`);
            goToPage(index + 1);
        });
    });
}

function setupButtonHandlers() {
    debugLog('Setting up button handlers');
    document.querySelectorAll('.popup-button').forEach(button => {
        button.removeEventListener('click', handlePopupButtonClick);
        button.addEventListener('click', handlePopupButtonClick);
    });
}

function handlePopupButtonClick(e) {
    e.preventDefault();
    const contentId = this.getAttribute('data-popup-content');
    
    if (this.closest('.blog-item, .article-card')) {
        const isFirstItem = this.closest('.blog-item:nth-child(1), .article-card:nth-child(1)');
        if (!isFirstItem) {
            openContentPopup('subscribe-prompt-content');
            return;
        }
    }
    if (contentId === 'subscribe-content') {
        openSubscribePopup();
    } else if (contentId === 'cart-popup-content') {
        cart.updateCartDisplay();
        openContentPopup(contentId);
    } else {
        openContentPopup(contentId);
    }
}

/* ==================== */
/* PAGE FUNCTIONALITY */
/* ==================== */
function goToPage(pageNumber) {
    debugLog(`Navigating to page ${pageNumber}`);
    updateActiveNavButton(pageNumber);
    scrollToPage(pageNumber);
    
    // Dispatch page change event
    const event = new CustomEvent('pageChanged', {
        detail: { pageNumber }
    });
    document.dispatchEvent(event);
}

function updateActiveNavButton(pageNumber) {
    const buttons = document.querySelectorAll('.nav-button-container');
    buttons.forEach(button => button.classList.remove('active'));
    buttons[pageNumber - 1].classList.add('active');
    debugLog(`Updated active nav button to page ${pageNumber}`);
}

function scrollToPage(pageNumber) {
    container.style.transform = `translateX(-${(pageNumber - 1) * 100}vw)`;
    debugLog(`Scrolled to page ${pageNumber}`);
}

/* ==================== */
/* THEME MANAGEMENT */
/* ==================== */
function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    debugLog(`Toggling theme from ${currentTheme} to ${newTheme}`);
    
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
    debugLog('Updated theme toggle display');
}

/* ==================== */
/* CONTENT FETCHING */
/* ==================== */
async function fetchVideos() {
    debugLog('Fetching videos');
    const cachedData = getCachedData(CACHE_KEY_VIDEOS);
    if (cachedData) {
        debugLog('Using cached video data');
        renderVideoList(cachedData, videoList);
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${VIDEO_PLAYLIST_ID}&part=snippet&maxResults=5`;
        debugLog('Fetching videos from YouTube API', {apiUrl});
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            debugLog('Received video data from API', {itemCount: data.items.length});
            cacheData(CACHE_KEY_VIDEOS, data.items);
            renderVideoList(data.items, videoList);
        } else {
            console.error('No videos found');
            debugLog('No videos found in API response');
            fetchMockVideos();
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        debugLog('Error fetching videos', error);
        fetchMockVideos();
    }
}

async function fetchPodcasts() {
    debugLog('Fetching podcasts');
    const cachedData = getCachedData(CACHE_KEY_PODCASTS);
    if (cachedData) {
        debugLog('Using cached podcast data');
        renderVideoList(cachedData, podcastList);
        return;
    }

    try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&playlistId=${PODCAST_PLAYLIST_ID}&part=snippet&maxResults=5`;
        debugLog('Fetching podcasts from YouTube API', {apiUrl});
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            debugLog('Received podcast data from API', {itemCount: data.items.length});
            cacheData(CACHE_KEY_PODCASTS, data.items);
            renderVideoList(data.items, podcastList);
        } else {
            console.error('No podcasts found');
            debugLog('No podcasts found in API response');
            fetchMockPodcasts();
        }
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        debugLog('Error fetching podcasts', error);
        fetchMockPodcasts();
    }
}

/* ==================== */
/* CACHE MANAGEMENT */
/* ==================== */
function getCachedData(cacheKey) {
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) {
        debugLog(`No cached data found for key: ${cacheKey}`);
        return null;
    }

    const { timestamp, data } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
        debugLog(`Using valid cached data for key: ${cacheKey}`);
        return data;
    }
    
    debugLog(`Cached data expired for key: ${cacheKey}`);
    localStorage.removeItem(cacheKey);
    return null;
}

function cacheData(cacheKey, data) {
    const cache = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(cacheKey, JSON.stringify(cache));
    debugLog(`Data cached for key: ${cacheKey}`, {itemCount: data.length});
}

/* ==================== */
/* CONTENT RENDERING */
/* ==================== */
function renderVideoList(items, containerElement) {
    debugLog(`Rendering video list with ${items.length} items`);
    containerElement.innerHTML = '';

    items.forEach(item => {
        const itemElement = createMediaItem(item);
        containerElement.appendChild(itemElement);
    });
}

function createMediaItem(media) {
    debugLog('Creating media item', {title: media.snippet.title});
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
    
    item.addEventListener('click', () => {
        debugLog('Media item clicked', {videoId: media.snippet.resourceId.videoId});
        openVideoPopup(media.snippet.resourceId.videoId);
    });
    
    return item;
}

/* ==================== */
/* CART FUNCTIONALITY */
/* ==================== */
function initializeCart() {
    debugLog('Initializing cart');
    setupAddToCartButtons();
    setupViewCartButton();
    setupCheckoutButton();
    cart.updateCartDisplay();
}

/* ==================== */
/* POPUP FUNCTIONALITY */
/* ==================== */
function openVideoPopup(videoId) {
    debugLog(`Opening video popup for video ID: ${videoId}`);
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
    debugLog('Closing video popup');
    videoFrameContainer.innerHTML = '';
    hidePopup(videoPopup);
}

function openSubscribePopup() {
    debugLog('Opening subscribe popup');
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
    debugLog('Closing subscribe popup');
    hidePopup(subscribePopup);
}

function handleSubscribeFormSubmit(e) {
    e.preventDefault();
    const nameInput = this.querySelector('input[type="text"]');
    const emailInput = this.querySelector('input[type="email"]');
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    debugLog('Subscribe form submitted', {name, email});
    
    if (name && validateEmail(email)) {
        // Save to localStorage
        const subscriber = {
            name: name,
            email: email,
            date: new Date().toISOString()
        };
        
        // Get existing subscribers or create new array
        const subscribers = JSON.parse(localStorage.getItem('subscribers')) || [];
        
        // Check if email already exists
        const existingIndex = subscribers.findIndex(sub => sub.email === email);
        if (existingIndex >= 0) {
            // Update existing subscriber
            subscribers[existingIndex] = subscriber;
        } else {
            // Add new subscriber
            subscribers.push(subscriber);
        }
        
        // Save back to localStorage
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
        
        alert(`Gracias por suscribirte, ${name}! Te hemos enviado un correo a ${email}`);
        this.reset();
        closeSubscribePopup();
    } else {
        alert('Por favor ingresa un nombre y correo electrónico válidos');
    }
}

function openContentPopup(contentId) {
    debugLog(`Opening content popup for: ${contentId}`);
    const contentElement = document.getElementById(contentId);
    if (!contentElement) {
        console.error('Content element not found:', contentId);
        debugLog(`Content element not found: ${contentId}`);
        return;
    }
    
    const content = contentElement.innerHTML;
    document.getElementById('content-popup-html').innerHTML = content;
    showPopup(contentPopup);
    setupPopupCloseHandlers(contentPopup, closeContentPopup);
    
    // Dispatch popup opened event
    const event = new CustomEvent('popupOpened', {
        detail: { popupId: contentId }
    });
    document.dispatchEvent(event);
}

function closeContentPopup() {
    debugLog('Closing content popup');
    hidePopup(contentPopup);
}

function showPopup(popupElement) {
    debugLog(`Showing popup: ${popupElement.id}`);
    popupElement.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hidePopup(popupElement) {
    debugLog(`Hiding popup: ${popupElement.id}`);
    popupElement.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupPopupCloseHandlers(popupElement, closeFunction) {
    debugLog(`Setting up close handlers for popup: ${popupElement.id}`);
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
    debugLog('Initializing marquees');
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
    debugLog('Fetching mock videos');
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
    debugLog('Fetching mock podcasts');
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
