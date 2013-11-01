({
	name: 'grid',
	exclude: ['backbone', 'jquery', 'underscore', 'tablesorter'],
	out: '../dist/grid.js',
	mainConfigFile: '../js/main.js',
	optimize: 'none',
	wrap: {
		startFile: "version.frag"
	}
})