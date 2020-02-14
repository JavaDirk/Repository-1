/* 
 * Anzeige der E-Mail-Kopfdaten
 * headerData = {sender, receiver, subject, mailId, date, isRequest, mailType, mailState}
*/
Ext.define('EmailHeaderRequestFrame',
{
    extend: 'Ext.Component',

    headerData: undefined,

    margin: '10 0 0 0',

    parentElementCls: 'headerContainer',

    emailDateFormat: "large",

    cls: 'selectable',

    listeners:
    {
        afterrender: function (me)
        {
            if (me.noContextMenuHandler)
            {
                return;
            }

            me.el.dom.addEventListener('contextmenu', function (item)
            {
                var curEmail = me.email;
                var emailDirection = curEmail.emailDirection;
                var emailState = curEmail.state;
                var neededContact = curEmail.sender;
                var userAttributes = '';

                var isOutbound = emailDirection === EmailDirection.Outbound.value;
                if (curEmail.type === MailType.Query.value)
                {
                    isOutbound = curEmail.state !== "Reply3rdParty";
                }

                if (curEmail.type === MailType.Copy.value)
                {
                    isOutbound = true;
                }

                var emailAddress = me.getFullSenderEmailAddress();

                var getUserAttributes = function (contact)
                {
                    var userAttributes = '';

                    if (isValid(contact, 'getAdditionalAttributes()'))
                    {
                        var attributes = contact.getAdditionalAttributes();

                        Ext.each(attributes, function (attribute)
                        {
                            if (isValid(attribute, 'getValues()'))
                            {
                                var attributeValues = attribute.getValues();

                                Ext.each(attributeValues, function (attributeValue)
                                {
                                    userAttributes += attributeValue;
                                });
                            }
                        });
                    }

                    return userAttributes;
                };

                createContextMenu = function (contact)
                {
                    var insertItems = [];
                    if (isValidString(emailAddress))
                    {
                        insertItems.push({
                            text: LANGUAGE.getString('copyEmailAddress'),
                            handler: function ()
                            {
                                me.setClipBoardText(emailAddress);
                            }
                        });
                    }
                    var additionalAttributes = contact.getAdditionalAttributes ? contact.getAdditionalAttributes() : [];
                    if (!Ext.isEmpty(additionalAttributes))
                    {
                        var handler;
                        var subMenu;
                        if (additionalAttributes.length === 1)
                        {
                            var values = additionalAttributes[0].getValues();
                            handler = function ()
                            {
                                me.setClipBoardText(values.join());
                            };
                        }
                        else
                        {
                            var subMenuItems = Ext.Array.map(additionalAttributes, function (attribute)
                            {
                                return {
                                    text: attribute.getKey(),
                                    handler: function ()
                                    {
                                        me.setClipBoardText(attribute.getValues().join());
                                    }
                                }
                            }, this);
                            subMenu = new CustomMenu(
                                {
                                    insertItems: subMenuItems
                                });
                        }
                        insertItems.push(
                        {
                            text: additionalAttributes.length === 1 ? LANGUAGE.getString("copyAttribute", additionalAttributes[0].getKey()) : LANGUAGE.getString('copyAdditionalInformation'),
                            handler: handler,
                            menu: subMenu
                        });
                    }
                    if (Ext.isEmpty(insertItems))
                    {
                        return;
                    }

                    var menu = new CustomMenu(
                    {
                        insertItems: insertItems
                    });

                    menu.showAt(item.clientX, item.clientY);

                    return menu;
                };


                if (emailState === LANGUAGE.getString('message'))
                {
                    return;
                }

                if (isOutbound)
                {
                    neededContact = curEmail.receivers[0];
                    emailAddress = me.getFullReceiverHeaderName(0);
                }
                
                var storageId = '';
                var entryId = '';

                if (neededContact)
                {
                    storageId = neededContact.getStorageId();
                    entryId = neededContact.getEntryId();
                }
                

                if (isValidString(storageId) || isValidString(entryId))
                {
                    SESSION.getContactByObject(entryId, storageId, function (result)
                    {
                        me.shortCopyMenu = createContextMenu(result.getContact());
                    });
                }
                else
                {
                    me.shortCopyMenu = createContextMenu(neededContact);
                }
                
            });
        }
    },

    initComponent: function ()
    {
        this.responsiveConfig =
            {
                small:
                {
                    emailDateFormat: 'small'
                },
                large:
                {
                    emailDateFormat: 'large'
                }
            };
        this.callParent();

        this.on('boxready', function ()
        {
            this.updateTemplateAndHeader(this.headerData, this.email);
        }, this);
    },

    onUpdatedTemplate: function ()
    {
        var me = this;
        me.senderField = document.querySelector('#' + me.getId() + ' .emailHeaderSenderValue');
        me.receiverFields = document.querySelectorAll('#' + me.getId() + ' .emailHeaderReceiverValue');
        if (!Ext.isEmpty(me.receiverFields))
        {
            me.receiverField = me.receiverFields[0];
        }
        
        me.ccLabelItem = document.querySelector('#' + me.getId() + ' .ccLabelItem'); 
        me.ccFields = document.querySelectorAll('#' + me.getId() + ' .emailHeaderCCValue');
        me.bccLabelItem = document.querySelector('#' + me.getId() + ' .bccLabelItem'); 
        me.bccFields = document.querySelectorAll('#' + me.getId() + ' .emailHeaderBCCValue');
        //me.dateField = document.querySelector('#' + me.getId() + ' .emailHeaderDateValue');
        me.subjectField = document.querySelector('#' + me.getId() + ' .emailHeaderSubjectValue');
        me.userInformationContainer = document.querySelector('#' + me.getId() + ' .userInformationBox');
        me.dateField = document.querySelector('#' + me.getId() + ' .emailCreatedDate');
        if (me.dateField)
        {
            me.dateField.style.display = me.isCourseButtonRequired() ? "flex" : 'none';
        }
        
        me.placeholderForCourseButton = document.querySelector('#' + me.getId() + ' .placeholderForCourseButton');

        Ext.create('ThinButton',
        {
            renderTo: me.placeholderForCourseButton,
            icon: 'images/64/process.png',
            hidden: !me.isCourseButtonRequired(),
            tooltip: LANGUAGE.getString("showCourse"),
            handler: function ()
            {
                me.showCourse();
            }
        });
        me.addClickListernerForHeader();

        if (me.receiverField && me.receiverField.tagName === 'INPUT')
        {
            setTimeout(function ()
            {
                me.receiverField.focus();
            });
        }
    },

    showCourse: function ()
    {
        var courseComponent = new Ext.Component(
        {
            title: LANGUAGE.getString('course').toUpperCase() + ' - ' + this.email.shortId,
            closable: true,
            border: false,

            flex: 1,
            width: '100%',
            height: '100%',
            html: '<iframe style="border: none;width: 100%; height: 100%" src="' + this.email.historyUrl + '">'
        });

        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_createNewTab(courseComponent);
    },

    setClipBoardText: function (text)
    {
        var input = document.createElement('input');
        document.body.appendChild(input);

        input.value = text;
        input.select();

        document.execCommand("copy");

        document.body.removeChild(input);
    },

    getSenderEmail: function ()
    {
        return this.headerData.senderObject.getEmail() || this.headerData.sender;
    },

    getReceiverEmail: function ()
    {
        var emails = Ext.Array.pluck(this.headerData.receivers, "Email");
        return emails.join(", ");

        //return this.headerData.receiverObject.getEmail() || this.headerData.receiver;
    },

    getSubject: function ()
    {
        return this.headerData.subject || "";
    },

    addClickListernerForHeader: function ()
    {
        this.addTooltips();

        if (this.addAdditionalClickListener)
        {
            this.addAdditionalClickListener();
        }
        
    },

    closeAllTooltipsAndDestroyShortCopyMenu: function()
    {
        Ext.each(["senderTooltip", "receiverTooltip", "ccTooltip", "bccTooltip"], function (tooltip)
        {
            if (isValid(self[tooltip], 'xtype'))
            {
                self[tooltip] = self.hideTooltip(self[tooltip]);
            }
        });

        if (self.shortCopyMenu && !self.shortCopyMenu.destroyed)
        {
            self.shortCopyMenu.destroy();
            self.shortCopyMenu = undefined;
        }
    },


    addTooltips: function ()
    {
        if (!isValid(this.headerData))
        {
            return;
        }
        this.addTooltipsForSenderField(this.senderField, this.headerData.senderObject, "senderTooltip");
        this.addTooltipsForReceiverField(this.receiverFields, this.headerData.receivers, "receiverTooltip");
        this.addTooltipsForReceiverField(this.ccFields, this.getCCReceivers(), "ccTooltip");
        this.addTooltipsForReceiverField(this.bccFields, this.getBccReceivers(), "bccTooltip");
        
        /*this.userInformationContainer.addEventListener('mouseout', function ()
        {
            if (isValid(self, 'senderTooltip.xtype') && self.senderTooltip.xtype)
            {
                self.senderTooltip = self.hideTooltip(self.senderTooltip);
            }

            if (isValid(self, 'receiverTooltip.xtype') && self.receiverTooltip.xtype)
            {
                self.receiverTooltip = self.hideTooltip(self.receiverTooltip);
            }

        });*/

    },

    addTooltipsForSenderField: function (field, sender, memberNameForTooltip)
    {
        this.addTooltipsForField([field], [sender], memberNameForTooltip, false);
    },

    addTooltipsForReceiverField: function (fields, receivers, memberNameForTooltip)
    {
        this.addTooltipsForField(fields, receivers, memberNameForTooltip, true);
    },

    addTooltipsForField: function (fields, contacts, memberNameForTooltip, isReceiver)
    {
        if (!contacts)
        {
            return;
        }
        var self = this;
        Ext.each(fields, function (field, index)
        {
            var contact = contacts[index];
            if (!field)
            {
                return; 
            }
            field.addEventListener('mouseover', function ()
            {
                self.timeout = setTimeout(function ()
                {
                    self.closeAllTooltipsAndDestroyShortCopyMenu();

                    self[memberNameForTooltip] = self.createTooltip(field, contact, isReceiver, contact);
                }, TOOLTIP_SHOW_DELAY);
            });

            field.addEventListener('mouseout', function ()
            {
                clearTimeout(self.timeout);
            });
        });
    },

    hideTooltip: function (tooltip)
    {
        if (tooltip)
        {
            tooltip.hide();
            tooltip.destroy();
            tooltip = undefined;
        }

        return tooltip;
    },

    createTooltip: function (target, contact, isReceiver, name)
    {
        var curContact = new www_caseris_de_CaesarSchema_Contact();
        if (!contact.getName())
        {
            contact.setName(name);
        }

        if (!contact.getEmail())
        {
            contact.setEmail(name);
        }

        curContact.convertFromPhoneContact(contact);

        var tooltip = Ext.create('BusinessCardTooltipForEMailHeader',
        {
            target: target,
            showContact: contact,
            contact: curContact,
            email: this.email,
            isReceiver: isReceiver
        });

        return tooltip;
    },
    
    getFullSenderHeaderName: function (noCascade)
    {
        var fullSenderName = this.headerData.sender;

        return Ext.String.htmlEncode(fullSenderName);
    },

    getFullReceiverHeaderName: function (index)
    {
        var receiver = this.headerData.receivers[index];
        if (receiver)
        {
            if (this.headerData.receivers.length === 1 && isValid(CURRENT_STATE_CONTACT_CENTER.getGroupByEMail(receiver.getEmail())))
            {
                return Ext.String.htmlEncode(receiver.getName());
            }
            return Ext.String.htmlEncode(receiver.getEmail());
        }
        return this.headerData.receiver;
    },

    getFullSenderEmailAddress: function ()
    {
        if (isValid(this.headerData, 'senderObject.getEmail()')) 
        {
            return this.headerData.senderObject.getEmail();
        }

        return this.headerData.sender;
    },

    getCC: function ()
    {
        return this.headerData.CC;
    },

    getCCReceivers: function ()
    {
        return this.getReceivers('ccReceivers');
    },

    getBCC: function ()
    {
        return this.headerData.BCC;
    },

    getBccReceivers: function ()
    {
        return this.getReceivers('bccReceivers');
    },

    getReceivers: function (attributeName)
    {
        attributeName = attributeName || 'receivers';
        if (isValid(this.headerData))
        {
            return this.headerData[attributeName] || [];
        }
        return [];
    },

    updateTemplateAndHeader: function (headerData, email)
    {
        if (!headerData && !email)
        {
            return;
        }
        this.headerData = headerData;
        this.email = email;

        this.update(this.createTemplate(), false, () =>
        {
            this.onUpdatedTemplate();
            this.updateHeader();
        });
    },

    updateHeader: function ()
    {
        if (!isValid(this, 'senderField.innerHTML'))
        {
            return;
        }

        this.senderField.innerHTML = this.getFullSenderHeaderName();
        Ext.each(this.receiverFields, function (receiverField, index)
        {
            receiverField.innerHTML = this.getFullReceiverHeaderName(index);
        }, this);

        var ccReceivers = this.getCCReceivers();
        if (Ext.isEmpty(ccReceivers))
        {
            this.ccLabelItem.parentNode.style.display = 'none';
        }
        else
        {
            this.ccLabelItem.parentNode.style.display = 'flex';
            Ext.each(this.ccFields, function (ccField, index)
            {
                ccField.innerHTML = Ext.String.htmlEncode(ccReceivers[index].getEmail());
            }, this);    
        }
        
        var bccReceivers = this.getBccReceivers();
        if (Ext.isEmpty(bccReceivers))
        {
            this.bccLabelItem.parentNode.style.display = 'none';
        }
        else
        {
            this.bccLabelItem.parentNode.style.display = 'flex';
            Ext.each(this.bccFields, function (bccField, index)
            {
                bccField.innerHTML = Ext.String.htmlEncode(bccReceivers[index].getEmail());
            }, this);
        }

        //this.dateField.innerHTML = this.headerData.date;
        this.subjectField.innerHTML = Ext.String.htmlEncode(this.getSubject());
    },

    createTemplate: function ()
    {
        var template = 
            '<div class="' + this.parentElementCls + ' hBoxLayout flexItem smallMarginBottom">' +
               '<div class="vBoxLayout flexItem userInformationBox">' +
                   '<div class="hBoxLayout">' +
                       '<label class="labelItem doNotResize">' + LANGUAGE.getString('from') + ':</label>' +
                       '<label class="valueItem clickItem emailHeaderSenderValue doNotResize"></label>' +
                        '<div class="flexItem"></div>' +
                        this.createTemplateFragmentForFirstLine() + 
                   '</div>' +
                   
                    this.createTemplateForReceivers(this.getReceivers(), "", LANGUAGE.getString('sendTo'), "emailHeaderReceiverValue") +
                    this.createTemplateForReceivers(this.getCCReceivers(), "ccLabelItem", LANGUAGE.getString('CC'), "emailHeaderCCValue") +
                    this.createTemplateForReceivers(this.getBccReceivers(), "bccLabelItem", LANGUAGE.getString('BCC'), "emailHeaderBCCValue") +
                            
                   '<div class="hBoxLayout">' +
                       '<label class="labelItem doNotResize">' + LANGUAGE.getString("subject") + ':</label>' +
                        '<label class="valueItem emailHeaderSubjectValue doNotResize eclipsedText flexItem subjectItem" style=""></label>' +
                        '<div class="placeholderForCourseButton"></div>' +
                        '<label class="valueItem emailCreatedDate doNotResize" style="margin-top:2px;font-size:' + FONT_SIZE_TEXT + 'px;color:' + COLOR_MAIN_GREY + '">' + this.getEmailDate() + '</label>' +
                   '</div>' +
               '</div>' +
            '</div>';

        return template;
    },

    getEmailDate: function ()
    {
        if (isValid(this, "email.date"))
        {
            return formatDateForEmail(new Date(this.email.date), this.emailDateFormat);
        }
        return '';
    },

    setEmailDateFormat: function (format)
    {
        this.emailDateFormat = format;

        if (isValid(this, "email.date") && this.dateField)
        {
            var dateString = formatDateForEmail(new Date(this.email.date), format);
            this.dateField.innerHTML = dateString;
        }
    },

    isCourseButtonRequired: function ()
    {
        return true;
    },

    createTemplateFragmentForFirstLine: function ()
    {
        return "";
    },

    createTemplateForReceivers: function (receivers, labelCls, labelText, valueCls)
    {
        var separator = '<div style="margin-left:1px;color:grey;font-weight:500">;</div>';

        var template = '<div class="hBoxLayout">' +
                        '<label class="labelItem doNotResize ' +  labelCls + '">' + labelText + ':</label>';
        for (var j = 0; j < receivers.length; j++)
        {
            if (j !== 0)
            {
                template += separator;
            }
            template += '<label class="eclipsedText valueItem doNotResize clickItem ' + valueCls + '" ></label>';
        }
        template += '</div>';
        return template;
    },

    getGroupIdForReceiver: function ()
    {
        return -1;
    },

    getAgentIdForReceiver: function ()
    {
        return -1;
    }
});

