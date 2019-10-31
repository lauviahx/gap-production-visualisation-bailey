chartItA();
chartItB();
chartItC();
chartItD();



async function chartItA(filterFrom,filterTo) {
    const response = await fetch('/api');
    const data = await response.json();
    console.log(filterFrom);

    //Chart deafults 
    Chart.defaults.global.defaultFontColor = 'black';
    Chart.defaults.global.legend.display = false;
    Chart.defaults.global.title.display = true;
    Chart.defaults.global.title.fontSize = '17';
    Chart.defaults.global.title.fontFamily = 'Times New Roman, Times, serif';
    Chart.defaults.global.animation.duration = false;
    Chart.defaults.global.responsive = true;
    // Chart.defaults.global.maintainAspectRatio=false;


    // Line A

    let xVals = []; // x axis values
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = [];
    let totalTimePM = [];
    let efficiency = [];

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    console.log(filterFrom);
    
    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'A';
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){
            condition = data[i].line == 'A' && data[i].date >= filterFrom && data[i].date <= filterTo;
        }
        if (condition) { // find and use only data for line A

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            let minutesC = (+c[0]) * 60 + (+c[1]);
            let minutesD = (+d[0]) * 60 + (+d[1]);
            yAvailablePM.push(minutesD - minutesC);

            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }

    //Chart line A
    const ctx = document.getElementById('chartA').getContext('2d'); //connect dom element 
    const myChartA = new Chart(ctx, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line A - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 100
                        max: 100,
                        min: 0
                    },
                },]

            }
        }
    })

}

