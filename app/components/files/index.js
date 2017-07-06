var tar = require('tar-fs');
var request = require('request');

require("./app/components/dialogs/hashDialog");

(function () {
'use strict';

const ENDPOINT = "http://localhost:8500";
const HASH_LENGTH = 64;
//const ENDPOINT = "http://swarm-gateways.net";

angular.module('swarmapp')
  .directive("selectfolder", [function () {
    return {
      scope: {
          selectfolder: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          scope.$apply(function () {
            scope.selectfolder = changeEvent.target.files[0].path;
          });
        });
      }
    }
}]);

angular.module('swarmapp')
        .controller('FilesRouter', ['$stateProvider','$http', '$compile', '$scope', 'startState', 'swarmboxHash', FilesRouter]);


function FilesRouter($stateProvider) {
    $stateProvider
        .state('files', {
            url: '/files',
            templateUrl: './app/components/files/files.html',
            controller: FilesController,
            controllerAs: 'vm'/*,
            resolve: {
                products: require('../services/resolve/products-list.resolve')
            }
            */
        })
}

angular.module('swarmapp').config(FilesRouter);

function FilesController($http, $compile, $scope, $uibModal, startState, swarmboxHash) {

  $scope.curr_dirs = [];
  $scope.curr_files = [];
  $scope.animationsEnabled = true;
  $scope.swarmboxHash = "";

  var holder = document.getElementById('swarmbox');

  $scope.openItem = function(id) {
    console.log("asdasd");
  }

  holder.ondragover = () => {
    return false;
  };

  holder.ondragleave = () => {
    return false;
  };

  holder.ondragend = () => {
    return false;
  };

  holder.ondrop = (e) => {
    e.preventDefault();

    var path = "";
    var isDir = false;

    if (e.dataTransfer.getData("uploadfiles")) {
      path = e.dataTransfer.getData("uploadfiles");
      isDir = e.dataTransfer.getData("isDirectory");
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


    //document.getElementById('drag-file').style.background = 'url("img/loader.gif") no-repeat center';
    /*
    var gopath = process.env.GOPATH;
    if (!gopath) {
      console.log("FATAL: Can not run swarmapp without $GOPATH! Either set $GOPATH or you may need to install Go. Exiting.");
      return;
    }

    var swarmpath = gopath + "/bin/swarm";
    */
    var h = swarmboxHash.getLastHash();
    if (!h) {
      console.log("Swarmbox root hash is not defined. Can't connect to swarmbox. Aborting");
      return;
    }
    updateSwarmbox($http, path, isDir, h);
    return false;
  };

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
      $scope.swarmboxHash = hash;
      if (!hash) {
        return;
      }
      connectToSwarmbox($http, hash, function(err, manifest) {
        if (!err) {
          processManifest($scope, manifest);
        }
      }); 
    }, function () {
      //$log.info('modal-component dismissed at: ' + new Date());
    });
  };

  var h = swarmboxHash.getLastHash();

  if (!startState.isStarted() && !h) {
    $scope.openHashDialog();
  } else if (h) {
    connectToSwarmbox($http, h, function(err, manifest) {
      if (!err) {
        swarmboxHash.setLastHash($scope.swarmHash);
        processManifest($scope, manifest);
      }
    }); 
  }


}

function updateSwarmbox($http, path, isDir, h) {

  fs.stat(path,(err,stats) => {
    if (err) {
        console.log("FATAL: Couldn't find the swarm binary on your machine! Did you install it? Existing.")
        return;
    }
    
    var buf = null;
    if (isDir) {
      var url = ENDPOINT + "/bzz:/" + h + "/docs/";
      console.log(url);
      tar.pack(path).pipe(request({headers: {"Content-Type":"application/x-tar"}, method: "PUT", url:url}, function(err, response, body) {
          if (err) {
            console.log("EERRROR");
            console.log(err);
          }
          console.log(response.statusCode);
         console.log(body);
      })
    );
    } else {
      buf = readFileSync(path);
    }
    
    if (!buf) {
      console.log("Buffer for update is empty, something went wrong. Aborting");
      return;
    }

    /*
    $http.put(ENDPOINT + "/bzz:/ " + h, buf).then(
      function(d) {
      },
      function(e) {
      }
    );
    */
  });
}

function getTar(path) {
  tar.pack(path);
}

function connectToSwarmbox($http, hash, cb) {
  console.log("Connecting to swarm box...");
  if (!hash || hash.length != HASH_LENGTH) {
    console.log("Invalid hash provided, unable to connecto to Swarmbox. Aborting.");
    return;
  }
  $http.get(ENDPOINT + "/bzz:/" + hash + "/?list=true").then(
    function(d) {
      console.log("Successfully retrieved manifest for user's swarmbox");
      cb(null, d.data);
    },
    function(e) {
      console.log("Error connecting to Swarmbox");
      console.log(e);
      cb(e, null);
    }
  );
}

function processManifest($scope, mf) {
  if (mf) {
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

function uploadToSwarm(isDir, path) {
      /*
    fs.stat(swarmpath,(err,stats)=>{
      if(err) {
          console.log("FATAL: Couldn't find the swarm binary on your machine! Did you install it? Existing.")
          return;
      }


    });
      var recursive = "";
      if (isDir) {
        recursive = " --recursive";
      } 

      //var cmd ='/home/fabio/go/bin/swarm --bzzapi ENDPOINT ' + recursive + ' up ' + path ;
      var cmd ='/home/fabio/go/src/github.com/ethererum/go-ethereum/build/bin/swarm --bzzapi ' + ENDPOINT + ' ' + recursive + ' up ' + path ;
      console.log(cmd);

      execute(cmd, function(output) {
        document.getElementById('drag-file').style.background = "none";
        console.log("swarm executed successfully!");
        console.log(output); 
        lastoutput = output;
        lastpath = path;
        document.getElementById('upload-result').innerHTML = "<span class='results-title'>Upload successful!<br>Swarm returned this hash for your upload: </span><br><br><span class='results-content'>" + output + "</span>";
        document.getElementById('upload-result').style.display = "inline-block";
        document.getElementById('upload-result').innerHTML += "<button type='button' onclick='addToHashes()' class='action'>Add To My Hashes</button>";
      })    
      */
}

})();
