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

var HASH_FILE     = ".swarmbox-hash";
var HASH_HISTORY  = ".swarm-history";

var current_local_path = "";

function execute(command, callback) {
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};



function readFolder(path) {
    fs.readdir(path, (err, files) => {
        'use strict';
        if (err) throw  err;

        current_local_path = path;
        console.log(current_local_path);
        //Dynamically add <ol> tags to the div
        document.getElementById('listed-files').innerHTML = `<ol id="display-files"></ol>`;

        if (path == getOsHome()) {
          let lst = document.getElementsByClassName("shortcut");
          for (let i=0; i<lst.length; i++) {
            lst[i].classList.remove('active');
          } 
          document.getElementById('os-home').classList.add('active');
        } else if (path == getOsRoot()) {
          let lst = document.getElementsByClassName("shortcut");
          for (let i=0; i<lst.length; i++) {
            lst[i].classList.remove('active');
          } 
          document.getElementById('os-root').classList.add('active');
        }
 

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
                var type = "file";

                if (stats.isDirectory()) { 
                  type="dir";
                  document.getElementById('display-files').innerHTML += `<li draggable="true" ondragstart="itemDrag(event)" type=${type} id=${theID} ondblclick="readFolder(this.id)"><i class="fa fa-folder-open"></i>${file}</li><hr>`; 
                } else { 
                  document.getElementById('display-files').innerHTML += `<li draggable="true" ondragstart="itemDrag(event)" type=${type} id=${theID} ondblclick="openFile(this.id)"><i class="fa fa-file"></i>${file}</li><hr>`; 
                }
            });
        }
    });
}

function itemDrag(event) {
  let path = event.target.id;
  event.dataTransfer.setData("uploadfiles", path);
  event.dataTransfer.setData("isDirectory", event.target.type=="dir" );
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

function openItem(id) {

}

function showTransfers() {
}

function persistHash(hash, cb) {
  console.log("persist");
  if (!fs.existsSync(HASH_FILE)) {
    fs.closeSync(fs.openSync(HASH_FILE, 'w'));
  }
  readFirstLine(HASH_FILE, function(err, oldhash) {
    if (err) {
      console.log("Error reading hash file!");
      throw err;
    }

    console.log("readFirst returned, oldhash: " + oldhash);
    if (oldhash == hash) {
      console.log("Old hash is same as new; not persisting.");
      return;
    }
    if (isValidHash(hash)) {
      console.log("valid hash, going to save");
      var current = fs.readFileSync(HASH_FILE);
      var fd = fs.openSync(HASH_FILE, 'w+');
      var buffer = new Buffer(hash + "\n");
      fs.writeSync(fd, buffer, 0, buffer.length, 0);
      fs.writeSync(fd, current, 0, current.length, buffer.length);
      fs.closeSync(fd);
      cb(null);    
    } else {
      console.log("invalid hash, not saving");
    }
  }); 
 
}

function isValidHash(hash) {
  if (hash.length == 64) {
    return true;
  } 
  return false;
}

function readFirstLine(path, cb) {
    var rs = fs.createReadStream(path, {encoding: 'utf8'});
    var acc = '';
    var pos = 0;
    var index;
    rs
      .on('data', function (chunk) {
        index = chunk.indexOf('\n');
        acc += chunk;
        index !== -1 ? rs.close() : pos += chunk.length;
      })
      .on('close', function () {
        cb(null, acc.slice(0, pos + index));
      })
      .on('error', function (err) {
        cb(err,null);
      })
}