async function chartItB(filterFrom,filterTo) { // function to create chart for line B, same principles as other
    const response = await fetch('/api');
    const data = await response.json();

    // Line B
    let xVals = []; // x axis values
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = [];
    let totalTimePM = [];
    let efficiency = [];

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'B';
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){
            condition = data[i].line == 'B' && data[i].date >= filterFrom && data[i].date <= filterTo;
        }
        if (condition) { // find and use only data for line A

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            let minutesC = (+c[0]) * 60 + (+c[1]);
            let minutesD = (+d[0]) * 60 + (+d[1]);
            yAvailablePM.push(minutesD - minutesC);

            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }

    //Chart line B
    const cty = document.getElementById('chartB').getContext('2d'); //connect dom element 
    const myChartB = new Chart(cty, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line B - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 100
                        max: 100,
                        min: 0
                    },
                },]

            }
        }
    })

}
async function chartItC(filterFrom,filterTo) { // function to create chart for line C, same principles as other
    const response = await fetch('/api');
    const data = await response.json();

    // Line C
    let xVals = []; // x axis values
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = [];
    let totalTimePM = [];
    let efficiency = [];

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'C';
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){
            condition = data[i].line == 'C' && data[i].date >= filterFrom && data[i].date <= filterTo;
        }
        if (condition) { // find and use only data for line A

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            let minutesC = (+c[0]) * 60 + (+c[1]);
            let minutesD = (+d[0]) * 60 + (+d[1]);
            yAvailablePM.push(minutesD - minutesC);

            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }

    //Chart line C
    const ctw = document.getElementById('chartC').getContext('2d'); //connect dom element 
    const myChartC = new Chart(ctw, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line C - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 100
                        max: 100,
                        min: 0
                    },
                },]

            }
        }
    })

}
async function chartItD(filterFrom,filterTo) { // function to create chart for line D, same principles as other
    const response = await fetch('/api');
    const data = await response.json();

    // Line D
    let xVals = []; // x axis values
    let yAvailableAM = []; // array of full available time for AM
    let breaksAM = []; // array of breaks AM
    let plannedAM = []; // array of planned time deductions AM
    let productionAM = []; // array of unplanned time deductions AM
    let unplannedAM = []; // array of production time deductions AM
    let gapAM = []; // array of gap AM

    let yAvailablePM = []; // array of full available time for PM
    let breaksPM = []; // array of breaks PM
    let plannedPM = []; // array of planned time deductions PM
    let productionPM = []; // array of unplanned time deductions PM
    let unplannedPM = []; // array of production time deductions PM
    let gapPM = []; // array of gap PM

    let totalTimeAM = [];
    let totalTimePM = [];
    let efficiency = [];

    let n = 0; // assign new variable to 0, which will be used within below for loop, needed to 'grab' correct record and store them

    for (let i = 0; i < data.length; i++) { // loop through until reached end of the database
        var condition = data[i].line == 'D';
        if(typeof filterFrom != 'undefined' && typeof filterTo != 'undefined'){
            condition = data[i].line == 'D' && data[i].date >= filterFrom && data[i].date <= filterTo;
        }
        if (condition) { // find and use only data for line A

            // I had issue with gaps in my charts so instead of just assigning data to arrays I needed to use .push(), so records that we are not interested in
            // will be skipped. 

            xVals.push(new Date(data[i].date).toDateString());  // add new items to the end of an array, and returns the new length (dates in string format)

            // AM data

            let timeTempStart = data[i].amStartTime; // get times from data and assign to variable to be able to then convert times into min as below
            let timeTempStop = data[i].amEndTime;
            let a = timeTempStart.split(':'); // convert times into minutes https://stackoverflow.com/questions/32885682/convert-hhmmss-into-minute-using-javascript
            let b = timeTempStop.split(':');
            let minutesA = (+a[0]) * 60 + (+a[1]);
            let minutesB = (+b[0]) * 60 + (+b[1]);
            yAvailableAM.push(minutesB - minutesA); // calculate full available time for the shift and push it to the array

            let ax = yAvailableAM[n]; // assign to the variable for later calculations, using 'n'

            breaksAM.push(data[i].amBreaks); // assign breaks time to array
            plannedAM.push(data[i].amPlanned); // assign planned stops time to array
            productionAM.push(data[i].amProduction); // assign production time to array
            unplannedAM.push(data[i].amUnplanned); // assign unplanned stops time to array

            gapAM.push((ax - breaksAM[n] - plannedAM[n] - productionAM[n] - unplannedAM[n])); // calculate unused time and store

            totalTimeAM.push((ax - gapAM[n] - unplannedAM[n])); // calculate productive time (time spent on production, breaks or planned stops)
            let totalAM = totalTimeAM[n]; // assign to variable for later calculations

            // PM data - same principles as AM

            let timeTempStart2 = data[i].pmStartTime;
            let timeTempStop2 = data[i].pmEndTime;
            let c = timeTempStart2.split(':');
            let d = timeTempStop2.split(':');
            let minutesC = (+c[0]) * 60 + (+c[1]);
            let minutesD = (+d[0]) * 60 + (+d[1]);
            yAvailablePM.push(minutesD - minutesC);

            let av = yAvailablePM[n];

            breaksPM.push(data[i].pmBreaks);
            plannedPM.push(data[i].pmPlanned);
            productionPM.push(data[i].pmProduction);
            unplannedPM.push(data[i].pmUnplanned);

            gapPM.push((av - breaksPM[n] - plannedPM[n] - productionPM[n] - unplannedPM[n]));

            totalTimePM.push((av - gapPM[n] - unplannedPM[n]));
            let totalPM = totalTimePM[n];

            //Calculate overall efficiency
            let f = totalPM + totalAM; // add both productive times together and store in variable
            let g = ax + av; // add both full available times

            efficiency[n] = ((f / g) * 100).toFixed(2); // calculate efficiency % and display 2 decimal places, asign to the array

            n++; // increment
        }
    }

    //Chart line D
    const cts = document.getElementById('chartD').getContext('2d'); //connect dom element 
    const myChartD = new Chart(cts, { //new chart object
        type: 'bar', // bar chart
        data: {
            labels: xVals,  // use xVals (dates) as labels on x axies
            datasets: [
                {
                    label: 'Overall efficiency', // data label
                    data: efficiency, // use data stored in efficiency[]
                    fill: false, // no fill
                    type: 'line', // line chart (using 2 types of charts within the project)
                    yAxisID: 'B', // relate to y axis that is specyfied as 'B' (below in options)
                    borderColor: '#022F99', // border colour
                    backgroundColor: '#469BEB' // background colour
                },
                {
                    label: 'AM Breaks', // data label
                    data: breaksAM, // use data stored in breaksAM[]
                    stack: '0', // assign to first stack (basically I have two production shifts and I wanted to have data grouped on the chart accordingly to it)
                    yAxisID: 'A', // relate to y axis that is specyfied as 'A' (below in options)
                    backgroundColor: '#FFF5BA' // background colour
                },
                {
                    label: 'AM Planned downtime', // same principles as above
                    data: plannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFE291'
                },
                {
                    label: 'AM Production time', // same principles as above
                    data: productionAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FBCC6E'
                },
                {
                    label: 'AM Unplanned downtime', // same principles as above
                    data: unplannedAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FFA7AB'
                },
                {
                    label: 'AM Gap', // same principles as above
                    data: gapAM,
                    stack: '0',
                    yAxisID: 'A',
                    backgroundColor: '#FA725C'
                },
                {
                    label: 'PM Breaks', // same principles as above but different stack number
                    data: breaksPM,
                    stack: '1', // assign to second stack as relates to another shift
                    yAxisID: 'A',
                    backgroundColor: '#D0FFBA'
                },
                {
                    label: 'PM Planned downtime', // same principles as above
                    data: plannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#A6FF99'
                },
                {
                    label: 'PM Production time',// same principles as above
                    data: productionPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#5EEBA7'
                },
                {
                    label: 'PM Unplanned downtime', // same principles as above
                    data: unplannedPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#B08FFF'
                },
                {
                    label: 'PM Gap', // same principles as above
                    data: gapPM,
                    stack: '1',
                    yAxisID: 'A',
                    backgroundColor: '#9149EB'
                },
            ],
        },
        options: { // chart options
            title: {
                text: 'Line D - Gap production time alalysis' // chart title
            },
            tooltips: { // tooltips options
                callbacks: {
                    label: function (tooltipItems, data) {
                        let p = data.datasets[tooltipItems.datasetIndex].label;
                        if (p == 'Overall efficiency') {  // if data is efficiency 
                            return p + ': ' + tooltipItems.yLabel + ' %'; // add : and % after the values
                        } // else
                        return p + ': ' + tooltipItems.yLabel + ' min.'; // add : and 'min.' after the values
                    }
                }

            },
            scales: {
                xAxes: [{ // x asis
                    stacked: true, // option to have stacked bars
                    scaleLabel: {
                        display: true, // display label
                        labelString: 'Date', // name it 'Date'
                        fontStyle: 'italic' // italic font
                    },
                }],
                yAxes: [{ // y axis
                    id: 'A',  // give these option ID to then use for seperate chart sections
                    position: 'left', // position to left - will be used for all minutes related values
                    stacked: true, // stacked bars
                    scaleLabel: {
                        display: true,
                        labelString: 'Production time',
                        fontStyle: 'italic'
                    }
                },
                {
                    id: 'B', // give these option ID to then use for seperate chart sections
                    position: 'right', // position to right - will be used for efficiency related values
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Efficiency %',
                        fontStyle: 'italic'
                    },
                    ticks: { // no matter on used values display y axis as 0 - 100
                        max: 100,
                        min: 0
                    },
                },]

            }
        }
    })

}
