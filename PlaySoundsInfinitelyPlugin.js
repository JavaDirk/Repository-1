Ext.define('PlaySoundsInfinitelyPlugin',
    {
        extend: 'Ext.plugin.Abstract',
        alias: 'plugin.PlaySoundsInfinitelyPlugin',

        init: function (cmp)
        {
            this.setCmp(cmp);

            cmp.startPlayingSound = () =>
            {
                this.startPlayingSound();
            };


            this.onDeviceChange = async (customEvent) =>
            {
                this.changeDeviceForRingtone();
            };
            DEVICEMANAGER.addEventListener("deviceChange", this.onDeviceChange);
        },

        destroy: function ()
        {
            if (this.audio)
            {
                this.audio.pause();
            }

            DEVICEMANAGER.removeEventListener("deviceChange", this.onDeviceChange);

            clearInterval(this.playSoundInterval);
            this.callParent();
        },

        changeDeviceForRingtone: async function ()
        {
            if (this.audio && DEVICEMANAGER)
            {
                var selectedDevices = DEVICEMANAGER.getSelectedDevices();
                if (isValid(selectedDevices, "soundOutputDeviceId.id"))
                {
                    await this.audio.setSinkId(selectedDevices.soundOutputDeviceId.id);
                }
            }
        },

        startPlayingSound: function ()
        {
            var playSound = () =>
            {
                if (this.destroyed)
                {
                    return;
                }
                this.playSound();
            };
            playSound();

            var delayInSeconds = 3.5;
            this.playSoundInterval = setInterval(playSound, delayInSeconds * 1000);
        },

        playSound: function ()
        {
            var soundFile = this.soundFile || OEM_SETTINGS.getSoundFile();
            this.audio = new Audio(soundFile);
            this.changeDeviceForRingtone();
            this.audio.play();
        },

        setSoundFile: function (soundFile)
        {
            this.soundFile = soundFile;
        }
    });