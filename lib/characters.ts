
export type CharacterRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary";

export type BibleCharacter = {
  id: string;
  name: string;
  title: string;
  rarity: CharacterRarity;
  price: number;
  initials: string;
  color: string;
  description: string;
};

export const CHARACTERS: BibleCharacter[] = [
  {
    id: "disciple",
    name: "Disciple",
    title: "Follower of Christ",
    rarity: "Common",
    price: 0,
    initials: "D",
    color: "#a4b6ca",
    description: "A humble follower beginning the journey.",
  },
  {
    id: "peter",
    name: "Simon Peter",
    title: "The Apostle",
    rarity: "Uncommon",
    price: 250,
    initials: "SP",
    color: "#51dba0",
    description: "One of Jesus' twelve apostles.",
  },
  {
    id: "paul",
    name: "Apostle Paul",
    title: "The Missionary",
    rarity: "Rare",
    price: 500,
    initials: "AP",
    color: "#39a9ff",
    description: "A missionary who carried the gospel across nations.",
  },
  {
    id: "john",
    name: "John",
    title: "The Beloved Disciple",
    rarity: "Rare",
    price: 750,
    initials: "J",
    color: "#7c9cff",
    description: "An apostle and writer of Scripture.",
  },
  {
    id: "mary",
    name: "Mary Magdalene",
    title: "Witness to the Resurrection",
    rarity: "Epic",
    price: 1000,
    initials: "MM",
    color: "#c084fc",
    description: "A faithful follower and witness of the risen Christ.",
  },
  {
    id: "moses",
    name: "Moses",
    title: "The Deliverer",
    rarity: "Epic",
    price: 1500,
    initials: "M",
    color: "#e8bd64",
    description: "Led Israel out of Egypt.",
  },
  {
    id: "david",
    name: "David",
    title: "King of Israel",
    rarity: "Epic",
    price: 1500,
    initials: "D",
    color: "#e8bd64",
    description: "The shepherd who became king.",
  },
  {
    id: "elijah",
    name: "Elijah",
    title: "The Prophet",
    rarity: "Legendary",
    price: 2500,
    initials: "E",
    color: "#ff9256",
    description: "A prophet who boldly proclaimed God's word.",
  },
  {
    id: "daniel",
    name: "Daniel",
    title: "The Faithful",
    rarity: "Legendary",
    price: 2500,
    initials: "D",
    color: "#ff9256",
    description: "Remained faithful to God in Babylon.",
  },
  {
    id: "esther",
    name: "Esther",
    title: "The Queen",
    rarity: "Legendary",
    price: 2500,
    initials: "E",
    color: "#ff9256",
    description: "Risked her position to protect her people.",
  },
];
