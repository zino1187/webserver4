var http=require("http");  //기본서버
var express=require("express"); //기본 서버에 기능을 보강하기 위한 모듈
var bodyParser=require("body-parser");//post 방식의 데이터를 json 형식
														//으로 받을수 있게 해줌
var fs=require("fs"); //파일을 제어하는 내부모듈!!
var ejs=require("ejs");// 동적 html 생성하는 모듈!!
								//html 과 섞어 사용사용시<%%>영역은 프로그램
								//실행영역으로 처리되어, 동적 html 생성...

var app=express();
var server=http.createServer(app);//업그레이드 서버!!

// 정적자원(html, css, js, image 등)에 대해서는 모두 라우팅하면 너무 많은
// app.use() 메서드를 둬야 하므로, static 미들웨어를 통해 처리..
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


//로그인 요청 처리 
app.post("/login", function(request, response){
	console.log(request.body);
	var id=request.body.id;

	//오라클에 존재하는 회원이면, 추후 웹사이트 접속시에 
	//이 회원을기억하는 효과를 내보자 = 로그인....
	fs.readFile("admin/index.ejs","utf-8",function(error, data){
		response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
		response.end(ejs.render(data, {
			id:id
		}));
	});
});

server.listen(8888, function(){
	console.log("웹서버 8888포트에서 가동중...");
});//서버가동