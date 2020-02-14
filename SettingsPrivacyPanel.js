/**
 * Created by martens on 11.09.2015.
 */
Ext.define('SettingsPrivacyPanel',
    {
        extend: 'SettingsBasePanel',

        maxWidth: window.innerWidth,
        title: '',
        iconCls: 'privacy',
        cb_showRequestEmail: {},

        initComponent: function ()
        {
            this.callParent();

            this.title = LANGUAGE.getString('privacy');

            var self = this;
            var successFunction = function () {
                console.log("Success");
            };

            SESSION.getAccessRights(function (result)
            {
                console.log('getAccessRights success!');
                console.log(result);

                var rights = [];

                if (isValid(result, 'getPartnerAccessRights()'))
                {
                    for (var i = 0; i < result.getPartnerAccessRights().length; i++)
                    {
                        var curAccessRight = result.getPartnerAccessRights()[i];

                        var curAcl = curAccessRight.getAcl();

                        var callState = -1;
                        var callDiversion = -1;
                        var present = -1;
                        var incomingCall = false;
                        var outgoingCall = false;
                        var callDuration = false;
                        var pickup = false;
                        var diversion = false;
                        var rightType = '';
                        var type = '';

                        type = curAccessRight.getType();

                        if (curAccessRight.getType() === 'Special')
                        {
                            rightType = 'special';
                        }
                        else if (curAccessRight.getType() === 'User')
                        {
                            rightType = 'agents';
                        }
                        else
                        {
                            rightType = 'groups';
                        }

                        /*jslint bitwise: true */
                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_0.value) !== 0)
                        {
                            callState = AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_0.index;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_1.value) !== 0)
                        {
                            callState = AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_1.index;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_2.value) !== 0)
                        {
                            callState = AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_2.index;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_3.value) !== 0)
                        {
                            callState = AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_3.index;
                        }

                        if (callState < 0)
                        {
                            callState = 0;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_NO_CALLDIV_STATE.value) !== 0)
                        {
                            callDiversion = AccessRights.CCA_APP_PARTNER_ACCESS_NO_CALLDIV_STATE.index;
                        }
                        else if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_CALLDIV_TARGET.value) !== 0)
                        {
                            callDiversion = AccessRights.CCA_APP_PARTNER_ACCESS_CALLDIV_TARGET.index;
                        }
                        else
                        {
                            callDiversion = 1;
                        }


                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_ONLINE_STATE.value) !== 0)
                        {
                            if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_NO_STATE_DURATION.value) !== 0)
                            {
                                present = AccessRights.CCA_APP_PARTNER_ACCESS_NO_STATE_DURATION.index;
                            }
                            else
                            {
                                present = AccessRights.CCA_APP_PARTNER_ACCESS_ONLINE_STATE.index;
                            }
                        }
                        else
                        {
                            present = 0;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_NO_DURATION.value) !== 0)
                        {
                            callDuration = true;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_NO_OUTBOUND.value) !== 0)
                        {
                            outgoingCall = true;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_OFFERING_ONLY.value) !== 0)
                        {
                            incomingCall = true;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_CALLDIVERSION.value) !== 0)
                        {
                            diversion = true;
                        }

                        if ((curAcl & AccessRights.CCA_APP_PARTNER_ACCESS_PICKUP.value) !== 0)
                        {
                            pickup = true;
                        }
                        /*jslint bitwise: false */

                        var name = Ext.String.htmlEncode(curAccessRight.getDisplayName() + (curAccessRight.getTenant()?("/"+curAccessRight.getTenant()):""));
                        
                        var curRights = {
                            contactName: name,
                            contactId: curAccessRight.getId(),
                            call: callState,
                            redirect: callDiversion,
                            present: present,
                            incomingCall: incomingCall,
                            outgoingCall: outgoingCall,
                            callDuration: callDuration,
                            callDiversion: diversion,
                            pickup: pickup,
                            type: rightType,
                            startType: type
                        };

                        rights[rights.length] = curRights;
                    }
                    console.log(rights);
                }
                /* Bitte mit Burhan klären, ob "Alle"-Eintrag immer da sein muss.
                var foundAllRight = false;
                for (var z = 0; z < rights.length; z++) {
                    var r = rights[z];
                    if (r.contactId === "$$all$$") {
                        froundAllRight = true;
                    }
                }
                if (foundAllRight === false) {
                    var allRight = {
                        contactName: "&lt;Alle&gt;",
                        contactId: "$$all$$",
                        call: 0,
                        redirect: 0,
                        present: 0,
                        incomingCall: false,
                        outgoingCall: false,
                        callDuration: false,
                        callDiversion: false,
                        pickup: false,
                        type: "special",
                        startType: "Special"
                    };
                    rights.unshift(allRight);
                }
                */

                self.add(new PrivacyConfigurationPanel({
                    successFunction: successFunction,
                    groups: [],
                    persons: [],
                    saveFunction: function (testData)
                    {
                        console.log(testData);

                        var privacyData = testData.permissions;
                        var resultData = [];
                        for (var i = 0; i < privacyData.length; i++)
                        {
                            var curPrivacyData = privacyData[i];
                            var acl = AccessRights.CCA_APP_PARTNER_ACCESS_UNDEFINED.value;
                            /*jslint bitwise: true */
                            switch (curPrivacyData.call)
                            {
                            case AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_0.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_0.value;
                                break;
                            case AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_1.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_1.value;
                                break;
                            case AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_2.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_2.value;
                                break;
                            case AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_3.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_LEVEL_3.value;
                                break;
                            }

                            switch (curPrivacyData.redirect)
                            {
                            case AccessRights.CCA_APP_PARTNER_ACCESS_NO_CALLDIV_STATE.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_NO_CALLDIV_STATE.value;
                                break;
                            case AccessRights.CCA_APP_PARTNER_ACCESS_CALLDIV_TARGET.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_CALLDIV_TARGET.value;
                                break;
                            }

                            switch (curPrivacyData.present)
                            {
                            case AccessRights.CCA_APP_PARTNER_ACCESS_NO_STATE_DURATION.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_ONLINE_STATE.value | AccessRights.CCA_APP_PARTNER_ACCESS_NO_STATE_DURATION.value;
                                break;
                            case AccessRights.CCA_APP_PARTNER_ACCESS_ONLINE_STATE.index:
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_ONLINE_STATE.value;
                                break;
                            }

                            if (curPrivacyData.callDuration)
                            {
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_NO_DURATION.value;
                            }

                            if (curPrivacyData.outgoingCall)
                            {
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_NO_OUTBOUND.value;
                            }

                            if (curPrivacyData.incomingCall)
                            {
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_OFFERING_ONLY.value;
                            }

                            if (curPrivacyData.callDiversion)
                            {
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_CALLDIVERSION.value;
                            }

                            if (curPrivacyData.pickup)
                            {
                                acl |= AccessRights.CCA_APP_PARTNER_ACCESS_PICKUP.value;
                            }
                            /*jslint bitwise: false */
                            resultData[resultData.length] = new www_caseris_de_CaesarSchema_PartnerAccessRight();
                            resultData[resultData.length - 1].setAcl(acl);
                            resultData[resultData.length - 1].setDisplayName(curPrivacyData.contactName);
                            resultData[resultData.length - 1].setId(curPrivacyData.contactId);
                            resultData[resultData.length - 1].setType(curPrivacyData.startType);
                        }

                        SESSION.setAccessRights(resultData, function (result)
                        {
                            console.log('Set AccessRights success!');
                            console.log(result);
                        }, function (error)
                        {
                            console.log('Set AccessRights failed!');
                            console.log(error);
                        });

                        console.log(rights);
                    },
                    testData: {
                        permissions: rights,
                        chatsForbidden: false
                    },
                    getGroups: function (successCallBack)
                    {
                        var self = this;
                        SESSION.getTenantGroups(undefined, function (result)
                        {
                            if (isValid(result.getTenantItems()))
                            {
                                self.myTenantGroups = result.getTenantItems();

                                for (var i = 0; i < self.myTenantGroups.length; i++)
                                {
                                    var curGroup = self.myTenantGroups[i];
                                    self.groups[self.groups.length] = {
                                        name: curGroup.getDisplayName(),
                                        id: curGroup.getObjectId()
                                    };
                                }

                                if (successCallBack)
                                {
                                    self.groups = self.groups.sort(function (it1, it2)
                                    {
                                        return it1.name.localeCompare(it2.name);
                                    });
                                    successCallBack(self.groups);
                                }
                            }

                            console.log('---------------- Get Tenant Groups success -----------------------');
                            console.log(result);
                        }, function (error)
                        {
                            console.log('---------------- Get Tenant Groups failed -----------------------');
                            console.log(error);
                        });
                    },
                    startPersonSearch: function (query, addressBook, matchFlag, matchType, callBackSuccess)
                    {
                        var self = this;
                       
                        SESSION.resolveName(query, addressBook, matchFlag, matchType, callBackSuccess,
                            DEFAULT_EXCEPTION_CALLBACK(LANGUAGE.getString("errorSearch"), function () {}, self));
                    }
                }));
            }, function (error)
            {
                console.log('GetAccessRights failed!');
                console.log(error);
            });
        }
    });