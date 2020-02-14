Ext.define('PartnerBoard.FullDashBoardPercentageTile',
{
    extend: 'PartnerBoard.FullDashBoardValueTile',

    setValue: function (value)
    {
        if (!isValid(this.valueEl) || this.destroyed)
        {
            return;
        }
        this.valueEl.setText(value === -1 ? "--" : (Math.round(value) + "%"));
    }
});