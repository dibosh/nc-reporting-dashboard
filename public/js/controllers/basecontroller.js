angular.module('Controllers')
  .controller('BaseCtrl', function ($scope) {
    $scope.tabs = [
      {
        title: 'Overview',
        active: true,
        disabled: false,
        content: 'views/components/overview.html'
      },
      {
        title: 'Detailed Reports',
        active: false,
        disabled: false,
        content: 'views/components/reports.html'
      }
    ];
  });