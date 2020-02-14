/**
 * Created by jebing on 16.07.2015.
 */
Ext.define('GoogleMapsPanel',
{
    extend: 'Ext.Container',

    layout:
    {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    title: '',
    closable: true,

    displayRoute: false,

    contact: null,

    initComponent: function ()
    {
        this.callParent();

        var self = this;

        if (!isGoogleMapsApiLoaded || !isValid(this.contact) || !isValid(this.contact.getAddress()))
        {
            return;
        }
        var address = this.contact.getAddress();

        var distanceLabel = Ext.create('Ext.form.Label',
        {
            style: 'font-size:' + FONT_SIZE_TITLE + 'px;color:' + COLOR_TITLE
        });

        this.routeContainer = this.add(Ext.create('Ext.Container',
        {
            layout:
            {
                type: 'vbox',
                align: 'stretch'
            },
            margin: '5',
            items: [distanceLabel],
            hidden: !this.displayRoute
        }));
        this.mapContainer = this.add(new Ext.ux.GMapPanel(
            {
                margin: '5',
                gmapType: 'map',
                flex: 1,

                center:
                {
                    geoCodeAddr: address.toString(),
                    marker:
                    {
                        title: address.toString()
                    }
                },
                mapOptions:
                {
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                },

                onLookupComplete: function (data, response, marker)
                {
                    if (response === 'OK')
                    {
                        if (self.displayRoute)
                        {
                            this.createMap(data[0].geometry.location);
                            if (isValid(MY_CONTACT.getAddress()))
                            {
                                this.route(MY_CONTACT.getAddress().toString(), address.toString());
                            }
                        }
                        else
                        {
                            this.createMap(data[0].geometry.location, marker);
                        }
                    }
                    else
                    {
                        if (response === "ZERO_RESULTS")
                        {
                            self.showError(LANGUAGE.getString('addressCouldNotBeFound', address.toString()));
                        }
                        else
                        {
                            self.showError(LANGUAGE.getString('unknownErrorOccurred'));
                            console.log("Unknown error from google maps: " + JSON.stringify(response));
                        }
                    }
                },

                route: function (start, end)
                {
                    if (!isValidString(start) || !isValidString(end))
                    {
                        return;
                    }

                    var directionsDisplay = new google.maps.DirectionsRenderer();
                    var directionsService = new google.maps.DirectionsService();

                    directionsDisplay.setMap(this.gmap);
                    var request =
                    {
                        origin: start,
                        destination: end,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    directionsService.route(request, function (response, status)
                    {
                        if (status === google.maps.DirectionsStatus.OK)
                        {
                            if (response.routes.length > 0)
                            {
                                if (response.routes[0].legs.length > 0)
                                {
                                    var distance = response.routes[0].legs[0].distance.text;
                                    var duration = response.routes[0].legs[0].duration.text;
                                    distanceLabel.setText(LANGUAGE.getString("distanceDuration", distance, duration));
                                }
                            }
                            directionsDisplay.setDirections(response); //blendet die Route in der Karte ein
                        }
                        else if (status === google.maps.DirectionsStatus.NOT_FOUND)
                        {
                            self.showError(LANGUAGE.getString('routeCouldNotBeFound', start, end));
                        }
                        else
                        {
                            self.showError(LANGUAGE.getString('unknownErrorOccurred'));
                            console.log("Unknown error from google maps routing: " + JSON.stringify(response));
                        }
                    });
                },

                listeners:
                {
                    mapready: function ()
                    {
                        if (self.displayRoute)
                        {
                            google.maps.event.addListener(this.gmap, 'click', function ()
                            {
                                window.open('http://www.google.de/maps/dir/' + MY_CONTACT.getAddress().toString() + "/" + address.toString(), '_blank');
                            });
                        }
                        else
                        {
                            google.maps.event.addListener(this.gmap, 'click', function ()
                            {
                                window.open('http://maps.google.com/?q=' + address.toString(), '_blank');
                            });
                        }
                    }
                }
            }));
    },

    isEqualToThisPanel: function (panel)
    {
        return getClassName(this) === getClassName(panel) && panel.displayRoute === this.displayRoute;
    },

    showError: function (text)
    {
        this.insert(0, Ext.create('ErrorMessageComponent',
        {
            margin: '10 5',
            errorMessageText: text,
            errorType: ErrorType.Error,
            borderWidth:1
        }));
    }
});