// src/data/country-codes.ts

export interface Country {
    name: string;
    dial_code: string;
    code: string;
    flag: string;
}

export const countryCodes: Country[] = [
    { name: 'Spain', dial_code: '+34', code: 'ES', flag: '🇪🇸' },
    { name: 'Mexico', dial_code: '+52', code: 'MX', flag: '🇲🇽' },
    { name: 'Argentina', dial_code: '+54', code: 'AR', flag: '🇦🇷' },
    { name: 'Colombia', dial_code: '+57', code: 'CO', flag: '🇨🇴' },
    { name: 'United States', dial_code: '+1', code: 'US', flag: '🇺🇸' },
    // A continuación, una lista más completa. Puedes añadir o quitar los que quieras.
    { name: 'Afghanistan', dial_code: '+93', code: 'AF', flag: '🇦🇫' },
    { name: 'Brazil', dial_code: '+55', code: 'BR', flag: '🇧🇷' },
    { name: 'Canada', dial_code: '+1', code: 'CA', flag: '🇨🇦' },
    { name: 'Chile', dial_code: '+56', code: 'CL', flag: '🇨🇱' },
    { name: 'China', dial_code: '+86', code: 'CN', flag: '🇨🇳' },
    { name: 'France', dial_code: '+33', code: 'FR', flag: '🇫🇷' },
    { name: 'Germany', dial_code: '+49', code: 'DE', flag: '🇩🇪' },
    { name: 'India', dial_code: '+91', code: 'IN', flag: '🇮🇳' },
    { name: 'Italy', dial_code: '+39', code: 'IT', flag: '🇮🇹' },
    { name: 'Japan', dial_code: '+81', code: 'JP', flag: '🇯🇵' },
    { name: 'Peru', dial_code: '+51', code: 'PE', flag: '🇵🇪' },
    { name: 'United Kingdom', dial_code: '+44', code: 'GB', flag: '🇬🇧' },
];
