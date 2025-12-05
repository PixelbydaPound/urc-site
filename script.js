// Sample product data - replace with your actual products
const products = {
    records: [
        { id: 1, name: "URC 001", price: "$25", category: "records" },
        { id: 2, name: "URC 002", price: "$25", category: "records" },
    ],
    zines: [
        { id: 3, name: "URC Zine 001", price: "$15", category: "zines" },
        { id: 4, name: "URC Zine 002", price: "$15", category: "zines" },
    ],
    merchandise: [
        { id: 5, name: "URC T-Shirt", price: "$30", category: "merchandise" },
        { id: 6, name: "URC Tote Bag", price: "$20", category: "merchandise" },
    ]
};

// SoundCloud Configuration
const SOUNDCLOUD_PLAYLIST_URL = 'https://soundcloud.com/urcrecordsnash/sets/from-the-crate';
// Note: For full functionality, you may need a SoundCloud Client ID
// Get one at: https://developers.soundcloud.com/
const SOUNDCLOUD_CLIENT_ID = ''; // Optional: Add your client ID for better API access

let podcastEpisodes = [];
let soundcloudWidget = null;

// Music player tracks - add your tracks here
const musicTracks = [
    {
        id: 1,
        title: "Track 001",
        artist: "URC",
        audioUrl: "", // Add your audio file URL here
        thumbnail: "" // Optional: Add thumbnail image URL
    },
    {
        id: 2,
        title: "Track 002",
        artist: "URC",
        audioUrl: "", // Add your audio file URL here
        thumbnail: "" // Optional: Add thumbnail image URL
    }
];

let currentCategory = null;
let currentTrackIndex = 0;
let isPlaying = false;
let audioPlayer = null;
let audioContext = null;
let analyser = null;
let bpmDetector = null;
let currentBPM = null;

// Initialize page
// Navigation Menu Functionality
function initNavMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenuClose = document.getElementById('navMenuClose');
    const navMenu = document.getElementById('navMenu');
    const navMenuOverlay = document.getElementById('navMenuOverlay');
    const navMenuLinks = document.querySelectorAll('.nav-menu-link');

    function openNavMenu() {
        navMenu.classList.add('active');
        navMenuOverlay.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeNavMenu() {
        navMenu.classList.remove('active');
        navMenuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openNavMenu);
    }

    if (navMenuClose) {
        navMenuClose.addEventListener('click', closeNavMenu);
    }

    if (navMenuOverlay) {
        navMenuOverlay.addEventListener('click', closeNavMenu);
    }

    // Close menu when clicking on nav links
    navMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(closeNavMenu, 300); // Delay to allow navigation
        });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeNavMenu();
        }
    });
}

// Scroll reveal functionality
function initScrollReveal() {
    const shopSection = document.getElementById('records');
    let hasScrolled = false;

    // Show sections when user scrolls
    function handleScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const revealPoint = window.innerHeight * 0.3;

        if (!hasScrolled && scrollY > revealPoint) {
            hasScrolled = true;
            
            // Reveal shop section
            if (shopSection) {
                shopSection.style.display = 'block';
                shopSection.style.visibility = 'visible';
                setTimeout(() => {
                    shopSection.classList.add('revealed');
                }, 100);
            }
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also trigger on initial load if already scrolled
    handleScroll();
}

// Add fade-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize cart count
function initCart() {
    const cart = JSON.parse(localStorage.getItem('urcCart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initCart();
    setupCategoryButtons();
    setupNavigation();
    fetchSoundCloudPlaylist();
    initMusicPlayer();
    initNavMenu();
    initScrollReveal();
    
    // Update play button when audio starts/stops
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.addEventListener('play', () => {
            isPlaying = true;
            updatePlayButton();
        });
        audioPlayer.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayButton();
        });
    }
});

