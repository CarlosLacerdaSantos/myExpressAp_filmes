let currentPage = 0x1;
let isLoading = false;
let totalPages = 0x3e8;
let movies = [];
const providersCache = new Map();
const movieGrid = document.getElementById("movieGrid");
const searchResultsContainer = document.getElementById("searchResultsContainer");
const searchResultsGrid = document.getElementById('searchResultsGrid');
async function getMovies() {
  if (isLoading || currentPage > totalPages) {
    return;
  }
  isLoading = true;
  showLoader();
  try {
    for (let _0x175b66 = 0x0; _0x175b66 < totalPages; _0x175b66++) {
      if (currentPage > totalPages) {
        break;
      }
      let _0x2de3ec;
      _0x2de3ec = "https://api.themoviedb.org/3/movie/popular?api_key=5d089ef4c7749b3acc4f404cbfced723&language=pt-BR&page=" + currentPage;
      const _0x3a301d = await fetch(_0x2de3ec);
      const _0x59ea8e = await _0x3a301d.json();
      const _0xcaca85 = _0x59ea8e.results.filter(_0x2a32e9 => {
        return _0x2a32e9.release_date > "2020-01-01" && _0x2a32e9.original_language === 'en' && _0x2a32e9.poster_path !== null;
      }).sort((_0x474612, _0x3bd1a1) => {
        return new Date(_0x3bd1a1.release_date) - new Date(_0x474612.release_date);
      });
      totalPages = _0x59ea8e.total_pages;
      movies = [...movies, ..._0xcaca85];
      renderMovies(_0xcaca85, false);
      currentPage++;
    }
  } catch (_0x1b41d5) {
    console.error("Erro ao carregar filmes:", _0x1b41d5);
  } finally {
    isLoading = false;
    hideLoader();
  }
}
function showLoader() {
  document.querySelector('.loader').style.display = "block";
}
function hideLoader() {
  document.querySelector(".loader").style.display = "none";
}
async function renderMovies(_0xe7f8db, _0x42feb7 = false) {
  const _0x11c960 = _0x42feb7 ? searchResultsGrid : movieGrid;
  const _0x1bc985 = _0x42feb7 ? movieGrid : searchResultsGrid;
  if (_0x42feb7) {
    searchResultsContainer.style.display = "block";
    _0x1bc985.style.display = "none";
    if (currentPage === 0x1) {
      _0x11c960.innerHTML = '';
    }
  } else {
    searchResultsContainer.style.display = 'none';
    _0x1bc985.style.display = "none";
    movieGrid.style.display = "grid";
  }
  const _0x295f21 = await Promise.all(_0xe7f8db.filter(_0x1cf648 => !document.getElementById("movie-" + _0x1cf648.id)).map(async _0x3e949c => await createMovieCard(_0x3e949c)));
  const _0x5b5519 = document.createDocumentFragment();
  _0x295f21.forEach(_0x1dcb63 => _0x5b5519.appendChild(_0x1dcb63));
  _0x11c960.appendChild(_0x5b5519);
  if (_0x42feb7 && currentPage === 0x1) {
    window.scrollTo({
      'top': searchResultsContainer.offsetTop,
      'behavior': "smooth"
    });
  }
}
async function createMovieCard(_0x319c83) {
  const _0x5351b1 = document.createElement("div");
  _0x5351b1.className = "movie-card";
  _0x5351b1.id = "movie-" + _0x319c83.id;
  _0x5351b1.innerHTML = "\n        <div class=\"release-year\">" + new Date(_0x319c83.release_date).getFullYear() + "</div>\n        <img class='img-fluid' src=\"https://image.tmdb.org/t/p/w500/" + _0x319c83.poster_path + "\" class=\"movie-poster\" alt=\"" + _0x319c83.title + "\">\n        <div class=\"streaming-overlay\"></div>\n    ";
  getStreamingProviders(_0x319c83.id).then(_0x26df45 => {
    const _0x1242b9 = _0x5351b1.querySelector(".streaming-overlay");
    _0x26df45.forEach(_0x1e859e => {
      console.log("\n                Provedor: " + _0x1e859e.provider_name + "\n                ID: " + _0x1e859e.provider_id + "\n                Prioridade: " + _0x1e859e.display_priority + "\n                Logo: " + _0x1e859e.logo_path + "\n                ----------------------------------------\n            ");
    });
    if (-1 > 0) {
      _0x1242b9.innerHTML = _0x26df45.map(_0x8e7043 => {
        let _0x400419 = '#';
        switch (_0x8e7043.provider_name.toLowerCase().trim()) {
          case 'netflix':
          case "netflix basic with ads":
            const _0x5252a5 = _0x319c83.title.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, '-');
            _0x400419 = 'https://www.netflix.com/search/' + _0x5252a5;
            break;
          case "amazon prime video":
            const _0xaa3055 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.primevideo.com/search?phrase=" + _0xaa3055;
            break;
          case "disney plus":
            _0x400419 = 'https://www.disneyplus.com/pt-br';
            break;
          case "max":
          case "max basic with ads":
            const _0x56f315 = _0x319c83.original_title;
            const _0x68821e = encodeURIComponent(_0x56f315);
            _0x400419 = "https://www.max.com/br/pt?q=" + _0x68821e;
            break;
          case "claro tv+":
            const _0x5b4500 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.clarotvmais.com.br/busca?q=" + _0x5b4500;
            break;
          case "paramount plus":
            _0x400419 = "https://www.paramountplus.com/br/search/";
            break;
          case "mubi":
            const _0x28733e = _0x319c83.original_title || _0x319c83.title;
            const _0x2cda86 = _0x28733e.normalize("NFD").replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, '-');
            _0x400419 = "https://mubi.com/pt/br/films/" + _0x2cda86;
            break;
          case "globoplay":
            const _0x27d0c5 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://globoplay.globo.com/busca/?q=" + _0x27d0c5;
            break;
          case "apple tv+":
            const _0x68eff9 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://tv.apple.com/br/search?term=" + _0x68eff9;
            break;
          case 'crunchyroll':
            const _0x32c1ef = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.crunchyroll.com/pt-br/search?q=" + _0x32c1ef;
            break;
          case "discovery+":
            const _0x2a9ef2 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.discoveryplus.com/br/search?q=" + _0x2a9ef2;
            break;
          case "pluto tv":
            const _0x27948b = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://pluto.tv/pt/search?q=" + _0x27948b;
            break;
          case "star plus":
          case "star+ amazon channel":
            const _0x475308 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.starplus.com/pt-br/search?q=" + _0x475308;
            break;
          case "hbo go":
            const _0x1613fd = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://play.hbomax.com/search?q=" + _0x1613fd;
            break;
          case "telecine":
          case "telecine play":
            const _0x37a80f = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.primevideo.com/region/na/search/ref=atv_sr_sug_10?phrase=" + _0x37a80f + "&ie=UTF8&jic=44%7CChF0ZWxlY2luZWNoYW5uZWxichIMc3Vic2NyaXB0aW9u";
            break;
          case "vix+":
          case 'vix':
            const _0x529d5d = encodeURIComponent(_0x319c83.title);
            _0x400419 = 'https://www.vix.com/pt/busca?q=' + _0x529d5d;
            break;
          case "wow":
          case "wow presents plus":
            const _0x2de2b1 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.wowpresentsplus.com/search?q=" + _0x2de2b1;
            break;
          case 'looke':
            const _0x3d1156 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.looke.com.br/search?q=" + _0x3d1156;
            break;
          case "oi play":
            const _0x4004ec = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.oi.com.br/play/busca?q=" + _0x4004ec;
            break;
          case "now":
            const _0x27377b = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.clarotvmais.com.br/busca?q=" + _0x27377b;
            break;
          case "paramount+ amazon channel":
            const _0x28f6c4 = encodeURIComponent(_0x319c83.title);
            _0x400419 = 'https://www.amazon.com.br/gp/video/search?phrase=' + _0x28f6c4;
            break;
          case "mgm amazon channel":
            const _0x4cda82 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.amazon.com.br/gp/video/search?phrase=" + _0x4cda82;
            break;
          case "starz play amazon channel":
            const _0x39d8ce = encodeURIComponent(_0x319c83.title);
            _0x400419 = 'https://www.amazon.com.br/gp/video/search?phrase=' + _0x39d8ce;
            break;
          case "universal+ amazon channel":
            const _0x5f257f = encodeURIComponent(_0x319c83.title);
            _0x400419 = 'https://www.amazon.com.br/gp/video/search?phrase=' + _0x5f257f;
            break;
          case "paramount+ apple tv channel":
            const _0x24cd1c = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://tv.apple.com/br/channel/paramount-plus?q=" + _0x24cd1c;
            break;
          case "starzplay":
            const _0x2a35df = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.lionsgateplusla.com/br/search?q=" + _0x2a35df;
            break;
          case "directv go":
            const _0x3c49cb = encodeURIComponent(_0x319c83.title);
            _0x400419 = 'https://www.directvgo.com/br/busca?q=' + _0x3c49cb;
            break;
          case "sun nxt":
            const _0x5a3b15 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.sunnxt.com/search?q=" + _0x5a3b15;
            break;
          case "curiosity stream":
            const _0x167029 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://curiositystream.com/search?q=" + _0x167029;
            break;
          case 'docsville':
            const _0x4410a5 = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://docsville.com/search?q=" + _0x4410a5;
            break;
          case "funimation":
            const _0x4a0e5b = encodeURIComponent(_0x319c83.title);
            _0x400419 = "https://www.crunchyroll.com/pt-br/search?q=" + _0x4a0e5b;
            break;
          default:
            _0x400419 = '#';
            break;
        }
        return "\n                    <a href=\"" + _0x400419 + "\" target=\"_blank\">\n                        <img class=\"streaming-icon\" src=\"https://image.tmdb.org/t/p/w200" + _0x8e7043.logo_path + "\" alt=\"" + _0x8e7043.provider_name + "\">\n                    </a>\n                ";
      }).join('');
    } else {
      idMovie = '' + _0x319c83.id;
      const _0x1c26e1 = [{
        'name': 'UltraEmbed',
        'url': 'https://ultraembed.com/filme/' + _0x319c83.id,
        'icon': 'img/ico.png'
      }, {
        'name': 'VidSrc',
        'url': "https://vidsrc.to/embed/movie/" + _0x319c83.id,
        'icon': "img/vidsrc.png"
      }, {
        'name': "SuperEmbed",
        'url': "https://multiembed.mov/directstream.php?video_id=" + _0x319c83.id + "&tmdb=1",
        'icon': "img/super.png"
      }];
      const _0x41c280 = document.createElement("div");
      _0x41c280.style.cssText = "\n                display: flex;\n                flex-direction: column;\n                gap: 10px;\n                justify-content: center;\n                align-items: center;\n                position: absolute;\n                top: 50%;\n                left: 50%;\n                transform: translate(-50%, -50%);\n                z-index: 10;\n            ";
      _0x1c26e1.forEach(_0x57f5ef => {
        const _0x4fe246 = document.createElement('a');
        _0x4fe246.href = _0x57f5ef.url;
        _0x4fe246.target = '_blank';
        _0x4fe246.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            background-color: rgba(255, 0, 0, 0.8);
            border-radius: 5px;
            transition: all 0.3s ease;
            text-decoration: none;
            cursor: pointer;
        `;
        _0x4fe246.title = "Assistir em " + _0x57f5ef.name;
        _0x4fe246.onmouseover = function () {
          this.style.backgroundColor = "rgba(255, 0, 0, 1)";
          this.style.transform = "scale(1.1)";
        };
        _0x4fe246.onmouseout = function () {
          this.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
          this.style.transform = 'scale(1)';
        };
        const _0x5a0ecf = document.createElement('div');
        _0x5a0ecf.innerHTML = '▶';
        _0x5a0ecf.style.cssText = "\n                    color: white;\n                    font-size: 20px;\n                    line-height: 1;\n                    text-align: center;\n                ";
        _0x4fe246.appendChild(_0x5a0ecf);
        _0x41c280.appendChild(_0x4fe246);
      });
      _0x1242b9.appendChild(_0x41c280);
    }
  });
  return _0x5351b1;
}
function searchMovies(_0x4354dd) {
  const _0x54eadf = "https://api.themoviedb.org/3/search/movie?api_key=5d089ef4c7749b3acc4f404cbfced723&language=pt-BR&query=" + encodeURIComponent(_0x4354dd);
  fetch(_0x54eadf).then(_0x47ac40 => _0x47ac40.json()).then(_0x240f26 => {
    movies = _0x240f26.results;
    renderMovies(movies);
  })["catch"](_0x47553e => {
    console.error("Erro na pesquisa:", _0x47553e);
  });
}
document.getElementById('searchInput').addEventListener("input", _0x34874d => {
  const _0x3fac80 = _0x34874d.target.value.trim();
  if (_0x3fac80.length >= 0x3) {
    movieGrid.innerHTML = '';
    searchMovies(_0x3fac80);
  } else if (_0x3fac80.length === 0x0) {
    currentPage = 0x1;
    movieGrid.innerHTML = '';
    getMovies();
    renderMovies(data.results, false);
    currentPage++;
  }
});
function initScrollObserver() {
  const _0x5dffaf = new IntersectionObserver(_0x415bf7 => {
    _0x415bf7.forEach(_0x32636e => {
      if (_0x32636e.isIntersecting && !isLoading && currentPage <= totalPages) {
        getMovies();
      }
    });
  }, {
    'rootMargin': "100px",
    'threshold': 0x1
  });
  _0x5dffaf.observe(document.querySelector(".loader"));
}
async function getStreamingProviders(_0x5a69a3) {
  if (providersCache.has(_0x5a69a3)) {
    return providersCache.get(_0x5a69a3);
  }
  try {
    const _0x158a09 = await fetch('https://api.themoviedb.org/3/movie/' + _0x5a69a3 + "/watch/providers?api_key=" + '5d089ef4c7749b3acc4f404cbfced723');
    const _0x2adcb4 = await _0x158a09.json();
    let _0x3ab2d0 = _0x2adcb4.results.BR?.["flatrate"] || [];
    const _0x1c6309 = {
      "paramount plus apple tv channel": "paramount plus",
      "paramount plus premium": "paramount plus",
      "paramount+ apple tv channel": "paramount plus",
      "paramount+ amazon channel": "paramount plus",
      "telecine amazon channel": "amazon prime video",
      "max amazon channel": "max",
      "star+ amazon channel": "star plus",
      "mgm amazon channel": "amazon prime video",
      "universal+ amazon channel": "amazon prime video",
      "adrenalina pura amazon channel": "amazon prime video",
      "adrenalina pura apple tv channel": "apple tv+",
      "looke amazon channel": 'looke'
    };
    const _0x30a474 = {
      "paramount plus": 0x213,
      'max': 0x76b,
      'netflix': 0x8,
      "amazon prime video": 0x77,
      "disney plus": 0x151,
      'globoplay': 0x133,
      'looke': 0x2f
    };
    _0x3ab2d0 = _0x3ab2d0.map(_0xadda9c => {
      const _0x5332d3 = _0xadda9c.provider_name.toLowerCase();
      if (_0x1c6309[_0x5332d3]) {
        const _0x4381e2 = _0x1c6309[_0x5332d3];
        return {
          ..._0xadda9c,
          'provider_name': _0x4381e2,
          'provider_id': _0x30a474[_0x4381e2] || _0xadda9c.provider_id,
          'is_channel': true,
          'original_name': _0xadda9c.provider_name
        };
      }
      return _0xadda9c;
    });
    _0x3ab2d0 = _0x3ab2d0.reduce((_0x251adc, _0x5504c6) => {
      const _0x4e9892 = _0x251adc.find(_0x28af03 => _0x28af03.provider_name.toLowerCase() === _0x5504c6.provider_name.toLowerCase());
      if (!_0x4e9892) {
        _0x251adc.push(_0x5504c6);
      } else {
        if (_0x4e9892.provider_id !== _0x30a474[_0x4e9892.provider_name.toLowerCase()]) {
          const _0x29474a = _0x251adc.indexOf(_0x4e9892);
          _0x251adc[_0x29474a] = _0x5504c6;
        }
      }
      return _0x251adc;
    }, []);
    _0x3ab2d0.sort((_0xac4ef8, _0xd31945) => {
      const _0x2139b7 = {
        'netflix': 0x0,
        "amazon prime video": 0x1,
        "disney plus": 0x2,
        'max': 0x3,
        "paramount plus": 0x4,
        'globoplay': 0x5,
        'looke': 0x6
      };
      const _0xea23b7 = _0xac4ef8.provider_name.toLowerCase();
      const _0x21ade6 = _0xd31945.provider_name.toLowerCase();
      const _0x5c64ca = _0x2139b7[_0xea23b7] !== undefined ? _0x2139b7[_0xea23b7] : _0xac4ef8.display_priority;
      const _0x6dbc6b = _0x2139b7[_0x21ade6] !== undefined ? _0x2139b7[_0x21ade6] : _0xd31945.display_priority;
      return _0x5c64ca - _0x6dbc6b;
    });
    providersCache.set(_0x5a69a3, _0x3ab2d0);
    return _0x3ab2d0;
  } catch (_0x35a1fd) {
    console.error("Erro ao buscar provedores:", _0x35a1fd);
    return [];
  }
}
getMovies();
initScrollObserver();