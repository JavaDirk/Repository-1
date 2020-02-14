Ext.define('PartnerBoard.FullDashBoardTimespanTile',
{
    extend: 'PartnerBoard.FullDashBoardValueTile',
    
    setValue: function (value)
    {
        if (!isValid(this.valueEl) || this.destroyed)
        {
            return;
        }
        this.valueEl.setText(convertSecondsToString(value));
    }
});