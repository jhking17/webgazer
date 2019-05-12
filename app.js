const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
var app = express();
const http = require('http').Server(app);
const https = require('https');
app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public/index2_files')));

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());
  
app.get('/',function(req,res){
    res.render("index2.html");
})

const privateKey  = fs.readFileSync('private.pem', 'utf8');
const certificate = fs.readFileSync('public.pem', 'utf8');

const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app).listen(443);


http.listen(3000, () => console.log('Listening on *3000'));