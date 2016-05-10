var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var coord_array = [];
var coord_array_max_size = 20;
var coord_array_average = [0, 0];

var smoothing_mode = 0; // Smoothing mode 0 = average, 1 = weighted average.

/** ROUTING **/
app.route('/master').get(function(req, res){
	res.sendFile(__dirname + '/master.html');
});

app.route('/client').get(function(req, res){
	res.sendFile(__dirname + '/client.html');
});



/** CONNECTION **/
io.on('connection', function(socket){
	console.log('A user has been connected');
	socket.on('disconnect', function(){
		console.log('A user has been disconnected');
	});

	socket.on('Coordinates-Master', function(master_info){
		if(coord_array.length == coord_array_max_size){
			coord_array_average[0] = coord_array_average[0] - (coord_array[0][0] / coord_array_max_size);
			coord_array_average[1] = coord_array_average[1] - (coord_array[0][1] / coord_array_max_size);
			coord_array.splice(0,1);
			coord_array.push(master_info.coords);
			coord_array_average[0] = coord_array_average[0] + (master_info.coords[0] / coord_array_max_size);
			coord_array_average[1] = coord_array_average[1] + (master_info.coords[1] / coord_array_max_size);
		}
		else{
			coord_array.push(master_info.coords);
			coord_array_average[0] = coord_array_average[0] + (master_info.coords[0] / coord_array_max_size);
			coord_array_average[1] = coord_array_average[1] + (master_info.coords[1] / coord_array_max_size);
		}
		io.emit('Coordinates-Server', coord_array_average, master_info);
	});
});




http.listen(3000, function(){
	console.log('Listening on port: 3000');
});