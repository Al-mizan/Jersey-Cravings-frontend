/**
 * Bangladesh location data for division -> district -> area/upazila selection.
 */

export type BDOption = { value: string; label: string };

export const BD_DIVISIONS: BDOption[] = [
    { value: "dhaka", label: "Dhaka" },
    { value: "chattogram", label: "Chattogram" },
    { value: "rajshahi", label: "Rajshahi" },
    { value: "khulna", label: "Khulna" },
    { value: "barishal", label: "Barishal" },
    { value: "sylhet", label: "Sylhet" },
    { value: "rangpur", label: "Rangpur" },
    { value: "mymensingh", label: "Mymensingh" },
];

export const BD_DISTRICTS: Record<string, BDOption[]> = {
    dhaka: [
        { value: "dhaka", label: "Dhaka" },
        { value: "gazipur", label: "Gazipur" },
        { value: "narayanganj", label: "Narayanganj" },
        { value: "manikganj", label: "Manikganj" },
        { value: "munshiganj", label: "Munshiganj" },
        { value: "narsingdi", label: "Narsingdi" },
        { value: "tangail", label: "Tangail" },
        { value: "kishoreganj", label: "Kishoreganj" },
        { value: "netrokona", label: "Netrokona" },
        { value: "faridpur", label: "Faridpur" },
        { value: "gopalganj", label: "Gopalganj" },
        { value: "madaripur", label: "Madaripur" },
        { value: "rajbari", label: "Rajbari" },
        { value: "shariatpur", label: "Shariatpur" },
    ],
    chattogram: [
        { value: "chattogram", label: "Chattogram" },
        { value: "coxs_bazar", label: "Cox's Bazar" },
        { value: "rangamati", label: "Rangamati" },
        { value: "bandarban", label: "Bandarban" },
        { value: "khagrachhari", label: "Khagrachhari" },
        { value: "feni", label: "Feni" },
        { value: "noakhali", label: "Noakhali" },
        { value: "lakshmipur", label: "Lakshmipur" },
        { value: "comilla", label: "Comilla" },
        { value: "chandpur", label: "Chandpur" },
        { value: "brahmanbaria", label: "Brahmanbaria" },
    ],
    rajshahi: [
        { value: "rajshahi", label: "Rajshahi" },
        { value: "chapainawabganj", label: "Chapainawabganj" },
        { value: "natore", label: "Natore" },
        { value: "naogaon", label: "Naogaon" },
        { value: "bogura", label: "Bogura" },
        { value: "joypurhat", label: "Joypurhat" },
        { value: "sirajganj", label: "Sirajganj" },
        { value: "pabna", label: "Pabna" },
    ],
    khulna: [
        { value: "khulna", label: "Khulna" },
        { value: "bagerhat", label: "Bagerhat" },
        { value: "satkhira", label: "Satkhira" },
        { value: "jessore", label: "Jessore (Jashore)" },
        { value: "narail", label: "Narail" },
        { value: "magura", label: "Magura" },
        { value: "jhenaidah", label: "Jhenaidah" },
        { value: "kushtia", label: "Kushtia" },
        { value: "chuadanga", label: "Chuadanga" },
        { value: "meherpur", label: "Meherpur" },
    ],
    barishal: [
        { value: "barishal", label: "Barishal" },
        { value: "bhola", label: "Bhola" },
        { value: "patuakhali", label: "Patuakhali" },
        { value: "barguna", label: "Barguna" },
        { value: "pirojpur", label: "Pirojpur" },
        { value: "jhalokati", label: "Jhalokati" },
    ],
    sylhet: [
        { value: "sylhet", label: "Sylhet" },
        { value: "moulvibazar", label: "Moulvibazar" },
        { value: "habiganj", label: "Habiganj" },
        { value: "sunamganj", label: "Sunamganj" },
    ],
    rangpur: [
        { value: "rangpur", label: "Rangpur" },
        { value: "dinajpur", label: "Dinajpur" },
        { value: "thakurgaon", label: "Thakurgaon" },
        { value: "panchagarh", label: "Panchagarh" },
        { value: "nilphamari", label: "Nilphamari" },
        { value: "lalmonirhat", label: "Lalmonirhat" },
        { value: "kurigram", label: "Kurigram" },
        { value: "gaibandha", label: "Gaibandha" },
    ],
    mymensingh: [
        { value: "mymensingh", label: "Mymensingh" },
        { value: "jamalpur", label: "Jamalpur" },
        { value: "sherpur", label: "Sherpur" },
        { value: "netrokona", label: "Netrokona" },
    ],
};

