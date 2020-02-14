Ext.define('RequestBubble',
{
    extend: 'Ext.Component',

    margin: '2 0 5 0',
    style: 'display:flex',
        
    initComponent: function ()
    {
        this.html = this.createHtmlForBubble();
        this.callParent();
    },

    createHtmlForBubble: function ()
    {
        return createRequestBubble(this.email, 0, false, 'requestBubble');
    },

    updateRequestBubble: function ()
    {
        this.setHtml(this.createHtmlForBubble());
    },

    updateEmail: function (email)
    {
        this.email = email;
        this.updateRequestBubble();
    }
});

var CUR_ATTACHMENT_ID = 0;
// Ein Container der die gesamte E-Mail-Übersicht hält
Ext.define('EmailOverviewPanel', 
{
    extend: 'Ext.Panel',

    email: undefined, // Die momentan ausgewählte Anfrage / E-Mail

    requestOverview: undefined, // Liste der Anfragen

    emailContainer: undefined, // Container der die Anhänge, Kopfdaten und E-Mailanzeige beinhaltet

    store: undefined,

    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    closable: true,

    border: false,

    flex: 1,

    listeners:
    {
        beforeclose: function (me)
        {
            me.tab.hide();
        },
        destroy: function (me)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(me);
        }
    },

    initComponent: function ()
    {
        this.callParent();

        var splitterPositions = this.getFlexForContainers();

        this.requestOverview.flex = splitterPositions[0];

        this.gridSplitter = new Splitter({ });

        this.emailContainer = new EmailRequestContainer(
            {
                flex: splitterPositions[1],
                parentContainer: this,
                email: this.email,
                store: this.store
            });

        this.add([this.requestOverview, this.gridSplitter, this.emailContainer]);

        this.requestOverviewContainer = this.requestOverview;
        this.requestOverview = this.requestOverviewContainer.overviewGrid;

        this.requestOverview.setDisplayEmailContainer(this);

        this.setEmailContainerViewStyle();

        REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(this);


        var setComponentsFlex = (requestHeight, emailHeight) =>
        {
            this.requestOverviewContainer.flex = requestHeight;
            this.emailContainer.flex = emailHeight;
        };

        if (this.store.isSearchStore())
        {
            this.onRequestManagementEvent_splitterHeightChangedForSearch = setComponentsFlex;
        }
        else
        {
            this.onRequestManagementEvent_splitterHeightChanged = setComponentsFlex;
        }
    },

    setDisplayEmail: function (email)
    {
        this.email = email;

        this.setEmailContainerViewStyle();

        if (this.email)
        {
            this.emailContainer.updateEmail(this.email);
        }
    },

    setEmailContainerViewStyle: function ()
    {
        var splitterPositions = this.getFlexForContainers();

        if (this.email)
        {
            this.remove(this.noEmailsLabel);
            this.noEmailsLabel = undefined;

            this.requestOverviewContainer.flex = splitterPositions[0];
            this.gridSplitter.show();
            this.emailContainer.show();
        }
        else
        {
            // Falls keine E-Mail uebergeben wurde, aber trotzdem welche im store sind
            if (isValid(this, 'requestOverview.store.data.length') && this.requestOverview.store.data.length > 0)
            {
                return;
            }

            if (!this.noEmailsLabel && !this.store.isSearchStore())
            {
                this.requestOverviewContainer.flex = 0;

                this.noEmailsLabel = this.insert(1, new Ext.form.Label(
                {
                    text: LANGUAGE.getString('noEmails'),
                    flex: 1,
                    style:
                    {
                        'text-align': 'center',
                        'font-size': FONT_SIZE_HEADLINE + 'px',
                        'color': NEW_GREY
                    }
                }));
            }

            if (this.gridSplitter && !this.gridSplitter.isDestroyed)
            {
                this.gridSplitter.hide();
            }
            if (this.emailContainer && !this.emailContainer.isDestroyed)
            {
                this.emailContainer.hide();
            }
        }
    },

    onRequestManagementEvent_displayNoEmailsView: function (store)
    {
        if (store === this.store && isValid(this, 'requestOverview.store.data.length') && this.requestOverview.store.data.length <= 0)
        {
            this.email = undefined;
            this.setEmailContainerViewStyle();
        }
    },

    getFlexForContainers: function ()
    {
        var splitterPositions = [];

        if (this.store.isSearchStore())
        {
            splitterPositions = CLIENT_SETTINGS.getSetting('EMAILS', 'listSearchSplitterFlex');
        }
        else
        {
            splitterPositions = CLIENT_SETTINGS.getSetting('EMAILS', 'listSplitterFlex');
        }

        if (!splitterPositions)
        {
            splitterPositions = [1, 1];
        }

        return splitterPositions;
    },

    getHeightForRequestOverviewContainer: function ()
    {
        return this.requestOverviewContainer.getHeight();
    },

    getHeightForEMailContainer: function ()
    {
        return this.emailContainer.getHeight();
    },

    onResizeRequestOverview: function ()
    {
        var requestOverviewContainerHeight = this.getHeightForRequestOverviewContainer();
        var emailContainerHeight = this.getHeightForEMailContainer();
        if (emailContainerHeight < 10)
        {
            return;
        }

        this.saveFlexForContainers(requestOverviewContainerHeight, emailContainerHeight);

        this.fireEvent_splitterHeightChanged(requestOverviewContainerHeight, emailContainerHeight);
    },

    saveFlexForContainers: function (requestOverviewContainerHeight, emailContainerHeight)
    {
        var settingsKey = this.store.isSearchStore() ? 'listSearchSplitterFlex' : 'listSplitterFlex';
        CLIENT_SETTINGS.addSetting('EMAILS', settingsKey, [requestOverviewContainerHeight, emailContainerHeight]);
        CLIENT_SETTINGS.saveSettings();
    },

    fireEvent_splitterHeightChanged: function (requestOverviewContainerHeight, emailContainerHeight)
    {
        if (this.store.isSearchStore())
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_splitterHeightChangedForSearch(requestOverviewContainerHeight, emailContainerHeight);
        }
        else
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_splitterHeightChanged(requestOverviewContainerHeight, emailContainerHeight);
        }
    }
});

Ext.define('EmailTitleContainer',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'hbox',
        align: 'stretch'
    },
    
    
    initComponent: function ()
    {
        this.callParent();

        this.titleLabel = this.add(this.createTitle());

        this.requestHistoryButton = this.createRequestHistoryButton();
        this.requestHistoryForSenderButton = this.createRequestHistoryForSenderButton();
        this.requestHistoryForCompanyButton = this.createRequestHistoryForCompanyButton();
        this.updateButtons();

        this.toolbar = this.add(new Ext.toolbar.Toolbar(
        {
            overflowHandler: 'menu',
            style: 'background:transparent',
            padding: '2 0 2 0', //nötig für das overflow-Menü
            border: false,
            flex: 1,            
            items:
            [
                { xtype: 'tbspacer', flex: 1 },
                this.requestHistoryButton,
                this.requestHistoryForSenderButton,
                this.requestHistoryForCompanyButton
            ]
        }));

        var visibleButtons = Ext.Array.filter(this.getAllButtons(), function (button)
        {
            return !button.hidden;
        });
        if (!Ext.isEmpty(visibleButtons))
        {
            var lastVisibleButton = visibleButtons[visibleButtons.length - 1];
            lastVisibleButton.setMargin('4 0 0 0');
        }
    },

    getAllButtons: function ()
    {
        return [this.requestHistoryButton, this.requestHistoryForSenderButton, this.requestHistoryForCompanyButton];
    },

    updateEmail: function (email)
    {
        this.email = email;

        this.updateHeaderLabel();
        this.updateButtons();
    },

    updateHeaderLabel: function ()
    {
        this.titleLabel.updateText();
    },

    createRequestHistoryButton: function ()
    {
        return this.createLink(LANGUAGE.getString('showRequestHistory'), () =>
        {
            return this.areButtonsRequired();
        }, () =>
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_showRequestConversation(this.email);
        });
    },

    createRequestHistoryForSenderButton: function ()
    {
        return this.createLink(LANGUAGE.getString('showRequestHistoryForSender'), () =>
        {
            return this.areButtonsRequired();
        }, () =>
        {
            var searchParameters = {
                title: LANGUAGE.getString("search").toUpperCase() + " (" + Ext.String.htmlEncode(getFirstValidString([this.email.sender.getName(), this.email.sender.getEmail()])) + ")",
                searchString: this.email.sender.getEmail(),
                fields: ["From"]
            };
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_showSearch(searchParameters);
        });
    },

    createRequestHistoryForCompanyButton: function ()
    {
        return this.createLink(LANGUAGE.getString('showRequestHistoryForCompany'), () =>
        {
            var visible = isValid(this.email, "sender.getEmail") ? isValidString(this.email.sender.getEmail()) : false;
            return visible && this.areButtonsRequired();
        }, () =>
        {
            const email = this.email.sender.getEmail();
            company = email.substr(email.indexOf('@') + 1);
            
            var searchParameters = {
                title: LANGUAGE.getString("search").toUpperCase() + " (" + Ext.String.htmlEncode(company) + ")",
                searchString: company,
                fields: ["From"]
            };
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_showSearch(searchParameters);
        });
    },

    createLink: function (text, shouldBeVisibleCallback, clickCallback)
    {
        return new Ext.form.Label(
        {
            hidden: !shouldBeVisibleCallback(),
            shouldBeVisible: shouldBeVisibleCallback,
            margin: '4 10 0 0',
            text: text,
            cls: 'link greyLink eclipsedText',
            listeners:
            {
                el:
                {
                    click: function ()
                    {
                        clickCallback();
                    }
                }
            }
        });
    },
        
    updateButtons: function ()
    {
        Ext.each(this.getAllButtons(), function (button)
        {
            button.setVisible(button.shouldBeVisible());
        }, this);
    },

    areButtonsRequired: function ()
    {
        if (!this.email || !this.store)
        {
            return false;
        }
        if (this.store.isDraftStore() || !this.email.isRequest)
        {
            return false;
        }

        var states = [emailState.Sent.value, emailState.SystemMessage.value, emailState.Reply.value, emailState.Reply3rdParty.value];
        if (this.email.emailDirection === EmailDirection.Outbound.value || Ext.Array.contains(states, this.email.originalState))
        {
            return false;
        }
        return true;
    },

    getSelectedEmail: function ()
    {
        return this.email;
    },

    getEmailLabel: function ()
    {
        if (!this.email)
        {
            return '';
        }

        var curLabel = (emailState[this.email.originalState].stateLabel || MailType[this.email.type].stateLabel) + ' ' + this.email.shortId;
                
        if (emailState[this.email.originalState].stateLabel === emailState.Assigned.stateLabel)
        {
            return curLabel;
        }

        curLabel = emailState[this.email.originalState].stateLabel || MailType[this.email.type].stateLabel;

        return LANGUAGE.getString('emailHeaderTitle', curLabel, emailState.Assigned.stateLabel + ' ' + this.email.shortId);
    },

    getGroupName: function ()
    {
        if (!this.email || this.email.type === MailType.NewTicket.value)
        {
            return '';
        }

        if (emailState[this.email.originalState].stateLabel === emailState.Assigned.stateLabel)
        {
            var groupName = CURRENT_STATE_CONTACT_CENTER.getGroupName(this.email.groupId);
            if (isValidString(groupName))
            {
                return groupName;
            }
        }
        
        return '';
    },

    createTitle: function ()
    {
        var self = this;
        var label = new Ext.form.Label(
        {
            cls: 'eclipsedText',
            style:
            {
                color: COLOR_MAIN_2,
                'font-size': FONT_SIZE_HEADLINE + 'px',
                'max-height': '30px'
            },
            updateText: function ()
            {
                var text = self.getEmailLabel();
                if (isValidString(self.getGroupName()))
                {
                    var languageKey = self.isGroupInCCReceivers() ? "copySentToGroup" : "requestSentToGroup";
                    this.setText(LANGUAGE.getString(languageKey, text, self.getGroupName()));
                }
                else
                {
                    this.setText(text);
                }
            }
        });

        label.updateText();
        return label;
    },

    isGroupInCCReceivers: function ()
    {
        return this.isGroupInReceivers(this.email.ccReceivers);
    },

    isGroupInBCCReceivers: function ()
    {
        return this.isGroupInReceivers(this.email.bccReceivers);
    },

    isGroupInReceivers: function (receivers)
    {
        receivers = receivers || this.email.receivers;
        let result = false;

        var group = CURRENT_STATE_CONTACT_CENTER.getGroup(this.email.groupId);
        if (!group)
        {
            return false;
        }
        var emailAddresses = Ext.Array.pluck(receivers, "Email");
        Ext.each(emailAddresses, function (emailAddress)
        {
            if (emailAddress.indexOf(group.getMailAddress()) >= 0 || group.getMailAddress().indexOf(emailAddress) >= 0)
            {
                result = true;
                return false;
            }
        }, this);
        return result;
    },

    showError: function (text, errorType)
    {
        return this.insert(3, Ext.create('ErrorMessageComponent',
        {
            margin: '10 10 0 10',
            errorMessageText: text,
            errorType: errorType || ErrorType.Error,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
        }));
    },

    showConfirmation: function (confirmation)
    {
        return this.insert(3, Ext.create('ConfirmationComponent', confirmation));
    }
});

