const sourceMapping = [
    { 
        code_source: 16, 
        source: "Techno Draria", 
        magentoSource: "TechnoStationeryDraria",
        succursale: 16
    },
    { 
        code_source: 11, 
        source: "Techno Hydra", 
        magentoSource: "TechnoStationeryHydra",
        succursale: 16
    },
    { 
        code_source: 20, 
        source: "Techno Constantine", 
        magentoSource: "TechnoStationeryConstantine",
        succursale: 25
    },
    { 
        code_source: 3, 
        source: "Techno Oran", 
        magentoSource: "TechnoStationeryOran",
        succursale: 31
    },
    { 
        code_source: 8, 
        source: "Techno Setif", 
        magentoSource: "TechnoStationerySetif",
        succursale: 25
    },
    { 
        code_source: 21, 
        source: "Techno Djelfa", 
        magentoSource: "TechnoStationeryDjelfa",
        succursale: 47
    },
    { 
        code_source: 25, 
        source: "Techno Annaba", 
        magentoSource: "TechnoStationeryAnnaba",
        succursale: 25
    },
    { 
        code_source: 23, 
        source: "Techno Sidi Bel Abbes", 
        magentoSource: "TechnoStationerySidiBelabes",
        succursale: 31
    },
    { 
        code_source: 22, 
        source: "Techno Batna", 
        magentoSource: "TechnoStationeryBatna",
        succursale: 25
    },
    { 
        code_source: 26, 
        source: "Techno Bejaia", 
        magentoSource: "TechnoStationeryBéjaia",
        succursale: 25
    },
    { 
        code_source: 27, 
        source: "Techno Bir El Djir", 
        magentoSource: "TechnoStationeryBirElDjir",
        succursale: 31
    },
    { 
        code_source: 28, 
        source: "Techno Blida", 
        magentoSource: "TechnoStationeryBlida",
        succursale: 16
    },
    { 
        code_source: 29, 
        source: "Techno Bordj Bou Arreridj", 
        magentoSource: "TechnoStationeryBordjBouArreridj",
        succursale: 25
    },
    { 
        code_source: 30, 
        source: "Techno Boumerdes", 
        magentoSource: "TechnoStationeryBoumerdes",
        succursale: 16
    },
    { 
        code_source: 31, 
        source: "Techno Cheraga", 
        magentoSource: "TechnoStationeryCheraga",
        succursale: 16
    },
    { 
        code_source: 32, 
        source: "Techno Dely Ibrahim", 
        magentoSource: "TechnoStationeryDelyIbrahim",
        succursale: 16
    },
    { 
        code_source: 33, 
        source: "Techno Ghardaia", 
        magentoSource: "TechnoStationeryGhardaia",
        succursale: 47
    },
    { 
        code_source: 34, 
        source: "Techno Laghouat", 
        magentoSource: "TechnoStationeryLaghouat",
        succursale: 47
    },
    { 
        code_source: 35, 
        source: "Techno Mostaganem", 
        magentoSource: "TechnoStationeryMostaganem",
        succursale: 31
    },
    { 
        code_source: 36, 
        source: "Techno Ouargla", 
        magentoSource: "TechnoStationeryOuargla",
        succursale: 47
    },
    { 
        code_source: 37, 
        source: "Techno Ouled Fayet", 
        magentoSource: "TechnoStationeryOuledFayet",
        succursale: 16
    },
    { 
        code_source: 38, 
        source: "Techno Pins Maritimes", 
        magentoSource: "TechnoStationeryPinsMaritimes",
        succursale: 16
    },
    { 
        code_source: 39, 
        source: "Techno Rouiba", 
        magentoSource: "TechnoStationeryRouiba",
        succursale: 16
    },
    { 
        code_source: 40, 
        source: "Techno Tiaret", 
        magentoSource: "TechnoStationeryTiaret",
        succursale: 31
    },
    { 
        code_source: 41, 
        source: "Techno Ain Benian", 
        magentoSource: "TechnoStationeryAinBenian",
        succursale: 16
    }
];

export const getSourceInfo = (code) => {
    return sourceMapping.find(item => item.code_source === code || item.succursale === code);
};

export const getAllSources = () => sourceMapping;

export default sourceMapping;