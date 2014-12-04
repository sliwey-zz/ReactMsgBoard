var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Comment = React.createClass({displayName: 'Comment',
	render: function() {
		return (
			React.createElement("div", {className: "comment"}, 
				React.createElement("div", {className: "comment-body"}, 
					this.props.children
				), 
				React.createElement("p", {className: "comment-origin"}, 
					React.createElement("span", {className: "comment-name"}, this.props.author), " posted at ", this.props.dtime
				)
			)
		);
	}
});

var CommentList = React.createClass({displayName: 'CommentList',
	render: function() {
		var commentNodes = this.props.data.map(function(comment, i) {
			return (
				React.createElement(Comment, {key: comment._id, author: comment.author, dtime: comment.dtime}, 
					comment.msg
				)
			);
		});
		
		return (
			React.createElement("div", {className: "comment-list"}, 
				React.createElement(ReactCSSTransitionGroup, {transitionName: "comment", transitionLeave: false}, 
		          commentNodes
		        )
			)
		);
	}
});

var CommentForm = React.createClass({displayName: 'CommentForm',
	handleSubmit: function(e) {
		e.preventDefault();
		var author = this.refs.author.getDOMNode().value.trim();
		var msg = this.refs.msg.getDOMNode().value.trim();
		if (!author || !msg) {
			return;
		}
		this.props.onCommentSubmit({author: author, msg: msg});
		this.refs.author.getDOMNode().value = '';
		this.refs.msg.getDOMNode().value = '';
		return;
	},
	render: function() {
		return (
			React.createElement("div", {className: "comment-form", onSubmit: this.handleSubmit}, 
				React.createElement("form", null, 
					React.createElement("p", null, React.createElement("input", {type: "text", placeholder: "Your name...", ref: "author"})), 
					React.createElement("p", null, React.createElement("textarea", {placeholder: "Say something...", ref: "msg"})), 
					React.createElement("p", null, React.createElement("input", {type: "submit", value: "submit"}))
				)	
			)
		);
	}
});

var CommentBox = React.createClass({displayName: 'CommentBox',
	page: 1,
	flag: true,
	load: function() {
		var promise,
			that = this;

		promise =  $.ajax({
			url: "/list",
			type: "post",
			dataType: "json",
			data: {page: this.page}
		});

		promise.done(function(data) {
			if (data) {
				that.setState({data: data});
			}
		});

		promise.fail(function(data) {
			console.log(data);
		})
		
	},
	handleCommentSubmit: function(comment) {
		$.ajax({
			url: "/save",
			type: "post",
			dataType: "json",
			data: comment,
			success: function(data) {
				if (data) {
					var comments = this.state.data,
						newComments = [data[0]].concat(comments);
					this.setState({data: newComments});
				}
			}.bind(this),
			error: function(data) {
				console.log(data);
			}
		});
	},
	loadMore: function() {
		var promise,
			that = this;

		that.page++;

		promise = $.ajax({
			url: "/list",
			type: "post",
			dataType: "json",
			data: {page: that.page},
		});

		promise.done(function(data) {
			if (data && data.length > 0) {
				var comments = that.state.data,
					newComments = comments.concat(data);

				that.setState({data: newComments});
				that.flag = true;
			} else {
				that.flag = false;
			}
		});

		promise.fail(function(data) {
			console.log(data);
		});
	},
	handleScroll: function() {
		var top = $(window).scrollTop(),
			docHeight = $(document).height(),
			winHeight = $(window).height();

		if (this.flag && docHeight - winHeight - top < 30) {
			this.flag = this.loadMore();
		}
	},
	getInitialState: function() {
		return {
			data: []
		};
	},
	componentDidMount: function() {
		this.load();
		window.addEventListener('scroll', this.handleScroll);
	},
	render: function() {
		return (
			React.createElement("div", {className: "comment-box"}, 
				React.createElement(CommentForm, {onCommentSubmit: this.handleCommentSubmit}), 
				React.createElement(CommentList, {data: this.state.data})
			)
		);
	}
});

React.render(
  React.createElement(CommentBox, null),
  document.getElementById("commentWrap")
);