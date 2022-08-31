
const express = require('express');
const app = express();

app.listen(8080, function () {
  console.log('listening on 8080')
})

app.get('/pet', function (req, res) {
  res.send('펫용품 테스트')

})

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')

})