Ext.define('EmailTitleContainerForReplies',
{
    extend: 'EmailTitleContainer',

    areButtonsRequired: function ()
    {
        return false;
    },

    getEmailLabel: function ()
    {
        if (this.email.originalState)
        {
            var stateLabel = (emailState[this.email.originalState].stateLabel || MailType[this.email.type].stateLabel) + ' ' + this.email.shortId;
            return LANGUAGE.getString('emailHeaderTitle', MailType[this.email.type].text, stateLabel);
        }
        else
        {
            return LANGUAGE.getString('newTicket');
        }
    }
});

// Komponente die alle verfügbaren Attachments hält
//TODO: umstellen darauf, dass die UI sich immer nur nach dem attachments-Array richtet
Ext.define('AttachmentFrame',
{
    extend: 'Ext.Component',

    attachments: undefined,

    attachmentsRemoveable: true,

    uploadUrl: '',

    width: 200,

    style:
    {
        backgroundColor: 'white'
    },

    listeners:
    {
        boxready: function (me)
        {
            me.attachmentContainer = document.querySelector('#' + me.getId() + ' .attachmentContainer');

            if (me.attachments.length > 0)
            {
                me.setAttachments(me.attachments);
            }
            else
            {
                me.hide();
            }
        }
    },

    initComponent: function ()
    {
        this.callParent();
        this.attachments = this.attachments || [];
        this.update(this.createTemplate());
    },

    getAttachmentIndexById: function (id)
    {
        return this.getAttachmentIndex(function (attachment)
        {
            return parseInt(attachment.getId()) === parseInt(id);
        });
    },

    getAttachmentIndexByFileName: function (filename)
    {
        return this.getAttachmentIndex(function (attachment)
        {
            return attachment.getFileName() === filename;
        });
    },

    getAttachmentIndex: function (compareFunction)
    {
        var searchIndex = -1;

        Ext.iterate(this.attachments, function (attachment, index)
        {
            if (compareFunction(attachment))
            {
                searchIndex = index;
            }
        });

        return searchIndex;
    },

    setAttachments: function (attachments)
    {
        attachments = Ext.clone(attachments);

        this.removeAttachments();
        this.attachments = attachments;
        this.addAttachments(this.attachments);

        if (this.attachments && this.attachments.length > 0)
        {
            this.show();
        }
    },

    addAttachments: function (attachments)
    {
        var self = this;

        Ext.iterate(attachments, function (attachment)
        {
            self.addAttachment(attachment);
        });
    },

    addAttachment: function (attachment)
    {
        if (!isValid(this.attachmentContainer))
        {
            console.error("addAttachment: this.attachmentContainer is not defined!", this);
            console.trace("querying document says", document.querySelector('#' + this.getId() + ' .attachmentContainer'));
            return;
        }
        var attachmentsRemoveableCSS = 'removeUploadImage';
        var attachmentSizeLabelCSS = 'attachmentSizeLabel';

        if (!this.attachmentsRemoveable)
        {
            attachmentsRemoveableCSS = 'noRemoveUploadImage';
            attachmentSizeLabelCSS = 'attachmentSizeLabelNoRemove';
        }

        var fragment =
        '<div data-filename="' + attachment.getFileName() + '" data-attachmentid="' + attachment.getId() + '" class="hBoxLayout attachmentFragment">' +
            '<div class="uploadedAttachment attachment eclipsedText" title="' + attachment.getFileName() + '" data-attachmenturl="' + attachment.getURL() + '">' + attachment.getFileName() + '</div>' +
            '<div class="' + attachmentSizeLabelCSS + '" style="text-align:right">' + formateBytes(attachment.getSize()) + '</div>' +
            '<div class="' + attachmentsRemoveableCSS + '" style= "background-image:url(' + IMAGE_LIBRARY.getImage('remove', 64, COLOR_RED_IMAGE) + '); "></div >' +
        '</div>';

        this.attachmentContainer.innerHTML += fragment;

        this.addEventListenerForAttachments();

        this.addListenerForUploadAttachment(undefined, attachment);

        this.show();
    },

    createProgressBar: function ()
    {
        var progressImage =
        '<div style="position: relative;flex: 1;text-align: right;" class="attachmentProgressbar">' +
            '<img class="cancelUploadButton" title="' + LANGUAGE.getString("cancelUpload") + '" style="position: absolute; height: 12px; width: 12px; top: 4px; left: 30px; cursor: pointer" src="' + IMAGE_LIBRARY.getImage('remove', 64, COLOR_RED_IMAGE) + '" />' +
            '<svg width="20" height="20" viewBox="0 0 80 80">' +
                '<circle cx="40" cy="40" r="30" fill="none" stroke="rgb(56, 146, 211)" stroke-width="12" />' +
                '<circle class="progessCircle" cx="80" cy="40" r="30" fill="none" stroke="rgb(215, 215, 215)" stroke-width="12" stroke-dashoffset="188.48" stroke-dasharray="0" transform="rotate(-90 60 60)" />' +
            '</svg>' +
        '</div>';

        return progressImage;
    },

    getAttachmentData: function ()
    {
        var attachmentContainer = document.getElementsByClassName('uploadAttachmentFragment');
        attachmentContainer = attachmentContainer[attachmentContainer.length - 1];

        var progressCircle = document.getElementsByClassName('progessCircle');

        progressCircle = progressCircle[progressCircle.length - 1];
        var offset = 2 * Math.PI * progressCircle.r.animVal.value;

        return {
            attachmentContainer: attachmentContainer,
            progressCircle: progressCircle,
            offsetValue: offset
        };
    },

    addCancelUploadEvent: function (xhr, attachmentLabel)
    {
        var self = this;
        var cancelUploadButtons = document.getElementsByClassName('cancelUploadButton');

        Ext.iterate(cancelUploadButtons, function (curCancelUploadButton)
        {
            curCancelUploadButton.addEventListener('click', function ()
            {
                xhr.aborted = true;
                xhr.abort();

                self.removeAttachment(attachmentLabel);
            });
        });
    },

    uploadFileToProxy: function (file, attachmentLabel, attachmentObject)
    {
        var self = this;
        var xhr = new XMLHttpRequest();

        var attachmentData = this.getAttachmentData();

        this.addCancelUploadEvent(xhr, attachmentLabel);

        xhr.open('POST', this.uploadUrl);

        xhr.setRequestHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeRFC5987ValueChars(file.name));

        xhr.upload.onprogress = function (response)
        {
            self.animateLoader(attachmentData.progressCircle, attachmentData.attachmentContainer, attachmentData.offsetValue, response);
        };

        xhr.onreadystatechange = function (response)
        {
            self.uploadSuccess(xhr, file, attachmentLabel, attachmentObject);
        };

        xhr.send(file);
    },

    animateLoader: function (progressCircle, attachmentContainer, initialOffset, response)
    {
        if (this.destroyed)
        {
            return;
        }

        var p = Math.round(100 / response.total * response.loaded);
        var curOffset = initialOffset * (p / 100);

        progressCircle.style.strokeDasharray = initialOffset + ' ' + curOffset;

        if (p === 100)
        {
            var attachmentProgressbar = document.getElementsByClassName('attachmentProgressbar');
            attachmentProgressbar = attachmentProgressbar[attachmentProgressbar.length - 1];

            if (attachmentContainer.removeChild && attachmentProgressbar)
            {
                attachmentContainer.removeChild(attachmentProgressbar);
            }


            var extraDiv = document.getElementsByClassName('uploadedViewActions');
            extraDiv = extraDiv[extraDiv.length - 1];

            if (isValid(extraDiv, 'style.display')) {
                extraDiv.style.display = 'flex';
            }

        }
    },

    uploadSuccess: function (xhr, file, attachmentLabel, attachmentObject)
    {
        var self = this;

        if (this.destroyed)
        {
            return;
        }

        if (xhr.readyState === 4)
        {
            if (xhr.aborted)
            {
                return;
            }

            if (xhr.status === 200 && isValidString(xhr.responseText))
            {
                if (xhr.responseText.indexOf('<') === -1)
                {
                    var attachmentResponse = JSON.parse(xhr.responseText)[0];
                    if (attachmentResponse.Result === false)
                    {
                        var errorMessage;
                        if (attachmentResponse.Error === "MAXSIZE")
                        {
                            errorMessage = LANGUAGE.getString("errorUploadAttachmentMaxSize", attachmentResponse.ErrorInfo);
                        }
                        else
                        {
                            errorMessage = LANGUAGE.getString("errorUploadAttachment");
                        }
                        var errorDialog = self.parentContainer.showErrorAboveHtmlEditor(errorMessage, () =>
                        {
                            this.removeAttachment(attachmentLabel);
                        });
                    }
                    else
                    {
                        attachmentObject.setURL(attachmentResponse.URL);
                        attachmentObject.setScore(undefined);
                        attachmentObject.Id = attachmentLabel.dataset.attachmentid;
                        this.attachments.push(attachmentObject);
                    }
                }
            }
            else if (xhr.status === 409)
            {
                self.parentContainer.showErrorAboveHtmlEditor(LANGUAGE.getString("errorUploadAttachmentVirus", file.name));
                this.removeAttachment(attachmentLabel);
            }
            else
            {
                self.parentContainer.showErrorAboveHtmlEditor(LANGUAGE.getString("errorUploadMyImage"));
                this.removeAttachment(attachmentLabel);
            }
        }
    },

    uploadAttachment: function (file, attachmentObject)
    {
        var fragment =
            '<div data-attachmentid="' + CUR_ATTACHMENT_ID + '" class="hBoxLayout uploadAttachmentFragment">' +
                '<div class="uploadAttachment attachment eclipsedText" title="' + file.name + '">' + file.name.toLowerCase() + '</div>' +
                this.createProgressBar() +
                '<div class="uploadedViewActions">' +
                    '<div class="attachmentSizeLabel">' + formateBytes(file.size) + '</div>' +
                    '<div class="removeUploadImage" style= "background-image:url(' + IMAGE_LIBRARY.getImage('remove', 64, COLOR_RED_IMAGE) + ');" ></div >' +
                '</div>' +
            '</div>';

        this.attachmentContainer.innerHTML += fragment;

        this.attachmentContainer.style.display = 'flex';

        CUR_ATTACHMENT_ID++;


        var attachment = this.addListenerForUploadAttachment(file, attachmentObject);

        this.addEventListenerForAttachments();
        this.show();

        Ext.asap(() =>
        {
            this.uploadFileToProxy(file, attachment, attachmentObject);
        });
    },

    addListenerForUploadAttachment: function (file, attachmentObject)
    {
        var self = this;
        var attachment = '';
        var attachments = document.getElementsByClassName('uploadAttachmentFragment');
        var removeButtons = document.getElementsByClassName('removeUploadImage');
        var uploadedAttachments = document.getElementsByClassName('uploadAttachment');

        Ext.iterate(attachments, function (curAttachment, index)
        {
            var curRemoveButton = removeButtons[index];
            var curUploadedAttachment = uploadedAttachments[index];

            if (!curAttachment.dataset['fileObject'])
            {
                curAttachment.dataset['fileObject'] = JSON.stringify(file);
                attachment = curAttachment;
            }

            curRemoveButton.addEventListener('click', function ()
            {
                self.removeAttachment(curAttachment);
            });

            curUploadedAttachment.addEventListener('click', function ()
            {
                var myWindow = window.open();

                myWindow.document.write("<div style='overflow:scroll;height:" + window.innerHeight + "px;width:" + window.innerWidth + "px'><img src='" + attachmentObject.getURL() + "'/></div>");


                myWindow.document.close();
            });
        });

        return attachment;
    },

    displayAttachment: function (url)
    {
        window.open(url);
    },

    addEventListenerForAttachments: function ()
    {
        var self = this;
        var attachments = document.getElementsByClassName('attachmentFragment');
        var removeButtons = document.getElementsByClassName('removeUploadImage');
        var uploadedAttachments = document.getElementsByClassName('uploadedAttachment');

        Ext.iterate(attachments, function (curAttachment, index)
        {
            var curRemoveButton = removeButtons[index];
            var curUploadedAttachment = uploadedAttachments[index];

            if (curRemoveButton)
            {
                curRemoveButton.addEventListener('click', function ()
                {
                    var curAttachment = curRemoveButton.parentElement;
                    self.removeAttachment(curAttachment);
                });
            }
           

            curUploadedAttachment.addEventListener('click', function ()
            {
                self.displayAttachment(curUploadedAttachment.dataset.attachmenturl);
            });
        });
    },

    removeAttachments: function ()
    {
        var self = this;
        var attachments = document.querySelectorAll('#' + this.getId() + ' .attachmentFragment');

        var ownAttachments = document.querySelectorAll('#' + this.getId() + ' .uploadAttachmentFragment');

        Ext.iterate(attachments, function (attachment)
        {
            self.removeAttachment(attachment);
        });

        Ext.iterate(ownAttachments, function (attachment)
        {
            self.removeAttachment(attachment);
        });

        this.hide();
    },

    removeAttachment: function (attachment)
    {
        var index = this.getAttachmentIndexById(attachment.dataset.attachmentid);
        if (index === -1)
        {
            index = this.getAttachmentIndexByFileName(attachment.dataset.filename);
        }
        if (index !== -1) //-1 ist der index z.B. wenn wir ein Attachment hochladen, was zu groß ist und deswegen noch nicht in den attachments ist
        {
            this.attachments.splice(index, 1);
        }
        
        if (attachment.parentNode) //Fall: Man beantwortet eine Mail, wählt eine zu große Datei aus, bekommt eine Fehlermeldung und löscht selber das Attachment wieder. dann versuchen wir, wenn die Fehlermeldung weggeht, das Attachment selber zu löschen, was aber im DOM nicht mehr vorhanden ist
        {
            this.attachmentContainer.removeChild(attachment);
        }
        else
        {
            //Fall: man wählt ein zu großes Attachment aus, Fehlermeldung erscheint. man wählt direkt noch eine kleine Datei aus. Wenn dann die Fehlermeldung verschwindet und das Attachmetn entfernen will, ist seltsamerweise das parentNode nicht da, deswegen
            var ownAttachments = document.querySelectorAll('#' + this.getId() + ' .uploadAttachmentFragment');
            Ext.each(ownAttachments, function (ownAttachment)
            {
                if (ownAttachment.dataset.attachmentid === attachment.dataset.attachmentid && ownAttachment.parentNode)
                {
                    this.attachmentContainer.removeChild(ownAttachment);
                    return false;
                }
            }, this);
        }

        if (this.attachments.length <= 0)
        {
            this.hide();
        }
    },

    createTemplate: function ()
    {
        var template =
            '<div class="maxHeight attachmentContainer backgroundImage" style="overflow:hidden visible;padding:0 10px;background-image: url(' + IMAGE_LIBRARY.getImage('paperclip', 64, COLOR_WATERMARK) + ');"></div>';

        return template;
    },

    getAttachments: function ()
    {
        return this.attachments;
    }
});


