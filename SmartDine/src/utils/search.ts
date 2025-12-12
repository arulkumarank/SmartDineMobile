export const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

export const isFuzzyMatch = (text: string, query: string, tolerance: number = 2): boolean => {
    const t = text.toLowerCase();
    const q = query.toLowerCase();

    // 1. Direct includes (fast)
    if (t.includes(q)) return true;

    // 2. Token matching
    const tWords = t.split(' ');
    const qWords = q.split(' ');

    // Check if any significant word from query is in text (fuzzy)
    for (const qw of qWords) {
        if (qw.length < 3) continue; // Skip short words for fuzzy
        for (const tw of tWords) {
            if (Math.abs(tw.length - qw.length) > tolerance) continue;
            if (levenshteinDistance(tw, qw) <= tolerance) return true;
        }
    }

    // 3. Whole phrase fuzzy match (if short enough)
    if (Math.abs(t.length - q.length) <= tolerance + 2 && q.length > 4) {
        if (levenshteinDistance(t, q) <= tolerance + 1) return true;
    }

    return false;
};
