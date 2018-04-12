(function (PV) {
	"use strict";

	function symbolVis() { };
	PV.deriveVisualizationFromBase(symbolVis);

	var definition = { 
		typeName: "TotalTime",
		visObjectType: symbolVis,
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
		getDefaultConfig: function(){ 
			return { 
				DataShape : 'Timeseries',
				Height: 370,
				Width: 350,
				background: "rgba(0,0,0,0)",
				color : "white",
				threshold : 100,
				chartConfig : {
							  "type" : "pie",
					  		  "dataProvider": [ {
							    "title": "Below",
							    "time": 12,
							    "color": "lightblue",
							    "balloon": "Time Below",
							    "unit" : "min",
							    "percent": 50
							  }, {
							    "title": "Above",
							    "time": 12,
							    "color": "steelblue",
							    "balloon": "Time Above",
							    "unit" : "min",
							    "percent": 50
							  } ],
							  "valueField": "percent",
							  "titleField": "title",
							  "colorField": "color",
							  "labelRadius": -50,
							  "labelText": "[[title]]:[[time]][[unit]]",
							  "balloonText": "[[balloon]]: [[time]][[unit]] ([[percent]]%)",
							  "startDuration": 1,
							  "labelsEnabled": true,
							  "autoMargins": false,
							  "marginTop": 10,
							  "marginBottom": 10,
							  "marginLeft": 0,
							  "marginRight": 0,
							  "pullOutRadius": 0
							}
			} 
		},
		configOptions : function(){
			return [
				{
					title : "Format Symbol",
					mode : "Format"
				}
			]
		}
	}

	symbolVis.prototype.init = function(scope, elem) { 
		var chartdiv = elem.find('#chartdiv')[0];
		chartdiv.id = "pieChart_" + scope.symbol.Name;

		this.onDataUpdate = dataUpdate;

		function dataUpdate(data){
			//Only peform work if there is data
			if (data) {
				//Moving the Data into the scope and only update label if it is sparatic
				scope.data = data.Data[0];
				if (scope.data.Label) {
					scope.Label = scope.data.Label;
				}

				//Checking if there is data in the Values Array
				var valuesArray = scope.data.Values;
				if (valuesArray.length == 0) {
					scope.NoData = true;

				}else{
					//There is data, so we create variable to house the time value is below and above threshold
					scope.NoData = false;
					var timeBelow = 0;
					var timeAbove = 0;

					//Accounting for the time between first Values entry and the start time
					if (valuesArray[0].Value > scope.config.threshold) {
						timeAbove += (new Date(valuesArray[0].Time) - new Date(scope.data.StartTime));
					}else{
						timeBelow += (new Date(valuesArray[0].Time) - new Date(scope.data.StartTime));
					}

					//Accounting for the time between last Values entry and the end time
					if (valuesArray[valuesArray.length - 1].Value > scope.config.threshold) {
						timeAbove += (new Date(scope.data.EndTime) - new Date(valuesArray[valuesArray.length - 1].Time));
					}else{
						timeBelow += (new Date(scope.data.EndTime) - new Date(valuesArray[valuesArray.length - 1].Time));
					}

					//Adding up the time for all the entries in the Values Array
					for (var i = 0; i < (valuesArray.length - 1); i++) {
						if (valuesArray[i].Value > scope.config.threshold) {
							timeAbove += (new Date(valuesArray[i+1].Time) - new Date(valuesArray[i].Time));
						}else{
							timeBelow += (new Date(valuesArray[i+1].Time) - new Date(valuesArray[i].Time));
						}
					}

					//Converting the miliseconds we got into more readable units
					var timeAboveMin = (timeAbove/1000/60);
					var timeBelowMin = (timeBelow/1000/60);
					
					var timeAboveHour = (timeAboveMin/60);
					var timeBelowHour = (timeBelowMin/60);

					var timeAboveDay = (timeAboveHour/24);
					var timeBelowDay = (timeBelowHour/24);

					//Determining what display units we are going to show the results
					//For Time Above
					var timeAboveDisplay = Math.round(timeAboveMin*100)/100;
					var timeAboveDisplayUnit = " min";
					if (timeAboveMin >= 60) {
						timeAboveDisplay = Math.round(timeAboveHour*100)/100;
						timeAboveDisplayUnit = " hr";
						if (timeAboveHour >= 24) {
							timeAboveDisplay = Math.round(timeAboveDay*100)/100;
							timeAboveDisplayUnit = " day";
						}
					}
					//For Time Below
					var timeBelowDisplay = Math.round(timeBelowMin*100)/100;
					var timeBelowDisplayUnit = " min";
					if (timeBelowMin >= 60) {
						timeBelowDisplay = Math.round(timeBelowHour*100)/100;
						timeBelowDisplayUnit = " hr";
						if (timeBelowHour >= 24) {
							timeBelowDisplay = Math.round(timeBelowDay*100)/100;
							timeBelowDisplayUnit = " day";
						}
					}
					//Getting the percentage so that we can use in the balloon of the pie chart
					var timeAbovePercent = Math.round((timeAbove/(timeAbove+timeBelow)*100)*100)/100;
					var timeBelowPercent = Math.round((timeBelow/(timeAbove+timeBelow)*100)*100)/100;

					//Updating the Pie Chart config for AMChart
					scope.config.chartConfig.dataProvider[0].time = timeBelowDisplay;
					scope.config.chartConfig.dataProvider[1].time = timeAboveDisplay;
					scope.config.chartConfig.dataProvider[0].percent = timeBelowPercent;
					scope.config.chartConfig.dataProvider[1].percent = timeAbovePercent;
					scope.config.chartConfig.dataProvider[0].unit = timeBelowDisplayUnit;
					scope.config.chartConfig.dataProvider[1].unit = timeAboveDisplayUnit;
					
					//Drawing Chart
					AmCharts.makeChart(chartdiv.id, scope.config.chartConfig);	
				}
			}
		}
	};

	PV.symbolCatalog.register(definition); 
})(window.PIVisualization); 
