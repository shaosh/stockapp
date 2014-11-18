var margin = {
		'top': 0,
		'right': 50,
		'bottom': 20,
		'left': 50
	},
	w = 1000 - margin.left - margin.right,
	// h = 800 - margin.top - margin.bottom - margin.bottom,	
	// hStream = 450,
	// hVolume = h - hStream,
	hStream = 500 - margin.top - margin.bottom,
	hVolume = 120 - margin.top - margin.bottom,
	hK = 500 - margin.top - margin.bottom,
	// x = d3.time.scale().range([0, w]),
	x = d3.scale.linear().range([0, w]),
	yStream = d3.scale.linear().range([hStream, 0]),
	yVolume = d3.scale.linear().range([hVolume, 0]),
	yK = d3.scale.linear().range([hK, 0]),
	xAxis = d3.svg.axis().scale(x)
			  .orient('bottom')
			  .ticks(10),
	yStreamAxis = d3.svg.axis().scale(yStream)
			  .orient('right')
			  .ticks(10),
	yVolumeAxis = d3.svg.axis().scale(yVolume)
				.orient('right')
				.ticks(3),
	yKAxis = d3.svg.axis().scale(yK)
			  .orient('right')
			  .ticks(10),
	stockdata = [];
var svgStream = d3.select('body')
				.append('svg')
					.attr('width', w + margin.right + margin.left)
					.attr('height', hStream + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top +')'),
	svgVolume = d3.select('body')
				.append('svg')
					.attr('width', w + margin.right + margin.left)
					.attr('height', hVolume + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),
	svgK = d3.select('body')
				.append('svg')
					.attr('width', w + margin.right + margin.left)
					.attr('height', hK + margin.top + margin.bottom)
				.append('g')
					.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var parseDate = d3.time.format("%Y-%m-%d").parse;

var lineFunction = d3.svg.line()
					 .x(function(d, i){return x(i);})
					 .y(function(d){return yStream(d.Close);})
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

var historyUrl = createHistoryUrl('goog', '2014-01-04', '2014-11-06');

//Streaming chart
d3.json(historyUrl, function(error, data){
	stockdata = data.query.results.quote;
	stockdata = stockdata.reverse();//This is because Yahoo return data from late to early
	stockdata.forEach(function(d){
		d.Volume = d.Volume / 1000;
	});
	var	minYStream = d3.min(stockdata, function(d){return d.Close}),
		maxYStream = d3.max(stockdata, function(d){return d.Close}),
		minYVolume = d3.min(stockdata, function(d){return d.Volume}),
		maxYVolume = d3.max(stockdata, function(d){return d.Volume}),
		minYK = d3.min(stockdata, function(d){return d.Low}),
		maxYK = d3.max(stockdata, function(d){return d.High}),
		diffYStream = maxYStream - minYStream,
		diffYVolume = maxYVolume - minYVolume,
		diffYK = maxYK - minYK,
		realminYStream = minYStream - diffYStream * 0.1,
		realmaxYStream = parseInt(maxYStream) + diffYStream * 0.1,
		realmaxYVolume = parseInt(maxYVolume) + diffYVolume * 0.1,
		realminYK = minYK - diffYK * 0.1,
		realmaxYK = parseInt(maxYK) + diffYK * 0.1;
	// x.domain([minX, maxX]);
	x.domain([0, stockdata.length - 1]);
	xAxis.tickFormat(function(d){return stockdata[d].Date;});

	yStream.domain([realminYStream, realmaxYStream]);
	yVolume.domain([0, realmaxYVolume]);
	yK.domain([realminYK, realmaxYK]);
	var lineGraph = svgStream.append('path')
						.attr('d', lineFunction(stockdata))
					   	.attr('stroke', '#52B7FF')
					   	.attr('stroke-width', 2)
					   	.attr('fill', 'none');
	svgStream.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(0," + hStream + ")")
	   	.call(xAxis);
	svgStream.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(" + w + ", 0)")
	   	.call(yStreamAxis);
 
	var rectGraph = svgVolume.selectAll('rect')
						.data(stockdata)
						.enter()
						.append('rect')
						.attr('x', function(d, i){return x(i);})
						.attr('y', function(d){return yVolume(d.Volume) ;})
						.attr('height', function(d){return hVolume - yVolume(d.Volume);})
						.attr('width', 10)
						.attr('fill', 'black')
						.attr('stroke-width', 2)
						.attr('stroke', 'red');

	svgVolume.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(0," + hVolume+ ")")
	   	.call(xAxis);

	svgVolume.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(" + w + ", 0)")
	   	.call(yVolumeAxis);

	var kGraph = svgK.selectAll('rect')
					.data(stockdata)
					.enter()
					.append('rect')
					.attr('x', function(d, i){return x(i);})
					.attr('y', function(d){return  yK(Math.max(d.Open, d.Close));})
					.attr('height', function(d){return Math.abs(yK(d.Open) - yK(d.Close));})
					.attr('width', 5)
					.attr('fill', 'black')
					.attr('stroke', 'red');

	svgK.selectAll('.uppershadow')
		.data(stockdata)
		.enter()
		.append('line')
		.attr('x1', function(d, i){return x(i) + 2.5;})
		.attr('y1', function(d){return yK(d.High);})
		.attr('x2', function(d, i){return x(i) + 2.5;})
		.attr('y2', function(d){return yK(Math.max(d.Open, d.Close));})
		.attr('stroke', 'green');

	svgK.selectAll('.lowershadow')
		.data(stockdata)
		.enter()
		.append('line')
		.attr('x1', function(d, i){return x(i) + 2.5;})
		.attr('y1', function(d){return yK(d.Low);})
		.attr('x2', function(d, i){return x(i) + 2.5;})
		.attr('y2', function(d){return yK(Math.min(d.Open, d.Close));})
		.attr('stroke', 'blue');

	svgK.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(0," + hK + ")")
	   	.call(xAxis);

	svgK.append('g')
	   	.attr("class", "axis")
	   	.attr("transform", "translate(" + w + ", 0)")
	   	.call(yKAxis);
});

var createBoxplot = function(open, close, highest, lowest){

};


