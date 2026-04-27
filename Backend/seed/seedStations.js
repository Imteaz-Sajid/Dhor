/**
 * Seed script — Bangladesh Police Stations
 * Run once: node Backend/seed/seedStations.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose      = require('mongoose');
const PoliceStation = require('../models/PoliceStation');

const rawNames = [
  'Dhaka','Dhamrai','Dhanmondi','Gulshan','Jatrabari','Joypara','Keraniganj',
  'Khilgaon','Khilkhet','Lalbag','Mirpur','Mohammadpur','Motijheel','Nawabganj',
  'Kalabagan','Palton','Ramna','Sabujbag','Savar','Sutrapur','Tejgaon',
  'Tejgaon Industrial Area','Uttara','Alfadanga','Bhanga','Boalmari','Charbhadrasan',
  'Faridpur Sadar','Madukhali','Nagarkanda','Sadarpur','Shriangan','Gazipur Sadar',
  'Kaliakaar','Kaliganj','Kapashia','Monnunagar','Turag','Sreepur','Sripur',
  'Gopalganj Sadar','Kashiani','Kotalipara','Maksudpur','Muksudpur','Tungipara',
  'Bajitpur','Kuliarchar','Bhairob','Hossenpur','Itna','Karimganj','Katiadi',
  'Kishoreganj Sadar','Mithamoin','Nikli','Ostagram','Pakundia','Tarial',
  'Barhamganj','Kalkini','Madaripur Sadar','Rajoir','Doulatpur','Ghior',
  'Lechhraganj','Manikganj Sadar','Saturia','Shibloya','Singari','Gajaria',
  'Lohajong','Munshiganj Sadar','Sirajdikhan','Sreenagar','Tangibari','Araihazar',
  'Sonargaon','Baidder Bazar','Bandar','Fatullah','Narayanganj Sadar','Rupganj',
  'Siddirganj','Belabo','Monohordi','Narsingdi Sadar','Madhabdi','Palash',
  'Raypura','Shibpur','Baliakandi','Pangsha','Rajbari Sadar','Bhedorganj',
  'Damudhya','Gosairhat','Jajira','Naria','Shariatpur Sadar','Basail','Bhuapur',
  'Delduar','Ghatail','Gopalpur','Kalihati','Kashkaolia','Madhupur','Mirzapur',
  'Nagarpur','Sakhipur','Tangail Sadar','Bakshiganj','Dewangonj','Islampur',
  'Jamalpur','Melandah','Madarganj','Sharishabari','Bhaluka','Fulbaria',
  'Gaforgaon','Gouripur','Haluaghat','Isshwargonj','Muktagachha','Mymensingh Sadar',
  'Nandail','Phulpur','Trishal','Susung Durgapur','Atpara','Barhatta',
  'Dharmapasha','Dhobaura','Kalmakanda','Kendua','Khaliajuri','Madan',
  'Moddhynagar','Mohanganj','Netrakona Sadar','Purbadhola','Bakshigonj',
  'Jhinaigati','Nakla','Nalitabari','Sherpur Shadar','Shribardi','Azmireeganj',
  'Bahubal','Baniachang','Chunarughat','Habiganj Sadar','Kalauk','Madhabpur',
  'Nabiganj','Baralekha','Kamalganj','Kulaura','Moulvibazar Sadar','Rajnagar',
  'Srimangal','Bishamsarpur','Chhatak','Dhirai Chandpur','Duara Bazar',
  'Ghungiar','Jagnnathpur','Sachna','Sunamganj Sadar','Tahirpur','Balaganj',
  'Bianibazar','Bishwanath','Fenchuganj','Goainghat','Golapganj','Jaintapur',
  'Jakiganj','Kanaighat','Kompanyganj','Sylhet Sadar','Sonagazi','Alikadam',
  'Bandarban Sadar','Naikhong','Roanchhari','Ruma','Thanchi','Akhaura',
  'Banchharampur','Brahamanbaria Sadar','Kasba','Nabinagar','Nasirnagar',
  'Sarail','Chandpur Sadar','Faridganj','Hajiganj','Hayemchar','Kachua',
  'Matlobganj','Shahrasti','Anawara','Boalkhali','Chattogram Sadar','East Joara',
  'Fatikchhari','Hathazari','Jaldi','Lohagara','Mirsharai','Patiya','Rangunia',
  'Raozan','Rouzan','Sandwip','Satkania','Sitakunda','Barura','Brahmanpara',
  'Burichang','Chandina','Chouddagram','Comilla Sadar','Daudkandi','Davidhar',
  'Homna','Laksam','Langalkot','Muradnagar','Chiringga','Coxs Bazar Sadar',
  'Gorakghat','Kutubdia','Ramu','Teknaf','Ukhia','Chhagalnaia','Dagonbhuia',
  'Feni Sadar','Pashurampur','Diginala','Khagrachari Sadar','Laxmichhari',
  'Mahalchhari','Manikchhari','Matiranga','Panchhari','Ramghar Head Office',
  'Char Alexgander','Lakshimpur Sadar','Ramganj','Raypur','Basurhat',
  'Begumganj','Chatkhil','Hatiya','Noakhali Sadar','Senbag','Barakal',
  'Bilaichhari','Jarachhari','Kalampati','Kaptai','Longachh','Marishya',
  'Naniachhar','Rajsthali','Rangamati Sadar','Bangla Hili','Biral','Mohakhali',
  'Birganj','Chirirbandar','Dinajpur Sadar','Khansama','Maharajganj','Nawabganj',
  'Ghoraghat','Parbatipur','Phulbari','Setabganj','Bonarpara','Gaibandha Sadar',
  'Gobindaganj','Palashbari','Phulchhari','Saadullapur','Sundarganj',
  'Bhurungamari','Chilmari','Kurigram Sadar','Nageshwar','Rajarhat','Rajibpur',
  'Roumari','Ulipur','Aditmari','Hatibandha','Lalmonirhat Sadar','Patgram',
  'Tushbhandar','Dimla','Domar','Jaldhaka','Kishoriganj','Nilphamari Sadar',
  'Saidpur','Boda','Chotto Dab','Dabiganj','Panchagra Sadar','Tetulia','Taraganj',
  'Badarganj','Gangachara','Kaunia','Pirgachha','Mithapukur','Pirgonj',
  'Rangpur Sadar','Baliadangi','Jibanpur','Pirganj','Rani Sankail',
  'Thakurgaon Sadar','Adamdighi','Bogura Sadar','Dhunat','Dupchanchia',
  'Dupchachia','Gabtoli','Kahalu','Nandigram','Sariakandi','Sherpur','Shibganj',
  'Sonatola','Bholahat','Chapai Nawabganj Sadar','Nachol','Rohanpur',
  'Shibganj U.P.O','Akkelpur','Joypurhat Sadar','Kalai','Khetlal','Panchbibi',
  'Ahsanganj','Badalgachhi','Dhamuirhat','Mahadebpur','Naogaon Sadar',
  'Niamatpur','Nitpur','Patnitala','Prasadpur','Raninagar','Sapahar',
  'Gopalpur UPO','Harua','Hatgurudaspur','Laxman','Natore Sadar','Singra',
  'Banwarinagar','Bera','Bhangura','Chatmohar','Atghoria','Ishwardi',
  'Pabna Sadar','Sathia','Sujanagar','Bagha','Bagmara','Charghat','Durgapur',
  'Godagari','Khod Mohanpur','Lalitganj','Putia','Rajshahi Sadar','Tanor',
  'Baiddya Jam Toil','Belkuchi','Dhangora','Kazipur','Shahjadpur',
  'Sirajganj Sadar','Tarash','Ullapara','Amtali','Bamna','Barguna Sadar',
  'Betagi','Patharghata','Agailzhara','Banaripara','Babuganj','Barajalia',
  'Barishal Sadar','Gouranadi','Mahendiganj','Muladi','Bakerganj','Uzirpur',
  'Bhola Sadar','Borhanuddin UPO','Charfashion','Doulatkhan','Hajirhat',
  'Hatshoshiganj','Lalmohan UPO','Jhalokati Sadar','Kathalia','Nalchhiti',
  'Rajapur','Bauphal','Dashmina','Galachipa','Khepupara','Patuakhali Sadar',
  'Subidkhali','Bhandaria','Kaukhali','Mathbaria','Nazirpur','Pirojpur Sadar',
  'Swarupkathi','Bagerhat Sadar','Chalna Ankorage','Chitalmari','Fakirhat',
  'Kachua UPO','Mollahat','Morelganj','Rampal','Rayenda','Alamdanga',
  'Chuadanga Sadar','Damurhuda','Doulatganj','Bagharpara','Chaugachha',
  'Jashore Sadar','Jhikargachha','Keshabpur','Monirampur','Noapara','Sarsa',
  'Harinakundu','Jhenaidah Sadar','Kotchandpur','Maheshpur','Naldanga',
  'Shailakupa','Alaipur','Batiaghat','Chalna Bazar','Digalia','Khulna Sadar',
  'Koyra','Paikgachha','Phultala','Sajiara','Terakhada','Bheramara','Janipur',
  'Kumarkhali','Kushtia Sadar','Mirpur','Rafayetpur','Arpara','Magura Sadar',
  'Mohammadpur','Shripur','Gangni','Meherpur Sadar','Kalia','Laxmipasha',
  'Mohajan','Narail Sadar','Ashashuni','Debbhata','Kalaroa','Kaliganj UPO',
  'Nakipur','Satkhira Sadar','Taala',
];

const stationDocs = rawNames.map((n) => ({
  name: `${n} Police Station`,
  contactNumber: '01XXXXXXXXX',
  email: 'abc@gmail.com',
}));

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'dhor' });
    console.log('Connected to MongoDB (dhor)');

    const existing = await PoliceStation.countDocuments();
    if (existing > 0) {
      console.log(`Skipping seed — ${existing} stations already exist.`);
      process.exit(0);
    }

    try {
      const result = await PoliceStation.insertMany(stationDocs, { ordered: false });
      console.log(`Seeded ${result.length} police stations successfully.`);
    } catch (bulkErr) {
      // ordered:false lets MongoDB insert all non-duplicate docs even when some fail
      if (bulkErr.name === 'MongoBulkWriteError' || bulkErr.code === 11000) {
        const inserted = bulkErr.result?.nInserted ?? 'partial';
        console.log(`Seeded with ${inserted} stations inserted (duplicate names were skipped).`);
      } else {
        throw bulkErr;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
