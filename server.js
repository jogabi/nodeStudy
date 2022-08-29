const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;

var methodOverride = require('method-override')
app.use(methodOverride('_method'))

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session');

// 환경변수 라이브러리 세팅
require('dotenv').config()



var db;

app.set('view engine', 'ejs');
/* css 파일 쓰고 싶을떄 public  */
app.use('/public', express.static('public'))

/* env 파일을 별도로 만들어서 따로 세팅함 */
MongoClient.connect(process.env.DB_URL, function (error, client) {
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
  res.redirect('/write')
})


/* 데이터 삭제시 */
/* 경로로 요청을 하면 게시물 번호를 삭제함 */
app.delete('/delete', function (req, res) {
  /* 보낸 데이터출력 여기에 들어있음 */
  console.log(req.user._id);

  req.body._id = parseInt(req.body._id, 10)
  let data = { _id: req.body._id, writeId: req.user._id }

  db.collection('post').deleteOne(data, function (error, result) {
    console.log('삭제완료');
    console.log('에러', error)

    res.status(200).send({ message: '성공했습니다' });
  })
})



app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})


app.get('/fail', function (req, res) {
  res.render('fail.ejs');
})

/* 마이페이지 */
app.get('/mypage', loginCheck, function (req, res) {
  console.log(req.user);/* 새로고침 할 떄마다 유저정보 나옴 */
  res.render('mypage.ejs', { user: req.user })
})

/* 로그인 했는지 체크 */
/* 요청 응답 next  */
function loginCheck(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.send('로그인을 하세요')
  }
}


/* 글발행 */
app.post('/add', function (req, res) {
  db.collection('counter').findOne({ name: '게시물 갯수' }, function (error, res) {
    let total = res.totalPost;
    let getUserDb = { _id: total + 1, title: req.body.title, date: req.body.date, writeId: req.user._id }

    db.collection('post').insertOne(getUserDb, function () {
      db.collection('counter').updateOne({ name: '게시물 갯수' }, { $set: { totalPost: total + 1 } })
    })
  });
})



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
/* 유저정보 여려가지로 저장될 수 있음 */

passport.deserializeUser(function (id, done) { /* 이사람이 어떤사람인지 해석함 */
  /* db에서 usesr.id 로 유저 찾은 뒤에 유저 정보를 여기에 넣음 */
  db.collection('login').findOne({ id: id }, function (error, result) {
    done(null, result) /* db결과 */ /* 유저정보를 마이페이지에 출력 할 수 있음  */
  })
})

/* 회원가입 데이터 저장 */
app.post('/register', function (req, res) {
  /* input name 을 넘김 req.body.id */

  /* 중복인지 아닌지 검사하기 */
  db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, function (error, result) {
    res.redirect('/')

  });

})

/* 로그인 페이지 제작 & 라우팅 npm */
/* session 방식 로그인 구현
npm install passport passport-local express-session
*/

/*
서버 공부 해봐야 할 것들
아이디 길이 검사
DB 저장시 빈칸 확인 , 길이 정규식 확인
helmet 라이브러리 보안
이미지 업로드 서버에서 이미지 처리 (압축, 저장, 리사이즈)
Oauth 등 다른 로그인 방식1
express-session세션이 많아지면 메모리 문제 생김 / connect-mongo 라이브러리 DB에 세션 데이터를 저장해서 사용하기
*/

app.get('/search', (req, res) => {
  /* 정규식 추가 가능함  */
  /* 게시물이 많을 떄 문제가 됨 - find  */
  /* 검색조건 */
  var searchJoin = [{
    $search: {
      index: 'titleSearch',
      text: {
        query: req.query.value,
        path: 'title'
      }
    }
  },
  { $sort: { _id: 1 } },
  { $limit: 10 },
  {
    $project: { title: 1, _id: 0, score: { $meta: "searchScore" } }
  }, /* 원하는 검색결과 */
  ]

  /* 게시판 만들떄 필요 없음 */
  db.collection('post').aggregate(searchJoin).toArray((error, result) => {
    console.log(result);
    res.render('search.ejs', { search: result }) /* 옆에 데이터 보냄 검색결과 */
    /* 정확히 일치하는 것만 찾기 정규식 */
  })
})
/* shop.js 파일 연결  */
app.use('/shop', require('./routes/shop.js'))



/* 이미지 올릴때 편한 라이브러리 */
let multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/image')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
  filefilter: function (req, file, cb) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('png jpg만 업로드 하시오'))

    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024
  }
})


app.get('/image/:imageName', function (req, res) {
  res.sendFile(__dirname + '/public/image/' + req.params.imageName)
})


var upload = multer({ storage: storage })

/* 이미지 업로드 페이지 : 이미지 저장함 */
app.get('/upload', function (req, res) {
  /* 이미지 하드에 저장하는게 저렴함 */
  res.render('upload.ejs')

})

app.post('/upload', upload.single('profile'), function (req, res) {
  res.send('업로드 완료!!!!');
})

/* 채팅 기능 추가
채팅을 누르면 게시물 발행
댓글 남길 수 있게 부모게시물 추가

채팅방 게시물 언제 실행 되는
*/

const { ObjectId } = require('mongodb');
app.post('/chatroom', loginCheck, function (req, res) {

  console.log('req.body.userId', req.body.userId);
  /* 채팅을 만든 유저 정보 저장  */
  var writeUser = {
    title: "채팅방 상황",
    member: [req.body.userId, req.user._id], //object 형식으로 저장
    date: new Date()
  }
  db.collection('chatroom').insertOne(writeUser).then((result) => {

  })

})

/* 댓글 기능 이랑 동일함 */
