const convert = {
    // Engineering Half
    // MAAE Dept. 
    ae: "Aerospace Engineering", bmm: "Biomedical Mech",
    me: "Mechanical Engineering", sree: "SREE",
    // SCE Dept.
    bme: "Biomedical and Electrical Engineering", come: "Communications Engineering",
    cse: "Computer Systems Engineering", se: "Software Engineering",
    // CIVE Dept.
    arch: "Architecture/Arch Engineering",
    ce: "Civil Engineering", enve: "Environmental Engineering",
    // ELEC Dept.
    ee: "Electrical Engineering", ep: "Engineering Physics",
    // Design Half
    id: "Industrial Design",
    irm: "IRM", imd: "IMD", mpd: "MPD", oss: "OSS", net: "NET",
    // Non Eng / Design
    bsp: "Business, Social, Political", al: "Arts, Languages",
    cs: "Computer Science", math: "Math", science: "Science",
    // Year Standing
    first: "[First Year Standing]", second: "[Second Year Standing]",
    third: "[Third Year Standing]", fourth: "[Fourth Year Standing]",
    // Pronouns
    hh: "he/him", ss: "she/her", tt: "they/them",
    // Singletons (Misc.)
    maker: "Maker Club",
}

export const aliasProgramMap = new Map(Object.entries(convert));