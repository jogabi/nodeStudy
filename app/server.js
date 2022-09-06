
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.use('/public', express.static('public'))

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

  db.collection('counter').findOne({ name: '게시물갯수' }, function (error, result) {
    let resultPost = parseInt(result.totalPost)
    db.collection('post').insertOne({ id: resultPost + 1, title: req.body.title, date: req.body.date }, function () {

      db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, function (error, result) {
        console.log('total couter 수정 완료');
      })
    })

    res.send("전송완료")


  })
})

/* delete 요청 들어올떄 삭제 */
app.delete('/delete', function (req, res) {
  req.body.id = parseInt(req.body.id)

  /* db에서 post 요청을 할 때 deleteOne 을 해줌 */
  db.collection('post').deleteOne(req.body, function (error, result) {
    console.log('삭제완료');
  })
  res.send('삭제완료')
})


/* list 꺼내기 */
app.get('/list', function (req, res) {
  db.collection('post').find().toArray(function (error, result) {
    /* ejs 파일 보내기 */
    res.render('list.ejs', { posts: result })
  })
})

/* 상세페이지 url 파라미터 */
app.get('/detail/:id', function (req, res) {
  /*
  db post 찾아주고 id 값 받아와서 응답에 render 시킴
  */

  db.collection('post').findOne({ id: parseInt(req.params.id) }, function (error, result) {
    res.render('detail.ejs', { data: result })
  })
})

