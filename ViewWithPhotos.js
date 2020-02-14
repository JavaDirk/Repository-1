Ext.define('ViewWithPhotos',
{
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.ViewWithPhotos',

    showPresenceState: true, 
    showAgentState: ShowAgentState.showByClientSettings,
    photoSize: PhotoSizes.Default,
    
    init: function (cmp)
    {
        this.setCmp(cmp);

        var self = this;

        //Jetzt alle Event-Handler, die ein Photo adden
        //die Referenz des erzeugten Photos wird an den node gehängt (node.photo), damit es später destroyed werden kann
        cmp.on('itemupdate', function (record, index, node, view)
        {
            node.photo = null;
            self.insertPhotoInTemplate(node, CLASS_CONTACT_PHOTO, record.data.contact);
        });
        cmp.on('itemadd', function (records, index, nodes, view)
        {
            Ext.asap(function ()
            {
                Ext.each(records, function (record, i) {
                    var node = nodes[i];
                    self.insertPhotoInTemplate(node, CLASS_CONTACT_PHOTO, record.data.contact);
                });
            }, this); 
        });
        cmp.on('refresh', function (view)
        {
            Ext.asap(function ()
            {
                if (view.destroyed)
                {
                    return;
                }
                var nodes = view.getNodes();
                Ext.each(nodes, function (node)
                {
                    var record = view.getRecord(node);
                    if (!isValid(record, "data"))
                    {
                        console.error("ViewWithPhotos:refresh-event: Could not get record for node!", node, view);
                        return;
                    }
                    self.insertPhotoInTemplate(node, CLASS_CONTACT_PHOTO, record.data.contact);
                });
            }, this);
        });

        //Jetzt alle, die das Photo wieder entfernen, gäbe sonst Memory Leaks, weil die Photos in den Listenern der SESSION stecken
        cmp.on('itemremove', function (records, index, items)
        {
            Ext.each(items, self.destroyPhoto);
        });

        cmp.on('beforedestroy', function (records, index, items)
        {
            var nodes = self.cmp.getNodes();
            Ext.each(nodes, self.destroyPhoto);
        });
    },
    
    insertPhotoInTemplate: function (node, className, contact)
    {
        if (!isValid(node) || isValid(node, "photo") || this.destroyed)
        {
            return;
        }

        var record = this.cmp.getRecord(node);
        if (!isValid(record) || record.data.ignore || record.data.waitMessage)
        {
            return;
        }
        var photoNode;
        if (isValid(className))
        {
            photoNode = node.querySelector("." + className);
            if (!isValid(photoNode))
            {
                return;
            }
        }
        else
        {
            return;
        }
        
        node.photo = this.createPhoto(record, photoNode);
    },

    createPhoto: function()
    {
        return null;
    },

    createPhotoConfig: function ()
    {
        return {
            showPresenceState: this.showPresenceState,
            showAgentState: this.showAgentState,
            size: this.photoSize
        };
    },
    
    destroyPhoto: function (node)
    {
        if (isValid(node.photo))
        {
            node.photo.destroy();
        }
    },

    removeAll: function ()
    {
        var nodes = this.getNodes();
        Ext.each(nodes, this.destroyPhoto);

        this.callParent(arguments);
    }
});

Ext.define('ContactViewWithPhotos',
{
    extend: 'ViewWithPhotos',
    alias: 'plugin.ContactViewWithPhotos',

    createPhoto: function (record, photoNode, photoConfig) {
        var config =
        {
            renderTo: photoNode,
            contact: isValid(record, "data.contact") ? record.data.contact : record.data
        };
        if (config.contact && config.contact.typeMarker !== "www_caseris_de_CaesarSchema_Contact")
        {
            return;
        }
        config = Ext.apply(config, this.createPhotoConfig());
        return Ext.create('Photo', config);
    }
    });

