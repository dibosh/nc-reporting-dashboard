angular.module('Services')
  .factory('Reports', ['$http', function($http) {
  return {
    fromServer : function () {
      return {
        allFromServer : function () {
          return $http.get('/api/report/all');
        }
      };
    },

    fromFile : function () {
      return {
        allForProvider : function (provider) {
          return $http.get('/api/report/static/all/' + provider);
        },

        forAllProviders : function () {
          return $http.get('/api/report/static/all');
        },

        forProviderFromPageWithSize : function (provider, pageNumber, pageSize) {
          return $http.get('/api/report/static/' + provider + '/' + pageNumber + '/' + pageSize);
        }
      };
    }
  }
}]);