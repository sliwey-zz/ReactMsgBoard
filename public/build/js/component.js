var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Comment = React.createClass({
    render: function() {
        return (
            <div className="comment">
                <div className="comment-body">
                    {this.props.children}
                </div>
                <p className="comment-origin">
                    <span className="comment-name">{this.props.author}</span> posted at {this.props.dtime}
                </p>
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function() {
        var commentNodes = this.props.data.map(function(comment, i) {
            return (
                <Comment key={comment._id} author={comment.author} dtime={comment.dtime}>
                    {comment.msg}
                </Comment>
            );
        });
        
        return (
            <div className="comment-list">
                <ReactCSSTransitionGroup transitionName="comment" transitionLeave={false}>
                  {commentNodes}
                </ReactCSSTransitionGroup>
            </div>
        );
    }
});

var CommentForm = React.createClass({
    author: localStorage.getItem("author"),
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.refs.author.getDOMNode().value.trim();
        var msg = this.refs.msg.getDOMNode().value.trim();
        if (!author || !msg) {
            return;
        }
        
        this.author = author;
        localStorage.setItem("author", author);
        this.props.onCommentSubmit({author: author, msg: msg});
        this.refs.author.getDOMNode().value = '';
        this.refs.msg.getDOMNode().value = '';
        return;
    },
    render: function() {
        return (
            <div className="comment-form" onSubmit={this.handleSubmit}>
                <form >
                    <p><input type="text" placeholder="Your name..." ref="author" defaultValue={this.author} /></p>
                    <p><textarea placeholder="Say something..." ref="msg"></textarea></p>
                    <p><input type="submit" value="submit" /></p>
                </form> 
            </div>
        );
    }
});

var CommentBox = React.createClass({
    page: 1,
    flag: true,
    load: function() {
        var promise,
            that = this;

        promise =  $.ajax({
            url: "/list?page=" + that.page,
            type: "get",
            dataType: "json"
        });

        promise.done(function(data) {
            if (data) {
                that.setState({data: data});
            }
        });

        promise.fail(function(data) {
            console.log(data);
        });
    },
    handleCommentSubmit: function(comment) {
        var promise,
            that = this;

        promise = $.ajax({
            url: "/save",
            type: "post",
            dataType: "json",
            data: comment,
            beforeSend: function() {
                that.setState({addLoading: "loading show"});
            }
        });

        promise.done(function(data) {
            if (data) {
                var comments = that.state.data,
                    newComments = [data[0]].concat(comments);
                that.setState({
                    data: newComments,
                    addLoading: "loading"
                });
            }
        });

        promise.fail(function(data) {
            console.log(data);
        });
    },
    loadMore: function() {
        var promise,
            that = this;

        that.page++;

        promise = $.ajax({
            url: "/list?page=" + that.page,
            type: "get",
            dataType: "json",
            beforeSend: function() {
                that.setState({moreLoading: "loading show"});
            }
        });

        promise.done(function(data) {
            if (data && data.length > 0) {
                var comments = that.state.data,
                    newComments = comments.concat(data);

                that.setState({
                    data: newComments,
                    moreLoading: "loading"
                });
                that.flag = true;
            } else {
                that.setState({
                    noMore: "no-more show",
                    moreLoading: "loading"
                });
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
            data: [],
            noMore: "no-more",
            addLoading: "loading",
            moreLoading: "loading"
        };
    },
    componentDidMount: function() {
        this.load();
        window.addEventListener('scroll', this.handleScroll);
    },
    render: function() {
        return (
            <div className="comment-box">
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
                <div className={this.state.addLoading}><p></p></div>
                <CommentList data={this.state.data} />
                <div className={this.state.moreLoading}><p></p></div>
                <p className={this.state.noMore}>已经到底啦~</p>
            </div>
        );
    }
});

React.render(
  <CommentBox />,
  document.getElementById("commentWrap")
);