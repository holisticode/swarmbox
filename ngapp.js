(function () {
'use strict'

var ngapp = angular.module('swarmapp', [ 'ui.router' ]);

ngapp.config(['$urlRouterProvider', function($urlRouterProvider) {
    $urlRouterProvider.when("", "/");
    $urlRouterProvider.when("/", "/files");
    //$urlRouterProvider.otherwise("/");
}]);

ngapp.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChange', function(event, toState, toParams, fromState, fromParams) {
      console.log("state changed");
    });
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        console.dir(error);
        $state.go('/');
    });
}]);
})();
