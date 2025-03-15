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
            filteredMovies = data.results.filter(movie => {
                
                return movie.poster_path !== null;
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
    const movieCard = document.createElement('div'); //cria a div
    movieCard.className = 'movie-card'; // cria a classe da div
    movieCard.id = `movie-${movie.id}`; // cria o id da div
    movieCard.innerHTML = `
        <img class='img-fluid' src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" class="movie-poster" alt="${movie.title}">
        
        <div class="streaming-overlay"></div>
    `;
    // Busca assíncrona dos provedores
    getStreamingProviders(movie.id).then(providers => {
       
        const overlay = movieCard.querySelector('.streaming-overlay');
        if (-1 > 0) {
            overlay.innerHTML = providers.map(provider => {
                let providerUrl = '#'; // Default URL if provider is not recognized
                const movieName = encodeURIComponent(movie.title); // Encode movie title for URL
                switch (provider.provider_name.toLowerCase().trim()) {
                    case 'netflix':
                        providerUrl = `https://www.netflix.com/search?q=${movieName}`;
                        break;
                    case 'netflix basic with ads':
                        providerUrl = `https://www.netflix.com/search?q=${movieName}`;
                        break;
                    case 'amazon prime video':
                        providerUrl = `https://www.primevideo.com/search?/ref=atv_nb_sug?ie=UTF8&phrase=${movieName}`;
                        break;
                        case 'disney plus':
                            const disneySlug = (movie.disneyPlusId || movieName)
                                .toLowerCase()
                                .replace(/\s+/g, '-')
                                .replace(/[^a-z0-9-]/g, '');
                            providerUrl = `https://www.disneyplus.com/?=${disneySlug}`;
                            break;
                    case 'max':
                        providerUrl = `https://www.hbomax.com/search?q=${movieName}`;
                        break;
                    case 'max basic with ads':
                        providerUrl = `https://www.hbomax.com/search?q=${movieName}`;
                        break;
                    case 'claro tv+':
                        providerUrl = `https://www.clarotvmais.com.br/busca?q=${movieName}`;
                        break;
                        case 'paramount plus':
                            providerUrl = `https://www.paramountplus.com/br/search?q=${movieName}`;
                            break;
                    
                        case 'mubi':
                            const mubiSlug = (movie.original_title || movieName)
                                .toLowerCase()
                                .replace(/[^\w\s-]/g, '')
                                .replace(/\s+/g, '-');
                            providerUrl = `https://mubi.com/pt/br/films/${mubiSlug}`;
                            break;
                    case 'oldflix':
                        providerUrl = `https://www.oldflix.com.br/${movieName}`;
                        break;
                    case 'looke':
                        providerUrl = `https://www.looke.com.br/search?q=${movieName}`;
                        break;
                    case 'filmicca':
                        providerUrl = `https://www.filmicca.com.br/search?q=${movieName}`;
                        break;
                    case 'globoplay':
                        providerUrl = `/`;
                        break;
                    case 'max amazon channel':
                        providerUrl = `https://www.amazon.com/max/search?q=${movieName}`;
                        break;
                     // ========== NOVOS CANAIS ADICIONADOS ==========
  case 'apple tv+':
    providerUrl = `https://tv.apple.com/search?term=${movieName}`;
    break;

  case 'hulu':
    providerUrl = `https://www.hulu.com/search?q=${movieName}`;
    break;

  case 'peacock':
    providerUrl = `https://www.peacocktv.com/search?q=${movieName}`;
    break;

    case 'curiositystream':
    providerUrl = `https://curiositystream.com/search?q=${movieName}`;
    break;

  case 'crunchyroll':
    providerUrl = `https://www.crunchyroll.com/search?q=${movieName}`;
    break;

  case 'youtube premium':
    providerUrl = `https://www.youtube.com/results?search_query=${movieName}+movie`;
    break;

  case 'lionsgate+':
    providerUrl = `https://www.lionsgateplus.com/search?q=${movieName}`;
    break;

  case 'pluto tv':
    providerUrl = `https://pluto.tv/search?q=${movieName}`;
    break;

  case 'discovery+':
    providerUrl = `https://www.discoveryplus.com/search?q=${movieName}`;
    break;

  case 'vix':
    providerUrl = `https://www.vix.com/busca?q=${movieName}`;
    break;

  case 'rakuten viki':
    providerUrl = `https://www.viki.com/search?q=${movieName}`;
    break;

  case 'funimation':
    providerUrl = `https://www.funimation.com/search/?q=${movieName}`;
    break;

  case 'tubi':
    providerUrl = `https://tubitv.com/search/${movieName.replace(/\s+/g, '-')}`;
    break;

  case 'acorn tv':
    providerUrl = `https://acorn.tv/search?q=${movieName}`;
    break;

  case 'microsoft store':
    providerUrl = `https://www.microsoft.com/pt-br/search/shop?q=${movieName}`;
    break;

  // ... casos originais continuam abaixo ...
  case 'globoplay':
    providerUrl = `/`; // Atualizar conforme necessidade
    break;

  case 'max amazon channel':
    providerUrl = `https://www.amazon.com/max/search?q=${movieName}`;
    break;
}
                    // Add more cases for other providers as needed
                
                return `
                    <a href="${providerUrl}" target="_blank">
                        <img class="streaming-icon" src="https://image.tmdb.org/t/p/w200${provider.logo_path}" alt="${provider.provider_name}">
                    </a>
                `;
            }).join('');
         } else {
        
        
            idMovie =`${movie.id}` 
            const link = document.createElement('a');
            link.href = `https://ultraembed.com/filme/${movie.id}`;
            link.target = '_blank';
            link.style.display = 'block';
            link.style.width = '80px';
            link.style.height = '80px';

            const img = document.createElement('img');
            img.src = 'img/ico.png';
            img.alt = `Poster do filme: ${movie.title}`;
            img.style.width = '100%';
            img.style.borderRadius = '2px';


            const btn = document.createElement('button');
            btn.id = 'movieDetailsPage';
            btn.textContent = 'Detalhes do filme';
            btn.classList.add('btn', 'btn-details');
            btn.setAttribute('aria-label', 'Ver detalhes do filme');
            btn.style.padding = '10px 20px'; // Remova se usar CSS
            btn.addEventListener('click', function () {
            
                // Sua lógica aqui
            });
            link.appendChild(img);
            overlay.appendChild(link);
            //overlay.appendChild(btn)
        //     const videoLink = document.createElement('a');
        //     const videoLink_2 = document.createElement('a');
        //     videoLink.href = 'https://ultraembed.com/filme/' + movie.id;
        //     videoLink_2.href = 'https://vidsrc.to/embed/movie/' + movie.id;
        //     videoLink.textContent = 'Clique aqui para assistir ao filme em Português';
        //     videoLink_2.textContent = 'Clique aqui para assistir ao filme em Inglês';
        //     videoLink.target = '_blank'; // Abre o link em uma nova aba
        //     videoLink_2.target = '_blank'; // Abre o link em uma nova aba
        //     videoLink.style.color = '#fff';
        //     videoLink_2.style.color = '#fff';
        //     videoLink.style.fontSize = '1em';
        //     videoLink_2.style.fontSize = '1em';
        //     videoLink.style.textDecoration = 'none';
        //     videoLink_2.style.textDecoration = 'none';

        //     overlay.innerHTML = ''; // Clear any existing content
        //     overlay.appendChild(videoLink);
        //     overlay.appendChild(videoLink_2);
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
    if (providersCache.has(movieId)) return providersCache.get(movieId); //nova linha
    try {
        const API_KEY = '5d089ef4c7749b3acc4f404cbfced723';
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
        const data = await response.json();

        // Filtra os provedores do Brasil (BR) e pega os de streaming (flatrate)
        const providers = data.results.BR?.flatrate || [];
        providersCache.set(movieId, providers);
        return providers;
    } catch (error) {
        console.error('Erro ao buscar provedores:', error);
        return [];
    }
}


getMovies();
initScrollObserver();
