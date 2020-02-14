Ext.define('Action_Dial',
    {
        extend: 'Action_Call',
        
        run: function ()
        {
            var dialTargetParts = this.config.DialTarget.split(";");
            if (Ext.isEmpty(dialTargetParts))
            {
                return;
            }
            var ctiAction = Ext.create('CTIAction_Dial',
                {
                    
                });

            ctiAction.number = dialTargetParts[0];
            Ext.each(dialTargetParts, function (part)
            {
                var parts = part.split("=");
                if (parts[0] === "group")
                {
                    var nameOrId = parts[1];
                    if (Ext.isNumeric(nameOrId))
                    {
                        ctiAction.groupId = nameOrId;
                    }
                    else
                    {
                        var group = CURRENT_STATE_CONTACT_CENTER.getGroupByName(nameOrId);
                        if (isValid(group))
                        {
                            ctiAction.groupId = group.getId();
                        }
                    }
                }
                if (parts[0] === "nojournal")
                {
                    ctiAction.number = 'p' + ctiAction.number;
                }
            });

            this.resolveOrRun(ctiAction);
        }
    });