function setupCategoryButtons() {
    // Only set up category buttons on index page, not on product pages
    const buttons = document.querySelectorAll('.category-card .brutal-btn');
    buttons.forEach((button, index) => {
        // Skip if it's already a link
        if (button.tagName === 'A') return;
        
        button.addEventListener('click', () => {
            const categories = ['records', 'zines', 'merchandise'];
            showProducts(categories[index]);
        });
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            if (target === '#shop') {
                window.scrollTo({ top: document.querySelector('.shop-section').offsetTop - 80, behavior: 'smooth' });
            } else if (target === '#podcast') {
                window.scrollTo({ top: document.querySelector('.podcast-section').offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

function showProducts(category) {
    currentCategory = category;
    const productsGrid = document.getElementById('productsGrid');
    const categoryProducts = products[category] || [];
    
    productsGrid.innerHTML = '';
    
    if (categoryProducts.length === 0) {
        productsGrid.innerHTML = '<p style="color: #ffffff; text-align: center; grid-column: 1 / -1;">No products available in this category.</p>';
        return;
    }
    
    categoryProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Create image placeholder or use product image if available
        const imageHtml = product.image 
            ? `<img src="${product.image}" alt="${product.name}" />`
            : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); font-size: 14px;">${product.name}</div>`;
        
        productCard.innerHTML = `
            <div class="product-image">${imageHtml}</div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-price">${product.price}</p>
                <button class="brutal-btn add-to-cart-btn" data-product-id="${product.id}">ADD TO CART</button>
            </div>
        `;
        
        // Make entire card clickable to go to product detail page
        productCard.style.cursor = 'pointer';
        productCard.addEventListener('click', (e) => {
            // Don't navigate if clicking the button
            if (!e.target.closest('.add-to-cart-btn')) {
                window.location.href = `product.html?id=${product.id}&category=${category}`;
            }
        });
        
        // Add click handler for add to cart (stops propagation to prevent navigation)
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.id);
            });
        }
        
        productsGrid.appendChild(productCard);
    });
    
    // Scroll to products section if on main page
    const productsSection = document.querySelector('.products-section');
    if (productsSection && (window.location.pathname === '/' || window.location.pathname.includes('index.html'))) {
        setTimeout(() => {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function addToCart(productId, quantity = 1) {
    // Simple cart functionality
    let cart = JSON.parse(localStorage.getItem('urcCart') || '[]');
    const product = Object.values(products).flat().find(p => p.id === productId);
    
    if (product) {
        // Add quantity copies
        for (let i = 0; i < quantity; i++) {
            cart.push({...product, quantity: 1});
        }
        localStorage.setItem('urcCart', JSON.stringify(cart));
        
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = cart.length;
        }
        
        // Show feedback (you can enhance this with a toast notification)
        console.log(`Added ${quantity}x ${product.name} to cart`);
    }
}

// Load product detail page
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const category = urlParams.get('category') || 'records';
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    const product = products[category]?.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update breadcrumb
    const categoryLink = document.getElementById('categoryLink');
    const productNameBreadcrumb = document.getElementById('productNameBreadcrumb');
    if (categoryLink) {
        const categoryName = category === 'zines' ? 'zines' : category === 'merchandise' ? 'merchandise' : 'records';
        categoryLink.textContent = categoryName.toUpperCase();
        categoryLink.href = `${categoryName === 'zines' ? 'zines' : categoryName === 'merchandise' ? 'merchandise' : 'records'}.html`;
    }
    if (productNameBreadcrumb) {
        productNameBreadcrumb.textContent = product.name;
    }
    
    // Update product title
    const titleEl = document.getElementById('productDetailTitle');
    if (titleEl) {
        titleEl.textContent = product.name;
    }
    
    // Update product image
    const imageEl = document.getElementById('productImageLarge');
    if (imageEl) {
        if (product.image) {
            imageEl.innerHTML = `<img src="${product.image}" alt="${product.name}" />`;
        } else {
            imageEl.innerHTML = `<div class="product-image-placeholder">${product.name}</div>`;
        }
    }
    
    // Update price
    const priceEl = document.getElementById('productPriceLarge');
    if (priceEl) {
        priceEl.textContent = product.price;
    }
    
    // Update format selector
    const formatSelector = document.getElementById('formatSelector');
    if (formatSelector) {
        const formats = product.formats || [{ name: category === 'zines' ? 'Print' : category === 'merchandise' ? 'Standard' : '12" Vinyl', price: product.price }];
        formatSelector.innerHTML = '';
        formats.forEach((format, index) => {
            const formatBtn = document.createElement('button');
            formatBtn.className = 'format-btn' + (index === 0 ? ' active' : '');
            formatBtn.textContent = format.name;
            formatBtn.dataset.price = format.price || product.price;
            formatBtn.addEventListener('click', () => {
                document.querySelectorAll('.format-btn').forEach(btn => btn.classList.remove('active'));
                formatBtn.classList.add('active');
                if (priceEl) {
                    priceEl.textContent = formatBtn.dataset.price;
                }
            });
            formatSelector.appendChild(formatBtn);
        });
    }
    
    // Quantity selector
    const quantityInput = document.getElementById('quantityInput');
    const quantityDecrease = document.getElementById('quantityDecrease');
    const quantityIncrease = document.getElementById('quantityIncrease');
    
    if (quantityDecrease) {
        quantityDecrease.addEventListener('click', () => {
            const current = parseInt(quantityInput.value) || 1;
            if (current > 1) {
                quantityInput.value = current - 1;
            }
        });
    }
    
    if (quantityIncrease) {
        quantityIncrease.addEventListener('click', () => {
            const current = parseInt(quantityInput.value) || 1;
            quantityInput.value = current + 1;
        });
    }
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            addToCart(productId, quantity);
            // Visual feedback
            addToCartBtn.textContent = 'ADDED';
            setTimeout(() => {
                addToCartBtn.textContent = 'ADD TO CART';
            }, 2000);
        });
    }
    
    // Update description
    const descriptionEl = document.getElementById('productDescription');
    if (descriptionEl) {
        descriptionEl.innerHTML = product.description || `<p>${product.name} - Available now via Underrated Art Creations.</p>`;
    }
    
    // Update track previews - only show for records category
    const trackPreviews = document.getElementById('trackPreviews');
    if (trackPreviews) {
        if (category === 'records' && product.tracks && product.tracks.length > 0) {
            trackPreviews.style.display = 'block';
            const previewTracksList = document.getElementById('previewTracksList');
            if (previewTracksList) {
                previewTracksList.innerHTML = '';
                product.tracks.forEach((track, index) => {
                    const trackItem = document.createElement('div');
                    trackItem.className = 'preview-track-item';
                    trackItem.innerHTML = `
                        <div class="track-info">
                            <span class="track-number">${track.position}</span>
                            <span class="track-name">${track.name}</span>
                        </div>
                        <div class="track-player">
                            ${track.previewUrl ? `
                                <audio controls class="track-audio">
                                    <source src="${track.previewUrl}" type="audio/mpeg">
                                </audio>
                            ` : '<span class="no-preview">No preview available</span>'}
                        </div>
                    `;
                    previewTracksList.appendChild(trackItem);
                });
            }
        } else {
            // Hide track previews for zines and merchandise
            trackPreviews.style.display = 'none';
        }
    }
}

