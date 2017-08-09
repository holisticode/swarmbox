'use strict';

const ENDPOINT = "http://localhost:8500";
const GATEWAY = "http://swarm-gateways.net";
const HASH_LENGTH = 64;

var tar = require('tar-fs');
var request = require('request');
var nodejspath = require("path");

FilesController.$inject = ['$http','$compile', '$scope','$uibModal','ErrorService','PubSub','StartState', 'SwarmboxHash', 'HashHistory'];

function FilesController($http, $compile,$scope,$uibModal,ErrorService,PubSub,StartState,SwarmboxHash, HashHistory) {

  var uploadHereDefault     = "Drag files here to upload to Swarm";

  $scope.curr_dir           = "/";
  $scope.curr_dirs          = [];
  $scope.curr_files         = [];
  $scope.curr_manifest      = null;
  $scope.animationsEnabled  = true;
  $scope.swarmboxHash       = "";
  $scope.uploadHere         = uploadHereDefault;

  readFolder(getOsHome());

  var uploadbox = document.getElementById('uploadbox');

  uploadbox.ondragover = () => {
    return false;
  };

  uploadbox.ondragleave = () => {
    return false;
  };

  uploadbox.ondragend = () => {
    return false;
  };

  uploadbox.ondrop = (e) => {
    let pathObj   = evalPath(e);
    let isDir     = pathObj.isDir;
    let path      = pathObj.path;
    $scope.uploadHere = "";
    document.getElementById('uploadbox').style.background = 'url("img/loader.gif") no-repeat center';
    document.getElementById('uploadbox').style["background-size"] = "50px";
    $scope.uploadToSwarm(isDir, path);
  };

  $scope.dropFromSwarmboxFolder = (destFolder, path, isDir) => {
    SwarmboxHash.getLastHash(StartState.isStarted(), function(err, h) {
      if (err) {
        console.log("Error looking up last hash for Swarmbox");
        return
      }
      if (!h) {
        console.log("Swarmbox root hash is not defined. Can't connect to swarmbox. Aborting");
        ErrorService.showError("Can't complete upload request, Swarm hash is not defined. Has the setup process been completed?");
        return;
      }

      var downloadHash = function(p) {
        $http.get(ENDPOINT + "/bzz:/" + h + "/" + p).then(
          function(r) {
            if (r.data && r.data.entries && r.data.entries.length > 0) {
              //downloading directory
              let dirname = nodejspath.join(current_local_path, p);
              fs.mkdirSync(dirname);
              for (let k=0; k<r.data.entries.length; k++) {
                if (r.data.entries[k].path == "" || r.data.entries[k].path == ".") {
                  continue;
                }
                downloadHash(p + "/" + r.data.entries[k].path);
              }
              
            } else {
              //downloading single file
              fs.createReadStream(r.data).pipe(fs.createWriteStream(nodejspath.join(current_local_path , p)));
            }
            readFolder(current_local_path);
          },
          function(e) {
            console.log("Download from Swarmbox failed");
            console.log(e);
          }
        );
      }

      downloadHash(path);
    });
  };

  $scope.dropToSwarmboxFolder = (destFolder, path, isDir) => {
    SwarmboxHash.getLastHash(StartState.isStarted(), function(err, h) {
      if (err) {
        console.log("Error looking up last hash for Swarmbox");
        return
      }
      if (!h) {
        console.log("Swarmbox root hash is not defined. Can't connect to swarmbox. Aborting");
        ErrorService.showError("Can't complete upload request, Swarm hash is not defined. Has the setup process been completed?");
        return;
      }
      $scope.updateSwarmbox(path, isDir, h, destFolder);
      return false;
    });
  };

  $scope.openItem = function(id) {
    $scope.curr_dirs          = [];
    $scope.curr_files         = [];
    getDir($scope, $http, id);
  }

  $scope.addToHashes = function(resultHash, lastpath) {
    HashHistory.addHash(resultHash, {timestamp: new Date(), hash: lastoutput, path: lastpath});
    PubSub.publish("hashHistory", "updated"); 
    let parent = angular.element(document.querySelector('#upload-result'));
    $scope.uploadHere = uploadHereDefault;
    parent.html("");

  }

  $scope.uploadToSwarm = function(isDir, path) {
    fs.stat(path,(err,stats) => {
      if (err) {
          console.log("ERROR: Selected a path to upload which could not be found on your HD!")
          return;
      }

      var buf = null;
      if (isDir) {
        var url = ENDPOINT + "/bzz:/";
        tar.pack(path).pipe(request({headers: {"Content-Type":"application/x-tar"}, method: "POST", url:url}, function(err, response, body) {
          if (err) {
            document.getElementById('uploadbox').style.background = 'none';
            ErrorService.showError("Error uploading directory to swarm");
            return console.log(err);
          }
          console.log(response.statusCode);
          $scope.successUpload(body, path);
        }));
      } else {
        buf = fs.readFileSync(path);
        $http.post(ENDPOINT + "/bzz:/", buf).then(
          function(r) {
            $scope.successUpload(r.data, path); 
          },
          function(e) {
            document.getElementById('uploadbox').style.background = 'none';
            ErrorService.showError("Unfortunately, your upload failed!");
            console.log(e);
          }
        );
      }
    });
  }

  $scope.successUpload = function(resultHash, path) {
    document.getElementById('uploadbox').style.background = 'none';
    document.getElementById('upload-result').style.display = 'block';
    let html = "<div class='inline results-title'>Upload successful!<br/>Swarm returned this hash for your upload:<br/><br/><span class='results-content'>" + resultHash + "</span></div>";
    html += "<div class='inline results-actions'><button type='button' class='btn-normal' ng-click='addToHashes(\"" + resultHash +"\",\"" + path + "\")' class='action'>Add To My Hashes</button></div>";
    let parent = angular.element(document.querySelector('#upload-result'));
    let generated = parent.html(html)
    $compile(generated.contents())($scope)
  }

  $scope.updateSwarmbox = (path, isDir, h, destFolder ) => {
    fs.stat(path,(err,stats) => {
      if (err) {
          ErrorService.showError("Selected a path to upload which could not be found on your HD!")
          return;
      }
      
      var buf = null;
      isDir = (isDir == true);
      if (isDir) {
        var dirname = path.substr(path.lastIndexOf(nodejspath.sep) +1);
        console.log(dirname);
        var url = ENDPOINT + "/bzz:/" + h + "/" + destFolder + dirname;
        console.log(url);
        tar.pack(path).pipe(request({headers: {"Content-Type":"application/x-tar"}, method: "PUT", url:url}, function(err, response, body) {
          if (err) {
            console.log("EERRROR");
            console.log(err);
          }
          console.log(response.statusCode);
          console.log("Successfully updated swarmbox, new hash is: " + body);
          $scope.refreshSwarmbox(body);
        })
      );
      } else {
        buf = fs.readFileSync(path);
        if (!buf) {
          console.log("Buffer for update is empty, something went wrong. Aborting");
          ErrorService.showError("Upload failed; is this a valid file?");
          return;
        }

        var filename = path.substr(path.lastIndexOf(nodejspath.sep) +1);
        console.log(filename);
        var url = ENDPOINT + "/bzz:/" + h + "/" + filename;
        console.log(url);
        $http.put(url, buf).then(
          function(r) {
            console.log("file successfully uploaded");
            $scope.refreshSwarmbox(r.data);
          },
          function(e) {
            document.getElementById('uploadbox').style.background = 'none';
            ErrorService.showError("Unfortunately, your upload failed!");
            console.log(e);
          }
        );
      }
    });
  }

  $scope.refreshSwarmbox = (newhash) => {
    $scope.curr_dirs =  [];
    $scope.curr_files = [];
    connectToSwarmbox($http, newhash, PubSub, $uibModal, function(err, manifest) {
      if (err) {
        console.log("Error connecting to swarmbox");
        console.log(err);
        return
      }
      $scope.swarmboxHash = newhash;
      SwarmboxHash.setLastHash($scope.swarmboxHash, function(err) {
          if (err) {
            console.log("error setting last hash");
            console.log(err);
            return
          }
          $scope.curr_manifest = manifest;
          processManifest($scope, manifest, true);
        });
    }); 

  }

  $scope.openHashDialog = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      component: 'hashModalComponent',
      resolve: {
        hash: function () {
          return $scope.swarmboxHash;
        }
      }
    });

    modalInstance.result.then(function (hash) {
      console.log("modal result: " + hash);
      if (!hash) {
        console.log("invalid hash, returning");
        return;
      }
      connectToSwarmbox($http, hash, PubSub, $uibModal, function(err, manifest) {
        if (err) {
          console.log("Error connecting to swarmbox");
          console.log(err);
          return
        }
        $scope.swarmboxHash = hash;
        SwarmboxHash.setLastHash($scope.swarmboxHash, function(err) {
            if (err) {
              console.log("error setting last hash");
              console.log(err);
              return
            }
            $scope.curr_manifest = manifest;
            processManifest($scope, manifest, true);
          });
      }); 
    }, function () {
      //$log.info('modal-component dismissed at: ' + new Date());
    });
  };

  var isStarted = StartState.isStarted();

  SwarmboxHash.getLastHash(isStarted, function(err, hash) {
    if (!isStarted && !hash) {
      $scope.openHashDialog();
    } else if (hash) {
      connectToSwarmbox($http, hash, PubSub, $uibModal, function(err, manifest) {
        if (err) {
          ErrorService.showError("Failed to connect to Swarmbox. Do you have internet connection?");
          return;
        }
        $scope.swarmboxHash = hash;
        processManifest($scope, manifest, true);
      }); 
    };
  });

}

