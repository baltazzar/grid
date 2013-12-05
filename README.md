GRID
====

Grid for Backbone

Example:

	this.grid = new Grid({
		collection: this.collection,
		tableClasses: ['table', 'table-condensed', 'table-bordered', 'table-striped', 'table-hover'],
		tableHeaders: {
			nameOfAttr1 : 'Nice Title 1',
			nameOfAttr2 : 'Nice Title 2',
			nameOfAttr3 : 'Nice Title 3',
			'nameOfAttr4.hisSon.oneMore': 'Tree between apostrofes'
		},
		tableSorter: ['', 'dateBR', '', '']
	});

	this.$('#grid').html(this.grid.render().el);

	this.grid.setLastCol({
		width: '65px',
		elements: [
			'<button class="btn" id="#{id}">Detail</button>'
		]
	});