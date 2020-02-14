Ext.define('CallCommand',
{
    value: 0,

    isPossible: function (callCommands)
    {
        if (callCommands === -1)
        {
            return false;
        }
        /*jslint bitwise: true */
        var result = (callCommands & this.value) !== 0;
        /*jslint bitwise: false */
        return result;
    }
});

Ext.define('CallCommandHangUp',
{
    extend: 'CallCommand',
    value: 1
});

Ext.define('CallCommandAnswer',
{
    extend: 'CallCommand',
    value: 2
});

Ext.define('CallCommandBlindTransfer',
{
    extend: 'CallCommand',
    value: 4
});

Ext.define('CallCommandRedirect',
{
    extend: 'CallCommand',
    value: 8
});

Ext.define('CallCommandHold',
{
    extend: 'CallCommand',
    value: 16
});

Ext.define('CallCommandUnhold',
{
    extend: 'CallCommand',
    value: 32
});

Ext.define('CallCommandSwapHold',
{
    extend: 'CallCommand',
    value: 64
});

Ext.define('CallCommandCompleteTransfer',
{
    extend: 'CallCommand',
    value: 128
});

Ext.define('CallCommandCompleteConference',
{
    extend: 'CallCommand',
    value: 256
});

Ext.define('CallCommandSetupConference',
{
    extend: 'CallCommand',
    value: 512
});

Ext.define('CallCommandSetupTransfer',
{
    extend: 'CallCommand',
    value: 1024
});

Ext.define('CallCommandCallback',
{
    extend: 'CallCommand',
    value: 2048
});

Ext.define('CallCommandSendDTMF',
{
    extend: 'CallCommand',
    value: 4096
});

Ext.define('LineCommand',
{
    value: 0,

    isPossible: function (lineCommands)
    {
        if (lineCommands === -1)
        {
            return false;
        }
        /*jslint bitwise: true */
        var result = (lineCommands & this.value) !== 0;
        /*jslint bitwise: false */
        return result;
    }
});

Ext.define('LineCommandMakeCall',
{
    extend: 'LineCommand',
    value: 1
});

Ext.define('LineCommandForward',
{
    extend: 'LineCommand',
    value: 2
});

Ext.define('LineCommandForwardCancel',
{
    extend: 'LineCommand',
    value: 4
});

Ext.define('LineCommandGetForwardDestination',
{
    extend: 'LineCommand',
    value: 8
});

Ext.define('LineCommandPickup',
{
    extend: 'LineCommand',
    value: 16
});

var CallSuccess =
{
    CallSuccessUnknown: { value: 0x00000000}, /*!< Unknown success state		*/
    CallSuccessBusy: { value: 0x00000001}, /*!< Busy						*/
    CallSuccessNotAvailable: { value: 0x00000002}, /*!< Not available				*/
    CallSuccessConnected: { value: 0x00000004}, /*!< Connected/conferenced		*/
    CallSuccessDialtone: { value: 0x00000005}, /*!< Dialtone					*/
    CallSuccessDialing: { value: 0x00000006}, /*!< Dialing					*/
    CallSuccessOffering: { value: 0x00000007}, /*!< Ringing (incoming call)	*/
    CallSuccessRingback: { value: 0x00000008} /*!< Ringing (outgoing call)	*/
};

var CallReason =
{
    CallReasonDirect: { value: 0x00000001}, /*!< Standard (direct Call)					*/
    CallReasonFwdBusy: { value: 0x00000002},
    CallReasonFwdNoAnswer: { value: 0x00000004},
    CallReasonFwdUncond: { value: 0x00000008},
    CallReasonPickup: { value: 0x00000010},
    CallReasonRedirect: { value: 0x00000040},
    CallReasonCallCompletion: { value: 0x00000080}, /*!< Call initiated on 'Callback when busy' */
    CallReasonTransfer: { value: 0x00000100}, /*!< Call was transfered					*/
    CallReasonOutOfService: { value: 0x40000000} /*!< Device out of Service					*/
};

Ext.define('CallFlags',
{
    value: 0,

    isPossible: function (callFlags)
    {
        if (callFlags === -1)
        {
            return false;
        }
        /*jslint bitwise: true */
        var result = (callFlags & this.value) !== 0;
        /*jslint bitwise: false */
        return result;
    }
});

Ext.define('CallFlagsPrivateCall',
{
    extend: 'CallFlags',
    value: 0x00000001
});

Ext.define('CallFlagsHandledByPhone',
{
    extend: 'CallFlags',
    value: 0x00000002
});

Ext.define('CallFlagsCaesarRecorderCall',
{
    extend: 'CallFlags',
    value: 0x00000004
});

Ext.define('CallFlagsDiscardable',
{
    extend: 'CallFlags',
    value: 0x00000008
});

Ext.define('CallFlagsNumberNotKnown',
{
    extend: 'CallFlags',
    value: 0x00010000
});

Ext.define('CallFlagsInternalCall',
{
    extend: 'CallFlags',
    value: 0x00020000
});

Ext.define('CallFlagsRemoteNbIsVoicebox',
{
    extend: 'CallFlags',
    value: 0x00000040
});

Ext.define('CallFlagsNewDestIsVoicebox',
{
    extend: 'CallFlags',
    value: 0x00000080
});

Ext.define('CallFlagsFollowMeCall',
{
    extend: 'CallFlags',
    value: 0x00000100
});

Ext.define('CallFlagsCaesar2GoOutboundCall',
{
    extend: 'CallFlags',
    value: 0x00000200
    });

Ext.define('CallFlagsIsEncryptedCall',
{
    extend: 'CallFlags',
    value: 0x00000020
});