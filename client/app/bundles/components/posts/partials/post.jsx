import React from 'react';
import Comments from '../../comments/comments';
import * as app_constants from 'constants/app_constants';
import * as post_constants from '../post_constants';
import * as like_constants from '../../likes/like_constants';
import * as user_constants from '../../users/user_constants';

export default class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      show_comment: false
    }
  }

  render() {
    let user_url = app_constants.APP_URL + user_constants.USERS_PATH +
      this.props.post.user.id;
    return (
      <div className='post'>
        <div className='post-detail'>
          <p className='post-header'>
            <a href={user_url}
              className='username'>{this.props.post.user.username}</a>
            {this.renderActions()}
          </p>
          <p>{this.props.post.content}</p>
          {this.renderUserActions()}
        </div>
        {this.renderComments()}
      </div>
    );
  }

  renderActions() {
    let user = JSON.parse(sessionStorage.current_user);
    if (user && user.id == this.props.post.user_id) {
      return (
        <span className='pull-right'>
          <a href='#' onClick={this.editPost.bind(this)}>
            {I18n.t('buttons.edit')}
          </a>
          &nbsp;
          <a href='#' onClick={this.deletePost.bind(this)}>
            {I18n.t('buttons.delete')}
          </a>
        </span>
      );
    }
    return null;
  }

  renderUserActions() {
    let like_btn = <a href='#'>{I18n.t('buttons.like')}</a>;
    let user = JSON.parse(sessionStorage.current_user);
    if (user) {
      let index = this.props.post.likes
        .findIndex(like => like.user_id == user.id);
      if (index >= 0) {
        like_btn = (
          <a href='#'
            onClick={this.unLike.bind(this, this.props.post.likes[index])}>
            {I18n.t('buttons.unlike')}
          </a>
        );
      } else {
        like_btn = <a href='#' onClick={this.like.bind(this)}>
          {I18n.t('buttons.like')}
        </a>;
      }
    }

    return (
      <p className='actions'>
        {like_btn} &nbsp;
        <span className='label label-info'>
          {this.props.post.likes.length}
        </span>
        &nbsp;
        <a href='#' onClick={this.showComment.bind(this)}>
          {I18n.t('buttons.comment')}
        </a> &nbsp;
        <span className='label label-info'>
          {this.props.post.comments.length}
        </span>
      </p>
    );
  }

  renderComments() {
    if (this.state.show_comment) {
      return (
        <Comments post_id={this.props.post.id}
          comments={this.props.post.comments}
          handleAfterUpdatedComment={this.props.handleAfterUpdatedComment}
          handleAfterCreatedComment={this.props.handleAfterCreatedComment}
          handleAfterDeletedComment={this.props.handleAfterDeletedComment}
          handleAfterLikedComment={this.props.handleAfterLikedComment}
          handleAfterUnlikedComment={this.props.handleAfterUnlikedComment}
        />
      );
    }
    return null;
  }

  editPost(event) {
    event.preventDefault();
    this.props.editPost(this.props.post);
  }

  deletePost(event) {
    event.preventDefault();
    if (confirm(I18n.t('messages.confirm'))) {
      let url = app_constants.APP_URL + post_constants.POSTS_PATH +
        this.props.post.id;
      $.ajax({
        url: url,
        type: 'DELETE',
        dataType: 'json',
        data: {
          authenticity_token: ReactOnRails.authenticityToken()
        },
        success: (data) => {
          this.props.handleAfterDeletedPost(this.props.post);
        },
        error: (data) => {
          console.log(data);
        }
      });
    }
  }

  showComment(event) {
    event.preventDefault();
    this.setState({show_comment: !this.state.show_comment});
  }

  like(event) {
    event.preventDefault();
    let url = app_constants.APP_URL + like_constants.LIKES_PATH;
    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: {
        like: {
          objectable_id: this.props.post.id,
          objectable_type: 'Post'
        },
        authenticity_token: ReactOnRails.authenticityToken()
      },
      success: (data) => {
        this.props.handleAfterLikedPost(data.like);
      },
      error: (data) => {
        console.log(data);
      }
    });
  }

  unLike(like, event) {
    event.preventDefault();
    let url = app_constants.APP_URL + like_constants.LIKES_PATH + '/' + like.id;
    $.ajax({
      url: url,
      type: 'DELETE',
      dataType: 'json',
      data: {
        authenticity_token: ReactOnRails.authenticityToken()
      },
      success: (data) => {
        this.props.handleAfterUnlikedPost(data.like);
      },
      error: (data) => {
        console.log(data);
      }
    });
  }
}
