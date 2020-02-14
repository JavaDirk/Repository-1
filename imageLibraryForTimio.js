var allColors = [COLOR_MAIN, COLOR_MAIN_2, COLOR_MAIN_GREY, COLOR_DARK_AVATAR, BROWN, ALMOST_BLACK, NEW_BLUE, GREEN, DARKER_GREEN, NORMAL_GREY, COLOR_CALL_BUTTON_ICON, COLOR_CALL_BUTTON_DIAL, COLOR_WATERMARK, COLOR_CALL_BUTTON_ICON, COLOR_TAB_ICON_SELECTED, COLOR_TAB_ICON_NORMAL, COLOR_FAVORITE_BUTTON, COLOR_FAVORITE_BUTTON_ON_HOVER, NEW_GREY, WHITE, DARKER_GREY, COLOR_OVERLAY_BUTTON, COLOR_AGENT_RED, COLOR_AGENT_GREEN, COLOR_AGENT_BLUE, COLOR_AGENT_GREY, COLOR_RED_IMAGE, TITLE_GREY, DARK_GREY, BLACK, ANTHRAZIT_BLUE];

Ext.define('ImageLibraryForTimio',
{
    extend: 'ImageLibrary',
    images:
    [
        {
            src: ['images/64/monitor.png', 'images/64/clipboard.png','images/64/manual_campaign.png', 'images/64/whatsapp_without_phone.png', 'images/64/whatsapp.png', 'images/64/thick_add.png', 'images/64/pause.png', 'images/64/transfer.png', 'images/64/process.png', 'images/64/user_small.png', 'images/64/user.png', 'images/64/group.png', 'images/64/Medialist.png', 'images/64/left.png', 'images/64/right.png','images/64/reload.png'],
            scale: 64,
            color: allColors
        },
        {
            src: ['images/64/map.png', 'images/64/favorite.png', 'images/64/conference.png', 'Images/64/inbox.png', 'Images/64/edit.png', 'Images/64/clock.png', 'Images/64/warning.png', 'Images/64/check.png', 'Images/64/search.png', 'Images/64/mail.png', 'Images/64/lock.png', 'Images/64/unlock.png', 'Images/64/print.png', 'Images/64/paperclip.png', 'Images/64/trash.png', 'Images/64/camera.png', 'Images/64/settings.png', 'Images/64/mobile.png', 'Images/64/reply.png', 'Images/64/transferMail.png', 'Images/64/remove.png', 'Images/64/action.png', 'Images/64/splitter.png', 'Images/64/spam.png', 'Images/64/smallView.png', 'Images/64/fullView.png', 'Images/64/calendar.png', 'Images/64/video.png', 'Images/64/newContact.png', 'Images/64/readEmail.png'],
            scale: 64,
            color: allColors
        },

        {
            src: ['images/64/home.png', 'images/64/blackBoard.png', 'images/64/blackBoard_small2.png', 'images/64/chats.png', 'images/64/chats_small.png', 'images/64/chats_small2.png', 'images/64/users_small.png', 'images/64/users_small2.png', 'images/64/calldiversion.png', 'images/64/disc.png', 'images/64/speaker.png', 'images/64/privacy.png', 'images/64/users.png', 'images/64/chat.png', 'images/64/addressBook.png', 'images/64/addressBook2.png', 'images/128/point.jpg', 'images/64/info2.png', 'images/64/tab_close.png', 'images/64/headset2.png', 'images/64/phone.png', 'images/64/phone_ringing.png', 'images/64/hangUp.png', 'images/64/redirection.png', 'images/64/arrow_left.png', 'images/64/microphone.png', 'images/64/noMicrophone.png', 'images/64/info.png', 'images/64/arrow_up.png', 'images/64/car.png'],
            scale: 64,
            color: allColors
        },

        {
            src: ['images/64/down.png', 'images/64/up.png', 'images/64/arrow_down.png', 'images/64/arrow_right.png', 'Images/64/add.png','Images/64/world.png', 'Images/64/forward_acd.png', 'Images/64/forward_standard.png', 'Images/64/phone.png', 'Images/64/phone_out.png', 'Images/64/phone_in.png', 'Images/64/phone_hold.png', 'Images/64/phone_conference.png', 'Images/64/phone_hangUp.png', 'images/64/swapHold.png', 'images/64/cubes.png', 'images/64/delete.png', 'images/64/more.png', 'images/64/folder3.png', 'images/64/file.png', 'Images/64/factory_small.png', 'Images/64/mobile_small.png', 'Images/64/phone_small.png', 'images/64/list.png', 'images/64/split.png', 'images/64/eye.png',  'images/64/bell.png', 'images/64/resize.png', 'images/64/invitation.png', 'images/64/square.png', 'images/64/keypad.png'],
            scale: 64,
            color: allColors
        },
        {
            src: ['images/64/sampleTextIcon.png', 'images/64/form.png', 'images/64/outboundMailUnread.png', 'images/64/outboundMailRead.png', 'images/64/inboundMailUnread.png', 'images/64/inboundMailRead.png', 'images/64/upAcd.png', 'images/64/downAcd.png', 'images/64/toRequest.png', 'images/16/menu.png', 'images/16/sendMail.png', 'images/64/minus.png', 'images/64/circle.png', 'images/64/music.png'],
            scale: 64,
            color: allColors
        },
        {
            src: ['Images/64/phone_ringing_3.png', 'Images/64/phone_ringing_2.png', 'Images/64/phone_ringing.png'],
            scale: 64,
            color: [NEW_GREY, COLOR_AGENT_BLUE, COLOR_TAB_ICON_SELECTED, COLOR_TAB_ICON_NORMAL]
        },
        {
            src: ['images/64/phone_in.png', 'images/64/phone_out.png', 'images/64/phone_in_acd.png', 'images/64/phone_out_acd.png', 'images/64/phone_in_redirected.png', 'images/64/phone_out_redirected.png', 'images/64/phone.png'],
            scale: 64,
            color: [WHITE, COLOR_SUCCESSFULL_CALL, COLOR_UNSUCCESSFULL_CALL, COLOR_TAB_ICON_NORMAL, COLOR_TAB_ICON_SELECTED]
        },
        {
            src: ['images/64/phone_add.png', 'images/64/phone_transfer.png'],
            scale: 64,
            color: [COLOR_CALL_BUTTON_ICON, COLOR_CALL_BUTTON_DIAL, WHITE, NEW_GREY]
        }
    ],

    initComponent: function () {
        this.callParent();
    },

    getLaunchIcon: function ()
    {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>';
    },

    getSplitterIcon: function (vertical)
    {
        if (vertical)
        {
            return this.getVerticalSplitterIcon();
        }
        return this.getHorizontalSplitterIcon();
    },

    getVerticalSplitterIcon: function ()
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAJElEQVR42mPct2/ffwYgcHJyYoSxGbEKMmAB2AVHzRw1E6+ZACtUc6/A3+q/AAAAAElFTkSuQmCC';
    },

    getHorizontalSplitterIcon: function ()
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAYAAABSIVz6AAAAJElEQVR42mPct2/ffwYgcHJyYgTR9OIzDpjFDAMEBs7HA2UxAJ3MfOqqKQkMAAAAAElFTkSuQmCC';
    }
});

var IMAGE_LIBRARY = new ImageLibraryForTimio();