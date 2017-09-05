(function () {
    'use strict';

    angular.module('BlurAdmin.pages.verifyUserEmail')
        .controller('VerifyUserEmailCtrl', VerifyUserEmailCtrl);

    /** @ngInject */
    function VerifyUserEmailCtrl($scope,$http,toastr,$location,environmentConfig,errorToasts) {

        var vm = this;
        vm.keyObj = $location.search();

        $scope.verifyUserEmailAddress = function(){
            $http.post(environmentConfig.API + '/auth/email/verify/', {
                key: vm.keyObj.key
            }).then(function (res) {
                if (res.status === 200) {
                    $location.search('key', null);
                    toastr.success("Email has been verified successfully");
                    $location.path('/login');
                }
            }).catch(function (error) {
                errorToasts.evaluateErrors(error.data);
            });
        };
        $scope.verifyUserEmailAddress();

    }
})();
