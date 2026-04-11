/**
 * Check if two schedule entries overlap in time
 * Each entry has: dayOfWeek (2-8), startPeriod (1-18), endPeriod (1-18)
 */
const isOverlapping = (s1, s2) => {
    if (s1.dayOfWeek !== s2.dayOfWeek) return false;
    return s1.startPeriod <= s2.endPeriod && s1.endPeriod >= s2.startPeriod;
};

/**
 * Check for conflicts between a new schedule and a list of existing sections
 * Returns a descriptive conflict message or null
 */
const findScheduleConflict = (newSchedule, existingSections) => {
    if (!newSchedule || !Array.isArray(newSchedule)) return null;
    
    for (const newEntry of newSchedule) {
        for (const section of existingSections) {
            if (!section.schedule || !Array.isArray(section.schedule)) continue;
            
            for (const existingEntry of section.schedule) {
                if (isOverlapping(newEntry, existingEntry)) {
                    return {
                        conflict: true,
                        message: `Trùng lịch với lớp ${section.code} (${section.subject?.name || ''}) vào Thứ ${newEntry.dayOfWeek}, Tiết ${existingEntry.startPeriod}-${existingEntry.endPeriod}`,
                        section: section
                    };
                }
            }
        }
    }
    return null;
};

module.exports = {
    isOverlapping,
    findScheduleConflict
};
