var margin = {
		'top': 20,
		'right': 50,
		'bottom': 50,
		'left': 20
	},
	w = 995 - margin.left - margin.right,
	h = 430 - margin.top - margin.bottom,	
	x = d3.time.scale().range([0, w]),
	y = d3.scale.linear().range([h, 0]),
	xAxis = d3.svg.axis().scale(x)
			  .orient('bottom')
			  .ticks(5),
	yAxis = d3.svg.axis().scale(y)
			  .orient('right')
			  .ticks(10),
	stockdata = [];


var svgStream = d3.select('body')
			.append('svg')
				.attr('width', w + margin.right + margin.left)
				.attr('height', h + margin.top + margin.bottom)
			.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

var parseDate = d3.time.format("%Y-%m-%d").parse;

var lineFunction = d3.svg.line()
					 .x(function(d){return x(d.x);})
					 .y(function(d){return y(d.y);})
					 .interpolate('linear');

var createHistoryUrl = function(symbol, startDate, endDate){
	return "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20'"
			+ symbol 
			+ "'and%20startDate%20%3D%20'"
			+ startDate
			+ "'%20and%20endDate%20%3D%20'"
			+ endDate
			+ "'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";

};

var historyUrl = createHistoryUrl('goog', '2013-08-10', '2014-08-10');

//Streaming chart
d3.json(historyUrl, function(error, data){
	data.query.results.quote.forEach(function(d){
		d.x = parseDate(d.Date);
		d.y = d.Close;
	});
	stockdata = data;
	var minX = d3.min(data.query.results.quote, function(d){return d.x}),
		maxX = d3.max(data.query.results.quote, function(d){return d.x}),
		minY = d3.min(data.query.results.quote, function(d){return d.y}),
		maxY = d3.max(data.query.results.quote, function(d){return d.y}),
		diffY = maxY - minY,
		realminY = minY - diffY * 0.1,
		realmaxY = parseInt(maxY) + diffY * 0.1;
		console.log(maxY, minY, diffY);
		console.log(typeof(minY), typeof(maxY), typeof(diffY), typeof(diffY * 0.1));
	x.domain([minX, maxX]);
	y.domain([realminY, realmaxY]);
	var lineGraph = svgStream.append('path')
						.attr('d', lineFunction(data.query.results.quote))
					   	.attr('stroke', '#52B7FF')
					   	.attr('stroke-width', 2)
					   	.attr('fill', 'none');
	svgStream.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(0," + h + ")")
	   	.call(xAxis);
	svgStream.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(" + w + ", 0)")
	   	.call(yAxis);
});




