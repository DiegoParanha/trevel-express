const Post = require('../models/post');

module.exports = {
    create, 
    delete: deleteComment,
    edit,
    update,
};

function edit(req, res) {
    Post.findOne({'comments._id': req.params.id}, function(err, post) {
        const comment = post.comments.id(req.params.id);
        res.render('comments/edit', {comment});
    });
}

function update(req, res) {
    Post.findOne({'comments._id': req.params.id}, function(err, post) {
      const commentSubdoc = post.comments.id(req.params.id);
      if (!commentSubdoc.user.equals(req.user._id)) return res.redirect(`/posts/${post._id}`);
      commentSubdoc.content = req.body.text;
      post.save(function(err) {
        res.redirect(`/posts/${post._id}`);
      });
    });
  }


function deleteComment(req, res, next) {
    Post.findOne({
        'comments._id': req.params.id,
        'comments.user': req.user._id
    }).then(function(post) {
        if(!post) return res.redirect('/posts');
        post.comments.remove(req.params.id);
        post.save().then(function() {
            res.redirect(`/posts/${post._id}`);
        }).catch(function(err) {
            return next(err);
        })
    });
};

function create(req, res) {
    Post.findById(req.params.id, function(err, post) {
        req.body.user = req.user._id;
        req.body.userName = req.user.name;
        req.body.userAvatar = req.user.avatar;

        post.comments.push(req.body);
        post.save(function(err) {
            res.redirect(`/posts/${post._id}`);
        });
    });
};