Ext.define('EmailHeaderCustomerReplyFrame',
{
    extend: 'EmailHeaderRequestFrame',
    
    updateHeader: function (headerData, email)
    {
        this.senderField.innerHTML = this.getFullSenderHeaderName();
        this.receiverField.innerHTML = this.getFullReceiverHeaderName();
        this.subjectField.innerHTML = Ext.String.htmlEncode(this.getSubject());
    },

    createTemplate: function ()
    {
        var template =
            '<div class="headerContainer hBoxLayout flexItem smallMarginBottom">' +
                '<div class="vBoxLayout flexItem userInformationBox">' +
                    '<div class="hBoxLayout">' +
                        '<label class="labelItem">' + LANGUAGE.getString('from') + ':</label>' +
                        '<label class="valueItem clickItem emailHeaderSenderValue"></label>' +
                    '</div>' +
                    '<div class="hBoxLayout">' +
                        '<label class="labelItem">' + LANGUAGE.getString('sendTo') + ':</label>' +
                        '<label class="valueItem clickItem emailHeaderReceiverValue"></label>' +
                    '</div>' +
                    '<div class="hBoxLayout">' +
                        '<label class="labelItem">' + LANGUAGE.getString("subject") + ':</label>' +
                        '<label class="valueItem emailHeaderSubjectValue eclipsedText flexItem"></label>' +
                    '</div>' +
                '</div>' +
            '</div>';

        return template;
    }
});

