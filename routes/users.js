var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title:'Onde Assistir, user' });
});






module.exports = router;