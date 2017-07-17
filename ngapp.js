(function () {
  'use strict'

  var ngapp = angular.module('swarmapp', [ 'ui.router', 'ui.bootstrap' ]);

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

  ngapp.factory('PubSub',function(){
    var channels = [];
    return {
      subscribe: function(channel, cb) {
        if (!channels[channel]) {
          channels[channel] = [];
        }
        channels[channel].push(cb);
      },
      publish: function(channel, message) {
        if (!channels[channel]) {
          console.log("channel not yet initialized");
          return;
        }
        for (let consumer of channels[channel]) {
          consumer(message);
        }
      }
    }
  });

  ngapp.factory('StartState',function(){
    var isStarted = false;
    return{
        isStarted: function(){
            return isStarted;
        },

        startApp: function(){
            isStarted = true;
        },
    };
  });

  ngapp.factory('ErrorService',["$uibModal", function ErrorService($uibModal) {
    return {
      showError: function(errorText) {
        var modalInstance = $uibModal.open({
          animation: true,
          component: 'errorDialog',
          resolve: {
                errorText: function () {
                    return errorText;
                }
            } 
        });
      }
    }
  }]);

  ngapp.factory('SwarmboxHash',function() {
    var lastHash = false;
    return {
        getLastHash: function(isStarted, cb){
            if (isStarted) {
              console.log("is stared, thus returning form cache");
              cb(null, lastHash);
            } else {
              console.log("is not stared, reading file");
              readFirstLine(HASH_FILE , function(err, existingHash) {
                if (err) {
                  console.log("Error reading last hash");
                  return console.log(err);
                }
                console.log(existingHash);
                lastHash = existingHash;              
                cb(err, existingHash);
              });
            }
        },

        setLastHash: function(hash, cb) {
            persistHash(hash, function(err) {
              if (err) {
                throw err;
              }
              lastHash = hash;
              cb(null);
            });
        },
    };
  });

  require('./index')(ngapp);

})();
