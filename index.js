var express = require("express");
var bodyParser =  require("body-parser");
var expressSession =  require("express-session");
var sqlite3 =  require("sqlite3").verbose();
var db = new sqlite3.Database('./bd/usuarios.bd');



//configuracion de session
var sess = {
    secret: 'keyboard cat',
    cookie: {}
}

//return api
var structReturn = {
    type:"error",
    code:""
}

//return session api
var retornoSession = {
    id:0,
    nameuser:0,
    session:false
}

//generamos una aplicacion de express
var app =  express();

//agregamos expres Session a la app
app.use(expressSession(sess));

//agregamos body parser
app.use(express.urlencoded({extended:false}));
app.use(express.json());


//carga de pagina principal
app.get('/',function(req,res){

    res.sendFile('/app/index.html' , { root : __dirname});

});

/*
    ## CODE RETURN DESCRIPTION ##

    0x01 registro existoso
    0x02 datos del cliente no se resivieron
    0x03 el usuario intentando a registrar existe
    0x04 erro desconosido
*/

//control de registro de usuarios
app.get('/registrar',function(req,res){
        
    var nameUser = req.query.nameuser;
    var email =  req.query.email;
    var pass =  req.query.pass;

    if(nameUser && email && pass){
        //datos resividos del cliente
        db.all(`SELECT * FROM Usuarios WHERE nameuser = '${nameUser}' OR email =  '${email}'`,function(e,data){

            if(data.length >0){
                
                //registro  0x03 usuario existe
                structReturn.type = "registro";
                structReturn.code = "0x03";
                res.end(JSON.stringify(structReturn));

            }else{

                db.run(`INSERT INTO Usuarios (nameuser,email,password) VALUES('${nameUser}','${email}','${pass}')`,function(data){
                    if(data == null){
                      
                        //registro  0x01 usuario registrado
                        structReturn.type = "registro";
                        structReturn.code = "0x01";
                        res.end(JSON.stringify(structReturn));

                    }else{
                        //registro  0x04 Error desconosido
                        structReturn.type = "registro";
                        structReturn.code = "0x04";
                        res.end(JSON.stringify(structReturn));
                    }
                });
               
            }
        });
        
    }else{
        //registro  0x02 datos no existen
        structReturn.type = "registro";
        structReturn.code = "0x02";
        res.end(JSON.stringify(structReturn));
    }
});

/*
    # CODE TYPE SESSION DESCRIPTION #

    0X01 =  session iniciada
    0x02 =  usuario no existe
    0x03 =  session cerrada
    0x04 =  Datoe no resividos
*/
//cheackSession
app.get('/check',function(req,res){
      
    var sess   = req.session.user;
    if(sess){
        structReturn.type = "session";
        structReturn.code =  "0X01";
        res.end(JSON.stringify(structReturn));
    }else{
        structReturn.type = "session";
        structReturn.code =  "0X03";
        res.end(JSON.stringify(structReturn));
    }
});
//login User
app.post('/login',function(req,res){
  
    var userExten =  req.body.user;
    var passExtern =  req.body.pass;

    if(userExten  && passExtern ){
        
        //comparamos la base de datos  para ver si exite el usuario
        db.all(`SELECT * FROM Usuarios WHERE email = '${userExten}' AND password = '${passExtern}'`,function(e,data){

            if(data.length == 1){
                
                data = data[0];

                retornoSession.id = data.id;
                retornoSession.nameuser = data.nameuser;
                retornoSession.session =  true;
                req.session.user = retornoSession;
    
                structReturn.type = "session";
                structReturn.code = "0X01";
                
                res.end(JSON.stringify(structReturn));

            }else{

                structReturn.type = "session";
                structReturn.code =  "0X02"
                res.end(JSON.stringify(structReturn));
            }
        
        });

    }else{

        structReturn.type = "session";
        structReturn.code =  "0X04"
        res.end(JSON.stringify(structReturn));

    }

});

//destruir session
app.get('/close',function(req,res){

    
    var sess   = req.session.user;
    if(sess){

        req.session.destroy(function(){
            if(sess){                
                //0x02 session cerrada
                structReturn.type = "session";
                structReturn.code =  "0X03";
                res.end(JSON.stringify(structReturn));       
            }
        });
    
    }else{
        //0x02 session cerrada
        structReturn.type = "session";
        structReturn.code =  "0X03";
        res.end(JSON.stringify(structReturn));
    }

});


app.listen(80,function(){
    console.log("Servidor Online");
});