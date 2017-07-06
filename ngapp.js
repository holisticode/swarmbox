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

  ngapp.factory('startState',function(){
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

  ngapp.factory('swarmboxHash',function(){
    var lastHash = false;
    return{
        getLastHash: function(){
            return lastHash;
        },

        setLastHash: function(hash){
            lastHash = hash;
        },
    };
  });

 /*
  ngapp.constant('DB_CONFIG', {
        client: {
            id: 'swarmbox',
            name: { type: 'text', null: false },
            email: { type: 'text' },
            id_zone: { type: 'integer' }
        },
        zone: {
            id: 'swarmbox',
            name: { type: 'text', null: false }
        }
    })
  
    .run(function ($SQLite) {
        $SQLite.dbConfig({
            name: 'swarmbox-DB',
            description: 'swarmbox-DB',
            version: '1.0'
        });
    })
  
    .run(function ($SQLite, DB_CONFIG) {
        $SQLite.init(function (init) {
            angular.forEach(DB_CONFIG, function (config, name) {
                init.step();
                $SQLite.createTable(name, config).then(init.done);
            });
            init.finish();
        });
    })
    */
    /* RUN CODE TO CHECK IF A HASH IS THERE, IF NOT, ASK THE USER FOR AN EXISTING HASH, IF PROVIDED, SAVE */
    /*
    .run(function ($SQLite, DB_CONFIG) {
    })
    */
    ;
/* 
 
  .factory('SwarmBoxSQLiteClient', function ($SQLite) {
    $SQLite.ready(function () { // The DB is created and prepared async.
      this.selectAll(o.sql, o.params)
        .then(o.onEmpty, o.onError,
          function (result) {
            if (angular.isFunction(o.onResult)) o.onResult.apply(this, [ result.rows, result.count, result.result ]);
          }
        );
  });
  
  var clientID = 1;
    $SQLite.ready(function () { // The DB is created and prepared async.
        this
            .selectFirst('SELECT * FROM client WHERE id = ? LIMIT 1', [ clientID ])
            .then(
        function () { console.log('Empty Result!'); },
        function () { console.err('Error!'); },
        function (data) {
                // Result!
                // data.item
                // data.count
                // data.result
            }
      );
    });
  
    var newClientData = {
    name: 'Eduardo Daniel Cuomo',
    email: 'eduardo.cuomo.ar@gmail.com',
    id_zone: 123
  };
    $SQLite.ready(function () {
        this.insert('client', newClientData) // this.replace
            //.then(onResult, onError)
    });
  
    $SQLite.ready(function () {
        this.execute('UPDATE zone SET name = ? WHERE id = ?', [ 'foo', 123 ])
            //.then(onFinish, onError)
    });
}); */
})();
