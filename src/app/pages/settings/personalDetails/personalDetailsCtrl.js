(function () {
    'use strict';

    angular.module('BlurAdmin.pages.settings.personalDetails')
        .controller('PersonalDetailsCtrl', PersonalDetailsCtrl);

    /** @ngInject */
    function PersonalDetailsCtrl($scope,environmentConfig,errorHandler,$http,cookieManagement,errorToasts,toastr,$location) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.loadingAccountInfo = true;
        $scope.showAdminEmails = false;
        vm.updatedAdministrator = {};
        $scope.birth = {};
        $scope.months = [
            {
                value: 1,
                name: "January"
            },
            {
                value: 2,
                name: "February"
            },
            {
                value: 3,
                name: "March"
            },
            {
                value: 4,
                name: "April"
            },
            {
                value: 5,
                name: "May"
            },
            {
                value: 6,
                name: "June"
            },
            {
                value: 7,
                name: "July"
            },
            {
                value: 8,
                name: "August"
            },
            {
                value: 9,
                name: "September"
            },
            {
                value: 10,
                name: "October"
            },
            {
                value: 11,
                name: "November"
            },
            {
                value: 12,
                name: "December"
            }
        ];
        $scope.accountInfoChanged = function(field){
            vm.updatedAdministrator[field] = $scope.administrator[field];
        };

        vm.getAdminAccountInfo = function () {
            if(vm.token) {
                $http.get(environmentConfig.API + '/user/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loadingAccountInfo = false;
                    if (res.status === 200) {
                        $scope.administrator = res.data.data;
                        if($scope.administrator.birth_date){
                        var nums = $scope.administrator.birth_date.split("-");
                        if(nums.length == 3){
                            $scope.birth.year = parseInt(nums[0]);
                            $scope.birth.month = parseInt(nums[1]);
                            $scope.birth.day = parseInt(nums[2]);
                        }
                    }
                    }
                }).catch(function (error) {
                    $scope.loadingAccountInfo = false;
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        vm.getAdminAccountInfo();

        $scope.updateAdministratorAccount = function(){
            vm.updatedAdministrator['birth_date'] = $scope.birth.year+"-"+$scope.birth.month+"-"+$scope.birth.day;
            $scope.loadingAccountInfo = true;
            $http.patch(environmentConfig.API + '/user/', vm.updatedAdministrator ,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loadingAccountInfo = false;
                if (res.status === 200) {
                    $scope.administrator = res.data.data;
                    toastr.success('You have successfully updated your info!');
                }
                vm.updatedAdministrator = {};
            }).catch(function (error) {
                vm.updatedAdministrator = {};
                $scope.loadingAccountInfo = false;
                if(error.status == 403){
                    errorHandler.handle403();
                    return
                }
                errorToasts.evaluateErrors(error.data);
            });
        };

    }
})();