function evalPath(e) {
  e.preventDefault();

  var path = "";
  var isDir = false;

  if (e.dataTransfer.getData("uploadfiles")) {
    path = e.dataTransfer.getData("uploadfiles");
    isDir = ("true" == e.dataTransfer.getData("isDirectory"));
  } else {
    for (let f of e.dataTransfer.files) {
      console.log('File(s) you dragged here: ', f.path)
      path = e.dataTransfer.files[0].path;
    }
  }

  if (path == null || path == "") {
    console.log("something went wrong, empty path");
    return;
  }

  return {path: path, isDir: isDir};
}


function getTar(path) {
  tar.pack(path);
}

function connectToSwarmbox($http, hash, PubSub, $uibModal, cb) {
  var modalInst = $uibModal.open({
      animation: true,
      component: 'loadingSwarmboxComponent'
  });
  modalInst.rendered.then(
    function(d) {
      console.log("Connecting to swarm box...");
      PubSub.publish("loadingSwarmbox", {endpoint: ENDPOINT, status: "connecting"});
      if (!hash || hash.length != HASH_LENGTH) {
        console.log("Invalid hash provided, unable to connecto to Swarmbox. Aborting.");
        return;
      }
      $http.get(ENDPOINT + "/bzz:/" + hash + "/?list=true").then(
        function(d) {
          console.log("Successfully retrieved manifest for user's swarmbox");
          PubSub.publish("loadingSwarmbox", {endpoint: ENDPOINT, status: "ok"});
          modalInst.close();
          cb(null, d.data);
        },
        function(e) {
          console.log(e);
          console.log("Error connecting to Swarmbox. Trying failover on gateway");
          PubSub.publish("loadingSwarmbox", {endpoint: ENDPOINT, status: "failed"});
          PubSub.publish("loadingSwarmbox", {endpoint: GATEWAY, status: "connecting"});
          $http.get(GATEWAY+ "/bzz:/" + hash + "/?list=true").then(
            function(d) {
              console.log("Successfully retrieved manifest for user's swarmbox");
              PubSub.publish("loadingSwarmbox", {endpoint: GATEWAY, status: "ok"});
              modalInst.close();
              ENDPOINT = GATEWAY;
              cb(null, d.data);
            },
            function(e) {
              console.log(e);
              console.log("Gateway cnnection failed as well. Giving up");
              PubSub.publish("loadingSwarmbox", {endpoint: GATEWAY, status: "failed"});
              modalInst.close();
              cb(e, null);
            }
          );
        }
      );
    }
  );
}

