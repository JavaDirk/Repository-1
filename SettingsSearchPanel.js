var SETTINGS_MATCH_FLAG = 'Search_MatchFlag';
var SETTINGS_MATCH_TYPE = 'Search_MatchType';
var SETTINGS_MAX_NUMBER_ENTRIES = "Search_MaxNumberEntries";

Ext.define('SettingsSearchPanel',
{
    extend: 'SettingsBasePanel',

    padding: '5 5 5 10',

    title: '',
    iconCls: 'search',

    initComponent: function ()
    {
        this.callParent();

        this.title = LANGUAGE.getString('search');

        this.add(Ext.create('Ext.form.Label',
        {
            text: LANGUAGE.getString('searchForName'),
            style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
            margin: '5 0 0 0'
        }));

        var matchFlag = TIMIO_SETTINGS.getMatchFlag();
        var matchType = TIMIO_SETTINGS.getMatchType();


        this.add(new Label({
            text: LANGUAGE.getString('searchPreciseness'),
            fontSize: FONT_SIZE_SUB_SETTING,
            color: SETTINGS_SUB_HEADDING,
            weight: 'bold',
            margin: '10 0 5 0'
        }));

        this.matchType = Ext.create('Ext.form.RadioGroup',
        {
            disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
            labelWidth: 150,
            labelSeparator: '',
            columns: 1,
            items:
            [
                { boxLabel: LANGUAGE.getString('MatchTypeExact'), name: 'matchType', inputValue: MatchType.Exact.value, checked: matchType === MatchType.Exact.value },
                { boxLabel: LANGUAGE.getString('MatchTypeBegin'), name: 'matchType', inputValue: MatchType.Begin.value, checked: matchType === MatchType.Begin.value },
                { boxLabel: LANGUAGE.getString('MatchTypeEverywhere'), name: 'matchType', inputValue: MatchType.Everywhere.value, checked: matchType === MatchType.Everywhere.value }
            ],
            listeners:
            {
                change: function (event, newValue, oldValue, eOpts)
                {
                    CLIENT_SETTINGS.addSetting('SETTINGSPANEL', SETTINGS_MATCH_TYPE, newValue.matchType);
                }
            }
        });
        this.add(this.matchType);

        this.add(new Label({
            text: LANGUAGE.getString('searchMoreResults'),
            fontSize: FONT_SIZE_SUB_SETTING,
            color: SETTINGS_SUB_HEADDING,
            margin: '10 0 5 0',
            weight: 'bold'
        }));

        this.matchFlag = Ext.create('Ext.form.RadioGroup',
        {
            disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
            labelWidth: 150,
            labelSeparator: '',
            columns: 1,
            margin: '5 0 0 0',
            items:
            [
                { boxLabel: LANGUAGE.getString('MatchFlagFirstMatch'), name: 'matchFlag', inputValue: MatchFlag.FirstMatch.value, checked: matchFlag === MatchFlag.FirstMatch.value },
                { boxLabel: LANGUAGE.getString('MatchFlagAll'), name: 'matchFlag', inputValue: MatchFlag.All.value, checked: matchFlag === MatchFlag.All.value }
            ],
            listeners:
            {
                change: function (event, newValue, oldValue, eOpts) {
                    CLIENT_SETTINGS.addSetting('SETTINGSPANEL', SETTINGS_MATCH_FLAG, newValue.matchFlag);
                }
            }
        });
        this.add(this.matchFlag);

        this.add(Ext.create('Ext.form.Label',
        {
            text: LANGUAGE.getString('searchFields'),
            style: 'font-size:' + FONT_SIZE_HEAD_SETTING + 'px;color: ' + SETTINGS_HEADLINE,
            margin: '25 0 5 0'
        }));

        var maxNumberEntries = TIMIO_SETTINGS.getNumberEntries();

        this.add(new Label({
            text: LANGUAGE.getString('maxNumberEntries'),
            fontSize: FONT_SIZE_SUB_SETTING,
            color: SETTINGS_SUB_HEADDING,
            weight: 'bold',
            margin: '5 0 5 0'
        }));

        this.maxNumberEntries = Ext.create('Ext.form.field.Number',
        {
            margin: '3 0 0 0',
            disabled: !TIMIO_SETTINGS.getAgentMayChangeProfile(),
            labelWidth: 150,
            value: maxNumberEntries,
            minValue: 0,
            listeners:
            {
                change: function (event, newValue, oldValue, eOpts)
                {
                    CLIENT_SETTINGS.addSetting('SETTINGSPANEL', SETTINGS_MAX_NUMBER_ENTRIES, newValue);
                    CLIENT_SETTINGS.saveSettings();
                }
            }
        });

        var deleteListsButton = Ext.create('RoundThinButton',
        {
            text: LANGUAGE.getString('deleteLists'),
            margin: '0 0 0 5',
            listeners:
            {
                click: function ()
                {
                    var instances = ComboBoxWithHistory.instances;
                    Ext.each(instances, function (combobox)
                    {
                        combobox.clearHistory();
                    });
                }
            }
        });

        this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'hbox'
            },
            items:
            [
                this.maxNumberEntries,
                deleteListsButton
            ]
        }));
    }
});
