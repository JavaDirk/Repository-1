var LIBRARY = (function ()
{
    var finishedImages = [];

    return { // public interface
        setImage: function (key, value)
        {
            finishedImages[key] = value;

            if (this.logRenderedImages)
            {
                console.log(key + ': ' + value + ',');
            }
        },
        getImage: function (name, size, color, checkContain)
        {
            name = name + '_' + size + '_' + color;
            if (finishedImages[name] || checkContain)
            {
                return finishedImages[name];
            } else
            {

                if (finishedImages.length === 0)
                {
                    console.log("Image library ist noch nicht fertig geladen. Das Bild " + name + ' konnte nicht geladen werden');
                    return name + 'NotInImageLibrary.png';
                }

                console.log('Die Datei ' + name + ' befindet sich nicht in der Image Library');
                return name + 'NotInImageLibrary.png';
            }
        }
    };
})();