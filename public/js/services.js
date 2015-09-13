angular.module('Services')
  .factory('Reports', ['$http', function($http) {
  return {
    all : function () {
      return $http.get('/api/report/all');
    },

    allFromFile : function (provider) {
      return $http.get('/api/report/static/all/' + provider);
    },

    allFromPage : function (provider, pageNumber, pageSize) {
      return $http.get('/api/report/static/' + provider + '/' + pageNumber + '/' + pageSize);
    }
  }
}]);