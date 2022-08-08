var router = require('express').Router();

router.get('/shop/shirts', function (req, res) {
  req.send('셔츠 파는 페이지')
})

router.get('/shop/pants', function (req, res) {
  req.send('바지 파는 페이지')
})

module.exports = router;
