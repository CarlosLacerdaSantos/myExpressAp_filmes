var express = require('express');
var router = express.Router();
let currentPage = 1;
let totalPages;
let uniqueSeries;
require('dotenv').config();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Cine Top',
    id: ''
  });
});

router.post('/filmes', async function (req, res, next) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=pt-BR&page=${currentPage}`);
    const data = await response.json();
    totalPages = data.total_pages;

    // Filtrar séries únicas
    const newSeries = data.results.filter(item => !uniqueSeries.some(series => series.id === item.id));
    uniqueSeries = [...uniqueSeries, ...newSeries];

    res.send(uniqueSeries);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send('Erro ao buscar dados');
  }
});



module.exports = router;