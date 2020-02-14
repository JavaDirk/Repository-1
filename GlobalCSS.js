function createGlobalCSS()
{
    createCSS('.x-body', 'font-family', FONT_FAMILY);
    createCSS('div', 'font-family', FONT_FAMILY);
    createCSS('textarea', 'font-family', FONT_FAMILY);
    createCSS('.x-panel-body-default', 'font-family', FONT_FAMILY);
    createCSS('span', 'font-family', FONT_FAMILY);
    createCSS('input', 'font-family', FONT_FAMILY);

    var defaultFontWeight = "400";
    createCSS('.x-body', 'font-weight', defaultFontWeight);
    createCSS('div', 'font-weight', defaultFontWeight);
    createCSS('textarea', 'font-weight', defaultFontWeight);
    createCSS('.x-panel-body-default', 'font-weight', defaultFontWeight);
    createCSS('span', 'font-weight', defaultFontWeight);
    createCSS('input', 'font-weight', defaultFontWeight);

    var fontString = defaultFontWeight + " 13px/16px " + FONT_FAMILY;
    createCSS('::-webkit-input-placeholder', 'font', fontString);
    createCSS(':-moz-placeholder', 'font', fontString);
    createCSS('::-moz-placeholder', 'font', fontString);
    createCSS(':-ms-input-placeholder', 'font', fontString);

    createCSS('.x-btn-inner-default-small', 'font', defaultFontWeight + " 12px/normal " + FONT_FAMILY);
    createCSS('.x-tab-inner-default', 'font', defaultFontWeight + " 13px/normal " + FONT_FAMILY);
    createCSS('.x-btn-inner-default-medium', 'font', defaultFontWeight + " 13px/normal " + FONT_FAMILY);
    createCSS('.x-form-text-default', 'font', defaultFontWeight + " 13px/normal " + FONT_FAMILY);
    createCSS('.x-menu-item-text-default', 'font', defaultFontWeight + "13px " + FONT_FAMILY + ";");
    createCSS('.x-form-cb-label-default', 'font', defaultFontWeight + " 13px/normal " + FONT_FAMILY);
    
    createCSS('::-webkit-input-placeholder', 'font-style', "italic");
    createCSS(':-moz-placeholder', 'font-style', "italic");
    createCSS('::-moz-placeholder', 'font-style', "italic");
    createCSS(':-ms-input-placeholder', 'font-style', "italic");


    createCSS('.x-form-trigger-wrap-default', 'border-color', NORMAL_GREY);
    createCSS('.x-fieldset-default', 'border-color', NORMAL_GREY);

    createCSS(".x-grid-item-over", "background-color", COLOR_HOVER);
    
    var dockedCls =
    [
        {
            cls: '.x-docked-top',
            attributeName: 'border-bottom'
        },
        {
            cls: '.x-docked-bottom',
            attributeName: 'border-bottom'
        },
        {
            cls: '.x-docked-left',
            attributeName: 'border-left'
        }
    ];
    Ext.each(dockedCls, function (docked)
    {
        createCSS(docked.cls + " .x-tab.x-tab-default", "border", "none");
        createCSS(docked.cls + " .x-tab.x-tab-default", docked.attributeName, "3px solid transparent");
        createCSS(docked.cls + " .x-tab.x-tab-default.x-tab-active", docked.attributeName, "3px solid " + COLOR_ACTIVE_TAB);
        createCSS(docked.cls + " .x-tab.x-tab-over.x-tab-default", "background-color:transparent");
        createCSS(docked.cls + " .x-tab.x-tab-over.x-tab-default", docked.attributeName, "3px solid " + COLOR_TAB_ON_HOVER);
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-default", "background-color", "transparent");
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-default", docked.attributeName, "3px solid " + COLOR_ACTIVE_TAB);
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-over.x-tab-default", docked.attributeName, "3px solid " + COLOR_ACTIVE_TAB);
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-over.x-tab-default", "background-color", "transparent");
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-over.x-tab-default", docked.attributeName, "3px solid " + COLOR_ACTIVE_TAB);
        //Notiz an mich: wenn der folgende Selektor nicht greifen sollte, dann ".x-keyboard-mode .x-tab-focus.x-tab-active.x-tab-default" nehmen
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-focus.x-tab-default", "background-color", "transparent");
        createCSS(docked.cls + " .x-tab.x-tab-active.x-tab-focus.x-tab-default", docked.attributeName, "3px solid " + COLOR_ACTIVE_TAB);
    });

    createCSS(".x-tab.x-tab-default", "border-radius:0px;transition:border-color 0.3s ease");
    

    createCSS(".x-tab-default .x-tab-close-btn", "background", "none");
    createCSS(".x-tab-default .x-tab-close-btn", "margin-top", "4px");

    createCSS(".x-tab-over .x-tab-close-btn", "background-image", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, BLACK) + ")");
    createCSS(".x-tab-over .x-tab-close-btn", "background-position", "center center");
    createCSS(".x-tab-over .x-tab-close-btn", "background-size", "12px");
    createCSS(".x-tab-over .x-tab-close-btn", "background-repeat", "no-repeat");

    createCSS(".x-tab-active .x-tab-close-btn", "background-image", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, BLACK) + ")");
    createCSS(".x-tab-active .x-tab-close-btn", "background-position", "center center");
    createCSS(".x-tab-active .x-tab-close-btn", "background-size", "12px");
    createCSS(".x-tab-active .x-tab-close-btn", "background-repeat", "no-repeat");

    createCSS(".x-tab-default.x-tab-active .x-tab-close-btn-over", "background-position", "center center");
    createCSS(".x-tab-default.x-tab-active .x-tab-close-btn-pressed", "background-position", "center center");
    createCSS(".x-tab-default.x-tab-active .x-tab-close-btn", "background-position", "center center");

    createCSS(".x-tab-close-btn:hover", "border-radius", "100%");
    createCSS(".x-tab-close-btn:hover", "background-image", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, WHITE) + ")");
    createCSS(".x-tab-close-btn:hover", "background-color", COLOR_ACTIVE_TAB);
    createCSS(".x-tab-close-btn:hover", "background-size", "12px 12px");

    createCSS(".x-tab-default .x-tab-close-btn", "background-color", "transparent");
    createCSS(".x-tab-default .x-tab-close-btn", "width", "16px");
    createCSS(".x-tab-default .x-tab-close-btn", "height", "16px");

