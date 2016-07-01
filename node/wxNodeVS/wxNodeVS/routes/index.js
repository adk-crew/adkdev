
/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
};

exports.simpage = function (req, res) {
    res.render('simpage', { title: 'simulator page' });
};