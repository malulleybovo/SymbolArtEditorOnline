var express = require('express');
var app = express();
const PORT = 8080;

app.set('appPath', '');
app.use(express.static(__dirname));

var server = app.listen(PORT, function () {
  var host = server.address().address
  var port = server.address().port
});
