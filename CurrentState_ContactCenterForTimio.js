//warum der ganze Schmu? Abwärtskompatibilität! Früher war es bei der ContactCenterAvailability so, dass wenn mir nichts geliefert wurde, 
//dass das Contact Center available war
//dies wurde für timio geändert, so dass ich jetzt eine 0 bekomme, wenn available
//für die anderen aber ist noch das alte Verfahren da
CurrentState_ContactCenter.prototype.updateContactCenterAvailability = function (getEventsResponse)
{
    if (isValid(getEventsResponse.getContactCenterAvailability()))
    {
        this.setContactCenterAvailability(getEventsResponse.getContactCenterAvailability());
    }
};
