
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))

var db;

/* mongo db */
const MongoClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');

MongoClient.connect('mongodb+srv://gabi:1234@cluster0.daut0.mongodb.net/?retryWrites=true&w=majority', function (error, client) {
  if (error) return console.log(error);
  db = client.db('todoapp');

  //서버띄우는 코드 여기로 옮기기
  app.listen('8080', function () {
    console.log('listening on 8080')
  });
})

/* form 데이터를 전송 body-parser */
app.get('/pet', (req, res) => {
  res.send('펫용품 테스트')

})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')

})

app.get('/write', (req, res) => {
  res.sendFile(__dirname + '/write.html')
})

/* 글쓰기 전송받음 */
app.post('/add', (req, res) => {
  db.collection('post').insertOne({ title: req.body.title, date: req.body.date }, function () {
    res.send("전송완료")
  })
})


/* list 꺼내기 */

app.get('/list', function (req, res) {
  db.collection('post').find().toArray(function (error, result) {
    console.log(result);
    /* ejs 파일 보내기 */
    res.render('list.ejs', { posts: result })
  })
})

