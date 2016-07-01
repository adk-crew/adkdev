var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/simpage', function (req, res) {
    res.render('simpage', { title: 'simulator page' });
});


module.exports = router;