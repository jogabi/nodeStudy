# 실행 방법
cd app

npm ci

nodemon server.js
# 결과물 배포 사이트

[https://rugged-destiny-358805.du.r.appspot.com/search](https://rugged-destiny-358805.du.r.appspot.com/search)

# 사용기술

DB : MongoDB native driver

Server : nodejs

배포 : Google Cloud Engine

## 사이트 기능

- 회원가입 유저의 아이디 비밀번호 생성 , 기존 있는 아이디 인지 유효성 체크
- 로그인 로그인을 하면 localhost에 세션 토큰정보 저장
- 글쓰기 회원인지 체크, 오늘 할 일/날짜 글쓰기 하면 DB에 저장, DB에 couter 을 추가하여 몇번째 글 인지 추가
- 글 리스트 작성한 글 리스트를 확인할 수 있음, 글 리스트 클릭 시 상세페이지로 이동, 글 삭제 기능
- 글 리스트 상세 해당 글 수정 기능
- 마이페이지 회원인지 체크, 해당 유저 id 확인 가능
- 검색 글 제목 입력시 게시글 검색 결과 보여줌 , Mongo DB 의 Indexes 기능을 추가 해보았음
    - MongoDB Atlas에서만 제공하는 기능인데 Search index의 기능중에 lucene.korean 으로 변경해 주면 한국어에 맞는 인덱싱이 가능하다. 한국어는 단어 뒤에 조사가 많이 붙기 때문에 제거하고 한 단어만 남기게 하여 검색을 좀 더 유연?하게 할 수 있다.
- 이미지 업로드 이미지를 업로드 하면 업로드 한 이미지를 직접 하드에 저장, 업로드 한 이미지 명으로 이동을 하면 업로드 이미지 확인 가능

# node.js를 공부한 이유

프론트엔드 업무를 하면서 웹의 앞단에 대한 기능을 만들었지만 그 기능으로 내가 직접 데이터 변경이나 저장을 하고 싶었고 어떻게 서버에서 데이터get,post 형식으로 오는지 궁금했다.

직접 서비스를 만들어 보고 싶었고 서버까지 하면서 직접 데이터 소통도 하며 웹의 좀 더 심화적인 느낌?으로 다가가고 싶었다.

# 주로 사용했던 문법

```jsx
const express = require('express');
const app = express();
```
express가 뭐냐 ; 서버를 매우 쉽게 짤 수 있게 도와주는 라이브러리, 두줄쓰면 서버생성 가능!

```jsx
const MongoClient = require('mongodb').MongoClient;
```
MongoDb Client 와 연동

```jsx
app.get('해당 url', (req, res) => {
1 res.send('화면에 띄워줄 텍스트')
2	res.render('ejs 파일')
3	res.sendFile(__dirname + '해당 링크' + req.params.imgName)
})
```
만들고 싶은 url을 적고 해당 url로 이동 하게되면 만든 페이지가 생성됨


```jsx
app.post('/register', (req, res) => {

})
```
만들고 싶은 url을 적고 해당 url로 이동 하게되면 만든 페이지가 생성됨

```jsx
db.collection('login').findOne({ id: req.body.id }, (error, result) => {  })
```
만들고 싶은 url을 적고 해당 url로 이동 하게되면 만든 페이지가 생성됨

```jsx
db.collection('counter').updateOne({ 해당DB 데이터 }, { 바꿔줄데이터 }, (error, result) => {
	console.log('수정 완료');
})

```
만들고 싶은 url을 적고 해당 url로 이동 하게되면 만든 페이지가 생성됨


```jsx
app.delete('/delete', (req, res) => {
  /* db에서 post 요청을 할 때 deleteOne 을 해줌 */
  db.collection('post').deleteOne(req.body, (error, result) => {
    console.log('삭제완료');
  })
  res.send('삭제완료')
})
```
DB Collections post 데이터를 삭제해줌

```jsx
/* put수정요청 */
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');

db.collection('post').updateOne({찾을 데이터}, {바꿔줄 데이터 }, () => {
    console.log('수정완료');
 })

<form action="/edit?_method=PUT" method="POST">
</form>
```
코드 수정시 사용했던 라이브러리 action에 붙여주고 해당 DB에 updateOne 을 해줌

# 결론 느낀점

지금까지 사용한 방식은 MongoDB native driver 이였다. 말그대로 MongoDB를 쌩으로 짠것 ,

하지만,

**Mongoose 라이브러리로 간단하게 기능을 구현하는 방법도 있다!(문법이 좀 더 간결해지고 쉽다.) , 그리고 데이터 관리를 좀 더 쉽게 할 수 있는 프로그램들도 있다.**

다음에는 리엑트와 함계 서버를 연동해서 귀여운 웹 앱 하나 만들어볼것이다

# 앞으로 공부해야할 사항

1. 보안강화 해보기

2. 프론트엔드 기술 (Vue, React, Angular) 로 서버와 연동하여 빌드 해보기

3. 사용자가 업로드한 이미지, 파일 다루는 방법 (이미지 리사이즈, 축소, 검열 등)

4. OAuth 소셜로그인기능

5. 서버 컴퓨터 메모리 터짐을 방지하기 위해 세션데이터를 서버메모리가 아니라 MongoDB에 저장하는 법?..