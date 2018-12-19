const remote = require('electron').remote;
var ipcRenderer = require('electron').ipcRenderer;
var dialog = require("open-file-dialog");
Data={};
document.querySelector('#btn_closeNewRow').addEventListener('click', function(){
    window.close();
})
function addImage() {
	dialog({
		multiple: true,
		accept: 'pdf/*'
	}, (pdf) => {
		var filePath = pdf[0].path
        document.querySelector('#img_element').src=filePath;
        console.log(filePath);
        Data.imgSrc = filePath;      
	})
}
document.getElementById("btn_addNewRow").addEventListener("click", () => {
    // Some data that will be sent to the main process
    
	Data.title= document.getElementById("txt_newTitle").value;
	Data.content= document.getElementById("txt_newCont").value,
	
	// Trigger the event listener action to this event in the renderer process and send the data
    ipcRenderer.send('request-update-label-in-second-window', Data);
    console.log(Data);
    //window.close();
}, false);

document.querySelector('#btn_img').addEventListener('click', addImage)
