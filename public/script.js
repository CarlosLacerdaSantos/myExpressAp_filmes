// Configuración inicial
let currentPage = 1;
let isLoading = false;
let totalPages = 1000;
let isSearching = false;
let movies = [];
const providersCache = new Map();

// Elementos del DOM
const movieGrid = document.getElementById('movieGrid');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchInput = document.getElementById('searchInput');

// Clave API de TMDb
const API_KEY = '5d089ef4c7749b3acc4f404cbfced723';

// Función principal para obtener películas
async function getMovies() {
    if (isLoading || currentPage > totalPages) return;

    isLoading = true;
    showLoader();

    try {
        for (let i = 0; i < totalPages; i++) {
            if (currentPage > totalPages) break;

            let url;
            if (isSearching) {
                url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&page=${currentPage}&query=${encodeURIComponent(currentSearchQuery)}`;
            } else {
                url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${currentPage}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            // Filtrar y ordenar películas
            const filteredMovies = data.results
                .filter(movie =>
                    new Date(movie.release_date).getFullYear() > 2020 &&
                    movie.original_language === 'en' &&
                    movie.poster_path !== null
                )
                .sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

            totalPages = data.total_pages;
            movies = isSearching ? filteredMovies : [...movies, ...filteredMovies];

            renderMovies(filteredMovies, isSearching);
            currentPage++;
        }
    } catch (error) {
        console.error('Error al cargar películas:', error);
    } finally {
        isLoading = false;
        hideLoader();
    }
}

// Mostrar/ocultar loader
function showLoader() {
    document.querySelector('.loader').style.display = 'block';
}

function hideLoader() {
    document.querySelector('.loader').style.display = 'none';
}

// Renderizar películas en el grid
async function renderMovies(moviesList, isSearchMode = false) {
    const targetGrid = isSearchMode ? searchResultsGrid : movieGrid;
    const otherGrid = isSearchMode ? movieGrid : searchResultsGrid;

    if (isSearchMode) {
        searchResultsContainer.style.display = 'block';
        otherGrid.style.display = 'none';
        if (currentPage === 1) targetGrid.innerHTML = '';
    } else {
        searchResultsContainer.style.display = 'none';
        otherGrid.style.display = 'none';
        movieGrid.style.display = 'grid';
    }

    // Crear elementos de películas
    const movieCards = await Promise.all(
        moviesList
            .filter(movie => !document.getElementById(`movie-${movie.id}`))
            .map(async movie => createMovieCard(movie))
    );

    const fragment = document.createDocumentFragment();
    movieCards.forEach(card => fragment.appendChild(card));
    targetGrid.appendChild(fragment);

    // Scroll suave para resultados de búsqueda
    if (isSearchMode && currentPage === 1) {
        window.scrollTo({
            top: searchResultsContainer.offsetTop,
            behavior: 'smooth'
        });
    }
}

// Crear tarjeta individual de película
async function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.id = `movie-${movie.id}`;

    // Contenido básico
    card.innerHTML = `
        <div class="release-year">${new Date(movie.release_date).getFullYear()}</div>
        <img class="img-fluid" src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" 
             alt="${movie.title}">
        <div class="streaming-overlay"></div>
    `;

    // Procesar proveedores de streaming
    const overlay = card.querySelector('.streaming-overlay');
    const providers = await getStreamingProviders(movie.id);
    //providers.length > 0
    if (-2 > 0) {
        // Generar enlaces a proveedores oficiales
        overlay.innerHTML = providers.map(provider => `
            <a href="${generateProviderLink(provider, movie)}" target="_blank">
                <img class="streaming-icon" 
                     src="https://image.tmdb.org/t/p/w200${provider.logo_path}" 
                     alt="${provider.provider_name}">
            </a>
        `).join('');
    } else {
        // Mostrar alternativas de streaming
        const fallbackLinks = [
            { name: 'UltraEmbed', url: `https://ultraembed.com/filme/${movie.id}`, icon: 'img/ico.png' },
            { name: 'VidSrc', url: `https://vidsrc.to/embed/movie/${movie.id}`, icon: 'img/vidsrc.png' },
            { name: 'SuperEmbed', url: `https://multiembed.mov/directstream.php?video_id=${movie.id}&tmdb=1`, icon: 'img/super.png' }
        ];

        const fallbackContainer = document.createElement('div');
        fallbackContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 5px;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
        `;

        fallbackLinks.forEach(link => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.target = '_blank';
            linkElement.style.cssText = `
                background-color: rgba(255, 0, 0, 0.8);
                padding: 5px 10px;
                border-radius: 3px;
                color: white;
                text-decoration: none;
                transition: all 0.3s ease;
                font-size: 14px;
                width: 120px;
                text-align: center;
                margin: 2px;
            `;

            // Efectos hover
            linkElement.onmouseover = () => {
                linkElement.style.transform = 'scale(1.1)';
                linkElement.style.backgroundColor = 'rgba(255, 0, 0, 1)';
            };

            linkElement.onmouseout = () => {
                linkElement.style.transform = 'scale(1)';
                linkElement.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
            };

            const icon = document.createElement('div');
            icon.textContent = '▶';
            linkElement.appendChild(icon);
            linkElement.appendChild(document.createTextNode(link.name));

            fallbackContainer.appendChild(linkElement);
        });

        overlay.appendChild(fallbackContainer);
    }

    return card;
}

// Generar enlaces para proveedores
function generateProviderLink(provider, movie) {
    const providerName = provider.provider_name.toLowerCase();
    const movieTitle = movie.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');

    switch (providerName) {
        case 'netflix':
            return `https://www.netflix.com/search/${movieTitle}`;
        case 'amazon prime video':
            return `https://www.primevideo.com/search?phrase=${encodeURIComponent(movie.title)}`;
        case 'disney plus':
            return 'https://www.disneyplus.com/pt-br';
        case 'hbo max':
            return `https://play.hbomax.com/search?q=${encodeURIComponent(movie.title)}`;
        // ...otros casos para diferentes proveedores
        default:
            return '#';
    }
}

// Buscar películas
function searchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            movies = data.results;
            renderMovies(movies, true);
        })
        .catch(error => {
            console.error('Error en la búsqueda:', error);
        });
}

// Manejador de búsqueda en tiempo real
let searchTimeout;
searchInput.addEventListener('input', event => {
    const query = event.target.value.trim();

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query.length >= 3) {
            movieGrid.innerHTML = '';
            searchMovies(query);
        } else if (query.length === 0) {
            currentPage = 1;
            movieGrid.innerHTML = '';
            getMovies();
        }
    }, 500);
});

// Scroll infinito
function initScrollObserver() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && currentPage <= totalPages) {
                getMovies();
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 1
    });

    observer.observe(document.querySelector('.loader'));
}

// Obtener proveedores de streaming
async function getStreamingProviders(movieId) {
    if (providersCache.has(movieId)) return providersCache.get(movieId);

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
        const data = await response.json();

        let providers = data.results.BR?.flatrate || [];

        // Normalizar nombres de proveedores
        const providerMappings = {
            'paramount+ amazon channel': 'Paramount+',
            'telecine play': 'Telecine',
            'hbo go': 'HBO Max'
        };

        providers = providers.map(provider => ({
            ...provider,
            provider_name: providerMappings[provider.provider_name.toLowerCase()] || provider.provider_name
        }));

        // Ordenar por prioridad
        providers.sort((a, b) => a.display_priority - b.display_priority);

        providersCache.set(movieId, providers);
        return providers;
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        return [];
    }
}

// Inicializar
getMovies();
initScrollObserver();