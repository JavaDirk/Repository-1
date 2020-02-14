/**
 * Created by martens on 28.09.2015.
 */
Ext.define('DateTime', {
    date: '',
    fullDate: '',
    dateTime: '',
    constructor: function (date)
    {
        this.date = new Date(date);
    },
    getDateString: function (date, hours) {
        if (!date)
        {
            date = this.date;
        }

        if (!hours)
        {
            hours = date.getHours();
        }

        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + 'T' + hours + ':' + date.getMinutes() + ':' + date.getSeconds();
    },
    formateNumber: function (number) {
        if (number < 10)
        {
            return '0' + number;
        }
        return number;
    },
    getDateHours: function (date)
    {
        if (!date)
        {
            date = this.date;
        }
        return this.formateNumber(date.getHours());
    },
    getDateMinutes: function (date)
    {
        if (!date)
        {
            date = this.date;
        }
        return this.formateNumber(date.getMinutes());
    },
    getDateTime: function (date)
    {
        if (!date)
        {
            date = this.date;
        }

        return (this.formateNumber(date.getDate()) + '.' + this.formateNumber(date.getMonth() + 1) + '.' + this.formateNumber(date.getFullYear()));
    },
    getRowDateTime: function (date) 
    {
        if (!date)
        {
            date = this.date;
        }
        return (this.formateNumber(date.getDate()) + '.' + this.formateNumber(date.getMonth()) + '.' + this.formateNumber(date.getFullYear()));
    },
    getDate: function (date)
    {
        if (!date)
        {
            date = this.date;
        }

        return date.toString();
    },
    getTime: function (date)
    {

        if (!date)
        {
            date = this.date;
        }

        return (this.getDateHours(date) + ':' + this.getDateMinutes(date));
    },
    createDate: function (date)
    {
        /*var isUTC = false;

        if (date.indexOf('Z') === -1)
        {
            isUTC = true;
        }*/

        /*date = date.split('T');
        var curDate = date[0];
        var dateTime = date[1];

        curDate = curDate.split('-');
        dateTime = dateTime.split(':');

        var result = new Date(curDate[0], curDate[1] - 1, curDate[2], dateTime[0], dateTime[1], dateTime[2]);*/

        return new Date(date);

        /*if (isUTC)
        {
            result.setHours(result.getHours() - 2);
        }*/

        //return result;
    },
    difference: function (date1, date2, interval)
    {
        var second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24, week = day * 7;
        date1 = new Date(date1);
        date2 = new Date(date2);
        var timediff = date2 - date1;
        if (isNaN(timediff)) return NaN;
        switch (interval)
        {
            case "years": return date2.getFullYear() - date1.getFullYear();
            case "months": return (
                (date2.getFullYear() * 12 + date2.getMonth())
                -
                (date1.getFullYear() * 12 + date1.getMonth())
            );
            case "weeks": return Math.floor(timediff / week);
            case "days": return Math.floor(timediff / day);
            case "hours": return Math.floor(timediff / hour);
            case "minutes": return Math.floor(timediff / minute);
            case "seconds": return Math.floor(timediff / second);
            default: return undefined;
        }
    },
    getDifferenceDate: function (date)
    {
        var numberDays = this.difference(this.date, date, "days");
        if (numberDays > 0)
        {
            return numberDays + ' ' + LANGUAGE.getString(numberDays === 1 ? 'day' : 'days');
        }
        var numberHours = this.difference(this.date, date, "hours");
        if (numberHours > 0)
        {
            return numberHours + ' ' + LANGUAGE.getString(numberHours === 1 ? "hour" : "hours");
        }
        var numberMinutes = this.difference(this.date, date, "minutes");
        if (numberMinutes > 0)
        {
            return numberMinutes + ' ' + LANGUAGE.getString(numberMinutes === 1 ? 'minute' : 'minutes');
        }
        return LANGUAGE.getString('just');
    }
});