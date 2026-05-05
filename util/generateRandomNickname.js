

const jungleAdjectives = [
    'Wild', 'Lush', 'Mysterious', 'Vibrant', 'Shady', 'Sunny', 'Noisy', 'Silent',
    'Swift', 'Clever', 'Brave', 'Sneaky', 'Curious', 'Spotted', 'Striped', 'Green',
    'Tangled', 'Hidden', 'Majestic', 'Ancient', 'Giant', 'Tiny', 'Colorful', 'Agile',
    'Bold', 'Fierce', 'Gentle', 'Playful', 'Quick', 'Shadowy'
];

const jungleNouns = [
    'Jaguar', 'Monkey', 'Parrot', 'Vine', 'Panther', 'Frog', 'Toucan', 'Iguana',
    'Anaconda', 'Orchid', 'Butterfly', 'Treefrog', 'Caiman', 'Sloth', 'Tapir', 'Macaw',
    'Leaf', 'Creeper', 'Bamboo', 'Cobra', 'Marmoset', 'Capybara', 'Tamarin', 'Cicada',
    'Beetle', 'Liana', 'Fern', 'Moss', 'Caterpillar', 'Sunbird'
];



/**
 * Generates a random jungle-themed nickname.
 * @returns {string} A random nickname like "WildJaguar" or "LushVine".
 */
const generateRandomNickname = () => {
    const adj = jungleAdjectives[Math.floor(Math.random() * jungleAdjectives.length)];
    const noun = jungleNouns[Math.floor(Math.random() * jungleNouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};

export default generateRandomNickname;