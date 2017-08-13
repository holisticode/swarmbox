(function () {
  'use strict'

  var fs = require('fs');

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

  ngapp.factory('Swarmbox',function($http,PubSub,$uibModal,ErrorService){
    return{
        connect: function(hash, cb){
          var modalInst = $uibModal.open({
              animation: true,
              component: 'loadingSwarmboxComponent'
          });
          modalInst.rendered.then(
            function(d) {
              console.log("Connecting to swarm box...");
              PubSub.publish("loadingSwarmbox", {endpoint: ENDPOINT, status: "connecting"});
              if (!hash || !validSwarmboxId()) {
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
                      ErrorService.showError("Could not connect to you Swarmbox. Check your internet connection?");
                      cb(e, null);
                    }
                  );
                }
              );
            }
          );
        },

        upload: function(path, cb) {
          fs.stat(path,(err,stats) => {
            if (err) {
                console.log("ERROR: Selected a path to upload which could not be found on your HD!")
                return cb(err);
            }
            var url = ENDPOINT + "/bzz:/";
            request(url, function(error,response,body) {
              if (error || response != 200) {
                url = GATEWAY + "/bzz:/";
              }
              tar.pack(path).pipe(request({headers: {"Content-Type":"application/x-tar"}, method: "POST", url:url}, function(err, response, body) {
                  if (err) {
                    document.getElementById('uploadbox').style.background = 'none';
                    ErrorService.showError("Error uploading directory to swarm");
                    return cb(err);
                  }
                  console.log(response.statusCode);
                  cb(null, body);
              }));
            });
          });

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
        getLastHash: function(isStarted, cb) {
            if (isStarted) {
              console.log("is started, thus returning form cache");
              cb(null, lastHash);
            } else {
              console.log("is not started, reading file");
              if (fs.existsSync(HASH_FILE)) {
                readFirstLine(HASH_FILE , function(err, existingHash) {
                  if (err) {
                    console.log("Error reading last hash");
                    return console.log(err);
                  }
                  console.log(existingHash);
                  lastHash = existingHash;              
                  cb(err, existingHash);
                });
              } else {
                cb(null,lastHash);
              }
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

  ngapp.factory('HashHistory',function() {
    var hashes = [];
    return {
        getHashes: function(isStarted) {
            if (isStarted) {
              console.log("is started, thus returning form cache");
              return hashes;
            } else {
              console.log("is not started, reading file");
              if (fs.existsSync(HASH_HISTORY)) {
                hashes = JSON.parse(fs.readFileSync(HASH_HISTORY)); 
                console.log(hashes);
              } else {
                fs.closeSync(fs.openSync(HASH_HISTORY, 'w'));
              }
              return hashes;
            }
        },

        addHash: function(hash, object) {
          let entry = {hash: hash, meta: object}; 
          hashes.push(entry);
          fs.writeFileSync(HASH_HISTORY, JSON.stringify(hashes));
          return hashes;
        },
    };
  });
  require('./index')(ngapp);

})();