Ext.define('EmailHeaderForMerge',
{
    extend: 'EmailHeaderRequestFrame',

    margin: '0',

    parentContainer: undefined,

    noContextMenuHandler: true,

    isSelectable: true,

    parentElementCls: 'headerContainer mergeContainerResult',

    colorizeMainDivContainer: function (color)
    {
        var lastSelectedContainer = document.querySelector('#' + this.parentContainer.getId() + ' .mergeContainerSelected');

        if (lastSelectedContainer)
        {
            lastSelectedContainer.classList.remove('mergeContainerSelected');
        }
        
        var mainContainer = document.querySelector('#' + this.getId() + ' .mergeContainerResult');
        mainContainer.classList.add('mergeContainerSelected');

        this.parentContainer.selectedEmail = this.email; 
    },

    listeners:
    {
        el:
        {
            click: function (me)
            {
                me = Ext.getCmp(me.currentTarget.id);

                if (me.isSelectable)
                {
                    me.colorizeMainDivContainer();
                }
                
            }
        }
    },

    updateHeader: function (headerData, email)
    {
        this.callParent(arguments);

        var ticketLabel = document.querySelector('#' + this.getId() + ' .emailHeaderIdValue');
        ticketLabel.innerHTML = this.headerData.shortId;
    },

    onUpdatedTemplate: function ()
    {
        this.callParent(arguments);

        this.dateField.style.display = 'none';
        

        this.placeholderForCourseButton.style.display = 'none';
    },

    createTemplateFragmentForFirstLine: function ()
    {
        return '<label class="doNotResize">' + LANGUAGE.getString('id') + ':</label>' +
            '<label class="valueItem emailHeaderIdValue doNotResize"></label>';
    }
});