// Anzeige der E-Mail
Ext.define('EmailFrame',
{
    extend: 'Ext.Component',

    flex: 1,

    requestUrl: undefined,

    initComponent: function ()
    {
        this.callParent();

        var self = this;
        

        this.on('boxready', function ()
        {
            this.showLoadingMask();
            this.update(this.createTemplate());

            var frame = self.getIframe();
            if (frame)
            {
                frame.addEventListener('load', function ()
                {
                    setTimeout(function ()
                    {
                        self.hideLoadingMask();
                    }, 150);
                }, true);
            }
            else
            {
                console.log("EMailRequest: could not find iframe for wait cursor!");
                self.dontShowWaitCursor = true;
            }
        }, this);
    },


    setRequestUrl: function (requestUrl)
    {
        this.requestUrl = requestUrl;
        this.updateRequestFrame();
    },

    setAttachments: function (attachments)
    {
        var frame = this.getIframe();

        if (!isValid(frame))
        {
            return;
        }
        if (Ext.isEmpty(attachments))
        {
            frame.style.borderRightColor = TITLE_GREY;
        }
        else
        {
            frame.style.borderRightColor = COLOR_SEPARATOR;
        }
    },

    updateRequestFrame: function ()
    {
        var frame = this.getIframe();

        if (frame)
        {
            frame.src = "about:blank";
            this.showLoadingMask();

            Ext.asap(() =>
            {
                frame.src = this.requestUrl;
            });
        }
    },

    getIframe: function ()
    {
        return document.querySelector('#' + this.getId() + ' .requestFrame');
    },

    createTemplate: function ()
    {
        var template = '<iframe class="maxWidth maxHeight requestFrame flexItem backgroundImage bodyField" style="border:none;background-color:white" ';
        if (isValidString(this.requestUrl))
        {
            template += 'src="' + this.requestUrl + '"';
        }
        template += '></iframe > ';

        return template;
    },

    showLoadingMask: function ()
    {
        if (this.dontShowWaitCursor)
        {
            return;
        }
        showBlackLoadingMask(this);

        var frame = this.getIframe();
        if (frame)
        {
            frame.style.backgroundImage = 'none';
        }
    },

    hideLoadingMask: function ()
    {
        hideLoadingMask(this);

        var frame = this.getIframe();
        if (frame)
        {
            frame.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage('mail', 64, COLOR_WATERMARK) + ')';
        }
    }
});