/*    createCSS(".x-tab-default .x-tab-close-btn", "background", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, BLACK) + ")");
    createCSS(".x-tab-default .x-tab-close-btn", "background-position", "0px");
    createCSS(".x-tab-default .x-tab-close-btn", "background-size", "12px");
    
    
    createCSS(".x-tab-close-btn.x-tab-close-btn-over", "background", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, BLACK) + ")");
    createCSS(".x-tab-close-btn.x-tab-close-btn-over", "background-position", "0px  !important");
    createCSS(".x-tab-close-btn.x-tab-close-btn-over", "background-size", "12px");
    
    createCSS(".x-tab-active .x-tab-close-btn", "background", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, WHITE) + ")");
    createCSS(".x-tab-active .x-tab-close-btn", "background-position", "0px");
    createCSS(".x-tab-active .x-tab-close-btn", "background-size", "12px");

    
    createCSS(".x-tab-active .x-tab-close-btn-over", "background", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, BLACK) + ")");
    createCSS(".x-tab-active .x-tab-close-btn-over", "background-position", "0px  !important");
    createCSS(".x-tab-active .x-tab-close-btn-over", "background-size", "12px");
   
    createCSS(".x-tab-close-btn.x-tab-close-btn-over.x-tab-close-btn-pressed", "background", "url(" + IMAGE_LIBRARY.getImage("tab_close", 64, BLACK) + ")");
    createCSS(".x-tab-close-btn.x-tab-close-btn-over.x-tab-close-btn-pressed", "background-position", "0px  !important");
    createCSS(".x-tab-close-btn.x-tab-close-btn-over.x-tab-close-btn-pressed", "background-size", "12px");
    */
    createCSS(".eclipsedText", "overflow:hidden;white-space:nowrap;text-overflow:ellipsis");
    
    createCSS(".selectedEntry", "background-color", COLOR_SELECTION);

    createCSS(".errorMessage", "border-radius:1px;font-weight:bold;padding:5px;color:" + COLOR_ERROR_LABEL_TEXT + ";background-color:" + COLOR_ERROR_LABEL_BACKGROUND);
                    
    createCSS('.x-layout-split-left', 'border-radius:2px;left:1px;background-position:-4px 16px;background-size: 16px 16px;');
    createCSS('.x-layout-split-left', 'background-image', 'url("' + IMAGE_LIBRARY.getImage("arrow_left", 64, NEW_GREY) + '")');
                    
    createCSS('.x-splitter-collapsed .x-layout-split-left', 'left:0;background-position:-3px 16px;background-size: 16px 16px;');
    createCSS('.x-splitter-collapsed .x-layout-split-left', 'background-image', 'url("' + IMAGE_LIBRARY.getImage("arrow_right", 64, NEW_GREY) + '")');

    createCSS('.menuBackground', 'background-color:' + WHITE + ';border: none', undefined);
    createCSS('.menuBorder', 'border: 1px solid ' + TITLE_GREY, undefined);
    createCSS('.menuShadow', 'box-shadow', 'rgb(136, 136, 136) 3px 3px 6px!important');

    createCSS('.x-mask-msg-text', 'background-image', 'url(images/loading.png)');

    createCSS('.display', 'display: none !important;');
    
    createCSS('.x-menu-item-icon', 'background-size', '16px 16px');

    /*
    createCSS('.customPanelHeader div div div', 'font-size', '16px');
    createCSS('.customPanelHeader', 'background-color', 'transparent');
    */
    createCSS('.partnerGroup .x-panel-body-default', 'background-color', 'transparent');
    

    createCSS('.acdIconPartner', 'background-size', '20px 20px');

    createCSS('.partnerBackground:hover', 'border-color', COLOR_HOVER);
    createCSS('.partnerBackground:hover', 'background-color', COLOR_HOVER);

    //createCSS('.partnerBackground:hover', 'transform', 'scale(1.1)');
    

    createCSS('.partnerBackground', 'transition', '.2s');
    createCSS('.partnerBackground', 'background-color', COLOR_PARTNER_BACKGROUND);
    createCSS('.partnerBackground', 'border', TILE_BORDER_WIDTH + 'px solid ' + COLOR_PARTNER_BACKGROUND);
    createCSS('.partnerBackground.activeCall', 'border-color', COLOR_PRESENCE_STATE_ORANGE);
    createCSS('.ringingCall', 'animation', 'pulse 2s infinite');
    
    Ext.iterate(dashboardDataType, function (key, value)
    {
        var backgroundColor = value.color;
        var hoverColor = Ext.isObject(backgroundColor) ? backgroundColor.createLighter(0.1) : 'transparent';
        createCSS('.partnerBackground.' + key + ':hover', 'border-color', hoverColor);
        createCSS('.partnerBackground.' + key + ':hover', 'background-color', hoverColor);

        createCSS('.partnerBackground.' + key, 'background-color', backgroundColor);
        createCSS('.partnerBackground.' + key, 'border', '3px solid ' + backgroundColor);
    });
    
    createCSS('.partnerGroup', 'position', 'relative !important');
    createCSS('.partnerGroup.x-tabpanel-child', 'position', 'absolute !important');
    createCSS('.partnerGroup .x-docked', 'position', 'relative !important');
    createCSS('.partnerGroup .x-panel-body', 'top', 'auto !important');
    

    
    //createCSS('.partnerGroup', 'top', 'auto !important');

    createCSS('.backgroundTdRequest', 'background-color', COLOR_MAIL_REQUEST);
    createCSS('.backgroundTdAnswer', 'background-color', COLOR_MAIL_ANSWER);
    createCSS('.backgroundTdRequestion', 'background-color', COLOR_MAIL_REQUESTION);
    createCSS('.backgroundTdWorked', 'background-color', COLOR_MAIL_WORKED);
    createCSS('.backgroundTdDraft', 'background-color', COLOR_MAIL_DRAFT);
    createCSS('.backgroundTdCopy', 'background-color', COLOR_MAIL_COPY);
    createCSS('.backgroundTdQuery', 'background-color', COLOR_MAIL_QUERY);
    createCSS('.backgroundTdSpam', 'background-color', COLOR_MAIL_SPAM);
    createCSS('.backgroundTdSystemError', 'background-color', COLOR_MAIL_SYSTEM_ERROR);
    createCSS('.backgroundTdSystemMessage', 'background-color', COLOR_MAIL_SYSTEM_MESSAGE);
    createCSS('.backgroundTd3rdReply', 'background-color', COLOR_MAIL_3RD_REPLY);
    createCSS('.backgroundTdError', 'background-color', COLOR_MAIL_SYSTEM_ERROR);
    createCSS('.backgroundTdNew', 'background-color', COLOR_MAIL_NEW);

    createCSS('.backgroundTd .x-grid-cell-inner', 'padding', '0');

    
    createCSS('.colorTdWorked', 'color', MAIL_BACKGROUND_GREEN);
    createCSS('.colorTdSpam', 'color', ORANGE);

    createCSS('.informationBackground', 'background-color', COLOR_MAIN_GREY);
    createCSS('.newMessageBackground', 'background-color', COLOR_BADGE);
    
    createCSS('.small .x-btn-icon-el', 'background-size', '16px 16px');
    createCSS('.smallMedium .x-btn-icon-el', 'background-size', '20px 20px');
    createCSS('.medium .x-btn-icon-el', 'background-size', '24px 24px');
    createCSS('.large .x-btn-icon-el', 'background-size', '32px 32px');

    createCSS('.smallIcon', 'background-size', '16px');
    Ext.each(['mail', 'edit', 'lock', 'inboundMailRead', 'inboundMailUnread', 'outboundMailRead', 'outboundMailUnread', 'spam', 'paperclip', 'readEmail', 'remove'], function (cls)
    {
        createCSS("." + cls, 'background-image', 'url(' + IMAGE_LIBRARY.getImage(cls, 64, DARKER_GREY) + ')');
    });

    createCSS('.navigatorBackground', 'background-color', COLOR_HOVER);

    createCSS('.chat_metadata', 'font-size', FONT_SIZE_SUBTITLE + "px");
    createCSS('.chat_message', 'font-size', FONT_SIZE_TITLE + "px");
    
    createCSS('.chatInputTextAreaField', 'padding', '7px 5px 6px 5px');
    createCSS('.x-form-text-default.x-form-textarea', 'line-height', 'normal');

    createCSS('.menuItem span', 'color', DARKER_GREY.toString());

    createCSS(".tabPanelWithBigIcons .x-tab-bar-horizontal > .x-tab-bar-body-default", "height", "40px");
    createCSS(".tabPanelWithBigIcons .x-tab-icon-left > .x-tab-icon-el-default, .x-tab-icon-right > .x-tab-icon-el-default", "width", "30px");
    createCSS(".tabPanelWithBigIcons .x-tab-icon-el-default", "min-height", "24px");
    createCSS(".tabPanelWithBigIcons .x-tab-icon-el-default", "background-size", "20px");
    createCSS(".tabPanelWithBigIcons .x-tab-bar-default-top > .x-tab-bar-body-default", "padding", "4px 2px 0 2px");

    createCSS(".tabPanelWithBigIcons .x-tab-icon-left > .x-tab-icon-el-default, .x-tab-icon-right > .x-tab-icon-el-default", "background-size:20px;width:40px;margin:0px");

    //begin: CSS für den Fall, dass das Panel eingeklappt wurde und nur noch der Header vertikal zu sehen ist
    createCSS(".tabPanelWithBigIcons .x-tab-bar-vertical .x-tab-icon-left > .x-tab-icon-el-default, .x-tab-icon-right > .x-tab-icon-el-default", "transform", "rotate(90deg) translateX(4px)");
    createCSS(".tabPanelWithBigIcons .x-tab-bar-vertical .x-tab-icon-left > .x-tab-icon-el-default, .x-tab-icon-right > .x-tab-icon-el-default", "width", "24px");
    createCSS(".tabPanelWithBigIcons .x-tab-bar-vertical .x-tab-icon-el-default", "min-height", "24px");
    createCSS(".tabPanelWithBigIcons .x-tab-bar-vertical .x-tab-default-top", "padding", "5px 3px");
    //end


    createCSS('.x-fieldset-header-default > .x-fieldset-header-text', 'font-size:' + FONT_SIZE_TITLE + "px;color:" + COLOR_MAIN_2);

    //hier ändern wir die Auf- und zuklapp-Icons der Fieldsets
    createCSS('.x-fieldset-default.x-fieldset-collapsed .x-tool-toggle', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_right', 64, NEW_GREY) + ')');
    createCSS('.x-fieldset-default.x-fieldset-collapsed .x-tool-toggle', 'background-color', 'transparent');
    createCSS('.x-fieldset-default.x-fieldset-collapsed .x-tool-toggle', 'background-position', '0');
    createCSS('.x-fieldset-default.x-fieldset-collapsed .x-tool-toggle', 'background-size', '16px');
    createCSS('.x-fieldset-default.x-fieldset-collapsed .x-tool-over > .x-tool-toggle', 'background-position', '0');

    createCSS('.x-fieldset-default .x-tool-toggle', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_down', 64, NEW_GREY) + ')');
    createCSS('.x-fieldset-default .x-tool-toggle', 'background-color', 'transparent');
    createCSS('.x-fieldset-default .x-tool-toggle', 'background-position', '0');
    createCSS('.x-fieldset-default .x-tool-toggle', 'background-size', '16px');
    createCSS('.x-fieldset-default .x-tool-toggle', 'background-position', '0');
    createCSS('.x-fieldset-default .x-tool-toggle', 'background-repeat', 'no-repeat');
    createCSS('.x-fieldset-header-tool-default.x-tool-over > .x-tool-toggle', 'background-position', '0');
    createCSS('.x-fieldset-header-tool-default > .x-tool-img', 'width', '16px');
    createCSS('.x-fieldset-header-tool-default > .x-tool-img', 'height', '22px');

    //für den Fall, dass wir ein Fieldset in einem Dialog haben
    createCSS('.dialogWithArrow .x-fieldset-default.x-fieldset-collapsed .x-tool-toggle', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_right', 64, NEW_GREY) + ')');
    createCSS('.dialogWithArrow .x-fieldset-default.x-fieldset-collapsed .x-tool-toggle', 'background-color', 'white');
    createCSS('.dialogWithArrow .x-fieldset-header-tool-default > .x-tool-toggle', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_down', 64, NEW_GREY) + ')');
    createCSS('.dialogWithArrow .x-fieldset-header-tool-default > .x-tool-toggle', 'background-color', 'white');

    var imageCSS = "#fff url('" + IMAGE_LIBRARY.getImage("tab_close", 64, DARKER_GREY) + "') 12px 6px / 10px 10px no-repeat ";
    createCSS('.clear-trigger', "background", imageCSS);
    createCSS('.clear-trigger.x-form-trigger-focus', "background", imageCSS);
    createCSS('.clear-trigger.x-form-trigger-over', "background", imageCSS);
    createCSS('.clear-trigger.x-form-trigger-focus.x-form-trigger-over', "background", imageCSS);

    imageCSS = "#fff url('" + IMAGE_LIBRARY.getImage("search", 64, DARKER_GREY) + "') center / contain no-repeat ";
    createCSS('.search-trigger', "background", imageCSS);
    createCSS('.search-trigger', "width", '16px');
    createCSS('.search-trigger.x-form-trigger-focus', "background", imageCSS);
    createCSS('.search-trigger.x-form-trigger-over', "background", imageCSS);
    createCSS('.search-trigger.x-form-trigger-focus.x-form-trigger-over', "background", imageCSS);

    createCSS('.notVisible', 'display', 'none !important');

    createCSS("." + CLASSNAME_CONFIRM_DELETE_BUTTON + " span", "font-weight", "normal");
    createCSS("." + CLASSNAME_CONFIRM_DELETE_BUTTON + " span", "color", "white");

    createCSS('.buttonWithMenu span.x-btn-wrap-default-small.x-btn-arrow-right:after', 'background-image:url("' + IMAGE_LIBRARY.getImage('arrow_down', 64, NORMAL_GREY) + '");background-size:10px 10px;');
    createCSS('.header .buttonWithMenu span.x-btn-wrap-default-small.x-btn-arrow-right:after', 'margin-top:6px');

    createCSS('.dialogWithArrow.x-mask', 'background-color', "transparent");
    createCSS('.noConnectionWindow.x-mask', 'background-color', COLOR_MASK);
    createCSS('.noConnectionWindow.x-mask', 'z-index', 5);
    createCSS('.noConnectionWindow.viewport.x-mask', 'z-index', 200000);
    createCSS('.noConnectionWindow .x-mask-msg', 'top: 35px !important');
    createCSS('.noConnectionWindow .x-mask-msg-text', 'font-size:20px; padding:40px 25px;background-image: none;animation: none;background-color: rgb(130,130,130);color: rgb(230, 230, 230);border-radius: 3px');

    createCSS('.x-tip-default .x-tip-anchor-top:after', 'border-bottom-color', COLOR_DIALOG_BACKGROUND);
    createCSS('.x-tip-default .x-tip-anchor-bottom:after', 'border-top-color', COLOR_DIALOG_BACKGROUND);
    createCSS('.x-tip-default .x-tip-anchor-left:after', 'border-right-color', COLOR_DIALOG_BACKGROUND);
    createCSS('.x-tip-default .x-tip-anchor-right:after', 'border-left-color', COLOR_DIALOG_BACKGROUND);

    Ext.each(["chat", "mail", "info", "users", "privacy", "search", "phone", "user", "fullView", "bell", "speaker"], function (imageName)
    {
        createCSS(".SettingsPanel ." + imageName, "background-image", "url(" + IMAGE_LIBRARY.getImage(imageName, 64, DARKER_GREY) + ")");
    });

    Ext.each(['users', ICON_NAME_ACD_AGENT], function (imageName)
    {
        createCSS(".partnerStripPanel ." + imageName, "background-image", "url(" + IMAGE_LIBRARY.getImage(imageName, 64, DARKER_GREY) + ")");
    });
    
    createCSS('.splitterOnHover', 'background-color', COLOR_SEPARATOR.toString() + " !important");

    createCSS('.badge', 'border-radius', '10px');
    createCSS('.badge', 'display', 'flex');
    createCSS('.badge', 'color', 'white');
    createCSS('.badge', 'font-size', '12px');
    createCSS('.badge', 'height', '17px');
    createCSS('.badge', 'min-width', '17px');
    createCSS('.badge', 'text-align', 'center');
    createCSS('.badge', 'background-color', COLOR_BADGE);
    createCSS('.badge', 'padding', '0 5px 0 5px');
    createCSS('.badge', 'font-weight', '400');

    createCSS('.overviewContact .badge', 'margin-right', '5px');

    createCSS('.typing .x-tab-close-btn', 'background-image', IMAGE_LIBRARY.getImage("chat", 64, WHITE));
    //createCSS('.typing .x-tab-close-btn', 'background-size', '12px 12px');

    createCSS('.channelImage', 'background-color', COLOR_HEADER_BAR);
    createCSS('.channelImage:hover', 'background-color', COLOR_HEADER_BAR.createLighter(0.1));
    createCSS('.channelImage div', 'color', 'white');
    //createCSS('.channelImage div', 'font-weight', '500');
    

    //Anpassungen für das resize-Icon unten rechts
    createCSS('.x-resizable-handle-southeast-over, .x-resizable-pinned > .x-resizable-handle-southeast', 'background-image', 'url(' + IMAGE_LIBRARY.getImage("resize", 64, NEW_GREY) + ')');
    createCSS('.x-resizable-handle-southeast-over, .x-resizable-pinned > .x-resizable-handle-southeast', 'background-size', ' 16px 16px');
    createCSS('.x-resizable-handle-southeast-over, .x-resizable-pinned > .x-resizable-handle-southeast', 'background-position', '0px');
    createCSS('.x-resizable-handle-southeast-over, .x-resizable-pinned > .x-resizable-handle-southeast', 'width', '16px');
    createCSS('.x-resizable-handle-southeast-over, .x-resizable-pinned > .x-resizable-handle-southeast', 'height', '16px');
    createCSS('.x-resizable-handle-southeast-over, .x-resizable-pinned > .x-resizable-handle-southeast', 'background-color', 'transparent');

    createCSS('.errorMessageComponent', 'background-color', RED);
    createCSS('.errorMessageComponent', 'color', 'white');
    createCSS('.errorMessageComponent', 'font-size', '16px');

    createCSS('.' + ROUND_THIN_BUTTON + " .x-btn-icon-el", 'background-size',  '16px 16px');
    createCSS('.' + ROUND_THIN_BUTTON + " .x-btn-inner-el", 'line-height',  'normal');
    createCSS('.' + ROUND_THIN_BUTTON + " .x-btn-inner-el", 'padding-bottom',  '2px');

    createCSS('.' + ROUND_THIN_BUTTON, 'border-radius', BORDER_RADIUS_BUTTONS);   

    var pathForExtJsTheme = "../Shared/ext-7.1.0/build/classic/theme-crisp/resources/images/button/";
    createCSS('.' + ROUND_THIN_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'background-image', 'url("' + pathForExtJsTheme + 'default-toolbar-medium-s-arrow.png")');   
    createCSS('.' + ROUND_THIN_BUTTON + ' .x-btn-wrap-default-toolbar-medium.x-btn-split-right:after', 'background-image', 'url("' + pathForExtJsTheme + 'default-toolbar-medium-s-arrow.png")');   

    createCSS('.' + HIGHLIGHTED_ROUND_THIN_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'background-image', 'url("' + pathForExtJsTheme + 'default-medium-s-arrow.png")');   
    createCSS('.' + HIGHLIGHTED_ROUND_THIN_BUTTON + ' .x-btn-wrap-default-toolbar-medium.x-btn-split-right:after', 'background-image', 'url("' + pathForExtJsTheme + 'default-medium-s-arrow.png")');   


    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'background-image', 'url(images/default-toolbar-medium-s-arrow_withoutBorderLeft.png)');
    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-toolbar-medium.x-btn-split-right:after', 'background-image', 'url(images/default-toolbar-medium-s-arrow_withoutBorderLeft.png)');

    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'width', '20px');
    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-toolbar-medium.x-btn-split-right:after', 'width', '20px');

    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'background-position', 'left center');
    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-toolbar-medium.x-btn-split-right:after', 'background-position', 'left center');

    createCSS('.x-btn-wrap-default-medium.x-btn-split-right:after', 'background-size', '24px 48px');
    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'background-size', '12px 72px');
    createCSS('.' + CLASSNAME_ICON_BUTTON + ' .x-btn-wrap-default-medium.x-btn-split-right:after', 'padding-right', '0px');
    createCSS('.' + CLASSNAME_ICON_BUTTON, 'border', 'none');
    createCSS('.' + CLASSNAME_ICON_BUTTON, 'padding', '0');

    var buttonColors = {};
    
    buttonColors[ROUND_THIN_BUTTON] =
    {
        normalColor: PANEL_BACKGROUND_GREY,
        borderColor: COLOR_BORDER_BUTTON,
        disabledColor: LIGHT_GREY,
        disabledBorderColor: BORDER_GREY,
        hoverColor: COLOR_HOVER,
        focusColor: COLOR_HOVER,
        pressedColor: COLOR_SELECTION,
        activeMenuColor: COLOR_HOVER,
        color: ALMOST_BLACK
    };
    buttonColors[CLASSNAME_ICON_BUTTON] =
    {
        normalColor: PANEL_BACKGROUND_GREY,
        borderColor: 'transparent',
        hoverColor: PANEL_BACKGROUND_GREY,
        focusColor: PANEL_BACKGROUND_GREY,
        activeMenuColor: PANEL_BACKGROUND_GREY
    };
    buttonColors[HIGHLIGHTED_ROUND_THIN_BUTTON] =
    {
        normalColor: COLOR_MAIN_2,
        disabledColor: COLOR_MAIN_2.createLighter(0.1),
        hoverColor: COLOR_MAIN_2.createDarker(0.1),
        focusColor: COLOR_MAIN_2.createDarker(0.1),
        pressedColor: COLOR_MAIN_2.createDarker(0.1),
        activeMenuColor: COLOR_MAIN_2.createDarker(0.1),
        color: WHITE
    };
    buttonColors[ACCEPT_BUTTON] =
    {
        normalColor: COLOR_ACCEPT_BUTTON,
        disabledColor: COLOR_ACCEPT_BUTTON.createLighter(0.2),
        hoverColor: COLOR_ACCEPT_BUTTON.createDarker(0.1),
        color: WHITE
    };
    buttonColors[DECLINE_BUTTON] =
    {
        normalColor: COLOR_DECLINE_BUTTON,
        disabledColor: COLOR_DECLINE_BUTTON.createLighter(0.2),
        hoverColor: COLOR_DECLINE_BUTTON.createDarker(0.1),
        color: WHITE
    };
    
    Ext.iterate(buttonColors, function (cls, colors)
    {
        colors.disabledColor = colors.disabledColor || colors.normalColor;
        colors.hoverColor = colors.hoverColor || colors.normalColor;
        colors.focusColor = colors.focusColor || colors.normalColor;
        colors.pressedColor = colors.pressedColor || colors.normalColor;
        colors.activeMenuColor = colors.activeMenuColor || colors.normalColor;

        createCSS('.' + cls, 'background-color', colors.normalColor);
        createCSS('.' + cls, 'border-color', colors.borderColor || colors.normalColor);
        createCSS('.' + cls + '.x-btn.x-btn-disabled', 'background-color', colors.disabledColor);
        createCSS('.' + cls + '.x-btn.x-btn-disabled', 'border-color', colors.disabledBorderColor || colors.disabledColor);
        createCSS('.' + cls + ' span', 'color', colors.color);
        createCSS('.' + cls + ' span', 'font-size', FONT_SIZE_TITLE + 'px');
        createCSS('.' + cls + '.x-btn.x-btn-over', 'background-color', colors.hoverColor);
        createCSS('.' + cls + '.x-btn.x-btn-over', 'border-color', colors.hoverColor);
        createCSS('.' + cls + '.x-btn.x-btn-focus', 'background-color', colors.focusColor);
        createCSS('.' + cls + '.x-btn.x-btn-focus', 'border-color', colors.focusColor);
        createCSS('.' + cls + '.x-btn.x-btn-pressed', 'background-color', colors.pressedColor);
        createCSS('.' + cls + '.x-btn.x-btn-pressed', 'border-color', colors.pressedColor);
        createCSS('.' + cls + '.x-btn.x-btn-menu-active', 'background-color', colors.activeMenuColor);
        createCSS('.' + cls + '.x-btn.x-btn-menu-active', 'border-color', colors.activeMenuColor);  
    }, this);

    createCSS('.errorMessageComponentButton.info.x-btn-over', 'background-color', ErrorType.Info.color.createLighter(0.1));
    createCSS('.errorMessageComponentButton.info', 'background-color', ErrorType.Info.color);

    createCSS('.errorMessageComponentButton.warning.x-btn-over', 'background-color', ErrorType.Warning.color.createLighter(0.1));
    createCSS('.errorMessageComponentButton.warning', 'background-color', ErrorType.Warning.color);

    createCSS('.errorMessageComponentButton.error.x-btn-over', 'background-color', ErrorType.Error.color.createLighter(0.1));
    createCSS('.errorMessageComponentButton.error', 'background-color', ErrorType.Error.color);

    createCSS('.errorMessageComponentButton.x-form-type-checkbox', 'background-color', 'transparent');
    createCSS('.errorMessageComponentButton.x-form-type-checkbox.info label', 'color', ErrorType.Info.color);
    createCSS('.errorMessageComponentButton.x-form-type-checkbox.warning label', 'color', ErrorType.Warning.color);
    createCSS('.errorMessageComponentButton.x-form-type-checkbox.error label', 'color', ErrorType.Error.color);


    createCSS('.x-form-trigger-wrap-default', 'border', 'none');
    //wir setzen den border-bottom deswegen auf das input und textarea Element, weil das weniger Probleme bei versch. Browser-Zooms machte, 
    //als wenn wir das direkt auf dem x - form - trigger - wrap -default gemacht hätten
    createCSS('.x-form-trigger-wrap-default input', 'border-bottom', FIELDS_BORDER_BOTTOM);
    //createCSS('.searchPanelWithAddressBookChooser', 'border-bottom', FIELDS_BORDER_BOTTOM);
    //createCSS('.searchPanelWithAddressBookChooser .x-form-trigger-wrap-default input', 'border', 'none');
    createCSS('.x-form-trigger-wrap-default input.x-form-focus', 'border-bottom-color', COLOR_BORDER_FOCUS);
    //createCSS('.searchPanelWithAddressBookChooser:focus', 'border-bottom-color', COLOR_BORDER_FOCUS);

    //die nächsten beiden Regeln sind für die selbstgebaute Combobox im LoginWindowForTimio
    createCSS('.x-form-trigger-wrap-default div[id^="combobox"].x-form-field', 'border-bottom', FIELDS_BORDER_BOTTOM);
    createCSS('.x-form-trigger-wrap-default div[id^="combobox"].x-form-field.x-form-focus', 'border-bottom-color', COLOR_BORDER_FOCUS);

    createCSS('.x-form-trigger-wrap-default textarea', 'border-bottom', FIELDS_BORDER_BOTTOM);
    createCSS('.x-form-trigger-wrap-default textarea.x-form-focus', 'border-bottom-color', COLOR_BORDER_FOCUS);

    createCSS('.x-form-trigger-wrap-default .x-form-trigger', 'border-bottom', FIELDS_BORDER_BOTTOM);
    createCSS('.searchPanelWithAddressBookChooser .x-form-trigger-wrap-default .x-form-trigger', 'border-bottom', 'none');

    createCSS('.x-form-trigger-wrap .x-form-trigger', 'border-bottom-color', COLOR_BORDER);
    createCSS('.x-form-trigger-wrap-focus .x-form-trigger', 'border-bottom-color', COLOR_BORDER_FOCUS);
    createCSS('.x-form-trigger-wrap.x-form-trigger-wrap-focus .x-form-trigger-focus', 'border-bottom-color', COLOR_BORDER_FOCUS);

    //createCSS('.x-form-trigger-wrap-default textarea.chatInputTextAreaField', 'border-bottom', '0');

    createCSS('.sendButton', 'border-bottom', FIELDS_BORDER_BOTTOM);
    createCSS('.focused .sendButton', 'border-bottom-color', COLOR_BORDER_FOCUS);

    //createCSS('.attachmentsButton', 'border-bottom', FIELDS_BORDER_BOTTOM);
    //createCSS('.focused.attachmentsButton', 'border-bottom-color', COLOR_BORDER_FOCUS);
    
    createCSS('.x-fieldset-header-default > .x-fieldset-header-text', 'font', 'initial');
    createCSS('.x-fieldset-header-default > .x-fieldset-header-text', 'font-family', FONT_FAMILY);
    createCSS('.x-fieldset-header-default > .x-fieldset-header-text', 'font-size', FONT_SIZE_HEADLINE + "px");
    createCSS('.x-fieldset-header-default > .x-fieldset-header-text', 'margin', '0 15px');

    createCSS('.clickItem', 'color', COLOR_MAIN_2);
    createCSS('.clickItem', 'font-size', FONT_SIZE_TITLE + 'px');
    createCSS('.labelItem', 'color', ALMOST_BLACK);
    createCSS('.labelItem', 'font-size', FONT_SIZE_TITLE + 'px');

    createCSS('.subjectItem', 'color', COLOR_MAIN_2);
    createCSS('.subjectItem', 'font-weight', '600');
    createCSS('.subjectItem', 'font-size', FONT_SIZE_TITLE + 'px');

    //welcomePage
    createCSS('.svg path', 'fill', WHITE);
    createCSS('.welcomePageChannel', 'background-color', 'rgba(0, 0, 0, 0.4)');
    createCSS('.welcomePageChannel:hover', 'background-color', 'rgba(0, 0, 0, 0.7)');
    createCSS('.welcomePageListItem', 'color', WHITE);
    createCSS('.welcomePageListItem', 'height', HEIGHT_WELCOME_PAGE_LIST_ITEM + 'px');
    createCSS('.welcomePageTimioStyle', 'color', WHITE);
    createCSS('.welcomePageTimioStyle', 'font-weight', 'bold');
    createCSS('.welcomeSubTitle', 'color', WHITE);
    createCSS('.welcomePageHeaderTitle', 'color', WHITE);

    createCSS('.segmentedButton .x-segmented-button-first', 'border-top-left-radius', BORDER_RADIUS_BUTTONS);
    createCSS('.segmentedButton .x-segmented-button-first', 'border-bottom-left-radius', BORDER_RADIUS_BUTTONS);
    createCSS('.segmentedButton .x-segmented-button-last', 'border-top-right-radius', BORDER_RADIUS_BUTTONS);
    createCSS('.segmentedButton .x-segmented-button-last', 'border-bottom-right-radius', BORDER_RADIUS_BUTTONS);

    createCSS('.segmentedButton .x-btn', 'background-color', 'transparent');
    createCSS('.segmentedButton .x-btn span', 'color', COLOR_MAIN_2);
    createCSS('.segmentedButton .x-btn.x-btn-pressed', 'background-color', COLOR_MAIN_2);
    createCSS('.segmentedButton .x-btn.x-btn-pressed span', 'color', WHITE);

    createCSS('.x-form-clear-trigger', 'background-image', 'url(' + IMAGE_LIBRARY.getImage("delete", 64, NEW_GREY) + ')');
    createCSS('.x-form-clear-trigger', 'background-size', 'contain');
    createCSS('.x-form-clear-trigger.x-form-trigger-over', 'background-position', 'center center');
    createCSS('.x-form-clear-trigger.x-form-trigger-over', 'background-image', 'url(' + IMAGE_LIBRARY.getImage("delete", 64, DARK_GREY) + ')');
    createCSS('.x-form-clear-trigger.x-form-trigger-focus', 'background-position', 'center center');
    createCSS('.x-form-clear-trigger.x-form-trigger-over.x-form-trigger-focus', 'background-position', 'center center');

    createCSS('.thinBorder', 'border', '1px solid ' + BORDER_GREY);

    createCSS('.mergeContainerResult', 'padding', '10px');
    createCSS('.mergeContainerResult', 'margin-right', '5px');
    createCSS('.mergeContainerResult', 'border', '1px solid ' + COLOR_SEPARATOR);
        
    createCSS('.mergeContainerResult:hover', 'background-color', COLOR_HOVER);
    createCSS('.mergeContainerResult:hover', 'cursor', 'pointer');
    createCSS('.mergeContainerResult:focus', 'background-color', COLOR_HOVER);
    createCSS('.mergeContainerSelected', 'background-color', COLOR_SELECTION);
    
    createCSS('.x-panel-header-title-default', 'color', COLOR_MAIN);
    createCSS('.x-panel-header-title-default', 'font-size', FONT_SIZE_HEADLINE + "px");

    createCSS('.settingsTitle', 'color', COLOR_MAIN);

    createCSS('.x-tab-bar-default', 'background-color', PANEL_BACKGROUND_GREY);

    createCSS('.businessCardPanel_title', 'font-size', FONT_SIZE_TITLE + "px");
    createCSS('.businessCardPanel_title', 'color', DARKER_GREY);

    createCSS('.telephoneNumber, .emailAddress, .address, .label', 'font-size', FONT_SIZE_SUBTITLE + "px");
    createCSS('.telephoneNumber, .emailAddress, .address', 'color', COLOR_MAIN_2);

    createCSS('.link', 'cursor', 'pointer');

    createCSS('.greyLink', 'color', COLOR_MAIN_GREY);
    createCSS('.greyLink', 'font-size', FONT_SIZE_TEXT + 'px');
    createCSS('.greyLink', 'text-decoration', 'underline');
    createCSS('.x-menu .greyLink', 'font-size', FONT_SIZE_SUBTITLE + 'px');
    createCSS('.x-menu .greyLink', 'text-decoration', 'none');
    createCSS('.x-menu .greyLink', 'background-color', 'transparent');
    createCSS('.x-menu .greyLink:hover', 'background-color', COLOR_HOVER);

    document.body.style.setProperty('--color-badge', COLOR_BADGE);

    createCSS('.headerContainer input', 'border', '1px solid ' + BORDER_GREY);
    createCSS('.headerContainer select', 'border', '1px solid ' + BORDER_GREY);

    createCSS('.imageButton', 'border', '1px solid ' + BORDER_GREY);
    
    createCSS('.x-layout-split-right', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_right', 64, COLOR_MAIN_GREY) + ')');
    createCSS('.x-splitter-collapsed .x-layout-split-right', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_left', 64, COLOR_MAIN_GREY) + ')');
    createCSS('.x-layout-split-right', 'background-position', '-3px 0');
    createCSS('.x-layout-split-right', 'background-size', '16px 16px');

    createCSS('.x-layout-split-bottom', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_down', 64, COLOR_MAIN_GREY) + ')');
    createCSS('.x-splitter-collapsed .x-layout-split-bottom', 'background-image', 'url(' + IMAGE_LIBRARY.getImage('arrow_up', 64, COLOR_MAIN_GREY) + ')');
    //createCSS('.x-layout-split-bottom', 'background-position', '0');
    createCSS('.x-layout-split-bottom', 'background-size', '12px 12px');

    var groupEntryAttributes = "padding:15px 5px 10px 15px;font-size:" + FONT_SIZE_TITLE + "px;font-weight:500;color:" + COLOR_GROUP_ENTRY.toString() + ";cursor:default;"; 
    createCSS('.groupEntry', groupEntryAttributes);
    createCSS(".groupEntry.viewOnHover", "background-color", "white");
    createCSS('.viewOnHover', 'background-color', COLOR_HOVER);

    createCSS(".searchResultsAddressBookEntry.viewOnHover", 'background-color', 'initial');

    createCSS('.x-panel-header-title-default .x-title-text', groupEntryAttributes);
    createCSS('.x-panel-header-default-vertical', 'background-color', 'white');

    createCSS('.background-color-arrow-down', 'color', PANEL_BACKGROUND_GREY);

    Ext.each(['.x-grid-item', '.x-grid-item-selected'], function (className)
    {
        createCSS(className, 'color', DARKER_GREY.createDarker(0.2) + " !important");
    }, this);
    createCSS(".x-grid-item-selected", "background-color", COLOR_SELECTION);
    createCSS('.x-menu-item-selected', 'background-color', COLOR_SELECTION);

    createCSS('.regular-checkbox', '-webkit-appearance', 'none');
    createCSS('.regular-checkbox', '-moz-appearance', 'none');
    createCSS('.regular-checkbox', 'border', '1px solid ' + NEW_GREY);
    createCSS('.regular-checkbox', 'padding', '7px');
    createCSS('.regular-checkbox:checked', 'background-image', 'url(' + IMAGE_LIBRARY.getImage("check", 64, NEW_GREY) + ')');
    createCSS('.regular-checkbox:checked', 'background-size', 'contain');
}
