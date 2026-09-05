# Ujjain project zones: evidence and limits for crime-data allocation

**Purpose.** This note records what the project’s six named zones represent and what can (and cannot) be claimed when dividing the supplied Ujjain crime spreadsheet among them. Research completed 5 September 2026.

## Project zones and evidence

The application seeds these six zones in [`Backend/models/seed.js`](../../Backend/models/seed.js). Its admin dashboard assigns planning capacities of 100, 50, 40, 80, 30, and 60 respectively in [`Frontend/src/pages/AdminPage.jsx`](../../Frontend/src/pages/AdminPage.jsx). Those figures are project settings, not official crime or population data.

| Project zone | ID | Direct official evidence |
|---|---:|---|
| Mahakaleshwar Mandir | 1 | The district administration identifies Mahakaleshwar as a principal Ujjain sacred site. [Places of interest](https://ujjain.nic.in/en/places-of-interest/) |
| Ram Ghat | 2 | The district describes Ramghat as the Simhastha royal-bathing site on the Shipra/Kshipra. [Culture and heritage](https://ujjain.nic.in/en/culture-heritage/) |
| Kshipra Bridge | 3 | A project-defined crossing/landmark zone; no official source located defines a police or municipal boundary of this name. The Kshipra corridor is documented in the [MPPCB river report](https://www.mppcb.mp.gov.in/proc/NGT%20Kshripa-River.pdf). |
| Harsiddhi Mandir | 4 | The district administration lists it as an Ujjain sacred site. [Harsiddhi page](https://ujjain.nic.in/en/tourist-place/harsiddhi/) |
| Bada Ganesh Mandir | 5 | The district says Bade Ganesh is near Mahakaleshwar. [Places of interest](https://ujjain.nic.in/en/places-of-interest/) |
| Kal Bhairav Mandir | 6 | District sources place it on the Shipra bank, outside the compact city/temple core. [Places of interest](https://ujjain.nic.in/en/places-of-interest/) |

An official district event notice says the annual Mahakal Sawari draws lakhs of devotees, travels from Mahakal to Ram Ghat for Shipra rituals, then returns via Gopal Mandir. This supports treating the Mahakal–Ram Ghat–Kshipra corridor as comparatively high **exposure** for a planning model, not as high measured crime. [District event notice](https://ujjain.nic.in/event/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%B5%E0%A4%A3-%E0%A4%AD%E0%A4%BE%E0%A4%A6%E0%A5%8B%E0%A4%82-%E0%A4%AE%E0%A4%BE%E0%A4%B8-%E0%A4%AD%E0%A4%97%E0%A4%B5%E0%A4%BE%E0%A4%A8-%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A5%80-%E0%A4%AE%E0%A4%B9%E0%A4%BE/).

## Administrative and policing context

Ujjain is an urban municipal corporation, not an official six-zone administrative partition. [Urban Local Bodies listing](https://ujjain.nic.in/en/urban-local-bodies/). The official police listing separately names urban stations including Mahakal, Kotwali, Kharakua, Jiwajigunj, and Chintaman. [District Police listing](https://ujjain.nic.in/en/police/). It does **not** publish station/beat boundary polygons, a landmark-to-station crosswalk, or station-level crime totals. It is therefore unsupported to state that a project zone belongs to a particular police jurisdiction.

Do not conflate the app’s six temple microzones with Ujjain Municipal Corporation (UMC) zones. A UMC-commissioned WAPCOS report describes a historical five-zone municipal arrangement and 54 wards, while a newer UMC tender refers to Zones 1–6 but exposes only selected ward/zone references rather than a complete crosswalk. [UMC WAPCOS report (2017)](https://nagarnigamujjain.org/tender_swrg/VoL%20I%20Report%20%26%20Costing/0%20-Ujjain%20UGSS%20-Volume-I%28Report%20%26%20Costings%29-010317.pdf), [UMC tender document](https://nagarnigamujjain.org/hindi/gad/18.pdf). Neither document maps any of the six temple zones to a UMC zone.

The district links the [Ujjain GIS portal](https://ujjain.nic.in/en/ujjain-gis/) for roads, land use, and government assets. This is the appropriate authoritative reference to validate fixed zone polygons before a production spatial join, subject to access and data availability.

## Consequence for the supplied workbook

The source used for `outputs/ujjain_crime_counts.csv` reports Ujjain **district** totals by crime category. It has no FIR location, police-station/beat, ward, coordinates, denominator, or time-period field that maps incidents to the six landmarks. The official sources above provide no such zone totals either.

Any new six-zone CSV must therefore be labelled a **modelled exposure-weighted allocation**, not observed zone crime/rate. The project capacities (100, 50, 40, 80, 30, 60) can be used as transparent model weights: preserve every category’s district total using largest-remainder rounding; include `allocation_method`, `is_estimate=true`, `source_geography=Ujjain district`, and the actual weight used. The output must not be described as reported crime by zone.

For measured rates, obtain privacy-controlled incident locations or police-station/beat totals for the same period, spatially join to versioned zone polygons, and divide by a stated denominator (resident population, footfall, or visitor-hours).
