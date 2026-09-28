const calculateNights = (checkInDate, checkOutDate) =>
{
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const difference =
        checkOut.getTime() - checkIn.getTime();

    const nights =
        Math.ceil(difference / (1000 * 60 * 60 * 24));

    return nights;
};


export {
    calculateNights
};