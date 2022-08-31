
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))

/* form 데이터를 전송 body-parser */

app.listen(8080, () => {
  console.log('listening on 8080')
})

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
  console.log(req.body);
  res.send("전송완료")
})