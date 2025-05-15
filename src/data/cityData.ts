export interface CityData {
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  img1: string;
  img2: string;
  img3: string;
  img4: string;
}

export const cities: { [key: string]: CityData } = {
  Stuttgart: {
    text1:
      "Stuttgart ist die Landeshauptstadt von Baden-Württemberg und mit rund 630.000 Einwohnern dessen größte Stadt. Sie ist das Zentrum der Region Stuttgart mit etwa 2,8 Millionen Menschen – einem der größten Ballungsräume Deutschlands.",
    text2:
      "Die Stadt ist Sitz der Landesregierung, des Landtags und zahlreicher Behörden und bildet somit das politische Zentrum des Bundeslandes Baden-Württemberg.",
    text3:
      "Stuttgart ist ein bedeutender Wirtschaftsstandort und Finanzplatz. International bekannt ist die Stadt als Heimat der Automobilkonzerne Mercedes-Benz Group und Porsche.",
    text4:
      "Das Stadtbild ist geprägt von Anhöhen, Tälern wie dem Talkessel und Neckartal, Weinbergen, Parks wie dem Schlossgarten und Rosensteinpark sowie einer urbanen Bebauung mit Nachkriegsarchitektur, Baudenkmälern und Hochhäusern",
    img1: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//stuttgart_1.png",
    img2: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//stuttgart_2.png",
    img3: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//stuttgart_3.png",
    img4: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//stuttgart_1.png", // Using first image as placeholder for the 4th
  },
  Memmingen: {
    text1:
      "Memmingen ist eine kreisfreie Stadt im bayerischen Schwaben mit rund 45.000 Einwohnern. Sie liegt am Rand des Allgäus und bildet gemeinsam mit dem Landkreis Unterallgäu ein wichtiges wirtschaftliches und kulturelles Zentrum.",
    text2:
      "Die Stadt hat Bedeutung als Verwaltungs-, Schul- und Gesundheitsstandort und ist Teil der Metropolregion München. Durch ihre Lage an mehreren Autobahnen und mit eigenem Flughafen ist sie verkehrstechnisch gut angebunden.",
    text3:
      "Memmingen verfügt über eine vielfältige Wirtschaftsstruktur mit Schwerpunkten in Maschinenbau, Logistik und Dienstleistungen. Mehrere mittelständische Unternehmen haben hier ihren Sitz.",
    text4:
      "Das historische Stadtbild mit gut erhaltener Altstadt, Stadttoren, Fachwerkhäusern und Plätzen verleiht Memmingen seinen besonderen Charme. Zahlreiche Feste und Märkte prägen das kulturelle Leben.",
    img1: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//memmingen_1.png",
    img2: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//memmingen_2.png",
    img3: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//memmingen_3.png",
    img4: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//memmingen_1.png", // Using first image as placeholder for the 4th
  },
  Ulm: {
    text1:
      "Ulm liegt im Osten Baden-Württembergs an der Donau und hat rund 127.000 Einwohner. Gemeinsam mit der bayerischen Nachbarstadt Neu-Ulm bildet Ulm ein grenzübergreifendes Doppelzentrum mit insgesamt etwa 180.000 Menschen.",
    text2:
      "Die Stadt ist Sitz mehrerer Gerichte, Behörden sowie einer Universität und Hochschule. Sie gilt als Oberzentrum der Region Donau-Iller und ist ein bedeutender Standort für Wissenschaft, Forschung und Verwaltung.",
    text3:
      "Wirtschaftlich ist Ulm geprägt durch eine starke Industrie, unter anderem in den Bereichen Maschinenbau, Pharmazie und Elektronik. Unternehmen wie die Wieland-Werke oder die Daimler AG betreiben hier wichtige Standorte.",
    text4:
      "Das Stadtbild ist bekannt für das imposante gotische Ulmer Münster mit dem höchsten Kirchturm der Welt. Daneben prägen Fachwerkhäuser, moderne Architektur, die Donauauen sowie das historische Fischerviertel das Stadtbild.",
    img1: "https://okjlnskrrksyzjpziyph.supabase.co/storage/v1/object/public/cityimages//ulm_1.jpg",
    img2: "https://okjlnskrrksyzjpziyph.supabase.co/storage/v1/object/public/cityimages//ulm_2.jpg",
    img3: "https://okjlnskrrksyzjpziyph.supabase.co/storage/v1/object/public/cityimages//ulm_3.jpg",
    img4: "https://okjlnskrrksyzjpziyph.supabase.co/storage/v1/object/public/cityimages//ulm_4.jpg",
  },
  Tübingen: {
    text1:
      "Tübingen ist eine Universitätsstadt im Zentrum Baden-Württembergs mit rund 92.000 Einwohnern. Sie liegt am Neckar und zählt zu den jüngsten Städten Deutschlands – bedingt durch ihren hohen Studierendenanteil.",
    text2:
      "Tübingen ist Sitz der Eberhard Karls Universität, einer der ältesten und renommiertesten Universitäten Europas, sowie zahlreicher Forschungsinstitute und Kliniken. Die Stadt ist ein bedeutender Wissenschaftsstandort.",
    text3:
      "Die Wirtschaft ist geprägt durch Bildung, Forschung, Medizintechnik und Dienstleistungen. Viele Start-ups und innovative Unternehmen sind eng mit der Universität verknüpft.",
    text4:
      "Das Stadtbild ist von der historischen Altstadt, dem Schloss Hohentübingen, dem Neckarufer und zahlreichen Grünflächen geprägt. Die Mischung aus Tradition, studentischem Leben und Natur macht den Reiz der Stadt aus.",
    img1: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//tubingen_1.png",
    img2: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//tubingen_2.png",
    img3: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//tubingen_3.png",
    img4: "https://lqovxodfeijwstxiohoa.supabase.co/storage/v1/object/public/city//tubingen_1.png", // Using first image as placeholder for the 4th
  },
};

export const cityNames = Object.keys(cities); // ["Stuttgart", "Memmingen", "Ulm", "Tübingen"]
