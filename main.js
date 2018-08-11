var http=require("http");  //기본서버
var express=require("express"); //기본 서버에 기능을 보강하기 위한 모듈

var app=express();
var server=http.createServer(app);//업그레이드 서버!!

// 정적자원(html, css, js, image 등)에 대해서는 모두 라우팅하면 너무 많은
// app.use() 메서드를 둬야 하므로, static 미들웨어를 통해 처리..
app.use(express.static(__dirname));


//로그인 요청 처리 
app.post("/login", function(request, response){
	console.log("로그인 요청 받음");
});

server.listen(8888, function(){
	console.log("웹서버 8888포트에서 가동중...");
});//서버가동