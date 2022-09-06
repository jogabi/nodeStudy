
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static('public'))

var db;

/* mongo db */
const MongoClient = require('mongodb').MongoClient;

/* put수정요청 */
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

/* env 환경변수 */
require('dotenv').config()

/* 로그인 세션 체크 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (inputId, inputPw, done) {
  //console.log(inputId, inputPw);
  db.collection('login').findOne({ id: inputId }, function (error, result) {
    if (error) return done(error)

    if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
    if (inputPw == result.pw) {
      return done(null, result)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));





MongoClient.connect(process.env.DB_URL, (error, client) => {
  if (error) return console.log(error);
  db = client.db('todoapp');

  //서버띄우는 코드 여기로 옮기기
  app.listen('8080', () => {
    console.log('listening on 8080')
  });
})

/* form 데이터를 전송 body-parser */
app.get('/pet', (req, res) => {
  res.send('펫용품 테스트')
})

app.get('/', (req, res) => {
  res.render('index.ejs')
})

app.get('/write', (req, res) => {
  res.render('write.ejs')
})

/* 글쓰기 전송받음 */
app.post('/add', loginCheck, (req, res) => {
  db.collection('counter').findOne({ name: '게시물갯수' }, (error, result) => {
    let resultPost = parseInt(result.totalPost)
    db.collection('post').insertOne({ id: resultPost + 1, title: req.body.title, date: req.body.date, name: req.user._id }, () => {
      db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, (error, result) => {
        console.log('total couter 수정 완료');
      })
    })
    res.render('write.ejs')
  })
})

app.get('/register', (req, res) => {
  res.render('register.ejs')
})

app.post('/register', (req, res) => {

  db.collection('login').findOne({ id: req.body.id }, (error, result) => {
    // res.render('edit.ejs', { posts: result })
    console.log(result);
    if (result) {
      res.send('중복 아이디')
    } else {
      db.collection('login').insertOne({ id: req.body.id, pw: req.body.pw }, (error, result) => {
        res.redirect('/')
      })
    }
  })

})


/* delete 요청 들어올떄 삭제 */
app.delete('/delete', (req, res) => {
  req.body.id = parseInt(req.body.id)
  /* db에서 post 요청을 할 때 deleteOne 을 해줌 */
  db.collection('post').deleteOne(req.body, (error, result) => {
    console.log('삭제완료');
  })
  res.send('삭제완료')
})


/* list 꺼내기 */
app.get('/list', (req, res) => {
  db.collection('post').find().toArray((error, result) => {
    /* ejs 파일 보내기 */
    res.render('list.ejs', { posts: result })
  })
})

/* edit 상세페이지 */
app.get('/edit/:id', (req, res) => {
  /* post 에서 findOne 해서 id parmas 가져옴 */
  db.collection('post').findOne({ id: parseInt(req.params.id) }, (error, result) => {
    res.render('edit.ejs', { posts: result })
  })
})

/* 수정하기 */

app.put('/edit', (req, res) => {
  console.log(req.body);
  db.collection('post').updateOne({ id: parseInt(req.body.id) }, { $set: { title: req.body.title, date: req.body.date } }, () => {
    console.log('수정완료');
    res.redirect('/list')
  })
})


app.get('/login', (req, res) => {
  res.render('login.ejs')
})

app.get('/fail', (req, res) => {
  res.render('fail.ejs')
})
app.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
  res.redirect('/')
});

app.get('/mypage', loginCheck, function (req, res) {
  res.render('mypage.ejs', { user: req.user });
  console.log(req.user);
})

app.get('/search', (req, res) => {
  /* 요청검색어 확인 */
  db.collection('post').find({ $text: { $search: req.query.value } }).toArray((error, result) => {
    console.log(result);
    res.render('search.ejs', { posts: result })
  })
})

function loginCheck(req, res, next) {
  if (req.user) {
    next()
  } else {
    res.send("로그인을 해주세요")
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id)
});

/*
req.user 정보저장
deserializeUser가 보내준 그냥 로그인한 유저의 DB 데이터
*/
passport.deserializeUser((아이디, done) => {
  db.collection('login').findOne({ id: 아이디 }, function (error, result) {
    done(null, result)
  })
});
