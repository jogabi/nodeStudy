/* 라이브러리 불러옴  */
var router = require('express').Router();

router.use(loginCheck)


function loginCheck(req, res, next) {
  if (req.user) { next() }
  else { res.send('로그인 해주세요.') }
}

/* 연습용 페이지  */
router.get('/shirts', function (req, res) {
  res.send('셔츠 페이지 테스트');
})

router.get('/pants', function (req, res) {
  res.send('바지 파는 페이지');
})

/* 최상단 router 배출*/
module.exports = router;