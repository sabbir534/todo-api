var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());
app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//get /todos?completed=true
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};
	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todo) {
		if (!!todo) {
			res.json(todo);
		} else {
			res.status(500).send();
		}
	}, function(e) {
		res.status(404).send();
	});
	/*var queryParams = req.query;
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}
	res.json(filteredTodos);*/

});

// get /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).json();
	});
	/*var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	
	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}*/

});

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	})


	/*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(404).send();
	}
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	res.json(body);*/
});

//Delete /todos/:id

app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowDeleted) {
		if (rowDeleted === 0) {
			res.status(404).json({
				error: 'No Todo Found with that id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
	/*db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			todo.destroy()
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).json();
	});*/

});

// Update /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributs = {};

	if (body.hasOwnProperty('completed')) {
		attributs.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributs.description = body.description.trim();
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributs).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});

});

//POST:USERS - /users
app.post('/users', function(req, res){
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user){
		res.json(user.toJSON());
	}, function(e){
		res.status(400).json(e);
	})
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Listening Port ' + PORT);
	})
});