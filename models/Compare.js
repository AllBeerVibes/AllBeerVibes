//Compare constructor for session storage, not mongoose
//Will add codes for logged-in users using mongoose
module.exports = function Compare(oldCompare) {
	if (oldCompare.user) {
		this.items = oldCompare.compare.items;
		this.totalQty = oldCompare.compare.totalQty;
	}
	else {
		//Assign the values of the old compare list
		this.items = oldCompare.items || {};
		this.totalQty = oldCompare.totalQty || 0;
	}

	//Add new beer for comparison
	this.addBeerCompare = function(item, id) {
		var storedItem = this.items[id];

		//Prevent adding already existing beer in comparison list
		if (!storedItem) {
			storedItem = this.items[id] = { item: item };
			this.totalQty++;
		}
		//maybe add else statement here for letting users know that they have selected same beer
	};

	//Delete any beer from comparison list
	this.deleteBeerCompare = function(id) {
		if (this.totalQty > 0) {
			this.totalQty--;
			delete this.items[id];
		}
	};

	//Output comparison list as an array
	this.generateArray = function() {
		var arr = [];
		for (var id in this.items) {
			arr.push(this.items[id]);
		}
		return arr;
	};
};
