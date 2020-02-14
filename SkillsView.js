Ext.define('Skill', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'Name', type: 'string' },
        { name: 'id', type: 'string' },
        { name: 'checked', type: 'boolean', defaultValue: false }
    ]
});

Ext.define('SkillStore',
{
    extend: 'Ext.data.Store',
    model: 'Skill',
    sorters:
    [
        {
            sorterFn: function (record1, record2)
            {
                var name1 = record1.data.Name.toUpperCase(),
                    name2 = record2.data.Name.toUpperCase();

                return name1.localeCompare(name2);
            },
            direction: 'ASC'
        }
    ]
});

Ext.define('SkillsView',
    {
        extend: 'Ext.view.View',

        itemSelector: '.skill',
        tpl: new Ext.XTemplate('<tpl for=".">' +
                '<div class="skill" style="display:flex;flex:1;align-items:center">' +
                    '<div style="width:16px;height:16px;margin-top:1px;border:1px solid ' + BORDER_GREY + ';background-size:contain;background-repeat:no-repeat;background-image:url({[this.getImage(values)]})"></div>' + 
                    '<div style="margin-left:5px;cursor:default;font-size:' + FONT_SIZE_TITLE + 'px">{Name}</div>' +
                '</div>' +
            '</tpl>',
            {
                getImage: function (values)
                {
                    return values.checked ? "url(" + IMAGE_LIBRARY.getImage("check", 64, DARKER_GREY) + ")" : '';
                }
            }),
        scrollable: 'vertical',
        flex: 1,
        initComponent: function ()
        {
            this.store = new SkillStore();
            this.callParent();

            this.maxNumberRecords = 4;

            this.on('boxready', function ()
            {
                this.el.on('click', function (event, node)
                {
                    var record = event.record;
                    var oldState = record.data.checked;
                    record.set('checked', !oldState, { silent: true });

                    var imageNode = node.childNodes[0];
                    imageNode.style.backgroundImage = !oldState ? "url(" + IMAGE_LIBRARY.getImage("check", 64, DARKER_GREY) + ")" : '';
                    
                }, this, { delegate: '.skill' });
                
                //this.showOnlyTheFirstXRecords(this.maxNumberRecords);
            }, this);

            if (isValid(this.skills))
            {
                this.setSkills(this.skills);
            }
        },

        setSkills: function (skills)
        {
            if (skills === this.skills || (Ext.isEmpty(skills) && Ext.isEmpty(this.skills)))
            {
                return;
            }
            this.getStore().removeAll();
            this.refresh();

            this.on('itemadd', () =>
            {
                //this.showOnlyTheFirstXRecords(this.maxNumberRecords);
            }, this, { single: true });

            this.getStore().add(skills);

            this.skills = skills;
        },

        getCheckedSkills: function ()
        {
            var result = [];
            this.getStore().each(function (record)
            {
                if (record.data.checked)
                {
                    result.push(record.data.Id);
                }
            });
            return result;
        },

        showOnlyTheFirstXRecords: function (maxNumberItems)
        {
            var height = this.computeHeightOfTheFirstXRecords(maxNumberItems);
            if (height >= 0)
            {
                this.setMinHeight(Math.max(height, this.minHeight));
                this.setMaxHeight(Math.max(height, this.minHeight));
            }
        }
    });

Ext.define('SkillsViewPanel',
{
    extend: 'Ext.Container',

    hidden: true,

    skills: [],

    layout:
    {
        type: 'vbox',
        align: 'stretch'
    },

    initComponent: function ()
    {
        this.callParent();

        this.skillsLabel = this.add(new Ext.form.Label(
        {
            text: LANGUAGE.getString("skills"),
            style: 'color:' + COLOR_MAIN_2 + ';font-size:' + FONT_SIZE_MODAL_DIALOG + 'px'
        }));

        this.skillsView = this.add(new SkillsView(
        {
            margin: '5 0 0 ' + VIEWS_PADDING_LEFT
        }));

        this.setSkills(this.skills || []);
    },

    setSkills: function (skills)
    {
        this.skillsView.setSkills(skills);
        if (Ext.isEmpty(skills))
        {
            this.hide();
        }
        else
        {
            this.show();
        }
    },

    getCheckedSkills: function ()
    {
        return this.skillsView.getCheckedSkills();
    }
});