Ext.define('BaseEmailContainer',
{
    extend: 'Ext.Container',

    flex: 1,

    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    style:
    {
        background: PANEL_BACKGROUND_GREY
    },

    padding: '0 0 0 0',

    showMessage: function (position, errorMessageComponent)
    {
        if (!this.errorMessageArea)
        {
            return;
        }

        this.errorMessageArea.showErrorMessageComponent(errorMessageComponent);
    },

    removeErrorMessages: function ()
    {
        this.errorMessageArea.removeAll();
    }
});
// Container der die Anzeige der gesamten Anfrage kapselt -> Zeigt die E-Mail, die Anhänge und die möglichen Aktionen an
Ext.define('EmailRequestContainer',
{
    extend: 'BaseEmailContainer',

    attachmentFrame: undefined,

    bodyContainer: undefined,

    emailFrame: undefined,

    emailHeader: undefined,

    userActions: undefined,

    email: undefined,

    showActions: true,

    initComponent: function ()
    {
        this.callParent();

        this.attachments = this.attachments || [];

        this.actionData = this.getUserActionData();

        this.headerData = this.getHeaderData();

        this.updateUserActionContainer();

        this.emailTitleContainer = new EmailTitleContainer(
        {
            store: this.store,
            email: this.email
        });
        this.emailHeader = new EmailHeaderRequestFrame(
            {
                headerData: this.headerData,
                email: this.email,
                isCourseButtonRequired: () =>
                {
                    return this.emailTitleContainer.areButtonsRequired();
                }
            });

        this.bodyContainer = new Ext.Container(
            {
                layout:
                {
                    type: 'hbox',
                    pack: 'start',
                    align: 'stretch'
                },

                flex: 1
            });

        this.emailFrame = new EmailFrame(
            {
                parentContainer: this,
                requestUrl: this.email ? this.email.urlBody : undefined
            });

        this.attachmentFrame = new AttachmentFrame(
            {
                margin: '0 0 0 5',
                parentContainer: this,
                attachments: this.email ? this.email.attachments : undefined,
                attachmentsRemoveable: false
            });

        this.bodyContainer.add([this.emailFrame, this.attachmentFrame]);

        this.bubble = Ext.create('RequestBubble',
        {
            email: this.email
        });

        
        this.add(
        [
            new Ext.Container(
            {
                margin: '5 10',
                layout:
                {
                    type: 'hbox',
                    align: 'stretch'
                },
                items:
                [
                    this.bubble,
                    new Ext.Container(
                    {
                        margin: '0 0 0 25',
                        layout:
                        {
                            type: 'vbox',
                            align:'stretch'
                        },
                        flex: 1,
                        items:
                        [
                            this.emailTitleContainer,
                            this.emailHeader
                        ]
                    })
                                
                ]
            }),
            this.bodyContainer
        ]);

        if (this.showActions)
        {
            this.errorMessageArea = this.add(new ErrorMessagesArea(
            {
                padding: '0 10 0 10'
            }));
            this.add(this.userActions);
        }
    },

    updateHeaderLabel: function ()
    {
        this.emailTitleContainer.updateHeaderLabel();
        this.bubble.updateRequestBubble();
    },

    updateButtons: function ()
    {
        this.emailTitleContainer.updateButtons();
    },

    getSelectedEmail: function ()
    {
        return this.email;
    },

    getMainEmailContainer: function ()
    {
        return this.parentContainer;
    },

    updateEmail: function (email)
    {
        Ext.batchLayouts(() =>
        {
            this.email = email;
            this.actionData = this.getUserActionData();

            this.emailTitleContainer.updateEmail(this.email);
            this.bubble.updateEmail(this.email);
            this.emailFrame.setRequestUrl(this.email.urlBody);
            this.emailFrame.setAttachments(this.email.attachments);
            this.attachmentFrame.setAttachments(this.email.attachments);

            this.emailHeader.updateTemplateAndHeader(this.getHeaderData(), this.email);
            this.updateUserActionContainer();

            this.updateHeaderLabel();

            this.updateButtons();

            this.removeErrorMessages();
        }, this);
    },

    getUserActionData: function ()
    {
        if (!this.email)
        {
            return undefined;
        }

        return {
            store: this.store,
            state: this.email.originalState,
            mailType: this.email.type,
            worker: this.email.curWorkingAgent,
            isRequest: this.email.isRequest,
            mailId: this.email.mailId,
            groupId: this.email.groupId,
            fullId: this.email.fullId,
            printUrl: this.email.urlPrint,
            sourceUrl: this.email.urlSource,
            read: this.email.read
        };
    },

    getHeaderData: function ()
    {
        if (!this.email)
        {
            return undefined;
        }

        
        var dateTime = formatDateString(new Date(this.email.date), true) + ' ' + formatTimeString(new Date(this.email.date));

        var receiver;

        var group = CURRENT_STATE_CONTACT_CENTER.getGroup(this.email.groupId);
        if (group)
        {
            var groupEmailAddress = new EmailAddress(group.getMailAddress());
            Ext.each([this.email.receivers, this.email.ccReceivers, this.email.bccReceivers], function (receivers)
            {
                if (receiver)
                {
                    return false;
                }
                Ext.each(receivers, function (emailReceiver)
                {
                    if (groupEmailAddress.equals(emailReceiver.getEmail()))
                    {
                        receiver = emailReceiver;
                        return false;
                    }
                }, this);
            }), this;
        }
        

        if (!isValid(this.email, 'receiver.setName'))
        {
            this.email.receiver = new www_caseris_de_CaesarSchema_PhoneContact();

            if(isValid(receiver))
            {
                this.email.receiver = receiver;
            }
        }

        if (isValid(this, 'email.sender.getName') && !this.email.sender.getName())
        {
            this.email.sender.setName(this.email.name);
        }

        if (isValid(this, 'email.sender.getName') && !this.email.sender.getEmail()) 
        {
            this.email.sender.setEmail(this.email.name);
        }

        if (isValid(receiver, 'getName') && !receiver.getName())
        {
            this.email.receiver.setName(this.email.name);
        }

        if (isValid(receiver, 'getEmail') && !receiver.getEmail()) 
        {
            this.email.receiver.setEmail(this.email.name);
        }
        
        return {
            store: this.store,
            sender: this.email.name,
            //receiver: receiverString,
            mailId: this.email.fullId,
            isRequest: this.email.isRequest,
            mailType: this.email.type,
            mailState: this.email.originalState,
            subject: this.email.subject,
            date: dateTime,
            curMailState: this.email.state,
            senderObject: this.email.sender,
            receivers: this.email.receivers,
            groupId: this.email.groupId,
            courseUrl: this.email.historyUrl,
            shortId: this.email.shortId,
            CC: this.email.CC,
            ccReceivers: this.email.ccReceivers,
            BCC: this.email.BCC,
            bccReceivers: this.email.bccReceivers,
            originalTo: this.email.originalTo
        };
    },

    updateUserActionContainer: function ()
    {
        if (isValid(this, 'userActions.xtype'))
        {
            this.remove(this.userActions);
        }

        if (this.showActions)
        {
            var factory = new UserActionContainerFactory();
            this.userActions = this.add(factory.createUserActionContainer(this.actionData, this, this.getSelectedEmail(), this.getHeaderData()));
        }
    }
});

Ext.define('ReplyCustomerPanel',
{
    extend: 'BaseEmailContainer',

    closable: true,

    border: false,

    store: undefined,

    isAnswerPanel: true,

    title: 'AW',

    is3rdPartyAnswer: false,

    email: undefined,

    userEmailContainer: undefined,

    userReplyContainer: undefined,

    userActions: undefined,

    userActionData: undefined,

    userHeaderData: undefined,

    replyHeader: undefined,

    replySketch: undefined,

    emailSaved: false,

    needLeftMargin: true,

    isOpenEmail: false,

    initComponent: function ()
    {
        this.callParent();

        var self = this;

        if (!this.citeType)
        {
            this.citeType = MailCreateCiteMode.Undefined.value;
        }

        REQUEST_MANAGEMENT_EVENT_QUEUE.addEventListener(this);

        var containerPositions = CLIENT_SETTINGS.getSetting('EMAILS', 'answerSplitterFlex');

        if (!containerPositions)
        {
            containerPositions = [1, 1];
        }


        if (this.userEmailContainer)
        {
            this.userEmailContainer.flex = containerPositions[0];

            this.add(this.userEmailContainer);

            this.gridSplitter = this.add(new Splitter({}));

            if (!CLIENT_SETTINGS.getSetting('EMAIL', 'showSenderEmail'))
            {
                Ext.asap(() => //ohne das Ext.asap funktioniert das Setzen des focus in den htmlEditor nicht
                {
                    this.onRequestManagementEvent_hideAnswerRequestPanel();
                });   
            }
        }

        if (!this.replyHeader)
        {
            this.replyHeader = new EmailHeaderCustomerReplyFrame(
                {
                    margin: '10 0 0 0',
                    headerData: this.userHeaderData,
                    email: this.email
                });
        }

        this.userReplyContainer = new HtmlReplyContainer(
            {
                isReply3rdParty: this.is3rdPartyAnswer,
                parentContainer: this
            });

        var replyContainerFlex = 1;

        if (this.userEmailContainer)
        {
            replyContainerFlex = containerPositions[1];
        }

        this.replyContainer = this.add(new Ext.Container(
            {
                layout:
                {
                    type: 'vbox',
                    pack: 'start',
                    align: 'stretch'
                },

                flex: replyContainerFlex,

                listeners:
                {
                    resize: function (me)
                    {
                        if (self.userEmailContainer && !self.userEmailContainer.isDestroyed)
                        {
                            CLIENT_SETTINGS.addSetting('EMAILS', 'answerSplitterFlex', [self.userEmailContainer.getHeight(), self.replyContainer.getHeight()]);
                            CLIENT_SETTINGS.saveSettings();

                            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_splitterHeightReplyPanelChanged(self.userEmailContainer.getHeight(), self.replyContainer.getHeight());
                        }
                    }
                },

                border: false
            }));

        this.emailTitleContainer = new EmailTitleContainerForReplies(
        {
            store: this.store,
            email: this.email
        });
        
        this.bubble = Ext.create('RequestBubble',
        {
            email: this.email     
        });

        this.errorMessageArea = this.add(new ErrorMessagesArea(
        {
            padding: '5 10 5 10'
        }));

        this.replyContainer.add(
        [
            new Ext.Container(
            {
                margin: '5 10',
                layout:
                {
                    type: 'hbox',
                    align: 'stretch'
                },
                items:
                [
                    this.bubble,
                    new Ext.Container(
                    {
                        margin: '0 0 0 25',
                        layout:
                        {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        flex: 1,
                        items:
                        [
                            this.emailTitleContainer,
                            this.replyHeader
                        ]
                    })
                ]
            }),
            this.userReplyContainer,
            this.errorMessageArea,
            this.userActions
        ]);
    },

    getEmailLabel: function ()
    {
        if (this.email.originalState)
        {
            var stateLabel = (emailState[this.email.originalState].stateLabel || MailType[this.email.type].stateLabel) + ' ' + this.email.shortId;
            return LANGUAGE.getString('emailHeaderTitle', MailType[this.email.type].text, stateLabel);
        } 
        else
        {
            return LANGUAGE.getString('newTicket');
        }
        
    },

    listeners:
    {
        boxready: function (me)
        {
            me.createEmail();

            me.escapeKeyNav = new Ext.util.KeyNav(
            {
                target: me.el,
                eventName: 'keydown',
                scope: me,
                esc: me.closeTab
            });            
        },

        destroy: function (me)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.removeEventListener(me);
        },

        beforeclose: function (me)
        {
            if (me.emailSaved)
            {
                return true;
            }

            me.cancelEmail(me.tab);

            return false;
        }
    },

    cancelEmail: function (target)
    {
        var self = this;

        var doneFunction = function (result)
        {
            console.log("Cancel mail success!");

            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_removeTab(self);
        };

        var failFunction = function (err)
        {
            console.log("cancel mail failed!");
        };

        var cancelMailFunction = function ()
        {
            SESSION.cancelMail(self.newMailId, doneFunction, failFunction);
        };

        var saveMailFunction = function ()
        {
            var saveDraftButton = new SaveDraftButton({
                actionData: self.actionData,
                userActionContainer: self.userActions,
                email: self.email,
                headerData: self.headerData
            });
            saveDraftButton.handler();
        };

        if (isValid(this, 'email.type') && this.email.type === MailType.NewTicket.value)
        {
            cancelMailFunction();
            return;
        }

        if (this.hasMailChanged())
        {
            this.showConfirmationAtBeginning(
            {
                yesCallback: saveMailFunction,
                noCallback: cancelMailFunction,
                errorMessageText: LANGUAGE.getString('saveEmailAsDraft')
            });
        }
        else
        {
            cancelMailFunction();
        }

        if (this.isOpenEmail)
        {
            REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_cancelMail(this.email);
        }
    },

    closeTab: function ()
    {
        REQUEST_MANAGEMENT_EVENT_QUEUE.onRequestManagementEvent_removeTab(this);
    },

    createEmail: function ()
    {
        var self = this;

        var doneFct = function (result)
        {
            self.userReplyContainer.onCreateMailSuccess(result);

            if (result.getReturnValue().getCode() !== 0)
            {
                console.log("Create mail failed!");
                var hideCallback = function ()
                {
                    self.closeTab();
                };

                self.showError(result.getReturnValue().getDescription(), hideCallback);
            }
            else
            {
                if (self.destroyed)
                {
                    return;
                }

                self.replySketch = result.getMailData();

                self.newMailId = self.replySketch.getMailId();

                self.email.newMailId = self.newMailId;

                self.userReplyContainer.setUploadUrl(self.replySketch.getAttachmentUploadUrl()); 

                var newSubject = "";
                var newSender = "";
                var newReceiver = "";
                var newMailText = "";
                var newAttachments = undefined;
                var availableAttachments = [];
                var textSamples = [];
                var sampleBlocks = [];

                if (isValid(self.replySketch, 'getDraft()'))
                {
                    newSubject = self.replySketch.getDraft().getSubject();
                    newSender = self.replySketch.getDraft().getFrom();
                    newReceiver = self.replySketch.getDraft().getTo();
                    newMailText = self.replySketch.getDraft().getBody();

                    if (isValid(self.replySketch, 'getDraft().getAttachmentsEx()'))
                    {
                        newAttachments = self.replySketch.getDraft().getAttachmentsEx();
                    }
                }

                if (isValidString(newSubject) || self.tab.text.length > 20)
                {
                    var titleText = newSubject;

                    if (!isValidString(titleText))
                    {
                        titleText = self.tab.text;
                    }

                    var originalText = titleText;

                    if (titleText.length > 20)
                    {
                        titleText = titleText.substring(0, 19) + '...';
                        if (isValid(self, "tab.el.dom"))
                        {
                            self.tab.el.dom.title = originalText; 
                        }
                    }

                    self.tab.setText(Ext.String.htmlEncode(titleText.toUpperCase()));
                }

                if (isValid(self.replySketch, 'getAttachments()'))
                {
                    availableAttachments = self.replySketch.getAttachments() || [];
                }

                if (isValid(self.replySketch, 'getTextBlocks()'))
                {
                    textSamples = self.replySketch.getTextBlocks() || [];
                }

                if (isValid(self.replySketch, 'getTemplates()')) 
                {
                    sampleBlocks = self.replySketch.getTemplates();
                }

                var sketch =
                {
                    mailId: self.newMailId,
                    mailText: newMailText || '',
                    attachments: newAttachments || [],
                    attachmentMenu: availableAttachments || [],
                    textSamples: textSamples || [],
                    sampleBlocks: sampleBlocks || []
                };

                self.userHeaderData.sender = newSender || '';
                self.userHeaderData.receiver = newReceiver || '';
                self.userHeaderData.subject = newSubject || '';

                self.replyHeader.updateTemplateAndHeader(self.userHeaderData, self.email);
                self.userReplyContainer.updateSketch(sketch);

                self.setIsInitializedWithSketch(true);
            }
        };

        var failFct = function (err)
        {
            self.userReplyContainer.onCreateMailException();
            console.log('Create mail failed!');
        };

        SESSION.createMail(this.email.fullId, this.email.mailId, this.email.type, this.citeType, doneFct, failFct);
    },

    updateEmail: function ()
    {

    },

    hasMailChanged: function ()
    {
        var sketchAttachments = [];
        var replyAttachments = this.userReplyContainer.getReplyAttachments();

        if (isValid(self.replySketch, 'getAttachments()'))
        {
            sketchAttachments = this.replySketch.getAttachments() || [];
        }

        if (!this.getHasTyped() && sketchAttachments.length === replyAttachments.length)
        {
            return false;
        }
        else
        {
            return true;
        }
    },

    getMailData: function ()
    {
        var sender = this.replyHeader.getSenderEmail();
        var receiver = this.replyHeader.getReceiverEmail();
        var subject = this.replyHeader.getSubject();
        var body = this.userReplyContainer.getReplyBody();

        var groupId = this.replyHeader.getGroupIdForReceiver();
        var agentId = this.replyHeader.getAgentIdForReceiver();

        return {
            sender: sender,
            receiver: receiver,
            subject: subject,
            body: body,
            attachments: this.userReplyContainer.getReplyAttachments() || [],
            agentId: agentId,
            groupId: groupId
        };
    },

    getMailId: function ()
    {
        return this.newMailId;
    },

    getHasTyped: function ()
    {
        return this.userReplyContainer.getHasTyped();
    },

    setIsInitializedWithSketch: function (isInitializedWithSketch)
    {
        this.userReplyContainer.setIsInitializedWithSketch(isInitializedWithSketch);
    },

    onRequestManagementEvent_showAnswerRequestPanel: function ()
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.userEmailContainer && this.gridSplitter)
        {
            this.userEmailContainer.show();
            this.gridSplitter.show();
        }
    },

    onRequestManagementEvent_hideAnswerRequestPanel: function ()
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.userEmailContainer && this.gridSplitter)
        {
            this.userEmailContainer.hide();
            this.gridSplitter.hide();
        }
    },

    onRequestManagementEvent_splitterHeightReplyPanelChanged: function (requestContainerHeight, replyContainerHeight)
    {
        if (isValid(this, 'userEmailContainer.setHeight'))
        {
            this.userEmailContainer.flex = requestContainerHeight;
            this.replyContainer.flex = replyContainerHeight;
        }
    },

    showErrorAtBeginning: function (text, hideCallback)
    {
        return this.showError(text, hideCallback, 0);
    },

    showErrorAboveHtmlEditor: function (text, hideCallback)
    {
        return this.showError(text, hideCallback, 3);
    },

    showError: function (text, hideCallback, position)
    {
        position = position || 0;
        var errorContainer = this.insert(position, Ext.create('ErrorMessageComponent',
        {
            margin: '10 10 0 10',
            errorMessageText: text,
            errorType: ErrorType.Error,
            borderWidth: 1,
            timeoutInSeconds: DEFAULT_TIMEOUT_ERROR_MESSAGES
            }));
        if (hideCallback)
        {
            errorContainer.on('removed', function ()
            {
                hideCallback();
            });
        }
        
        return errorContainer;
    },

    showConfirmationAtBeginning: function (confirmation)
    {
        return this.showConfirmation(confirmation, 0);
    },

    showConfirmationAboveHtmlEditor: function (confirmation)
    {
        return this.showConfirmation(confirmation, 3, "10");
    },

    showConfirmation: function (confirmation, position, margin)
    {
        confirmation.margin = margin || "10 10 0 10";
        confirmation.borderWidth = 1;
        return this.insert(position || 0, Ext.create('ConfirmationComponent', confirmation));
    }
});