Ext.define('EmailHeaderForNewTicket',
{
    extend: 'EmailHeaderRequestFrame',

    initComponent: function ()
    {
        this.callParent();

        this.on('boxready', function ()
        {
            this.onNewGroupChosen();
        }, this);
    },

    onNewGroupChosen: function ()
    {
        var selectedGroupId = this.getGroupIdForReceiver();
        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_newGroupChosenForNewTicket(selectedGroupId);
    },
    
    updateHeader: function (headerData, email) 
    {
        this.senderField.value = this.headerData.sender || '';
        this.subjectField.value = this.getSubject();
    },
    
    addTooltips: function ()
    {
        return;
    },
    
    createTemplate: function ()
    {
        var template =
            '<div class="headerContainer hBoxLayout flexItem smallMarginBottom">' +
                '<div class="vBoxLayout flexItem userInformationBox">' +
                    '<div class="hBoxLayout smallMarginBottom">' +
                    '<label class="labelItem">' + LANGUAGE.getString("from") + ':</label>' +
                    '<input type="text" style="height: 21px;" class="emailHeaderSenderValue flexItem smallMarginLeft" placeholder="' + LANGUAGE.getString('chooseTicketSender') + '" />' +
                    '<img class="smtpContactButton imageButton smallImageButton noBorderLeft pointer" src="' + IMAGE_LIBRARY.getImage('user', 64, NEW_GREY) + '" title="' + LANGUAGE.getString('chooseContact') + '" />' +
                    '</div>' +
                    '<div class="hBoxLayout smallMarginBottom">' +
                        '<label class="labelItem">' + LANGUAGE.getString('sendTo') + ':</label>' +
                        '<select class="smallMarginLeft emailHeaderReceiverValue flexItem" style="height: 21px;cursor:pointer">' +
                            this.getMailGroups() +
                        '</select>' +
                    '</div>' +
                    '<div class="hBoxLayout">' +
                        '<label class="labelItem">' + LANGUAGE.getString("subject") + ':</label>' +
            '<input type="text" class="emailHeaderSubjectValue flexItem smallMarginLeft eclipsedText" placeholder="' + LANGUAGE.getString('subject') + '" />' +
                    '</div>' +
                '</div>' +
            '</div>';
    
        return template;
    },
    
    getMailGroups: function ()
    {
        var options = '';
        
        Ext.iterate(CURRENT_STATE_CONTACT_CENTER.getAllMailGroupsForNewTicket(), function (groupId, group)
        {
            var name = group.getName();
            options += '<option data-mail="' + group.getMailAddress() + '" data-agentid="-1" data-groupid="' + parseInt(groupId, 10) + '">' + Ext.String.htmlEncode(name) + '</option>';
        });
    
        return options;
    },

    addAdditionalClickListener: function ()
    {
        var self = this;

        this.receiverField.addEventListener('change', function ()
        {
            self.onNewGroupChosen();
        });
    
        var contactButton = document.querySelector('#' + this.getId() + ' .smtpContactButton');
        contactButton.addEventListener('click', function ()
        {
            var saveFunction = function (target, contact)
            {
                self.senderField.value = '"' + contact.getFullName() +  '" <' + contact.getEMail() + '>';
            };

            GLOBAL_EVENT_QUEUE.onGlobalEvent_SearchContact(saveFunction, true);
        });
    },

    getSenderEmail: function ()
    {
        return this.senderField.value;
    },

    getReceiverEmail: function ()
    {
        return this.getSelectedReceiverDataset().mail;
    },

    getSubject: function ()
    {
        return this.subjectField.value;
    },

    getGroupIdForReceiver: function ()
    {
        return this.getSelectedReceiverDataset().groupid;
    },

    getAgentIdForReceiver: function ()
    {
        return this.getSelectedReceiverDataset().agentid;
    },

    getSelectedReceiverDataset: function ()
    {
        var selectedOptions = this.receiverField.options[this.receiverField.selectedIndex];
        if (selectedOptions)
        {
            return selectedOptions.dataset;
        }
        return null;
    }
});

