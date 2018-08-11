var http=require("http");  //기본서버
var express=require("express"); //기본 서버에 기능을 보강하기 위한 모듈
var bodyParser=require("body-parser");//post 방식의 데이터를 json 형식
														//으로 받을수 있게 해줌
var fs=require("fs"); //파일을 제어하는 내부모듈!!
var ejs=require("ejs");// 동적 html 생성하는 모듈!!
								//html 과 섞어 사용사용시<%%>영역은 프로그램
								//실행영역으로 처리되어, 동적 html 생성...
var oracledb=require("oracledb");
var conn;
var conStr=require("./lib/conStr.js");
var session=require("express-session"); //외부모듈
var multer=require("multer");
var multiparty=require("multiparty");

var app=express();
var server=http.createServer(app);//업그레이드 서버!!

// 정적자원(html, css, js, image 등)에 대해서는 모두 라우팅하면 너무 많은
// app.use() 메서드를 둬야 하므로, static 미들웨어를 통해 처리..
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({
	secret:"adfasdfsfdasdfasdf",
	resave:false, //false 권장 ( 세션에 변화가 있을때만 저장하는 옵션) 특별한 경우가
						//아니라면 false를 권장..
	saveUninitialized:true
})); //세션 설정

//업로드에 대한 설정
var form=new multiparty.Form({
	autoFiles:true,
	uploadDir:__dirname+"/data",  /*파일이 저장될 서버 측 경로*/
	maxFilesSize:1024*1024*5
});


//서버가 가동되면 오라클을 미리 접속해놓자!!
oracledb.getConnection(conStr , function(error, con){
	if(error){
		console.log(error);
	}
	console.log("접속 성공");
	conn=con;
});

//로그인 요청 처리 
app.use("/login", function(request, response){
	console.log(request.body);
	var id=request.body.id;
	var pw=request.body.pw;

	//오라클에 존재하는 회원이면, 추후 웹사이트 접속시에 
	//이 회원을기억하는 효과를 내보자 = 로그인....
	conn.execute("select * from admin where id=:1 and pw=:2", [id,pw] ,function(error, result, fields){
		if(error){
			console.log(error);
		}
		console.log(result.rows.length);

		if(result.rows.length==1){//조회 결과 1건이 나오면, 로그인 처리할 대상...
			//이사람이 웹사이트 어디에서나 참조할수있는 세션 객체에 정보를 담아둔다..

			//현재 요청을 시도한 클라이언트에 부여된 세션 객체에 정보를 담는 과정...
			request.session.user=request.body.id;
			request.session.msg="사과";
			
			//admin 페이지로 방향전환
			//클라이언트에게 지정한 url로 재접속을 명령!!
			response.redirect("/admin");
		}else{
			response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
			response.end("<script>alert('로그인 실패');history.back();</script>");
		}
	});
	
});

//어드민 메인 페이지 요청처리
app.use("/admin", function(request ,response){
	fs.readFile("lib/logincheck.ejs", "utf-8", function(error, data){
		fs.readFile("admin/index.ejs","utf-8",function(error2, data2){
			response.writeHead(200,{"Content-Type":"text/html;charset=utf-8"});
			response.end(ejs.render(data+data2, {
				id:request.session.user,
				msg:request.session.msg
			}));
		});
	});


});

//로그아웃 요청 처리 
app.use("/logout", function(request, response){
	request.session.destroy(function(){
		response.writeHead(200, {"Content-Type":"text/html;charset=utf-8"});
		response.end("<script>alert('로그아웃되었습니다');location.href='/admin/login.html';</script>");
	});	
});

//파일업로드 요청 처리 
app.use("/upload", function(request, response){
	
	//기존의 request 객체를 이용하여 업로드 분석!!
	form.parse(request, function(error, fields, files){
		console.log(fields);
	});	

});

server.listen(8888, function(){
	console.log("웹서버 8888포트에서 가동중...");
});//서버가동