const rand = (mn, mx) => Math.floor(Math.random() * (mx - mn) + mn);

const words = [
	'modern',
	'easiest',
	'fastest',
	'lightest',
	'best',
	'beautiful',
	'8 <span style="font-size: 70%">KB</span>',
	'extensible',
	'awesome'
];

setInterval(() => {
	let nextWord; 
	let currentWord = document.querySelector('.word').innerText;

	do { nextWord = words[rand(0, words.length)]; }
	while (nextWord === currentWord);

	document.querySelector('.word').innerHTML = nextWord;
}, 3000);