function processManifest($scope, mf, isRoot) {
  if (mf) {
    if (!isRoot) {
      $scope.curr_dirs.push("../");
    }
    if (mf.common_prefixes) {
      for (let d of mf.common_prefixes) {
        $scope.curr_dirs.push(d);
      }
    }
    if (mf.entries) {
      for (let f of mf.entries) {
        $scope.curr_files.push(f);
      }
    }
  }
  //console.log($scope.curr_dirs);
  //console.log($scope.curr_files);
}

function getDir($scope, $http, id) {
  if (id) {
    let isRoot = false;
    let url = ""; 
    if (id == "../") {
      let path = $scope.curr_dir;
      if (path.lastIndexOf(nodejspath.sep) == path.length - 1) {
        path = path.slice(0, -1);
      }
      let idx = path.lastIndexOf(nodejspath.sep);
      if (idx) {
        path = path.substring(0,path.lastIndexOf(nodejspath.sep));  
        $scope.curr_dir = path; 
      } else {
        path = "";
        $scope.curr_dir = getOsRoot(); 
        isRoot = true;
      }
      url = ENDPOINT + "/bzz:/" + $scope.swarmboxHash + "/" + path + "?list=true";
    } else { 
      url = ENDPOINT + "/bzz:/" + $scope.swarmboxHash + "/" + id + "?list=true";
      $scope.curr_dir = $scope.curr_dir + id; 
    } 
    if (url) {
      $http.get(url).then(
        function(r) {
          processManifest($scope, r.data, isRoot);
        }, function(e) {
          console.log("Error getting directory manifest");
          console.log(e);
        }
      );
    }
  } else {
    console.log("invalid directory id provided to getDir()");
  }
}


module.exports = FilesController;