// Fetch SoundCloud Playlist
async function fetchSoundCloudPlaylist() {
    const episodesContainer = document.getElementById('podcastEpisodes');
    episodesContainer.innerHTML = '<p>Loading podcast episodes...</p>';
    
    // Load SoundCloud Widget SDK and create widget
    loadSoundCloudWidget();
}

// Load SoundCloud Widget and extract tracks
function loadSoundCloudWidget() {
    // Create a hidden iframe for SoundCloud widget to extract track data
    const widgetIframe = document.createElement('iframe');
    widgetIframe.id = 'soundcloud-widget';
    widgetIframe.style.display = 'none';
    widgetIframe.allow = 'autoplay';
    widgetIframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(SOUNDCLOUD_PLAYLIST_URL)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`;
    
    document.body.appendChild(widgetIframe);
    
    // Wait for SoundCloud Widget API to be available
    const checkWidget = setInterval(() => {
        if (window.SC && window.SC.Widget) {
            clearInterval(checkWidget);
            
            soundcloudWidget = window.SC.Widget(widgetIframe);
            
            soundcloudWidget.bind(window.SC.Widget.Events.READY, () => {
                try {
                    soundcloudWidget.getSounds((sounds) => {
                        if (sounds && Array.isArray(sounds) && sounds.length > 0) {
                            podcastEpisodes = sounds.map((sound, index) => ({
                                id: sound.id,
                                title: sound.title || `Episode ${index + 1}`,
                                artist: sound.user?.username || 'URC',
                                description: sound.description || 'From the crate',
                                permalink: sound.permalink_url,
                                artwork: sound.artwork_url || sound.user?.avatar_url,
                                duration: sound.duration,
                                streamUrl: sound.stream_url
                            }));
                            
                            // Also populate music tracks for bottom player
                            musicTracks.length = 0;
                            sounds.forEach((sound, index) => {
                                musicTracks.push({
                                    id: sound.id,
                                    title: sound.title || `Track ${index + 1}`,
                                    artist: sound.user?.username || 'URC',
                                    audioUrl: '',
                                    thumbnail: sound.artwork_url || sound.user?.avatar_url || '',
                                    permalink: sound.permalink_url,
                                    soundcloudId: sound.id
                                });
                            });
                            
                            // Set up metadata updates for current track
                            soundcloudWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, () => {
                                updatePlayerMetadata();
                            });
                            
                            soundcloudWidget.bind(window.SC.Widget.Events.PLAY, () => {
                                updatePlayerMetadata();
                            });
                            
                            loadPodcastEpisodes();
                        } else {
                            // Fallback: Show embedded playlist
                            fetchPlaylistViaOEmbed();
                        }
                    });
                } catch (error) {
                    console.error('Error getting sounds:', error);
                    fetchPlaylistViaOEmbed();
                }
            });
            
            // Timeout fallback
            setTimeout(() => {
                if (podcastEpisodes.length === 0) {
                    fetchPlaylistViaOEmbed();
                }
            }, 5000);
        }
    }, 100);
    
    // Fallback after 3 seconds
    setTimeout(() => {
        if (!soundcloudWidget) {
            clearInterval(checkWidget);
            fetchPlaylistViaOEmbed();
        }
    }, 3000);
}

// Fallback: Fetch playlist info via oEmbed and embed widget
async function fetchPlaylistViaOEmbed() {
    const episodesContainer = document.getElementById('podcastEpisodes');
    
    // Embed the full SoundCloud playlist widget
    episodesContainer.innerHTML = `
        <div class="podcast-episode" style="grid-column: 1 / -1;">
            <h3>FROM THE CRATE</h3>
            <p>URC Podcast Series - Full Playlist</p>
            <iframe 
                width="100%" 
                height="450" 
                scrolling="no" 
                frameborder="no" 
                allow="autoplay" 
                src="https://w.soundcloud.com/player/?url=${encodeURIComponent(SOUNDCLOUD_PLAYLIST_URL)}&color=%23000000&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true">
            </iframe>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.7;">Click play on any episode above to listen</p>
        </div>
    `;
    
    // Try to initialize widget for bottom player control
    setTimeout(() => {
        const iframe = episodesContainer.querySelector('iframe');
        if (iframe && window.SC && window.SC.Widget) {
            try {
                soundcloudWidget = window.SC.Widget(iframe);
            } catch (e) {
                console.log('Could not initialize widget:', e);
            }
        }
    }, 1000);
}

function loadPodcastEpisodes() {
    const episodesContainer = document.getElementById('podcastEpisodes');
    
    if (podcastEpisodes.length === 0) {
        episodesContainer.innerHTML = '<p>No episodes available yet.</p>';
        return;
    }
    
    episodesContainer.innerHTML = '';
    
    // Define custom order mapping based on image:
    // Top row: Francula (Vol 5), Victor Reyes (Vol 4), Samuel Tagger (Vol 2)
    // Bottom row: 4niq (Vol 1), Yeppec (Vol 3)
    // Final order: Francula=0, Victor=1, Samuel Tagger=2, 4niq=3, Yeppec=4
    const orderMapping = {
        'francula': 0,
        'victor': 1,
        'victor reyes': 1,  // Also check for full name
        'samuel tagger': 2,
        'samuel': 2,  // Also check for just "samuel"
        'tagger': 2,  // Also check for "tagger"
        '4niq': 3,
        'yeppec': 4
    };
    
    // Helper function to find episode order index
    function getEpisodeOrderIndex(episode) {
        const titleLower = (episode.title || '').toLowerCase();
        const artistLower = (episode.artist || '').toLowerCase();
        const searchText = titleLower + ' ' + artistLower;
        
        // Check for each episode name in order mapping
        for (const [name, order] of Object.entries(orderMapping)) {
            if (searchText.includes(name)) {
                return order;
            }
        }
        // If not found, put at end
        return 10;
    }
    
    // Create array with original index and sort by custom order
    const episodesWithIndex = podcastEpisodes.map((episode, originalIndex) => ({
        episode,
        originalIndex,
        orderIndex: getEpisodeOrderIndex(episode)
    }));
    
    // Sort by order index
    episodesWithIndex.sort((a, b) => a.orderIndex - b.orderIndex);
    
    // Display episodes in the sorted order
    episodesWithIndex.forEach((item, displayIndex) => {
        const { episode, originalIndex } = item;
        
        const episodeCard = document.createElement('div');
        episodeCard.className = 'podcast-episode';
        
        // Get artwork URL - use large size if available
        let artworkUrl = '';
        if (episode.artwork) {
            // Replace 'large' with 't500x500' for better quality, or use original
            artworkUrl = episode.artwork.replace('large', 't500x500') || episode.artwork;
        }
        
        episodeCard.innerHTML = `
            <div class="podcast-episode-artwork">
                ${artworkUrl ? `<img src="${artworkUrl}" alt="${episode.title}" />` : '<div class="podcast-episode-artwork-placeholder">URC</div>'}
            </div>
            <h3>${episode.title}</h3>
            <button class="brutal-btn play-episode-btn" data-index="${originalIndex}" data-permalink="${episode.permalink || ''}" data-soundcloud-id="${episode.id}">
                PLAY
            </button>
        `;
        
        episodesContainer.appendChild(episodeCard);
    });
    
    // Add event listeners to play buttons
    document.querySelectorAll('.play-episode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            const soundcloudId = e.target.getAttribute('data-soundcloud-id');
            playSoundCloudTrack(index, soundcloudId);
        });
    });
}

// Play SoundCloud track in bottom player
function playSoundCloudTrack(index, soundcloudId) {
    if (index >= 0 && index < musicTracks.length) {
        currentTrackIndex = index;
        const track = musicTracks[index];
        
        // Update player UI with track info
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('trackArtist').textContent = track.artist;
        
        // Update thumbnail
        const thumbnail = document.querySelector('.player-thumbnail');
        if (track.thumbnail) {
            thumbnail.innerHTML = `<img src="${track.thumbnail}" alt="${track.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            thumbnail.innerHTML = '<div class="thumbnail-placeholder">URC</div>';
        }
        
        // Use SoundCloud widget to play track
        if (soundcloudWidget && track.permalink) {
            soundcloudWidget.load(track.permalink, {
                auto_play: true
            });
            
            // Listen for track info updates from SoundCloud
            soundcloudWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, () => {
                updatePlayerMetadata();
            });
            
            soundcloudWidget.bind(window.SC.Widget.Events.READY, () => {
                updatePlayerMetadata();
            });
        } else if (track.permalink) {
            // Create new widget for this track
            const widgetIframe = document.createElement('iframe');
            widgetIframe.style.display = 'none';
            widgetIframe.allow = 'autoplay';
            widgetIframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(track.permalink)}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;
            
            // Remove old widget if exists
            const oldWidget = document.getElementById('soundcloud-widget');
            if (oldWidget) {
                oldWidget.remove();
            }
            
            widgetIframe.id = 'soundcloud-widget';
            document.body.appendChild(widgetIframe);
            
            widgetIframe.onload = () => {
                if (window.SC && window.SC.Widget) {
                    soundcloudWidget = window.SC.Widget(widgetIframe);
                    isPlaying = true;
                    updatePlayButton();
                    
                    // Listen for metadata updates
                    soundcloudWidget.bind(window.SC.Widget.Events.READY, () => {
                        updatePlayerMetadata();
                    });
                    
                    soundcloudWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, () => {
                        updatePlayerMetadata();
                    });
                }
            };
        }
    }
}