Ext.define('EmailHeader3rdReplyFrame',
{
    extend: 'EmailHeaderRequestFrame',

    addTooltips: function ()
    {
        this.addTooltipsForSenderField(this.senderField, this.headerData.senderObject, "senderTooltip");
    },

    getSubject: function ()
    {
        return this.subjectField.value;
    },

    getReceiverEmail: function ()
    {
        return this.receiverField.value;
    },

    updateHeader: function (headerData, email)
    {
        this.senderField.innerHTML = this.getFullSenderHeaderName();
        this.receiverField.value = this.headerData.receiver;
        this.subjectField.value = Ext.String.htmlEncode(this.headerData.subject || "");
    },

    createTemplate: function ()
    {
        var template =
            '<div class="headerContainer hBoxLayout flexItem smallMarginBottom">' +
                '<div class="vBoxLayout flexItem userInformationBox">' +
                    '<div class="hBoxLayout smallMarginBottom">' +
                        '<label class="labelItem">' + LANGUAGE.getString('from') + ':</label>' +
                        '<label class="valueItem clickItem emailHeaderSenderValue"></label>' +
                        '<label class="noDisplay" style="color:' + DARKER_GREY + ';margin:0 5px 0 10px;">' + LANGUAGE.getString('at').toLowerCase() + ':</label>' +
                        '<label class="valueItem emailHeaderDateValue noDisplay"></label>' +
                    '</div>' +
                    '<div class="hBoxLayout flexItem smallMarginBottom">' +
                        '<label class="labelItem">' + LANGUAGE.getString('sendTo') + ':</label>' +
                        '<input type="text" class="emailHeaderReceiverValue flexItem smallMarginLeft" />' +
                        '<img class="receiverContactButton imageButton mediumImageButton noBorderLeft pointer" src="' + IMAGE_LIBRARY.getImage('user', 64, NEW_GREY) + '" title="' + LANGUAGE.getString('chooseContact') + '" />' +
                    '</div>' +
                    '<div class="hBoxLayout flexItem">' +
                        '<label class="labelItem">' + LANGUAGE.getString("subject") + ':</label>' +
                        '<input type="text" class="emailHeaderSubjectValue flexItem smallMarginLeft eclipsedText " />' +
                    '</div>' +
                '</div>' +
            '</div>';
    
        return template;
    },

    addAdditionalClickListener: function ()
    {
        var self = this;

        var contactButton = document.querySelector('#' + this.getId() + ' .receiverContactButton');

        contactButton.addEventListener('click', function ()
        {
            var saveFunction = function (target, contact)
            {
                if (isValidString(self.receiverField.value))
                {
                    self.receiverField.value += "; ";
                }
                self.receiverField.value += '"' + contact.getFullName() + '" <' + contact.getEMail() + '>';
            };

            GLOBAL_EVENT_QUEUE.onGlobalEvent_SearchContact(saveFunction, true);
        });
    }
});

