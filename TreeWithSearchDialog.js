function createStar(color, additionalStyle, additionalAttributesForDiv)
{
    additionalStyle = additionalStyle || "";
    additionalAttributesForDiv = additionalAttributesForDiv || "";
    var image = IMAGE_LIBRARY.getImage('favorite', 64, color);
    return '<div ' + additionalAttributesForDiv + 'class="smallMarginLeft" style="margin:0 2px;height:16px;width:20px;background-size:16px 16px;background-repeat:no-repeat;background-image:url(' + image + ');' + additionalStyle + '" ></div>';
}

Ext.define('StarThresholdControl',
{
    extend: 'Ext.Component',

    minNumberStars: 3,

    clientSettingsKey: '',

    childEls: ['star0', 'star1', 'star2', 'star3', 'star4'],

    initComponent: function ()
    {
        if (!isValidString(this.clientSettingsKey))
        {
            console.error("StarThresholdControl: no clientSettingsKey available!");
            return;
        }
        var savedMinNumberStars = CLIENT_SETTINGS.getSetting("EMAILS", this.clientSettingsKey);
        if (savedMinNumberStars)
        {
            this.minNumberStars = parseInt(savedMinNumberStars, 10);
        }

        this.renderTpl = '<div style="display:flex">';
        for (var i = 0; i < this.minNumberStars; i++)
        {
            this.renderTpl += createStar(COLOR_FAVORITE_BUTTON, '', 'id="{id}-star' + i + '" data-ref="star' + i + '"');
        }

        for (var i = this.minNumberStars; i < 5; i++)
        {
            this.renderTpl += createStar(TITLE_GREY, '', 'id="{id}-star' + i + '" data-ref="star' + i + '"');
        }
        this.renderTpl += '<div>' + LANGUAGE.getString("andMore") + '</div>';
        this.renderTpl += '</div>';
        this.callParent();

        var self = this;
        this.on('boxready', function ()
        {
            var stars = [this.star0, this.star1, this.star2, this.star3, this.star4];
            
            Ext.each(stars, function (star)
            {
                star.on('click', function ()
                {
                    var minNumberStars = 0;
                    var reached = false;
                    Ext.each(stars, function (starToBeRepainted)
                    {
                        if (!reached)
                        {
                            minNumberStars++;
                        }
                        starToBeRepainted.dom.style.backgroundImage = 'url(' + IMAGE_LIBRARY.getImage('favorite', 64, reached ? TITLE_GREY : COLOR_FAVORITE_BUTTON) + ')';
                        if (star === starToBeRepainted)
                        {
                            reached = true;
                        }
                    }, this);

                    this.minNumberStars = minNumberStars;
                    this.onNewMinimumNumberStars(minNumberStars);

                    CLIENT_SETTINGS.addSetting("EMAILS", this.clientSettingsKey, minNumberStars);
                    CLIENT_SETTINGS.saveSettings();
                }, this);
            }, this);
        }, this);
    },

    onNewMinimumNumberStars: function (threshold)
    {

    },

    getMinNumberStars: function ()
    {
        if (this.isVisible())
        {
            return this.minNumberStars;
        }
        return 0;
    }
    });