// Update player metadata from SoundCloud widget
function updatePlayerMetadata() {
    if (soundcloudWidget) {
        soundcloudWidget.getCurrentSound((sound) => {
            if (sound) {
                // Update title and artist from SoundCloud metadata
                document.getElementById('trackTitle').textContent = sound.title || 'Unknown Track';
                document.getElementById('trackArtist').textContent = sound.user?.username || 'URC';
                
                // Update thumbnail
                const thumbnail = document.querySelector('.player-thumbnail');
                if (sound.artwork_url || sound.user?.avatar_url) {
                    const imgUrl = sound.artwork_url || sound.user.avatar_url;
                    thumbnail.innerHTML = `<img src="${imgUrl}" alt="${sound.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else {
                    thumbnail.innerHTML = '<div class="thumbnail-placeholder">URC</div>';
                }
                
                // Update playlist panel if open
                if (document.getElementById('playlistPanel').classList.contains('active')) {
                    updatePlaylistPanelTrack(sound);
                }
            }
        });
    }
}

// Music Player Functions
function initMusicPlayer() {
    audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const volumeBtn = document.getElementById('volumeBtn');
    const playlistBtn = document.getElementById('playlistBtn');

    // Play/Pause button
    playBtn.addEventListener('click', togglePlayPause);

    // Previous/Next buttons
    prevBtn.addEventListener('click', playPreviousTrack);
    nextBtn.addEventListener('click', playNextTrack);

    // Progress bar click
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audioPlayer.duration) {
            audioPlayer.currentTime = percent * audioPlayer.duration;
        }
    });

    // Update progress bar
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', () => {
        if (audioPlayer.duration) {
            updateProgress();
        }
    });

    // Track ended
    audioPlayer.addEventListener('ended', playNextTrack);
    
    // Listen for SoundCloud track changes
    if (soundcloudWidget) {
        soundcloudWidget.bind(window.SC.Widget.Events.FINISH, () => {
            playNextTrack();
        });
    }

    // Volume control
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', updateVolume);
    volumeBtn.addEventListener('click', toggleMute);

    // Tempo control (Pitch adjustment) - Always default to zero
    const tempoSlider = document.getElementById('tempoSlider');
    if (tempoSlider) {
        // Always default to center position (8 = 0 pitch)
        tempoSlider.value = '8';
        
        // Initialize display
        updateTempo();
        
        // Apply tempo when slider changes - real-time updates
        tempoSlider.addEventListener('input', () => {
            updateTempo(); // This calls applyTempo() inside
        });
        
        tempoSlider.addEventListener('change', () => {
            updateTempo(); // This calls applyTempo() inside
            // Force apply one more time to ensure it sticks
            setTimeout(() => applyTempo(), 50);
        });
    }

    // Playlist panel functionality
    const playlistPanel = document.getElementById('playlistPanel');
    const playlistOverlay = document.getElementById('playlistOverlay');
    const playlistCloseBtn = document.getElementById('playlistCloseBtn');
    
    playlistBtn.addEventListener('click', () => {
        openPlaylistPanel();
    });
    
    playlistCloseBtn.addEventListener('click', () => {
        closePlaylistPanel();
    });
    
    playlistOverlay.addEventListener('click', () => {
        closePlaylistPanel();
    });
    
    // Close panel on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && playlistPanel.classList.contains('active')) {
            closePlaylistPanel();
        }
    });
    
    // Initialize volume and tempo
    updateVolume();
    updateTempo();
    
    // Apply tempo when audio is ready or playing
    audioPlayer.addEventListener('loadeddata', () => {
        applyTempo();
    });
    
    audioPlayer.addEventListener('play', () => {
        applyTempo();
    });
    
    audioPlayer.addEventListener('canplay', () => {
        applyTempo();
    });
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        applyTempo();
    });
    
    // Apply tempo immediately when ratechange event fires (if browser changes it)
    audioPlayer.addEventListener('ratechange', () => {
        // Re-apply our tempo if browser changed it
        const pitchValue = getCurrentPitchValue();
        const tempo = calculateTempoFromPitch(pitchValue);
        if (Math.abs(audioPlayer.playbackRate - tempo) > 0.001) {
            audioPlayer.playbackRate = tempo;
        }
    });
    
    // Initialize BPM detection
    initBPMDetection();

    // Load first track if available
    if (musicTracks.length > 0) {
        loadTrack(0);
    }
}

function loadTrack(index) {
    if (index < 0 || index >= musicTracks.length) return;
    
    currentTrackIndex = index;
    const track = musicTracks[index];
    
    audioPlayer.src = track.audioUrl || '';
    
    // Update UI
    document.getElementById('trackTitle').textContent = track.title;
    document.getElementById('trackArtist').textContent = track.artist;
    
    // Update thumbnail if available
    const thumbnail = document.querySelector('.player-thumbnail');
    if (track.thumbnail) {
        thumbnail.innerHTML = `<img src="${track.thumbnail}" alt="${track.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        thumbnail.innerHTML = '<div class="thumbnail-placeholder">URC</div>';
    }
    
    // Reset BPM when new track loads
    currentBPM = null;
    updateBPMDisplay(null);
    
    // Set up audio source for BPM detection and apply tempo
    if (track.audioUrl) {
        // Apply tempo immediately
        applyTempo();
        
        audioPlayer.addEventListener('loadeddata', () => {
            setupAudioSource();
            // Re-apply tempo when track loads
            applyTempo();
        }, { once: true });
        
        // Also apply tempo when audio can play
        audioPlayer.addEventListener('canplay', () => {
            applyTempo();
        }, { once: true });
        
        // Apply tempo when metadata loads
        audioPlayer.addEventListener('loadedmetadata', () => {
            applyTempo();
        }, { once: true });
    }
    
    // Auto-play if was playing
    if (isPlaying && track.audioUrl) {
        audioPlayer.play().catch(e => console.log('Auto-play prevented:', e));
    }
}

// Internal function to calculate tempo from pitch value
function calculateTempoFromPitch(pitchValue) {
    // pitchValue: -8 to +8
    // Each unit = 1% change, so +8 = 1.08x, -8 = 0.92x
    return 1 + (pitchValue * 0.01);
}

// Internal function to get current pitch value from slider
function getCurrentPitchValue() {
    const tempoSlider = document.getElementById('tempoSlider');
    if (!tempoSlider) return 0;
    const sliderValue = parseFloat(tempoSlider.value);
    return sliderValue - 8; // Convert 0-16 range to -8 to +8
}

// Apply tempo to audio player (internal function)
function applyTempo() {
    if (!audioPlayer) {
        console.warn('Audio player not available');
        return;
    }
    
    const pitchValue = getCurrentPitchValue();
    const tempo = calculateTempoFromPitch(pitchValue);
    
    // Apply to HTML5 audio player
    try {
        // Set playbackRate - this will slow down (pitch < 0) or speed up (pitch > 0) the audio
        const previousRate = audioPlayer.playbackRate || 1.0;
        audioPlayer.playbackRate = tempo;
        
        // Verify it was set
        const actualRate = audioPlayer.playbackRate;
        if (Math.abs(actualRate - tempo) > 0.001) {
            console.warn('Playback rate mismatch. Expected:', tempo, 'Got:', actualRate);
            // Try setting again
            audioPlayer.playbackRate = tempo;
        }
        
        // Log when rate changes significantly
        if (Math.abs(previousRate - tempo) > 0.001) {
            console.log('✓ Pitch adjusted:', pitchValue, '→ Tempo:', previousRate.toFixed(3) + 'x → ' + tempo.toFixed(3) + 'x');
        }
    } catch (error) {
        console.error('Error applying tempo:', error);
    }
    
    // Note: SoundCloud widget doesn't support playbackRate API
    // Tempo control works with HTML5 audio sources
    // For SoundCloud tracks, you would need direct audio stream access
}

function togglePlayPause() {
    // Use SoundCloud widget if available
    if (soundcloudWidget) {
        soundcloudWidget.toggle();
        soundcloudWidget.bind(window.SC.Widget.Events.PLAY, () => {
            isPlaying = true;
            updatePlayButton();
            updatePlayerMetadata();
        });
        soundcloudWidget.bind(window.SC.Widget.Events.PAUSE, () => {
            isPlaying = false;
            updatePlayButton();
        });
        return;
    }
    
    // Fallback to HTML5 audio
    if (!audioPlayer.src) {
        // Load first track if none loaded
        if (musicTracks.length > 0) {
            loadTrack(0);
        } else {
            return;
        }
    }

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayButton();
}

function updatePlayButton() {
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');
    
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

function playPreviousTrack() {
    if (musicTracks.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
    
    if (soundcloudWidget && musicTracks[currentTrackIndex].permalink) {
        // Use SoundCloud widget to skip to previous track
        soundcloudWidget.skipToPrevious();
        updatePlayerMetadata();
    } else if (musicTracks[currentTrackIndex].permalink) {
        playSoundCloudTrack(currentTrackIndex, musicTracks[currentTrackIndex].soundcloudId);
    } else {
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            audioPlayer.play();
        }
    }
}

function playNextTrack() {
    if (musicTracks.length === 0) return;
    
    currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
    
    if (soundcloudWidget && musicTracks[currentTrackIndex].permalink) {
        // Use SoundCloud widget to skip to next track
        soundcloudWidget.skipToNext();
        updatePlayerMetadata();
    } else if (musicTracks[currentTrackIndex].permalink) {
        playSoundCloudTrack(currentTrackIndex, musicTracks[currentTrackIndex].soundcloudId);
    } else {
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            audioPlayer.play();
        }
    }
}

function updateProgress() {
    if (audioPlayer.duration) {
        const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.getElementById('progressFill').style.width = percent + '%';
    }
}

function updateVolume() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volume = volumeSlider.value / 100;
    
    // Update HTML5 audio player
    if (audioPlayer) {
        audioPlayer.volume = volume;
        audioPlayer.muted = volume === 0;
    }
    
    // Update SoundCloud widget volume
    if (soundcloudWidget) {
        soundcloudWidget.setVolume(volume * 100);
    }
    
    // Update volume icon
    updateVolumeIcon(volume);
}

function toggleMute() {
    const volumeSlider = document.getElementById('volumeSlider');
    
    if (volumeSlider.value > 0) {
        // Store current volume and mute
        volumeSlider.dataset.previousVolume = volumeSlider.value;
        volumeSlider.value = 0;
    } else {
        // Restore previous volume or set to 50%
        volumeSlider.value = volumeSlider.dataset.previousVolume || 50;
    }
    
    updateVolume();
}

function updateVolumeIcon(volume) {
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeMutedIcon = document.querySelector('.volume-muted-icon');
    const volumeBtn = document.getElementById('volumeBtn');
    
    if (volume === 0) {
        volumeIcon.style.display = 'none';
        volumeMutedIcon.style.display = 'block';
        volumeBtn.style.opacity = '0.5';
    } else {
        volumeIcon.style.display = 'block';
        volumeMutedIcon.style.display = 'none';
        volumeBtn.style.opacity = '1';
    }
}

function updateTempo() {
    const tempoSlider = document.getElementById('tempoSlider');
    if (!tempoSlider) {
        console.warn('Tempo slider not found');
        return;
    }
    
    const tempoValue = document.getElementById('tempoValue');
    const pitchValue = getCurrentPitchValue(); // Use internal function
    
    // Update display with pitch value (matching turntable reference)
    if (tempoValue) {
        if (pitchValue === 0) {
            tempoValue.textContent = '0';
        } else if (pitchValue > 0) {
            tempoValue.textContent = '+' + pitchValue.toFixed(0);
        } else {
            tempoValue.textContent = pitchValue.toFixed(0);
        }
    }
    
    // Apply tempo immediately when slider changes
    applyTempo();
    
    // Update BPM display based on tempo
    if (currentBPM) {
        const tempo = calculateTempoFromPitch(pitchValue);
        updateBPMDisplay(currentBPM);
    }
}

// Initialize BPM Detection using Web Audio API
function initBPMDetection() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        // Set up audio source when available
        if (audioPlayer) {
            setupAudioSource();
        }
    } catch (error) {
        console.log('Web Audio API not supported:', error);
    }
}

function setupAudioSource() {
    if (!audioContext || !audioPlayer) return;
    
    try {
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // Start BPM detection
        detectBPM();
    } catch (error) {
        console.log('Error setting up audio source:', error);
    }
}

function detectBPM() {
    if (!analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let peaks = [];
    let lastPeakTime = 0;
    
    const detectPeaks = () => {
        if (!isPlaying) {
            requestAnimationFrame(detectPeaks);
            return;
        }
        
        analyser.getByteTimeDomainData(dataArray);
        
        // Simple peak detection
        let max = 0;
        let maxIndex = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            if (dataArray[i] > max) {
                max = dataArray[i];
                maxIndex = i;
            }
        }
        
        // Detect significant peaks (threshold)
        if (max > 128) {
            const currentTime = Date.now();
            if (currentTime - lastPeakTime > 100) { // Minimum 100ms between peaks
                peaks.push(currentTime);
                lastPeakTime = currentTime;
                
                // Keep only last 20 peaks
                if (peaks.length > 20) {
                    peaks.shift();
                }
                
                // Calculate BPM from peak intervals
                if (peaks.length >= 4) {
                    const intervals = [];
                    for (let i = 1; i < peaks.length; i++) {
                        intervals.push(peaks[i] - peaks[i - 1]);
                    }
                    
                    // Get average interval
                    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                    const bpm = Math.round(60000 / avgInterval);
                    
                    // Filter reasonable BPM range (60-200)
                    if (bpm >= 60 && bpm <= 200) {
                        currentBPM = bpm;
                        updateBPMDisplay(bpm);
                    }
                }
            }
        }
        
        requestAnimationFrame(detectPeaks);
    };
    
    detectPeaks();
}

// Playlist Panel Functions
function openPlaylistPanel() {
    const playlistPanel = document.getElementById('playlistPanel');
    const playlistOverlay = document.getElementById('playlistOverlay');
    
    playlistPanel.classList.add('active');
    playlistOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Populate playlist if not already done
    if (podcastEpisodes.length > 0 && document.getElementById('playlistTracks').children.length === 0) {
        populatePlaylistTracks();
    }
    
    // Update current track info
    updateCurrentTrackInPanel();
}

function closePlaylistPanel() {
    const playlistPanel = document.getElementById('playlistPanel');
    const playlistOverlay = document.getElementById('playlistOverlay');
    
    playlistPanel.classList.remove('active');
    playlistOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function updateCurrentTrackInPanel() {
    if (soundcloudWidget) {
        soundcloudWidget.getCurrentSound((sound) => {
            if (sound) {
                updatePlaylistPanelTrack(sound);
            }
        });
    } else if (musicTracks.length > 0 && currentTrackIndex >= 0) {
        const track = musicTracks[currentTrackIndex];
        const trackInfo = {
            title: track.title,
            user: { username: track.artist },
            artwork_url: track.thumbnail,
            description: '',
            duration: 0,
            created_at: '',
            playback_count: 0
        };
        updatePlaylistPanelTrack(trackInfo);
    }
}

function updatePlaylistPanelTrack(sound) {
    const artworkLarge = document.getElementById('trackArtworkLarge');
    const titleLarge = document.getElementById('trackTitleLarge');
    const artistLarge = document.getElementById('trackArtistLarge');
    const metadata = document.getElementById('trackMetadata');
    
    if (!artworkLarge || !titleLarge || !artistLarge || !metadata) return;
    
    // Update artwork
    if (sound.artwork_url) {
        artworkLarge.innerHTML = `<img src="${sound.artwork_url.replace('large', 't500x500')}" alt="${sound.title}">`;
    } else if (sound.user?.avatar_url) {
        artworkLarge.innerHTML = `<img src="${sound.user.avatar_url}" alt="${sound.title}">`;
    } else {
        artworkLarge.innerHTML = '<div class="artwork-placeholder">URC</div>';
    }
    
    // Update title and artist
    titleLarge.textContent = sound.title || 'Unknown Track';
    artistLarge.textContent = sound.user?.username || 'URC';
    
    // Update metadata
    let metadataHTML = '';
    if (sound.description) {
        metadataHTML += `<div><strong>Description:</strong> ${sound.description.substring(0, 200)}${sound.description.length > 200 ? '...' : ''}</div>`;
    }
    if (sound.duration) {
        const minutes = Math.floor(sound.duration / 60000);
        const seconds = Math.floor((sound.duration % 60000) / 1000);
        metadataHTML += `<div><strong>Duration:</strong> ${minutes}:${seconds.toString().padStart(2, '0')}</div>`;
    }
    if (sound.created_at) {
        const date = new Date(sound.created_at);
        metadataHTML += `<div><strong>Released:</strong> ${date.toLocaleDateString()}</div>`;
    }
    if (sound.playback_count !== undefined) {
        metadataHTML += `<div><strong>Plays:</strong> ${sound.playback_count.toLocaleString()}</div>`;
    }
    
    metadata.innerHTML = metadataHTML || '<div>No additional metadata available</div>';
    
    // Highlight active track in playlist
    if (sound.id) {
        highlightActiveTrackInPlaylist(sound.id);
    }
}

function populatePlaylistTracks() {
    const playlistTracks = document.getElementById('playlistTracks');
    if (!playlistTracks) return;
    
    playlistTracks.innerHTML = '';
    
    podcastEpisodes.forEach((episode, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'playlist-track-item';
        trackItem.dataset.index = index;
        trackItem.dataset.soundcloudId = episode.id;
        
        const thumbnail = episode.artwork || '';
        const duration = episode.duration ? formatDuration(episode.duration) : '';
        
        trackItem.innerHTML = `
            <div class="track-thumbnail">
                ${thumbnail ? `<img src="${thumbnail}" alt="${episode.title}">` : '<div class="artwork-placeholder" style="font-size: 12px;">URC</div>'}
            </div>
            <div class="track-info-small">
                <div class="track-title-small">${episode.title}</div>
                <div class="track-artist-small">${episode.artist}</div>
            </div>
            ${duration ? `<div class="track-duration">${duration}</div>` : ''}
        `;
        
        trackItem.addEventListener('click', () => {
            playSoundCloudTrack(index, episode.id);
            closePlaylistPanel();
        });
        
        playlistTracks.appendChild(trackItem);
    });
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function highlightActiveTrackInPlaylist(soundcloudId) {
    const trackItems = document.querySelectorAll('.playlist-track-item');
    trackItems.forEach(item => {
        if (item.dataset.soundcloudId === soundcloudId?.toString()) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function updateBPMDisplay(bpm) {
    const bpmValue = document.getElementById('bpmValue');
    const tempoSlider = document.getElementById('tempoSlider');
    const tempo = tempoSlider.value / 100;
    
    if (bpm && !isNaN(bpm)) {
        // Adjust BPM based on tempo multiplier
        const adjustedBPM = Math.round(bpm * tempo);
        bpmValue.textContent = adjustedBPM;
    } else {
        bpmValue.textContent = '--';
    }
}

// Ensure tempo is applied when audio starts playing
if (audioPlayer) {
    audioPlayer.addEventListener('play', applyTempo);
    audioPlayer.addEventListener('loadedmetadata', applyTempo);
}
