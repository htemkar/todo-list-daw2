iris.resource(function(self) {

	var todos = {},
			currentFilter = "all";

	self.reset = function() {
		todos = {};
		currentFilter = "all";
	};

	self.init = function(callback) {
		console.log("Reading todos from server... ");
		self.reset();
		return self.get("todos").done(function(data) {
			console.log("Todos retrieved");
			for (f = 0, F = data.todos.length; f < F; f++) {
				todo = data.todos[f];
				todos[todo._id] = todo;
			}
			callback(todos);
		});
	};


	self.add = function(text, callback) {
		console.log("Adding a todo");
		return self.post("todo", {text: text}).done(function(data) {
			console.log("Todo retrieved");
			var todo = data.todo;
			todos[todo._id] = todo;
			callback(todo);
		});
	};

	self.getTodo = function(id) {
		var todo = todos[id];
		todo.visible = currentFilter === "all" ||
				(todo.completed && currentFilter === "completed") ||
				(!todo.completed && currentFilter === "active");
		return $.extend({}, todo);
	};

	self.remove = function(id, callback) {
		console.log("Deleting a todo");
		return self.del("todo/" + id).done(function(data) {
			console.log("Todo deleted");
			delete todos[id];
			callback(data);
		});
		delete todos[todos[id]];
	};

	self.toggle = function(id, callback) {
		var todo = todos[id];
		todo.completed = !todo.completed;
		console.log("(un)checking a todo");
		return self.put("todo/" + id + "/check/" + todo.completed).done(function(data) {
			console.log("Todo (un)checked");
			todos[id] =  data.todo;
			callback(todo);
		});
	};

	self.removeCompleted = function(callback) {
		console.log("Removing completed");
		return self.del("todos/checked").done(function(data) {
			console.log("Completed Todos deleted");
			self.init(callback);
		});
	};

	self.checkAll = function(completed, callback) {
		console.log("(un)checking all todos");
		return self.put("todos/check/" + completed).done(function(data) {
			console.log("All todos (un)checked");
			self.init(callback);
		});
	};

	self.edit = function(id, text, callback) {
		var todo = todos[id];
		console.log("Modifing a todo");
		return self.put("todo/" + id, {text: text}).done(function(data) {
			console.log("Todo modified");
			todos[id] =  data.todo;
			callback(todo);
		});
	};

	self.setFilter = function(filter) {
		console.log("Set filter = " + filter);
		currentFilter = filter;
	};

	self.count = function() {
		var remaining = 0;
		
		var total = 0;
		
		for (var id in todos) {
			total++;
			if (!todos[id].completed) {
				remaining++;
			}
		}
		return {remaining: remaining, total: total, completed: total - remaining};
	};


}, iris.path.resource.todo);