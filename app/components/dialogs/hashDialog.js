angular.module('swarmapp').component('hashModalComponent', {
  templateUrl: 'hashDialogContent.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function (Swarmbox, SwarmboxHash, $state) {
    var $ctrl = this;

    $ctrl.currentDialogTitle = "Do you already have a Swarmbox configured?";
    $ctrl.swarmHash = "";
    $ctrl.hasBox = false;
    $ctrl.hasBoxShown = false;
    $ctrl.swarmboxFolder = false;
    $ctrl.uploadingFolder = false;

    $ctrl.$onInit = function () {
      //$ctrl.hash = $ctrl.resolve.hash;
    };

    $ctrl.has = function () {
      $ctrl.hasBoxShown = true;
      $ctrl.hasBox = true;
      $ctrl.currentDialogTitle = "Please provide your latest root hash of your Swarmbox";
    };

    $ctrl.hasNot  = function () {
      $ctrl.hasBoxShown = true;
      $ctrl.currentDialogTitle = "Select the folder you want to use with Swarmbox";
    };

    $ctrl.confirmFolder = function () {
      $ctrl.hasBoxShown = true;
      if (!$ctrl.swarmboxFolder) {
        $ctrl.close();
        return console.log("Invalid swarmboxFolder");
      }
      $ctrl.uploadingFolder = true; 
      
      fs.stat($ctrl.swarmboxFolder,(err,stats) => {
        if (err) {
          $ctrl.close();
          return console.log("Provided swarmboxFolder does not exist or is invalid.");
        }
        console.log("Uploading folder to swarm...");
        Swarmbox.upload($ctrl.swarmboxFolder, function(err, hash){
          $ctrl.uploadingFolder = false; 
          $ctrl.close();
          if (err) return;
          SwarmboxHash.setLastHash(hash, function(err) {
            if (err) return;
            $state.reload();
          });
        });
      });
    };

    $ctrl.dontUseFolder = function () {
      $ctrl.swarmboxFolder = false;
      $ctrl.close();
    };

    $ctrl.ok = function () {
      $ctrl.close({$value: $ctrl.swarmHash});
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});
