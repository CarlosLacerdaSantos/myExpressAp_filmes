let currentPage = 1;
let isLoading = false;
let totalPages = 1000;
let isSearching = false;
let movies = [];
// Cache para provedores
const providersCache = new Map();
// Elementos do DOM
const movieGrid = document.getElementById('movieGrid');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const searchResultsGrid = document.getElementById('searchResultsGrid');
const searchInput = document.getElementById('searchInput');

// Função principal para carregar filmes

async function getMovies() {
    if (isLoading || currentPage > totalPages) return;

    isLoading = true;
    showLoader();

    const API_KEY = '5d089ef4c7749b3acc4f404cbfced723';
    const LANGUAGE = 'pt-BR';
    const PAGES_TO_LOAD = 5;

    try {
        for (let i = 0; i < totalPages; i++) {
            if (currentPage > totalPages) break;

            let API_URL;
            if (isSearching) {

                API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&page=${currentPage}&query=${encodeURIComponent(currentSearchQuery)}`;
            } else {
                API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}&page=${currentPage}`;
            }

            const response = await fetch(API_URL);
            const data = await response.json(),
                filteredMovies = data.results
                    .filter(movie => {            
                        return movie.release_date > '2020-01-01' && 
                               movie.original_language === 'en' && 
                               movie.poster_path !== null;           
                    })
                    .sort((a, b) => {
                        // Ordena por data de lançamento (mais recente primeiro)
                        return new Date(b.release_date) - new Date(a.release_date);
                    });

            totalPages = data.total_pages;
            movies = isSearching ? filteredMovies : [...movies, ...filteredMovies];

            renderMovies(filteredMovies, isSearching);
            currentPage++;
        }
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
    } finally {
        isLoading = false;
        hideLoader();
    }
}
// Funções do loader
function showLoader() {
    document.querySelector('.loader').style.display = 'block';
}
function hideLoader() {
    document.querySelector('.loader').style.display = 'none';
}
// Função de renderização atualizada
async function renderMovies(newMovies, isSearch = false) {
    const targetGrid = isSearch ? searchResultsGrid : movieGrid;
    const otherGrid = isSearch ? movieGrid : searchResultsGrid;

    if (isSearch) {
        searchResultsContainer.style.display = 'block';
        otherGrid.style.display = 'none';

        // Limpa apenas na primeira página da pesquisa
        if (currentPage === 1) targetGrid.innerHTML = '';
    } else {
        searchResultsContainer.style.display = 'none';
        otherGrid.style.display = 'none';
        movieGrid.style.display = 'grid';
    }

    // Cria os cards e evita duplicatas
    const cards = await Promise.all(
        newMovies
            .filter(movie => !document.getElementById(`movie-${movie.id}`))
            .map(async movie => await createMovieCard(movie))
    );

    // Adiciona os novos cards
    const fragment = document.createDocumentFragment();
    cards.forEach(card => fragment.appendChild(card));
    targetGrid.appendChild(fragment);

    // Scroll para resultados da pesquisa
    if (isSearch && currentPage === 1) {
        window.scrollTo({
            top: searchResultsContainer.offsetTop,
            behavior: 'smooth'
        });
    }
}
// Função para criar cards de filme
async function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.id = `movie-${movie.id}`;
    movieCard.innerHTML = `
        <img class='img-fluid' src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" class="movie-poster" alt="${movie.title}">
        <div class="streaming-overlay"></div>
    `;

    // Função auxiliar para limpar e formatar nomes de filmes
    function cleanMovieTitle(title) {
        return title
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .trim()
            .replace(/\s+/g, '-');
    }

    getStreamingProviders(movie.id).then(providers => {
        const overlay = movieCard.querySelector('.streaming-overlay');
        // Log detalhado dos provedores
        providers.forEach(provider => {
            console.log(`
                Provedor: ${provider.provider_name}
                ID: ${provider.provider_id}
                Prioridade: ${provider.display_priority}
                Logo: ${provider.logo_path}
                ----------------------------------------
            `);
        });
        //providers.length > 0
        //-1 > 0
        if (-1 > 0) {
            overlay.innerHTML = providers.map(provider => {
                let providerUrl = '#';
                switch (provider.provider_name.toLowerCase().trim()) {
                    case 'netflix':
                    case 'netflix basic with ads':
                        const netflixTitle = cleanMovieTitle(movie.title);
                        providerUrl = `https://www.netflix.com/search/${netflixTitle}`;
                        break;

                    case 'amazon prime video':
                        const primeTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.primevideo.com/search?phrase=${primeTitle}`;
                        break;

                    case 'disney plus':
                        const disneyTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.disneyplus.com/pt-br`;
                        break;

                    case 'max':
                    case 'max basic with ads':
                        // Sempre usa o título original
                        const maxTitle = movie.original_title;
                        // Codifica para URL mantendo caracteres especiais
                        const encodedMaxTitle = encodeURIComponent(maxTitle);
                        // URL com regionalização BR
                        providerUrl = `https://www.max.com/br/pt?q=${encodedMaxTitle}`;
                        break;

                    case 'claro tv+':
                        const claroTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.clarotvmais.com.br/busca?q=${claroTitle}`;
                        break;

                    case 'paramount plus':
                        const paramountTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.paramountplus.com/br/search/`;
                        break;

                    case 'mubi':
                        const mubiTitle = movie.original_title || movie.title;
                        const mubiSlug = cleanMovieTitle(mubiTitle);
                        providerUrl = `https://mubi.com/pt/br/films/${mubiSlug}`;
                        break;

                    case 'globoplay':
                        const globoTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://globoplay.globo.com/busca/?q=${globoTitle}`;
                        break;

                    case 'apple tv+':
                        const appleTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://tv.apple.com/br/search?term=${appleTitle}`;
                        break;

                    case 'crunchyroll':
                        const crunchyTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.crunchyroll.com/pt-br/search?q=${crunchyTitle}`;
                        break;

                    case 'discovery+':
                        const discoveryTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.discoveryplus.com/br/search?q=${discoveryTitle}`;
                        break;

                    case 'pluto tv':
                        const plutoTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://pluto.tv/pt/search?q=${plutoTitle}`;
                        break;

                    case 'star plus':
                    case 'star+ amazon channel':
                        const starTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.starplus.com/pt-br/search?q=${starTitle}`;
                        break;

                    case 'hbo go':
                        const hboTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://play.hbomax.com/search?q=${hboTitle}`;
                        break;

                    case 'telecine':
                    case 'telecine play':
                        const telecineTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.primevideo.com/region/na/search/ref=atv_sr_sug_10?phrase=${telecineTitle}&ie=UTF8&jic=44%7CChF0ZWxlY2luZWNoYW5uZWxichIMc3Vic2NyaXB0aW9u`;
                        break;

                    case 'vix+':
                    case 'vix':
                        const vixTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.vix.com/pt/busca?q=${vixTitle}`;
                        break;

                    case 'wow':
                    case 'wow presents plus':
                        const wowTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.wowpresentsplus.com/search?q=${wowTitle}`;
                        break;

                    case 'looke':
                        const lookeTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.looke.com.br/search?q=${lookeTitle}`;
                        break;

                    case 'oi play':
                        const oiTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.oi.com.br/play/busca?q=${oiTitle}`;
                        break;

                    case 'now':
                        const nowTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.clarotvmais.com.br/busca?q=${nowTitle}`;
                        break;

                    case 'paramount+ amazon channel':
                        const paramountAmazonTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.amazon.com.br/gp/video/search?phrase=${paramountAmazonTitle}`;
                        break;

                    case 'mgm amazon channel':
                        const mgmTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.amazon.com.br/gp/video/search?phrase=${mgmTitle}`;
                        break;

                    case 'starz play amazon channel':
                        const starzTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.amazon.com.br/gp/video/search?phrase=${starzTitle}`;
                        break;

                    case 'universal+ amazon channel':
                        const universalTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.amazon.com.br/gp/video/search?phrase=${universalTitle}`;
                        break;

                    case 'paramount+ apple tv channel':
                        const paramountAppleTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://tv.apple.com/br/channel/paramount-plus?q=${paramountAppleTitle}`;
                        break;

                    case 'starzplay':
                        const starzplayTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.lionsgateplusla.com/br/search?q=${starzplayTitle}`;
                        break;

                    case 'directv go':
                        const directvTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.directvgo.com/br/busca?q=${directvTitle}`;
                        break;

                    case 'sun nxt':
                        const sunTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.sunnxt.com/search?q=${sunTitle}`;
                        break;

                    case 'curiosity stream':
                        const curiosityTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://curiositystream.com/search?q=${curiosityTitle}`;
                        break;

                    case 'docsville':
                        const docsvilleTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://docsville.com/search?q=${docsvilleTitle}`;
                        break;

                    case 'funimation':
                        const funimationTitle = encodeURIComponent(movie.title);
                        providerUrl = `https://www.crunchyroll.com/pt-br/search?q=${funimationTitle}`;
                        break;

                    default:
                        providerUrl = '#';
                        break;
                }

                return `
                    <a href="${providerUrl}" target="_blank">
                        <img class="streaming-icon" src="https://image.tmdb.org/t/p/w200${provider.logo_path}" alt="${provider.provider_name}">
                    </a>
                `;
            }).join('');
        } else {
            idMovie = `${movie.id}`
            const alternativeProviders = [
                {
                    name: 'UltraEmbed',
                    url: `https://ultraembed.com/filme/${movie.id}`,
                    icon: 'img/ico.png'
                },
                {
                    name: 'VidSrc',
                    url: `https://vidsrc.to/embed/movie/${movie.id}`,
                    icon: 'img/vidsrc.png'
                },
                {
                    name: 'SuperEmbed',
                    url: `https://multiembed.mov/directstream.php?video_id=${movie.id}&tmdb=1`,
                    icon: 'img/super.png'
                }
            ];

            const providersContainer = document.createElement('div');
            providersContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 10px;
                justify-content: center;
                align-items: center;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10;
            `;

            alternativeProviders.forEach(provider => {
                const link = document.createElement('a');
                link.href = provider.url;
                link.target = '_blank';
                link.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background-color: rgba(255, 0, 0, 0.8);
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    cursor: pointer;
                `;
                link.title = `Assistir em ${provider.name}`;

                link.onmouseover = function() {
                    this.style.backgroundColor = 'rgba(255, 0, 0, 1)';
                    this.style.transform = 'scale(1.1)';
                };

                link.onmouseout = function() {
                    this.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
                    this.style.transform = 'scale(1)';
                };

                const playIcon = document.createElement('div');
                playIcon.innerHTML = '▶';
                playIcon.style.cssText = `
                    color: white;
                    font-size: 20px;
                    line-height: 1;
                    text-align: center;
                `;

                link.appendChild(playIcon);
                providersContainer.appendChild(link);
            });

            overlay.appendChild(providersContainer);
        }
    });

    return movieCard;
}
// Função de pesquisa
function searchMovies(query) {
    const API_KEY = '5d089ef4c7749b3acc4f404cbfced723';
    const LANGUAGE = 'pt-BR';
    const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=${LANGUAGE}&query=${encodeURIComponent(query)}`;

    fetch(SEARCH_URL)
        .then(response => response.json())
        .then(data => {
            movies = data.results;
            renderMovies(movies);
        })
        .catch(error => {
            console.error('Erro na pesquisa:', error);
        });
}
// Sistema de pesquisa com debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (query.length >= 3) { // Só pesquisa com 3 ou mais caracteres
        movieGrid.innerHTML = ''; // Limpa a lista antes de renderizar
        searchMovies(query);
    } else if (query.length === 0) { // Mostra filmes populares se a pesquisa estiver vazia
        currentPage = 1;
        movieGrid.innerHTML = '';
        getMovies();
        renderMovies(data.results, isSearching);
        currentPage++;
    }
});
// Observer para scroll infinito
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && currentPage <= totalPages) {
                getMovies();
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 1.0
    });

    observer.observe(document.querySelector('.loader'));
}
//Adicione esta função para buscar os provedores de streaming 
async function getStreamingProviders(movieId) {
    if (providersCache.has(movieId)) return providersCache.get(movieId);
    try {
        const API_KEY = '5d089ef4c7749b3acc4f404cbfced723';
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
        const data = await response.json();

        let providers = data.results.BR?.flatrate || [];

        // Mapeamento de canais para suas plataformas principais
        const channelMapping = {
            'paramount plus apple tv channel': 'paramount plus',
            'paramount plus premium': 'paramount plus',
            'paramount+ apple tv channel': 'paramount plus',
            'paramount+ amazon channel': 'paramount plus',
            'telecine amazon channel': 'amazon prime video',
            'max amazon channel': 'max',
            'star+ amazon channel': 'star plus',
            'mgm amazon channel': 'amazon prime video',
            'universal+ amazon channel': 'amazon prime video',
            'adrenalina pura amazon channel': 'amazon prime video',
            'adrenalina pura apple tv channel': 'apple tv+',
            'looke amazon channel': 'looke'
        };

        // ID principal para cada provedor
        const mainProviderIds = {
            'paramount plus': 531,
            'max': 1899,
            'netflix': 8,
            'amazon prime video': 119,
            'disney plus': 337,
            'globoplay': 307,
            'looke': 47
        };

        // Ajusta os nomes dos provedores baseado no mapeamento
        providers = providers.map(provider => {
            const lowerName = provider.provider_name.toLowerCase();
            if (channelMapping[lowerName]) {
                const mainName = channelMapping[lowerName];
                return {
                    ...provider,
                    provider_name: mainName,
                    provider_id: mainProviderIds[mainName] || provider.provider_id,
                    is_channel: true,
                    original_name: provider.provider_name
                };
            }
            return provider;
        });

        // Remove duplicatas priorizando provedores principais
        providers = providers.reduce((acc, current) => {
            const existingProvider = acc.find(p => 
                p.provider_name.toLowerCase() === current.provider_name.toLowerCase()
            );

            if (!existingProvider) {
                acc.push(current);
            } else if (existingProvider.provider_id !== mainProviderIds[existingProvider.provider_name.toLowerCase()]) {
                // Se o existente não é o ID principal, substitui pelo atual
                const index = acc.indexOf(existingProvider);
                acc[index] = current;
            }
            return acc;
        }, []);

        // Ordena por prioridade ajustada
        providers.sort((a, b) => {
            // Prioridade fixa para principais serviços
            const mainServices = {
                'netflix': 0,
                'amazon prime video': 1,
                'disney plus': 2,
                'max': 3,
                'paramount plus': 4,
                'globoplay': 5,
                'looke': 6
            };

            const aName = a.provider_name.toLowerCase();
            const bName = b.provider_name.toLowerCase();

            const aPriority = mainServices[aName] !== undefined ? mainServices[aName] : a.display_priority;
            const bPriority = mainServices[bName] !== undefined ? mainServices[bName] : b.display_priority;

            return aPriority - bPriority;
        });

        providersCache.set(movieId, providers);
        return providers;
    } catch (error) {
        console.error('Erro ao buscar provedores:', error);
        return [];
    }
}


getMovies();
initScrollObserver();