Ext.define('EmailHeaderSplitTicketFrame',
{
    extend: 'EmailHeaderRequestFrame',

    addTooltips: function ()
    {
        this.addTooltipsForSenderField(this.senderField, this.headerData.senderObject, "senderTooltip");
    },

    getReceiverEmail: function ()
    {
        var dataset = this.getSelectedReceiverDataset();
        if (isValid(dataset))
        {
            return dataset.mail;
        }
        return '';  
    },

    getSelectedReceiverDataset: function ()
    {
        var selectedOptions = this.receiverField.options[this.receiverField.selectedIndex];
        if (selectedOptions)
        {
            return selectedOptions.dataset;
        }
        return null;
    },

    getSubject: function ()
    {
        return this.subjectField.value;
    },
    
    updateHeader: function (headerData, email)
    {
        this.senderField.innerHTML = this.getFullSenderHeaderName();
        this.subjectField.value = Ext.String.htmlEncode(this.headerData.subject || "");
    },

    createReceiverOptions: function ()
    {
        var group = CURRENT_STATE_CONTACT_CENTER.Groups[this.headerData.groupId];

        var myAgentId = CURRENT_STATE_CONTACT_CENTER.getMyAgentId();
        var options = '<option selected data-mail="' + MY_CONTACT.getEMail() + '" data-agentid="' + myAgentId + '" data-groupid="-1">' + Ext.String.htmlEncode(MY_CONTACT.getFullName()) + '</option>';

        if (isValid(group, 'getMailDistributionGroupIds()'))
        {
            var groupIds = group.getMailDistributionGroupIds();

            Ext.iterate(groupIds, function (groupId)
            {
                var group = CURRENT_STATE_CONTACT_CENTER.getGroup(groupId) || CURRENT_STATE_CONTACT_CENTER.getGroupDescription(groupId);
                if (group && isValidString(group.getMailAddress()))
                {
                    options += '<option data-mail="' + group.getMailAddress() + '" data-agentid="-1" data-groupid="' + groupId + '" >' + Ext.String.htmlEncode(group.getName()) + '</option > ';
                }
            });
        }

        return options;
    },

    createTemplate: function ()
    {
        var template =
            '<div class="headerContainer hBoxLayout flexItem smallMarginBottom">' +
                '<div class="vBoxLayout flexItem userInformationBox">' +
                    '<div class="hBoxLayout smallMarginBottom">' +
                        '<label class="labelItem">' + LANGUAGE.getString('from') + ':</label>' +
                        '<label class="valueItem clickItem emailHeaderSenderValue"></label>' +
                    '</div>' +
                    '<div class="hBoxLayout flexItem smallMarginBottom">' +
                        '<label class="labelItem">' + LANGUAGE.getString('sendTo') + ':</label>' +
                        '<select class="emailHeaderReceiverValue flexItem smallMarginLeft">' + this.createReceiverOptions() + '</select>' +
                    '</div>' +
                    '<div class="hBoxLayout flexItem">' +
                        '<label class="labelItem">' + LANGUAGE.getString("subject") + ':</label>' +
                        '<input type="text" class="emailHeaderSubjectValue flexItem smallMarginLeft eclipsedText" />' +
                    '</div>' +
                '</div>' +
            '</div>';
    
        return template;
    },

    getGroupIdForReceiver: function ()
    {
        var dataset = this.getSelectedReceiverDataset();
        return dataset.groupid;
    },

    getAgentIdForReceiver: function ()
    {
        var dataset = this.getSelectedReceiverDataset();
        return dataset.agentid;
    }
});

