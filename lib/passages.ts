
export type BiblePassage = {
  id: string;
  reference: string;
  text: string;
};

export const PASSAGES: BiblePassage[] = [
  // OLD TESTAMENT
  { id: "genesis-1-1", reference: "GENESIS 1:1", text: "In the beginning, God created the heavens and the earth." },
  { id: "genesis-1-27", reference: "GENESIS 1:27", text: "God created man in his own image. In God's image he created him; male and female he created them." },
  { id: "genesis-12-2", reference: "GENESIS 12:2", text: "I will make of you a great nation. I will bless you and make your name great. You will be a blessing." },
  { id: "genesis-15-6", reference: "GENESIS 15:6", text: "He believed in Yahweh, who credited it to him for righteousness." },
  { id: "genesis-50-20", reference: "GENESIS 50:20", text: "As for you, you meant evil against me, but God meant it for good." },
  { id: "exodus-15-2", reference: "EXODUS 15:2", text: "Yah is my strength and song. He has become my salvation." },
  { id: "exodus-20-3", reference: "EXODUS 20:3", text: "You shall have no other gods before me." },
  { id: "exodus-34-6", reference: "EXODUS 34:6", text: "Yahweh passed by before him, and proclaimed, Yahweh! Yahweh, a merciful and gracious God, slow to anger, and abundant in loving kindness and truth." },
  { id: "leviticus-19-18", reference: "LEVITICUS 19:18", text: "You shall love your neighbor as yourself. I am Yahweh." },
  { id: "numbers-6-24", reference: "NUMBERS 6:24", text: "Yahweh bless you, and keep you." },
  { id: "numbers-23-19", reference: "NUMBERS 23:19", text: "God is not a man, that he should lie, nor a son of man, that he should repent." },
  { id: "deuteronomy-6-5", reference: "DEUTERONOMY 6:5", text: "You shall love Yahweh your God with all your heart, with all your soul, and with all your might." },
  { id: "deuteronomy-7-9", reference: "DEUTERONOMY 7:9", text: "Know therefore that Yahweh your God, he is God, the faithful God, who keeps covenant and loving kindness." },
  { id: "deuteronomy-31-6", reference: "DEUTERONOMY 31:6", text: "Be strong and courageous. Don't be afraid or scared of them, for Yahweh your God himself is who goes with you." },
  { id: "joshua-1-8", reference: "JOSHUA 1:8", text: "This book of the law shall not depart from your mouth, but you shall meditate on it day and night." },
  { id: "joshua-1-9", reference: "JOSHUA 1:9", text: "Haven't I commanded you? Be strong and courageous. Don't be afraid. Don't be discouraged, for Yahweh your God is with you wherever you go." },
  { id: "1-samuel-16-7", reference: "1 SAMUEL 16:7", text: "For man looks at the outward appearance, but Yahweh looks at the heart." },
  { id: "1-chronicles-16-11", reference: "1 CHRONICLES 16:11", text: "Seek Yahweh and his strength. Seek his face forever more." },
  { id: "1-chronicles-16-34", reference: "1 CHRONICLES 16:34", text: "Oh give thanks to Yahweh, for he is good, for his loving kindness endures forever." },
  { id: "2-chronicles-7-14", reference: "2 CHRONICLES 7:14", text: "If my people, who are called by my name, shall humble themselves, and pray, and seek my face, and turn from their wicked ways, then I will hear from heaven." },
  { id: "job-19-25", reference: "JOB 19:25", text: "But as for me, I know that my Redeemer lives. In the end, he will stand upon the earth." },
  { id: "job-42-2", reference: "JOB 42:2", text: "I know that you can do all things, and that no purpose of yours can be restrained." },
  { id: "psalm-1-1", reference: "PSALM 1:1", text: "Blessed is the man who doesn't walk in the counsel of the wicked, nor stand in the way of sinners." },
  { id: "psalm-1-2", reference: "PSALM 1:2", text: "His delight is in Yahweh's law. On his law he meditates day and night." },
  { id: "psalm-16-8", reference: "PSALM 16:8", text: "I have set Yahweh always before me. Because he is at my right hand, I shall not be moved." },
  { id: "psalm-19-1", reference: "PSALM 19:1", text: "The heavens declare the glory of God. The expanse shows his handiwork." },
  { id: "psalm-23-1", reference: "PSALM 23:1", text: "Yahweh is my shepherd. I shall lack nothing." },
  { id: "psalm-23-4", reference: "PSALM 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me." },
  { id: "psalm-27-1", reference: "PSALM 27:1", text: "Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?" },
  { id: "psalm-34-8", reference: "PSALM 34:8", text: "Oh taste and see that Yahweh is good. Blessed is the man who takes refuge in him." },
  { id: "psalm-37-4", reference: "PSALM 37:4", text: "Also delight yourself in Yahweh, and he will give you the desires of your heart." },
  { id: "psalm-46-1", reference: "PSALM 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { id: "psalm-46-10", reference: "PSALM 46:10", text: "Be still, and know that I am God. I will be exalted among the nations. I will be exalted in the earth." },
  { id: "psalm-51-10", reference: "PSALM 51:10", text: "Create in me a clean heart, O God. Renew a right spirit within me." },
  { id: "psalm-56-3", reference: "PSALM 56:3", text: "When I am afraid, I will put my trust in you." },
  { id: "psalm-90-2", reference: "PSALM 90:2", text: "Before the mountains were born, before you had formed the earth and the world, even from everlasting to everlasting, you are God." },
  { id: "psalm-100-4", reference: "PSALM 100:4", text: "Enter into his gates with thanksgiving, and into his courts with praise. Give thanks to him, and bless his name." },
  { id: "psalm-103-2", reference: "PSALM 103:2", text: "Bless Yahweh, my soul, and don't forget all his benefits." },
  { id: "psalm-119-105", reference: "PSALM 119:105", text: "Your word is a lamp to my feet, and a light for my path." },
  { id: "psalm-121-2", reference: "PSALM 121:2", text: "My help comes from Yahweh, who made heaven and earth." },
  { id: "psalm-127-1", reference: "PSALM 127:1", text: "Unless Yahweh builds the house, they labor in vain who build it." },
  { id: "psalm-139-14", reference: "PSALM 139:14", text: "I will give thanks to you, for I am fearfully and wonderfully made." },
  { id: "psalm-145-18", reference: "PSALM 145:18", text: "Yahweh is near to all those who call on him, to all who call on him in truth." },
  { id: "proverbs-1-7", reference: "PROVERBS 1:7", text: "The fear of Yahweh is the beginning of knowledge. Fools despise wisdom and instruction." },
  { id: "proverbs-3-5", reference: "PROVERBS 3:5", text: "Trust in Yahweh with all your heart, and don't lean on your own understanding." },
  { id: "proverbs-3-6", reference: "PROVERBS 3:6", text: "In all your ways acknowledge him, and he will make your paths straight." },
  { id: "proverbs-9-10", reference: "PROVERBS 9:10", text: "The fear of Yahweh is the beginning of wisdom. The knowledge of the Holy One is understanding." },
  { id: "proverbs-16-3", reference: "PROVERBS 16:3", text: "Commit your deeds to Yahweh, and your plans shall succeed." },
  { id: "proverbs-18-10", reference: "PROVERBS 18:10", text: "Yahweh's name is a strong tower: the righteous run to him, and are safe." },
  { id: "proverbs-27-17", reference: "PROVERBS 27:17", text: "Iron sharpens iron; so a man sharpens his friend's countenance." },
  { id: "ecclesiastes-3-1", reference: "ECCLESIASTES 3:1", text: "For everything there is a season, and a time for every purpose under heaven." },
  { id: "isaiah-6-3", reference: "ISAIAH 6:3", text: "Holy, holy, holy, is Yahweh of Armies! The whole earth is full of his glory!" },
  { id: "isaiah-26-3", reference: "ISAIAH 26:3", text: "You will keep whoever's mind is steadfast in perfect peace, because he trusts in you." },
  { id: "isaiah-40-31", reference: "ISAIAH 40:31", text: "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles." },
  { id: "isaiah-41-10", reference: "ISAIAH 41:10", text: "Don't be afraid, for I am with you. Don't be dismayed, for I am your God." },
  { id: "isaiah-43-2", reference: "ISAIAH 43:2", text: "When you pass through the waters, I will be with you; and through the rivers, they will not overflow you." },
  { id: "isaiah-55-8", reference: "ISAIAH 55:8", text: "For my thoughts are not your thoughts, and your ways are not my ways, says Yahweh." },
  { id: "jeremiah-17-7", reference: "JEREMIAH 17:7", text: "Blessed is the man who trusts in Yahweh, and whose confidence is in Yahweh." },
  { id: "jeremiah-29-11", reference: "JEREMIAH 29:11", text: "For I know the thoughts that I think toward you, says Yahweh, thoughts of peace, and not of evil, to give you hope and a future." },
  { id: "lamentations-3-22", reference: "LAMENTATIONS 3:22", text: "It is because of Yahweh's loving kindnesses that we are not consumed, because his compassion doesn't fail." },
  { id: "ezekiel-36-26", reference: "EZEKIEL 36:26", text: "I will also give you a new heart, and I will put a new spirit within you." },
  { id: "daniel-2-20", reference: "DANIEL 2:20", text: "Daniel answered, Blessed be the name of God forever and ever; for wisdom and might are his." },
  { id: "micah-6-8", reference: "MICAH 6:8", text: "He has shown you, man, what is good. What does Yahweh require of you, but to act justly, to love mercy, and to walk humbly with your God?" },

  // NEW TESTAMENT
  { id: "matthew-5-16", reference: "MATTHEW 5:16", text: "Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven." },
  { id: "matthew-6-33", reference: "MATTHEW 6:33", text: "But seek first God's Kingdom and his righteousness, and all these things will be given to you as well." },
  { id: "matthew-7-7", reference: "MATTHEW 7:7", text: "Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened to you." },
  { id: "matthew-11-28", reference: "MATTHEW 11:28", text: "Come to me, all you who labor and are heavily burdened, and I will give you rest." },
  { id: "matthew-22-37", reference: "MATTHEW 22:37", text: "You shall love the Lord your God with all your heart, with all your soul, and with all your mind." },
  { id: "matthew-28-19", reference: "MATTHEW 28:19", text: "Go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." },
  { id: "mark-1-17", reference: "MARK 1:17", text: "Jesus said to them, Come after me, and I will make you fishers for men." },
  { id: "mark-10-27", reference: "MARK 10:27", text: "Jesus, looking at them, said, With men it is impossible, but not with God, for all things are possible with God." },
  { id: "luke-6-31", reference: "LUKE 6:31", text: "As you would like people to do to you, do exactly so to them." },
  { id: "luke-19-10", reference: "LUKE 19:10", text: "For the Son of Man came to seek and to save that which was lost." },
  { id: "john-1-1", reference: "JOHN 1:1", text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
  { id: "john-1-14", reference: "JOHN 1:14", text: "The Word became flesh, and lived among us. We saw his glory, glory as of the only born Son of the Father, full of grace and truth." },
  { id: "john-3-16", reference: "JOHN 3:16", text: "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life." },
  { id: "john-8-12", reference: "JOHN 8:12", text: "Jesus spoke to them, saying, I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life." },
  { id: "john-10-11", reference: "JOHN 10:11", text: "I am the good shepherd. The good shepherd lays down his life for the sheep." },
  { id: "john-11-25", reference: "JOHN 11:25", text: "Jesus said to her, I am the resurrection and the life. He who believes in me will still live, even if he dies." },
  { id: "john-13-34", reference: "JOHN 13:34", text: "A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another." },
  { id: "john-14-6", reference: "JOHN 14:6", text: "Jesus said to him, I am the way, the truth, and the life. No one comes to the Father, except through me." },
  { id: "john-15-5", reference: "JOHN 15:5", text: "I am the vine. You are the branches. He who remains in me, and I in him, bears much fruit." },
  { id: "acts-1-8", reference: "ACTS 1:8", text: "You will receive power when the Holy Spirit has come upon you. You will be witnesses to me in Jerusalem and in all Judea and Samaria." },
  { id: "acts-4-12", reference: "ACTS 4:12", text: "There is salvation in no one else, for neither is there any other name under heaven, that is given among men, by which we must be saved." },
  { id: "acts-16-31", reference: "ACTS 16:31", text: "Believe in the Lord Jesus Christ, and you will be saved, you and your household." },
  { id: "romans-1-16", reference: "ROMANS 1:16", text: "For I am not ashamed of the Good News of Christ, for it is the power of God for salvation for everyone who believes." },
  { id: "romans-3-23", reference: "ROMANS 3:23", text: "For all have sinned, and fall short of the glory of God." },
  { id: "romans-5-8", reference: "ROMANS 5:8", text: "But God commends his own love toward us, in that while we were yet sinners, Christ died for us." },
  { id: "romans-6-23", reference: "ROMANS 6:23", text: "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord." },
  { id: "romans-8-1", reference: "ROMANS 8:1", text: "There is therefore now no condemnation to those who are in Christ Jesus." },
  { id: "romans-8-28", reference: "ROMANS 8:28", text: "We know that all things work together for good for those who love God, for those who are called according to his purpose." },
  { id: "romans-10-9", reference: "ROMANS 10:9", text: "If you will confess with your mouth that Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved." },
  { id: "romans-12-2", reference: "ROMANS 12:2", text: "Don't be conformed to this world, but be transformed by the renewing of your mind." },
  { id: "1-corinthians-10-31", reference: "1 CORINTHIANS 10:31", text: "Whether therefore you eat, or drink, or whatever you do, do all to the glory of God." },
  { id: "1-corinthians-13-4", reference: "1 CORINTHIANS 13:4", text: "Love is patient and is kind. Love doesn't envy. Love doesn't brag, is not proud." },
  { id: "1-corinthians-13-13", reference: "1 CORINTHIANS 13:13", text: "But now faith, hope, and love remain, these three. The greatest of these is love." },
  { id: "1-corinthians-15-3", reference: "1 CORINTHIANS 15:3", text: "For I delivered to you first of all that which I also received: that Christ died for our sins according to the Scriptures." },
  { id: "1-corinthians-15-4", reference: "1 CORINTHIANS 15:4", text: "He was buried, and he was raised on the third day according to the Scriptures." },
  { id: "2-corinthians-5-17", reference: "2 CORINTHIANS 5:17", text: "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new." },
  { id: "2-corinthians-9-7", reference: "2 CORINTHIANS 9:7", text: "Let each man give according as he has determined in his heart, not grudgingly or under compulsion, for God loves a cheerful giver." },
  { id: "galatians-2-20", reference: "GALATIANS 2:20", text: "I have been crucified with Christ, and it is no longer I that live, but Christ living in me." },
  { id: "galatians-5-22", reference: "GALATIANS 5:22", text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith." },
  { id: "galatians-6-9", reference: "GALATIANS 6:9", text: "Let us not be weary in doing good, for we will reap in due season, if we don't give up." },
  { id: "ephesians-2-8", reference: "EPHESIANS 2:8", text: "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God." },
  { id: "ephesians-2-10", reference: "EPHESIANS 2:10", text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared before that we would walk in them." },
  { id: "ephesians-4-32", reference: "EPHESIANS 4:32", text: "And be kind to one another, tenderhearted, forgiving each other, just as God also in Christ forgave you." },
  { id: "ephesians-6-10", reference: "EPHESIANS 6:10", text: "Finally, be strong in the Lord, and in the strength of his might." },
  { id: "philippians-1-6", reference: "PHILIPPIANS 1:6", text: "Being confident of this very thing, that he who began a good work in you will complete it until the day of Jesus Christ." },
  { id: "philippians-2-3", reference: "PHILIPPIANS 2:3", text: "Doing nothing through rivalry or through conceit, but in humility, each counting others better than himself." },
  { id: "philippians-4-4", reference: "PHILIPPIANS 4:4", text: "Rejoice in the Lord always! Again I will say, Rejoice!" },
  { id: "philippians-4-6", reference: "PHILIPPIANS 4:6", text: "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God." },
  { id: "philippians-4-8", reference: "PHILIPPIANS 4:8", text: "Whatever things are true, whatever things are honorable, whatever things are just, whatever things are pure, think about these things." },
  { id: "philippians-4-13", reference: "PHILIPPIANS 4:13", text: "I can do all things through Christ, who strengthens me." },
  { id: "colossians-3-2", reference: "COLOSSIANS 3:2", text: "Set your mind on the things that are above, not on the things that are on the earth." },
  { id: "colossians-3-17", reference: "COLOSSIANS 3:17", text: "Whatever you do, in word or in deed, do all in the name of the Lord Jesus, giving thanks to God the Father through him." },
  { id: "1-thessalonians-5-16", reference: "1 THESSALONIANS 5:16", text: "Rejoice always." },
  { id: "1-thessalonians-5-17", reference: "1 THESSALONIANS 5:17", text: "Pray without ceasing." },
  { id: "1-thessalonians-5-18", reference: "1 THESSALONIANS 5:18", text: "In everything give thanks, for this is the will of God in Christ Jesus toward you." },
  { id: "2-thessalonians-3-3", reference: "2 THESSALONIANS 3:3", text: "But the Lord is faithful, who will establish you, and guard you from the evil one." },
  { id: "1-timothy-4-12", reference: "1 TIMOTHY 4:12", text: "Let no one despise your youth, but be an example to those who believe, in word, in your way of life, in love, in spirit, in faith, and in purity." },
  { id: "2-timothy-3-16", reference: "2 TIMOTHY 3:16", text: "Every Scripture is God-breathed and profitable for teaching, for reproof, for correction, and for instruction in righteousness." },
  { id: "2-timothy-4-7", reference: "2 TIMOTHY 4:7", text: "I have fought the good fight. I have finished the course. I have kept the faith." },
  { id: "hebrews-4-12", reference: "HEBREWS 4:12", text: "For the word of God is living and active, and sharper than any two-edged sword." },
  { id: "hebrews-11-1", reference: "HEBREWS 11:1", text: "Now faith is assurance of things hoped for, proof of things not seen." },
  { id: "hebrews-12-1", reference: "HEBREWS 12:1", text: "Let us run with endurance the race that is set before us." },
  { id: "hebrews-13-8", reference: "HEBREWS 13:8", text: "Jesus Christ is the same yesterday, today, and forever." },
  { id: "james-1-5", reference: "JAMES 1:5", text: "But if any of you lacks wisdom, let him ask of God, who gives to all liberally and without reproach." },
  { id: "james-1-22", reference: "JAMES 1:22", text: "But be doers of the word, and not only hearers, deluding your own selves." },
  { id: "james-4-8", reference: "JAMES 4:8", text: "Draw near to God, and he will draw near to you." },
  { id: "1-peter-5-7", reference: "1 PETER 5:7", text: "Casting all your worries on him, because he cares for you." },
  { id: "2-peter-3-18", reference: "2 PETER 3:18", text: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ." },
  { id: "1-john-1-9", reference: "1 JOHN 1:9", text: "If we confess our sins, he is faithful and righteous to forgive us the sins, and to cleanse us from all unrighteousness." },
  { id: "1-john-4-19", reference: "1 JOHN 4:19", text: "We love him, because he first loved us." },
  { id: "1-john-5-3", reference: "1 JOHN 5:3", text: "For this is the love of God, that we keep his commandments. His commandments are not grievous." },
  { id: "jude-1-24", reference: "JUDE 1:24", text: "Now to him who is able to keep you from stumbling, and to present you faultless before the presence of his glory in great joy." },
  { id: "revelation-1-8", reference: "REVELATION 1:8", text: "I am the Alpha and the Omega, says the Lord God, who is and who was and who is to come, the Almighty." },
  { id: "revelation-21-4", reference: "REVELATION 21:4", text: "He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain." }
];

export function choosePassage(
  averageWpm: number,
  usedPassageIds: string[]
): BiblePassage {
  const available = PASSAGES.filter(
    (passage) => !usedPassageIds.includes(passage.id)
  );

  const pool = available.length > 0 ? available : PASSAGES;
  const targetWords = Math.max(1, (averageWpm * 25) / 60);

  const ranked = pool
    .map((passage) => ({
      passage,
      difference: Math.abs(
        passage.text.trim().split(/\s+/).length - targetWords
      ),
    }))
    .sort((a, b) => a.difference - b.difference);

  const finalists = ranked.slice(0, Math.min(5, ranked.length));
  const chosen = finalists[Math.floor(Math.random() * finalists.length)];

  return chosen.passage;
}