Ext.define('PreviewContainer',
    {
        extend: 'Ext.Component',

        scrollable: 'vertical',
        
        setEmptyText: function (text)
        {
            this.update('<div style="margin:5px 0 0 0;font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_EMPTY_TEXT + '">' + text + '</div>');
        },

        showLoadingMask: function ()
        {
            showBlackLoadingMask(this);
        },

        hideLoadingMask: function ()
        {
            hideLoadingMask(this);
        }
    });

var TREE_DIALOG_WIDTH_COLLAPSED = 500;
var TREE_DIALOG_WIDTH_EXPANDED = 978;

var CLIENT_SETTINGS_VALUE_ALL = "All";
var CLIENT_SETTINGS_VALUE_SUGGESTIONS = "Suggestions";
var CLIENT_SETTINGS_VALUE_PREVIEW_VISIBLE = "previewVisible";

Ext.define('TreeWithSearchDialog', {
    extend: 'ModalDialog',

    initComponent: function () {
        //this.titleText = LANGUAGE.getString('sample');
        this.callParent();

        var me = this;

        this.setMinHeight(window.innerHeight * 0.8);
        this.setMaxHeight(window.innerHeight * 0.8);

        var mainContainer = this.addToBody(new Ext.Container(
            {
                layout:
                {
                    type: 'hbox',
                    align: 'stretch'
                },
                flex: 1
            }));

        var leftContainer = mainContainer.add(new Ext.Container({
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            flex: 1
        }));

        var previewVisible = !!CLIENT_SETTINGS.getSetting("EMAILS", CLIENT_SETTINGS_VALUE_PREVIEW_VISIBLE);

        var rightContainer = mainContainer.add(new Ext.Container(
            {
                hidden: !previewVisible,
                margin: '0 0 0 20',
                flex: 1,
                layout:
                {
                    type: 'vbox',
                    align: 'stretch'
                },

                items:
                    [
                        new Ext.form.Label(
                            {
                                text: LANGUAGE.getString("preview"),
                                style: 'color:' + COLOR_MAIN + ';font-size:' + FONT_SIZE_NAME + 'px'
                            })
                    ]
            }));
        this.previewContainer = rightContainer.add(new PreviewContainer(
            {
                flex: 1,
                scrollable: true,
                margin: '5 0 0 0',
                padding: '5 10',
                emptyText: this.getEmptyTextForPreview(),
                style: 'border: 1px solid ' + BORDER_GREY
            }));

        this.store = Ext.create('Ext.data.TreeStore', {

        });
        
        this.searchField = leftContainer.add(new InstantSearchField(
            {
                emptyText: this.getEmptyTextForSearchField(),
                startSearch: function (searchString) {
                    me.filterStore();
                },

                onKeyCursorDown: function () {
                    me.valueTree.focus();
                }
    }));

        var pressedSegmentedButton = CLIENT_SETTINGS.getSetting("EMAILS", this.getClientSettingsKeyForSegmentedButton());

        var heightThresholdControl = 22;
        this.segmentedButton = leftContainer.add(Ext.create('Ext.button.Segmented',
            {
            margin: (heightThresholdControl + 5) + ' 50 5 50',
            allowMultiple: false,
            cls: 'segmentedButton',
            items:
            [
                {
                    text: LANGUAGE.getString("all"),
                    scale: 'medium',
                    style: {
                        borderColor: COLOR_MAIN_2,
                        borderStyle: 'solid'
                    },
                    pressed: !pressedSegmentedButton || pressedSegmentedButton === CLIENT_SETTINGS_VALUE_ALL,
                    handler: function (button)
                    {
                        CLIENT_SETTINGS.addSetting("EMAILS", me.getClientSettingsKeyForSegmentedButton(), CLIENT_SETTINGS_VALUE_ALL);
                        CLIENT_SETTINGS.saveSettings();

                        me.hideThresholdControl();
                        Ext.asap(() =>
                        {
                            me.filterStore();
                        });
                    }
                },
                {
                    text: LANGUAGE.getString("suggestions"),
                    scale: 'medium',
                    style: {
                        borderColor: COLOR_MAIN_2,
                        borderStyle: 'solid'
                    },
                    pressed: pressedSegmentedButton === CLIENT_SETTINGS_VALUE_SUGGESTIONS,
                    handler: function (button)
                    {
                        CLIENT_SETTINGS.addSetting("EMAILS", me.getClientSettingsKeyForSegmentedButton(), CLIENT_SETTINGS_VALUE_SUGGESTIONS);
                        CLIENT_SETTINGS.saveSettings();

                        me.showThresholdControl();
                        Ext.asap(() =>
                        {
                            me.filterStore();
                        });
                    },
                    onStoreFiltered: function ()
                    {
                        var numberRecordsWithScore = 0;
                        Ext.each(me.structurizedTextSamples.children, function (record)
                        {
                            numberRecordsWithScore += this.countRecordsWithScore(record);
                        }, this, true);

                        var text = LANGUAGE.getString("suggestions");
                        if (numberRecordsWithScore > 0)
                        {
                            text += '<div class="badge" style="position:absolute;top:-2px;right:35px">' + numberRecordsWithScore + '</div>';
                        }
                        this.setText( text);
                    },

                    countRecordsWithScore: function (record)
                    {
                        var number = 0;
                        if (record.leaf && me.isNameMatched(record.textSample, me.searchField.getValue()) && me.isScoreSufficient(record.score, me.thresholdControl.minNumberStars))
                        {
                            number++;
                        }
                        Ext.each(record.children, function (child)
                        {
                            number += this.countRecordsWithScore(child);
                        }, this);
                        return number;
                    }
                }
            ],
            onStoreFiltered: function ()
            {
                this.each(function (button)
                {
                    if (button.onStoreFiltered)
                    {
                        button.onStoreFiltered();
                    }
                });
            }
        }));

        this.thresholdControl = new StarThresholdControl(
        {
            hidden: pressedSegmentedButton !== CLIENT_SETTINGS_VALUE_SUGGESTIONS,
            clientSettingsKey: this.getClientSettingsKeyForMinimumNumberStars(),
            margin: '5 0 0 0',
            onNewMinimumNumberStars: function (minNumberStars)
            {
                me.filterStore();
            },
            listeners:
            {
                boxready: function (control, width, height)
                {
                    this.initialHeight = height;
                }
            }
        });
        this.tresholdControlContainer = leftContainer.add(new Ext.Container(
        {
            margin: '0 60 0 0',
            layout:
            {
                type: 'hbox',
                pack: 'end'
            },
            items: [this.thresholdControl],
            height: heightThresholdControl
        }));

        //ein TreePanel von ExtJs ist ziemlich lahm. Es geht wesentlich flotter, wenn man dem Panel ein plugin namens bufferedRenderer gibt.
        //Aber, dann muss das Panel eine feste Höhe haben!
        //Da wir das nicht wollen, legen wir erstmal einen Platzhalter an (selbe Konfiguration wie valueTree, aber ohne bufferedRenderer),
        //holen uns dessen Höhe und tauschen diesen gegen valueTree aus (im show-Event)
        this.valueTree = this.createTreePanel(true);
        this.placeHolderForValueTree = leftContainer.add(this.createTreePanel(false));
        var me = this;
        leftContainer.add(new Ext.Container(
        {
            margin: '0 0 10 0',
            layout:
            {
                type: 'hbox',
                align: 'stretch'
            },
            items:
            [
                Ext.create('Ext.Component',
                {
                    flex: 1
                }),
                new RoundThinButton(
                {
                    minWidth: 175,
                    text: LANGUAGE.getString(previewVisible ? 'hidePreview' : 'showPreview'),
                    handler: function ()
                    {
                        this.blur();
                        
                        if (me.rightContainerVisible)
                        {
                            this.setText(LANGUAGE.getString('showPreview'));
                            
                            me.animate({
                                to:
                                {
                                    width: TREE_DIALOG_WIDTH_COLLAPSED
                                },
                                duration: 250,
                                listeners:
                                {
                                    afteranimate: function ()
                                    {
                                        me.previewContainer.setEmptyText('');
                                        rightContainer.hide();
                                        me.rightContainerVisible = false;
                                    }    
                                }
                            });
                        }
                        else
                        {
                            this.setText(LANGUAGE.getString('hidePreview'));
                            rightContainer.show();
                            me.animate({
                                to:
                                {
                                    width: TREE_DIALOG_WIDTH_EXPANDED
                                },
                                duration: 250,
                                listeners: {
                                    afteranimate: function () {
                                        var selectedRecord = me.getSelectedRecord();
                                        me.onItemExpanded(selectedRecord);
                                    }
                                }
                            });
                            me.rightContainerVisible = true;
                        }
                    },
                        listeners: {
                            boxready: function () {
                                me.rightContainerVisible = rightContainer.isVisible();
                            }
                        }
                })
            ]
        }));

        rightContainer.add(new Ext.Container(
            {
                margin: '10 0 10 0',
                layout:
                {
                    type: 'hbox',
                    align: 'stretch'
                },
                items:
                    [
                        new RoundThinButton(
                            {
                                style:'visibility:hidden'
                            })
                    ]
            }));
        this.okButton = this.addButton(
        {
            text: LANGUAGE.getString('apply'),
            handler: function ()
            {
                var selectedRecord = me.getSelectedRecord();
                if (me.isSelectableRecord(selectedRecord))
                {
                    me.hide();
                    Ext.asap(() =>
                    {
                        me.onItemChosen(selectedRecord);
                    });
                }
            }
        });
        Ext.asap(() =>
        {
            me.searchField.focus();
        });

        this.setMaxWidth(1000);
        this.setWidth(previewVisible ? TREE_DIALOG_WIDTH_EXPANDED : TREE_DIALOG_WIDTH_COLLAPSED);

        this.on('boxready', () =>
        {
            showBlackLoadingMask(this.valueTree);
        }, this);

        this.on('show', function ()
        {
            var self = this;
            setTimeout(() =>
            {
                Ext.batchLayouts(function ()
                {
                    self.segmentedButton.each(function (button)
                    {
                        if (button.pressed)
                        {
                            button.handler(button);
                        }
                    });

                    Ext.asap(() =>
                    {
                        var height = this.placeHolderForValueTree.getHeight();
                        this.valueTree.setHeight(height);
                        leftContainer.replace(this.placeHolderForValueTree, this.valueTree);
                    });
                }, self);
            }, 300);
        }, this);

        this.on('beforehide', function () {
                CLIENT_SETTINGS.addSetting("EMAILS", CLIENT_SETTINGS_VALUE_PREVIEW_VISIBLE, this.rightContainerVisible);
                CLIENT_SETTINGS.saveSettings();
            });
    },

    createTreePanel: function (withBufferedRenderer)
    {
        var me = this;
        var config = {
            cls: 'treeWithSearchPanel',
            store: this.store,
            rootVisible: false,
            hideHeaders: true,
            useArrows: true,
            margin: '10 0 10 0',

            listeners: {
              
                
                itemcontextmenu: function (tree, record, item, index, event)
                {
                    var customMenu = new CustomMenu(
                        {
                            insertItems:
                                [
                                    {
                                        text: LANGUAGE.getString('expand'),
                                        handler: function ()
                                        {
                                            tree.expandAll();
                                        }
                                    },
                                    {
                                        text: LANGUAGE.getString('comprimize'),
                                        handler: function ()
                                        {
                                            tree.collapseAll();
                                        }
                                    }
                                ]
                        });
                    x = event.browserEvent.clientX;
                    y = event.browserEvent.clientY;

                    customMenu.showAt([x, y]);
                },
                itemclick: function (tree, record)
                {
                    me.onItemClickedOrNavigated(record);
                },
                itemdblclick: function (tree, record, index)
                {
                    if (me.isSelectableRecord(record))
                    {
                        me.hide();
                        Ext.asap(() =>
                        {
                            me.onItemChosen(record);
                        });
                    }
                }
            },


            onKeyDOWN: function (selectedElement) {
                me.onItemClickedOrNavigated(selectedElement[0]);
            },

            onKeyUP: function (selectedElement) {
                me.onItemClickedOrNavigated(selectedElement[0]);
            },

            onKeyENTER: function (selectedElement) {
                if (selectedElement[0].firstChild) {
                    if (selectedElement[0].data.expanded) {
                        this.collapseNode(selectedElement[0]);
                    }
                    else {
                    this.expandNode(selectedElement[0]);
                    }
                }
                else if (me.isSelectableRecord(selectedElement[0])) {
                    me.hide();
                    Ext.asap(() => {
                        me.onItemChosen(selectedElement[0]);
                    });
                }
            },
            columns:
                [
                    {
                        xtype: 'treecolumn',
                        flex: 1,
                        dataIndex: 'text',
                        data: "identifier",
                        scope: me.valueTree,
                        border: false
                    },
                    {
                        xtype: 'treecolumn',
                        dataIndex: 'score',
                        focusable: false,
                        width: 125,
                        cellTpl: '<div style="margin-top:2px;display:flex">{value}</div>',
                        renderer: function (value, meta, record)
                        {
                            if (me.isSelectableRecord(record))
                            {
                                var score = value || 0;
                                var numberOrangeStars = (score / 100) * 5; //auf fünf Sterne runterbrechen
                                var numberFullOrangeStars = Math.floor(numberOrangeStars);
                                var numberFullGreyStars = 5 - numberFullOrangeStars;
                                if (numberFullOrangeStars !== numberOrangeStars)
                                {
                                    numberFullGreyStars--;
                                }
                                var numberHalfStars = me.round(numberOrangeStars - numberFullOrangeStars);
                                var result = '<div style="display:flex" title="' + score + '% ' + LANGUAGE.getString("match") + '">';

                                for (var i = 0; i < numberFullOrangeStars; i++)
                                {
                                    result += createStar(COLOR_FAVORITE_BUTTON);
                                }

                                if (numberHalfStars === 0.5)
                                {
                                    result += '<div style="position:relative">' + createStar(TITLE_GREY) + createStar(COLOR_FAVORITE_BUTTON, "position:absolute;width:" + numberHalfStars * 16 + "px;left:0;top:0") + '</div>';
                                }

                                for (var i = 0; i < numberFullGreyStars; i++)
                                {
                                    result += createStar(TITLE_GREY);
                                }
                                result += '</div>';
                                return result;

                            }
                            return " ";
                        }
                    }
                ]
        };

        if (withBufferedRenderer)
        {
            config.plugins = { ptype: 'bufferedrenderer' };
        }
        else
        {
            config.flex = 1;
        }

        var treePanel = Ext.create('Ext.tree.Panel', config);

        treePanel.on('cellkeydown', function (table, td, cellIndex, record, tr, rowIndex, e, eOpts) 
        {
            if (e.getKey() === e.DOWN) {
                this.onKeyDOWN(this.getSelection());
            }
            else if (e.getKey() === e.UP) {
                this.onKeyUP(this.getSelection());
            }
            else if (e.getKey() === e.ENTER) {
                this.onKeyENTER(this.getSelection());
            }
        }, treePanel, { buffer: 300 });
        return treePanel;
    },

    getClientSettingsKeyForMinimumNumberStars: function ()
    {
        return "minNumberStarsForTextSamples";
    },

    getClientSettingsKeyForSegmentedButton: function ()
    {
        return "segmentedButtonPressed";
    },

    round: function(floatValue) {
        floatValue = parseFloat(floatValue);
        if (!floatValue)
        {
            return 0;
        }
        if (floatValue < 0.25)
        {
            return 0;
        }
        if (floatValue < 0.9)
        {
            return 0.5;
        }
        return 1;
    },

    filterStore: function ()
    {
        showBlackLoadingMask(this.valueTree);
        
        Ext.asap(() =>
        {
            Ext.batchLayouts(() =>
            {
                var searchString = this.searchField.getValue();
                var minNumberStars = this.thresholdControl.getMinNumberStars();



                if (isValidString(searchString) || minNumberStars > 0)
                {
                    this.store.clearFilter(true);   //true bedeutet hier, dass kein event ausgelöst wird. Es gab halt ein komisches Verhalten des Controls, 
                                                    //wenn man eine Suche mit 0 Treffern angestossen hat, dann war nichts zu sehen, aber ein Scrollbalken
                    this.store.filterBy(function (record)
                    {
                        var nodesMatchingName = this.getNodesMatchingName(record, searchString);

                        var sufficientScore = false;
                        Ext.each(nodesMatchingName, function (node)
                        {
                            if (this.isScoreSufficient(this.getScore(node)))
                            {
                                sufficientScore = true;
                                return false;
                            }
                        }, this);
                        return sufficientScore;
                    }, this);

                    this.valueTree.expandAll();

                    this.selectFirstLeaf();
                }
                else
                {
                    this.store.clearFilter();
                    this.valueTree.collapseAll();

                    //warum die selektion nochmal selektieren? Fall: wir wechseln zw. "Alle" und "Vorschläge" hin und her. Dadurch wird ja jedesmal ne Filterung angestossen, 
                    //aber die Selektion verschwindet optisch
                    //wenn die Selektion aber nicht mehr im Store ist (weil nicht sichtbar), selektieren wir einfach den ersten record
                    var record = this.getSelectedRecord();
                    if (this.store.indexOf(record) === -1)
                    {
                        record = null;
                    }
                    if (!record)
                    {
                        record = this.getFirstRecord();
                    }
                    this.valueTree.selectPath(record);
                    this.onItemClickedOrNavigated(record);
                }
                hideLoadingMask(this.valueTree);

                this.segmentedButton.onStoreFiltered();
            }, this);
        });
    },

    isScoreSufficient: function (score, minNumberStars)
    {
        minNumberStars = minNumberStars || this.thresholdControl.getMinNumberStars();
        return score >= minNumberStars * 20;
    },

    getSelectedRecord: function ()
    {
        var selection = this.valueTree.getSelection();
        if (!Ext.isEmpty(selection))
        {
            return selection[0];
        }
        return null;
    },

    onItemClickedOrNavigated: function (record) //wird auch beim expandieren des windows benutzt
    {
        if (this.isSelectableRecord(record))
        {
            this.okButton.enable();
            if (this.rightContainerVisible)
            {
                this.onItemSelected(record);
            }
        }
        else
        {
            this.previewContainer.setEmptyText(this.getEmptyTextForPreview());
            this.okButton.disable();
        }
        this.lastSelectedRecord = record;
    },

    onItemExpanded: function (record) {
        if (this.isSelectableRecord(record)) {
            this.loadPreviewFromServer(record);
        }
        else
        {
            this.previewContainer.setEmptyText(this.getEmptyTextForPreview());
        }
    },
    

    onItemSelected: function (record)
    {
        if (this.isSelectableRecord(record) && record !== this.lastSelectedRecord)
        {
            this.loadPreviewFromServer(record);
        }
    },

    isSelectableRecord: function (record)
    {
        return isValid(record) && record.data.leaf;
    },

    selectFirstLeaf: function ()
    {
        var record = this.getFirstLeaf();
        if (isValid(record))
        {
            this.valueTree.selectPath(record);
        }
        this.onItemClickedOrNavigated(record);
    },

    getFirstLeaf: function ()
    {
        var foundRecord;
        this.store.each(function (record)
        {
            if (record.data.leaf)
            {
                foundRecord = record;
                return false;
            }
        });
        return foundRecord;
    },

    getFirstRecord: function ()
    {
        var foundRecord;
        this.store.each(function (record)
        {
            foundRecord = record;
            return false;
        });
        return foundRecord;
    },

    getScore: function (record)
    {
        if (record.data)
        {
            record = record.data;
        }
        if (record.leaf || record.score)
        {
            return record.score || 0;
        }
        //get Score of Children
        var highestScoreOfChildren = 0;
        Ext.each(record.children, function (child)
        {
            highestScoreOfChildren = Math.max(highestScoreOfChildren, this.getScore(child));
        }, this);

        record.score = highestScoreOfChildren;
        return highestScoreOfChildren;

    },

    getNodesMatchingName: function (record, searchString)
    {
        var node = record.data || record;
        
        if (searchString === "" || this.isRoot(node) || (node.textSample && this.isNameMatched(node.textSample, searchString)))
        {
            return [node];
        }
        var childrenMatchingName = [];
        Ext.each(node.children, function (child)
        {
            childrenMatchingName = childrenMatchingName.concat(this.getNodesMatchingName(child, searchString));
        }, this);
        return childrenMatchingName;
    },

    isRoot: function (node)
    {
        return node.text === "Root";
    },

    isNameMatched: function (node, searchString)
    {
        var regExp = new RegExp(searchString, 'i');
        return node && regExp.test(node.Name);
    },

    showThresholdControl: function ()
    {
        this.thresholdControl.show();
    },

    hideThresholdControl: function ()
    {
        this.thresholdControl.hide();
    },

    structurizeByName: function (textSamples)
    {
        var result = {
            expanded: true,
            children: []
        };
        
        Ext.each(textSamples, function (textSample, index)
        {
            if (!isValid(textSample))
            {
                return;
            }

            var nameParts = this.splitNodeName(textSample); //split nach # oder +
            var currentNode = result.children;
            Ext.each(nameParts, function (namePart, nameIndex)
            {
                if (nameIndex === nameParts.length - 1)
                {
                    currentNode.push({
                        leaf: true,
                        textSampleId: textSample.Id,
                        icon: IMAGE_LIBRARY.getImage(this.getLeafIconName(), 64, NEW_GREY),
                        textSample: textSample,
                        text: namePart,
                        score: textSample.Score
                    });
                }
                else
                {
                    var foundChild;
                    Ext.each(currentNode, function (child)
                    {
                        if (child.text === namePart)
                        {
                            foundChild = child;
                        }
                    });
                    if (foundChild)
                    {
                        currentNode = foundChild.children;
                    }
                    else
                    {
                        var newNode = {
                            icon: IMAGE_LIBRARY.getImage('folder3', 64, NEW_GREY),
                            text: namePart,
                            children: [],
                            leaf: false,
                            textSample: textSample
                        };
                        currentNode.push(newNode);
                        currentNode = newNode.children;
                    }
                }
            }, this);
        }, this);

        this.sortChildren(result.children);
        return result;
    },

    splitNodeName: function (node)
    {
        var name = node.Name;
        var characters = ['+', '#'];
        Ext.each(characters, function (char)
        {
            name = trimChar(name, char);
        }, this);
        return name.split(new RegExp('[' + characters.join('') + ']+')); //split nach # oder +
    },

    sortChildren: function (children)
    {
        Ext.Array.sort(children, this.compareTwoTreeNodes);
        Ext.each(children, function (child)
        {
            if (child.children)
            {
                this.sortChildren(child.children);
            }
        }, this);
    },

    compareTwoTreeNodes: function (child1, child2)
    {
        if ((child1.leaf && child2.leaf) || (!child1.leaf && !child2.leaf))
        {
            return child1.text.localeCompare(child2.text);
        }
        else if (child1.leaf)
        {
            return 1;
        }
        else if (child2.leaf)
        {
            return -1;
        }
    },

    getLeafIconName: function ()
    {
        return 'sampleTextIcon';
    },

    getEmptyTextForPreview: function ()
    {
        return LANGUAGE.getString("noTextSampleSelected");
    },

    onItemChosen: function (record)
    {

    },
    
    setTextSamples: function (textSamples)
    {
        this.structurizedTextSamples = this.structurizeByName(textSamples);
        this.store.setRoot(this.structurizedTextSamples);
    },

    clearPreviewAndShowLoading: function ()
    {
        this.previewContainer.update();
        this.previewContainer.showLoadingMask();
    },

    showPreviewError: function (text)
    {
        this.previewContainer.hideLoadingMask();
        this.previewContainer.setEmptyText(text || LANGUAGE.getString("errorLoadPreview"));
    }
});

Ext.define('TextSampleDialog',
{
    extend: 'TreeWithSearchDialog',

    initComponent: function () {
        this.titleText = LANGUAGE.getString('template');
        this.callParent();

    },
    
    getLeafIconName: function ()
    {
        return 'sampleTextIcon';
    },

    getEmptyTextForPreview: function ()
    {
        return LANGUAGE.getString("noTextSampleSelected");
    },

    getEmptyTextForSearchField: function ()
    {
        return LANGUAGE.getString('filterTemplates');
    },

    getClientSettingsKeyForMinimumNumberStars: function ()
    {
        return "minNumberStarsForTextSamples";
    },

    getClientSettingsKeyForSegmentedButton: function ()
    {
        return "segmentedButtonPressedForTextSamples";
    },

    loadPreviewFromServer: function (record)
    {
        var me = this;
        this.clearPreviewAndShowLoading();
        SESSION.getMailTemplate(this.mailId, record.data.textSampleId, function (result) 
        {
            if (!me.isStateOk()) 
            {
                return;
            }
            me.previewContainer.hideLoadingMask();
            if (result.getReturnValue().getCode() === 0) 
            {
                var mailText = '';

                if (isValid(result.getMailTemplateData())) 
                {
                    if (isValid(result.getMailTemplateData().getMail().getBody())) 
                    {
                        mailText = result.getMailTemplateData().getMail().getBody() || '';
                    }
                }
                me.previewContainer.update(mailText);
            }
            else {
                me.showPreviewError(result.getReturnValue().getDescription());
            }
        }, function () 
        {
            if (!me.isStateOk()) 
            {
                return;
            }
            me.showPreviewError();
        });
    }
});

Ext.define('TextBlockDialog',
    {
        extend: 'TreeWithSearchDialog',

        
        initComponent: function ()
        {
            this.titleText = LANGUAGE.getString('brickButton');

            this.callParent();
        },

        getLeafIconName: function ()
        {
            return 'cubes';
        },

        getEmptyTextForPreview: function ()
        {
            return LANGUAGE.getString("noTextBlockSelected");
        },

        getEmptyTextForSearchField: function ()
        {
            return LANGUAGE.getString('filterTextBlocks');
        },

        getClientSettingsKeyForMinimumNumberStars: function ()
        {
            return "minNumberStarsForTextBlocks";
        },

        getClientSettingsKeyForSegmentedButton: function ()
        {
            return "segmentedButtonPressedForTextBlocks";
        },

        loadPreviewFromServer: function (record) {
            var me = this;
            me.clearPreviewAndShowLoading();

            SESSION.getTextBlock(me.mailId, record.data.textSampleId, function (result) 
            {
                if (!me.isStateOk())
                {
                    return;
                }
                me.previewContainer.hideLoadingMask();
                if (result.getReturnValue().getCode() === 0) {
                    var text = result.getTextBlockData().getText();

                    me.previewContainer.update(text);
                    record.data.textBlock = text;
                }
                else 
                {
                    me.showPreviewError(result.getReturnValue().getDescription());
                }
            }, function() 
            {
                if (!me.isStateOk()) 
                {
                    return;
                }
                me.showPreviewError();
            });
        }
    });