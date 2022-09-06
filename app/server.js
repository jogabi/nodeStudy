
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

MongoClient.connect('mongodb+srv://gabi:1234@cluster0.daut0.mongodb.net/?retryWrites=true&w=majority', (error, client) => {
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
app.post('/add', (req, res) => {

  db.collection('counter').findOne({ name: '게시물갯수' }, (error, result) => {
    let resultPost = parseInt(result.totalPost)
    db.collection('post').insertOne({ id: resultPost + 1, title: req.body.title, date: req.body.date }, () => {

      db.collection('counter').updateOne({ name: '게시물갯수' }, { $inc: { totalPost: 1 } }, (error, result) => {
        console.log('total couter 수정 완료');
      })
    })
    res.render('write.ejs')


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

app.put('/edit', function (req, res) {
  console.log(req.body);
  db.collection('post').updateOne({ id: parseInt(req.body.id) }, { $set: { title: req.body.title, date: req.body.date } }, function () {
    console.log('수정완료');
    res.redirect('/list')
  })
})
