const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

var methodOverride = require('method-override')
app.use(methodOverride('_method'))

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session');

var db;



app.set('view engine', 'ejs');
/* css 파일 쓰고 싶을떄 public  */
app.use('/public', express.static('public'))

MongoClient.connect('mongodb+srv://gabi:1234@cluster0.daut0.mongodb.net/?retryWrites=true&w=majority', function (error, client) {
  if (error) return console.log(error);
  db = client.db('todoapp')

  app.listen('8080', function () {
    console.log('8080');
  })
})


app.use(bodyParser.urlencoded({ extended: true }))


app.get('/pet', function (req, res) {
  res.send('구매완료')
})


app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/write.html')
})

app.use(express.urlencoded({ extended: true }))
app.post('/add', function (req, res) {

  db.collection('counter').findOne({ name: '게시물 갯수' }, function (error, res) {
    let total = res.totalPost;
    db.collection('post').insertOne({ _id: total + 1, title: req.body.title, date: req.body.date }, function () {
      db.collection('counter').updateOne({ name: '게시물 갯수' }, { $set: { totalPost: total + 1 } })
    })
  });
})


app.get('/list', function (req, res) {
  db.collection('post').find().toArray(function (error, result) {
    res.render('list.ejs', { posts: result })
  })
})

/* detail 페이지 보이게 함 */
/* :id 를 쓰게되면 사용자가 아무 문자나 입력하면 그걸 가져옴 */
/* 파라미터 기능 */
app.get('/detail/:id', function (req, res) {
  db.collection('post').findOne({ _id: parseInt(req.params.id, 10) }, function (err, result) {
    console.log("결과", result);
    res.render('detail.ejs', { data: result })

  })
})

/* 데이터 삭제시 */
/* 경로로 요청을 하면 게시물 번호를 삭제함 */
app.delete('/delete', function (req, res) {
  /* 보낸 데이터출력 여기에 들어있음 */

  req.body._id = parseInt(req.body._id, 10)
  /* 전송 */
  db.collection('post').deleteOne(req.body, function (error, result) {
    console.log('삭제완료');
    res.status(200).send({ message: '성공' })
  })
})

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/edit/:id', function (req, res) {
  /* url 파라미터 넘기기 */
  db.collection('post').findOne({ _id: parseInt(req.params.id, 10) }, function (error, result) {
    console.log('edit결과', result);
    if (result == null) {
      res.send('조회실패')
    } else {
      res.render('edit.ejs', { post: result });
    }
  })
})

app.put('/edit', function (req, res) {
  /* edit put 요청을 하면 폼에담긴 제목 ,날짜 데이터 가지고 db.collection 에 update함   */
  db.collection('post').updateOne({ _id: parseInt(req.body.id, 10) }, { $set: { title: req.body.title, date: req.body.date } }, function (error, result) {
    res.status(200).redirect('/list')
  })
})


/* 미들웨어 세팅 세션 비밀번호 123
요청 응답 중간에 코드 동작 실행시키고 싶을때
*/
app.use(session({ secret: '123', resave: true, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

/* 로그인 하고 나서 실행시켜줄것 */
app.get('/login', function (req, res) {
  res.render('login.ejs');
})

/* 인증 체크  */
app.post('/login', passport.authenticate('local', {
  /* 로그인 후 체크  */
  failureRedirect: '/fail'
}), function (req, res) {
  res.redirect('/')
})

app.get('/fail', function (req, res) {
  res.render('fail.ejs');
})

app.get('/myapge', loginCheck, function (req, res) {
  res.render('mypage.ejs')
})

function loginCheck(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.send('로그인을 하세요')
  }
}


/* 로그인 검사 */
passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (inputId, inputPw, done) {

  db.collection('login').findOne({ id: inputId }, function (error, result) {
    console.log('result', result);

    if (error) return done(error)
    /* 3개 파라미터 추가 가능함 */
    if (!result) return done(null, false, { message: '존재하지않음' }) /* 결과가 없을때  */

    /*
    그럼 done 뭔지?
    라이브러리 문법
    */

    /* 비밀번호 일치할 때는
    대신 보안이 좋지 않음
    추가 내용은 구글링으로 해결
    */
    if (inputPw == result.password) {
      return done(null, result) /* 라이브러리 문접  */
    } else {
      return done(null, false, { message: '틀림 ' })
    }
  })
}));


/* 로그인 검사 끝날시 세션데이터 검사 */
passport.serializeUser(function (user, done) { /* 세션 저장 */
  done(null, user.id)
})
passport.deserializeUser(function (id, done) { /* 이사람이 어떤사람인지 해석함 */
  done(null, {})
})

/* 로그인 페이지 제작 & 라우팅 npm */
/* session 방식 로그인 구현
npm install passport passport-local express-session
*/


