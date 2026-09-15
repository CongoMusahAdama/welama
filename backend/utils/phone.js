function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
}

function ghanaLocalPhone(value) {
    const digits = digitsOnly(value);
    if (!digits) return '';
    if (digits.length === 10 && digits.startsWith('0')) return digits;
    if (digits.length === 12 && digits.startsWith('233')) return `0${digits.slice(3)}`;
    if (digits.length === 13 && digits.startsWith('2330')) return digits.slice(3);
    if (digits.length === 9) return `0${digits}`;
    return digits;
}

function phoneLookupValues(value) {
    const trimmed = String(value || '').trim();
    const local = ghanaLocalPhone(trimmed);
    if (!local) return trimmed ? [trimmed] : [];
    const national = local.startsWith('0') ? local.slice(1) : local;
    const intl = `233${national}`;
    return [...new Set([trimmed, local, national, intl, `+${intl}`])];
}

function phonesMatch(a, b) {
    const left = ghanaLocalPhone(a);
    const right = ghanaLocalPhone(b);
    return Boolean(left && right && left === right);
}

module.exports = {
    digitsOnly,
    ghanaLocalPhone,
    phoneLookupValues,
    phonesMatch
};