Ext.define('HtmlReplyContainer',
{
    extend: 'Ext.Container',

    margin: '5 0 10 0',
    
    layout:
    {
        type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },

    sketch: undefined,

    htmlEditor: undefined,

    attachmentPanel: undefined,

    isReply3rdParty: false,

    flex: 1,

    initComponent: function ()
    {
        this.callParent();

        var needInitialFocus = !this.getIsReply3RdParty();

        this.htmlEditor = this.add(new HtmlEditor(
            {
                parentContainer: this,
                needInitialFocus: needInitialFocus
            }));

        this.attachmentsContainer = this.add(new AttachmentFrame(
            {
                margin: '0 0 0 5',
                parentContainer: this,
                attachments: undefined,
                attachmentsRemoveable: true
            }));

        this.add(new Ext.Component(
            {
                html: '<input type="file" size="50" accept="*" class="filePicker">'
            })).hide();
    },

    getIsReply3RdParty: function ()
    {
        return this.isReply3rdParty;
    },

    setUploadUrl: function (uploadUrl)
    {
        this.attachmentsContainer.uploadUrl = uploadUrl;
    },

    getReplyBody: function ()
    {
        return this.htmlEditor.getSubmitData().undefined;
    },

    getReplyAttachments: function ()
    {
        var clonedAttachments = Ext.clone(this.attachmentsContainer.attachments);
        Ext.each(clonedAttachments, function (clonedAttachment)
        {
            if (clonedAttachment.ownAttachment)
            {
                clonedAttachment.Id = "";
            }
        }, this);
        return clonedAttachments;
    },

    getMailId: function ()
    {
        return this.sketch.mailId;
    },

    getTextBlocks: function ()
    {
        return this.sketch.sampleBlocks;
    },

    getHasTyped: function ()
    {
        return this.htmlEditor.getHasTyped();
    },

    setHasTyped: function (hasTyped)
    {
        this.htmlEditor.setHasTyped(hasTyped);
    },

    setIsInitializedWithSketch: function (isInitializedWithSketch)
    {
        this.htmlEditor.setIsInitializedWithSketch(isInitializedWithSketch);
    },

    updateSketch: function (sketch)
    {
        this.sketch = sketch;

        this.htmlEditor.setValue(this.sketch.mailText);
        this.htmlEditor.updateAttachmentMenu(this.sketch.attachmentMenu);
        this.htmlEditor.updateTextSampleMenu(this.sketch.textSamples);
        this.htmlEditor.updateSampleBlockMenu(this.sketch.sampleBlocks);
        this.attachmentsContainer.setAttachments(this.sketch.attachments);
    },

    updateForTextBlockSelect: function (editorData)
    {
        var self = this;

        var okFunction = function ()
        {
            self.htmlEditor.setValue(editorData.mailText);
            self.htmlEditor.updateAttachmentMenu(editorData.attachmentMenu);
            self.htmlEditor.updateTextSampleMenu(editorData.textSamples);

            var toolbar = self.htmlEditor.getToolbar();
            if (toolbar)
            {
                if (isValidString(editorData.name))
                {
                    //self.htmlEditor.sampleButton.disable();
                    var position = toolbar.items.items.indexOf(self.htmlEditor.sampleButton);
                    var button = new DeleteTemplateButton(
                    {
                        templateId: editorData.mailId,
                        text: editorData.name,
                        onClick: function (templateId)
                        {
                            self.showConfirmationAboveHtmlEditor({
                                errorMessageText: LANGUAGE.getString('reallyRemoveTemplate'),
                                yesCallback: function ()
                                {
                                    toolbar.remove(button);
                                    self.htmlEditor.sampleButton.removeTextBlock();
                                },
                                noCallback: function () { },
                                margin: '0 10 10 10'
                            });
                        }
                    });
                    toolbar.insert(position, button);
                }
                else
                {
                    self.htmlEditor.sampleButton.enable();
                }
                self.htmlEditor.focus();
            }
            
            self.attachmentsContainer.setAttachments(editorData.attachments);

            self.setHasTyped(false);
        };

        var enableSampleButton = function ()
        {
            self.htmlEditor.sampleButton.enable();
        };

        if (this.getHasTyped())
        {
            this.showConfirmationAboveHtmlEditor(
            {
                yesCallback: okFunction,
                noCallback: enableSampleButton,
                errorMessageText: LANGUAGE.getString('allReplyTextLost')
            });
        }
        else
        {
            okFunction();
        }
        
    },

    createBase64Url: function (file, attachmentObject, callbackFunction)
    {
        var FR = new FileReader();

        FR.addEventListener("load", function (e)
        {
            attachmentObject.setURL(e.target.result);
            callbackFunction(file, attachmentObject);
        });

        FR.readAsDataURL(file);
    },

    uploadImage: function (file)
    {
        if (!file)
        {
            return;
        }

        var self = this;

        var attachment = new www_caseris_de_CaesarSchema_MailAttachmentEx();
        attachment.setFileName(file.name);
        attachment.setId('');
        attachment.setSize(file.size);
        attachment.setURL('');
        attachment.setMimeType(file.type);
        attachment.setScore(undefined);
        attachment.ownAttachment = true;

        var callbackFunction = function (file, attachment)
        {
            self.attachmentsContainer.uploadAttachment(file, attachment);
        };

        this.createBase64Url(file, attachment, callbackFunction);
        
    },

    uploadScreenshot: function (file)
    {
        file.name = this.getFileNameForScreenshot();
        this.uploadImage(file);
    },

    getFileNameForScreenshot: function ()
    {
        var attachmentNames = Ext.Array.pluck(this.attachmentsContainer.getAttachments(), 'FileName');
        var screenshotNames = Ext.Array.filter(attachmentNames, function (attachmentName)
        {
            return attachmentName.indexOf('Screenshot') === 0;
        }, this);
        var screenshotNamesWithoutExtension = Ext.Array.map(screenshotNames, function (screenshotName)
        {
            return screenshotName.split(".")[0];
        }, this);
        var screenshotNumbers = Ext.Array.map(screenshotNamesWithoutExtension, function (screenshotNameWithoutExtension)
        {
            var splitted = screenshotNameWithoutExtension.split("_");
            if (splitted.length === 1)
            {
                return 1;
            }
            return Number(splitted[splitted.length - 1]);
        }, this);

        var maxScreenshotNumber = Ext.Array.max(screenshotNumbers);
        if (maxScreenshotNumber)
        {
            return "Screenshot_" + (maxScreenshotNumber + 1) + ".png";
        }
        return "Screenshot.png";
    },

    addAttachment: function (attachment)
    {
        this.attachmentsContainer.addAttachment(attachment);
        this.attachmentsContainer.attachments.push(attachment);
    },

    addAttachments: function (attachments)
    {
        this.attachmentsContainer.addAttachments(attachments);
    },

    showErrorAtBeginning: function (errorMessage, hideCallback)
    {
        return this.parentContainer.showErrorAtBeginning(errorMessage, hideCallback);
    },

    showErrorAboveHtmlEditor: function (errorMessage, hideCallback)
    {
        return this.parentContainer.showErrorAboveHtmlEditor(errorMessage, hideCallback);
    },

    showError: function (text, errorType)
    {
        return this.parentContainer.showError(text, errorType);
    },

    showConfirmationAtBeginning: function (confirmation)
    {
        return this.parentContainer.showConfirmationAtBeginning(confirmation);
    },

    showConfirmationAboveHtmlEditor: function (confirmation)
    {
        return this.parentContainer.showConfirmationAboveHtmlEditor(confirmation);
    },

    showConfirmation: function (confirmation, position)
    {
        return this.parentContainer.showConfirmation(confirmation, position);
    },

    onCreateMailSuccess: function (response)
    {
        this.htmlEditor.onCreateMailSuccess(response);
    },

    onCreateMailException: function ()
    {
        this.htmlEditor.onCreateMailException(response);
    }
    });

