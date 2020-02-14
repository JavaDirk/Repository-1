Ext.define('PartnerBoard.GroupPanel_Tenant',
{
    extend: 'PartnerBoard.BaseGroupPanel',

    onAddedByUser: function()
    {
        this.addTenantGroup(this.group);
    },

    addTenantItems: function (tenantItems)
    {
        var numberUpdatedPartners = 0;
        var updatedPartners = [];
        var self = this;
        Ext.each(tenantItems, function (tenantItem, index)
        {
            var newPartner = self.convertTenantItemToPartner(tenantItem);
            newPartner.setPosition(index);
            
            SESSION.updatePartner(newPartner, function (result)
            {
                newPartner.setId(result.getPartnerId());

                updatedPartners.push(newPartner);

                var callBackFunction = function ()
                {
                    if (numberUpdatedPartners < updatedPartners.length - 1)
                    {
                        numberUpdatedPartners++;
                    }
                    else
                    {
                        self.addToMemberList(updatedPartners);

                        self.redrawAllTiles();
                    }
                };

                if (isValidString(newPartner.getGuid()))
                {
                    SESSION.getContactByGuid(newPartner.getGuid(), function (result)
                    {
                        newPartner.setContact(result.getContact());
                        callBackFunction();
                    }, function (error) { });
                }
                else
                {
                    newPartner.setContact(self.convertPartnerToContact(newPartner));
                    callBackFunction();
                }
            }, function (error)
            {
                
            });
        });
    },

    convertTenantItemToPartner: function (tenantItem)
    {
        var newPartner = new www_caseris_de_CaesarSchema_Partner();
        newPartner.setName(tenantItem.getDisplayName());
        newPartner.setLabel(tenantItem.getLastName());
        newPartner.setGroupId(this.group.getId());
        newPartner.setIdentifier("Dn");

        if (isValid(tenantItem.getGuid()))
        {
            newPartner.setGuid(tenantItem.getGuid());
            newPartner.setIdentifier("Guid");
        }

        newPartner.setEntryId(tenantItem.getObjectId());
        newPartner.setSource(SOURCE_APPLICATION);
        return newPartner;
    },

    addTenantGroup: function (partnerlistGroup)
    {
        var self = this;

        SESSION.updateGroup(partnerlistGroup, function (result)
        {
            partnerlistGroup.setId(result.getGroupId());

            SESSION.getTenantGroupMembers(partnerlistGroup.tenantId, '', function (result)
            {
                if (result.getReturnValue().getCode() === 0)
                {
                    if (isValid(result, "getTenantItems()"))
                    {
                        self.addTenantItems(result.getTenantItems());
                    }
                }
                else
                {
                    self.showError(result.getReturnValue().getDescription());
                }
                
            }, function ()
            {
                self.showError(LANGUAGE.getString("errorGetTenantGroupMembers"));
            });

        }, function ()
        {
            return;
        });
    },

    initializeGroup: function ()
    {

    }
});