Ext.define('LiveChatViewWithPhotos',
    {
        extend: 'ViewWithPhotos',
        alias: 'plugin.LiveChatViewWithPhotos',

        createPhoto: function (record, photoNode)
        {
            
            var config =
                {
                    renderTo: photoNode,
                    contact: isValid(record, "data.contact") ? record.data.contact : record.data,
                    showPresenceState: false,
                    showAgentState: ShowAgentState.showNever
                };
            return Ext.create('Photo', config);
        }
    });

Ext.define('WhatsAppViewWithPhotos',
    {
        extend: 'LiveChatViewWithPhotos',
        alias: 'plugin.WhatsAppViewWithPhotos',

        createPhoto: function (record, photoNode)
        {
            if (record.data.outgoing)
            {
                return this.callParent(arguments);
            }
            else
            {
                var config =
                {
                    renderTo: photoNode,
                    contact: isValid(record, "data.contact") ? record.data.contact : record.data
                };
                return Ext.create('WhatsAppImage', config);
            }
        }
    });

Ext.define('LiveChatOverviewWithPhotos',
    {
        extend: 'LiveChatViewWithPhotos',
        alias: 'plugin.LiveChatOverviewWithPhotos',

        createPhoto: function (record, photoNode)
        {
            if (record.data.isWhatsApp)
            {
                var config =
                {
                    renderTo: photoNode,
                    contact: isValid(record, "data.contact") ? record.data.contact : record.data
                };
                return Ext.create('WhatsAppImage', config);
            }
            return this.callParent(arguments);
        }
    });


Ext.define('GridViewWithPhotos',
{
    extend: 'ViewWithPhotos',
    alias: 'plugin.GridViewWithPhotos',

    createPhoto: function (record, photoNode)
    {
        if (isValid(record, 'data.curWorkingAgent'))
        {
            var config =
            {
                renderTo: photoNode,
                contact: isValid(record, "data.curWorkingAgent") ? record.data.curWorkingAgent : record.data
            };

            return Ext.create('OnlyStatesPhoto', config);
        }

        return null;
    }
});

Ext.define('TeamChatViewWithPhotos',
{
    extend: 'ViewWithPhotos',
    alias: 'plugin.TeamChatViewWithPhotos',

    createPhoto: function (record, photoNode) {
        var config =
        {
            renderTo: photoNode,
            teamChat: record.data
        };
        config = Ext.apply(config, this.createPhotoConfig());
        return Ext.create('TeamChatFoto', config);
    }
});

Ext.define('JournalViewWithPhotos',
{
    extend: 'ViewWithPhotos',
    alias: 'plugin.JournalViewWithPhotos',

    createPhoto: function (record, photoNode)
    {
        var config =
        {
            renderTo: photoNode,
            contact: this.getContact(record)
        };
        config = Ext.apply(config, this.createPhotoConfig(record));
        return Ext.create('Photo', config);
    },

    createPhotoConfig: function (record)
    {
        var photoConfig = this.callParent();
        photoConfig.avatarImageName = getImageNameForNumber(this.getContact(record), this.getNumber(record), "phone_small");
        return photoConfig;
    },

    getContact: function (record)
    {
        return record.data.getContactForPhoto();
    },

    getNumber: function (record)
    {
        return record.data.getNumber();
    }
});

Ext.define('JournalViewWithPhotosForWelcomePage',
{
    extend: 'JournalViewWithPhotos',
    alias: 'plugin.JournalViewWithPhotosForWelcomePage',

    getContact: function (record)
    {
        if (isValid(record, "data.entry.getContactForPhoto"))
        {
            return record.data.entry.getContactForPhoto();
        }
        if (isValid(record, "data.entry.getContact"))
        {
            return record.data.entry.getContact();
        }
        return null;
    },

    getNumber: function (record)
    {
        if (isValid(record, "data.getNumber"))
        {
            return record.data.getNumber();
        }
        return "";
    }
});