Ext.define('ClipboardButton',
{
    extend: 'ThinButton',

    allowBlank: true,
    border: 1,
    icon: 'images/64/clipboard.png',
    iconName: 'clipboard',
    hidden: !isValid(navigator, "clipboard.read()"),

    style:
    {
        'background-color': COLOR_BACKGROUND,
        'border-color': NEW_GREY
    },

    initComponent: function ()
    {
        this.tooltip = LANGUAGE.getString("pasteFromClipBoard");
        this.callParent();
    },

    handler: async function ()
    {
        try
        {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems)
            {
                try
                {
                    for (const type of clipboardItem.types)
                    {
                        if (type.indexOf("image") !== -1)
                        {
                            const blob = await clipboardItem.getType(type);
                            this.parent.uploadScreenshot(blob);
                        }
                        else if (type.indexOf("text") !== -1)
                        {
                            const text = await navigator.clipboard.readText();
                            this.parent.addTextBlock(text);
                        }
                        
                    }
                } catch (e)
                {
                    console.error(e, e.message);
                }
            }
        } catch (e)
        {
            console.error(e, e.message);
        }
        
    }
});

Ext.define('HtmlEditor',
{
    extend: 'Ext.form.HtmlEditor',

    flex: 1,

    parentContainer: undefined,

    attachmentButton: undefined,

    textSampleButton: undefined,

    isInitializedWithSketch: false,

    enableFont: false,

    hasTyped: false,

    needInitialFocus: false,

    listeners:
    {
        boxready: function (me)
        {
            var toolbar = me.getToolbar();
            me.hasTyped = false;

            toolbar.setBorder('0 0 1 0');

            me.filePicker = document.querySelector('#' + me.parentContainer.getId() + ' .filePicker');
            me.filePicker.addEventListener('change', function ()
            {
                me.uploadImage(this.files[0]);

                this.value = null; //ansonsten triggert das change-Event nicht, wenn man diesselbe Datei nochmal auswählt (z.B. nachdme man die Datei versehentlich wieder aus den Attachments gelöscht hat)
                return false;
            });
            
            me.attachmentButton.filePicker = me.filePicker;

            me.showLoadingMask();

            this.containerEl.setStyle({ border: 'none' });
        },
        change: function (me)
        {
            if (me.isInitializedWithSketch)
            {
                me.hasTyped = true;
            }
            else if (this.needInitialFocus)
            {
                setTimeout(function ()
                {
                    if (me && me.focus)
                    {
                        me.focus();
                    }

                }, 100);

            }
        },
        destroy: function ()
        {
            window.rankingMenuData = undefined;
        }
    },

    initComponent: function ()
    {
        this.callParent();

        this.isInitializedWithSketch = false;
        this.hasTyped = false;
    },

    getHasTyped: function ()
    {
        return this.hasTyped;
    },

    setHasTyped: function (hasTyped)
    {
        this.hasTyped = hasTyped;
    },

    uploadScreenshot: function (file)
    {
        this.parentContainer.uploadScreenshot(file);
    },

    uploadImage: function (file)
    {
        this.parentContainer.uploadImage(file);
    },

    getTextBlocks: function ()
    {
        return this.parentContainer.getTextBlocks();
    },

    addAttachment: function (attachment)
    {
        this.parentContainer.addAttachment(attachment);
    },

    addTextBlock: function (textBlock)
    {
        // Im chrome wird das Flag nicht initial gesetzt obwohl das Element eigentlich fokosiert wurde.
        // Setzt man activated auf true funktioniert das einfügen
        if (!this.activated)
        {
            this.getEditorBody().innerHTML = textBlock + this.getEditorBody().innerHTML;
        }
        else
        {
            this.insertAtCursor(textBlock);
        }
        this.setHasTyped(true);
    },

    updateAttachmentMenu: function (attachments)
    {
        this.attachmentButton.createAttachmentMenu(attachments);
    },

    updateTextSampleMenu: function (textSamples)
    {
        this.textSampleButton.setTextSamples(textSamples);
    },

    updateSampleBlockMenu: function (sampleBlocks)
    {
        this.sampleButton.setSampleBlocks(sampleBlocks);
    },

    updateForTextBlockSelect: function (editorData)
    {
        this.parentContainer.updateForTextBlockSelect(editorData);
    },

    setIsInitializedWithSketch: function (isInitializedWithSketch)
    {
        this.isInitializedWithSketch = isInitializedWithSketch;
    },

    getMailId: function ()
    {
        return this.parentContainer.getMailId();
    },

    getToolbarCfg: function ()
    {
        var toolbarCfg = this.callParent(arguments);

        this.clipboardButton = new ClipboardButton({ parent: this });
        this.clipboardButton.itemId = 'htmlClipboardButton';
        this.clipboardButton.tooltip = '';
        this.clipboardButton.overflowText = LANGUAGE.getString('pasteFromClipBoard');

        this.attachmentButton = new ReplyAttachmentButton(
            {
                parentContainer: this,
                filePicker: this.filePicker
            });

        this.attachmentButton.itemId = 'htmlAttachmentButton';
        this.attachmentButton.tooltip = '';
        this.attachmentButton.overflowText = LANGUAGE.getString('chooseAttachment');

        this.textSampleButton = new ReplyTextSampleButton(
            {
                parentContainer: this
            });

        this.textSampleButton.itemId = 'htmlBrickButton';
        this.textSampleButton.tooltip = '';
        this.textSampleButton.overflowText = LANGUAGE.getString('addBrickButton');

        this.textSampleButton.hide();

        this.sampleButton = new SampleButton(
            {
                parentContainer: this
            });

        this.sampleButton.itemId = 'htmlTextSampelSelect';
        this.sampleButton.tooltip = '';
        this.sampleButton.overflowText = LANGUAGE.getString('chooseSample');

        toolbarCfg.items.push({ xtype: 'tbspacer', flex: 1 });

        Ext.each([this.clipboardButton, this.sampleButton, this.textSampleButton, this.attachmentButton], function (button)
        {
            button.transformHandler();
            toolbarCfg.items.push(button);
        }, this);

        return toolbarCfg;
    },

    showError: function (text, errorType)
    {
        this.parentContainer.showError(text, errorType);
    },

    showLoadingMask: function ()
    {
        if (this.dontShowWaitCursor)
        {
            return;
        }
        showBlackLoadingMask(this);

        var frame = this.getIframe();
        if (frame)
        {
            frame.style.backgroundImage = 'none';
        }
    },

    getIframe: function ()
    {
        if (isValid(this, "iframeEl.dom"))
        {
            return this.iframeEl.dom;
        }
        return null;
    },

    hideLoadingMask: function ()
    {
        hideLoadingMask(this);

        var frame = this.getIframe();
        if (frame)
        {
            frame.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage('mail', 64, COLOR_WATERMARK) + ')';
        }
    },

    onCreateMailSuccess: function (response)
    {
        this.hideLoadingMask();
    },

    onCreateMailException: function ()
    {
        this.hideLoadingMask();
    }
});

Ext.define('ReplyAttachmentButton',
{
    extend: 'ThinButton',
    
    arrowCls: 'background-color-arrow-down',
    icon: 'images/64/paperclip.png',
    iconName: 'paperclip',
    allowBlank: true,
    parentContainer: undefined,
    menu: [],
    border: 1,
    filePicker: undefined,
    attachments: undefined,
    style:
    {
        'background-color': COLOR_BACKGROUND,
        'border-color': NEW_GREY
    },
    listeners:
    {
        click: function (button)
        {
            if (!button.attachments || button.attachments.length <= 0)
            {
                button.filePicker.click();
            }

        },

        menushow: function (me, menu)
        {
            menu.beforeShowMenu(me);
        },

        menuhide: function ()
        {
            console.log("menuhide", arguments);
        },

        boxready: function (me)
        {
            me.getEl().dom.title = LANGUAGE.getString('tooltipAttachmentButton');
        }
    },

    initComponent: function ()
    {
        this.callParent();

        this.setMenu(new RankingMenu(
        {
            parentButton: this
        }));
    },

    addAttachment: function (attachment)
    {
        this.parentContainer.addAttachment(attachment);
    },

    createAttachmentMenu: function (attachments)
    {
        var self = this;
        this.attachments = attachments;
        var menu = [];

        if (attachments.length > 0)
        {
            Ext.iterate(attachments, function (attachment)
            {
                var score = 0;

                if (attachment.getScore && attachment.getScore())
                {
                    score = attachment.getScore();
                }

                menu.push(
                    {
                        text: attachment.getFileName(),
                        isRankingItem: true,
                        score: score,
                        attachmentId: attachment.getId(),
                        url: attachment.getURL(),
                        itemSize: attachment.getSize(),
                        icon: IMAGE_LIBRARY.getImage('paperclip', 64, NEW_GREY),
                        attachment: attachment,
                        handler: function (me)
                        {
                            self.addAttachment(me.attachment);
                        }
                    });
            });

            menu.push(new Ext.menu.Separator());

        }
        
        menu.push(
        {
            text: LANGUAGE.getString("file") + '...',
            icon: IMAGE_LIBRARY.getImage('paperclip', 64, NEW_GREY),
            handler: function ()
            {
                self.filePicker.click();
            }
        });

        this.getMenu().updateRankingMenu(menu);
    }
});

