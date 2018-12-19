	// This file is required by the index.html file and will
	// be executed in the renderer process for that window.

	var fs = require('file-system');
	var conversion = require("phantom-html-to-pdf")();
	var dialog = require("open-file-dialog");
	var ipcRenderer = require('electron').ipcRenderer;
	var LocalStorage = require('node-localstorage').LocalStorage;
	const { remote } = require('electron');
	var Highcharts = require('highcharts');
	var $ = require("jquery");
	localStorage = new LocalStorage('./bd');
	//localStorage.clear();
	const os = require('os')
	 chart = null;
	var lastMeasureTimes = [];

	table="";
	var data={
		YM:["YM",10,5],
		ES:["ES",2,12.5],
		CL:["CL",10,10],
		"6B":["6B-GBP",6.25,10],
		"6A":["6A-AUD",10,10],
		"6C":["6C-CAD",5,60],
		NQ:["NQ",5,3]
	};
	const path = require('path');
	template="";
	items=[];

	PDFParser = require("pdf2json");
	const {
		BrowserWindow
	} = require('electron').remote
	const PDFWindow = require('electron-pdf-window')

	function createPDF() {
		template="";
		
		items.forEach( function(valor, indice, array) {
			template = template+"<h1>" + valor.title + "</h1>";
			template=template +"<h2>"+valor.content+"</h2>";
			template=template + "<img style ='width:842px' src='"+valor.image+"'/><br/><br/><br/>";
		});
		var spans = document.querySelectorAll("#tablePDF span");
		var control=null;
		var resume=[];
		var column=null;
		var color="";
		table='<table style="font-size: 30px; width: 100%;margin: 0 auto;padding-left: 10px;"><tr>';
		for (i = 0; i < spans.length; i++) {
			for(v=0;v<spans[i].childNodes.length;v++){
			if(spans[i].childNodes[v].tagName =="SELECT"  ){
				control = spans[i].childNodes[v];
				table=table+'<th style=" border: 1px solid black;padding-left: 10px;">'+control.name+'</th>';
				}else if(spans[i].childNodes[v].tagName =="INPUT"){
					control = spans[i].childNodes[v];
					table=table+'<th style=" border: 1px solid black;padding-left: 10px;">'+control.name+'</th>';
				}
			}
		}
		table=table+'</tr><tr style=" border: 1px solid black;padding-left: 10px;">';
		for (i = 0; i < spans.length; i++) {
			for(v=0;v<spans[i].childNodes.length;v++){
				control = spans[i].childNodes[v];			
				if(control.name !=undefined){
					column  = {
						[control.name]: control.value,
					  }
					  resume.push(column);
					var color=control.value =="Positivo" ? "background:green;" :control.value =="Negativo"?"background:red;":"background:white;";
					table=table+'<td style=" '+color+' border: 1px solid black;padding-left: 10px;">'+control.value+'</td>';
				}
			}
		}
		table=table+'</tr></table>';
		template= template+ table;
		var time =  new Date().getTime();
		var itemsobj  = {
			"items": items,
		  }
		resume.push(itemsobj);
		saveData(time,resume)
		conversion({
			html: template
		},  (err, pdf)=> {
			var output = fs.createWriteStream('./pdf_'+time+'.pdf')
			pdf.stream.pipe(output);
		});
	
	}
