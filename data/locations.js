/**
 * GALLERY DATA
 * ============
 * To add a new location:
 *   1. Create a folder under /locations/<your-location-id>/
 *   2. Add photos to that folder
 *   3. Copy a location block below and fill in the details
 *
 * To add photos to an existing location:
 *   - Add an object to the location's "photos" array
 *   - "filename" must match the actual file name in the /locations/<id>/ folder
 *
 * Coordinates: [latitude, longitude] — use decimal degrees (e.g. from Google Maps)
 */

const GALLERY_DATA = {

  meta: {
    title: "Field Notes",
    subtitle: "Photographs from the field"
  },

  locations: [

    {
      id: "pongso-no-tao",
      name: "Pongso No Tao",
      localName: "蘭嶼",
      subtitle: "Orchid Island · 22°N 121°E",
      coordinates: [22.0457, 121.5487],
      date: "2025",
      tags: ["island", "Indigenous", "ocean"],
      description: "Pongso No Tao — \"the island of the human people\" in the Tao language — lies 90 kilometres off the southeastern coast of Taiwan. This volcanic island is home to the Tao people, one of Taiwan's Indigenous groups, whose culture has been shaped entirely by the sea.",
      story: "The Tao follow a ritual calendar centered on the flying fish season, from March to June. During this time, ocean currents drive schools of flying fish to the island's waters. These fish are not just food; they carry spiritual significance. Each species has its own set of taboos, and the preparation and consumption of flying fish follow generations-old rules.\n\nAcross the sea, south of the main island, lies the “malavang a pongso,” or White Island in Tao cosmology. Each person has seven spirits. Upon death, the anito, the deceased's spirit, returns home to retrieve belongings before journeying to this sacred island, where ghost spirits find eternal rest. Other spirits quietly retreat into the grass, ensuring peace and balance.",
      photos: [
        {
          filename: "pnt-001-dark-room.jpg",
          caption: "View from the room.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-002-blue-lagoon.jpg",
          caption: "Blue Lagoon.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-003-donib.png",
          caption: "Double exposure.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-004-jimalacip.jpg",
          caption: "Strange rocks.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-005-jimaramay.png",
          caption: "Looking over the harbour and the shipwreck.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-006-looking-over-ilino.jpg",
          caption: "View across the shore.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-007-shipwreck.jpg",
          caption: "Shipwreck from the typhoon.",
          alt: "",
          date: "2025.April"
        },
        {
          filename: "pnt-008-stretching-over.png",
          caption: "Stretching over.",
          alt: "",
          date: "2025.April"
        },
      ]
    },

    {
      id: "pingtung",
      name: "Pingtung",
      localName: "屏東",
      subtitle: "Wutai Township · 22°N 120°E",
      coordinates: [22.7417, 120.7322],
      date: "2024",
      tags: ["mountain", "Indigenous", "Rukai"],
      description: "Wutai, a mountain township in Taiwan, was home to the Rukai, an aboriginal community. The Rukai are famous for their legend: it's said that the moon stopped by and settled on the spot where their original community was built, which is why the location is also known as the “tribe of the moon.”",
      story: "",
      photos: [
        // Add photos here when ready. Example:
        // {
        //   filename: "kenting-reef.jpg",
        //   caption: "The reef shelf at low tide near Kenting.",
        //   date: "2024.May"
        // }
      ]
    },

    {
      id: "taitung",
      name: "Taitung",
      localName: "台東",
      subtitle: "Eastern Taiwan · 22°N 121°E",
      coordinates: [22.7583, 121.1444],
      date: "2024-2025",
      tags: ["coast", "valley", "rift valley"],
      description: "Taitung sits along Taiwan's eastern seaboard, sheltered from the west by the Central Range and open to the Pacific on the east. The Taitung-Hualien Rift Valley runs through the county, its floor flat and green between walls of sheer mountain.",
      story: "Taitung, with its mountains and plains, has a rich cultural history dating back 3000 years to the Neolithic period. The Beinan Archaeological Site, discovered during railway construction in the 1980s, revealed a sophisticated Neolithic culture with slate coffins, jade ornaments, and evidence of long-distance trade networks to the Philippines and beyond.\n\nIn addition to the diverse prehistoric culture, the contemporary Indigenous groups residing on the Taitung plain also provide insights into the lineage of Austronesian people and their interactions both within the island and across the Pacific Ocean.\n\nThe landscape narrates the present and past. Its location and name reveal years of cultural growth. This series of photos attempts to visualise time in images.",
      photos: [
        {
          filename: "dong-001-peinan-archaeological-site.jpg",
          caption: "Peinan Archaeological Site.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-002-peinan-cultural-remains.jpg",
          caption: "Peinan cultural remains.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-003-the-reflection.jpg",
          caption: "The reflection.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-004-jinglun-hot-spring.jpg",
          caption: "Jinglun Hot Spring.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-005-dazhukao-river.jpg",
          caption: "Dazhukao River.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-006-cross-road.png",
          caption: "Cross road.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-007-piaski.png",
          caption: "Piaski.",
          alt: "",
          date: "2024-2025"
        },
        {
          filename: "dong-008-real-estate.png",
          caption: "Real estate.",
          alt: "",
          date: "2024-2025"
        },
      ]
    }

  ]

};
