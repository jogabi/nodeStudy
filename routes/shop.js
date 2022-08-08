/* router 여러개 추가해야되어야 할 때 */
var router = require('express').Router();

router.get('/shirts', function (req, res) {
  res.send('셔츠 파는 페이지')
})

router.get('/pants', function (req, res) {
  res.send('바지 파는 페이지')
})

module.exports = router;
