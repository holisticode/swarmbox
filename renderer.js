// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
'use strict';
const fs = require('fs');
/** * We create an object from electron module. The shell object allows us to open the selected file */ 
const {shell} = require('electron');
const os = require('os');
const pathlib = require('path');

var exec = require('child_process').exec;

var hashes = {};
var lastoutput = "";
var lastpath = "";


function execute(command, callback) {
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};


function addToHashes() {
  hashes[lastoutput] = {timestamp: new Date(), hash: lastoutput, path: lastpath};
}

function readFolder(path) {
    fs.readdir(path, (err, files) => {
        'use strict';
        if (err) throw  err;

        //Dynamically add <ol> tags to the div
        document.getElementById('listed-files').innerHTML = `<ol id="display-files"></ol>`;

        let last = path.lastIndexOf("/");
        let parent = null;
        if (last > 0) {
          parent = path.substr(0,last);
        } else { //root
          parent = "/";
        }
        document.getElementById('display-files').innerHTML += `<li id=${parent} ondblclick="readFolder(this.id)"><i class="fa fa-folder-open"></i> ..</li><hr>`; 

        for (let file of files) {
            /**
             * the stat method takes as a parameter the file name (which is a qualified path as indicated earlier, so we have to include our path), and a callback to do whatever we want with the statistics
             */
            let fullpath = pathlib.join(path, file);
            fs.stat(fullpath,(err,stats)=>{
                if(err) throw err;
                /**
                 * Check whether the file is a directory or not
                 *
                 *When you double click on a folder or file, we need to obtain the path and name so that we can use it to take action. 
                  The easiest way to obtain the path and name for each file and folder, is to store that information in the element itself, as an ID. 
                  This is possible since we cannot have two files with the same name in a folder. 
                  theID variable below is created by concatenating the path with file name and a / at the end. As indicated earlier, we must have the / at the end of the path.
                 *
                 */
                var theID = fullpath;

                if (stats.isDirectory()) { 
                  document.getElementById('display-files').innerHTML += `<li draggable="true" ondragstart="itemDrag(event)" id=${theID} ondblclick="readFolder(this.id)"><i class="fa fa-folder-open"></i> ${file}</li><hr>`; 
                } else { 
                  document.getElementById('display-files').innerHTML += `<li draggable="true" ondragstart="itemDrag(event)" id=${theID} ondblclick="openFile(this.id)"><i class="fa fa-file"></i> ${file}</li><hr>`; 
                }
            });
        }
    });
}

function itemDrag(event) {
  let path = event.target.id;
  event.dataTransfer.setData("uploadfiles", path);;
}

//open the file with the default application 
function openFile(path) { 
  shell.openItem(path); 
}

function getOsRoot() {
  return (os.platform() == "win32") ? process.cwd().split(path.sep)[0] : "/"
}

function getOsHome() {
  return os.homedir();
}

function showTransfers() {
}


