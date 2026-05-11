/**
 * Bangladesh districts and their areas for the cascading city → area dropdown.
 * city dropdown maps to `district` in the address schema.
 * area dropdown maps to `area` in the address schema.
 */

export interface BDDistrict {
    label: string;
    value: string;
    areas: { label: string; value: string }[];
}

export const BD_DISTRICTS: BDDistrict[] = [
    {
        label: "Dhaka",
        value: "Dhaka",
        areas: [
            { label: "Mirpur", value: "Mirpur" },
            { label: "Dhanmondi", value: "Dhanmondi" },
            { label: "Gulshan", value: "Gulshan" },
            { label: "Banani", value: "Banani" },
            { label: "Uttara", value: "Uttara" },
            { label: "Mohammadpur", value: "Mohammadpur" },
            { label: "Bashundhara", value: "Bashundhara" },
            { label: "Motijheel", value: "Motijheel" },
            { label: "Tejgaon", value: "Tejgaon" },
            { label: "Farmgate", value: "Farmgate" },
            { label: "Shyamoli", value: "Shyamoli" },
            { label: "Azimpur", value: "Azimpur" },
            { label: "Lalbagh", value: "Lalbagh" },
            { label: "Badda", value: "Badda" },
            { label: "Rampura", value: "Rampura" },
            { label: "Khilgaon", value: "Khilgaon" },
        ],
    },
    {
        label: "Gazipur",
        value: "Gazipur",
        areas: [
            { label: "Tongi", value: "Tongi" },
            { label: "Gazipur Sadar", value: "Gazipur Sadar" },
            { label: "Kaliakair", value: "Kaliakair" },
            { label: "Kapasia", value: "Kapasia" },
            { label: "Sreepur", value: "Sreepur" },
        ],
    },
    {
        label: "Narayanganj",
        value: "Narayanganj",
        areas: [
            { label: "Narayanganj Sadar", value: "Narayanganj Sadar" },
            { label: "Siddhirganj", value: "Siddhirganj" },
            { label: "Fatullah", value: "Fatullah" },
            { label: "Bandar", value: "Bandar" },
            { label: "Rupganj", value: "Rupganj" },
        ],
    },
    {
        label: "Savar",
        value: "Savar",
        areas: [
            { label: "Savar Sadar", value: "Savar Sadar" },
            { label: "Ashulia", value: "Ashulia" },
            { label: "Jahangirnagar University", value: "Jahangirnagar University" },
            { label: "Hemayetpur", value: "Hemayetpur" },
            { label: "Tetuljhora", value: "Tetuljhora" },
        ],
    },
    {
        label: "Chattogram",
        value: "Chattogram",
        areas: [
            { label: "Kotwali", value: "Kotwali" },
            { label: "Agrabad", value: "Agrabad" },
            { label: "Pahartali", value: "Pahartali" },
            { label: "Panchlaish", value: "Panchlaish" },
            { label: "Halishahar", value: "Halishahar" },
            { label: "Nasirabad", value: "Nasirabad" },
        ],
    },
    {
        label: "Rajshahi",
        value: "Rajshahi",
        areas: [
            { label: "Rajshahi Sadar", value: "Rajshahi Sadar" },
            { label: "Boalia", value: "Boalia" },
            { label: "Shah Makhdum", value: "Shah Makhdum" },
            { label: "Rajpara", value: "Rajpara" },
        ],
    },
    {
        label: "Khulna",
        value: "Khulna",
        areas: [
            { label: "Khulna Sadar", value: "Khulna Sadar" },
            { label: "Sonadanga", value: "Sonadanga" },
            { label: "Khalishpur", value: "Khalishpur" },
            { label: "Daulatpur", value: "Daulatpur" },
        ],
    },
    {
        label: "Sylhet",
        value: "Sylhet",
        areas: [
            { label: "Sylhet Sadar", value: "Sylhet Sadar" },
            { label: "South Surma", value: "South Surma" },
            { label: "Jaintiapur", value: "Jaintiapur" },
            { label: "Companiganj", value: "Companiganj" },
        ],
    },
    {
        label: "Rangpur",
        value: "Rangpur",
        areas: [
            { label: "Rangpur Sadar", value: "Rangpur Sadar" },
            { label: "Gangachara", value: "Gangachara" },
            { label: "Pirganj", value: "Pirganj" },
            { label: "Mithapukur", value: "Mithapukur" },
        ],
    },
    {
        label: "Barishal",
        value: "Barishal",
        areas: [
            { label: "Barishal Sadar", value: "Barishal Sadar" },
            { label: "Kotwali", value: "Kotwali" },
            { label: "Airport", value: "Airport" },
            { label: "Bakerganj", value: "Bakerganj" },
        ],
    },
    {
        label: "Mymensingh",
        value: "Mymensingh",
        areas: [
            { label: "Mymensingh Sadar", value: "Mymensingh Sadar" },
            { label: "Trishal", value: "Trishal" },
            { label: "Bhaluka", value: "Bhaluka" },
            { label: "Muktagacha", value: "Muktagacha" },
        ],
    },
    {
        label: "Comilla",
        value: "Comilla",
        areas: [
            { label: "Comilla Sadar", value: "Comilla Sadar" },
            { label: "Kotbari", value: "Kotbari" },
            { label: "Laksam", value: "Laksam" },
            { label: "Chauddagram", value: "Chauddagram" },
        ],
    },
    {
        label: "Bogura",
        value: "Bogura",
        areas: [
            { label: "Bogura Sadar", value: "Bogura Sadar" },
            { label: "Shajahanpur", value: "Shajahanpur" },
            { label: "Shibganj", value: "Shibganj" },
        ],
    },
    {
        label: "Jessore",
        value: "Jessore",
        areas: [
            { label: "Jessore Sadar", value: "Jessore Sadar" },
            { label: "Manirampur", value: "Manirampur" },
            { label: "Abhaynagar", value: "Abhaynagar" },
        ],
    },
    {
        label: "Tangail",
        value: "Tangail",
        areas: [
            { label: "Tangail Sadar", value: "Tangail Sadar" },
            { label: "Madhupur", value: "Madhupur" },
            { label: "Gopalpur", value: "Gopalpur" },
        ],
    },
];

/** Determine if a district is "Inside Dhaka" for shipping calculation. */
export const DHAKA_DISTRICTS = ["Dhaka", "Dhaka Sadar"];

export function isDhakaDistrict(district: string): boolean {
    return DHAKA_DISTRICTS.includes(district);
}

export function getAreasForDistrict(districtValue: string) {
    const district = BD_DISTRICTS.find((d) => d.value === districtValue);
    return district?.areas ?? [];
}
