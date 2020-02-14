Ext.define('PartnerBoard.MiniDashBoardPercentageTile',
{
    extend: 'PartnerBoard.MiniDashBoardValueTile',

    setValue: function (value)
    {
        if (!isValid(this.valueEl) || this.destroyed)
        {
            return;
        }
        this.valueEl.setText(value === -1 ? "--" : (Math.round(value) + "%"));
    }
});