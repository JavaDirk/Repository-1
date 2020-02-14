Ext.define('PartnerBoard.MiniDashBoardTimespanTile',
{
    extend: 'PartnerBoard.MiniDashBoardValueTile',

    setValue: function (value)
    {
        if (!isValid(this.valueEl) || this.destroyed)
        {
            return;
        }
        this.valueEl.setText(convertSecondsToString(value));
    }
});