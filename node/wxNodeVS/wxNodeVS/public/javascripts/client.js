/**
 * New node file
 */



var gauges = [];

var socket = io();
var toggleVal = 0;
			
var datapath = "";


function initgraph()
{
	d3.tsv("public/data.tsv", function(error, data) {
	  if (error) throw error;

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain(d3.extent(data, function(d) { return d.close; }));

	  svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

	  svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("Price ($)");

	  svg.append("path")
		  .datum(data)
		  .attr("class", "line")
		  .attr("d", line);
	});
}


$(document).ready(function() {

	//initgraph();
	createGauge("temp", "Temperature F");
	
	socket = io.connect();
	socket.on('onconnection', function(value) {
		//alert("connected");
	});
	socket.on('WxUpdate', function(value) {

	////"{Temp:%s, Hum:%s, Dew:%s}"
		//alert(value);
		document.getElementById("head1").textContent = 'Temp = ' + value.Temp;
		document.getElementById("head2").textContent = 'Hum = ' + value.Hum;
		document.getElementById("head3").textContent = 'Dew = ' + value.Dew;
		
		gauges['temp'].redraw(value.Temp);
		
	});
	
	  $('#check').click(function() {
            toggleVal += 1;
	    toggleVal %= 2;
	    
	    if(toggleVal == 1)
		{
			//alert("botton1");
	    	socket.emit('buttonval',"LED1:ON");
		}
	    else
	    	socket.emit('buttonval',"LED1:OFF");
	 });
	 
});	

function createGauge(name, label, min, max)
{
	var config = 
	{
		size: 540,
		label: label,
		min: undefined != min ? min : 0,
		max: undefined != max ? max : 100,
		minorTicks: 5
	}
	
	var range = config.max - config.min;
	config.greenZones = [{ from: 0, to: 75 }];
	config.yellowZones = [{ from: 75, to: 90 }];
	config.redZones = [{ from: 90, to: 100}];
	console.log(config);
	gauges[name] = new Gauge("guageContainer", config);
	gauges[name].render();
}