Ext.define('ReplyTextSampleButton',
{
    extend: 'ThinButton',
    arrowCls: 'background-color-arrow-down',
    icon: 'images/64/cubes.png',
    iconName: 'cubes',

    parentContainer: undefined,
    border: 1,
    textSamples: undefined,
    hidden: true,

    style:
    {
        'background-color': COLOR_BACKGROUND,
        'border-color': NEW_GREY
    },

    listeners:
    {
        boxready: function (me)
        {
            me.getEl().dom.title = LANGUAGE.getString('tooltipBrickButton');
        }
    },

    setTextSamples: function (textSamples)
    {
        this.textSamples = textSamples;

        if (this.textSamples.length > 0)
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    },

    handler: function ()
    {
        var self = this;
        var dialog = new TextBlockDialog(
            {
                mailId: this.getMailId()
            });
        dialog.setTextSamples(this.textSamples);
        dialog.onItemChosen = function (record)
        {
            if (isValidString(record.data.textBlock))
            {
                self.addTextBlock(record.data.textBlock);
            }
            else
            {
                self.addTextSample(record.data.textSample);
            }
        };
        dialog.show();
    },

    getMailId: function ()
    {
        return this.parentContainer.getMailId();
    },
    addTextBlock: function (textBlock)
    {
        this.parentContainer.addTextBlock(textBlock);
    },
    
    addTextSample: function (textSample)
    {
        var self = this;

        var doneFct = function (result)
        {
            if (result.getReturnValue().getCode() === 0)
            {
                self.addTextBlock(result.getTextBlockData().getText());
            }
            else
            {
                self.showError(result.getReturnValue().getDescription());
            }
        };

        var failFct = function (result)
        {
            self.showError(LANGUAGE.getString("errorGetTextBlock"));
        };

        SESSION.getTextBlock(this.getMailId(), textSample.getId(), doneFct, failFct);
    },
    
    showError: function (text, errorType)
    {
        this.parentContainer.showError(text, errorType);
    }
});

Ext.define('SampleButton',
{
    extend: 'ThinButton',
    
    allowBlank: true,
    parentContainer: undefined,
    border: 1,
    textSamples: undefined,
    hidden: true,
    icon: 'images/64/sampleTextIcon.png',
    iconName: 'sampleTextIcon',

    style:
    {
        'background-color': COLOR_BACKGROUND,
        'border-color': NEW_GREY
    },

    listeners:
    {
        boxready: function ()
        {
            this.getEl().dom.title = LANGUAGE.getString('chooseSample');
        }
    },

    handler: function ()
    {
        var self = this;
        
        var dialog = new TextSampleDialog(
        {
            mailId: self.getMailId()
        });
        dialog.setTextSamples(self.textSamples);
        dialog.onItemChosen = function (record)
        {
            self.getTextBlock(record.data.textSampleId, record.data.textSample);
        };
        dialog.show();
    },

    setSampleBlocks: function (textSamples)
    {
        this.textSamples = textSamples;

        if (this.textSamples.length > 0)
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    },

    getMailId: function (textBlockId)
    {
        return this.parentContainer.getMailId();
    },

    updateForTextBlockSelect: function (editorData)
    {
        this.parentContainer.updateForTextBlockSelect(editorData);
    },

    getTextBlocks: function ()
    {
        return this.parentContainer.getTextBlocks();
    },

    setIsInitializedWithSketch: function (isInitializedWithSketch)
    {
        this.parentContainer.setIsInitializedWithSketch(isInitializedWithSketch);
    },

    removeTextBlock: function ()
    {
        this.getTextBlock(-1, this.textSample);
    },

    getTextBlock: function (textBlockId, textSample)
    {
        var self = this;
        this.disable();
        var doneFunction = function (result)
        {
            var attachments = [];
            var textBlocks = [];
            var mailText = '';
            var availableAttachments = [];
            
            if (isValid(result.getMailTemplateData()))
            {
                if (isValid(result, 'getMailTemplateData().getMail().getAttachmentsEx()'))
                {
                    attachments = result.getMailTemplateData().getMail().getAttachmentsEx() || [];
                }

                if (isValid(result, 'getMailTemplateData().getAttachments()'))
                {
                    availableAttachments = result.getMailTemplateData().getAttachments() || [];
                }
    
                if (isValid(result, 'getMailTemplateData().getTextBlocks()'))
                {
                    textBlocks = result.getMailTemplateData().getTextBlocks() || [];
                }
                
                if (isValid(result.getMailTemplateData().getMail().getBody()))
                {
                    mailText = result.getMailTemplateData().getMail().getBody() || '';
                }

                var sketch =
                {
                    mailText: mailText,
                    mailId: self.getMailId(),
                    attachmentMenu: availableAttachments,
                    attachments: attachments,
                    textSamples: textBlocks,
                    name: textSample ? textSample.getName() : ""
                };

                self.updateForTextBlockSelect(sketch);

                self.setIsInitializedWithSketch(true);
            }
        };
    
        var failFunction = function (error)
        {
            console.log("Get sample block failed!");
            console.log(error);
            this.enable();
        };

        this.setIsInitializedWithSketch(false);
    
        SESSION.getMailTemplate(this.getMailId(), textBlockId || -1, doneFunction, failFunction);

        if (!textBlockId || textBlockId === -1)
        {
            this.getEl().dom.title = LANGUAGE.getString('chooseSample');
        }
        else
        {
            this.getEl().dom.title = textSample.getName();
        }
    },

    showError: function (text, errorType)
    {
        this.parentContainer.showError(text, errorType);
    }
});


Ext.define('TimeIntervalSelect',
{
    extend: 'Ext.form.field.ComboBox',

    margin: '2 0 0 20',
    valueField: 'value',
    displayField: 'text',
    queryMode: 'local',
    editable: false,
    value: TimeInterval.lastMonth.value,

    initComponent: function ()
    {
        this.store = new Ext.data.Store(
        {
            fields: ['value', 'text'],
            data: Object.values(TimeInterval)
        });
        this.callParent();

        this.on('boxready', function ()
        {
            this.inputEl.dom.style.cursor = 'pointer';
        }, this);

        this.on('change', function (combobox, newValue)
        {
            this.parentContainer.setTimeChooserOption(newValue);
        }, this);
    }
});

Ext.define('MergeTicketExpandableOptionsContainer',
{
    extend: 'Ext.Component',

    margin: '10 0 0 0',

    listeners:
    {
        boxready: function (me)
        {
            me.receiverOption = document.querySelector('#' + me.getId() + ' .reciverMergeOption');
            me.subjectOption = document.querySelector('#' + me.getId() + ' .subjectMergeOption');
            me.bodyOption = document.querySelector('#' + me.getId() + ' .bodyMergeOption');
            me.requestIdOption = document.querySelector('#' + me.getId() + ' .requestIdMergeOption');

            me.startDateInput = document.querySelector('#' + me.getId() + ' .startDateMergeOption');
            me.endDateInput = document.querySelector('#' + me.getId() + ' .endDateMergeOption');
            me.startDateField = Ext.create('Ext.form.field.Date',
            {
                renderTo: me.startDateInput,
                value: new Date()
            });
            me.endDateField = Ext.create('Ext.form.field.Date',
            {
                renderTo: me.endDateInput,
                value: new Date()
            });
        }
    },


    initComponent: function ()
    {
        this.callParent();

        this.update(this.createTemplate());
    },

    getReceiverOption: function ()
    {
        if (this.receiverOption.checked)
        {
            return this.receiverOption.value;
        }
        else
        {
            return '';
        }
    },

    getSubjectOption: function ()
    {
        if (this.subjectOption.checked)
        {
            return this.subjectOption.value;
        }
        else
        {
            return '';
        }
    },

    getBodyOption: function ()
    {
        if (this.bodyOption.checked)
        {
            return this.bodyOption.value;
        }
        else
        {
            return '';
        }
    },

    getRequestIdOption: function ()
    {
        if (this.requestIdOption.checked)
        {
            return this.requestIdOption.value;
        }
        else
        {
            return '';
        }
    },

    selectStartDateField: function ()
    {
        this.startDateField.focus();
    },

    setStartDate: function (value)
    {
        this.startDateField.setValue(value);
    },

    getStartDate: function ()
    {
        return this.startDateField.getValue().toISOString();
    },

    setEndDate: function (value)
    {
        this.endDateField.setValue(value);
    },

    getEndDate: function ()
    {
        var endDate = this.endDateField.getValue();
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        return endDate.toISOString();
    },

    getSearchOptions: function ()
    {
        var mailFieldOptions = [];

        mailFieldOptions = this.checkAndInsertCheckBoxValueIfNeeded(this.getReceiverOption(), mailFieldOptions);
        mailFieldOptions = this.checkAndInsertCheckBoxValueIfNeeded(this.getSubjectOption(), mailFieldOptions);
        mailFieldOptions = this.checkAndInsertCheckBoxValueIfNeeded(this.getBodyOption(), mailFieldOptions);
        mailFieldOptions = this.checkAndInsertCheckBoxValueIfNeeded(this.getRequestIdOption(), mailFieldOptions);

        return mailFieldOptions;
    },

    getSearchPeriod: function ()
    {
        return {
            startDate: this.getStartDate(),
            endDate: this.getEndDate()
        };
    },

    getSelectedOptions: function ()
    {
        return {
            searchFilter: this.getSearchOptions(),
            searchPeriod: this.getSearchPeriod()
        };
    },

    checkAndInsertCheckBoxValueIfNeeded: function (curValue, mailFieldOptions)
    {
        if (isValidString(curValue))
        {
            mailFieldOptions.push(curValue);
        }

        return mailFieldOptions;
    },

    createTemplate: function ()
    {
        var template =
        '<div>' +
            '<div class="hBoxLayout maxWidth smallMarginBottom">' +
                '<input type="checkbox" checked name="searchOption" value="From" class="reciverMergeOption" style="margin-top:5px"></input>' +
                '<label style="font-size:16px">' + LANGUAGE.getString('receiver') + '</label>' +
                '<input type="checkbox" checked name="searchOption" value="Subject" class="subjectMergeOption" style="margin:5px 0 0 15px">' +
                '<label style="font-size:16px">' + LANGUAGE.getString('subject') + '</label>' +            
                '<input type="checkbox" checked name="searchOption" value="Body" class="bodyMergeOption" style="margin:5px 0 0 15px">' +
                '<label style="font-size:16px">' + LANGUAGE.getString('requestText') + '</label>' +
                '<input type="checkbox" checked name="searchOption" value="Id" class="requestIdMergeOption"  style="margin:5px 0 0 15px">' +
                '<label style="font-size:16px">' + LANGUAGE.getString('requestNumber') + '</label>' +
            '</div>' +

            '<div class="maxWidth smallMarginBottom hBoxLayout">' +
                '<div class="vBoxLayout">' +
                    '<label class="doNotResize" style="font-size:16px">' + LANGUAGE.getString('from') + '</label>' +
                    '<div class="startDateMergeOption"></div>' +
                '</div>' +
                '<div class="vBoxLayout" style="margin-left:15px">' +
                    '<label class="doNotResize" style="font-size:16px">' + LANGUAGE.getString('to') + '</label>' +
                    '<div class="endDateMergeOption"></div>' +
                '</div>' +
            '</div>' +
        '</div>';

        return template;
    }
});

