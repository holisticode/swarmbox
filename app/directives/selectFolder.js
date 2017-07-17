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

