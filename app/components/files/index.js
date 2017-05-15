(function () {
'use strict';

angular.module('swarmapp')
        .controller('FilesRouter', ['$stateProvider', FilesRouter]);

function FilesRouter($stateProvider) {
    $stateProvider
        .state('files', {
            url: '/files',
            templateUrl: './app/components/files/files.html',
            controller: filesController,
            controllerAs: 'vm'/*,
            resolve: {
                products: require('../services/resolve/products-list.resolve')
            }
            */
        })
}

angular.module('swarmapp').config(FilesRouter);

function filesController() {
    var vm = this;
  var holder = document.getElementById('drag-file');

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

    if (e.dataTransfer.getData("uploadfiles")) {
      path = e.dataTransfer.getData("uploadfiles");
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


    document.getElementById('drag-file').style.background = 'url("img/loader.gif") no-repeat center';
    execute('/home/fabio/go/bin/swarm --bzzapi http://swarm-gateways.net up ' + path, function(output) {
      document.getElementById('drag-file').style.background = "none";
      console.log("swarm executed successfully!");
      console.log(output); 
      lastoutput = output;
      lastpath = path;
      document.getElementById('upload-result').innerHTML = "<span class='results-title'>Upload successful!<br>Swarm returned this hash for your upload: </span><br><br><span class='results-content'>" + output + "</span>";
      document.getElementById('upload-result').style.display = "inline-block";
      document.getElementById('upload-result').innerHTML += "<button type='button' onclick='addToHashes()' class='action'>Add To My Hashes</button>";
    })    

    return false;
  };
}

})();
