const Schemy = require('../index');

describe('Schemy plugins', function() {
	it('Should receive a plugin and add it to Schemy', function() {
		const plugin = {};

		Schemy.extend(plugin);

		expect(Schemy.plugins).toBeDefined();
		expect(Schemy.plugins.length).toBe(1);
	});

	it('Should take an array of plugins and add it to Schemy', function() {
		Schemy.extend([{}, {}]);

		expect(Schemy.plugins.length).toBe(3);
	});

	it('Should trigger plugin event callback', function() {
		const plugin = {
			beforeParse() {
				return true;
			}
		};

		const beforeParse = spyOn(plugin, 'beforeParse');

		Schemy.plugins = [];
		Schemy.extend(plugin);

		new Schemy({
			title: String
		});

		expect(Schemy.plugins).toBeDefined();
		expect(Schemy.plugins.length).toBe(1);
		expect(beforeParse).toHaveBeenCalled();
	});
});