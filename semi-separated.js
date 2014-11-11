var margin = {
		'top': 0,
		'right': 50,
		'bottom': 20,
		'left': 20
	},
	w = 1000 - margin.left - margin.right,
	x = d3.time.scale().range([0, w]),
	xAxis = d3.svg.axis().scale(x)
			  .orient('bottom')
			  .ticks(5),
	stockdata = [],
	parseDate = d3.time.format("%Y-%m-%d").parse;

var createHistoryUrl = function(symbol, startDate, endDate){
	return "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20'"
			+ symbol 
			+ "'and%20startDate%20%3D%20'"
			+ startDate
			+ "'%20and%20endDate%20%3D%20'"
			+ endDate
			+ "'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
};

var historyUrl = createHistoryUrl('goog', '2013-01-10', '2014-11-08');

var drawStream = function(){
	var hStream = 500 - margin.top - margin.bottom,
		yStream = d3.scale.linear().range([hStream, 0]),
		yStreamAxis = d3.svg.axis().scale(yStream)
						.orient('right')
						.ticks(10),
		svgStream = d3.select('body')
						.append('svg')
							.attr('width', w + margin.right + margin.left)
							.attr('height', hStream + margin.top + margin.bottom)
						.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top +')'),
		lineFunction = d3.svg.line()
						 .x(function(d){return x(d.Date);})
						 .y(function(d){return yStream(d.Close);})
						 .interpolate('linear');
	d3.json(historyUrl, function(error, data){
		data.query.results.quote.forEach(function(d){
			d.Date = parseDate(d.Date);
			d.Volume = d.Volume / 1000;
		});
		stockdata = data;
		var minX = d3.min(data.query.results.quote, function(d){return d.Date}),
			maxX = d3.max(data.query.results.quote, function(d){return d.Date}),
			minYStream = d3.min(data.query.results.quote, function(d){return d.Close}),
			maxYStream = d3.max(data.query.results.quote, function(d){return d.Close}),
			diffYStream = maxYStream - minYStream,
			realminYStream = minYStream - diffYStream * 0.1,
			realmaxYStream = parseInt(maxYStream) + diffYStream * 0.1;

		x.domain([minX, maxX]);
		yStream.domain([realminYStream, realmaxYStream]);
		var lineGraph = svgStream.append('path')
							.attr('d', lineFunction(data.query.results.quote))
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
	});

};

var drawVolume = function(){
	var hVolume = 120 - margin.top - margin.bottom,
		yVolume = d3.scale.linear().range([hVolume, 0]),
		yVolumeAxis = d3.svg.axis().scale(yVolume)
						.orient('right')
						.ticks(3),
		svgVolume = d3.select('body')
						.append('svg')
							.attr('width', w + margin.right + margin.left)
							.attr('height', hVolume + margin.top + margin.bottom)
						.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
};

var drawK = function(){
	var hK = 500 - margin.top - margin.bottom,
		yK = d3.scale.linear().range([hK, 0]),
		yKAxis = d3.svg.axis().scale(yK)
					.orient('right')
					.ticks(10),
		svgK = d3.select('body')
					.append('svg')
						.attr('width', w + margin.right + margin.left)
						.attr('height', hK + margin.top + margin.bottom)
					.append('g')
						.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
};



//Streaming chart
d3.json(historyUrl, function(error, data){
	data.query.results.quote.forEach(function(d){
		d.Date = parseDate(d.Date);
		d.Volume = d.Volume / 1000;
	});
	stockdata = data;
	var minX = d3.min(data.query.results.quote, function(d){return d.Date}),
		maxX = d3.max(data.query.results.quote, function(d){return d.Date}),
		minYStream = d3.min(data.query.results.quote, function(d){return d.Close}),
		maxYStream = d3.max(data.query.results.quote, function(d){return d.Close}),
		minYVolume = d3.min(data.query.results.quote, function(d){return d.Volume}),
		maxYVolume = d3.max(data.query.results.quote, function(d){return d.Volume}),
		diffYStream = maxYStream - minYStream,
		diffYVolume = maxYVolume - minYVolume,
		realminYStream = minYStream - diffYStream * 0.1,
		realmaxYStream = parseInt(maxYStream) + diffYStream * 0.1,
		realmaxYVolume = parseInt(maxYVolume) + diffYVolume * 0.1;

	x.domain([minX, maxX]);
	yStream.domain([realminYStream, realmaxYStream]);
	yVolume.domain([0, realmaxYVolume]);
	var lineGraph = svgStream.append('path')
						.attr('d', lineFunction(data.query.results.quote))
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
						.data(data.query.results.quote)
						.enter()
						.append('rect')
						.attr('x', function(d){return x(d.Date);})
						.attr('y', function(d){return hVolume - yVolume(d.Volume) ;})
						.attr('height', function(d){console.log(d.Volume, yVolume(d.Volume));return yVolume(d.Volume);})
						.attr('width', 5)
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
});

var createBoxplot = function(open, close, highest, lowest){

};


