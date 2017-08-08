angular.module('swarmapp')
  .directive('ngdroppable', function() {
    return {
        scope: {
            drop: '&', // parent
            dir: '='
        },
        link: function(scope, element) {
          // again we need the native object
          var el = element[0];

          el.addEventListener(
            'dragover',
            function(e) {
                e.dataTransfer.dropEffect = 'move';
                // allows us to drop
                if (e.preventDefault) e.preventDefault();
                this.classList.add('over');
                return false;
            },
            false
          );
          el.addEventListener(
            'dragenter',
            function(e) {
                this.classList.add('over');
                return false;
            },
            false
          );

          el.addEventListener(
            'dragleave',
            function(e) {
                this.classList.remove('over');
                return false;
            },
            false
          );
          el.addEventListener(
            'drop',
            function(e) {
                // Stops some browsers from redirecting.
                if (e.stopPropagation) e.stopPropagation();

                this.classList.remove('over');
                var destFolder = el.id;

                var path  = e.dataTransfer.getData('uploadfiles');
                var isDir = e.dataTransfer.getData('isDirectory');

                // call the drop passed drop function
                scope.$apply(function(scope) {
                    var fn = scope.drop();
                    if ('undefined' !== typeof fn) {
                      fn(destFolder, path, isDir);
                    }
                });

                return false;
            },
            false
          );
        }
    }
});
