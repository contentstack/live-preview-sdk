export function convertToISO8601UTC(
    dateString: string,
    timeString: string
): string {
    // Extract the time and offset
    const time = timeString.slice(0, 8); // '00:00:22'
    const offset = timeString.slice(8); // '+0530'

    // get the only date part of the given date
    const datePart = dateString.split("T")[0];

    // Combine date and time into a single string
    const dateTimeString = `${datePart} ${time}${offset}`;

    // Parse the dateTimeString as a Date object
    const date = new Date(dateTimeString);

    // Convert the date to ISO 8601 format in UTC
    const iso8601UTC = date.toISOString();

    return iso8601UTC;
}
