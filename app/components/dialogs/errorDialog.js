angular.module('swarmapp').component('errorDialog', {
  templateUrl: 'errorDialog.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;

    $ctrl.title = "Something went wrong!";
    $ctrl.error = "Generic error";

    $ctrl.$onInit = function () {
      $ctrl.error = this.resolve.errorText;
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
});