Ext.define('RankingMenu',
{
    extend: 'Ext.menu.Menu',

    listeners:
    {
        mouseleave: function (me)
        {
            if (isValid(window, 'rankingMenuData.rankingTooltip'))
            {
                window.rankingMenuData.rankingTooltip.hide();
                window.rankingMenuData.rankingTooltip = undefined;
            }
        },
        beforehide: function ()
        {
            if (isValid(window, 'rankingMenuData.rankingTooltip'))
            {
                window.rankingMenuData.rankingTooltip.hide();
                window.rankingMenuData.rankingTooltip = undefined;
            }
        }
    },

    updateRankingMenu: function (items)
    {
        var me = this;

        this.removeAll(true);

        Ext.iterate(items, function (item)
        {
            if (item.isRankingItem)
            {
                //item.text = me.getRankingText(item.text, item.score);
            }
        });

        this.add(items);
    },

    getRankingText: function (name, score)
    {
        return '<div class="hBoxLayout maxWidth">' +
                    '<div class="hBoxLayout flexItem">' + name + '</div>' +
                    this.getStarsForScore(score) +
                    ' <div style="width:40px;" class="hBoxLayout smallMarginLeft">' +
                        '<span style="width:40px;text-align:right;">(' + score + '%)</span>' +
                    '</div>' +
                '</div>';
    },

    beforeShowMenu: function (button)
    {
        var items = document.querySelectorAll('#' + this.getId() + ' .x-menu-item-text.x-menu-item-text-default.x-menu-item-indent');

        var getMaxWidth = function (items)
        {
            var width = 0;

            Ext.iterate(items, function (item)
            {
                if (item.clientWidth > width)
                {
                    width = item.clientWidth;
                }
            });

            return width;
        };

        var maxWidth = getMaxWidth(items);

        Ext.iterate(items, function (item, index)
        {
            item.style.width = maxWidth + 'px';
        });
        
        var xPosition = button.getX() + button.getWidth();

        if (xPosition > 0)
        {
            this.setX(xPosition - this.getWidth());
        }

        this.addListenerForRankingTooltip();
    },

    addListenerForRankingTooltip: function ()
    {
        var self = this;

        if (!window.rankingMenuData)
        {
            window.rankingMenuData = {};
            window.rankingMenuData.rankingTooltip = undefined;
        } 

        var tooltip = window.rankingMenuData.rankingTooltip;

        var rankingNodes = document.querySelectorAll('#' + this.getId() + ' .x-menu-item-link');

        var startIndex = 0;

        var separatorIndex = -1;

        if (rankingNodes.length !== self.items.length)
        {
            separatorIndex = 0;

            for (var i = 0; i < self.items.length; i++)
            {
                var curItem = self.items.getAt(i);

                if (curItem.xtype === 'menuseparator')
                {
                    separatorIndex = i;
                    break;
                }
            }
        }

        Ext.iterate(rankingNodes, function (rankingNode, index)
        {
            if (separatorIndex >= 0 && index >= separatorIndex)
            {
                index += 1;
            }

            if (self.getTextForId && self.items.getAt(index).isRankingItem)
            {
                rankingNode.addEventListener('mouseover', function (me)
                {
                    tooltip = window.rankingMenuData.rankingTooltip;

                    if (tooltip && tooltip.destroyed)
                    {
                        tooltip = undefined;
                    }

                    var textId = self.items.getAt(index).textSampleId;

                    var callbackFunction = function (text, isLoading)
                    {
                        if (!window.rankingMenuData[textId])
                        {
                            window.rankingMenuData[textId] = text;
                        }

                        if (self.hidden || parseInt(self.curTextId) !== parseInt(textId))
                        {
                            return;
                        }

                        tooltip.updateContentHtml('<div>' + text + '</div>', textId);
                    };

                    if (!tooltip || (isValid(tooltip, 'textId') && tooltip.textId !== textId))
                    {
                        self.curTextId = textId;

                        if (!tooltip)
                        {
                            window.rankingMenuData.rankingTooltip = new RankingTooltip(
                            {
                                target: VIEWPORT,
                                targetX: self.el.getX(),
                                targetY: self.el.getY(),
                                textId: textId,
                                contentHtml: '<div></div>',
                                minHeight: 100,
                                minWidth: 100
                            });

                            tooltip = window.rankingMenuData.rankingTooltip;
                        }
                        else
                        {
                            tooltip.updateContentHtml('<div></div>', self.items.getAt(index).textSampleId);
                        }

                        if (!window.rankingMenuData[self.items.getAt(index).textSampleId])
                        {
                            self.getTextForId(self.items.getAt(index).textSampleId, callbackFunction);

                            tooltip.updateContentHtml('<div></div>', textId);
                        }
                        else
                        {
                            callbackFunction(window.rankingMenuData[self.items.getAt(index).textSampleId], false);
                        }
                    }
                    else if (isValid(self, 'rankingTooltip.hidden') && self.rankingTooltip.hidden)
                    {
                        tooltip.show();
                    }
                });
            }
            else
            {
                rankingNode.addEventListener('mouseover', function (me)
                {
                    if (isValid(window, 'rankingMenuData.rankingTooltip'))
                    {
                        window.rankingMenuData.rankingTooltip.hide();
                        window.rankingMenuData.rankingTooltip = undefined;
                    }
                });
            }
        });
    },

    createRankingStars: function (counter)
    {
        var result = '<div class="smallMarginLeft hBoxLayout">';

        for (var i = 0; i < 5; i++)
        {
            if (i < counter)
            {
                result += '<img class="smallMarginLeft" height="16px" width="16px" src="' + IMAGE_LIBRARY.getImage('favorite', 64, COLOR_FAVORITE_BUTTON) + '" />';
            }
            else
            {
                result += '<img class="smallMarginLeft" height="16px" width="16px" src="' + IMAGE_LIBRARY.getImage('favorite', 64, TITLE_GREY) + '" />';
            }

        }

        result += '</div>';

        return result;
    },

    getStarsForScore: function (score)
    {
        if (score > SampleRating.fiveStars.minValue)
        {
            return this.createRankingStars(SampleRating.fiveStars.returnValue);
        }
        else if (score > SampleRating.fourStars.minValue)
        {
            return this.createRankingStars(SampleRating.fourStars.returnValue);
        }
        else if (score > SampleRating.threeStars.minValue)
        {
            return this.createRankingStars(SampleRating.threeStars.returnValue);
        }
        else if (score > SampleRating.twoStars.minValue)
        {
            return this.createRankingStars(SampleRating.twoStars.returnValue);
        }
        else if (score > SampleRating.oneStar.minValue)
        {
            return this.createRankingStars(SampleRating.oneStar.returnValue);
        }
        else
        {
            return this.createRankingStars(SampleRating.noStar.returnValue);
        }
    },

    initComponent: function ()
    {
        this.callParent();
    }
});

Ext.define('RankingTooltip',
{
    extend: 'Ext.tip.ToolTip',
    autoHide: true,
    trackMouse: false,
    cls: 'dialogWithArrow',
    mouseOffset: [5, 5],
    maxWidth: 550,
    defaultAlign: 'tr-tl',
    souldDestroy: false,

    style:
    {
        'background-color': WHITE,
        'box-shadow': 'rgb(136, 136, 136) 2px 2px 6px !important'
    },

    listeners:
    {
        boxready: function (me)
        {
            me.updateContentHtml(this.contentHtml, this.textId);
        }
    },

    hide: function ()
    {
        if (this.destroyed)
        {
            return;
        }

        this.callParent();

        this.destroy();
    },

    updateContentHtml: function (contentHtml, textId)
    {
        if (this.destroyed)
        {
            return;
        }

        if (this.textId !== textId || this.contentHtml === '<div></div>')
        {
            this.textId = textId;
            this.contentHtml = contentHtml;

            this.showComponent.update(this.contentHtml);

            if (this.hidden)
            {
                this.show();
            }          
        }

        if (isValid(this, 'target.el.getX'))
        {
            var xPos = this.targetX - this.getWidth();
            this.setX(xPos);

            var yPos = this.targetY;

            if (yPos + this.getHeight() < window.innerHeight)
            {
                this.setY(yPos);
            }
            else
            {
                var newHeight = window.innerHeight - this.getHeight();

                if (newHeight < 0)
                {
                    newHeight = 0;
                }

                this.setY(newHeight);
            }

        }
        
        if (contentHtml === '<div></div>')
        {
            showBlackLoadingMask(this.showComponent);
        }
        else
        {
            hideLoadingMask(this.showComponent);
        }
    },

    skipShow: function ()
    {
        return !this.mouseIsOverTarget;
    },

    isContextMenuVisible: function ()
    {
        return false;
    },

    getCurrentContact: function ()
    {
        return null;
    },

    onTargetOut: function (e)
    {
        // We have exited the current target
        if (this.mouseOver === false && this.currentTarget.dom && !this.currentTarget.contains(e.relatedTarget))
        {
            this.handleTargetOut();
        }
    },

    initComponent: function () 
    {
        this.callParent();

        var self = this;

        this.showComponent = this.add(new Ext.Component(
        {
            html: this.contentHtml,   
            flex: 1,
            height: '100%'
        }));

        showBlackLoadingMask(this.showComponent);

        var targetEl = this.target.el || this.target;

        targetEl.on('mouseover', function ()
        {
            self.mouseIsOverTarget = true;
        });

        targetEl.on('mouseout', function ()
        {
            self.mouseIsOverTarget = false;
        });
    }
    });

Ext.define('DeleteTemplateButton',
{
    extend: Ext.Component,

    parentContainer: null,

    text: "",

    templateId: "",

    initComponent: function ()
    {
        var tooltip = LANGUAGE.getString("chosenTemplate", this.text);
        this.renderTpl = '<div style="height:24px;padding:0 5px 0 10px;display:flex;align-items:center;min-width: 125px; border-radius:' + BORDER_RADIUS_BUTTONS + ';border:1px solid ' + NEW_GREY + ' " title="' + tooltip + '">' +
            '<div style="background-image:url(' + IMAGE_LIBRARY.getImage("sampleTextIcon", 64, NEW_GREY) + ');width:16px;height:16px;background-size:contain"></div>' +
            '<div style="margin-left:5px;flex:1;color: ' + NEW_GREY + '">' + this.text + '</div>' +
            '<div class="removeButton" title="' + LANGUAGE.getString("removeTemplate") + '" style="cursor:pointer;margin-left:25px;background-image:url(' + IMAGE_LIBRARY.getImage("delete", 64, NEW_GREY) + ');width:16px;height:16px;background-size:contain"></div>' +
        '</div>';
        this.callParent();

        this.on('boxready', function ()
        {
            this.getEl().on('click', function (event, node)
            {
                this.onClick(this.templateId);
            }, this, { delegate: '.removeButton' });
        }, this);
    },

    onClick: function (templateId)
    {

    }
});