function saveData(t,d){
	localStorage.setItem('pdf_'+t, JSON.stringify(d));
	var i = localStorage.getItem('pdf_'+t);
	console.log('pdf_'+t)
	console.log(i);
}
function allStorage() {

	var archive = [],
	keys = Object.keys(localStorage),
	i = 0, key;

for (; key = keys[i]; i++) {
	archive.push( key + '=' + localStorage.getItem(key));
}

return archive;
}
function showResume(){
	//alert("resume")
	//remote.getCurrentWindow().loadURL('newRow.html')
	//ipcRenderer.send('request-resume', "resume");

	$( "#form" ).addClass( "oculto" );
	$( "#rowList" ).addClass( "oculto" );
	$( "#separador1" ).addClass( "oculto" );
	$("#chartContainer").removeClass('oculto');

	
   
	var items = Object.keys(localStorage).map(k => localStorage.getItem(k))
	
	var i =0;
	var n =0;
	var p =0;
	var porN, porP;
	console.log(items);
items.forEach((element)=> {
if(i!=0){}
	var el = JSON.parse(element)
	
	if(el[6]["Resultado"]=="Positivo")
		p++;
	else n++;

	i++
});
	var t = p+n
	porN= parseInt(((n/t)*100).toFixed(2));
	porP= parseInt(((p/t)*100).toFixed(2));
	console.log(p,n,t,porN,porP)
	

	Highcharts.chart('chartContainer', {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: 'Browser market shares in January, 2018'
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false
				},
				showInLegend: true
			}
		},
		series: [{
			name: 'Brands',
			data: [{
				color: '#13a920',
				name: 'Aciertos',
				y: porP,
				sliced: true,
				selected: true
			}, {
				color: '#d01e14',
				name: 'Fallos',
				y: porN
			}]
		}]
	});
		
	
}
ipcRenderer.on('request-resume-action', (event, arg) => {
	// Update the second interface or whatever you need to do
	// for example show an alert ...
	console.log(arg);
	
	
});
function openWIndows(){

}


	function openPDF() {
		dialog({
			multiple: true,
			accept: 'pdf/*'
		}, (pdf) => {
			var filePath = pdf[0].path
			fileName = filePath.substring(filePath.indexOf("pdf_"), filePath.length);
			const win = new BrowserWindow({
				width: 800,
				height: 600
			})
			PDFWindow.addSupport(win)

			win.loadURL(__dirname+"/"+ fileName);
		})
	}

	function addRow() {

		
		let win = new BrowserWindow({
			width: 400, 
			height: 400,
			backgroundColor: '#2e2c29',
			frame: true,
			show:false,
			minimizable: false,
			maximizable: false});
			win.setResizable(false);
			//win.openDevTools();
			win.setMenu(null);
			
			win.loadURL(`file://${__dirname}/newRow.html`)
		win.webContents.once('dom-ready', () => {
			//alert("load")
			win.show()			
		});
		
		ipcRenderer.on('action-add-row', (event, arg) => {
			// Update the second interface or whatever you need to do
			// for example show an alert ...
		/*	*/
			var tit = arg.title;
			var cont = arg.content;
			var contCuted= cont.length>50?cont.substring(0,50)+" ...": cont;
			var img = arg.imgSrc
			var newRow="";
			//.log(arg)
			items.push({title:tit,content:cont,image:img})
			elChild = document.createElement('li');
			newRow='<span class="img_list"><img src="'+img+'"/> </span>';
			newRow=newRow+'<span class="tit_list">'+tit+'</span>';
			newRow=newRow+'<span class="cont_list">'+contCuted+'</span>';
			elChild.innerHTML = newRow;
			// Jug it into the parent element
			document.getElementById("rowList").appendChild(elChild);
			// arg contains the data sent from the first view
		
		});
		/*var 
	console.log(items)*/
	}

	document.addEventListener('DOMContentLoaded', function(){
	//cargamos los comboBoxes
	var d = new Date();
	var select = document.getElementById('ddl_index');
	for (var key in data) {
		var	opt= document.createElement('option');
		var obj = data[key];
		//console.log(key,obj);
			opt.value = obj[0];
			opt.innerHTML =  obj[0];
			select.appendChild(opt);
	}
	var spans = document.querySelectorAll("#tablePDF span");

	document.getElementById('txt_pt').value=data["YM"][2]+"P";
	document.getElementById('txt_tic').value=data["YM"][1]+" Euro";

	document.getElementById('sp_date').innerText = formatDate(d, "dddd h:mmtt d MMM yyyy");


	}, false);
	function showAbout() {

		
		let win = new BrowserWindow({
			width: 400, 
			height: 400,
			backgroundColor: '#2e2c29',
			frame: true,
			show:false,
			minimizable: false,
			maximizable: false});
			win.setResizable(false);
			win.openDevTools();
			win.setMenu(null);
			
			win.loadURL(`file://${__dirname}/about/index.html`)
		win.webContents.once('dom-ready', () => {
			//alert("load")
			win.show()			
		});
	}
	document.querySelector('#btn_plus').addEventListener('click', addRow)
	document.querySelector('#btn_create').addEventListener('click', createPDF)
	document.querySelector('#btn_open').addEventListener('click', openPDF)
	document.querySelector('#btn_resume').addEventListener('click', showResume)
	document.querySelector('#btn_about').addEventListener('click', showAbout)

	function formatDate(date, format, utc) {
		var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

		function ii(i, len) {
			var s = i + "";
			len = len || 2;
			while (s.length < len) s = "0" + s;
			return s;
		}

		var y = utc ? date.getUTCFullYear() : date.getFullYear();
		format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
		format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
		format = format.replace(/(^|[^\\])y/g, "$1" + y);

		var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
		format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
		format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
		format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
		format = format.replace(/(^|[^\\])M/g, "$1" + M);

		var d = utc ? date.getUTCDate() : date.getDate();
		format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
		format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
		format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
		format = format.replace(/(^|[^\\])d/g, "$1" + d);

		var H = utc ? date.getUTCHours() : date.getHours();
		format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
		format = format.replace(/(^|[^\\])H/g, "$1" + H);

		var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
		format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
		format = format.replace(/(^|[^\\])h/g, "$1" + h);

		var m = utc ? date.getUTCMinutes() : date.getMinutes();
		format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
		format = format.replace(/(^|[^\\])m/g, "$1" + m);

		var s = utc ? date.getUTCSeconds() : date.getSeconds();
		format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
		format = format.replace(/(^|[^\\])s/g, "$1" + s);

		var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
		format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
		f = Math.round(f / 10);
		format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
		f = Math.round(f / 10);
		format = format.replace(/(^|[^\\])f/g, "$1" + f);

		var T = H < 12 ? "AM" : "PM";
		format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
		format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

		var t = T.toLowerCase();
		format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
		format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

		var tz = -date.getTimezoneOffset();
		var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
		if (!utc) {
			tz = Math.abs(tz);
			var tzHrs = Math.floor(tz / 60);
			var tzMin = tz % 60;
			K += ii(tzHrs) + ":" + ii(tzMin);
		}
		format = format.replace(/(^|[^\\])K/g, "$1" + K);

		var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
		format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
		format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

		format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
		format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

		format = format.replace(/\\(.)/g, "$1");

		return format;
	};


	function setLastMeasureTimes(cpus) {
	  for (let i = 0; i < cpus.length; i++) {
		lastMeasureTimes[i] = getCpuTimes(cpus[i]);
	  }
	}
	
	function getDatasets() {
	  const datasets = []
	  const cpus = os.cpus()
	
	  for (let i = 0; i < cpus.length; i++) {
		const cpu = cpus[i]
		const cpuData = {
		  data: getCpuTimes(cpu),
		  backgroundColor: [
			'rgba(255, 99, 132, 1)',
			'rgba(54, 162, 235, 1)',
			'rgba(255, 206, 86, 1)'
		  ]
		}
		datasets.push(cpuData)
	  }
	  testCpus = os.cpus();
	  return datasets;
	}
	
	function updateDatasets() {
	  const cpus = os.cpus()
	  for (let i = 0; i < cpus.length; i++) {
		const cpu = cpus[i]
		chart.data.datasets[i].data = getCpuTimes(cpu);
		chart.data.datasets[i].data[0] -= lastMeasureTimes[i][0];
		chart.data.datasets[i].data[1] -= lastMeasureTimes[i][1];
		chart.data.datasets[i].data[2] -= lastMeasureTimes[i][2];
	  }
	  chart.update();
	  setLastMeasureTimes(cpus);
	}
	

	
	