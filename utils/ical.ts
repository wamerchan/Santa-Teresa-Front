import { Reservation, ReservationSource } from '../types';

interface ICalEvent {
    uid: string;
    dtstart: string;
    dtend: string;
    summary: string;
    description: string;
}

// Unfolds iCal lines. A line starting with a space is a continuation of the previous line.
function unfold(icalData: string): string {
    return icalData.replace(/\r\n /g, '');
}

function parseICal(icalData: string): ICalEvent[] {
    const unfoldedData = unfold(icalData);
    const events: ICalEvent[] = [];
    const eventBlocks = unfoldedData.split('BEGIN:VEVENT');
    eventBlocks.shift();

    for (const block of eventBlocks) {
        const lines = block.split(/\r\n|\n/);
        const event: any = {};
        for (const line of lines) {
            const parts = line.split(':');
            const key = parts[0].split(';')[0]; // Ignore params like ;VALUE=DATE
            const value = parts.slice(1).join(':');

            switch (key) {
                case 'UID':
                    event.uid = value;
                    break;
                case 'DTSTART':
                    event.dtstart = value;
                    break;
                case 'DTEND':
                    event.dtend = value;
                    break;
                case 'SUMMARY':
                    event.summary = value;
                    break;
                case 'DESCRIPTION':
                    event.description = value.replace(/\\n/g, '\n');
                    break;
                case 'END':
                    if (value === 'VEVENT' && event.uid && event.dtstart && event.dtend) {
                        events.push(event as ICalEvent);
                    }
                    break;
            }
        }
    }
    return events;
}

function parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const cleanDateStr = dateStr.trim().split('T')[0];
    const year = cleanDateStr.substring(0, 4);
    const month = cleanDateStr.substring(4, 6);
    const day = cleanDateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
}

function getGuestName(event: ICalEvent): string {
    if (event.description) {
        const guestMatch = event.description.match(/GUEST:\s*(.*?)(\\n|$)/i);
        if (guestMatch && guestMatch[1]) {
            return guestMatch[1].trim();
        }
    }
    if (event.summary) {
        const cleanedSummary = event.summary.replace(/\(.*\)/, '').trim();
        // Ignore common non-guest summaries from Airbnb, Booking.com, etc.
        const ignoredSummaries = ['reserved', 'not available', 'closed', 'bloqueado'];
        if (cleanedSummary && !ignoredSummaries.includes(cleanedSummary.toLowerCase())) {
            return cleanedSummary;
        }
    }
    return 'Reservado';
}

export function processICalData(icalData: string, source: ReservationSource): Reservation[] {
    const events = parseICal(icalData);
    return events.map(event => ({
        id: event.uid,
        guestName: getGuestName(event),
        checkIn: parseDate(event.dtstart),
        checkOut: parseDate(event.dtend),
        source: source,
        totalPaid: 0,
        commission: 0,
        taxes: 0,
    }));
}