const DHAKA_CITY_AREAS: BDOption[] = [
    { value: "dhanmondi", label: "Dhanmondi" },
    { value: "mirpur", label: "Mirpur" },
    { value: "uttara", label: "Uttara" },
    { value: "gulshan", label: "Gulshan" },
    { value: "banani", label: "Banani" },
    { value: "mohammadpur", label: "Mohammadpur" },
    { value: "motijheel", label: "Motijheel" },
    { value: "tejgaon", label: "Tejgaon" },
    { value: "khilgaon", label: "Khilgaon" },
    { value: "rampura", label: "Rampura" },
    { value: "badda", label: "Badda" },
    { value: "khilkhet", label: "Khilkhet" },
    { value: "demra", label: "Demra" },
    { value: "jatrabari", label: "Jatrabari" },
    { value: "lalbagh", label: "Lalbagh" },
    { value: "hazaribagh", label: "Hazaribagh" },
    { value: "new_market", label: "New Market" },
    { value: "wari", label: "Wari" },
    { value: "sutrapur", label: "Sutrapur" },
    { value: "kotwali", label: "Kotwali" },
    { value: "pallabi", label: "Pallabi" },
    { value: "kafrul", label: "Kafrul" },
    { value: "cantonment", label: "Cantonment" },
    { value: "savar", label: "Savar" },
    { value: "keraniganj", label: "Keraniganj" },
];

const DISTRICT_UPAZILAS: Record<string, BDOption[]> = {
    gazipur: [
        { value: "gazipur_sadar", label: "Gazipur Sadar" },
        { value: "kaliakair", label: "Kaliakair" },
        { value: "kaliganj", label: "Kaliganj" },
        { value: "kapasia", label: "Kapasia" },
        { value: "sreepur", label: "Sreepur" },
        { value: "tongi", label: "Tongi" },
    ],
    narayanganj: [
        { value: "narayanganj_sadar", label: "Narayanganj Sadar" },
        { value: "araihazar", label: "Araihazar" },
        { value: "bandar", label: "Bandar" },
        { value: "rupganj", label: "Rupganj" },
        { value: "sonargaon", label: "Sonargaon" },
    ],
    chattogram: [
        { value: "chattogram_sadar", label: "Chattogram Sadar" },
        { value: "hathazari", label: "Hathazari" },
        { value: "patiya", label: "Patiya" },
        { value: "anwara", label: "Anwara" },
        { value: "boalkhali", label: "Boalkhali" },
        { value: "chandanaish", label: "Chandanaish" },
        { value: "fatikchhari", label: "Fatikchhari" },
        { value: "lohagara", label: "Lohagara" },
        { value: "mirsharai", label: "Mirsharai" },
        { value: "rangunia", label: "Rangunia" },
        { value: "raozan", label: "Raozan" },
        { value: "sandwip", label: "Sandwip" },
        { value: "satkania", label: "Satkania" },
        { value: "sitakunda", label: "Sitakunda" },
    ],
    sylhet: [
        { value: "sylhet_sadar", label: "Sylhet Sadar" },
        { value: "beanibazar", label: "Beanibazar" },
        { value: "bishwanath", label: "Bishwanath" },
        { value: "companiganj", label: "Companiganj" },
        { value: "fenchuganj", label: "Fenchuganj" },
        { value: "golapganj", label: "Golapganj" },
        { value: "gowainghat", label: "Gowainghat" },
        { value: "jaintapur", label: "Jaintapur" },
        { value: "kanaighat", label: "Kanaighat" },
        { value: "osmaninagar", label: "Osmaninagar" },
        { value: "south_surma", label: "South Surma" },
        { value: "zakiganj", label: "Zakiganj" },
    ],
    rajshahi: [
        { value: "rajshahi_sadar", label: "Rajshahi Sadar" },
        { value: "bagha", label: "Bagha" },
        { value: "bagmara", label: "Bagmara" },
        { value: "charghat", label: "Charghat" },
        { value: "durgapur", label: "Durgapur" },
        { value: "godagari", label: "Godagari" },
        { value: "mohanpur", label: "Mohanpur" },
        { value: "paba", label: "Paba" },
        { value: "puthia", label: "Puthia" },
        { value: "tanore", label: "Tanore" },
    ],
    khulna: [
        { value: "khulna_sadar", label: "Khulna Sadar" },
        { value: "batiaghata", label: "Batiaghata" },
        { value: "dacope", label: "Dacope" },
        { value: "dumuria", label: "Dumuria" },
        { value: "dighalia", label: "Dighalia" },
        { value: "koyra", label: "Koyra" },
        { value: "paikgachha", label: "Paikgachha" },
        { value: "phultala", label: "Phultala" },
        { value: "rupsa", label: "Rupsa" },
        { value: "terokhada", label: "Terokhada" },
    ],
};

export const DHAKA_DISTRICTS = ["dhaka"];

export const getDistrictsForDivision = (division: string) =>
    BD_DISTRICTS[division] ?? [];

export const getDivisionForDistrict = (district: string) => {
    const normalizedDistrict = district.trim().toLowerCase();
    return (
        Object.entries(BD_DISTRICTS).find(([, districts]) =>
            districts.some((item) => item.value === normalizedDistrict),
        )?.[0] ?? ""
    );
};

export const isDistrictInDivision = (division: string, district: string) =>
    getDivisionForDistrict(district) === division;

export function isDhakaDistrict(district: string): boolean {
    return DHAKA_DISTRICTS.includes(district);
}

function toTitleLabel(value: string) {
    return value
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export const getAreasForDistrict = (district: string) => {
    if (district === "dhaka") return DHAKA_CITY_AREAS;
    if (DISTRICT_UPAZILAS[district]) return DISTRICT_UPAZILAS[district];
    if (!district) return [];

    const label = toTitleLabel(district);
    return [{ value: `${district}_sadar`, label: `${label} Sadar` }];
};
